import { UserInfo, PersonaData, PersonaParams } from './types';

export class PersonaEngine {
  /**
   * 사용자의 가입 정보를 바탕으로 고유한 페르소나 데이터를 생성합니다.
   */
  public static generatePersona(user: UserInfo): PersonaData {
    const ageVibe = this.calculateAgeVibe(user.birthDate);
    const countryStyle = this.getCountryFeatures(user.countryCode);
    const nameStyle = user.name; // 이름 기반 스타일 (향후 확장 가능)
    
    // 일관된 생성을 위한 입력값 조합
    const combinedInput = `${user.name}|${user.birthDate.toISOString()}|${user.gender}|${user.countryCode}`;
    const seedId = this.generateSeed(combinedInput);
    
    const personaPrompt = this.constructPrompt({
      name: user.name,
      gender: user.gender,
      ageVibe,
      countryFeatures: countryStyle,
      nameStyle,
    });

    const currentYear = new Date().getFullYear();
    const birthYear = user.birthDate.getFullYear();
    const age = currentYear - birthYear;

    return {
      seedId,
      personaPrompt,
      ageGroup: `${Math.floor(age / 10) * 10}s`,
      vibe: ageVibe,
      countryStyle,
    };
  }

  /**
   * 생년월일을 기반으로 나이대별 분위기(Vibe)를 결정합니다.
   */
  private static calculateAgeVibe(birthDate: Date): string {
    const year = birthDate.getFullYear();
    
    if (year >= 2015) return 'youthful and adorable child-like';
    if (year >= 2000) return 'trendy and vibrant Gen Z';
    if (year >= 1985) return 'confident and energetic Millennial';
    if (year >= 1970) return 'mature and professional';
    return 'wise and classic';
  }

  /**
   * 국가 코드를 기반으로 인종적/문화적 특징을 반환합니다.
   */
  private static getCountryFeatures(countryCode: string): string {
    const styles: Record<string, string> = {
      KR: 'South Korean, clean and stylish East Asian features',
      VN: 'Vietnamese, gentle and warm Southeast Asian features',
      US: 'American, diverse and expressive features',
      JP: 'Japanese, refined and minimalist East Asian features',
      CN: 'Chinese, elegant and traditional East Asian features',
      TH: 'Thai, vibrant and friendly Southeast Asian features',
    };

    return styles[countryCode.toUpperCase()] || 'global, harmoniously diverse features';
  }

  /**
   * 입력 문자열을 바탕으로 10자리 고유 숫자 시드를 생성합니다.
   * (Java String.hashCode() 방식의 구현)
   */
  private static generateSeed(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // 32bit integer로 변환
    }
    // 절대값으로 만들고 10자리 문자열로 반환
    return Math.abs(hash).toString().padStart(10, '0');
  }

  /**
   * gemini.md 템플릿에 따라 최종 AI 프롬프트를 구성합니다.
   */
  private static constructPrompt(params: PersonaParams): string {
    const genderTerm = params.gender === 'MALE' ? 'male' : params.gender === 'FEMALE' ? 'female' : 'person';
    
    return `A highly detailed, photo-realistic AI avatar of a ${params.ageVibe} ${genderTerm} from ${params.countryFeatures}. ` +
           `Name: ${params.nameStyle}. Facial features: Consistent and unique. Clothing: Trendy casual. ` +
           `Generate 5 consistent views: 1. Full-face front view, 2. Half-side view (45 degrees left/right), 3. Profile view (90 degrees), 4. Full-body shot. ` +
           `High resolution, 8k, cinematic lighting, neutral background for easy compositing.`;
  }
}
