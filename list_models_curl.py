import os
import requests
from dotenv import load_dotenv

load_dotenv('backend/.env')
api_key = os.environ.get("GEMINI_API_KEY")

if not api_key:
    print("No API Key found")
    exit(1)

url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"

try:
    print(f"Requesting: {url.replace(api_key, 'API_KEY')}")
    response = requests.get(url)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("Available Models:")
        for model in data.get('models', []):
            print(f" - {model['name']}")
    else:
        print(f"Error: {response.text}")

except Exception as e:
    print(f"Exception: {e}")
