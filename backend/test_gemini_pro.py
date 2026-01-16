
import os
import requests
import json
from pathlib import Path
from dotenv import load_dotenv

# Load .env
BASE_DIR = Path(__file__).resolve().parent
env_path = BASE_DIR / '.env'
load_dotenv(env_path)

api_key = os.environ.get("GEMINI_API_KEY")

print(f"Testing with Key starting: {api_key[:5] if api_key else 'None'}...")

# 1. Test Text (Gemini 1.5 Flash)
print("\n--- Testing Text (gemini-1.5-flash) ---")
url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
headers = {'Content-Type': 'application/json'}
payload = {
    "contents": [{"parts": [{"text": "Hello, explain what is AI in 1 sentence."}]}]
}

try:
    response = requests.post(url, headers=headers, json=payload)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("Success (Text)!")
    else:
        print("Failed (Text)!")
        print(response.text)
except Exception as e:
    print(f"Exception (Text): {e}")

# 2. Test Image (Imagen 3.0 via SDK)
print("\n--- Testing Image (imagen-3.0-generate-001) via SDK ---")
try:
    from google import genai
    from google.genai import types
    
    client = genai.Client(api_key=api_key)
    try:
        image_result = client.models.generate_images(
            model='imagen-3.0-generate-001',
            prompt='A cat',
            config=types.GenerateImagesConfig(number_of_images=1)
        )
        print("Success (Image SDK)!")
    except Exception as e:
        print(f"Failed (Image SDK): {e}")

except ImportError:
    print("google-genai SDK not installed.")
except Exception as e:
    print(f"SDK Init Error: {e}")
