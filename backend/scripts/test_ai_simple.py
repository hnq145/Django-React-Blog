
import os
import sys

# Setup Path to find backend/api
# We are in backend/scripts/
# We need to add backend/ to sys.path to import api.ai_services
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
sys.path.append(backend_dir)

# Mock logger to avoid errors if logging is not configured
import logging
logging.basicConfig(level=logging.INFO)

# Set API KEY directly for testing if needed, or rely on os.environ
# os.environ['GEMINI_API_KEY'] = "..." # Assuming it's already set in the shell environment

try:
    from api.ai_services import AIServiceClientV2
    print("Import successful!")
except ImportError as e:
    print(f"Import failed: {e}")
    # Fallback: Copy paste class or mock it? 
    # If import fails, we can't test the actual file.
    sys.exit(1)

def test_image_gen():
    print("Testing Image Generation (Simple)...")
    
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
        else:
            print("FAILED: Result returned but not an image type or empty.")
            print(result)
            
    except Exception as e:
        print(f"EXCEPTION: {e}")

if __name__ == "__main__":
    test_image_gen()
