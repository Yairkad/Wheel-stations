-- Both the automatic matching (verified_wheel_matches) and the operator-facing
-- יש/בספק/אין logic account for center bore (CB) mismatches, but the manual
-- admin whitelist only captured rim/bolt-count/bolt-spacing — so a whitelisted
-- combo could silently promote a wheel whose "בספק" was actually a CB warning,
-- not a rim-size one. Nullable: an admin who doesn't know/care about CB for a
-- given combo can leave it blank, which the matching logic treats as "applies
-- regardless of CB" (see src/app/api/wheel-stations/verified-matches/route.ts).
ALTER TABLE trusted_vehicle_wheel_matches ADD COLUMN wheel_center_bore NUMERIC;
