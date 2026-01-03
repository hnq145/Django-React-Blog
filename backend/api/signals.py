
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
            group_name = f'notifications_{instance.user.id}'

            
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

from .models import Post, AI_Summary
from .ai_services import AIServiceClient

@receiver(post_save, sender=Post)
def post_ai_summary_handler(sender, instance, created, **kwargs):
    """
    Automatically generates a summary for the post using using Gemini AI.
    """
    if created or not hasattr(instance, 'ai_summary'):
        try:
            # Only summarize if it's active and has description
            if instance.status == "Active" and instance.description:
                ai_client = AIServiceClient()
                prompt = "Summarize the following blog post in Vietnamese (approx 3-4 sentences):"
                result = ai_client.generate_content(prompt, type='text', context=instance.description)
                
                if result and 'content' in result:
                    AI_Summary.objects.create(
                        post=instance,
                        summarized_content=result['content'],
                        status='Success'
                    )
                    print(f"AI Summary generated for Post: {instance.title}")
        except Exception as e:
            print(f"Error generating AI Summary: {e}")
