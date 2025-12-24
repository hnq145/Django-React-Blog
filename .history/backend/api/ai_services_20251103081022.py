import os
import logging
from google import genai
from google.genai import types
from google.genai.errors import APIError

# Ensure logging is set
logger = logging.getLogger(__name__)

class AIServiceClient:
"""
Class that handles communication with the External AI Service (Gemini API).
Corresponds to the AIServiceClient class in the Class Diagram.
"""
def __init__(self):
# NFR-03: API Key must be read from environment variable
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
logger.error("GEMINI_API_KEY not found in environment variable.")
raise ValueError("GEMINI_API_KEY not configured.")

# Initialize Gemini Client
self.client = genai.Client(api_key=api_key)

# Optimal model for Summarize (NFR-02: Low Latency)
self.model_name = 'gemini-2.5-flash'

def get_summary(self, text_content: str) -> str:
"""
Call Gemini API to summarize the article content.
"""
if not text_content or len(text_content.strip()) < 50:
return "The content is too short to summarize with AI."

# Build a clear Prompt Engineering
prompt = f"""
You are a professional Article Summary assistant.
Summarize the following content into 3 to 5 sentences as concisely as possible, keeping the main idea intact.
Content to summarize:
---
{text_content}
---
"""

try:
# Call API
response = self.client.models.generate_content(
model=self.model_name,
contents=prompt,
config=types.GenerateContentConfig(
# Low temperature (0.3) to ensure objective results, not creative
temperature=0.3,
)
)

if response.candidates and response.candidates[0].content:
return response.text.strip()
else:
logger.warning(f"Gemini API did not return valid content for summary: {response}")
return "Error in response content from AI."

except APIError as e:
logger.error(f"Gemini API error: {e}")
# FR-AI-04 (Error Handling): Returns a friendly error message
return "The AI ​​service is currently unavailable. Please try again later."
except Exception as e:
logger.error(f"Unknown error when calling AI: {e}")
return "A system error occurred while processing the summary."