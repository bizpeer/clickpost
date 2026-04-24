-- PostGIS RPC for LBS Filtering
-- This function returns campaigns within a certain radius of the user's location.

CREATE OR REPLACE FUNCTION get_nearby_campaigns(
    user_lat FLOAT,
    user_lon FLOAT,
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
        ST_Distance(
            ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography,
            ST_SetSRID(
                ST_MakePoint(
                    (c.target_filters->>'lon')::float, 
                    (c.target_filters->>'lat')::float
                ), 
                4326
            )::geography
        ) as distance_meters
    FROM 
        public.campaigns c
    WHERE 
        c.status = 'ACTIVE'
        AND ST_DWithin(
            ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography,
            ST_SetSRID(
                ST_MakePoint(
                    (c.target_filters->>'lon')::float, 
                    (c.target_filters->>'lat')::float
                ), 
                4326
            )::geography,
            radius_meters
        )
    ORDER BY 
        distance_meters ASC;
END;
$$;
