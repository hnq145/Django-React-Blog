import os
import sys
import django
import time

# Setup Django Environment
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
sys.path.append(backend_dir)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import Post, AI_Summary
from api.ai_services import AIServiceClientV2

def generate_missing_summaries():
    print("--- STARTING BATCH AI SUMMARY GENERATION ---")
    
    # 1. Get all active posts
    posts = Post.objects.filter(status="Active")
    print(f"Total Active Posts: {posts.count()}")
    
    # 2. Identify missing ones
    posts_to_process = []
    for p in posts:
        if not hasattr(p, 'ai_summary') or p.ai_summary.status != 'Success':
            posts_to_process.append(p)
            
    print(f"Posts missing summary: {len(posts_to_process)}")
    
    if not posts_to_process:
        print("✅ All posts already have AI summaries! Exiting.")
        return

    client = AIServiceClientV2()
    
    print("\nProcessing... (This may take time due to Rate Limits)")
    
    success_count = 0
    fail_count = 0
    
    for i, post in enumerate(posts_to_process):
        print(f"[{i+1}/{len(posts_to_process)}] Processing: {post.title}...")
        
        try:
            # Context & Prompt
            context = post.description[:5000] if post.description else ""
            if not context:
                print("   ⚠️ Skipped: No description content.")
                continue

            prompt = (
                "Summarize the following article in a concise, engaging way (approx 3-4 sentences). "
                "Focus on the main key points. Language: SAME AS THE ARTICLE (Detect language)."
            )

            # Call AI
            result = client.generate_content(prompt, 'text', context)
            
            if result and result.get('content'):
                AI_Summary.objects.update_or_create(
                    post=post,
                    defaults={
                        'summarized_content': result['content'],
                        'status': 'Success'
                    }
                )
                print("   ✅ Success")
                success_count += 1
            else:
                print("   ❌ Failed: No content returned")
                fail_count += 1

        except Exception as e:
            print(f"   ❌ Error: {e}")
            fail_count += 1
            
            if "429" in str(e):
                print("   ⚠️ Quota Exceeded! Waiting 60 seconds...")
                time.sleep(60) # Wait a minute if quota hit

        # Rate Limiting Safety (Free tier allows ~15 RPM = 1 request every 4s)
        time.sleep(5) 

    print("\n--- BATCH COMPLETE ---")
    print(f"Success: {success_count}")
    print(f"Failed: {fail_count}")

if __name__ == "__main__":
    generate_missing_summaries()
