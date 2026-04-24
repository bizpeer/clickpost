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
  public static async getTargetedCampaigns(latitude: number, longitude: number): Promise<any[]> {
    const { data, error } = await supabase.rpc('get_nearby_campaigns', {
      user_lat: latitude,
      user_lon: longitude,
      radius_meters: 50000 // 50km
    });

    if (error) {
      console.error('Error fetching targeted campaigns:', error);
      return this.getActiveCampaigns();
    }

    return data || [];
  }

  /**
   * 미션 참여 신청 (JIT 영상 생성 시작)
   */
  public static async participateInMission(userId: string, campaignId: string): Promise<string | null> {
    try {
      // 1. 해당 캠페인의 아직 할당되지 않은 변주 하나를 선택
      const { data: variation, error: varError } = await supabase
        .from('script_variations')
        .select('variation_id, variation_text')
        .eq('is_assigned', false)
        .limit(1)
        .single();

      if (varError || !variation) {
        throw new Error('No available variations for this campaign');
      }

      // 2. MissionContents에 기록 생성
      const { data: content, error: contentError } = await supabase
        .from('mission_contents')
        .insert({
          user_id: userId,
          campaign_id: campaignId,
          variation_id: variation.variation_id,
          ai_script: variation.variation_text,
          status: 'GENERATING', // JIT 생성 시작 상태
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24시간 후 만료
        })
        .select()
        .single();

      if (contentError) throw contentError;

      // 3. 해당 변주를 할당됨으로 표시
      await supabase
        .from('script_variations')
        .update({ is_assigned: true })
        .eq('variation_id', variation.variation_id);

      // TODO: 실제 Google Veo 생성 API 호출 (Edge Function 등으로 위임 가능)
      // 여기서는 상태만 GENERATING으로 두고, 백엔드 배치나 훅에서 처리를 시뮬레이션
      
      return content.content_id;
    } catch (error) {
      console.error('Participation error:', error);
      return null;
    }
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
