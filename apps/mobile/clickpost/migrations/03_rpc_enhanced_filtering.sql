-- Enhanced PostGIS RPC for Multi-dimensional Filtering
-- Filters by Distance, Age, and Gender

CREATE OR REPLACE FUNCTION get_nearby_campaigns(
    user_lat FLOAT,
    user_lon FLOAT,
    user_age INTEGER,
    user_gender TEXT, -- 'male', 'female', 'all'
    radius_meters FLOAT DEFAULT 50000 -- Default 50km
)
RETURNS TABLE (
    campaign_id UUID,
    title TEXT,
    description TEXT,
    video_reward INTEGER,
    target_platform TEXT,
    distance_meters FLOAT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.campaign_id,
        c.title,
        c.description,
        c.video_reward,
        c.target_platform,
        CASE 
            WHEN (c.target_filters->>'isGlobal')::boolean THEN 0.0
            ELSE ST_Distance(
                ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography,
                ST_SetSRID(
                    ST_MakePoint(
                        COALESCE((c.target_filters->>'lon')::float, 0.0), 
                        COALESCE((c.target_filters->>'lat')::float, 0.0)
                    ), 
                    4326
                )::geography
            )
        END as distance_meters
    FROM 
        public.campaigns c
    WHERE 
        c.status = 'ACTIVE'
        -- Age Filter
        AND (c.target_filters->>'minAge')::int <= user_age
        AND (c.target_filters->>'maxAge')::int >= user_age
        -- Gender Filter
        AND (
            c.target_filters->>'gender' = 'all' 
            OR c.target_filters->>'gender' = user_gender
        )
        -- Location Filter (Distance or Global)
        AND (
            COALESCE((c.target_filters->>'isGlobal')::boolean, false) = true
            OR ST_DWithin(
                ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography,
                ST_SetSRID(
                    ST_MakePoint(
                        COALESCE((c.target_filters->>'lon')::float, 0.0), 
                        COALESCE((c.target_filters->>'lat')::float, 0.0)
                    ), 
                    4326
                )::geography,
                radius_meters
            )
        )
    ORDER BY 
        distance_meters ASC;
END;
$$;
