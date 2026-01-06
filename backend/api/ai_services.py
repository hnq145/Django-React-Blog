import os
import logging
from google import genai
from google.genai import types
import requests
import json

logger = logging.getLogger(__name__)


class AIServiceClient:
    def __init__(self):
        
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            logger.error("GEMINI_API_KEY was not found in the environment variables.")
            raise ValueError("GEMINI_API_KEY is missing.")
        
        self.client = genai.Client(api_key=api_key)

    def generate_content(self, prompt: str, type: str, context: str, image_base64: str = None):
        if type == 'text':
            api_key = os.environ.get("GEMINI_API_KEY")
            # Using raw REST API to avoid SDK version issues
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={api_key}"
            
            headers = {'Content-Type': 'application/json'}
            
            system_instruction = (
                "You are a helpful AI Assistant for a professional Blog. "
                "Your goal is to assist the user based on their specific request (e.g., summarize, explain, expand, translate, or critique). "
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
                "contents": [{
                    "parts": parts
                }],
                "generationConfig": {
                    "temperature": 0.7
                }
            }

            try:
                response = requests.post(url, headers=headers, json=payload)
                response.raise_for_status()
                
                result_json = response.json()
                # Parse response
                # Structure: candidates[0].content.parts[0].text
                try:
                    text_content = result_json['candidates'][0]['content']['parts'][0]['text']
                except (KeyError, IndexError):
                    logger.error(f"Unexpected API response structure: {result_json}")
                    # Fallback or error
                    if 'error' in result_json:
                        raise Exception(result_json['error'].get('message', 'Unknown API Error'))
                    text_content = ""

                return {'type': 'text', 'content': text_content}

            except requests.exceptions.HTTPError as http_err:
                logger.error(f"HTTP Error calling Gemini API: {http_err.response.text}")
                raise Exception(f"AI Service HTTP Error: {http_err.response.status_code} - {http_err.response.reason}")
            except Exception as e:
                logger.error(f"Error calling Gemini API (Text): {e}")
                raise Exception(f"AI service error: {str(e)}")

        elif type == 'image':
            image_prompt = f"Create a featured image for the following blog topic: {prompt}. Background: {context}. Style: Minimalist, professional, 16:9 ratio."
            
            try:
                image_result = self.client.models.generate_images(
                    model='imagen-2.0-generate-001',
                    prompt=image_prompt,
                    config=types.GenerateImagesConfig(
                        number_of_images=1,
                        output_mime_type="image/jpeg",
                        aspect_ratio="16:9"
                    )
                )
                
                if image_result.generated_images:
                    base64_image = image_result.generated_images[0].image.image_bytes
                    return {'type': 'image', 'content': base64_image.decode('utf-8')}
                else:
                    raise Exception("Cannot generate images from AI.")

            except Exception as e:
                logger.error(f"Error calling Imagen API (Image):{e}")
                raise Exception("AI service error while generating image.")

        raise ValueError("Invalid request type. Must be 'text' or 'image'.")