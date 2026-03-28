-- Enable PostGIS (safe to run even if already enabled)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Puncture shops table
CREATE TABLE IF NOT EXISTS punctures (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL,
  address    TEXT NOT NULL,
  phone      TEXT,
  hours      TEXT,
  lat        DOUBLE PRECISION NOT NULL,
  lng        DOUBLE PRECISION NOT NULL,
  notes      TEXT,
  is_active  BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security
ALTER TABLE punctures ENABLE ROW LEVEL SECURITY;

-- Public read (anon + authenticated)
CREATE POLICY "Public read punctures" ON punctures
  FOR SELECT USING (true);

-- Write only via service role (admin interface)
CREATE POLICY "Service role write punctures" ON punctures
  FOR ALL USING (auth.role() = 'service_role');

-- RPC: sorted results by distance from user location
CREATE OR REPLACE FUNCTION punctures_nearby(
  user_lat  DOUBLE PRECISION,
  user_lng  DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 50
)
RETURNS TABLE (
  id          UUID,
  name        TEXT,
  address     TEXT,
  phone       TEXT,
  hours       TEXT,
  lat         DOUBLE PRECISION,
  lng         DOUBLE PRECISION,
  notes       TEXT,
  distance_km DOUBLE PRECISION
)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    id, name, address, phone, hours, lat, lng, notes,
    ROUND((
      ST_Distance(
        ST_MakePoint(lng, lat)::geography,
        ST_MakePoint(user_lng, user_lat)::geography
      ) / 1000.0
    )::NUMERIC, 2)::DOUBLE PRECISION AS distance_km
  FROM punctures
  WHERE is_active = true
    AND ST_DWithin(
      ST_MakePoint(lng, lat)::geography,
      ST_MakePoint(user_lng, user_lat)::geography,
      radius_km * 1000
    )
  ORDER BY distance_km
  LIMIT 50;
$$;
