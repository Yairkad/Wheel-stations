-- Drop legacy role tables now that all data is in users + user_roles
-- Run AFTER verifying all users have been migrated (check 20260405_unified_users.sql)

-- Remove FK references first (CASCADE handles most, but be explicit)
DROP TABLE IF EXISTS wheel_station_managers CASCADE;
DROP TABLE IF EXISTS call_center_managers CASCADE;
DROP TABLE IF EXISTS operators CASCADE;
DROP TABLE IF EXISTS super_managers CASCADE;
DROP TABLE IF EXISTS puncture_managers CASCADE;
