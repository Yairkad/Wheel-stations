-- Add temporarily unavailable columns to wheels table
ALTER TABLE wheels ADD COLUMN IF NOT EXISTS temporarily_unavailable BOOLEAN DEFAULT false;
ALTER TABLE wheels ADD COLUMN IF NOT EXISTS unavailable_reason TEXT;
ALTER TABLE wheels ADD COLUMN IF NOT EXISTS unavailable_notes TEXT;
ALTER TABLE wheels ADD COLUMN IF NOT EXISTS unavailable_since TIMESTAMPTZ;
ALTER TABLE wheels ADD COLUMN IF NOT EXISTS unavailable_by_manager_id UUID;
