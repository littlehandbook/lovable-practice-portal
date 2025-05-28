
-- V3__drop_legacy_stored_procedures.sql
-- Migration to remove legacy stored procedures as part of microservices refactoring

BEGIN;

-- 1. Auth procedures
DROP FUNCTION IF EXISTS public.sp_register(text, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.sp_login(text, text) CASCADE;
DROP FUNCTION IF EXISTS public.sp_verify_email(text) CASCADE;

-- 2. User & role management
DROP FUNCTION IF EXISTS public.sp_upsert_user(uuid, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.sp_upsert_user_role(uuid, text) CASCADE;

-- 3. Client-goals
DROP FUNCTION IF EXISTS public.sp_get_client_goals(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.sp_upsert_client_goals(uuid, jsonb) CASCADE;

-- 4. Configuration
DROP FUNCTION IF EXISTS public.sp_get_configuration(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.sp_upsert_configuration(uuid, jsonb) CASCADE;

-- 5. Tenant management
DROP FUNCTION IF EXISTS public.sp_create_tenant(text, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.sp_update_tenant(uuid, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.sp_get_all_tenants() CASCADE;

-- 6. Twilio webhooks
DROP FUNCTION IF EXISTS public.sp_process_twilio_webhook(jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.sp_handle_twilio_event(jsonb) CASCADE;

COMMIT;
