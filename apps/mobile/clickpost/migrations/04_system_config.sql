-- System Configuration and AI Cost Guard (Task 18)

CREATE TABLE IF NOT EXISTS public.system_config (
    id SERIAL PRIMARY KEY,
    gemini_daily_limit FLOAT DEFAULT 50.0, -- Default $50.00 limit
    gemini_current_cost FLOAT DEFAULT 0.0,
    last_reset_date DATE DEFAULT CURRENT_DATE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Initialize default config if not exists
INSERT INTO public.system_config (id, gemini_daily_limit, gemini_current_cost, last_reset_date)
VALUES (1, 50.0, 0.0, CURRENT_DATE)
ON CONFLICT (id) DO NOTHING;

/**
 * check_and_add_ai_cost
 * Checks if the additional AI cost stays within the daily budget.
 * Automatically resets the cost if a new day has started.
 */
CREATE OR REPLACE FUNCTION check_and_add_ai_cost(
    p_cost FLOAT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_limit FLOAT;
    v_current FLOAT;
    v_last_date DATE;
BEGIN
    -- 1. Fetch current config
    SELECT gemini_daily_limit, gemini_current_cost, last_reset_date 
    INTO v_limit, v_current, v_last_date
    FROM public.system_config
    WHERE id = 1;

    -- 2. Check if we need to reset the daily counter
    IF v_last_date < CURRENT_DATE THEN
        v_current := 0.0;
        v_last_date := CURRENT_DATE;
    END IF;

    -- 3. Validate against hard limit
    IF (v_current + p_cost) > v_limit THEN
        -- Log limit reach if necessary
        RETURN FALSE;
    END IF;

    -- 4. Update usage and date
    UPDATE public.system_config
    SET gemini_current_cost = v_current + p_cost,
        last_reset_date = v_last_date,
        updated_at = NOW()
    WHERE id = 1;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
