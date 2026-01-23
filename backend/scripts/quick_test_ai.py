import os
import sys
import django

# Add backend directory to sys.path so we can import api
# Assuming this script is in backend/scripts/
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.ai_services import AIServiceClientFixed

def test_ai():
    print("--- STARTING AI MODEL DISCOVERY ---")
    try:
        client = AIServiceClientFixed()
        key_masked = f"{client.api_key[:5]}...{client.api_key[-5:]}" if client.api_key else "None"
        print(f"Client initialized. API Key: {key_masked}")
        
        if not client.api_key:
            print("❌ ERROR: No API Key found in env!")
            return

        import requests
        print("\nQuerying Google to see which models are available for this Key...")
        
        url = f"https://generativelanguage.googleapis.com/v1beta/models?key={client.api_key}"
        response = requests.get(url)
        
        if response.status_code == 200:
            data = response.json()
            if 'models' in data:
                print("\n✅ AVAILABLE MODELS:")
                found_any = False
                for m in data['models']:
                    # Filter for generating content models
                    if "generateContent" in m.get('supportedGenerationMethods', []):
                        name = m['name'].replace('models/', '')
                        print(f" - {name}")
                        found_any = True
                
                if not found_any:
                    print("⚠️ No models found supports 'generateContent'.")
            else:
                print("⚠️ No 'models' key in response.")
                print(data)
        else:
            print(f"\n❌ Error listing models: {response.status_code}")
            print(response.text)

        # Still try a simple generation test with a safe bet if list works
        print("\n--- Trying generation with 'gemini-2.0-flash' explicit check ---")
        gen_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={client.api_key}"
        payload = {"contents": [{"parts": [{"text": "Hi"}]}]}
        headers = {'Content-Type': 'application/json'}
        r = requests.post(gen_url, headers=headers, json=payload)
        print(f"gemini-2.0-flash Status: {r.status_code}")
        if r.status_code != 200:
            print(r.text)
        else:
             print("✅ gemini-2.0-flash is WORKING!")
             print(r.json().get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', 'No text'))

        print("\n--- Testing The Actual Code (ai_services.py) ---")
        try:
             res = client.generate_content("Hello from backend code!", "text", "test")
             print(f"✅ Service Code Integration Success: {res['content']}")
        except Exception as code_err:
             print(f"❌ Service Code Error: {code_err}")

    except Exception as e:
        print(f"\n❌ SCRIPT ERROR: {e}")

if __name__ == "__main__":
    test_ai()
