
from django.db.models.signals import post_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json

from .models import Notification
from .serializer import NotificationSerializer

@receiver(post_save, sender=Notification)
def notification_created_handler(sender, instance, created, **kwargs):
    """
    Handles sending a notification to the WebSocket group when a new notification is created.
    """
    if created:
        try:
            channel_layer = get_channel_layer()
            group_name = 'notifications' # General notification group

            # Serialize the notification instance
            serializer = NotificationSerializer(instance)
            
            # Broadcast the message to the group
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    'type': 'send_notification', # This corresponds to the method name in the consumer
                    'message': serializer.data
                }
            )
        except Exception as e:
            # Handle exceptions, e.g., Redis not available
            print(f"Error in notification signal: {e}")
