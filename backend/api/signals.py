
# Force Reload Trigger
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
from .ai_services import AIServiceClientV2

import threading

@receiver(post_save, sender=Post)
def post_ai_summary_handler(sender, instance, created, **kwargs):
    """
    Trigger AI Summary generation in a background thread to avoid blocking.
    """
    # Check if we should generate summary:
    # 1. New post (created) OR
    # 2. Updated post but no summary exists yet
    # 3. Post must be Active and have content
    
    should_run = False
    if instance.status == "Active" and instance.description:
        if created:
            should_run = True
        elif not AI_Summary.objects.filter(post=instance).exists():
            should_run = True

    if should_run:
        print(f"Signal: Triggering AI Summary background task for Post '{instance.title}'...")
        thread = threading.Thread(target=background_generate_summary, args=(instance.id,))
        thread.daemon = True # Daemon thread dies if main program exits
        thread.start()

def background_generate_summary(post_id):
    try:
        # Re-fetch post from DB to be safe inside thread
        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return

        print(f"Background: Generating summary for '{post.title}'...")
        ai_client = AIServiceClientV2()
        
        # Optimize context to avoid token limits (take first 5000 chars)
        context_text = post.description[:5000] if post.description else ""
        
        # Custom prompt for summary
        prompt = (
            "Summarize the following article in a concise, engaging way (approx 3-4 sentences). "
            "Focus on the main key points. Language: SAME AS THE ARTICLE (Detect language)."
        )

        result = ai_client.generate_content(prompt, type='text', context=context_text)
        
        if result and 'content' in result:
            # Update or Create
            summary, _ = AI_Summary.objects.update_or_create(
                post=post,
                defaults={
                    'summarized_content': result['content'],
                    'status': 'Success'
                }
            )
            print(f"✅ Background: AI Summary saved for '{post.title}'")
        else:
            print(f"❌ Background: AI returned no content for '{post.title}'")

    except Exception as e:
        print(f"❌ Background Error generating summary: {e}")
