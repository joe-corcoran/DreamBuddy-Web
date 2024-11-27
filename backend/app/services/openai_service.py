from openai import OpenAI
import os
import logging
from tenacity import retry, stop_after_attempt, wait_exponential

logger = logging.getLogger(__name__)
client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))

class OpenAIService:
    @staticmethod
    def generate_dreamscape(dream_content):
        """Generate both the optimized prompt and image for a dreamscape"""
        
        @retry(
            stop=stop_after_attempt(3),
            wait=wait_exponential(multiplier=1, min=4, max=10),
            reraise=True
        )
        def _generate_with_retry():
            try:
                # Generate the optimized prompt
                prompt_response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {
                            "role": "system",
                            "content": "Create vivid, detailed, artistic image generation prompts. Focus on visual elements, style, mood, and composition. Keep prompts under 800 characters."
                        },
                        {
                            "role": "user",
                            "content": f"Create an artistic image generation prompt based on this dream: {dream_content}"
                        }
                    ],
                    timeout=30  # 30 second timeout
                )
                
                optimized_prompt = prompt_response.choices[0].message.content

                # Generate the image with a longer timeout
                image_response = client.images.generate(
                    model="dall-e-3",
                    prompt=optimized_prompt[:1000],  # Limit prompt length
                    n=1,
                    size="1792x1024",
                    quality="hd",
                    timeout=60  # 60 second timeout
                )
                
                return {
                    'image_url': image_response.data[0].url,
                    'optimized_prompt': optimized_prompt
                }

            except Exception as e:
                logger.error(f"OpenAI dreamscape error: {str(e)}")
                raise Exception(f"Failed to generate dreamscape: {str(e)}")

        return _generate_with_retry()