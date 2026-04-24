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

    // 1. Fetch campaign details and target filters
    const { data: campaign, error: campError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('campaign_id', campaign_id)
      .single()

    if (campError || !campaign) throw new Error('Campaign not found')

    // Assuming target_filters has { lat: number, lon: number, radius: number }
    const filters = campaign.target_filters || {}
    const lat = filters.lat
    const lon = filters.lon
    const radius = filters.radius || 50000 // default 50km

    if (!lat || !lon) {
      console.log(`Campaign ${campaign_id} has no location targeting. Skipping notifications.`);
      return new Response(JSON.stringify({ message: 'No location targeting for this campaign' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 2. Find nearby users using PostGIS RPC
    const { data: users, error: userError } = await supabase.rpc('get_nearby_users', {
      target_lat: lat,
      target_lon: lon,
      radius_meters: radius
    })

    if (userError) throw userError

    if (!users || users.length === 0) {
      console.log(`No nearby users found for campaign ${campaign_id} at (${lat}, ${lon})`);
      return new Response(JSON.stringify({ message: 'No nearby users found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 3. Send FCM Notifications (Simulation)
    const tokens = users.map(u => u.fcm_token).filter(t => !!t)
    
    if (tokens.length > 0) {
        console.log(`[Notification] Triggering push for ${tokens.length} users near campaign: ${campaign.title}`);
        
        // In a real implementation, you would call FCM API here.
        // Example:
        // await sendFCM(tokens, {
        //   title: 'Nearby Mission Alert!',
        //   body: `A new campaign "${campaign.title}" is available in your area.`,
        //   data: { campaign_id: campaign.campaign_id }
        // });
    }

    return new Response(
      JSON.stringify({ 
        message: 'Notification trigger successful', 
        user_count: users.length,
        notification_sent: tokens.length > 0,
        target_location: { lat, lon, radius }
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
