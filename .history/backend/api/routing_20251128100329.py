
from django.urls import path
from . import consumers

websocket_urlpatterns = [
    
    path('notifications/', consumers.NotificationConsumer.as_asgi()),
    
    
    path('posts/<str:post_id>/comments/', consumers.CommentConsumer.as_asgi()),
]
