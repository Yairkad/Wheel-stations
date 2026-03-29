-- Puncture managers: separate admin role with access only to the punctures admin
CREATE TABLE IF NOT EXISTS puncture_managers (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name       TEXT NOT NULL,
  phone           TEXT NOT NULL UNIQUE,
  password        TEXT NOT NULL,
  is_active       BOOLEAN DEFAULT true NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);
