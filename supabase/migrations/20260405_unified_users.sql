-- ================================================================
-- Migration: Unified users + user_roles tables
-- Replaces: super_managers, wheel_station_managers,
--           call_center_managers, operators, puncture_managers
-- Strategy: non-destructive — old tables kept until full cutover
-- ================================================================

-- ----------------------------------------------------------------
-- 0. Clean slate — drop if partially created from prior failed runs
-- ----------------------------------------------------------------
DROP VIEW  IF EXISTS v_users_with_roles CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS users      CASCADE;

-- ----------------------------------------------------------------
-- 1. users — one row per person (identified by phone)
-- ----------------------------------------------------------------
CREATE TABLE users (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name  TEXT        NOT NULL,
  phone      TEXT        NOT NULL UNIQUE,
  password   TEXT,
  is_active  BOOLEAN     NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON users
  FOR ALL USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------
-- 2. user_roles — one row per (user × role × resource)
--    A single person can hold multiple roles simultaneously.
-- ----------------------------------------------------------------
CREATE TABLE user_roles (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  role              TEXT        NOT NULL CHECK (role IN (
                      'super_manager',
                      'station_manager',
                      'call_center_manager',
                      'operator',
                      'puncture_manager'
                    )),

  station_id        UUID        REFERENCES wheel_stations(id) ON DELETE CASCADE,
  call_center_id    UUID        REFERENCES call_centers(id)   ON DELETE CASCADE,

  is_primary        BOOLEAN     NOT NULL DEFAULT false,
  title             TEXT,
  operator_code     TEXT,
  allowed_districts TEXT[],
  is_active         BOOLEAN     NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON user_roles
  FOR ALL USING (true) WITH CHECK (true);

-- Partial unique indexes (handles nullable FKs correctly)
CREATE UNIQUE INDEX uq_user_roles_station
  ON user_roles (user_id, role, station_id)
  WHERE station_id IS NOT NULL;

CREATE UNIQUE INDEX uq_user_roles_call_center
  ON user_roles (user_id, role, call_center_id)
  WHERE call_center_id IS NOT NULL AND station_id IS NULL;

CREATE UNIQUE INDEX uq_user_roles_no_resource
  ON user_roles (user_id, role)
  WHERE station_id IS NULL AND call_center_id IS NULL;

CREATE INDEX idx_user_roles_user_id     ON user_roles (user_id);
CREATE INDEX idx_user_roles_station_id  ON user_roles (station_id);
CREATE INDEX idx_user_roles_call_center ON user_roles (call_center_id);

-- ----------------------------------------------------------------
-- 3. Migrate existing data
-- ----------------------------------------------------------------

-- 3a. users — deduplicated by phone, highest-priority source wins
INSERT INTO users (phone, full_name, password, is_active)
SELECT DISTINCT ON (phone) phone, full_name, password, is_active
FROM (
  SELECT sm.phone,  sm.full_name,  sm.password,        sm.is_active,                  1 AS pri FROM super_managers sm
  UNION ALL
  SELECT wsm.phone, wsm.full_name, wsm.password,       true,                          2        FROM wheel_station_managers wsm
  UNION ALL
  SELECT ccm.phone, ccm.full_name, ccm.password,       COALESCE(ccm.is_active, true), 3        FROM call_center_managers ccm
  UNION ALL
  SELECT pm.phone,  pm.full_name,  pm.password,        pm.is_active,                  4        FROM puncture_managers pm
  UNION ALL
  SELECT o.phone,   o.full_name,   o.code AS password, COALESCE(o.is_active, true),   5        FROM operators o
) src
ORDER BY phone, pri;

-- 3b. super_manager roles
INSERT INTO user_roles (user_id, role, allowed_districts)
SELECT u.id, 'super_manager', sm.allowed_districts
FROM super_managers sm
JOIN users u ON u.phone = sm.phone;

-- 3c. station_manager roles
INSERT INTO user_roles (user_id, role, station_id, is_primary)
SELECT u.id, 'station_manager', wsm.station_id, COALESCE(wsm.is_primary, false)
FROM wheel_station_managers wsm
JOIN users u ON u.phone = wsm.phone;

-- 3d. call_center_manager roles
INSERT INTO user_roles (user_id, role, call_center_id, is_primary, title)
SELECT u.id, 'call_center_manager', ccm.call_center_id, COALESCE(ccm.is_primary, false), ccm.title
FROM call_center_managers ccm
JOIN users u ON u.phone = ccm.phone;

-- 3e. operator roles
INSERT INTO user_roles (user_id, role, call_center_id, operator_code)
SELECT u.id, 'operator', o.call_center_id, o.code
FROM operators o
JOIN users u ON u.phone = o.phone;

-- 3f. puncture_manager roles
INSERT INTO user_roles (user_id, role)
SELECT u.id, 'puncture_manager'
FROM puncture_managers pm
JOIN users u ON u.phone = pm.phone;

-- ----------------------------------------------------------------
-- 4. Convenience view for /admin/users
-- ----------------------------------------------------------------
CREATE VIEW v_users_with_roles AS
SELECT
  u.id,
  u.full_name,
  u.phone,
  u.is_active,
  u.created_at,
  ARRAY_AGG(DISTINCT ur.role ORDER BY ur.role) FILTER (WHERE ur.id IS NOT NULL) AS roles,
  MIN(ws.name)                                                                   AS station_name,
  MIN(ur.is_primary::int)::boolean                                               AS is_primary,
  MIN(cc.name)                                                                   AS call_center_name,
  (ARRAY_AGG(ur.allowed_districts) FILTER (WHERE ur.role = 'super_manager'))[1] AS allowed_districts
FROM users u
LEFT JOIN user_roles     ur ON ur.user_id = u.id AND ur.is_active = true
LEFT JOIN wheel_stations ws ON ws.id = ur.station_id
LEFT JOIN call_centers   cc ON cc.id = ur.call_center_id
GROUP BY u.id, u.full_name, u.phone, u.is_active, u.created_at;
