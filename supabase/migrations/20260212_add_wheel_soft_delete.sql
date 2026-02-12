-- Add soft delete columns to wheels table
ALTER TABLE wheels ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE wheels ADD COLUMN IF NOT EXISTS deleted_by_name TEXT DEFAULT NULL;
ALTER TABLE wheels ADD COLUMN IF NOT EXISTS deleted_by_type TEXT DEFAULT NULL; -- 'super_manager' | 'station_manager'

-- Index for filtering active wheels efficiently
CREATE INDEX IF NOT EXISTS idx_wheels_deleted_at ON wheels(deleted_at) WHERE deleted_at IS NULL;
