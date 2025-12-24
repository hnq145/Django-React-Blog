import os
import logging
from google import genai
from google.genai import types
from google.genai.errors import APIError

logger = logging.getLogger(__name__)

class AIServiceClient:
    def __init__(self):
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            logger.error("GEMINI_API_KEY was not found in the environment variables.")
            raise ValueError("GEMINI_API_KEY is not configured.")
        
        self.client = genai.Client(api_key=api_key)
        
        self.model_name = 'gemini-2.5-flash'

    def get_summary(self, text_content: str) -> str:
        if not text_content or len(text_content.strip()) < 50:
            return "Content too short to summarize by AI."

        prompt = f"""
        You are a professional Article Summary assistant.
        Summarize the following content into 3 to 5 concise sentences, keeping the main idea intact.
        ---
        Content to summarize:
        ---
        {text_content}
        ---
        """
        
        try:
            # Gọi API
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.3, 
                )
            )
            
            if response.candidates and response.candidates[0].content:
                return response.text.strip()
            else:
                logger.warning(f"Gemini API does not return valid content for summary: {response}")
                return "Error in response content from AI."

        except APIError as e:
            logger.error(f"Gemini API Error: {e}")
            # FR-AI-04 (Xử lý lỗi): Trả về thông báo lỗi thân thiện
            return "Dịch vụ AI hiện không khả dụng. Vui lòng thử lại sau."
        except Exception as e:
            logger.error(f"Lỗi không xác định khi gọi AI: {e}")
            return "Đã xảy ra lỗi hệ thống khi xử lý tóm tắt."
