-- Track wheels accepted as a donation but not yet physically in the station's active inventory
ALTER TABLE wheels ADD COLUMN IF NOT EXISTS pending_donation BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE wheels ADD COLUMN IF NOT EXISTS pending_since TIMESTAMPTZ;
ALTER TABLE wheels ADD COLUMN IF NOT EXISTS pending_by_manager_id UUID;
