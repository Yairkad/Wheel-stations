-- Cache the result of live-verifying a vehicle_models row against an external
-- fitment site (wheelfitment.eu / wheel-size.com) during search, so most
-- searches don't re-scrape on every request. See src/lib/vehicle-fitment-verification.ts.
ALTER TABLE vehicle_models
ADD COLUMN IF NOT EXISTS scrape_checked_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS scrape_matched BOOLEAN,
ADD COLUMN IF NOT EXISTS scrape_snapshot JSONB;

COMMENT ON COLUMN vehicle_models.scrape_checked_at IS 'Last time this row was live-verified against an external fitment site; NULL = never checked';
COMMENT ON COLUMN vehicle_models.scrape_matched IS 'Whether the last live check matched this row''s own fitment fields';
COMMENT ON COLUMN vehicle_models.scrape_snapshot IS 'Scraped fitment data captured at scrape_checked_at, used to display the site value when scrape_matched is false without re-scraping every search';
