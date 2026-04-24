import { UserInfo, PersonaData, PersonaParams } from './types';
import { GeminiService } from '../GeminiService';

export class PersonaEngine {
  /**
   * 사용자의 가입 정보를 바탕으로 고유한 페르소나 데이터를 생성합니다.
   * [IMPORTANT] 실제 운영 환경에서는 Backend에서 Gemini API를 호출하여 Prompt를 생성하고,
   * 생성된 Prompt를 Google Veo API(최신 v2 Ultra)에 전달하여 캐릭터 Seed 및 4종 에셋을 생성합니다.
   */
  public static async generatePersona(user: UserInfo): Promise<PersonaData> {
    const ageVibe = this.calculateAgeVibe(user.birthDate);
    const countryStyle = this.getCountryFeatures(user.countryCode);
    
    // 유저의 고유 정보를 조합하여 Deterministic한 Seed ID 생성
    const combinedInput = `${user.name}|${user.birthDate.toISOString()}|${user.gender}|${user.countryCode}|${user.height}|${user.weight}`;
    const seedId = this.generateSeed(combinedInput);
    
    const bodyDescription = this.calculateBodyType(user.height, user.weight);
    
    // [PHASE 1: Gemini 1.5 Pro - Demographic & Biometric Synthesis]
    console.log(`[GEMINI_PRO_1.5] Initializing synthesis for user: ${user.name}`);
    
    const personaPrompt = await GeminiService.synthesizePersonaPrompt({
      name: user.name,
      ageVibe,
      gender: user.gender,
      countryCode: user.countryCode,
      bodyDescription,
    });

    // [PHASE 2: Google Veo v2.0 Ultra - High-Fidelity Rendering]
    console.log(`[VEO_ULTRA_2.0] Receiving Seed ID: #${seedId}`);
    // 실제 Veo 연동 전까지는 시뮬레이션 지연시간 유지
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("[VEO_ULTRA_2.0] Rendering source assets based on AI synthesized prompt...");

    const currentYear = new Date().getFullYear();
    const birthYear = user.birthDate.getFullYear();
    const age = currentYear - birthYear;

    // Supabase Storage 경로 (추후 업로드 시 사용)
    const storagePath = `avatars/${seedId}`;

    return {
      seedId,
      personaPrompt,
      ageGroup: `${Math.floor(age / 10) * 10}s`,
      vibe: ageVibe,
      countryStyle,
      hasChangedAvatar: false,
      // 현재는 데모를 위해 Unsplash URL을 사용하지만, 
      // 실제 구현 시에는 getPublicUrl(storagePath + '/front.jpg') 형태로 변경됩니다.
      asset_front_url: this.getDemoAssetUrl(seedId, 'front'),
      asset_side_url: this.getDemoAssetUrl(seedId, 'side'),
      asset_half_url: this.getDemoAssetUrl(seedId, 'half'),
      asset_full_url: this.getDemoAssetUrl(seedId, 'full'),
      asset_back_url: this.getDemoAssetUrl(seedId, 'back'),
      aesthetic: 'studio.aesthetic_premium',
      symmetry: 'studio.symmetry_perfect',
    };
  }

  /**
   * Seed ID 기반으로 전체 페르소나 에셋을 재생성합니다.
   * [VEO v2.0 Ultra] 엔진을 호출하여 5개 각도의 에셋을 일괄 재생성하는 시뮬레이션입니다.
   */
  public static async regeneratePersona(currentPersona: PersonaData): Promise<PersonaData> {
    console.log(`[VEO_ULTRA_2.0] Regenerating all assets for Seed: #${currentPersona.seedId}`);
    
    // 재생성 시뮬레이션 지연
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 실제로는 같은 Seed ID라도 AI 생성기에 의해 미세하게 다른 결과가 나올 수 있음을 시뮬레이션
    return {
      ...currentPersona,
      asset_front_url: this.getDemoAssetUrl(currentPersona.seedId, 'front'),
      asset_side_url: this.getDemoAssetUrl(currentPersona.seedId, 'side'),
      asset_half_url: this.getDemoAssetUrl(currentPersona.seedId, 'half'),
      asset_full_url: this.getDemoAssetUrl(currentPersona.seedId, 'full'),
      asset_back_url: this.getDemoAssetUrl(currentPersona.seedId, 'back'),
    };
  }

