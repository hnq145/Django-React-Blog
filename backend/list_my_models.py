import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()
api_key = os.environ.get("GEMINI_API_KEY")

if not api_key:
    print("Error: GEMINI_API_KEY not found.")
    exit(1)

print(f"Checking available models for API Key: {api_key[:5]}...")

url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"

try:
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        print("\n--- AVAILABLE MODELS ---")
        found_any = False
        if 'models' in data:
            for m in data['models']:
                if 'generateContent' in m.get('supportedGenerationMethods', []):
                    print(f"- {m['name']}")
                    found_any = True
        
        if not found_any:
            print("No models found with 'generateContent' capability.")
    else:
        print(f"Error listing models: {response.status_code}")
        print(response.text)

except Exception as e:
    print(f"Exception checking models: {e}")
