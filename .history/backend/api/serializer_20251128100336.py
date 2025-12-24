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

        user.set_password(validated_data['password'])
        user.save()

        return user

class ProfileSerializer(serializers.ModelSerializer):
    image = serializers.FileField(required=False)
    class Meta:
        model = api_models.Profile
        fields = ['full_name', 'bio', 'about', 'country', 'facebook', 'twitter', 'image']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.image:
            representation['image'] = instance.image.url
        return representation

class CategorySerializer(serializers.ModelSerializer):
    post_count = serializers.SerializerMethodField()

    def get_post_count(self, category):
        return category.post_count()
    
    class Meta:
        model = api_models.Category
        fields = ["id", "title", "image", "slug", "post_count"]
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.image:
            representation['image'] = instance.image.url
        return representation

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.User
        fields = ['id', 'username', 'email', 'full_name']

class CommentSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = api_models.Comment
        fields = "__all__"
        depth = 1


class PostSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    profile = ProfileSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    
    class Meta:
        model = api_models.Post
        fields = [
            'id', 'user', 'profile', 'category', 'title', 'tags', 'description', 
            'image', 'status', 'view', 'likes', 'slug', 'date', 'comments'
        ]

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.image:
            representation['image'] = instance.image.url
        return representation

class BookmarkSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = api_models.Bookmark
        fields = "__all__"
        depth = 1

class NotificationSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = api_models.Notification
        fields = "__all__"
        depth = 1

class AuthorSerializer(serializers.Serializer):
    views = serializers.IntegerField(default=0)
    posts = serializers.IntegerField(default=0)
    likes = serializers.IntegerField(default=0)
    bookmarks = serializers.IntegerField(default=0)