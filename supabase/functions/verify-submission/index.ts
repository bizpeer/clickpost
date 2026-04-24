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
    const { content_id, sns_url } = await req.json()

    if (!content_id || !sns_url) {
      throw new Error('content_id and sns_url are required')
    }

    // 1. Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Fetch mission content and related campaign reward info
    const { data: content, error: contentError } = await supabase
      .from('mission_contents')
      .select(`
        *,
        campaigns (video_reward, fee_rate)
      `)
      .eq('content_id', content_id)
      .single()

    if (contentError || !content) {
      throw new Error('Mission content not found')
    }

    // 3. Basic URL Validation (Regex)
    const isValidUrl = validateSnsUrl(sns_url)
    if (!isValidUrl) {
      throw new Error('Invalid SNS URL. Please provide a valid TikTok, Instagram, or YouTube link.')
    }

    // 4. Update or Insert Submission
    // Check if submission already exists for this content
    const { data: existingSub } = await supabase
      .from('submissions')
      .select('sub_id')
      .eq('content_id', content_id)
      .single()

    if (existingSub) {
      throw new Error('Submission already exists for this mission.')
    }

    const { data: submission, error: subError } = await supabase
      .from('submissions')
      .insert({
        content_id,
        sns_url,
        status: 'VERIFIED' 
      })
      .select()
      .single()

    if (subError) throw subError

    // 5. Point Transaction & User Points Update (Check for Approved Proposals)
    const { data: proposal } = await supabase
      .from('mission_proposals')
      .select('proposed_reward')
      .eq('campaign_id', content.campaign_id)
      .eq('user_id', content.user_id)
      .eq('status', 'APPROVED')
      .maybeSingle()

    const reward = proposal ? proposal.proposed_reward : content.campaigns.video_reward
    const feeRate = content.campaigns.fee_rate ?? 0.15
    const platformFee = Math.floor(reward * feeRate)
    const netAmount = reward - platformFee

    // Atomic update for points and transaction logging
    const { error: txError } = await supabase.rpc('handle_mission_reward', {
      p_user_id: content.user_id,
      p_sub_id: submission.sub_id,
      p_raw_amount: reward,
      p_platform_fee: platformFee,
      p_net_amount: netAmount
    })

    if (txError) throw txError

    return new Response(
      JSON.stringify({ 
        message: 'Submission verified and reward granted', 
        reward: netAmount,
        status: 'VERIFIED' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Submission Verification Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function validateSnsUrl(url: string): boolean {
  const tiktokRegex = /https?:\/\/(www\.)?tiktok\.com\/.+/
  const instaRegex = /https?:\/\/(www\.)?instagram\.com\/(p|reels|reel|tv)\/.+/
  const youtubeRegex = /https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/
  
  return tiktokRegex.test(url) || instaRegex.test(url) || youtubeRegex.test(url)
}
