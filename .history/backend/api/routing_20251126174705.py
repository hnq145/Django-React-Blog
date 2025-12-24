
from django.urls import path
from . import consumers

websocket_urlpatterns = [
    # Route for general notifications
    path('notifications/', consumers.NotificationConsumer.as_asgi()),
    
    # Route for post-specific comments
    path('posts/<str:post_id>/comments/', consumers.CommentConsumer.as_asgi()),
]
