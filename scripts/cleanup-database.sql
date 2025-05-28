
-- Database Cleanup Script
-- Remove unneeded database credentials and roles after microservices migration

-- =============================================================================
-- 1. AUDIT EXISTING ROLES
-- =============================================================================
-- First, let's see what roles currently exist
\echo 'Current database roles:'
SELECT 
    rolname AS role_name,
    rolsuper AS is_superuser,
    rolinherit AS can_inherit,
    rolcreaterole AS can_create_roles,
    rolcreatedb AS can_create_db,
    rolcanlogin AS can_login,
    rolconnlimit AS connection_limit,
    rolvaliduntil AS valid_until
FROM pg_roles 
WHERE rolname NOT LIKE 'pg_%' 
  AND rolname NOT IN ('postgres', 'authenticator', 'anon', 'authenticated', 'service_role')
ORDER BY rolname;

-- Check privileges for each custom role
\echo 'Checking privileges for custom roles...'
SELECT 
    r.rolname,
    n.nspname AS schema_name,
    p.privilege_type
FROM pg_roles r
JOIN pg_namespace n ON true
JOIN (
    SELECT 
        'USAGE' AS privilege_type,
        nspname AS schema_name,
        nspacl
    FROM pg_namespace
    WHERE nspname = 'public'
) p ON n.nspname = p.schema_name
WHERE r.rolname NOT LIKE 'pg_%' 
  AND r.rolname NOT IN ('postgres', 'authenticator', 'anon', 'authenticated', 'service_role')
  AND has_schema_privilege(r.rolname, n.nspname, 'USAGE');

-- =============================================================================
-- 2. REMOVE OLD RPC USER (if exists)
-- =============================================================================
BEGIN;

-- Check if rpc_user exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rpc_user') THEN
        -- Revoke all privileges first
        REVOKE ALL ON SCHEMA public FROM rpc_user;
        REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM rpc_user;
        REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM rpc_user;
        REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public FROM rpc_user;
        
        -- Drop the role
        DROP ROLE rpc_user;
        RAISE NOTICE 'Dropped role: rpc_user';
    ELSE
        RAISE NOTICE 'Role rpc_user does not exist, skipping...';
    END IF;
END
$$;

-- =============================================================================
-- 3. REMOVE OTHER LEGACY ROLES (customize as needed)
-- =============================================================================

-- List of potentially legacy roles to remove
-- Uncomment and modify as needed for your specific setup

/*
-- Example: Remove a legacy application user
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'legacy_app_user') THEN
        REVOKE ALL ON SCHEMA public FROM legacy_app_user;
        REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM legacy_app_user;
        DROP ROLE legacy_app_user;
        RAISE NOTICE 'Dropped role: legacy_app_user';
    END IF;
END
$$;
*/

/*
-- Example: Remove a legacy service account
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_account') THEN
        REVOKE ALL ON SCHEMA public FROM service_account;
        REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM service_account;
        DROP ROLE service_account;
        RAISE NOTICE 'Dropped role: service_account';
    END IF;
END
$$;
*/

-- =============================================================================
-- 4. CLEAN UP ORPHANED PRIVILEGES
-- =============================================================================

-- Remove any orphaned grants to non-existent roles
-- This query will show grants that reference non-existent roles
\echo 'Checking for orphaned privileges...'
SELECT 
    schemaname,
    tablename,
    tableowner,
    privileges
FROM (
    SELECT 
        schemaname,
        tablename,
        tableowner,
        unnest(string_to_array(array_to_string(relacl, ','), ',')) AS privileges
    FROM pg_tables pt
    JOIN pg_class pc ON pc.relname = pt.tablename
    WHERE schemaname = 'public'
      AND relacl IS NOT NULL
) grants
WHERE privileges ~ '^[^=]*='  -- Has a grantee
  AND split_part(privileges, '=', 1) NOT IN (
    SELECT rolname FROM pg_roles
  )
  AND split_part(privileges, '=', 1) != '';

-- =============================================================================
-- 5. VERIFY REMAINING ROLES
-- =============================================================================

\echo 'Remaining custom roles after cleanup:'
SELECT 
    rolname AS role_name,
    rolsuper AS is_superuser,
    rolcanlogin AS can_login,
    rolconnlimit AS connection_limit,
    CASE 
        WHEN rolvaliduntil IS NULL THEN 'No expiration'
        ELSE rolvaliduntil::text
    END AS valid_until
FROM pg_roles 
WHERE rolname NOT LIKE 'pg_%' 
  AND rolname NOT IN ('postgres')
ORDER BY rolname;

COMMIT;

\echo 'Database cleanup completed successfully!'
\echo 'Review the remaining roles above and ensure they are all needed.'
