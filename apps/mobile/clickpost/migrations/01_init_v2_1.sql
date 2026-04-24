-- ClickPost DB Schema v2.1 (Supabase/PostgreSQL)
-- This script initializes the database based on the ERD v2.1.

-- Enable PostGIS extension for LBS targeting
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. USERS
CREATE TABLE IF NOT EXISTS public.users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    fcm_token TEXT,
    birth_date DATE,
    gender TEXT,
    country_code TEXT, -- ISO 3166-1 alpha-2
    follower_count INTEGER DEFAULT 0,
    is_pro_verified BOOLEAN DEFAULT FALSE,
    total_points BIGINT DEFAULT 0,
    last_location GEOMETRY(POINT, 4326),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. AVATARS
CREATE TABLE IF NOT EXISTS public.avatars (
    avatar_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(user_id) ON DELETE CASCADE,
    seed_id TEXT NOT NULL,
    persona_prompt TEXT,
    asset_front_url TEXT,
    asset_side_url TEXT,
    asset_half_url TEXT,
    asset_full_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ADVERTISERS
CREATE TABLE IF NOT EXISTS public.advertisers (
    advertiser_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    biz_reg_number TEXT UNIQUE,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    country_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CAMPAIGNS
CREATE TABLE IF NOT EXISTS public.campaigns (
    campaign_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advertiser_id UUID REFERENCES public.advertisers(advertiser_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    total_budget BIGINT NOT NULL,
    currency_code TEXT DEFAULT 'USD',
    fee_rate FLOAT DEFAULT 0.15,
    video_reward INTEGER DEFAULT 0,
    bonus_45d INTEGER DEFAULT 0,
    target_platform TEXT, -- TIKTOK, INSTA, etc.
    status TEXT DEFAULT 'DRAFT', -- DRAFT, ACTIVE, EXHAUSTED, CLOSED
    target_filters JSONB,
    provided_media_urls JSONB,
    must_include_keywords JSONB,
    must_exclude_keywords JSONB,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CAMPAIGN_SCRIPTS
CREATE TABLE IF NOT EXISTS public.campaign_scripts (
    script_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.campaigns(campaign_id) ON DELETE CASCADE,
    script_text TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. SCRIPT_VARIATIONS
CREATE TABLE IF NOT EXISTS public.script_variations (
    variation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    script_id UUID REFERENCES public.campaign_scripts(script_id) ON DELETE CASCADE,
    variation_text TEXT NOT NULL,
    veo_prompt TEXT,
    is_assigned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. MISSION_CONTENTS
CREATE TABLE IF NOT EXISTS public.mission_contents (
    content_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(user_id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.campaigns(campaign_id) ON DELETE CASCADE,
    variation_id UUID REFERENCES public.script_variations(variation_id),
    ai_video_url TEXT,
    ai_script TEXT,
    status TEXT DEFAULT 'QUEUED', -- QUEUED, GENERATING, READY, FAILED
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. SUBMISSIONS
CREATE TABLE IF NOT EXISTS public.submissions (
    sub_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID REFERENCES public.mission_contents(content_id) ON DELETE CASCADE,
    sns_url TEXT NOT NULL,
    status TEXT DEFAULT 'SUBMITTED', -- SUBMITTED, VERIFIED, REJECTED
    is_retained_45d BOOLEAN DEFAULT FALSE,
    last_checked_at TIMESTAMP WITH TIME ZONE,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. POINT_TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.point_transactions (
    tx_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(user_id) ON DELETE CASCADE,
    ref_id UUID, -- campaign_id or sub_id
    raw_amount INTEGER NOT NULL,
    platform_fee INTEGER NOT NULL,
    net_amount INTEGER NOT NULL,
    type TEXT, -- EARN, WITHDRAW, BONUS
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. PAYOUT_REQUESTS
CREATE TABLE IF NOT EXISTS public.payout_requests (
    payout_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(user_id) ON DELETE CASCADE,
    amount BIGINT NOT NULL,
    method TEXT, -- NaverPay, Grab, etc.
    bank_info JSONB,
    status TEXT DEFAULT 'PENDING', -- PENDING, PAID, FAILED
    external_tx_id TEXT,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- RLS (Row Level Security) - Basic Setup (Should be refined per table)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.script_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
