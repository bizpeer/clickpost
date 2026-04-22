-- ====================================================================
-- CLICKPOST DATABASE SETUP & SYSTEM ADMIN CREATION
-- 기준 가이드라인: Gemini.md (v2.0)
-- 실행 방법: Supabase SQL Editor에 복사하여 실행하세요.
-- ====================================================================

-- 1. ENUMS 생성 (중복 생성 방지)
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('USER', 'PRO', 'ADMIN', 'SYSTEM_ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.mission_status AS ENUM ('READY', 'ACTIVE', 'EXHAUSTED', 'CLOSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.submission_status AS ENUM ('SUBMITTED', 'VERIFIED', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. 핵심 테이블 구축

-- Users 테이블 (확장)
CREATE TABLE IF NOT EXISTS public.users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    birth_date DATE,
    gender TEXT, -- MALE, FEMALE, OTHER
    country_code TEXT,
    follower_count INT DEFAULT 0,
    is_pro_verified BOOLEAN DEFAULT FALSE,
    total_points BIGINT DEFAULT 0,
    role public.user_role DEFAULT 'USER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Avatars 테이블
CREATE TABLE IF NOT EXISTS public.avatars (
    avatar_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(user_id) ON DELETE CASCADE,
    seed_id TEXT NOT NULL,
    persona_prompt TEXT,
    asset_front_url TEXT,
    asset_side_url TEXT,
    asset_half_url TEXT,
    asset_full_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Campaigns 테이블
CREATE TABLE IF NOT EXISTS public.campaigns (
    campaign_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total_budget BIGINT NOT NULL,
    fee_rate FLOAT DEFAULT 0.15,
    video_reward INT DEFAULT 0,
    bonus_45d INT DEFAULT 0,
    target_platform TEXT, -- YOUTUBE, TIKTOK, INSTA, X
    status public.mission_status DEFAULT 'READY',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Submissions 테이블
CREATE TABLE IF NOT EXISTS public.submissions (
    sub_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(user_id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.campaigns(campaign_id) ON DELETE CASCADE,
    sns_url TEXT,
    status public.submission_status DEFAULT 'SUBMITTED',
    is_retained_45d BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. SYSTEM_ADMIN 계정 생성 및 권한 부여
-- 주의: 이 이메일로 이미 가입되어 있다면 권한만 업데이트됩니다.

DO $$
DECLARE
    new_user_id UUID;
    target_email TEXT := 'jwmaxum@gmail.com';
    target_password TEXT := 'sang@4478000'; -- 실제 서비스 시에는 해싱되지만, SQL 수동 등록 시 Supabase에서 처리
BEGIN
    -- auth.users에 이미 있는지 확인
    SELECT id INTO new_user_id FROM auth.users WHERE email = target_email;

    IF new_user_id IS NULL THEN
        -- 새 유저 생성 (Supabase Auth 기본값)
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
        VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            target_email,
            crypt(target_password, gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"role":"SYSTEM_ADMIN"}',
            now(),
            now(),
            '',
            '',
            '',
            ''
        )
        RETURNING id INTO new_user_id;
    END IF;

    -- public.users 테이블에 관리자 정보 등록/업데이트
    INSERT INTO public.users (user_id, role, country_code)
    VALUES (new_user_id, 'SYSTEM_ADMIN', 'KR')
    ON CONFLICT (user_id) DO UPDATE SET role = 'SYSTEM_ADMIN';
    
    RAISE NOTICE 'System Admin Account Sync Completed for %', target_email;
END $$;

-- 4. RLS (Row Level Security) 기본 설정
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- 정책: 관리자는 모든 테이블을 보고 수정할 수 있음
CREATE POLICY admin_all_access ON public.users FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'SYSTEM_ADMIN');
CREATE POLICY admin_all_access_avatars ON public.avatars FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'SYSTEM_ADMIN');
CREATE POLICY admin_all_access_campaigns ON public.campaigns FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'SYSTEM_ADMIN');
CREATE POLICY admin_all_access_submissions ON public.submissions FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'SYSTEM_ADMIN');
