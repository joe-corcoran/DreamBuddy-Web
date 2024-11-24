// frontend/src/services/openai.js

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export class OpenAIService {
  static validateApiKey() {
    if (!OPENAI_API_KEY) {
      console.error('OpenAI API key is not configured in frontend');
      throw new Error('OpenAI API key is not configured');
    }
  }

  static async generateDreamscapePrompt(dreamContent) {
    this.validateApiKey();
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "Create vivid, detailed, artistic image generation prompts. Focus on visual elements, style, mood, and composition."
            },
            {
              role: "user",
              content: `Create an artistic image generation prompt based on this dream: ${dreamContent}`
            }
          ]
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to generate prompt');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating dreamscape prompt:', error);
      throw error;
    }
  }

  static async generateDreamscapeImage(prompt) {
    this.validateApiKey();
    
    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size: "1792x1024",
          quality: "hd"
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to generate image');
      }

      const data = await response.json();
      return data.data[0].url;
    } catch (error) {
      console.error('Error generating dreamscape image:', error);
      throw error;
    }
  }
}