-- Audit log table - tracks all important actions
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL, -- 'wheel_deleted', 'wheel_restored', 'wheel_created', 'wheel_updated', 'borrow_created', 'borrow_returned'
  actor_name TEXT NOT NULL,
  actor_type TEXT NOT NULL, -- 'super_manager', 'station_manager', 'operator', 'admin'
  station_id UUID REFERENCES wheel_stations(id) ON DELETE SET NULL,
  station_name TEXT,
  details JSONB DEFAULT '{}', -- flexible field for action-specific data
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying by station
CREATE INDEX IF NOT EXISTS idx_audit_log_station ON audit_log(station_id, created_at DESC);
-- Index for querying by actor
CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON audit_log(actor_type, created_at DESC);

-- District permissions for super managers
-- NULL or empty array = access to ALL districts
ALTER TABLE super_managers ADD COLUMN IF NOT EXISTS allowed_districts TEXT[] DEFAULT NULL;
