from django.contrib.auth.password_validation import validate_password  
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer  
from rest_framework import serializers  

from api import models as api_models
from api.pagination import CommentPagination

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
            raise serializers.ValidationError({"password": "Password fields didn't match."})
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

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    confirm_new_password = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_new_password']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        return attrs

class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.Badge
        fields = ['name', 'description', 'icon', 'created_at']

class ProfileSerializer(serializers.ModelSerializer):
    image = serializers.FileField(required=False)
    cover_image = serializers.FileField(required=False)
    badges = BadgeSerializer(many=True, read_only=True)
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()
    post_count = serializers.SerializerMethodField()
    
    class Meta:
        model = api_models.Profile
        fields = ['full_name', 'bio', 'about', 'country', 'facebook', 'twitter', 'image', 'cover_image', 'badges', 'followers_count', 'following_count', 'is_following', 'post_count', 'date']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.image:
            request = self.context.get('request')
            representation['image'] = request.build_absolute_uri(instance.image.url)
        if instance.cover_image:
            request = self.context.get('request')
            representation['cover_image'] = request.build_absolute_uri(instance.cover_image.url)
        return representation

    def get_followers_count(self, obj):
        return obj.user.followers.count()

    def get_following_count(self, obj):
        return obj.user.following.count()
    
    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return api_models.Follow.objects.filter(follower=request.user, following=obj.user).exists()
        return False

    def get_post_count(self, obj):
        return api_models.Post.objects.filter(user=obj.user, status="Active").count()

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
            request = self.context.get('request')
            representation['image'] = request.build_absolute_uri(instance.image.url)
        return representation

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    class Meta:
        model = api_models.User
        fields = ['id', 'username', 'email', 'full_name', 'profile']

class CommentSerializer(serializers.ModelSerializer):
    reply_set = serializers.SerializerMethodField()

    class Meta:
        model = api_models.Comment
        fields = "__all__"
        depth = 1

    def get_reply_set(self, obj):
        serializer = CommentSerializer(obj.reply_set.all(), many=True)
        return serializer.data

    profile_image = serializers.SerializerMethodField()
    
    def get_profile_image(self, comment):
        # 1. Try using the direct Foreign Key 'user'
        user = comment.user
        # 2. If 'user' is None, try fallback lookup by email (legacy)
        if not user and comment.email:
             try:
                 user = api_models.User.objects.get(email=comment.email)
             except api_models.User.DoesNotExist:
                 pass
        
        if user and hasattr(user, 'profile') and user.profile.image:
             request = self.context.get('request')
             if request:
                 return request.build_absolute_uri(user.profile.image.url)
             return user.profile.image.url
        return None

    badges = serializers.SerializerMethodField()

    def get_badges(self, comment):
        user = comment.user
        # If 'user' is None, try fallback lookup by email (legacy)
        if not user and comment.email:
             try:
                 user = api_models.User.objects.get(email=comment.email)
             except api_models.User.DoesNotExist:
                 pass
        
        if user and hasattr(user, 'profile'):
            return BadgeSerializer(user.profile.badges.all(), many=True).data
        return []

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        
        # Determine the user associated with this comment
        user = instance.user
        if not user and instance.email:
             try:
                 user = api_models.User.objects.get(email=instance.email)
             except api_models.User.DoesNotExist:
                 pass
        
        # If user found, override the static name with dynamic profile name
        if user:
             if hasattr(user, 'profile') and user.profile.full_name:
                  ret['name'] = user.profile.full_name
             elif user.full_name:
                  ret['name'] = user.full_name
        return ret


class AI_SummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.AI_Summary
        fields = ['summarized_content', 'status', 'created_at']

class PostSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    profile = ProfileSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    comments = serializers.SerializerMethodField()
    ai_summary = AI_SummarySerializer(read_only=True)
    
    reaction_counts = serializers.SerializerMethodField()
    my_reaction = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()
    
    class Meta:
        model = api_models.Post
        fields = [
            'id', 'user', 'profile', 'category', 'title', 'tags', 'description', 
            'image', 'status', 'view', 'likes', 'slug', 'date', 'comments', 'ai_summary',
            'reaction_counts', 'my_reaction', 'is_following'
        ]

    def get_reaction_counts(self, instance):
        return {
            'Like': instance.reactions.filter(reaction_type='Like').count(),
            'Love': instance.reactions.filter(reaction_type='Love').count(),
            'Haha': instance.reactions.filter(reaction_type='Haha').count(),
            'Wow': instance.reactions.filter(reaction_type='Wow').count(),
            'Sad': instance.reactions.filter(reaction_type='Sad').count(),
            'Angry': instance.reactions.filter(reaction_type='Angry').count(),
        }

    def get_my_reaction(self, instance):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            reaction = instance.reactions.filter(user=request.user).first()
            return reaction.reaction_type if reaction else None
        return None

    def get_is_following(self, instance):
        request = self.context.get('request')
        if request and request.user.is_authenticated and instance.user:
            return api_models.Follow.objects.filter(follower=request.user, following=instance.user).exists()
        return False

    def get_comments(self, obj):
        comment_sort = self.context.get('comment_sort')
        request = self.context.get('request')

        if comment_sort == 'oldest':
            comments = obj.comments.filter(parent__isnull=True).order_by('date')
        else:
            comments = obj.comments.filter(parent__isnull=True).order_by('-date')
        
        paginator = CommentPagination()
        paginated_comments = paginator.paginate_queryset(comments, request)
        serializer = CommentSerializer(paginated_comments, many=True, context={'request': request})
        
        return paginator.get_paginated_response(serializer.data).data

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.image:
            request = self.context.get('request')
            representation['image'] = request.build_absolute_uri(instance.image.url)
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
    followers = serializers.IntegerField(default=0)
    following = serializers.IntegerField(default=0)
    is_following = serializers.SerializerMethodField()
    
    def get_is_following(self, obj):
        # obj is assumed to be dict or similar, this might need refinement depending on usage View
        return False

class ChatMessageSerializer(serializers.ModelSerializer):
    receiver_profile = ProfileSerializer(read_only=True, source='receiver.profile')
    sender_profile = ProfileSerializer(read_only=True, source='sender.profile')

    class Meta:
        model = api_models.ChatMessage
        fields = ['id', 'user', 'sender', 'sender_profile', 'receiver', 'receiver_profile', 'message', 'is_read', 'date']

    def __init__(self, *args, **kwargs):
        super(ChatMessageSerializer, self).__init__(*args, **kwargs)
        request = self.context.get('request')
        if request:
            self.fields['sender_profile'].context['request'] = request
            self.fields['receiver_profile'].context['request'] = request