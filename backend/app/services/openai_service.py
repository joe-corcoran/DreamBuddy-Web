from openai import OpenAI
import os
import logging
from tenacity import retry, stop_after_attempt, wait_exponential

logger = logging.getLogger(__name__)
client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))

class OpenAIService:
    @staticmethod
    def get_interpretation_prompt(interpretation_type):
        prompts = {
            'spiritual': "Analyze these dreams from a spiritual perspective, focusing on deeper meaning, symbolism, and personal growth. Consider archetypal patterns and potential messages from the subconscious:",
            'practical': "Provide practical insights and real-world applications from these dreams. Focus on how they relate to current life situations and potential actions:",
            'emotional': "Examine the emotional themes and patterns in these dreams. Consider the feelings present, their significance, and what they might reveal about emotional state:",
            'actionable': "Suggest specific actions, changes, or adjustments based on these dreams. Provide concrete steps that could be taken in waking life:",
            'lucid': "Analyze these dreams from a lucid dreaming perspective. Identify dream signs, potential triggers, and techniques for increasing dream awareness:"
        }
        return prompts.get(interpretation_type, prompts['practical'])

    @staticmethod
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=4, max=10),
        reraise=True
    )
    def generate_interpretation(dream_content, interpretation_type):
        """Generate dream interpretation based on type"""
        try:
            system_prompt = OpenAIService.get_interpretation_prompt(interpretation_type)
            
            response = client.chat.completions.create(
                model="gpt-4-1106-preview",
                messages=[
                    {
                        "role": "system",
                        "content": system_prompt
                    },
                    {
                        "role": "user",
                        "content": f"Here are the dreams to analyze:\n\n{dream_content}"
                    }
                ],
                temperature=0.7,
                max_tokens=1000,
                timeout=30
            )
            
            return response.choices[0].message.content

        except Exception as e:
            logger.error(f"OpenAI interpretation error: {str(e)}")
            raise Exception(f"Failed to generate interpretation: {str(e)}")

    @staticmethod
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=4, max=10),
        reraise=True
    )
    def generate_dreamscape(dream_content):
        """Generate both the optimized prompt and image for a dreamscape"""
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
                timeout=30
            )
            
            optimized_prompt = prompt_response.choices[0].message.content

            # Generate the image with a longer timeout
            image_response = client.images.generate(
                model="dall-e-3",
                prompt=optimized_prompt[:1000],
                n=1,
                size="1792x1024",
                quality="hd",
                timeout=60
            )
            
            return {
                'image_url': image_response.data[0].url,
                'optimized_prompt': optimized_prompt
            }

        except Exception as e:
            logger.error(f"OpenAI dreamscape error: {str(e)}")
            raise Exception(f"Failed to generate dreamscape: {str(e)}")