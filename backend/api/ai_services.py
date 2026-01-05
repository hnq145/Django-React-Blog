import os
import logging
from google import genai
from google.genai import types

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
            system_instruction = (
                "You are a helpful AI Assistant for a professional Blog. "
                "Your goal is to assist the user based on their specific request (e.g., summarize, explain, expand, translate, or critique). "
                "Always prioritize the user's instruction. "
                "Please respond in the language appropriate for the request (default to Vietnamese), using the following context if relevant:\n\n"
                f"--- CONTENT BACKGROUND ---\n{context}"
            )

            parts = [{"text": system_instruction}]
            
            if image_base64:
                import base64
                # Remove header if present (e.g., "data:image/jpeg;base64,")
                if "base64," in image_base64:
                   image_base64 = image_base64.split("base64,")[1]
                
                image_bytes = base64.b64decode(image_base64)
                parts.append({"inline_data": {"mime_type": "image/jpeg", "data": image_bytes}})

            parts.append({"text": prompt})
            
            try:
                response = self.client.models.generate_content(
                    model='gemini-1.5-flash', 
                    contents=[
                        {"role": "user", "parts": parts}
                    ],
                    config=types.GenerateContentConfig(
                        temperature=0.7, 
                    )
                )
                return {'type': 'text', 'content': response.text}

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