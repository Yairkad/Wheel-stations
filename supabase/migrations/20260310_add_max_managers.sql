-- Add max_managers column to wheel_stations
-- Allows super admin to configure per-station manager limit
ALTER TABLE wheel_stations ADD COLUMN IF NOT EXISTS max_managers INT DEFAULT 4;
