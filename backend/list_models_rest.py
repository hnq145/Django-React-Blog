import os
import requests
import json
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
env_path = BASE_DIR / '.env'
load_dotenv(env_path)

api_key = os.environ.get("GEMINI_API_KEY")

if not api_key:
    # Try parent directory
    env_path = BASE_DIR.parent / '.env'
    load_dotenv(env_path)
    api_key = os.environ.get("GEMINI_API_KEY")

if not api_key:
    print("No API KEY found")
    exit(1)

url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"

try:
    response = requests.get(url)
    if response.status_code == 200:
        models = response.json().get('models', [])
        print(f"Found {len(models)} models.")
        for m in models:
            if 'generateContent' in m.get('supportedGenerationMethods', []):
                print(f"Name: {m['name']}")
    else:
        print(f"Error ({response.status_code}): {response.text}")
except Exception as e:
    print(f"Exception: {e}")
