-- Add 'admin' as a valid role in user_roles
-- Drop and recreate the check constraint to include admin

ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;

ALTER TABLE user_roles ADD CONSTRAINT user_roles_role_check
  CHECK (role IN (
    'admin',
    'super_manager',
    'station_manager',
    'call_center_manager',
    'operator',
    'puncture_manager'
  ));
