-- Server-validated session tokens for station/super managers, replacing the
-- "resend manager_phone+manager_password on every sensitive request" pattern.
-- DB-backed (not a signed-only JWT) so a specific login can be revoked remotely
-- without touching the account password.

CREATE TABLE manager_sessions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  token         TEXT        NOT NULL UNIQUE,
  user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role          TEXT        NOT NULL CHECK (role IN ('station_manager', 'super_manager', 'puncture_manager')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at    TIMESTAMPTZ NOT NULL,
  revoked_at    TIMESTAMPTZ
);

CREATE INDEX idx_manager_sessions_token ON manager_sessions(token) WHERE revoked_at IS NULL;
CREATE INDEX idx_manager_sessions_user  ON manager_sessions(user_id);

-- Called opportunistically on new-session creation to avoid table bloat
CREATE OR REPLACE FUNCTION cleanup_expired_manager_sessions()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  DELETE FROM public.manager_sessions WHERE expires_at < NOW();
$$;

-- RLS: accessible only via service role (same pattern as users/webauthn tables)
ALTER TABLE manager_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "manager_sessions_service_role" ON manager_sessions
  FOR ALL TO service_role USING (true) WITH CHECK (true);
