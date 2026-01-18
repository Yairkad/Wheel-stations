-- Add missing license_plate column to wheel_borrows table
ALTER TABLE wheel_borrows
ADD COLUMN IF NOT EXISTS license_plate TEXT;

-- Add comment for documentation
COMMENT ON COLUMN wheel_borrows.license_plate IS 'Vehicle license plate number';
