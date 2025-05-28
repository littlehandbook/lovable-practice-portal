
-- Database Archive and Cleanup Script
-- Handles data archival and removes unused schema artifacts

-- =============================================================================
-- 1. CREATE ARCHIVE SCHEMA
-- =============================================================================

-- Create archive schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS archive;

-- Grant appropriate permissions
GRANT USAGE ON SCHEMA archive TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA archive TO authenticated;

-- =============================================================================
-- 2. ARCHIVE OLD AUDIT LOGS
-- =============================================================================

\echo 'Archiving old audit logs...'

-- Create archive table for audit logs (if not exists)
CREATE TABLE IF NOT EXISTS archive.tbl_audit_logs_old (
  LIKE public.tbl_audit_logs INCLUDING ALL
);

-- Archive audit logs older than 2 years to reduce main table size
WITH archived_logs AS (
  DELETE FROM public.tbl_audit_logs
  WHERE created_at < NOW() - INTERVAL '2 years'
  RETURNING *
)
INSERT INTO archive.tbl_audit_logs_old
SELECT * FROM archived_logs;

-- Report on archived records
SELECT 
  'Audit Logs' AS table_name,
  COUNT(*) AS archived_records,
  MIN(created_at) AS oldest_archived,
  MAX(created_at) AS newest_archived
FROM archive.tbl_audit_logs_old
WHERE created_at >= NOW() - INTERVAL '1 day';

-- =============================================================================
-- 3. ARCHIVE OLD SESSION DATA
-- =============================================================================

\echo 'Archiving old session data...'

-- Create archive table for old sessions
CREATE TABLE IF NOT EXISTS archive.tbl_sessions_old (
  LIKE public.tbl_sessions INCLUDING ALL
);

-- Archive sessions older than 3 years
WITH archived_sessions AS (
  DELETE FROM public.tbl_sessions
  WHERE created_at < NOW() - INTERVAL '3 years'
    AND status IN ('completed', 'cancelled')  -- Only archive non-active sessions
  RETURNING *
)
INSERT INTO archive.tbl_sessions_old
SELECT * FROM archived_sessions;

-- =============================================================================
-- 4. CLEAN UP ORPHANED RECORDS
-- =============================================================================

\echo 'Cleaning up orphaned records...'

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

-- =============================================================================
-- 5. DROP UNUSED TRIGGERS
-- =============================================================================

\echo 'Removing unused triggers...'

-- Drop any legacy triggers that may exist
DO $$
BEGIN
    -- Drop old branding triggers if they exist
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_old_branding_update') THEN
        DROP TRIGGER trg_old_branding_update ON public.tbl_branding CASCADE;
        RAISE NOTICE 'Dropped legacy trigger: trg_old_branding_update';
    END IF;
    
    -- Drop other legacy triggers as needed
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_legacy_audit') THEN
        DROP TRIGGER trg_legacy_audit ON public.tbl_clients CASCADE;
        RAISE NOTICE 'Dropped legacy trigger: trg_legacy_audit';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Note: Some triggers may not exist or may be in use';
END
$$;

-- =============================================================================
-- 6. REMOVE UNUSED INDEXES
-- =============================================================================

\echo 'Checking for unused indexes to remove...'

-- List indexes that haven't been used (for manual review)
SELECT
  'DROP INDEX ' || indexrelname || ';' AS drop_statement,
  relname AS table_name,
  indexrelname AS index_name,
  pg_size_pretty(pg_relation_size(indexrelid)) AS wasted_space
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND schemaname = 'public'
  AND indexrelname NOT LIKE '%_pkey'  -- Keep primary keys
  AND indexrelname NOT LIKE '%_unique'  -- Keep unique constraints
ORDER BY pg_relation_size(indexrelid) DESC;

-- =============================================================================
-- 7. CLEANUP SUMMARY
-- =============================================================================

\echo ''
\echo '=== CLEANUP SUMMARY ==='

-- Show space reclaimed
SELECT
  'public' AS schema_name,
  pg_size_pretty(pg_database_size(current_database())) AS total_database_size;

-- Show archive schema size
SELECT
  'archive' AS schema_name,
  pg_size_pretty(SUM(pg_total_relation_size(c.oid))) AS archive_size
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'archive';

\echo 'Archive and cleanup completed successfully!'
\echo 'Review the suggested DROP INDEX statements above before executing them.'

