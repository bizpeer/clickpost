export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface UserInfo {
  name: string;
  birthDate: Date;
  gender: Gender;
  countryCode: string; // ISO-2 (e.g., 'KR', 'VN', 'US')
}

export interface PersonaData {
  seedId: string;
  personaPrompt: string;
  ageGroup: string;
  vibe: string;
  countryStyle: string;
}

export interface PersonaParams {
  name: string;
  gender: Gender;
  ageVibe: string;
  countryFeatures: string;
  nameStyle: string;
}
