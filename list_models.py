import os
from dotenv import load_dotenv
from google import genai

load_dotenv('backend/.env')
api_key = os.environ.get("GEMINI_API_KEY")

print(f"Key found: {bool(api_key)}")

if api_key:
    try:
        client = genai.Client(api_key=api_key)
        print("Attempting to list models...")
        # Try-catch specifically for the list call
        try:
            # Modern google-genai SDK 
            models = client.models.list()
            for m in models:
                # Filter for generateContent support
                if 'generateContent' in (m.supported_generation_methods or []):
                    print(f"Found Model: {m.name}")
                    print(f" - Display Name: {m.display_name}")
        except Exception as e:
            print(f"Error calling client.models.list(): {e}")
            
    except Exception as e:
        print(f"General Error: {e}")
