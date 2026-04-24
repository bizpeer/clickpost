-- PostGIS RPC for LBS Notifications
-- This function returns users within a certain radius of a target location (campaign center).

CREATE OR REPLACE FUNCTION get_nearby_users(
    target_lat FLOAT,
    target_lon FLOAT,
    radius_meters FLOAT DEFAULT 50000 -- Default 50km
)
RETURNS TABLE (
    user_id UUID,
    fcm_token TEXT,
    distance_meters FLOAT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.user_id,
        u.fcm_token,
        ST_Distance(
            ST_SetSRID(ST_MakePoint(target_lon, target_lat), 4326)::geography,
            u.last_location::geography
        ) as distance_meters
    FROM 
        public.users u
    WHERE 
        u.last_location IS NOT NULL
        AND u.fcm_token IS NOT NULL
        AND ST_DWithin(
            ST_SetSRID(ST_MakePoint(target_lon, target_lat), 4326)::geography,
            u.last_location::geography,
            radius_meters
        )
    ORDER BY 
        distance_meters ASC;
END;
$$;
