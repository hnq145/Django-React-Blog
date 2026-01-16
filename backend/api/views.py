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
from .ai_services import AIServiceClientRaw as AIServiceClient
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