import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.environ.get("GEMINI_API_KEY")

print(f"Checking models with Key: {api_key[:5]}...")

try:
    client = genai.Client(api_key=api_key)
    # Using the low-level list_models if available or trying to infer from error
    # The SDK usually creates a client that hits v1beta.
    
    # Try a standard generation with gemini-2.0-flash-exp (newest) or gemini-1.5-flash or gemini-pro
    models_to_test = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-001",
        "gemini-1.5-flash-002",
        "gemini-2.0-flash-exp",
        "gemini-pro",
        "gemini-1.5-pro",
    ]
    
    for m in models_to_test:
        print(f"\nTesting model: {m}")
        try:
            response = client.models.generate_content(
                model=m,
                contents='Hello',
            )
            print(f"SUCCESS with {m}!")
            break 
        except Exception as e:
            print(f"Failed with {m}: {e}")

except Exception as e:
    print(f"Client Init Error: {e}")
