-- Add recovery_key column for password reset via QR certificate
ALTER TABLE wheel_station_managers ADD COLUMN IF NOT EXISTS recovery_key TEXT;
