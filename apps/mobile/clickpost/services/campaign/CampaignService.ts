import { Campaign, MissionStatus } from './types';
import { supabase } from '../SupabaseClient';

export class CampaignService {
  /**
   * 모든 활성 캠페인을 가져옵니다. (기본 목록)
   */
  public static async getCampaigns(): Promise<Campaign[]> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching campaigns:', error);
      return [];
    }

    return (data || []).map(this.mapCampaign);
  }

  /**
   * 특정 사용자의 위치 기반으로 타겟팅된 캠페인을 가져옵니다. (LBS)
   */
  public static async getTargetedCampaigns(latitude: number, longitude: number): Promise<Campaign[]> {
    const { data, error } = await supabase.rpc('get_nearby_campaigns', {
      user_lat: latitude,
      user_lon: longitude,
      radius_meters: 50000 // 50km
    });

    if (error) {
      console.error('Error fetching targeted campaigns:', error);
      return this.getCampaigns();
    }

    return (data || []).map(this.mapCampaign);
  }

  /**
   * 특정 캠페인 상세 조회
   */
  public static async getCampaignById(id: string): Promise<Campaign | undefined> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('campaign_id', id)
      .single();

    if (error) {
      console.error('Error fetching campaign detail:', error);
      return undefined;
    }

    return this.mapCampaign(data);
  }

  /**
   * 미션 참여 신청 (JIT 영상 생성 시작)
   */
  public static async participateInMission(userId: string, campaignId: string): Promise<{ contentId: string; expiresAt: string } | null> {
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
          status: 'GENERATING',
          expires_at: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString() // 1 hour validity
        })
        .select()
        .single();

      if (contentError) throw contentError;

      // 3. 해당 변주를 할당됨으로 표시
      await supabase
        .from('script_variations')
        .update({ is_assigned: true })
        .eq('variation_id', variation.variation_id);

      // 4. JIT 영상 생성 트리거 (에지 함수 호출)
      supabase.functions.invoke('generate-video', {
        body: { content_id: content.content_id }
      }).catch(err => console.error('Failed to trigger video generation:', err));

      return {
        contentId: content.content_id,
        expiresAt: content.expires_at
      };
    } catch (error) {
      console.error('Participation error:', error);
      return null;
    }
  }

  /**
   * 미션 참여 취소 (선점 취소)
   */
  public static async cancelMission(contentId: string): Promise<boolean> {
    try {
      // 1. 미션 정보 가져오기 (variation_id 필요)
      const { data: mission, error: missionError } = await supabase
        .from('mission_contents')
        .select('variation_id, status')
        .eq('content_id', contentId)
        .single();

      if (missionError || !mission) throw new Error('Mission not found');
      
      // 이미 완료된 미션은 취소 불가
      if (mission.status === 'COMPLETED') return false;

      // 2. 변주 할당 해제
      await supabase
        .from('script_variations')
        .update({ is_assigned: false })
        .eq('variation_id', mission.variation_id);

      // 3. 미션 상태를 CANCELLED로 변경
      const { error: updateError } = await supabase
        .from('mission_contents')
        .update({ status: 'CANCELLED' })
        .eq('content_id', contentId);

      if (updateError) throw updateError;

      return true;
    } catch (error) {
      console.error('Cancel mission error:', error);
      return false;
    }
  }

  /**
   * 사용자의 현재 미션 참여 현황을 가져옵니다.
   */
  public static async getMyMissions(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('mission_contents')
      .select(`
        *,
        campaigns (title, brand_name, provided_media_urls)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching my missions:', error);
      return [];
    }

    return data || [];
  }

  /**
   * 미션 상태 변경을 실시간으로 구독합니다.
   */
  public static subscribeToMissionStatus(contentId: string, onUpdate: (payload: any) => void) {
    return supabase
      .channel(`mission-${contentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'mission_contents',
          filter: `content_id=eq.${contentId}`
        },
        (payload) => {
          onUpdate(payload.new);
        }
      )
      .subscribe();
  }

  public static async submitMission(contentId: string, snsUrl: string): Promise<{ success: boolean; message?: string; reward?: number }> {
    try {
      const { data, error } = await supabase.functions.invoke('verify-submission', {
        body: { content_id: contentId, sns_url: snsUrl }
      });

      if (error) {
        console.error('Edge Function Error:', error);
        return { success: false, message: '제출 검증에 실패했습니다. 올바른 URL인지 확인해주세요.' };
      }

      return { 
        success: true, 
        message: '미션 제출 및 검증이 완료되었습니다!', 
        reward: data.reward 
      };
    } catch (error: any) {
      console.error('Error submitting mission:', error);
      return { success: false, message: error.message || '서버 오류가 발생했습니다.' };
    }
  }

  /**
   * DB 모델을 앱에서 사용하는 Campaign 타입으로 변환
   */
  private static mapCampaign(db: any): Campaign {
    return {
      id: db.campaign_id || db.id,
      title: db.title,
      description: db.description,
      reward: db.video_reward || db.reward || 0,
      platform: db.target_platform || 'TIKTOK',
      status: db.status,
      imageUrl: db.provided_media_urls?.[0] || 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=400&auto=format&fit=crop',
      usp: db.must_include_keywords || [],
      brandName: db.brand_name || 'Advertiser',
      isPremium: db.is_premium || false,
      allowProposals: db.allow_proposals || false,
      distance: db.distance_meters,
    };
  }

  /**
   * 프리미엄 미션에 대한 역제안을 제출합니다. (Pro Influencer 전용)
   */
  public static async submitProposal(campaignId: string, userId: string, amount: number, message: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('mission_proposals')
        .insert({
          campaign_id: campaignId,
          user_id: userId,
          proposed_reward: amount,
          message: message,
          status: 'PENDING'
        });

      if (error) {
        if (error.code === '42501') {
          return { success: false, message: '프로 인플루언서 인증이 필요하거나 권한이 없습니다.' };
        }
        throw error;
      }

      return { success: true, message: '역제안이 성공적으로 제출되었습니다. 광고주의 승인을 기다려주세요.' };
    } catch (error: any) {
      console.error('Proposal error:', error);
      return { success: false, message: error.message || '제안 제출 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 사용자가 해당 캠페인에 제출한 역제안이 있는지 확인합니다.
   */
  public static async getProposal(campaignId: string, userId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('mission_proposals')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching proposal:', error);
      return null;
    }
  }
}
