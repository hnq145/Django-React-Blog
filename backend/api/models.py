from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save
from django.utils.text import slugify
from shortuuid.django_fields import ShortUUIDField 
import shortuuid

class User(AbstractUser):
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=100, null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.username

    def save(self, *args, **kwargs):
        email_username, mobile = self.email.split('@')
        if self.full_name == "" or self.full_name is None:
            self.full_name = email_username
        if self.username == "" or self.username is None:  
            self.username = email_username

        super(User, self).save(*args, **kwargs)

    @property
    def avatar(self):
        if hasattr(self, 'profile') and self.profile.image:
            return self.profile.image.url
        return None


class Badge(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)
    icon = models.CharField(max_length=100, help_text="FontAwesome class or image URL")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    image = models.FileField(upload_to="image/", default="image/default-user.jpg", null=True, blank=True)
    full_name = models.CharField(max_length=100, null=True, blank=True)
    bio = models.CharField(max_length=100, null=True, blank=True)
    about = models.CharField(max_length=100, null=True, blank=True)
    author = models.BooleanField(default=False)
    country = models.CharField(max_length=100, null=True, blank=True)
    facebook = models.CharField(max_length=100, null=True, blank=True)
    twitter = models.CharField(max_length=100, null=True, blank=True)
    date = models.DateTimeField(auto_now_add=True)
    badges = models.ManyToManyField(Badge, blank=True, related_name="users")

    def __str__(self):
        return self.user.username

    def save(self, *args, **kwargs):
        if self.full_name == "" or self.user.full_name is None:  
            self.full_name = self.user.full_name
        
        # Sync full_name back to User model
        if self.full_name and self.user.full_name != self.full_name:
            self.user.full_name = self.full_name
            self.user.save()
            
        super(Profile, self).save(*args, **kwargs)

def create_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

def save_user_profile(sender, instance, created, **kwargs):
    instance.profile.save()

post_save.connect(create_profile, sender=User)
post_save.connect(save_user_profile, sender=User)

class Category(models.Model):
    title = models.CharField(max_length=100)
    image = models.FileField(upload_to="image", null=True, blank=True)
    slug = models.SlugField(unique=True, blank=True, null=True)

    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if self.slug == "" or self.slug is None:
            self.slug = slugify(self.title)
        super(Category, self).save(*args, **kwargs)

    def post_count(self):
        return Post.objects.filter(category=self).count()

class Post(models.Model):

    STATUS = (
        ("Active", "Active"),
        ("Draft", "Draft"),
        ("Disabled", "Disabled"),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, null=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField(max_length=100)
    tags = models.CharField(max_length=100, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    image = models.FileField(upload_to="image", null=True, blank=True)
    status = models.CharField(max_length=100, choices=STATUS, default="Active")
    view = models.IntegerField(default=0)
    likes = models.ManyToManyField(User, related_name="likes_user", blank=True)
    slug = models.SlugField(unique=True, blank=True, null=True)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ["-date"]
        verbose_name_plural = "Posts"
    
    def save(self, *args, **kwargs):
        if self.slug == "" or self.slug is None:
            self.slug = slugify(self.title) + "-" + shortuuid.uuid()[:2]
        super(Post, self).save(*args, **kwargs)

    def comments(self):
        return Comment.objects.filter(post=self).count()

class Reaction(models.Model):
    REACTION_CHOICES = (
        ("Like", "Like"),
        ("Love", "Love"),
        ("Haha", "Haha"),
        ("Wow", "Wow"),
        ("Sad", "Sad"),
        ("Angry", "Angry"),
    )
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="reactions")
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    reaction_type = models.CharField(max_length=50, choices=REACTION_CHOICES, default="Like")
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'post']
        verbose_name_plural = "Reactions"

    def __str__(self):
        return f"{self.user.username} reacted {self.reaction_type} to {self.post.title}"

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='reply_set')
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(max_length=100)
    comment = models.TextField(null=True, blank=True)
    reply = models.TextField(null=True, blank=True)
    date = models.DateTimeField(auto_now_add=True)
    seen = models.BooleanField(default=False)

    def __str__(self):
        return self.post.title
    
    class Meta:
        ordering = ["-date"]
        verbose_name_plural = "Comment"

class Bookmark(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.post.title
    
    class Meta:
        ordering = ["-date"]
        verbose_name_plural = "Bookmark"

class Notification(models.Model):
    NOTI_TYPE = (
        ("Like", "Like"),
        ("Love", "Love"),
        ("Haha", "Haha"),
        ("Wow", "Wow"),
        ("Sad", "Sad"),
        ("Angry", "Angry"),
        ("Comment", "Comment"),
        ("Bookmark", "Bookmark"),
        ("Mention", "Mention"),
        ("Badge", "Badge"),
        ("Follow", "Follow"),
    )

    post = models.ForeignKey(Post, on_delete=models.CASCADE, null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notification_sender", null=True, blank=True)
    type = models.CharField(choices=NOTI_TYPE, max_length=100)
    seen = models.BooleanField(default=False)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.post:
            return f"{self.post.title} - {self.type}"
        else:
            return "Notification"
    class Meta:
        ordering = ["-date"]
        verbose_name_plural = "Notification"

class AI_Summary(models.Model):
    
    post = models.OneToOneField(
        'Post',  
        on_delete=models.CASCADE,
        related_name='ai_summary',
        verbose_name="The article is summarized"
    )
    
    summarized_content = models.TextField(
        verbose_name="AI Summary"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Cache creation time"
    )

    status = models.CharField(
        max_length=50,
        default='Success',
        verbose_name="Processing status"
    )
    
    class Meta:
        verbose_name = "AI Summary"
        verbose_name_plural = "AI Summaries"

    def __str__(self):
        return f"Summary for: {self.post.title}"

class Follow(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name="following")
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name="followers")
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['follower', 'following']
        verbose_name_plural = "Follow"
    
    def __str__(self):
        return f"{self.follower.username} follows {self.following.username}"
