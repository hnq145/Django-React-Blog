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
            raise ValueError("Thiếu GEMINI_API_KEY.")
        
        # Khởi tạo Gemini Client
        self.client = genai.Client(api_key=api_key)

    def generate_content(self, prompt: str, type: str, context: str):
        """
        Phương thức chính để tạo ra nội dung (văn bản hoặc hình ảnh).
        
        :param prompt: Yêu cầu tùy chỉnh của người dùng (Ví dụ: Bắt lỗi, Gợi ý).
        :param type: Loại đầu ra mong muốn ('text' hoặc 'image').
        :param context: Nội dung bài viết (bối cảnh) để AI dựa vào phân tích (FR-AI-02).
        """
        
        # --- 1. Xử lý Yêu cầu Văn bản (Text-to-Text) ---
        if type == 'text':
            # Xây dựng System Instruction (Đảm bảo AI hiểu rõ bối cảnh)
            system_instruction = (
                "Bạn là Trợ lý Sáng tạo và Phân tích Nội dung cho một Blog chuyên nghiệp. "
                "Vai trò của bạn là phân tích và phản biện nội dung được cung cấp. "
                "Hãy trả lời yêu cầu của người dùng BẰNG TIẾNG VIỆT, dựa trên bối cảnh sau đây:\n\n"
                f"--- NỘI DUNG BỐI CẢNH ---\n{context}"
            )
            
            try:
                # NFR-02: Sử dụng mô hình nhanh (flash) cho độ trễ thấp
                response = self.client.models.generate_content(
                    model='gemini-2.5-flash', 
                    contents=[
                        {"role": "user", "parts": [{"text": system_instruction}]},
                        {"role": "user", "parts": [{"text": prompt}]} # Yêu cầu cụ thể của người dùng
                    ],
                    config=types.GenerateContentConfig(
                        temperature=0.7, # Cho phép sự sáng tạo (gợi ý)
                    )
                )
                return {'type': 'text', 'content': response.text}

            except Exception as e:
                logger.error(f"Lỗi gọi Gemini API (Text): {e}")
                raise Exception("Lỗi dịch vụ AI khi tạo văn bản.")

        # --- 2. Xử lý Yêu cầu Hình ảnh (Text-to-Image) ---
        elif type == 'image':
            # Kỹ thuật Prompt: Gộp bối cảnh (context) và yêu cầu (prompt) để tạo hình ảnh
            image_prompt = f"Tạo ảnh đại diện cho chủ đề blog sau: {prompt}. Bối cảnh: {context}. Phong cách: Tối giản, chuyên nghiệp, tỷ lệ 16:9."
            
            try:
                # Sử dụng mô hình Imagen cho việc tạo ảnh
                image_result = self.client.models.generate_images(
                    model='imagen-3.0-generate-001',
                    prompt=image_prompt,
                    config=types.GenerateImagesConfig(
                        number_of_images=1,
                        output_mime_type="image/jpeg",
                        aspect_ratio="16:9"
                    )
                )
                
                # Trích xuất Base64 và trả về
                if image_result.generated_images:
                    base64_image = image_result.generated_images[0].image.image_bytes
                    # Trả về chuỗi base64 đã decode (dễ xử lý hơn trong JSON)
                    return {'type': 'image', 'content': base64_image.decode('utf-8')}
                else:
                    raise Exception("Không thể tạo hình ảnh từ AI.")

            except Exception as e:
                logger.error(f"Lỗi gọi Imagen API (Image): {e}")
                raise Exception("Lỗi dịch vụ AI khi tạo hình ảnh.")

        raise ValueError("Loại yêu cầu không hợp lệ.")