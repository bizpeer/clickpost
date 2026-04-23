export type Platform = 'TIKTOK' | 'INSTAGRAM' | 'YOUTUBE' | 'X';
export type CampaignStatus = 'READY' | 'ACTIVE' | 'EXHAUSTED' | 'CLOSED';
export type MissionStatus = 'SUBMITTED' | 'VERIFIED' | 'FAILED';

export interface Campaign {
  id: string;
  title: string;
  description: string;
  reward: number;
  platform: Platform;
  status: CampaignStatus;
  imageUrl: string;
  usp: string[];
  brandName: string;
  isPremium?: boolean;
}

export interface MissionSubmission {
  id: string;
  campaignId: string;
  userId: string;
  snsUrl: string;
  status: MissionStatus;
  isRetained45d: boolean;
  createdAt: string;
}
