
-- Scheduled Database Maintenance Jobs
-- Set up automated maintenance tasks using pg_cron

-- =============================================================================
-- ENABLE PG_CRON EXTENSION
-- =============================================================================

-- Note: This requires superuser privileges
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- =============================================================================
-- 1. DAILY VACUUM AND ANALYZE
-- =============================================================================

-- Schedule daily maintenance at 2 AM UTC
SELECT cron.schedule(
  'daily-vacuum-analyze',
  '0 2 * * *',  -- Daily at 2 AM
  $$
  VACUUM ANALYZE public.tbl_branding;
  VACUUM ANALYZE public.tbl_clients;
  VACUUM ANALYZE public.tbl_sessions;
  VACUUM ANALYZE public.tbl_documents;
  VACUUM ANALYZE public.tbl_audit_logs;
  $$
);

-- =============================================================================
-- 2. WEEKLY FULL STATISTICS UPDATE
-- =============================================================================

-- Schedule weekly statistics update on Sundays at 3 AM UTC
SELECT cron.schedule(
  'weekly-statistics-update',
  '0 3 * * 0',  -- Sundays at 3 AM
  $$
  ANALYZE;
  $$
);

-- =============================================================================
-- 3. MONTHLY ARCHIVE JOB
-- =============================================================================

-- Schedule monthly archival on the 1st at 1 AM UTC
SELECT cron.schedule(
  'monthly-archive-old-data',
  '0 1 1 * *',  -- 1st of each month at 1 AM
  $$
  -- Archive old audit logs
  WITH archived_logs AS (
    DELETE FROM public.tbl_audit_logs
    WHERE created_at < NOW() - INTERVAL '2 years'
    RETURNING *
  )
  INSERT INTO archive.tbl_audit_logs_old
  SELECT * FROM archived_logs;
  
  -- Archive old sessions
  WITH archived_sessions AS (
    DELETE FROM public.tbl_sessions
    WHERE created_at < NOW() - INTERVAL '3 years'
      AND status IN ('completed', 'cancelled')
    RETURNING *
  )
  INSERT INTO archive.tbl_sessions_old
  SELECT * FROM archived_sessions;
  $$
);

-- =============================================================================
-- 4. WEEKLY CLEANUP OF ORPHANED RECORDS
-- =============================================================================

-- Schedule weekly cleanup on Saturdays at 4 AM UTC
SELECT cron.schedule(
  'weekly-cleanup-orphans',
  '0 4 * * 6',  -- Saturdays at 4 AM
  $$
  -- Remove documents without valid client references
  DELETE FROM public.tbl_documents
  WHERE client_id IS NOT NULL
    AND client_id NOT IN (SELECT id FROM public.tbl_clients);
  
  -- Remove client resources without valid client references
  DELETE FROM public.tbl_client_resources
  WHERE client_id NOT IN (SELECT id FROM public.tbl_clients);
  
  -- Remove client journal entries without valid client references
  DELETE FROM public.tbl_client_journal
  WHERE client_id NOT IN (SELECT id FROM public.tbl_clients);
  $$
);

-- =============================================================================
-- VIEW SCHEDULED JOBS
-- =============================================================================

-- Query to see all scheduled maintenance jobs
SELECT 
  jobid,
  schedule,
  command,
  nodename,
  nodeport,
  database,
  username,
  active
FROM cron.job
WHERE database = current_database()
ORDER BY jobid;

-- =============================================================================
-- MANUAL JOB MANAGEMENT
-- =============================================================================

-- To unschedule a job (replace with actual jobid):
-- SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname = 'daily-vacuum-analyze';

-- To check job execution history:
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;

