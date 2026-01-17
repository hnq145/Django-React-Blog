from django.shortcuts import render
# Force Reload Trigger
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
from .ai_services import AIServiceClientFixed as AIServiceClient
from .models import Post 

import json
import random
import logging
from django.views import View

logger = logging.getLogger(__name__)
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from api import serializer as api_serializer
from api import models as api_models

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = api_serializer.MyTokenObtainPairSerializer

# ... (omitted lines) ...

@method_decorator(csrf_exempt, name='dispatch') 
class ContentGenerateView(APIView):
    permission_classes = [AllowAny] 

    def post(self, request, *args, **kwargs):
        try:
            # For APIView, data is already parsed in request.data
            prompt = request.data.get('prompt')
            type = request.data.get('type', 'text') 
            context = request.data.get('context', '')
            image_base64 = request.data.get('image_base64', None)

            if not prompt:
                return Response({"error": "Lack of prompt from user."}, status=status.HTTP_400_BAD_REQUEST)
            
            ai_client = AIServiceClient()
            
            result = ai_client.generate_content(prompt, type, context, image_base64)
            
            return Response(result, status=status.HTTP_200_OK)

        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error processing ContentGenerateView: {e}")
            error_msg = str(e)
            # If the error comes from Google API (e.g. 400 Bad Request), trying to parse it
            if "400" in error_msg or "Invalid" in error_msg:
                 return Response({"error": error_msg}, status=status.HTTP_400_BAD_REQUEST)
            if "403" in error_msg or "Permission" in error_msg:
                 return Response({"error": f"Permission Denied: {error_msg}"}, status=status.HTTP_403_FORBIDDEN)
            
            return Response({"error": f"AI Service Error: {error_msg}"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

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

class DashboardMarkAllNotificationsAsSeen(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        api_models.Notification.objects.filter(user=request.user, seen=False).update(seen=True)
        return Response({'message': 'All notifications marked as seen'}, status=status.HTTP_200_OK)

class RegisterView(generics.CreateAPIView):
    queryset = api_models.User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = api_serializer.RegisterSerializer

class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = api_serializer.ProfileSerializer
    def get_object(self):
        return self.request.user.profile

class CategoryListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.CategorySerializer
    permission_classes = [AllowAny]
    queryset = api_models.Category.objects.all()

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

class LikePostAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        user_id = request.data.get('user_id')
        post_id = request.data.get('post_id')
        
        post = api_models.Post.objects.get(id=post_id)
        
        # Check if user exists (generic) or use request.user if authenticated
        # Using raw user_id as per typical unsecure pattern or for frontend convenience
        # If user_id is passed, use it, else usage request.user
        
        if request.user.is_authenticated:
            user = request.user
        else:
             user = api_models.User.objects.get(id=user_id)

        if user in post.likes.all():
            post.likes.remove(user)
            return Response({'message': 'Post Disliked'}, status=status.HTTP_200_OK)
        else:
            post.likes.add(user)
            api_models.Notification.objects.create(
                user=post.user, post=post, type='Like'
            )
            return Response({'message': 'Post Liked'}, status=status.HTTP_200_OK)

class PostCommentAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        post_id = request.data.get('post_id')
        name = request.data.get('name')
        email = request.data.get('email')
        comment = request.data.get('comment')
        
        post = api_models.Post.objects.get(id=post_id)
        api_models.Comment.objects.create(
            post=post, name=name, email=email, comment=comment
        )
        api_models.Notification.objects.create(
            user=post.user, post=post, type='Comment'
        )
        return Response({'message': 'Comment Posted'}, status=status.HTTP_201_CREATED)

class BookmarkPostAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        user_id = request.data.get('user_id')
        post_id = request.data.get('post_id')
        
        if request.user.is_authenticated:
            user = request.user
        else:
            user = api_models.User.objects.get(id=user_id)

        post = api_models.Post.objects.get(id=post_id)
        bookmark = api_models.Bookmark.objects.filter(post=post, user=user)
        if bookmark.exists():
             bookmark.delete()
             return Response({'message': 'Post Un-Bookmarked'}, status=status.HTTP_200_OK)
        else:
             api_models.Bookmark.objects.create(post=post, user=user)
             api_models.Notification.objects.create(
                 user=post.user, post=post, type='Bookmark'
             )
             return Response({'message': 'Post Bookmarked'}, status=status.HTTP_200_OK)

class DashboardStats(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user_id = request.user.id
        views = api_models.Post.objects.filter(user_id=user_id).aggregate(view=Sum("view"))['view']
        posts = api_models.Post.objects.filter(user_id=user_id).count()
        likes = api_models.Post.objects.filter(user_id=user_id).count() 
        bookmarks = api_models.Bookmark.objects.filter(post__user_id=user_id).count()
        
        return Response({'views': views, 'posts': posts, 'likes': likes, 'bookmarks': bookmarks})

class DashboardPostLists(generics.ListAPIView):
    serializer_class = api_serializer.PostSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        user_id = self.request.user.id
        return api_models.Post.objects.filter(user_id=user_id).order_by('-id')

class DashboardCommentLists(generics.ListAPIView):
    serializer_class = api_serializer.CommentSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        user_id = self.request.user.id
        return api_models.Comment.objects.filter(post__user__id=user_id).order_by('-id')

class DashboardNotificationList(generics.ListAPIView):
    serializer_class = api_serializer.NotificationSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        user_id = self.request.user.id
        return api_models.Notification.objects.filter(seen=False, user__id=user_id).order_by('-id')

class DashboardMarkNotificationAsSeen(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
         noti_id = request.data.get('noti_id')
         noti = api_models.Notification.objects.get(id=noti_id)
         noti.seen = True
         noti.save()
         return Response({'message': 'Notification marked as seen'}, status=status.HTTP_200_OK)

class DashboardReplyCommentAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
         comment_id = request.data.get('comment_id')
         reply = request.data.get('reply')
         comment = api_models.Comment.objects.get(id=comment_id)
         comment.reply = reply
         comment.save()
         return Response({'message': 'Comment Replied'}, status=status.HTTP_200_OK)

class DashboardPostCreateAPIView(generics.CreateAPIView):
     serializer_class = api_serializer.PostSerializer
     permission_classes = [IsAuthenticated]
     def perform_create(self, serializer):
         serializer.save(user=self.request.user)

class DashboardPostEditAPIView(generics.RetrieveUpdateDestroyAPIView):
     serializer_class = api_serializer.PostSerializer
     permission_classes = [IsAuthenticated]
     def get_object(self):
         user_id = self.request.user.id
         post_id = self.kwargs['post_id']
         return api_models.Post.objects.get(user__id=user_id, id=post_id)
