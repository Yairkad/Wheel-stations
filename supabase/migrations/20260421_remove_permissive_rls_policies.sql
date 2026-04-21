-- ============================================================================
-- Remove permissive RLS policies (rls_policy_always_true warnings)
-- Created: 2026-04-21
-- Description:
--   All INSERT/UPDATE operations on these tables go through server-side API
--   routes that use the service_role key, which bypasses RLS entirely.
--   The permissive WITH CHECK (true) / USING (true) policies are therefore
--   unnecessary and create a security risk (direct anon API access).
-- ============================================================================

DROP POLICY IF EXISTS "public_insert_error_reports"              ON public.error_reports;
DROP POLICY IF EXISTS "public_insert_missing_reports"            ON public.missing_vehicle_reports;
DROP POLICY IF EXISTS "public_insert_puncture_suggestions"       ON public.puncture_suggestions;
DROP POLICY IF EXISTS "public_insert_signed_forms"               ON public.signed_forms;
DROP POLICY IF EXISTS "public_update_signed_forms"               ON public.signed_forms;
DROP POLICY IF EXISTS "public_insert_wheel_borrows"              ON public.wheel_borrows;
DROP POLICY IF EXISTS "public_insert_push_subs"                  ON public.wheel_station_push_subscriptions;
DROP POLICY IF EXISTS "public_update_push_subs"                  ON public.wheel_station_push_subscriptions;
