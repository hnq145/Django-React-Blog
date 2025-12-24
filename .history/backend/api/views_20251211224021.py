from django.shortcuts import render
from django.http import JsonResponse
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.db.models import Sum

from rest_framework import status
from rest_framework.decorators import api_view, APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken

from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from datetime import datetime

from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import AI_Summary 
from .ai_services import AIServiceClient 
from .models import Post 

# Others
import json
import random
import logging
from django.views import View

logger = logging.getLogger(__name__)
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

# Custom Imports
from api import serializer as api_serializer
from api import models as api_models

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = api_serializer.MyTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = api_models.User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = api_serializer.RegisterSerializer

class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = api_serializer.ProfileSerializer

    def get_object(self):
        user = self.request.user
        profile = api_models.Profile.objects.get(user=user)
        return profile
    
class CategoryListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.CategorySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return api_models.Category.objects.all()
    
class PostCategoryListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.PostSerializer
    permission_classes = [AllowAny] 

    def get_queryset(self):
        category_slug = self.kwargs['category_slug']
        category = api_models.Category.objects.get(slug=category_slug)
        return api_models.Post.objects.filter(category=category, status='Active')

class PostListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.PostSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return api_models.Post.objects.filter(status='Active')
    
class PostDetailAPIView(generics.RetrieveAPIView):
    serializer_class = api_serializer.PostSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        slug = self.kwargs['slug']
        post = api_models.Post.objects.get(slug=slug, status='Active')
        post.view += 1
        post.save()
        return post
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        comment_sort = self.request.query_params.get('comment_sort', 'newest')
        context['comment_sort'] = comment_sort
        return context
    
class LikePostAPIView(APIView):
    permission_classes = [IsAuthenticated]      

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'post_id': openapi.Schema(type=openapi.TYPE_STRING),
            },
        ),
    )

    def post(self, request):
        post_id = request.data['post_id']

        user = request.user
        post = api_models.Post.objects.get(id=post_id)

        if user in post.likes.all():
            post.likes.remove(user)
            return Response({'message': 'Post Disliked'}, status=status.HTTP_200_OK)
        else:
            post.likes.add(user)
            
            api_models.Notification.objects.create(
                user=post.user,
                post=post,
                type="Like"
            )
            return Response({'message': 'Post Liked'}, status=status.HTTP_201_CREATED)

class PostCommentAPIView(APIView):
    permission_classes = [IsAuthenticated] 

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'post_id': openapi.Schema(type=openapi.TYPE_INTEGER),
                'comment': openapi.Schema(type=openapi.TYPE_STRING),
            },
        ),
    )
        
    def post(self, request):
        post_id = request.data['post_id']
        comment_text = request.data['comment']

        post = api_models.Post.objects.get(id=post_id)
        user = request.user

        new_comment = api_models.Comment.objects.create(
            post=post,
            name=user.username,
            email=user.email,
            comment=comment_text
        )

        api_models.Notification.objects.create(
                user=post.user,
                post=post,
                type="Comment"
        )
        
        
        try:
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync

            
            serializer = api_serializer.CommentSerializer(new_comment)
            
            
            channel_layer = get_channel_layer()
            group_name = f'comments_{post_id}'

            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    'type': 'send_comment',
                    'comment': serializer.data
                }
            )
        except Exception as e:
            print(f"Error sending comment via WebSocket: {e}")
            
            pass

        return Response({'message': 'Comment sent'}, status=status.HTTP_201_CREATED)
    
class BookmarkPostAPIView(APIView):
    permission_classes = [IsAuthenticated] 

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'post_id': openapi.Schema(type=openapi.TYPE_STRING),
            },
        ),
    )

    def post(self, request):
        post_id = request.data['post_id']

        user = request.user
        post = api_models.Post.objects.get(id=post_id)
        
        bookmark = api_models.Bookmark.objects.filter(user=user, post=post).first()

        if bookmark:
            bookmark.delete()
            return Response({'message': 'Post Un-bookmarked'}, status=status.HTTP_200_OK)
        else:
            api_models.Bookmark.objects.create(user=user, post=post)
            
            api_models.Notification.objects.create(
                user=post.user,
                post=post,
                type="Bookmark"
            )
            return Response({'message': 'Post Bookmarked'}, status=status.HTTP_201_CREATED)
        
