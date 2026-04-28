-- 07_ghost_mission_cleanup.sql
-- Ghost Mission 방지 로직: 만료된 미션(24시간 경과)을 정리하고 스크립트 변주를 반환합니다.

CREATE OR REPLACE FUNCTION cleanup_ghost_missions()
RETURNS void AS $$
BEGIN
    -- 1. 만료된 미션(status가 'GENERATING' 또는 'READY' 이고, expires_at이 과거인 경우)과
    --    연결된 script_variations의 is_assigned를 다시 false로 업데이트하여 다른 인플루언서가 참여할 수 있게 함
    UPDATE public.script_variations sv
    SET is_assigned = false
    FROM public.mission_contents mc
    WHERE mc.variation_id = sv.variation_id
      AND mc.status IN ('GENERATING', 'READY', 'QUEUED')
      AND mc.expires_at < NOW()
      AND sv.is_assigned = true;

    -- 2. 해당 미션들의 상태를 'EXPIRED' (또는 'FAILED')로 업데이트
    UPDATE public.mission_contents
    SET status = 'EXPIRED'
    WHERE status IN ('GENERATING', 'READY', 'QUEUED')
      AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- pg_cron이 활성화되어 있다고 가정하고 스케줄을 등록 (주기적으로 10분마다 실행)
-- Supabase SQL Editor에서 수동으로 cron.schedule()을 실행할 수 있습니다.
-- SELECT cron.schedule('ghost-mission-cleanup', '*/10 * * * *', $$ SELECT cleanup_ghost_missions(); $$);
