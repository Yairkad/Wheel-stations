-- Logs each vehicle/spec wheel search made by an operator or station manager,
-- with which stations had a matching wheel at that moment. Feeds the station
-- manager's "search demand" report: how many checks, how many not found, and
-- which vehicles / wheel specs were missing.

CREATE TABLE wheel_search_log (
  id                      UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  source                  TEXT NOT NULL CHECK (source IN ('operator', 'manager')),
  search_type             TEXT NOT NULL CHECK (search_type IN ('plate', 'model', 'spec')),
  searched_by             TEXT,
  plate                   TEXT,
  manufacturer            TEXT,
  model                   TEXT,
  year                    INTEGER,
  bolt_count              INTEGER,
  bolt_spacing            NUMERIC,
  center_bore             NUMERIC,
  rim_size                TEXT,
  -- stations that had at least one wheel of this spec (any status)
  stations_with_match     UUID[] NOT NULL DEFAULT '{}',
  -- stations that had a wheel of this spec actually available to lend
  stations_with_available UUID[] NOT NULL DEFAULT '{}',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wheel_search_log_created_at ON wheel_search_log(created_at DESC);

ALTER TABLE wheel_search_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wheel_search_log_service_role" ON wheel_search_log
  FOR ALL TO service_role USING (true) WITH CHECK (true);
