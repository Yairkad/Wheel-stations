-- Add offset (ET) column to wheels table
-- "offset" is a reserved SQL keyword (used in LIMIT...OFFSET), must stay quoted in this file
ALTER TABLE wheels
ADD COLUMN IF NOT EXISTS "offset" NUMERIC;

COMMENT ON COLUMN wheels."offset" IS 'ET / offset in mm, signed (can be negative), optional';
