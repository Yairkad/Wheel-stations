-- WebAuthn / Passkeys support

-- Registered passkey credentials per user
CREATE TABLE webauthn_credentials (
  id             UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  credential_id  TEXT    NOT NULL UNIQUE,
  public_key     TEXT    NOT NULL,          -- base64url-encoded COSE public key
  counter        BIGINT  NOT NULL DEFAULT 0,
  device_type    TEXT,                      -- 'singleDevice' | 'multiDevice'
  backed_up      BOOLEAN NOT NULL DEFAULT false,
  transports     TEXT[],                    -- ['internal', 'hybrid', 'usb', ...]
  friendly_name  TEXT,                      -- user-visible label, e.g. "iPhone 15"
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at   TIMESTAMPTZ
);

CREATE INDEX idx_webauthn_credentials_user ON webauthn_credentials(user_id);

-- Temporary challenges (5-minute TTL, consumed on use)
CREATE TABLE webauthn_challenges (
  id          UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID  REFERENCES users(id) ON DELETE CASCADE,
  phone       TEXT,
  challenge   TEXT  NOT NULL UNIQUE,
  type        TEXT  NOT NULL CHECK (type IN ('registration', 'authentication')),
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webauthn_challenges_challenge ON webauthn_challenges(challenge);
CREATE INDEX idx_webauthn_challenges_expires   ON webauthn_challenges(expires_at);

-- Called before every new challenge insert to avoid table bloat
CREATE OR REPLACE FUNCTION cleanup_expired_challenges()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM webauthn_challenges WHERE expires_at < NOW();
$$;

-- RLS: accessible only via service role (same pattern as users table)
ALTER TABLE webauthn_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE webauthn_challenges   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "webauthn_credentials_service_role" ON webauthn_credentials
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "webauthn_challenges_service_role" ON webauthn_challenges
  FOR ALL TO service_role USING (true) WITH CHECK (true);
