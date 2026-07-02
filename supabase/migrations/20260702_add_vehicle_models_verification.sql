-- Track human verification of vehicle_models rows separately from scraped/self-reported data.
-- NULL verified_at = unreviewed (auto-scraped from wheelfitment.eu, or manager-submitted).
ALTER TABLE vehicle_models
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verified_by TEXT;

COMMENT ON COLUMN vehicle_models.verified_at IS 'When a human confirmed this row is correct; NULL = unreviewed';
COMMENT ON COLUMN vehicle_models.verified_by IS 'Identifier of who verified this row';
