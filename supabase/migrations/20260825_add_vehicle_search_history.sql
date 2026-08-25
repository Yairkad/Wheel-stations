-- Shared vehicle search history for /search's plate-lookup tab — replaces the old
-- per-browser localStorage list so every operator/manager sees the same recent
-- searches. UNIQUE on plate: searching an already-known plate again just bumps it
-- to the top instead of creating a duplicate row.

CREATE TABLE vehicle_search_history (
  id             UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  plate          TEXT NOT NULL UNIQUE,
  display_name   TEXT NOT NULL,
  year           INTEGER,
  vehicle_result JSONB NOT NULL,
  pinned         BOOLEAN NOT NULL DEFAULT false,
  searched_by    TEXT,
  searched_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vehicle_search_history_searched_at ON vehicle_search_history(searched_at DESC);

ALTER TABLE vehicle_search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vehicle_search_history_service_role" ON vehicle_search_history
  FOR ALL TO service_role USING (true) WITH CHECK (true);
