
import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.ai_services import AIServiceClientV2

def test_image_gen():
    print("Testing Image Generation...")
    
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("ERROR: GEMINI_API_KEY not found in environment.")
        return

    print(f"API Key found (length: {len(api_key)})")

    client = AIServiceClientV2()
    
    prompt = "A futuristic city skyline at sunset, cyberpunk style"
    try:
        print(f"Sending prompt: {prompt}")
        result = client.generate_content(prompt, type='image', context="Test Script")
        
        if result and result.get('type') == 'image':
            content = result.get('content')
            print(f"SUCCESS: Image generated!")
            print(f"Base64 Length: {len(content)}")
            
            # Optionally save to file to visually verify (if I could see it, but verifying length > 0 is good enough for automated test)
            # with open("test_image.jpg", "wb") as f:
            #     import base64
            #     f.write(base64.b64decode(content))
            # print("Saved to test_image.jpg")
        else:
            print("FAILED: Result returned but not an image type or empty.")
            print(result)
            
    except Exception as e:
        print(f"EXCEPTION: {e}")

if __name__ == "__main__":
    test_image_gen()
