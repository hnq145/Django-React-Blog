import os
import logging
from google import genai
from google.genai import types
import requests
import json

logger = logging.getLogger(__name__)



class AIServiceClientFixed:
    def __init__(self):
        print("DEBUG: AIServiceClientFixed Initialized - VERSION 10.0 (RENAMED CLASS) - SDK ONLY")
        self.api_key = os.environ.get("GEMINI_API_KEY")
        if not self.api_key:
            logger.error("GEMINI_API_KEY was not found in the environment variables.")
            raise ValueError("GEMINI_API_KEY is missing.")

    def generate_content(self, prompt: str, type: str, context: str, image_base64: str = None):

        if type == 'text':
            api_key = self.api_key
            
            # List of models to try in order
            models_to_try = [
                'gemini-2.0-flash-exp', 
                'gemini-1.5-flash',
                'gemini-1.5-flash-latest',
                'gemini-1.5-flash-001',
                'gemini-1.5-flash-002',
                'gemini-1.5-flash-8b',
                'gemini-exp-1206',
                'gemini-exp-1121',
                'gemini-1.5-pro',
                'gemini-pro',
                'gemini-1.0-pro'
            ]

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
            
            headers = {'Content-Type': 'application/json'}
            last_error = None

            for model in models_to_try:
                try:
                    print(f"DEBUG: Trying REST API with model: {model}")
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
                    
                    response = requests.post(url, headers=headers, json=payload)
                    
                    if response.status_code == 200:
                        result_json = response.json()
                        try:
                            text_content = result_json['candidates'][0]['content']['parts'][0]['text']
                            print(f"DEBUG: Success with model {model}!")
                            return {'type': 'text', 'content': text_content}
                        except (KeyError, IndexError):
                            print(f"DEBUG: Model {model} returned malformed response.")
                            continue
                            
                    elif response.status_code == 429:
                        print(f"DEBUG: Model {model} Quota Exceeded (429).")
                        last_error = f"Quota Exceeded on {model}"
                        continue # Try next model
                        
                    elif response.status_code == 404:
                         print(f"DEBUG: Model {model} Not Found (404).")
                         continue # Try next model
                    
                    else:
                        print(f"DEBUG: Model {model} Error {response.status_code}: {response.text}")
                        last_error = f"Error {response.status_code} on {model}"
                        continue

                except Exception as e:
                    print(f"DEBUG: Exception with {model}: {e}")
                    last_error = str(e)
                    continue

            # If we get here, all models failed
            logger.error(f"All AI models failed. Last error: {last_error}")
            raise Exception(f"AI Service Unavailable: All models failed. Last error: {last_error}")

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