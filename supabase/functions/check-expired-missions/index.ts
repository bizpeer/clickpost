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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Find expired missions (not submitted and past expiration time)
    // We filter for QUEUED, GENERATING, READY. SUBMITTED ones should not be cleaned up here.
    const { data: expiredMissions, error: fetchError } = await supabase
      .from('mission_contents')
      .select('content_id, variation_id')
      .lt('expires_at', new Date().toISOString())
      .in('status', ['QUEUED', 'GENERATING', 'READY'])
      .limit(100); // Process in batches
      
    if (fetchError) throw fetchError

    if (!expiredMissions || expiredMissions.length === 0) {
      return new Response(JSON.stringify({ message: 'No expired missions found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const variationIds = expiredMissions.map(m => m.variation_id).filter(id => !!id)
    const contentIds = expiredMissions.map(m => m.content_id)

    // 2. Release variations (Make them available for other users)
    if (variationIds.length > 0) {
      const { error: releaseError } = await supabase
        .from('script_variations')
        .update({ is_assigned: false })
        .in('variation_id', variationIds)
      
      if (releaseError) console.error('Error releasing variations:', releaseError)
    }

    // 3. Update mission status to EXPIRED
    const { error: statusError } = await supabase
      .from('mission_contents')
      .update({ status: 'EXPIRED' })
      .in('content_id', contentIds)

    if (statusError) throw statusError

    console.log(`[Cleanup] Successfully expired ${contentIds.length} missions.`);

    return new Response(
      JSON.stringify({ 
        message: 'Cleanup successful', 
        count: contentIds.length,
        expired_ids: contentIds 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Cleanup Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
