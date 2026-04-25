import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { campaign_id } = await req.json()

    if (!campaign_id) {
      throw new Error('campaign_id is required')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. 캠페인 정보 가져오기
    const { data: campaign, error: campError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('campaign_id', campaign_id)
      .single()

    if (campError || !campaign) throw new Error('Campaign not found')

    const targetUsers = new Set<string>(); // Use Set to avoid duplicate notifications
    const userDevices: any[] = [];

    // 2. 프리미엄 캠페인인 경우: 10K+ 팔로워 인플루언서 타겟팅
    if (campaign.is_premium) {
      console.log(`[Premium] Targeting Pro Influencers (10K+) for campaign: ${campaign.title}`);
      const { data: proUsers, error: proError } = await supabase
        .from('users')
        .select('id, fcm_token')
        .gte('follower_count', 10000);

      if (!proError && proUsers) {
        proUsers.forEach(u => {
          if (u.fcm_token && !targetUsers.has(u.id)) {
            targetUsers.add(u.id);
            userDevices.push(u);
          }
        });
      }
    }

    // 3. 위치 기반 타겟팅 (LBS)
    const filters = campaign.target_filters || {}
    const lat = filters.lat
    const lon = filters.lon
    const radius = filters.radius || 50000 // default 50km

    if (lat && lon) {
      console.log(`[LBS] Targeting users within ${radius}m of (${lat}, ${lon})`);
      const { data: nearbyUsers, error: userError } = await supabase.rpc('get_nearby_users', {
        target_lat: lat,
        target_lon: lon,
        radius_meters: radius
      })

      if (!userError && nearbyUsers) {
        nearbyUsers.forEach((u: any) => {
          if (u.fcm_token && !targetUsers.has(u.id)) {
            targetUsers.add(u.id);
            userDevices.push(u);
          }
        });
      }
    }

    // 4. FCM 알림 발송 (시뮬레이션)
    const tokens = userDevices.map(u => u.fcm_token);
    
    if (tokens.length > 0) {
        const title = campaign.is_premium ? '💎 Premium Mission Alert!' : '📍 New Nearby Mission!';
        const body = campaign.is_premium 
          ? `Exclusive pro mission: "${campaign.title}" is waiting for your proposal.`
          : `A new mission "${campaign.title}" is available in your area.`;

        console.log(`[Notification] Sending to ${tokens.length} devices: ${title}`);
        
        // 실제 구현 시 g_fcm_send 등의 헬퍼 함수 호출
        /*
        await sendFCM(tokens, {
          title,
          body,
          data: { 
            campaign_id: campaign.campaign_id,
            is_premium: String(campaign.is_premium)
          }
        });
        */
    }

    return new Response(
      JSON.stringify({ 
        message: 'Campaign activation notifications processed', 
        total_targeted: targetUsers.size,
        is_premium: campaign.is_premium,
        has_location: !!(lat && lon)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Notification Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
