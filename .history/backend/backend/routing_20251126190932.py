
from django.urls import path
from api import consumers

# The single list of all WebSocket routes for the project
websocket_urlpatterns = [
    path('ws/notifications/', consumers.NotificationConsumer.as_asgi()),
    path('ws/posts/<str:post_id>/comments/', consumers.CommentConsumer.as_asgi()),
]
