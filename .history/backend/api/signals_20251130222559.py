
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
            group_name = 'notifications' 

            
            serializer = NotificationSerializer(instance)
            
            
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    'type': 'send_notification', 
                    'message': serializer.data
                }
            )
        except Exception as e:
            
            print(f"Error in notification signal: {e}")
