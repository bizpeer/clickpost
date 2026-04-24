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
    const { content_id } = await req.json()

    if (!content_id) {
      throw new Error('content_id is required')
    }

    // 1. Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Fetch mission content and related variation/avatar data
    const { data: content, error: contentError } = await supabase
      .from('mission_contents')
      .select(`
        *,
        script_variations (veo_prompt),
        users (user_id)
      `)
      .eq('content_id', content_id)
      .single()

    if (contentError || !content) {
      throw new Error('Mission content not found')
    }

    const { data: avatar, error: avatarError } = await supabase
      .from('avatars')
      .select('seed_id, asset_front_url')
      .eq('user_id', content.user_id)
      .single()

    if (avatarError || !avatar) {
      throw new Error('User avatar (Seed ID) not found. Please create an avatar first.')
    }

    console.log(`Generating video for content: ${content_id} using Seed ID: ${avatar.seed_id}`)
    
    // Update status to GENERATING
    await supabase
      .from('mission_contents')
      .update({ status: 'GENERATING' })
      .eq('content_id', content_id)

    // 3. JIT Video Generation (Simulation for now, as Veo API is specialized)
    // In a real scenario, we would call Google Veo API here using the veo_prompt and seed_id.
    const veoPrompt = content.script_variations.veo_prompt
    const videoUrl = await simulateVeoGeneration(content_id, avatar.seed_id, veoPrompt)

    // 4. Update mission_contents
    const { error: updateError } = await supabase
      .from('mission_contents')
      .update({
        ai_video_url: videoUrl,
        status: 'READY'
      })
      .eq('content_id', content_id)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ 
        message: 'Video generated successfully', 
        video_url: videoUrl,
        status: 'READY' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Video Generation Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

/**
 * Simulates the Google Veo video generation process.
 * In production, this would involve calling the actual Veo endpoint and uploading the result to Storage.
 */
async function simulateVeoGeneration(contentId: string, seedId: string, prompt: string): Promise<string> {
  console.log(`Veo Simulation - Prompt: ${prompt}`)
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 3000))

  // For simulation, we return a high-quality placeholder video from Unsplash/Pexels or a pre-rendered one
  // In reality, we would upload the Veo result to supabase storage: `user_videos/${contentId}.mp4`
  return `https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4` // Example placeholder
}
