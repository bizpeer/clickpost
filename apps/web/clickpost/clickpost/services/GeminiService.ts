import { GoogleGenerativeAI } from '@google/generative-ai';

// TODO: 실제 운영 환경에서는 Supabase Edge Function 등을 통해 API Key를 보호해야 합니다.
// 현재는 개발 편의를 위해 환경 변수 또는 직접 입력을 고려합니다.
const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_AI_API || '';

const genAI = new GoogleGenerativeAI(API_KEY);

export class GeminiService {
  /**
   * 광고주가 입력한 정보를 바탕으로 3가지 톤앤매너의 샘플 스크립트를 생성합니다.
   */
  public static async generateSampleScripts(campaignData: {
    description: string;
    mustIncludeKeywords: string[];
    mustExcludeKeywords: string[];
    targetPlatform: string;
  }): Promise<string[]> {
    if (!API_KEY) {
      console.warn('Gemini API Key is missing. Returning mock scripts.');
      return this.getMockScripts();
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
      You are a world-class marketing copywriter. Create 3 distinct short-form video scripts (15-40 seconds) for the following campaign:
      
      Product Description: ${campaignData.description}
      Must-include Keywords: ${campaignData.mustIncludeKeywords.join(', ')}
      Exclude Keywords: ${campaignData.mustExcludeKeywords.join(', ')}
      Target Platform: ${campaignData.targetPlatform}
      
      Requirements:
      1. Script 1: Viral & Trendy (Focus on high engagement, hooks, and TikTok-style pacing).
      2. Script 2: Professional & Trustworthy (Focus on product benefits, clear USP, and authoritative tone).
      3. Script 3: Emotional & Story-driven (Focus on user pain points and relatable scenarios).
      
      Output Format:
      Return ONLY a JSON array of 3 strings. Each string is the full script. Do not include any other text or markdown formatting.
    `;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      // JSON 추출 (Markdown 코드 블록 등 제거)
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const scripts = JSON.parse(jsonStr);
      
      return Array.isArray(scripts) ? scripts : [text];
    } catch (error) {
      console.error('Error generating sample scripts:', error);
      return this.getMockScripts();
    }
  }

  private static getMockScripts(): string[] {
    return [
      "[Viral] 와... 이거 진짜 대박인데요? 필수 키워드인 '혁신'이 돋보이는 제품입니다. 지금 바로 확인해보세요!",
      "[Professional] 저희 제품은 고객님의 생산성을 200% 향상시킵니다. 신뢰할 수 있는 기술력을 바탕으로 제작되었습니다.",
      "[Emotional] 매일 반복되는 일상 속에서 작은 변화가 필요하신가요? 당신의 마음을 위로해줄 특별한 경험을 선사합니다."
    ];
  }
}
