-- Add custom_deposit column to wheels table for special deposit amounts
ALTER TABLE wheels
ADD COLUMN IF NOT EXISTS custom_deposit INTEGER;

COMMENT ON COLUMN wheels.custom_deposit IS 'Custom deposit amount for this specific wheel (overrides station default)';
