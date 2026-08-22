-- Tracks each time an operator sends a borrow-request link to a driver/tow-shop,
-- independent of whether the recipient ever fills out the public sign form.
-- Lets the operator later check what happened to a specific request they sent
-- ("check status" button — a one-time lookup, not live polling).

CREATE TABLE operator_sent_requests (
  id             UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  call_center_id UUID REFERENCES call_centers(id) ON DELETE SET NULL,
  station_id     UUID NOT NULL REFERENCES wheel_stations(id) ON DELETE CASCADE,
  wheel_number   TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_operator_sent_requests_operator ON operator_sent_requests(operator_id);

-- Links a borrow back to the specific send that produced it (if the borrower
-- used an operator's link) — NULL for borrows created any other way.
ALTER TABLE wheel_borrows
  ADD COLUMN operator_send_request_id UUID REFERENCES operator_sent_requests(id) ON DELETE SET NULL;

CREATE INDEX idx_wheel_borrows_operator_send_request ON wheel_borrows(operator_send_request_id);

ALTER TABLE operator_sent_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "operator_sent_requests_service_role" ON operator_sent_requests
  FOR ALL TO service_role USING (true) WITH CHECK (true);
