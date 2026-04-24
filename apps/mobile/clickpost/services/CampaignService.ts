import { supabase } from './SupabaseClient';

export interface Campaign {
  campaign_id: string;
  advertiser_id: string;
  title: string;
  description: string;
  total_budget: number;
  currency_code: string;
  video_reward: number;
  bonus_45d: number;
  target_platform: string;
  status: string;
  target_filters: any;
  provided_media_urls: string[];
  must_include_keywords: string[];
  must_exclude_keywords: string[];
  start_date: string;
  end_date: string;
  created_at: string;
}

export class CampaignService {
  /**
   * 모든 활성 캠페인을 가져옵니다.
   */
  public static async getActiveCampaigns(): Promise<Campaign[]> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching campaigns:', error);
      return [];
    }

    return data || [];
  }

  /**
   * 특정 사용자의 위치 기반으로 타겟팅된 캠페인을 가져옵니다. (LBS)
   */
  public static async getTargetedCampaigns(latitude: number, longitude: number): Promise<Campaign[]> {
    // PostGIS를 사용한 거리 계산 쿼리 (예: 50km 이내)
    // 실제 운영 환경에서는 RPC(Stored Procedure)를 호출하는 것이 성능상 유리합니다.
    const { data, error } = await supabase.rpc('get_campaigns_by_location', {
      user_lat: latitude,
      user_long: longitude,
      radius_meters: 50000 // 50km
    });

    if (error) {
      console.error('Error fetching targeted campaigns:', error);
      return this.getActiveCampaigns(); // 에러 시 기본 활성 캠페인 반환
    }

    return data || [];
  }

  /**
   * 캠페인 상세 정보를 가져옵니다.
   */
  public static async getCampaignDetail(campaignId: string): Promise<Campaign | null> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('campaign_id', campaignId)
      .single();

    if (error) {
      console.error('Error fetching campaign detail:', error);
      return null;
    }

    return data;
  }
}
