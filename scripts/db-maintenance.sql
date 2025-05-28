
-- Database Maintenance Script
-- Performs vacuum, analyze, and routine maintenance tasks

-- =============================================================================
-- 1. VACUUM & ANALYZE OPERATIONS
-- =============================================================================

\echo 'Starting database maintenance...'

-- Lightweight vacuum and analyze for all tables
\echo 'Running VACUUM ANALYZE on all tables...'
VACUUM ANALYZE;

-- Specific maintenance for high-traffic tables
\echo 'Running targeted maintenance on core tables...'
VACUUM ANALYZE public.tbl_branding;
VACUUM ANALYZE public.tbl_clients;
VACUUM ANALYZE public.tbl_sessions;
VACUUM ANALYZE public.tbl_documents;
VACUUM ANALYZE public.tbl_audit_logs;

-- Check for tables that need full vacuum (high dead tuple ratio)
\echo ''
\echo '=== TABLES THAT MAY NEED FULL VACUUM ==='
SELECT
  relname AS table_name,
  n_dead_tup AS dead_tuples,
  n_live_tup AS live_tuples,
  ROUND(100.0 * n_dead_tup / GREATEST(n_live_tup + n_dead_tup, 1), 2) AS dead_percentage,
  pg_size_pretty(pg_total_relation_size(relid)) AS table_size,
  CASE 
    WHEN ROUND(100.0 * n_dead_tup / GREATEST(n_live_tup + n_dead_tup, 1), 2) > 20 
    THEN '⚠️  Consider VACUUM FULL'
    ELSE '✅ OK'
  END AS recommendation
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND n_dead_tup > 1000  -- Only show tables with significant dead tuples
ORDER BY dead_percentage DESC;

-- =============================================================================
-- 2. INDEX MAINTENANCE
-- =============================================================================

\echo ''
\echo '=== REINDEXING BLOATED INDEXES ==='

-- Reindex specific indexes if they're heavily used and bloated
-- (Run this during low-traffic periods)
-- REINDEX INDEX CONCURRENTLY ix_branding_tenant_id;
-- REINDEX INDEX CONCURRENTLY ix_clients_tenant_id;

-- Check index bloat
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
  idx_scan,
  CASE
    WHEN idx_scan = 0 THEN 'Consider dropping'
    WHEN idx_scan < 100 THEN 'Low usage'
    ELSE 'Active'
  END AS usage_recommendation
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;

-- =============================================================================
-- 3. STATISTICS UPDATE
-- =============================================================================

\echo ''
\echo 'Updating table statistics...'

-- Update statistics on critical tables to ensure optimal query planning
ANALYZE public.tbl_branding;
ANALYZE public.tbl_clients;
ANALYZE public.tbl_sessions;
ANALYZE public.tbl_documents;
ANALYZE public.tbl_audit_logs;

\echo 'Database maintenance completed successfully!'

