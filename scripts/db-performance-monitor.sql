
-- Database Performance Monitoring Script
-- Monitors index usage, table statistics, and identifies optimization opportunities

-- =============================================================================
-- 1. INDEX USAGE VERIFICATION
-- =============================================================================

\echo '=== INDEX USAGE STATISTICS ==='

-- Monitor per-index scans for tbl_branding
SELECT
  relname AS table_name,
  indexrelname AS index_name,
  idx_scan AS times_used,
  idx_tup_read AS tuples_read,
  idx_tup_fetch AS tuples_fetched,
  CASE 
    WHEN idx_scan = 0 THEN '⚠️  UNUSED'
    WHEN idx_scan < 100 THEN '🔶 LOW USAGE'
    ELSE '✅ ACTIVE'
  END AS usage_status
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND relname = 'tbl_branding'
ORDER BY idx_scan DESC;

-- Cross-check with all indexes (broader view)
\echo ''
\echo '=== ALL BRANDING TABLE INDEXES ==='
SELECT
  schemaname,
  relname AS table_name,
  indexrelname AS index_name,
  idx_scan AS times_used,
  idx_tup_read,
  idx_tup_fetch,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_all_indexes
WHERE relname = 'tbl_branding'
ORDER BY idx_scan DESC;

-- Identify unused indexes across all tables
\echo ''
\echo '=== POTENTIALLY UNUSED INDEXES ==='
SELECT
  schemaname,
  relname AS table_name,
  indexrelname AS index_name,
  pg_size_pretty(pg_relation_size(indexrelid)) AS wasted_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND schemaname = 'public'
  AND indexrelname NOT LIKE '%_pkey'  -- Skip primary keys
ORDER BY pg_relation_size(indexrelid) DESC;

-- =============================================================================
-- 2. TABLE STATISTICS & PERFORMANCE METRICS
-- =============================================================================

\echo ''
\echo '=== TABLE STATISTICS ==='
SELECT
  relname AS table_name,
  n_tup_ins AS inserts,
  n_tup_upd AS updates,
  n_tup_del AS deletes,
  n_live_tup AS live_tuples,
  n_dead_tup AS dead_tuples,
  ROUND(100.0 * n_dead_tup / GREATEST(n_live_tup + n_dead_tup, 1), 2) AS dead_tuple_percent,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY dead_tuple_percent DESC, n_dead_tup DESC;

-- =============================================================================
-- 3. QUERY PERFORMANCE INSIGHTS
-- =============================================================================

\echo ''
\echo '=== SLOW QUERY PATTERNS ==='
-- Note: Requires pg_stat_statements extension
SELECT
  query,
  calls,
  total_time / 1000 AS total_seconds,
  ROUND(mean_time::numeric, 2) AS avg_ms,
  rows
FROM pg_stat_statements
WHERE query LIKE '%tbl_branding%'
  OR query LIKE '%tbl_clients%'
  OR query LIKE '%tbl_sessions%'
ORDER BY total_time DESC
LIMIT 10;

-- =============================================================================
-- 4. AUTOVACUUM CONFIGURATION CHECK
-- =============================================================================

\echo ''
\echo '=== AUTOVACUUM SETTINGS ==='
SELECT
  name,
  setting,
  unit,
  context,
  short_desc
FROM pg_settings
WHERE name LIKE '%autovacuum%'
  OR name LIKE '%vacuum%'
ORDER BY name;

