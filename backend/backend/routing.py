
from django.urls import path
from api import consumers

websocket_urlpatterns = [
    path('ws/notifications/', consumers.NotificationConsumer.as_asgi()),
    path('ws/chat/', consumers.ChatConsumer.as_asgi()),
    path('ws/posts/<str:post_id>/comments/', consumers.CommentConsumer.as_asgi()),
]
