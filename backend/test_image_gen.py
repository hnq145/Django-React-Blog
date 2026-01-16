
import os
import sys
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    # Try to read from .env directly if system env not set
    try:
        with open('.env') as f:
            for line in f:
                if line.startswith('GEMINI_API_KEY='):
                    api_key = line.strip().split('=')[1]
                    os.environ["GEMINI_API_KEY"] = api_key
    except:
        pass

if not api_key:
    print("Error: GEMINI_API_KEY not found")
    sys.exit(1)

print(f"Using API Key: {api_key[:5]}...")

client = genai.Client(api_key=api_key)

prompt = "A futuristic city with flying cars"

print("Attempting to generate image with 'imagen-3.0-generate-001'...")
try:
    response = client.models.generate_images(
        model='imagen-3.0-generate-001',
        prompt=prompt,
        config=types.GenerateImagesConfig(
            number_of_images=1,
        )
    )
    print("Success with imagen-3.0-generate-001!")
    if response.generated_images:
        print("Image generated.")
except Exception as e:
    print(f"Failed with imagen-3.0-generate-001: {e}")

print("\nAttempting to generate image with 'imagen-2.0-generate-001'...")
try:
    response = client.models.generate_images(
        model='imagen-2.0-generate-001',
        prompt=prompt,
        config=types.GenerateImagesConfig(
            number_of_images=1,
        )
    )
    print("Success with imagen-2.0-generate-001!")
except Exception as e:
    print(f"Failed with imagen-2.0-generate-001: {e}")
