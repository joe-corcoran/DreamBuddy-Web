from openai import OpenAI
import os
import logging

logger = logging.getLogger(__name__)
client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))

class OpenAIService:
    @staticmethod
    def generate_interpretation(dream_content, interpretation_type):
        try:
            system_prompts = {
                'spiritual': "You are a spiritual dream interpreter. Focus on deeper meaning and personal growth.",
                'practical': "You are a practical dream interpreter. Focus on real-world applications and daily life insights.",
                'emotional': "You are an emotional dream interpreter. Focus on feelings, relationships, and emotional patterns.",
                'actionable': "You are an action-oriented dream interpreter. Focus on specific steps and changes to implement.",
                'lucid': "You are a lucid dreaming expert. Focus on dream consciousness and lucid dreaming techniques."
            }

            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompts.get(interpretation_type, system_prompts['practical'])},
                    {"role": "user", "content": f"Interpret this dream: {dream_content}"}
                ]
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"OpenAI interpretation error: {str(e)}")
            raise Exception("Failed to generate interpretation")

    @staticmethod
    def generate_dreamscape(dream_content):
        """Generate both the optimized prompt and image for a dreamscape"""
        try:
            # First, generate the optimized prompt
            prompt_response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "Create vivid, detailed, artistic image generation prompts. Focus on visual elements, style, mood, and composition."
                    },
                    {
                        "role": "user",
                        "content": f"Create an artistic image generation prompt based on this dream: {dream_content}"
                    }
                ]
            )
            optimized_prompt = prompt_response.choices[0].message.content

            # Then, generate the image
            image_response = client.images.generate(
                model="dall-e-3",
                prompt=optimized_prompt,
                n=1,
                size="1792x1024",
                quality="hd"
            )
            
            return {
                'image_url': image_response.data[0].url,
                'optimized_prompt': optimized_prompt
            }
        except Exception as e:
            logger.error(f"OpenAI dreamscape error: {str(e)}")
            raise Exception("Failed to generate dreamscape")