import { GoogleGenAI } from '@google/genai';

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_AI_API || process.env.Google_AI_API || '';

if (!API_KEY) {
  console.warn('Google AI API Key is missing. Check your .env file.');
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export class GeminiService {
  /**
   * 사용자의 특성을 분석하여 시각적 페르소나 생성을 위한 프롬프트를 정교화합니다.
   */
  public static async synthesizePersonaPrompt(userData: any): Promise<string> {
    const systemPrompt = `
      You are an expert AI character designer. Based on the following user data, create a highly detailed visual description for an AI avatar.
      This description will be used as a prompt for a high-end image generation engine (Google Veo).
      
      User Data:
      - Name: ${userData.name}
      - Age Vibe: ${userData.ageVibe}
      - Gender: ${userData.gender}
      - Country: ${userData.countryCode}
      - Build: ${userData.bodyDescription}
      
      Requirements:
      1. Follow the v2.1 guideline: "A highly detailed, photo-realistic AI avatar..."
      2. Ensure identity consistency markers are present.
      3. Focus on trendy casual clothing and neutral studio backgrounds.
      4. Output ONLY the final prompt string.
    `;

    try {
      const result = await ai.models.generateContent({
        model: 'gemini-3-flash',
        contents: systemPrompt
      });
      return result.response.text || '';
    } catch (error) {
      console.error('Error synthesizing persona prompt:', error);
      return ''; // Fallback to basic construction logic
    }
  }

  /**
   * 광고주 자료를 분석하여 3개의 샘플 광고 스크립트를 생성합니다.
   */
  public static async generateSampleScripts(campaignData: any): Promise<string[]> {
    const prompt = `
      Create 3 distinct short-form video scripts (15-40 seconds) for the following campaign:
      
      Product Description: ${campaignData.description}
      Must-include Keywords: ${campaignData.mustIncludeKeywords.join(', ')}
      Exclude Keywords: ${campaignData.mustExcludeKeywords.join(', ')}
      Target Platform: ${campaignData.targetPlatform}
      
      Tone: Creative, engaging, and professional.
      Format the output as a JSON array of strings.
    `;

    try {
      const result = await ai.models.generateContent({
        model: 'gemini-3-flash',
        contents: prompt
      });
      const text = result.response.text || '';
      // Basic JSON extraction
      const jsonMatch = text.match(/\[.*\]/s);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : [text];
    } catch (error) {
      console.error('Error generating sample scripts:', error);
      return [];
    }
  }
}

