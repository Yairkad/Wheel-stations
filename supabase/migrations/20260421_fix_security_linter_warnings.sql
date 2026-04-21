-- ============================================================================
-- Fix Security Linter Warnings - WHEELS_APP
-- Created: 2026-04-21
-- Description:
--   security_definer_view: Recreate v_users_with_roles with security_invoker
--   so RLS and permissions of the *querying user* are enforced, not the
--   view creator.
-- ============================================================================


-- ============================================================================
-- Fix v_users_with_roles - security_invoker instead of security_definer
-- ============================================================================

DROP VIEW IF EXISTS v_users_with_roles CASCADE;

CREATE VIEW v_users_with_roles
  WITH (security_invoker = true)
AS
SELECT
  u.id,
  u.full_name,
  u.phone,
  u.is_active,
  u.created_at,
  ARRAY_AGG(DISTINCT ur.role ORDER BY ur.role) FILTER (WHERE ur.id IS NOT NULL) AS roles,
  MIN(ws.name)                                                                   AS station_name,
  MIN(ur.is_primary::int)::boolean                                               AS is_primary,
  MIN(cc.name)                                                                   AS call_center_name,
  (ARRAY_AGG(ur.allowed_districts) FILTER (WHERE ur.role = 'super_manager'))[1] AS allowed_districts
FROM users u
LEFT JOIN user_roles     ur ON ur.user_id = u.id AND ur.is_active = true
LEFT JOIN wheel_stations ws ON ws.id = ur.station_id
LEFT JOIN call_centers   cc ON cc.id = ur.call_center_id
GROUP BY u.id, u.full_name, u.phone, u.is_active, u.created_at;


