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

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    image = models.FileField(upload_to="image/", default="default/default-user.jpg", null=True, blank=True)
    full_name = models.CharField(max_length=100, null=True, blank=True)
    bio = models.CharField(max_length=100, null=True, blank=True)
    about = models.CharField(max_length=100, null=True, blank=True)
    author = models.BooleanField(default=False)
    country = models.CharField(max_length=100, null=True, blank=True)
    facebook = models.CharField(max_length=100, null=True, blank=True)
    twitter = models.CharField(max_length=100, null=True, blank=True)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username

    def save(self, *args, **kwargs):
        if self.full_name == "" or self.user.full_name is None:  
            self.full_name = self.user.full_name
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
    
    # class Meta:
    #     verbose_name_plural = "Category"
    
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

    def comments(seft):
        return Comment.objects.filter(post=seft).count()

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
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
        ("Comment", "Comment"),
        ("Bookmark", "Bookmark"),
    )

    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
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
        verbose_name="Nội dung tóm tắt AI"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Thời gian tạo cache"
    )

    status = models.CharField(
        max_length=50,
        default='Success',
        verbose_name="Trạng thái xử lý"
    )
    
    class Meta:
        verbose_name = "Tóm tắt AI"
        verbose_name_plural = "Các bản Tóm tắt AI"

    def __str__(self):
        return f"Tóm tắt cho: {self.post.title}"
