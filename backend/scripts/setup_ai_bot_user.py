import os
import sys
import django
from django.core.files import File
from django.conf import settings

# Setup Django Environment
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
sys.path.append(backend_dir)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import User, Profile, ChatMessage

def setup_ai_bot():
    print("--- SETTING UP AI BOT USER ---")
    
    username = "ai_assistant"
    email = "ai@blog.com"
    password = "ai_secure_password_123" # Not uses for login really
    full_name = "AI Assistant"
    
    # 1. Create User
    user, created = User.objects.get_or_create(
        username=username,
        defaults={
            'email': email,
            'full_name': full_name,
            'is_active': True
        }
    )
    
    if created:
        user.set_password(password)
        user.save()
        print(f"✅ Created User: {username}")
    else:
        print(f"ℹ️ User {username} already exists.")
        
    # 2. Setup Profile (Image, Bio)
    try:
        profile = Profile.objects.get(user=user)
        profile.full_name = full_name
        profile.bio = "I am your intelligent assistant. Chat with me for help, ideas, or just for fun! 🤖✨"
        profile.author = True # Make it verified/author style
        
        # We can set a specific nice 3D avatar URL if 'image' field accepts URL (It's a FileField though)
        # So we leave the default or users can upload one manually via Admin
        # But let's set a distinct cover image or verified badge logic if available
        
        profile.save()
        print(f"✅ Updated Profile for {full_name}")
        
    except Profile.DoesNotExist:
        print("❌ Error: Profile missing even after user creation.")

    # 3. Create a welcoming message for ALL existing users? 
    # (Optional: This makes the bot appear in everyone's chat list immediately)
    all_users = User.objects.exclude(id=user.id)
    count = 0
    for u in all_users:
        # Check if chat exists
        exists = ChatMessage.objects.filter(
            (django.db.models.Q(sender=user) & django.db.models.Q(receiver=u)) |
            (django.db.models.Q(sender=u) & django.db.models.Q(receiver=user))
        ).exists()
        
        if not exists:
            # Send welcome message
            ChatMessage.objects.create(
                user=u, # The owner of the view? Or conversation owner.
                sender=user,
                receiver=u,
                message="Hi! I'm your AI Assistant. How can I help you today? 👋",
                is_read=False
            )
            count += 1
            
    if count > 0:
        print(f"✅ Sent welcome message to {count} users.")
    else:
        print("ℹ️ All users already have a conversation with AI.")

    print("\n--- AI BOT SETUP COMPLETE ---")
    print(f"Bot ID: {user.id}")
    print("You can now find 'AI Assistant' in your messages.")

if __name__ == "__main__":
    setup_ai_bot()
