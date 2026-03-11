-- Fix is_primary default value: new managers should NOT be primary by default
ALTER TABLE wheel_station_managers
  ALTER COLUMN is_primary SET DEFAULT false;

-- Fix any existing managers that might have been set to primary incorrectly
-- (only run this if you want to reset all — commented out by default)
-- UPDATE wheel_station_managers SET is_primary = false WHERE is_primary = true;
