# backend/app/services/openai_service.py
from openai import OpenAI
import os
import logging
from tenacity import retry, stop_after_attempt, wait_exponential
from app.models import UserProfile, DreamEntity, UserAppearance, RecurringCharacter  # Add these imports

logger = logging.getLogger(__name__)
client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))

class OpenAIService:
    @staticmethod
    def _get_appearance_context(user_id):
        """Get detailed appearance context for the user and recurring characters"""
        context = ""
        
        # Get user appearance
        appearance = UserAppearance.query.filter_by(user_id=user_id).first()
        if appearance:
            context += (
                f"Physical appearance of dreamer: A {appearance.age_range} year old "
                f"{appearance.gender} of {appearance.height_range} height with a {appearance.build} build. "
                f"Has {appearance.hair_style} {appearance.hair_color} hair, {appearance.eye_color} eyes, "
                f"and {appearance.skin_tone} skin tone"
            )
            if appearance.facial_hair and appearance.facial_hair != 'none':
                context += f" with {appearance.facial_hair}"
            context += ".\n"

        # Get recurring characters
        characters = RecurringCharacter.query.filter_by(user_id=user_id).all()
        if characters:
            context += "\nRecurring characters in dreams:\n"
            for char in characters:
                context += (
                    f"- {char.name} ({char.relationship}): A {char.age_range} {char.gender} "
                    f"of {char.height_range} height with a {char.build} build. "
                    f"Has {char.hair_style} {char.hair_color} hair, {char.eye_color} eyes, "
                    f"and {char.skin_tone} skin tone"
                )
                if char.facial_hair and char.facial_hair != 'none':
                    context += f" with {char.facial_hair}"
                context += ".\n"

        return context.strip()

    @staticmethod
    def _get_user_context(user_id):
        """Get user profile and dream entities context"""
        context = ""
        
        # Get user profile
        profile = UserProfile.query.filter_by(user_id=user_id).first()
        if profile:
            context += f"Dreamer context: {profile.birth_year} year old {profile.occupation}"
            if profile.cultural_background:
                context += f" with {profile.cultural_background} background"
            context += ".\n"
            
            if profile.dream_goals:
                context += f"Dream goals: {profile.dream_goals}.\n"
            
            if profile.significant_life_events:
                context += f"Significant life events: {profile.significant_life_events}.\n"
                
            if profile.recurring_themes:
                context += f"Common dream themes: {profile.recurring_themes}.\n"
        
        # Get frequent dream entities
        entities = DreamEntity.query.filter_by(user_id=user_id)\
            .order_by(DreamEntity.frequency.desc())\
            .limit(5)\
            .all()
            
        if entities:
            context += "\nRecurring elements in dreams:\n"
            for entity in entities:
                context += f"- {entity.name} ({entity.entity_type})"
                if entity.personal_significance:
                    context += f": {entity.personal_significance}"
                context += f" (appeared {entity.frequency} times)\n"
        
        return context.strip()

    @staticmethod
    def get_interpretation_prompt(interpretation_type):
        prompts = {
            'spiritual': "Analyze these dreams from a spiritual perspective, focusing on deeper meaning, symbolism, and personal growth. Consider archetypal patterns, messages from the subconscious, and the dreamer's personal context:",
            'practical': "Provide practical insights and real-world applications from these dreams. Focus on how they relate to current life situations and potential actions, considering the dreamer's personal circumstances:",
            'emotional': "Examine the emotional themes and patterns in these dreams. Consider the feelings present, their significance, and what they might reveal about emotional state, taking into account the dreamer's life context:",
            'actionable': "Suggest specific actions, changes, or adjustments based on these dreams. Provide concrete steps that could be taken in waking life, considering the dreamer's goals and circumstances:",
            'lucid': "Analyze these dreams from a lucid dreaming perspective. Identify dream signs, potential triggers, and techniques for increasing dream awareness, tailored to the dreamer's experience:",
            'religious': """Analyze this dream and find relevant religious/spiritual wisdom, considering the dreamer's background. Structure as follows:

**Selected Verse/Passage**: [Quote specific verse/passage with source]

**Dream Connection**: [Explain connection to dream content and themes]

**Spiritual Insight**: [Provide wisdom derived from this connection]

**Personal Application**: [Suggest how this wisdom applies to the dreamer's life]"""
        }
        return prompts.get(interpretation_type, prompts['practical'])

    @staticmethod
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=4, max=10),
        reraise=True
    )
    def generate_interpretation(dream_content, interpretation_type, user_id):
        """Generate dream interpretation based on type and user context"""
        try:
            system_prompt = OpenAIService.get_interpretation_prompt(interpretation_type)
            user_context = OpenAIService._get_user_context(user_id)
            
            messages = [
                {
                    "role": "system",
                    "content": system_prompt
                }
            ]
            
            if user_context:
                messages.append({
                    "role": "user",
                    "content": f"Dreamer's personal context:\n{user_context}"
                })
            
            messages.append({
                "role": "user",
                "content": f"Dream content to analyze:\n{dream_content}"
            })
            
            response = client.chat.completions.create(
                model="gpt-4-1106-preview",
                messages=messages,
                temperature=0.7,
                max_tokens=1000,
                timeout=30
            )
            
            return response.choices[0].message.content

        except Exception as e:
            logger.error(f"OpenAI interpretation error: {str(e)}")
            raise Exception(f"Failed to generate interpretation: {str(e)}")

    @staticmethod
    def generate_dreamscape(dream_content, user_id):
        """Generate both the optimized prompt and image for a dreamscape"""
        try:
            # Get both profile and appearance context
            user_context = OpenAIService._get_user_context(user_id)
            appearance_context = OpenAIService._get_appearance_context(user_id)
            
            # Generate the optimized prompt
            prompt_messages = [
                {
                    "role": "system",
                    "content": """Create vivid, artistic image generation prompts. 
                    You MUST maintain exact physical appearance accuracy for any people 
                    depicted in the scene. Pay careful attention to gender, age, height, 
                    build, hair, eyes, and skin tone as specified."""
                }
            ]
            
            if appearance_context:
                prompt_messages.append({
                    "role": "user",
                    "content": f"IMPORTANT - Physical appearances to match exactly:\n{appearance_context}"
                })

            if user_context:
                prompt_messages.append({
                    "role": "user",
                    "content": f"Additional context about the dreamer:\n{user_context}"
                })
            
            prompt_messages.append({
                "role": "user",
                "content": f"Create an artistic image prompt based on this dream, ensuring any people depicted EXACTLY match their physical descriptions above:\n{dream_content}"
            })
            
            prompt_response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=prompt_messages,
                temperature=0.7,
                timeout=30
            )
            
            optimized_prompt = prompt_response.choices[0].message.content
            
            # Add appearance reinforcement directly to DALL-E prompt
            if appearance_context:
                optimized_prompt = (
                    f"IMPORTANT - Maintain exact physical accuracy: {appearance_context}\n\n"
                    f"{optimized_prompt}"
                )

            # Generate the image
            image_response = client.images.generate(
                model="dall-e-3",
                prompt=optimized_prompt[:1000],
                n=1,
                size="1792x1024",
                quality="hd",
                style="vivid",
                timeout=60
            )
            
            return {
                'image_url': image_response.data[0].url,
                'optimized_prompt': optimized_prompt
            }

        except Exception as e:
            logger.error(f"OpenAI error: {str(e)}")
            raise