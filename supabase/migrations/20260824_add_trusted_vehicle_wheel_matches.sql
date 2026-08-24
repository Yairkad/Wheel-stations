CREATE TABLE trusted_vehicle_wheel_matches (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_make       TEXT NOT NULL,
  vehicle_model      TEXT NOT NULL,
  year_from          INTEGER,
  year_to            INTEGER,
  wheel_rim_size     TEXT NOT NULL,
  wheel_bolt_count   INTEGER NOT NULL,
  wheel_bolt_spacing NUMERIC NOT NULL,
  notes              TEXT,
  created_by         TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE trusted_vehicle_wheel_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trusted_vehicle_wheel_matches_service_role" ON trusted_vehicle_wheel_matches
  FOR ALL TO service_role USING (true) WITH CHECK (true);
