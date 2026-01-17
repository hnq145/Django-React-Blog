import os
import logging
from google import genai
from google.genai import types
import requests
import json

logger = logging.getLogger(__name__)


class AIServiceClientNew:
    def __init__(self):
        print("DEBUG: AIServiceClientNew Initialized - VERSION 9.0 (SDK FIXED) - REFRESHED")
        self.api_key = os.environ.get("GEMINI_API_KEY")
        if not self.api_key:
            logger.error("GEMINI_API_KEY was not found in the environment variables.")
            raise ValueError("GEMINI_API_KEY is missing.")

    def generate_content(self, prompt: str, type: str, context: str, image_base64: str = None):
        if type == 'text':
            try:
                client = genai.Client(api_key=self.api_key)
                
                system_instruction = (
                    "You are a helpful AI Assistant for a professional Blog. "
                    "Your goal is to assist the user based on their specific request (e.g., summarize, explain, expand, translate, or critique)."
                    "When translating, return ONLY the translated text without quotes or explanations, unless asked for JSON."
                    "Please respond in the language appropriate for the request (default to Vietnamese), using the following context if relevant:\n\n"
                    f"--- CONTENT BACKGROUND ---\n{context}"
                )

                contents_parts = []
                
                if image_base64:
                    import base64
                    if "base64," in image_base64:
                        image_data = image_base64.split("base64,")[1]
                    else:
                        image_data = image_base64
                        
                    contents_parts.append(types.Part.from_bytes(
                        data=base64.b64decode(image_data),
                        mime_type="image/jpeg"
                    ))

                contents_parts.append(types.Part.from_text(text=prompt))

                response = client.models.generate_content(
                    model='gemini-1.5-flash',
                    contents=[types.Content(parts=contents_parts, role="user")],
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        temperature=0.7
                    )
                )
                
                return {'type': 'text', 'content': response.text}

            except Exception as e:
                logger.error(f"Error calling Gemini API (Text SDK): {e}")
                # Fallback or detailed error logging
                if "404" in str(e):
                     logger.error("Model not found. Please check if 'gemini-1.5-flash' is enabled in your Google Cloud Project.")
                raise Exception(f"AI service error: {str(e)}")

        elif type == 'image':
            image_prompt = f"Create a featured image for the following blog topic: {prompt}. Background: {context}. Style: Minimalist, professional, 16:9 ratio."
            
            # Using RAW REST API for Imagen 3.0 to allow explicit URL control
            url = f"https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key={self.api_key}"
            headers = {'Content-Type': 'application/json'}
            payload = {
                "instances": [
                    {
                        "prompt": image_prompt
                    }
                ],
                "parameters": {
                    "sampleCount": 1,
                    # "aspectRatio": "16:9" # Note: aspect ratio param might vary by exact model version, keeping simple for now
                }
            }

            print(f"DEBUG: Calling Image API URL: {url.replace(self.api_key, 'HIDDEN_KEY')}")
            
            try:
                response = requests.post(url, headers=headers, json=payload)
                # Check for 400/500 errors manually to log body
                if response.status_code != 200:
                    logger.error(f"Image API Failed: {response.status_code} - {response.text}")
                    raise Exception(f"Image API Failed: {response.status_code} - {response.text}")

                result_json = response.json()
                # Parse predictions (base64)
                # Structure: { "predictions": [ { "bytesBase64Encoded": "..." } ] }
                if 'predictions' in result_json and len(result_json['predictions']) > 0:
                     base64_image = result_json['predictions'][0].get('bytesBase64Encoded', '')
                     if not base64_image:
                         # Try 'mimeType' and 'bytesBase64Encoded' structure if different
                         base64_image = result_json['predictions'][0].get('image', {}).get('imageBytes', '')
                     
                     if base64_image:
                        return {'type': 'image', 'content': base64_image}
                
                raise Exception("No image data found in response.")

            except Exception as e:
                logger.error(f"Error calling Imagen API (Image REST): {e}")
                raise Exception(f"Image Generation Failed: {str(e)}")

        raise ValueError("Invalid request type.")
