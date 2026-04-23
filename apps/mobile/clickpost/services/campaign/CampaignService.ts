import { Campaign, MissionStatus } from './types';

export class CampaignService {
  private static MOCK_CAMPAIGNS: Campaign[] = [
    {
      id: 'c1',
      title: 'NeonCore Vanguard Launch',
      description: 'We are seeking forward-thinking creators to spearhead the digital launch of the NeonCore collection.',
      reward: 850000,
      platform: 'TIKTOK',
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1000&auto=format&fit=crop',
      usp: ['Future Aesthetics', 'Cyberpunk Accent', 'High Performance'],
      brandName: 'NeonCore',
      isPremium: true,
    },
    {
      id: 'c2',
      title: 'Artisan Coffee Subscription',
      description: 'Review our premium single-origin coffee subscription and share the brewing experience.',
      reward: 45000,
      platform: 'INSTAGRAM',
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1000&auto=format&fit=crop',
      usp: ['Single Origin', 'Eco-friendly Packaging', 'Rich Flavor'],
      brandName: 'BeanRoute',
    },
    {
      id: 'c3',
      title: 'Minimalist Tech Accessories',
      description: 'Showcase how our accessories integrate into your desk setup for a clean, productive look.',
      reward: 1200000,
      platform: 'YOUTUBE',
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1000&auto=format&fit=crop',
      usp: ['Sleek Design', 'Magnetic Integration', 'Premium Materials'],
      brandName: 'DeskFlow',
      isPremium: true,
    },
    {
      id: 'c4',
      title: 'Global Nomad Backpack',
      description: 'The ultimate travel companion for digital nomads. Lightweight, durable, and secure.',
      reward: 150000,
      platform: 'INSTAGRAM',
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop',
      usp: ['Waterproof', 'Anti-theft Zip', 'Built-in USB Port'],
      brandName: 'NomadGear',
    },
  ];

  public static async getCampaigns(): Promise<Campaign[]> {
    // 실시간 API 호출 대신 Mock 데이터 반환 (Phase 1)
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.MOCK_CAMPAIGNS), 500);
    });
  }

  public static async getCampaignById(id: string): Promise<Campaign | undefined> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.MOCK_CAMPAIGNS.find(c => c.id === id));
      }, 300);
    });
  }

  public static async submitMission(campaignId: string, snsUrl: string): Promise<boolean> {
    console.log(`Submitting mission for ${campaignId}: ${snsUrl}`);
    return true;
  }
}