class DashboardStats(generics.ListAPIView):
    serializer_class = api_serializer.AuthorSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        views = api_models.Post.objects.filter(user=user).aggregate(view=Sum("view"))['view']
        posts = api_models.Post.objects.filter(user=user).count()
        likes = api_models.Post.objects.filter(user=user).aggregate(total_likes=Sum("likes"))['total_likes']
        bookmarks = api_models.Bookmark.objects.filter(user=user).count()

        return [{
            "views": views,
            "posts": posts,
            "likes": likes,
            "bookmarks": bookmarks,
        }]
    
    def list(self, request, *args, **kwargs):
        querset = self.get_queryset()
        serializer = self.get_serializer(querset, many=True)
        return Response(serializer.data)
    
class DashboardPostLists(generics.ListAPIView):
    serializer_class = api_serializer.PostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return api_models.Post.objects.filter(user=user).order_by('-id')
    
class DashboardCommentLists(generics.ListAPIView):
    serializer_class = api_serializer.CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return api_models.Comment.objects.filter(post__user=user)
    
class DashboardNotificationList(generics.ListAPIView):
    serializer_class = api_serializer.NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return api_models.Notification.objects.filter(user=user, seen=False).order_by('-id')
    
class DashboardMarkNotificationAsSeen(generics.UpdateAPIView):
    serializer_class = api_serializer.NotificationSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        noti_id = request.data.get('noti_id')
        try:
            noti = api_models.Notification.objects.get(id=noti_id, user=request.user)
        except api_models.Notification.DoesNotExist:
            return Response({'message': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)

        noti.seen = True
        noti.save()
        return Response({'message': 'Notification marked as seen'}, status=status.HTTP_200_OK)
    
class DashboardReplyCommentAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        comment_id = request.data['comment_id']
        reply = request.data['reply']

        comment = api_models.Comment.objects.get(id=comment_id)
        if comment.post.user != request.user:
            return Response({'message': 'You are not authorized to reply to this comment'}, status=status.HTTP_403_FORBIDDEN)

        comment.reply = reply
        comment.save()

        return Response({'message': 'Comment response sent'}, status=status.HTTP_201_CREATED)
    
class DashboardPostCreateAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.PostSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        print(request.data)

        title = request.data.get('title')
        image = request.data.get('image')
        description = request.data.get('description')
        tags = request.data.get('tags')
        category_id = request.data.get('category')
        post_status = request.data.get('post_status')

        try:
            user = request.user
            category = api_models.Category.objects.get(id=category_id)

            api_models.Post.objects.create(
                user=user,
                title=title,
                image=image,
                description=description,
                tags=tags,
                category=category,
                status=post_status
            )

            return Response({'message': 'Post created successfully'}, status=status.HTTP_201_CREATED)
        except api_models.Category.DoesNotExist:
            return Response({'error': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
class DashboardPostEditAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = api_serializer.PostSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        post_id = self.kwargs['post_id']
        user = self.request.user

        return api_models.Post.objects.get(id=post_id, user=user)
    
    def update(self, request, *args, **kwargs):
        post_instance = self.get_object()

        title = request.data.get('title')
        image = request.data.get('image')
        description = request.data.get('description')
        tags = request.data.get('tags')
        category_id = request.data.get('category')
        post_status = request.data.get('post_status')

        category = api_models.Category.objects.get(id=category_id)

        post_instance.title = title
        if image != "undefined":
            post_instance.image = image
        post_instance.description = description
        post_instance.tags = tags
        post_instance.category = category
        post_instance.status = post_status
        post_instance.save()

        return Response({'message': 'Post updated successfully'}, status=status.HTTP_200_OK)

@method_decorator(csrf_exempt, name='dispatch') 
class ContentGenerateView(View):
    # permission_classes = [IsAuthenticated] 

    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            prompt = data.get('prompt')
            type = data.get('type', 'text') 
            context = data.get('context', '')

            if not prompt:
                return JsonResponse({"error": "Lack of prompt from user."}, status=400)
            
            ai_client = AIServiceClient()
            
            result = ai_client.generate_content(prompt, type, context)
            
            return JsonResponse(result, status=200)

        except ValueError as e:
            return JsonResponse({"error": str(e)}, status=400)
        except Exception as e:
            logger.error(f"Error processing ContentGenerateView: {e}")
            return JsonResponse({"error": "AI Service Error: Unable to process request."}, status=503)

from django.http import HttpResponse
from api.models import Category

def restore_categories_view(request):

    initial_categories = [

        'World', 'Technology', 'Design', 'Culture', 'Business',

        'Politics', 'Opinion', 'Science', 'Health', 'Style', 'Travel'

    ]

    restored = []

    existed = []

    for category_name in initial_categories:

        category, created = Category.objects.get_or_create(name=category_name)

        if created:

            restored.append(category_name)

        else:

            existed.append(category_name)

    return HttpResponse(f"Restored: {restored}. Existed: {existed}.")