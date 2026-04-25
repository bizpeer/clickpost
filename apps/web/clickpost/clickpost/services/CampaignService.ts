import { supabase } from './SupabaseClient';

export interface CampaignData {
  title: string;
  description: string;
  purpose?: 'AWARENESS' | 'CONVERSION' | 'POLITICAL';
  startDate?: string;
  endDate?: string;
  totalBudget: number;
  currencyCode: string;
  targetFilters: {
    minAge: number;
    maxAge: number;
    gender: 'all' | 'male' | 'female';
    locationName: string;
    lat?: number;
    lon?: number;
    isGlobal?: boolean;
  };
  mustIncludeKeywords: string[];
  mustExcludeKeywords: string[];
  targetPlatform: string;
  providedMediaUrls: string[];
  isPremium?: boolean;
  allowProposals?: boolean;
}

export class CampaignService {
  /**
   * 새로운 캠페인을 생성하고 초기 상태(DRAFT)로 저장합니다.
   */
  public static async createCampaign(advertiserId: string, data: CampaignData) {
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert({
        advertiser_id: advertiserId,
        title: data.title,
        description: data.description,
        purpose: data.purpose,
        start_date: data.startDate,
        end_date: data.endDate,
        total_budget: data.totalBudget,
        currency_code: data.currencyCode,
        target_filters: data.targetFilters,
        must_include_keywords: data.mustIncludeKeywords,
        must_exclude_keywords: data.mustExcludeKeywords,
        target_platform: data.targetPlatform,
        provided_media_urls: data.providedMediaUrls,
        is_premium: data.isPremium || false,
        allow_proposals: data.allowProposals || false,
        status: 'DRAFT',
      })
      .select()
      .single();

    if (error) throw error;
    return campaign;
  }

  /**
   * 특정 캠페인 정보를 가져옵니다.
   */
  public static async getCampaignById(campaignId: string) {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('campaign_id', campaignId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 생성된 샘플 스크립트들을 저장합니다.
   */
  public static async saveSampleScripts(campaignId: string, scripts: string[]) {
    const scriptInserts = scripts.map((text) => ({
      campaign_id: campaignId,
      script_text: text,
      is_approved: false,
    }));

    const { data, error } = await supabase
      .from('campaign_scripts')
      .insert(scriptInserts)
      .select();

    if (error) throw error;
    return data;
  }

  /**
   * 특정 스크립트를 승인합니다.
   */
  public static async approveScript(scriptId: string) {
    const { data, error } = await supabase
      .from('campaign_scripts')
      .update({ is_approved: true })
      .eq('script_id', scriptId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 결제 완료 후 캠페인을 활성화(ACTIVE) 상태로 변경합니다.
   */
  public static async activateCampaign(campaignId: string) {
    const { data, error } = await supabase
      .from('campaigns')
      .update({ status: 'ACTIVE' })
      .eq('campaign_id', campaignId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 캠페인 관련 자료(이미지, PDF 등)를 업로드합니다.
   */
  public static async uploadMaterial(file: any, path: string) {
    const { data, error } = await supabase.storage
      .from('campaign_materials')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('campaign_materials')
      .getPublicUrl(data.path);
      
    return publicUrl;
  }
  /**
   * 승인된 스크립트를 기반으로 100종의 변주를 생성하도록 Edge Function을 호출합니다.
   */
  public static async expandApprovedScript(campaignId: string, scriptId: string) {
    const { data, error } = await supabase.functions.invoke('expand-scripts', {
      body: { campaign_id: campaignId, script_id: scriptId, count: 100 }
    });

    if (error) throw error;
    return data;
  }

  /**
   * 광고주의 모든 캠페인 목록을 가져옵니다. (미션 참여 수 포함)
   */
  public static async listCampaigns(advertiserId: string) {
    const { data, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        mission_contents (count)
      `)
      .eq('advertiser_id', advertiserId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // mission_contents: [{count: 5}] 형태를 mission_count: 5 형태로 변환
    return data.map(item => ({
      ...item,
      mission_count: item.mission_contents?.[0]?.count || 0
    }));
  }

  /**
   * 특정 캠페인의 상세 소진 예산 및 통계를 가져옵니다.
   */
  public static async getCampaignStats(campaignId: string) {
    // 1. 캠페인 정보 가져오기
    const { data: campaign, error: cError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('campaign_id', campaignId)
      .single();
    
    if (cError) throw cError;

    // 2. 해당 캠페인의 미션들을 통해 발생한 모든 제출(submissions) 가져오기
    const { data: missions, error: mError } = await supabase
      .from('mission_contents')
      .select(`
        content_id,
        submissions (
          sub_id,
          status,
          point_transactions (
            raw_amount
          )
        )
      `)
      .eq('campaign_id', campaignId);

    if (mError) throw mError;

    // 3. 통계 계산
    let totalSpent = 0;
    let verifiedSubmissions = 0;
    let totalSubmissions = 0;

    missions.forEach((m: any) => {
      m.submissions?.forEach((s: any) => {
        totalSubmissions++;
        if (s.status === 'VERIFIED') {
          verifiedSubmissions++;
          s.point_transactions?.forEach((pt: any) => {
            totalSpent += pt.raw_amount;
          });
        }
      });
    });

    return {
      total_budget: campaign.total_budget,
      spent_budget: totalSpent,
      submission_count: totalSubmissions,
      verified_count: verifiedSubmissions,
      mission_count: missions.length,
      exhaustion_rate: campaign.total_budget > 0 ? (totalSpent / campaign.total_budget) * 100 : 0
    };
  }

  /**
   * 광고주의 캠페인들에 대한 모든 제안 목록을 가져옵니다.
   */
  public static async listProposals(advertiserId: string) {
    const { data, error } = await supabase
      .from('mission_proposals')
      .select(`
        *,
        campaigns!inner(title, advertiser_id, currency_code),
        users(email, birth_date, gender, country_code, follower_count)
      `)
      .eq('campaigns.advertiser_id', advertiserId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * 제안 상태를 업데이트합니다 (APPROVED, REJECTED).
   */
  public static async updateProposalStatus(proposalId: string, status: 'APPROVED' | 'REJECTED') {
    const { data, error } = await supabase
      .from('mission_proposals')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('proposal_id', proposalId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
