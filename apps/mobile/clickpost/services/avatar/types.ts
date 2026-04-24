export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  birthDate: Date;
  gender: Gender;
  countryCode: string; // ISO-2 (e.g., 'KR', 'VN', 'US')
  height: number;
  weight: number;
  preferredPayment: string;
  paymentAccountInfo: string;
  followerCount?: number;
  isProVerified?: boolean;
}

export interface PersonaData {
  seedId: string;
  personaPrompt: string;
  ageGroup: string;
  vibe: string;
  countryStyle: string;
  hasChangedAvatar: boolean;
  asset_front_url: string;
  asset_side_url: string;
  asset_half_url: string;
  asset_full_url: string;
  aesthetic: string;
  symmetry: string;
}

export interface PersonaParams {
  name: string;
  gender: Gender;
  ageVibe: string;
  countryFeatures: string;
  nameStyle: string;
  bodyDescription: string;
}
