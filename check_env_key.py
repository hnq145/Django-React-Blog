import os
from dotenv import load_dotenv

load_dotenv('backend/.env')

api_key = os.environ.get("GEMINI_API_KEY")
if api_key:
    print(f"GEMINI_API_KEY found: {api_key[:5]}...{api_key[-5:]}")
else:
    print("GEMINI_API_KEY not found in backend/.env")
