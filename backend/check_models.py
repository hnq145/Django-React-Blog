
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
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
    print("FATAL: GEMINI_API_KEY not found in .env or environment")
    sys.exit(1)

print(f"Using API Key: {api_key[:5]}...{api_key[-5:]}")

from google import genai
try:
    client = genai.Client(api_key=api_key)
    print("Attempting to list models...")
    for m in client.models.list():
        print(f"Model: {m.name}")
except Exception as e:
    print(f"Error listing models: {e}")