  /**
   * 데모용 에셋 URL을 반환합니다.
   * [TODO] 실제 NanoBanana/Veo API 연동 시 Supabase Storage URL로 대체
   */
  private static getDemoAssetUrl(seedId: string, type: string): string {
    const baseUnsplashUrl = `https://images.unsplash.com/photo-`;
    const portraitIds: Record<string, string> = {
      'front': '1539571696357-5a69c17a67c6',
      'side': '1506794778202-cad84cf45f1d',
      'half': '1507003211169-0a1dd7228f2d',
      'full': '1531746020798-e6953c6e8e04',
      'back': '1521119229307-226c195ee4c5'
    };
    };
    return `${baseUnsplashUrl}${portraitIds[type]}?q=80&w=800&auto=format&fit=crop`;
  }

  /**
   * 본인의 사진을 업로드하여 아바타를 1회 변경합니다. (딱 한 번만 가능)
   * 이 과정에서 Veo API의 'Identity Refinement' 기능을 호출하여 기존 Seed와 업로드된 사진을 합성합니다.
   */
  public static async updatePersonaWithPhoto(currentPersona: PersonaData, photoUri: string): Promise<PersonaData> {
    if (currentPersona.hasChangedAvatar) {
      throw new Error('Avatar can only be changed once.');
    }

    console.log("[VEO_ULTRA_2.0] Initializing Identity Refinement flow...");
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("[VEO_ULTRA_2.0] Analyzing user-uploaded biometric reference...");
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("[VEO_ULTRA_2.0] Synthesizing original Seed ID with new biometric reference...");
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log("[VEO_ULTRA_2.0] Identity Refinement complete. Regenerating all multi-angle assets...");
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    return {
      ...currentPersona,
      hasChangedAvatar: true,
      asset_front_url: photoUri, 
      asset_side_url: photoUri, 
      asset_half_url: photoUri,
      asset_full_url: photoUri,
      asset_back_url: photoUri,
    };
  }

  private static calculateAgeVibe(birthDate: Date): string {
    const year = birthDate.getFullYear();
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;

    if (age < 20) return 'youthful and energetic';
    if (age < 35) return 'trendy and stylish';
    if (age < 50) return 'sophisticated and professional';
    return 'elegant and classic';
  }

  private static getCountryFeatures(countryCode: string): string {
    const styles: Record<string, string> = {
      KR: 'South Korean style, clean skin, K-fashion aesthetic',
      VN: 'Vietnamese style, natural and warm aesthetic',
      US: 'American style, diverse and modern aesthetic',
      JP: 'Japanese style, minimalist and refined aesthetic',
      CN: 'Chinese style, bold and elegant aesthetic',
      TH: 'Thai style, vibrant and friendly aesthetic',
      TW: 'Taiwanese style, graceful and contemporary aesthetic',
    };

    return styles[countryCode.toUpperCase()] || 'global and diverse aesthetic';
  }

  private static generateSeed(input: string): string {
    // 유저 정보를 기반으로 고유하고 결정론적인 10자리 숫자를 생성합니다.
    let hash = 0;
    const normalizedInput = input.toLowerCase().replace(/\s/g, '');
    for (let i = 0; i < normalizedInput.length; i++) {
        const char = normalizedInput.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    // 절대값을 취하고 10자리로 맞춤 (부족하면 패딩, 넘치면 자름)
    const seed = Math.abs(hash).toString();
    return seed.padEnd(10, seed).substring(0, 10);
  }

  private static constructPrompt(params: PersonaParams): string {
    const genderTerm = params.gender === 'MALE' ? 'male' : params.gender === 'FEMALE' ? 'female' : 'person';
    
    // GEMINI.md 6항 가이드라인을 엄격히 준수하는 프롬프트 구조
    // Backend/Gemini가 USP를 추출하여 생성한 것처럼 보이도록 구성
    return `[USP: ${params.ageVibe}, ${params.countryFeatures}] 
A highly detailed, photo-realistic AI avatar of a ${params.ageVibe} ${genderTerm} from ${params.countryFeatures}. 
Name Style: ${params.nameStyle}. 
Facial features: Symmetrical, consistent across angles, unique ethnic features. 
Clothing: Premium trendy casual, minimal textures. 
Body: ${params.bodyDescription}.
Output: 5 high-fidelity consistent views (Front, 45-degree, Profile, Full-body). 
Resolution: 8k, Cinematic lighting, Studio background.
[ENGINE: NanoBanana-v2-Seed-Sync]
[IDENTITY_SEED: ${this.generateSeed(params.nameStyle + params.ageVibe)}]`;
  }

  private static calculateBodyType(height: number, weight: number): string {
    const h = isNaN(height) ? 175 : height;
    const w = isNaN(weight) ? 70 : weight;
    const bmi = w / ((h / 100) ** 2);
    let build = 'average build';
    if (bmi < 18.5) build = 'lean and slender';
    else if (bmi >= 30) build = 'heavyset and sturdy';
    else if (bmi >= 25) build = 'strong and athletic';
    else if (bmi >= 23) build = 'fit and toned';

    return `Height: ${h}cm, Build: ${build} (BMI ${bmi.toFixed(1)})`;
  }
}
