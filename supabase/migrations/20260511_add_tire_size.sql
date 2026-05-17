-- Add tire_size column to wheels table
ALTER TABLE wheels
ADD COLUMN IF NOT EXISTS tire_size TEXT;

COMMENT ON COLUMN wheels.tire_size IS 'Tire size (e.g. 205/55R16) for the wheel';
