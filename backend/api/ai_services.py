import os
import logging
from google import genai
from google.genai import types
import requests
import json

logger = logging.getLogger(__name__)



class AIServiceClientV2:
    def __init__(self):
        print("DEBUG: AIServiceClientV2 Initialized - VERSION 12.0 (FORCE RELOAD UPDATE)")
        self.api_key = os.environ.get("GEMINI_API_KEY")
        if not self.api_key:
            logger.error("GEMINI_API_KEY was not found in the environment variables.")
            raise ValueError("GEMINI_API_KEY is missing.")

    def generate_content(self, prompt: str, type: str, context: str, image_base64: str = None):

        if type == 'text':
            api_key = self.api_key
            
            # List of models to try in order (Updated for 2026)
            models_to_try = [
                'gemini-2.0-flash',          # Standard stable
                'gemini-2.5-flash',          # Latest stable
                'gemini-2.0-flash-lite',     # Efficient fallback
                'gemini-2.0-flash-001',      # Specific version
                'gemini-2.5-pro',            # High intelligence
                'gemini-flash-latest',       # Generic alias
                'gemini-pro-latest'          # Generic alias
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
            image_prompt = f"featured blog post image for: {prompt}. Context: {context}. High quality, photorealistic, 16:9 aspect ratio."
            
            # List of Image Models to try (2026 Updated)
            image_models = [
                'imagen-3.0-generate-001',               # Legacy/Dedicated
                'gemini-2.0-flash-exp-image-generation', # New Experimental
                'gemini-2.5-flash-image'                 # New Stable
            ]

            last_error = None

            for model in image_models:
                try:
                    print(f"DEBUG: Trying Image Gen with model: {model}")
                    
                    is_gemini = 'gemini' in model
                    
                    if is_gemini:
                        # GEMINI STRATEGY (:generateContent)
                        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={self.api_key}"
                        payload = {
                            "contents": [{
                                "parts": [{"text": image_prompt}]
                            }],
                            "generationConfig": {
                                "response_mime_type": "image/jpeg" # Explicitly ask for image if supported
                            }
                        }
                    else:
                        # IMAGEN STRATEGY (:predict)
                        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:predict?key={self.api_key}"
                        payload = {
                            "instances": [{"prompt": image_prompt}],
                            "parameters": {"sampleCount": 1}
                        }

                    headers = {'Content-Type': 'application/json'}
                    response = requests.post(url, headers=headers, json=payload)
                    
                    if response.status_code != 200:
                        print(f"DEBUG: {model} Failed {response.status_code}: {response.text}")
                        last_error = f"{model} Error {response.status_code}"
                        continue
                        
                    result_json = response.json()
                    
                    # 1. Try Parsing IMAGEN Style
                    if 'predictions' in result_json and len(result_json['predictions']) > 0:
                        pred = result_json['predictions'][0]
                        # Imagen can return 'bytesBase64Encoded' or nested 'image.imageBytes'
                        base64_image = pred.get('bytesBase64Encoded') or pred.get('image', {}).get('imageBytes')
                        
                        if base64_image:
                            print(f"DEBUG: Success generating image with {model} (Imagen Style)")
                            return {'type': 'image', 'content': base64_image}

                    # 2. Try Parsing GEMINI Style
                    # Structure: candidates[0].content.parts[0].inlineData.data OR executableCode?
                    try:
                        candidates = result_json.get('candidates', [])
                        if candidates:
                            parts = candidates[0].get('content', {}).get('parts', [])
                            for part in parts:
                                # Start looking for image data
                                if 'inlineData' in part:
                                    base64_image = part['inlineData']['data']
                                    print(f"DEBUG: Success generating image with {model} (Gemini Style)")
                                    return {'type': 'image', 'content': base64_image}
                                    
                                # Sometimes it might return a file URI (less likely for sync call)
                    except Exception as parse_err:
                        print(f"DEBUG: Error parsing Gemini response: {parse_err}")

                    # If we got here, response was 200 OK but we couldn't find the image
                    print(f"DEBUG: {model} returned 200 but no recognizable image data found.")
                    # Log response for debugging (truncated)
                    print(str(result_json)[:200])
                    last_error = f"{model} returned empty/unknown format"
                    continue

                except Exception as e:
                    print(f"DEBUG: Exception with {model}: {e}")
                    last_error = str(e)
                    continue
            
            # --- FINAL FALLBACK: Pollinations.ai (Free, No Key required) ---
            print("DEBUG: All Google Models failed. Trying Pollinations.ai fallback...")
            try:
                import urllib.parse
                encoded_prompt = urllib.parse.quote(image_prompt[:1000]) # Limit length
                pollinations_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}"
                
                resp = requests.get(pollinations_url)
                if resp.status_code == 200:
                    import base64
                    # Convert binary content to base64
                    base64_image = base64.b64encode(resp.content).decode('utf-8')
                    print("DEBUG: Success generating image with Pollinations.ai")
                    return {'type': 'image', 'content': base64_image}
                else:
                     print(f"DEBUG: Pollinations.ai failed: {resp.status_code}")
            except Exception as e:
                print(f"DEBUG: Pollinations.ai exception: {e}")
            # -------------------------------------------------------------

            # If all failed
            logger.error(f"Image Generation Failed. Last error: {last_error}")
            raise Exception(f"Image Generation Failed: {last_error}")

        raise ValueError("Invalid request type.")