import os
from dotenv import load_dotenv

env_path = os.path.join(os.getcwd(), 'backend', '.env')
load_dotenv(env_path)

api_key = os.environ.get("GEMINI_API_KEY")
print(f"Loading env from: {env_path}")
if api_key:
    print(f"Key found: '{api_key}'")
    print(f"Key length: {len(api_key)}")
    print(f"Repr: {repr(api_key)}")
    # Check for common issues
    if api_key.startswith('"') or api_key.startswith("'"):
        print("WARNING: Key starts with quote!")
    if " " in api_key:
        print("WARNING: Key contains spaces!")
else:
    print("GEMINI_API_KEY not found.")
