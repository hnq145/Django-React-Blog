
import os
import requests
import json
from pathlib import Path
from dotenv import load_dotenv

# Load .env exactly as Django settings does
BASE_DIR = Path(__file__).resolve().parent
env_path = BASE_DIR / '.env'
load_dotenv(env_path)

api_key = os.environ.get("GEMINI_API_KEY")

if not api_key:
    # Try parent directory just in case
    env_path = BASE_DIR.parent / '.env'
    load_dotenv(env_path)
    api_key = os.environ.get("GEMINI_API_KEY")

print(f"Testing Gemini Pro with Key: {api_key[:5]}...{api_key[-5:] if api_key else 'None'}")

url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={api_key}"
headers = {'Content-Type': 'application/json'}
payload = {
    "contents": [{
        "parts": [{"text": "Hello, explain what is AI in 1 sentence."}]
    }]
}

try:
    response = requests.post(url, headers=headers, json=payload)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("Success!")
        print(json.dumps(response.json(), indent=2))
    else:
        print("Failed!")
        print(response.text)
except Exception as e:
    print(f"Exception: {e}")
