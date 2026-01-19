-- Add missing columns to wheels table
ALTER TABLE wheels
ADD COLUMN IF NOT EXISTS category TEXT;

ALTER TABLE wheels
ADD COLUMN IF NOT EXISTS center_bore TEXT;

-- Add comments for documentation
COMMENT ON COLUMN wheels.category IS 'Wheel category for organization';
COMMENT ON COLUMN wheels.center_bore IS 'Center bore diameter (CB) of the wheel';
