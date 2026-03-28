-- Enrich punctures table with structured hours, location details, and Google Maps info
ALTER TABLE punctures
  ADD COLUMN IF NOT EXISTS city            TEXT,
  ADD COLUMN IF NOT EXISTS hours_regular   TEXT,  -- e.g. "07:00–19:00"
  ADD COLUMN IF NOT EXISTS hours_evening   TEXT,  -- e.g. "עד חצות"
  ADD COLUMN IF NOT EXISTS hours_friday    TEXT,  -- e.g. "עד 14:00"
  ADD COLUMN IF NOT EXISTS hours_saturday  TEXT,  -- e.g. "אחרי צאת שבת"
  ADD COLUMN IF NOT EXISTS website         TEXT,
  ADD COLUMN IF NOT EXISTS google_maps_url TEXT,
  ADD COLUMN IF NOT EXISTS google_rating   NUMERIC(2,1);

-- Contacts per shop (name + phone, may have WhatsApp)
CREATE TABLE IF NOT EXISTS puncture_contacts (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  puncture_id  UUID NOT NULL REFERENCES punctures(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  phone        TEXT NOT NULL,
  has_whatsapp BOOLEAN DEFAULT true,
  sort_order   INTEGER DEFAULT 0
);

ALTER TABLE puncture_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read puncture_contacts" ON puncture_contacts
  FOR SELECT USING (true);

CREATE POLICY "Service role write puncture_contacts" ON puncture_contacts
  FOR ALL USING (auth.role() = 'service_role');

-- User-submitted suggestions (pending admin review)
CREATE TABLE IF NOT EXISTS puncture_suggestions (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name             TEXT NOT NULL,
  city             TEXT NOT NULL,
  address          TEXT NOT NULL,
  phone            TEXT,
  hours            TEXT,
  notes            TEXT,
  submitter_name   TEXT,
  submitter_phone  TEXT,
  status           TEXT DEFAULT 'pending',
  created_at       TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE puncture_suggestions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a suggestion
CREATE POLICY "Public insert suggestions" ON puncture_suggestions
  FOR INSERT WITH CHECK (true);

-- Only service role can read suggestions (admin interface)
CREATE POLICY "Service role read suggestions" ON puncture_suggestions
  FOR ALL USING (auth.role() = 'service_role');
