import os
import requests
import json
from google import genai
from google.genai import types

# The key from the user's logs/env
API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyAEQdVWAqLnn3etcKxM7VYWHaVGSzga3YU")

print(f"Testing API Key: {API_KEY[:5]}...{API_KEY[-5:]}")

# TEST 1: RAW REST API (The URL that was failing)
print("\n--- TEST 1: RAW REST API (gemini-1.5-flash) ---")
url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={API_KEY}"
headers = {'Content-Type': 'application/json'}
payload = {
    "contents": [{"parts": [{"text": "Hello, 1+1=?"}]}]
}
try:
    response = requests.post(url, headers=headers, json=payload)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print("Response: Success")
    else:
        print(f"Response Error: {response.text}")
except Exception as e:
    print(f"Exception: {e}")

# TEST 2: SDK (gemini-1.5-flash)
print("\n--- TEST 2: SDK (gemini-1.5-flash) ---")
try:
    client = genai.Client(api_key=API_KEY)
    response = client.models.generate_content(
        model='gemini-1.5-flash',
        contents='Hello, 1+1=?'
    )
    print(f"Data: {response.text}")
    print("SDK Success")
except Exception as e:
    print(f"SDK Failure: {e}")

# TEST 3: RAW REST API (gemini-pro - fallback)
print("\n--- TEST 3: RAW REST API (gemini-pro) ---")
url_pro = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={API_KEY}"
try:
    response = requests.post(url_pro, headers=headers, json=payload)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print("Response: Success")
    else:
        print(f"Response Error: {response.text}")
except Exception as e:
    print(f"Exception: {e}")
