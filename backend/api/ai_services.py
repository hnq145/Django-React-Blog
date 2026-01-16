import os
import logging
from google import genai
from google.genai import types
import requests
import json

logger = logging.getLogger(__name__)


class AIServiceClientRaw:
    def __init__(self):
        print("DEBUG: AIServiceClientRaw Initialized - VERSION 8.0 (RAW REST) - IMAGEN 3.0")
        self.api_key = os.environ.get("GEMINI_API_KEY")
        if not self.api_key:
            logger.error("GEMINI_API_KEY was not found in the environment variables.")
            raise ValueError("GEMINI_API_KEY is missing.")

    def generate_content(self, prompt: str, type: str, context: str, image_base64: str = None):
        if type == 'text':
            # Existing Text Logic (Working)
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
            headers = {'Content-Type': 'application/json'}
            system_instruction = (
                "You are a helpful AI Assistant for a professional Blog. "
                "Your goal is to assist the user based on their specific request (e.g., summarize, explain, expand, translate, or critique)."
                "When translating, return ONLY the translated text without quotes or explanations, unless asked for JSON."
                "Please respond in the language appropriate for the request (default to Vietnamese), using the following context if relevant:\n\n"
                f"--- CONTENT BACKGROUND ---\n{context}"
            )
            parts = [{"text": system_instruction}]
            if image_base64:
                import base64
                if "base64," in image_base64:
                    image_base64 = image_base64.split("base64,")[1]
                parts.append({
                    "inline_data": {
                        "mime_type": "image/jpeg", 
                        "data": image_base64
                    }
                })
            parts.append({"text": prompt})
            payload = {
                "contents": [{"parts": parts}],
                "generationConfig": {"temperature": 0.7}
            }
            try:
                response = requests.post(url, headers=headers, json=payload)
                response.raise_for_status()
                result_json = response.json()
                try:
                    text_content = result_json['candidates'][0]['content']['parts'][0]['text']
                except (KeyError, IndexError):
                    text_content = ""
                return {'type': 'text', 'content': text_content}
            except Exception as e:
                logger.error(f"Error calling Gemini API (Text): {e}")
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