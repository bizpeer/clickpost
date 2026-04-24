-- Migration: Premium Mission & Reverse Proposals
-- Adds support for premium missions and reverse proposals for pro influencers (10k+ followers)

-- 1. Update CAMPAIGNS table to support premium flags
ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS allow_proposals BOOLEAN DEFAULT FALSE;

-- 2. Create MISSION_PROPOSALS table
CREATE TABLE IF NOT EXISTS public.mission_proposals (
    proposal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.campaigns(campaign_id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(user_id) ON DELETE CASCADE,
    proposed_reward INTEGER NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for mission_proposals
ALTER TABLE public.mission_proposals ENABLE ROW LEVEL SECURITY;

-- 3. Create a function to notify pro influencers (Mock/Placeholder for logic)
-- In a real system, this would trigger an Edge Function for FCM
CREATE OR REPLACE FUNCTION public.notify_pro_influencers() 
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_premium = TRUE AND NEW.status = 'ACTIVE' AND (OLD.status IS NULL OR OLD.status <> 'ACTIVE') THEN
        -- Logic to find pro influencers and logic for notifications would go here
        -- For now, we can log or mark for a background job
        RAISE NOTICE 'Premium campaign % activated. Ready to invite pro influencers.', NEW.campaign_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_pro_influencers
AFTER UPDATE ON public.campaigns
FOR EACH ROW
WHEN (NEW.is_premium = TRUE AND NEW.status = 'ACTIVE')
EXECUTE FUNCTION public.notify_pro_influencers();

-- 4. RLS Policies for mission_proposals
-- Users can view their own proposals
CREATE POLICY "Users can view their own proposals" 
ON public.mission_proposals FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own proposals if they are pro verified
CREATE POLICY "Pro users can submit proposals" 
ON public.mission_proposals FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE user_id = auth.uid() 
        AND is_pro_verified = TRUE 
        AND follower_count >= 10000
    )
);

-- Advertisers can view proposals for their campaigns
CREATE POLICY "Advertisers can view proposals for their campaigns" 
ON public.mission_proposals FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.campaigns 
        WHERE campaign_id = mission_proposals.campaign_id 
        AND advertiser_id = auth.uid()
    )
);

-- Advertisers can update (approve/reject) proposals for their campaigns
CREATE POLICY "Advertisers can update proposals" 
ON public.mission_proposals FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.campaigns 
        WHERE campaign_id = mission_proposals.campaign_id 
        AND advertiser_id = auth.uid()
    )
);
