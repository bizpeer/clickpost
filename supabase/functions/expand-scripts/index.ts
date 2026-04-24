import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { GoogleGenAI } from "https://esm.sh/@google/genai@0.11.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Retry utility for API calls
 */
async function withRetry(fn: () => Promise<any>, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      console.warn(`Retry ${i + 1}/${retries} failed. Waiting ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { campaign_id, script_id, count: requestedCount } = await req.json()

    if (!script_id) {
      throw new Error('script_id is required')
    }

    // 1. Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Fetch the approved script and campaign details
    const { data: script, error: scriptError } = await supabase
      .from('campaign_scripts')
      .select('*, campaigns(*)')
      .eq('script_id', script_id)
      .single()

    if (scriptError || !script) {
      throw new Error('Approved script not found or database error')
    }

    const campaign = script.campaigns
    const masterText = script.script_text
    const filters = campaign.target_filters || {}
    
    // Calculate max possible variations based on budget
    const maxPossible = Math.floor(campaign.total_budget / (campaign.video_reward || 10000));
    const finalCount = requestedCount ? Math.min(requestedCount, maxPossible) : Math.min(100, maxPossible);

    // Check if variations already exist to avoid duplicates
    const { count: existingCount, error: countError } = await supabase
      .from('script_variations')
      .select('*', { count: 'exact', head: true })
      .eq('script_id', script_id)

    if (countError) throw countError
    if (existingCount && existingCount >= finalCount) {
      return new Response(
        JSON.stringify({ 
          message: `Scripts already expanded (${existingCount} variations exist)`, 
          count: existingCount 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const remainingToGenerate = finalCount - (existingCount || 0);

    // Hard Limit Check (Task 18)
    const estimatedCost = remainingToGenerate * 0.001; // $0.001 per variation estimate
    const { data: isAllowed, error: limitError } = await supabase.rpc('check_and_add_ai_cost', {
      p_cost: estimatedCost
    });

    if (limitError) console.error('Limit check error:', limitError);
    if (isAllowed === false) {
      return new Response(
        JSON.stringify({ error: 'Daily AI Budget Exceeded. Please contact system admin.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Initialize Gemini
    const genAI = new GoogleGenAI({ apiKey: Deno.env.get('GEMINI_API_KEY') ?? '' })
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }) // Using stable 1.5 flash
    
    const allVariations = []
    const batchSize = 10 // Reduced batch size for more stability and detail
    const iterations = Math.ceil(remainingToGenerate / batchSize)

    console.log(`Starting generation for ${remainingToGenerate} variations in ${iterations} batches.`)

    for (let i = 0; i < iterations; i++) {
      const currentBatchCount = Math.min(batchSize, remainingToGenerate - (i * batchSize))
      
      const systemPrompt = `You are a World-Class Viral Marketing Director for ClickPost.
Your task is to expand 1 master script into ${currentBatchCount} highly distinct, high-conversion video scripts for ${campaign.target_platform}.

CONTEXT:
- Brand identity: Premium, AI-powered influence.
- Audience: ${filters.minAge || 18}-${filters.maxAge || 45} years old, ${filters.gender || 'all'}.
- Mandatory Keywords (MUST naturally appear): ${JSON.stringify(campaign.must_include_keywords || [])}.
- Negative Keywords (STRICTLY FORBIDDEN): ${JSON.stringify(campaign.must_exclude_keywords || [])}.

VARIATION STRATEGY:
- Vary the HOOK (first 3 seconds): Use different techniques like "Unpopular Opinion", "Life Hack", "Direct Benefit", "Visual Surprise", or "Relatable Struggle".
- Vary the CTA (Call to Action): Direct, suggestive, or FOMO-driven.
- Diversify the Tone: Professional, Aesthetic, Energetic, Sarcastic, Minimalist.

GOOGLE VEO PROMPT REQUIREMENTS:
For each script variation, write a detailed 40-60 word visual prompt for Google Veo.
- Subject: The AI Avatar (consistent physical traits).
- Setting: Cinematic environments (modern loft, neon city, peaceful park, minimalist studio).
- Lighting: Volumetric lighting, golden hour, cinematic shadows, or soft studio light.
- Camera: Extreme close-up, dynamic panning, overhead shot, or handheld vlog style.
- Action: The avatar must look like they are recording a vlog or demonstrating the product naturally.

OUTPUT FORMAT:
Return ONLY a valid JSON array of ${currentBatchCount} objects.
[{"variation_text": "...", "veo_prompt": "..."}]`

      const prompt = `Master Seed Script: "${masterText}"
Generate batch #${i + 1} (${currentBatchCount} variations) now. Ensure zero repetition with previous batches.`

      const response = await withRetry(async () => {
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${prompt}` }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.9, // Higher temperature for more variety
          }
        })
        const text = result.response.text();
        if (!text) throw new Error("Empty response from Gemini");
        return JSON.parse(text);
      });

      allVariations.push(...response)
      console.log(`Batch ${i + 1} completed. Total variations: ${allVariations.length}`)
    }

    const finalVariations = allVariations.map((v: any) => ({
      script_id: script_id,
      variation_text: v.variation_text,
      veo_prompt: v.veo_prompt,
      is_assigned: false
    }))

    // 4. Save to SCRIPT_VARIATIONS
    const { error: insertError } = await supabase
      .from('script_variations')
      .insert(finalVariations)

    if (insertError) throw insertError

    return new Response(
      JSON.stringify({ 
        message: `Successfully expanded into ${finalVariations.length} variations`, 
        count: finalVariations.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Edge Function Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})


