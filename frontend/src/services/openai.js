// src/services/openai.js
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
export class OpenAIService {
  static async generateInterpretation(content, type) {
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
              content: "You are a skilled dream interpreter providing insightful analysis."
            },
            {
              role: "user",
              content: `${this.getPromptForType(type)}\n\n${content}`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('OpenAI API request failed');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  static getPromptForType(type) {
    const prompts = {
      spiritual: "Analyze this dream spiritually, focusing on deeper meaning and growth:",
      practical: "Provide practical insights applicable to daily life:",
      emotional: "Examine emotional themes and patterns:",
      actionable: "Suggest specific actions or changes:",
      lucid: "Provide insights for lucid dreaming development:"
    };
    return prompts[type] || prompts.practical;
  }
}