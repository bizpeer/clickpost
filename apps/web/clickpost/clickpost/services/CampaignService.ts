import { supabase } from './SupabaseClient';

export interface CampaignData {
  title: string;
  description: string;
  totalBudget: number;
  currencyCode: string;
  targetFilters: any;
  mustIncludeKeywords: string[];
  mustExcludeKeywords: string[];
  targetPlatform: string;
  providedMediaUrls: string[];
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
        total_budget: data.totalBudget,
        currency_code: data.currencyCode,
        target_filters: data.targetFilters,
        must_include_keywords: data.mustIncludeKeywords,
        must_exclude_keywords: data.mustExcludeKeywords,
        target_platform: data.targetPlatform,
        provided_media_urls: data.providedMediaUrls,
        status: 'DRAFT',
      })
      .select()
      .single();

    if (error) throw error;
    return campaign;
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
   * 특정 스크립트를 승인하고 캠페인 상태를 ACTIVE로 변경할 준비를 합니다.
   * (실제 ACTIVE 변경은 결제 완료 후 진행됨)
   */
  public static async approveScript(scriptId: string) {
    const { error } = await supabase
      .from('campaign_scripts')
      .update({ is_approved: true })
      .eq('script_id', scriptId);

    if (error) throw error;
  }
}
