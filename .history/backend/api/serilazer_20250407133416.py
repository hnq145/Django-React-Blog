from django.contrib.auth.password_validation import validate_password  
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer  
from rest_framework import serializers  

from api import models as api_models