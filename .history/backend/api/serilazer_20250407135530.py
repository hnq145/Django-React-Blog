from django.contrib.auth.password_validation import validate_password  
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer  
from rest_framework import serializers  

from api import models as api_models

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['full_name'] = user.full_name
        token['email'] = user.email
        token['username'] = user.username
    
        return token
    
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = api_models.User
        fields = ['email', 'full_name', 'password', 'password2']

    def validate(self, attr):
        if attr['password'] != attr['password2']:
            raise serializers.ValidationError({"password': 'Password fields didn't match."})
        return attr
    
    def create(self, validated_data):
        user = api_models.User.objects.create(
            full_name=validated_data['full_name'],
            email = validated_data['email'],
        )

        email_username, mobile = user.email.split('@')
        user.username = email_username

        user.set_password(validated_password['password'])
        user.save()

        return user

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.Profile
        fields = "__all__"

