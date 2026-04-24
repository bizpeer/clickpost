-- RPC function to handle mission rewards atomically
CREATE OR REPLACE FUNCTION handle_mission_reward(
    p_user_id UUID,
    p_sub_id UUID,
    p_raw_amount INTEGER,
    p_platform_fee INTEGER,
    p_net_amount INTEGER
)
RETURNS VOID AS $$
BEGIN
    -- 1. Insert into point_transactions
    INSERT INTO public.point_transactions (
        user_id,
        ref_id,
        raw_amount,
        platform_fee,
        net_amount,
        type
    ) VALUES (
        p_user_id,
        p_sub_id,
        p_raw_amount,
        p_platform_fee,
        p_net_amount,
        'EARN'
    );

    -- 2. Update user's total_points
    UPDATE public.users
    SET total_points = total_points + p_net_amount,
        last_active_at = NOW()
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
