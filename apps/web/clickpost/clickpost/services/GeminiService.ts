import { GoogleGenAI } from '@google/genai';

// TODO: 실제 운영 환경에서는 Supabase Edge Function 등을 통해 API Key를 보호해야 합니다.
// 현재는 개발 편의를 위해 환경 변수 또는 직접 입력을 고려합니다.
const API_KEY = process.env.Google_AI_API || process.env.EXPO_PUBLIC_GOOGLE_AI_API || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

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

    try {
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

      const result = await ai.models.generateContent({
        model: 'gemini-3-flash',
        contents: prompt
      });
      
      const text = result.response.text || '';
      
      // JSON 추출 (Markdown 코드 블록 등 제거)
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const scripts = JSON.parse(jsonStr);
      
      return Array.isArray(scripts) ? scripts : [text];
    } catch (error) {
      console.error('Error generating sample scripts:', error);
      return this.getMockScripts();
    }
  }

  /**
   * 특정 톤으로 단일 스크립트를 재생성합니다.
   */
  public static async regenerateScript(params: {
    description: string;
    mustIncludeKeywords: string[];
    mustExcludeKeywords: string[];
    targetPlatform: string;
    tone: string;
  }): Promise<string> {
    if (!API_KEY) return `[${params.tone}] API 키가 없어 생성된 모의 스크립트입니다.`;

    try {
      const prompt = `
        You are a world-class marketing copywriter. Regenerate a single short-form video script (15-40 seconds) with a "${params.tone}" tone.
        
        Product Description: ${params.description}
        Must-include Keywords: ${params.mustIncludeKeywords.join(', ')}
        Exclude Keywords: ${params.mustExcludeKeywords.join(', ')}
        Target Platform: ${params.targetPlatform}
        
        Requirements:
        1. Tone: ${params.tone}
        2. Format: Return ONLY the script text. No JSON, no markdown, no quotes.
      `;

      const result = await ai.models.generateContent({
        model: 'gemini-3-flash',
        contents: prompt
      });
      
      return result.response.text || '';
    } catch (error) {
      console.error('Error regenerating script:', error);
      return `Error regenerating ${params.tone} script. Please try again.`;
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

