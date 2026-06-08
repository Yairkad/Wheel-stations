# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-06-08T08:51:06.352Z
> Files: 266 tracked | Anatomy hits: 0 | Misses: 0

## ./

- `.gitignore` — Git ignore rules (~190 tok)
- `.mcp.json` (~43 tok)
- `.npmrc` (~6 tok)
- `build-storybook.log` (~2273 tok)
- `CLAUDE.md` — OpenWolf (~57 tok)
- `debug-storybook.log` (~3187 tok)
- `next-env.d.ts` — / <reference types="next" /> (~73 tok)
- `next.config.ts` — Next.js configuration (~200 tok)
- `npm` (~0 tok)
- `package-lock.json` — npm lock file (~143603 tok)
- `package.json` — Node.js package manifest (~686 tok)
- `postcss.config.mjs` — Declares config (~27 tok)
- `tsconfig.json` — TypeScript configuration (~206 tok)
- `tsconfig.tsbuildinfo` (~81336 tok)
- `vercel.json` (~33 tok)
- `vitest.config.ts` — Vitest test configuration (~448 tok)
- `vitest.shims.d.ts` — / <reference types="@vitest/browser-playwright" /> (~15 tok)

## .claude/

- `reality-check.md` — Reality Check — No-Compromise Code Honesty Audit (~2587 tok)
- `regression-dog.md` (~269 tok)
- `settings.json` (~646 tok)
- `settings.local.json` (~866 tok)

## .claude/rules/

- `openwolf.md` (~313 tok)

## .storybook/

- `main.ts` — /*.mdx", (~297 tok)
- `preview.ts` — Declares preview (~290 tok)

## public/

- `admin-manifest.json` (~130 tok)
- `manifest.json` (~226 tok)
- `operator-manifest.json` (~147 tok)
- `sw.js` — Service Worker for Web Push Notifications + Web Share Target (~740 tok)
- `wheels-template.html` — תבנית ייבוא גלגלים (~692 tok)

## scripts/

- `backup-vehicle-models.ts` — Backup vehicle_models table to JSON file (~744 tok)
- `bump-version.js` — Version bump script (~410 tok)
- `car_make2csv.py` — get_all_makes, get_models_for_make, get_wheel_data, extract_tire_sizes + 1 more (~1905 tok)
- `generate-guide.mjs` — User Guide Generator — מערכת גלגלים ידידים (~7070 tok)
- `import-wheel-fitment.ts` — Import wheel fitment data from CSV to Supabase (Safe Upsert) (~3590 tok)
- `kml-to-sql.mjs` — Parses the punctures KML file and outputs a complete SQL seed file (~2396 tok)
- `scrape_wheelfitment_to_supabase.py` — normalize_make, get_models_for_make, get_wheel_data, parse_pcd + 6 more (~3729 tok)

## src/

- `middleware.ts` — Exports middleware, config (~198 tok)

## src/__tests__/

- `permissions.test.ts` — Districts & Version Tests (~1146 tok)
- `setup.ts` — Mock environment variables (~626 tok)
- `utils.test.ts` — cn (className utility) (~1368 tok)
- `vehicle-mappings.test.ts` — Vehicle Mappings Tests (~1816 tok)
- `wheel-search.test.ts` — PCD Database Tests (~2685 tok)

## src/app/

- `globals.css` — Styles: 20 rules, 5 media queries, 2 animations (~1518 tok)
- `layout.tsx` — rubik (~466 tok)
- `page.tsx` — PublicHomePage — uses useRouter (~2290 tok)

## src/app/[stationId]/

- `page.tsx` — StationPage (~85902 tok)

## src/app/accessibility/

- `page.tsx` — AccessibilityPage — uses useRouter (~1202 tok)

## src/app/admin/

- `layout.tsx` — metadata (~111 tok)
- `page.tsx` — WheelsAdminPage — uses useState, useEffect (~18228 tok)

## src/app/admin/analytics/

- `page.tsx` — AUDIT_COLORS — renders chart — uses useState, useEffect (~7712 tok)

## src/app/admin/call-centers/

- `page.tsx` — CallCentersAdminPage — uses useState, useEffect (~9264 tok)

## src/app/admin/login-report/

- `page.tsx` — ROLE_LABELS — renders table — uses useState, useEffect (~3107 tok)

## src/app/admin/punctures/

- `page.tsx` — parseLatLngFromUrl — uses useState, useEffect (~10526 tok)

## src/app/admin/punctures/login/

- `page.tsx` — PunctureManagerLoginPage — uses useRouter, useState, useEffect (~1348 tok)

## src/app/admin/reports/

- `page.tsx` — ErrorReportsPage — uses useState, useEffect (~16417 tok)

## src/app/admin/users/

- `page.tsx` — ROLE_LABELS — uses useState, useEffect, useSearchParams (~13958 tok)

## src/app/admin/vehicles/

- `page.tsx` — VehiclesAdminPageWrapper — uses useSearchParams, useState, useEffect (~45023 tok)

## src/app/api/admin/analytics/

- `route.ts` — Next.js API route: GET (~2994 tok)

## src/app/api/admin/backup-vehicle-models/

- `route.ts` — Backup vehicle_models API endpoint (~442 tok)

## src/app/api/admin/call-centers/

- `route.ts` — Next.js API route: GET, POST (~1735 tok)

## src/app/api/admin/call-centers/[id]/

- `route.ts` — Next.js API route: DELETE, PUT (~605 tok)

## src/app/api/admin/login-report/

- `route.ts` — Next.js API route: GET (~629 tok)

## src/app/api/admin/puncture-manager-auth/

- `route.ts` — Next.js API route: POST (~492 tok)

## src/app/api/admin/punctures/

- `_auth.ts` — Exports verifyPunctureAccess (~405 tok)

## src/app/api/admin/punctures/managers/

- `route.ts` — Next.js API route: GET, POST, PATCH, DELETE (~1236 tok)

## src/app/api/admin/punctures/shops/

- `route.ts` — Next.js API route: GET, POST (~431 tok)

## src/app/api/admin/punctures/shops/[id]/

- `route.ts` — Next.js API route: PATCH, DELETE (~360 tok)

## src/app/api/admin/punctures/suggestions/

- `route.ts` — Next.js API route: GET (~221 tok)

## src/app/api/admin/punctures/suggestions/[id]/

- `route.ts` — Next.js API route: PATCH (~609 tok)

## src/app/api/admin/scrape-wheelfitment/

- `route.ts` — Scrape Wheel Fitment API (~3045 tok)

## src/app/api/admin/session/

- `route.ts` — GET /api/admin/session — check if session is valid (used by usePunctureAdminAuth) (~200 tok)

## src/app/api/admin/super-managers/

- `route.ts` — Super Managers Admin API (~2208 tok)

## src/app/api/admin/users/

- `route.ts` — Next.js API route: GET, POST (~1291 tok)

## src/app/api/admin/users/[userId]/

- `route.ts` — Next.js API route: PATCH, DELETE (~623 tok)

## src/app/api/admin/users/[userId]/roles/

- `route.ts` — Next.js API route: POST (~488 tok)

## src/app/api/admin/users/[userId]/roles/[roleId]/

- `route.ts` — Next.js API route: PATCH (~347 tok)

## src/app/api/admin/users/merge/

- `route.ts` — Next.js API route: POST (~424 tok)

## src/app/api/auth/login/

- `route.ts` — Next.js API route: POST (~2021 tok)

## src/app/api/auth/webauthn/authenticate/begin/

- `route.ts` — Next.js API route: POST (~801 tok)

## src/app/api/auth/webauthn/authenticate/complete/

- `route.ts` — Next.js API route: POST (~2044 tok)

## src/app/api/auth/webauthn/credentials/

- `route.ts` — Next.js API route: POST (~555 tok)

## src/app/api/auth/webauthn/credentials/[credentialId]/

- `route.ts` — Next.js API route: PATCH, DELETE (~925 tok)

## src/app/api/auth/webauthn/register/begin/

- `route.ts` — Next.js API route: POST (~792 tok)

## src/app/api/auth/webauthn/register/complete/

- `route.ts` — POST /api/auth/webauthn/register/complete (~715 tok)

## src/app/api/auth/webauthn/status/

- `route.ts` — Next.js API route: GET (~284 tok)

## src/app/api/call-center/history/

- `route.ts` — Next.js API route: GET (~1033 tok)

## src/app/api/call-center/managers/

- `route.ts` — Next.js API route: GET, POST (~1460 tok)

## src/app/api/call-center/managers/[id]/

- `route.ts` — Next.js API route: DELETE, PUT (~1076 tok)

## src/app/api/call-center/operators/

- `route.ts` — Next.js API route: GET, POST (~1444 tok)

## src/app/api/call-center/operators/[id]/

- `route.ts` — Next.js API route: DELETE, PUT (~1126 tok)

## src/app/api/call-center/unified-auth/

- `route.ts` — Next.js API route: POST (~1192 tok)

## src/app/api/districts/

- `route.ts` — Districts Management API (~606 tok)

## src/app/api/districts/[districtId]/

- `route.ts` — District Management API (~1009 tok)

## src/app/api/error-reports/

- `route.ts` — Next.js API route: GET, POST (~678 tok)

## src/app/api/error-reports/[id]/

- `route.ts` — Next.js API route: PUT, DELETE (~632 tok)

## src/app/api/feedback/

- `route.ts` — API Route: Send Feedback for Wheels App (~2814 tok)

## src/app/api/geocode/

- `route.ts` — Next.js API route: GET (~242 tok)

## src/app/api/missing-vehicle-reports/

- `route.ts` — Next.js API route: GET, POST (~613 tok)

## src/app/api/missing-vehicle-reports/[id]/

- `route.ts` — Next.js API route: DELETE, PATCH (~616 tok)

## src/app/api/ocr/

- `route.ts` — Next.js API route: POST (~1438 tok)

## src/app/api/puncture-suggestions/

- `route.ts` — Puncture Shop Suggestions API (~404 tok)

## src/app/api/punctures/

- `route.ts` — Puncture Shops API (~525 tok)

## src/app/api/punctures/nearby/

- `route.ts` — Puncture Shops Nearby API (~727 tok)

## src/app/api/resolve-maps/

- `route.ts` — Next.js API route: GET (~405 tok)

## src/app/api/signed-forms/[formId]/

- `route.ts` — Signed Forms View/Download API (~982 tok)

## src/app/api/signed-forms/cleanup/

- `route.ts` — Signed Forms Cleanup API (~848 tok)

## src/app/api/signed-forms/upload/

- `route.ts` — Signed Forms Upload API (~2227 tok)

## src/app/api/super-manager/auth/

- `route.ts` — POST - Authenticate super manager (~450 tok)

## src/app/api/vehicle-models/

- `route.ts` — Next.js API route: GET, POST (~1495 tok)

## src/app/api/vehicle-models/[id]/

- `route.ts` — Next.js API route: DELETE, PUT, GET (~1022 tok)

## src/app/api/vehicle-models/reverse-search/

- `route.ts` — Next.js API route: GET (~1363 tok)

## src/app/api/vehicle-models/scrape/

- `route.ts` — Scrape vehicle PCD data from wheelfitment.eu (primary) and wheel-size.com (fallback) (~3008 tok)

## src/app/api/vehicle/lookup/

- `route.ts` — Vehicle Lookup API (~7038 tok)

## src/app/api/vehicle/ocr/

- `route.ts` — OCR API: POST image → Google Vision → extract Israeli license plate (~60 tok)
- `route.ts` — Next.js API route: POST (~648 tok)

## src/app/api/wheel-stations/

- `route.ts` — Wheel Stations API (~1618 tok)

## src/app/api/wheel-stations/[stationId]/

- `route.ts` — Single Wheel Station API (~3131 tok)

## src/app/api/wheel-stations/[stationId]/auth/

- `route.ts` — Station Manager Authentication API (~3606 tok)

## src/app/api/wheel-stations/[stationId]/borrows/

- `route.ts` — Wheel Borrows History API (~1199 tok)

## src/app/api/wheel-stations/[stationId]/borrows/[borrowId]/

- `route.ts` — Borrow Request Management API (~1504 tok)

## src/app/api/wheel-stations/[stationId]/deleted-wheels/

- `route.ts` — Deleted Wheels API (~446 tok)

## src/app/api/wheel-stations/[stationId]/import/

- `route.ts` — Wheel Import API (~3811 tok)

## src/app/api/wheel-stations/[stationId]/managers/

- `route.ts` — Station Managers API (~1921 tok)

## src/app/api/wheel-stations/[stationId]/public-borrow/

- `route.ts` — Public Wheel Borrow API (~2965 tok)

## src/app/api/wheel-stations/[stationId]/push/send/

- `route.ts` — API Route: Send Push Notification to Wheel Station Managers (~1193 tok)

## src/app/api/wheel-stations/[stationId]/push/subscribe/

- `route.ts` — API Route: Subscribe to Push Notifications for Wheel Station (~1988 tok)

## src/app/api/wheel-stations/[stationId]/recovery/

- `route.ts` — Recovery Key API (~1460 tok)

## src/app/api/wheel-stations/[stationId]/wheels/

- `route.ts` — Wheels API for a specific station (~1166 tok)

## src/app/api/wheel-stations/[stationId]/wheels/[wheelId]/

- `route.ts` — Single Wheel API (~2359 tok)

## src/app/api/wheel-stations/[stationId]/wheels/[wheelId]/borrow/

- `route.ts` — Wheel Borrow API (~2142 tok)

## src/app/api/wheel-stations/[stationId]/wheels/[wheelId]/restore/

- `route.ts` — Restore Deleted Wheel API (~1098 tok)

## src/app/api/wheel-stations/admin/

- `route.ts` — Wheel Stations Admin API (password protected) (~1688 tok)

## src/app/api/wheel-stations/admin/[stationId]/

- `route.ts` — Single Wheel Station Admin API (password protected) (~1694 tok)

## src/app/api/wheel-stations/admin/managers/

- `route.ts` — Station Managers Admin API (password protected) (~1203 tok)

## src/app/api/wheel-stations/auth/

- `route.ts` — Next.js API route: POST (~1051 tok)

## src/app/api/wheel-stations/filter-options/

- `route.ts` — Filter Options API (~636 tok)

## src/app/api/wheel-stations/managers/

- `route.ts` — Station Managers API (~539 tok)

## src/app/api/wheel-stations/recovery/

- `route.ts` — Global Recovery API - finds manager by phone (no stationId needed) (~681 tok)

## src/app/api/wheel-stations/search/

- `route.ts` — Global Wheel Search API (~1458 tok)

## src/app/api/wheels/[wheelId]/unavailable/

- `route.ts` — API Route: Mark wheel as temporarily unavailable (~1079 tok)

## src/app/call-center/

- `page.tsx` — CallCenterPage — uses useState, useEffect (~17289 tok)

## src/app/feedback/

- `page.tsx` — FeedbackPage — renders form — uses useRouter, useState (~5937 tok)

## src/app/forms/[formId]/

- `layout.tsx` — metadata (~102 tok)
- `page.tsx` — FormViewerPage — renders form — uses useState, useEffect (~3036 tok)

## src/app/guide/

- `page.tsx` — GuideContent — uses useRouter, useSearchParams, useEffect (~15287 tok)

## src/app/login/

- `page.tsx` — LoginPage — uses useRouter, useState, useEffect (~8101 tok)

## src/app/lookup/

- `layout.tsx` — metadata (~144 tok)
- `page.tsx` — extractRimSize — uses useState, useEffect (~4056 tok)

## src/app/ocr-test/

- `page.tsx` — OcrTestPage — renders table (~2498 tok)

## src/app/operator/

- `layout.tsx` — metadata (~189 tok)
- `page.tsx` — OperatorPage — uses useState, useEffect (~25146 tok)

## src/app/privacy/

- `page.tsx` — PrivacyPage — uses useRouter (~1502 tok)

## src/app/punctures/

- `layout.tsx` — metadata (~178 tok)
- `page.tsx` — MapView (~8889 tok)

## src/app/reverse-search/

- `layout.tsx` — metadata (~150 tok)
- `page.tsx` — ReverseSearchPage — uses useState (~17764 tok)

## src/app/search/

- `page.tsx` — VEHICLE_HISTORY_KEY (~45789 tok)

## src/app/sign/[stationId]/

- `layout.tsx` — metadata (~162 tok)
- `page.tsx` — SignFormContent — uses useSearchParams, useState, useEffect (~14109 tok)

## src/app/stations/

- `page.tsx` — WheelStationsPage (~36103 tok)

## src/app/super-manager/

- `page.tsx` — SESSION_EXPIRY_MS — uses useRouter, useState, useEffect, useCallback (~17842 tok)

## src/components/

- `AppHeader.tsx` — AppHeader — uses useRouter, useState, useEffect (~12600 tok)
- `ToastProvider.tsx` — ToastProvider (~359 tok)

## src/components/admin/

- `AdminHeader.tsx` — buildingIcon (~1740 tok)
- `AdminShell.tsx` — AdminShell (~216 tok)
- `AdminSidebar.tsx` — icons — uses useRouter, useState, useEffect (~4325 tok)

## src/components/punctures/

- `HoursFields.tsx` — show evening & saturday rows (admin forms) — default true (~1881 tok)
- `MapView.tsx` — Pass true when the map container becomes visible (mobile view switch) so it can resize (~4148 tok)

## src/hooks/

- `useAdminAuth.ts` — Exports useAdminAuth (~168 tok)
- `useAdminPendingReports.ts` — Exports useAdminPendingReports (~229 tok)
- `usePunctureAdminAuth.ts` — Exports PunctureAdminRole, usePunctureAdminAuth (~645 tok)

## src/lib/

- `admin-auth.ts` — Verify admin auth by personal password (used by punctures system). (~498 tok)
- `admin-session.ts` — Uses Web Crypto API — works in both Edge Runtime (middleware) and Node.js (API routes) (~520 tok)
- `audit-log.ts` — Exports AuditAction, ActorType, logAction (~296 tok)
- `districts.ts` — District definitions for wheel stations (~683 tok)
- `email.ts` — Exports sendWheelDeletedEmail (~664 tok)
- `login-log.ts` — Exports logLogin (~170 tok)
- `ocr.ts` — Exports OcrVehicleData, OcrProgress, extractVehicleDataFromImage (~1796 tok)
- `password.ts` — Returns true if the stored value looks like a bcrypt hash (~334 tok)
- `pcd-database.ts` — PCD (Pitch Circle Diameter) Database (~13693 tok)
- `push.ts` — Utility functions for Web Push Notifications (~1725 tok)
- `rate-limit.ts` — Simple in-memory rate limiter for API routes (~971 tok)
- `station-auth.ts` — Shared station manager authentication helper. (~509 tok)
- `super-manager-auth.ts` — Exports verifySuperManager (~507 tok)
- `types.ts` — Shared TypeScript interfaces used across pages (~413 tok)
- `utils.ts` — Exports cn (~50 tok)
- `vehicle-mappings.ts` — Hebrew-English vehicle brand and model mappings (~1616 tok)
- `version.ts` — App version - displayed in footer (~75 tok)
- `webauthn.ts` — Uint8Array (COSE public key) → base64url string for DB storage (~1320 tok)

## src/stories/mocks/

- `data.ts` — Exports STATION_ID, OTHER_STATION_ID, VISITOR_SESSION, mockStation + 9 more (~1986 tok)
- `utils.tsx` — SESSION_KEYS (~537 tok)

## src/stories/pages/

- `CallCenter.stories.tsx` — sessionStorage (~459 tok)
- `Login.stories.tsx` — meta (~113 tok)
- `Search.stories.tsx` — sessionStorage (~352 tok)
- `Station.stories.tsx` — handlers (~754 tok)

## storybook-static/

- `admin-manifest.json` (~130 tok)
- `iframe.html` — Storybook (~5005 tok)
- `index.html` — storybook - Storybook (~971 tok)
- `index.json` (~986 tok)
- `manifest.json` (~165 tok)
- `operator-manifest.json` (~147 tok)
- `project.json` (~421 tok)
- `sw.js` — Service Worker for Web Push Notifications (~392 tok)
- `vite-inject-mocker-entry.js` — r: i, a, o + 16 more (~7958 tok)
- `wheels-template.html` — תבנית ייבוא גלגלים (~634 tok)

## storybook-static/assets/

- `AppHeader-DEAo0Q6V.js` — Zustand store (~60963 tok)
- `axe-8DTD8iLQ.js` — Zustand store (~161834 tok)
- `browser-Bl9PjrmM.js` — t: n, n, n + 10 more (~6705 tok)
- `CallCenter.stories-B0Hv6YdQ.js` — Declares g (~12486 tok)
- `chunk-242VQQM5-BX-c_7Ec.js` — Declares t (~61 tok)
- `chunk-3LY4VQVK-BhEpanMp.js` — e: a, r, i + 3 more (~1151 tok)
- `chunk-CYSK6WYR--pW929My.js` (~44 tok)
- `chunk-CzyJ72yW.js` (~364 tok)
- `chunk-RD3KTAHR-cUHV2tWr.js` — s: c, l, u + 28 more (~5904 tok)
- `Color-FRDS63T2-BwgX0jIC.js` — ee: te, g, ne + 6 more (~8806 tok)
- `components-mg_KE5Fo.js` — __vite__mapDeps: Ce, Ye, Xe, Ze (~155298 tok)
- `data-Czcq0JwZ.js` — t: n (~1695 tok)
- `DocsRenderer-LL677BLK-B6lyVozk.js` — Zustand store (~52308 tok)
- `formatter-EIJCOSYU-Dimk58_M.js` (~76 tok)
- `iframe-BjHzEcaL.css` — Styles: 1 rules, 151 vars, 10 media queries, 5 layers (~10978 tok)
- `jsQR-Db7HPkYr.js` — n: e, i, e + 15 more (~37139 tok)
- `Login.stories-DzaM1avT.js` — __vite__mapDeps: t, t, i + 19 more (~10100 tok)
- `matchers-5TDFFDYO-BY3qY6Nj.js` — Zustand store (~8227 tok)
- `preload-helper-DYaIPuKl.js` — l: s (~365 tok)
- `react-18-DS9vfFYx.js` — t: n, r, i + 38 more (~57987 tok)
- `react-D8ni5mKO.js` — i: a (~150 tok)
- `Search.stories-2abWmowg.js` — API routes: GET (1 endpoints) (~26550 tok)
- `Station.stories-DeY9uRxY.js` — __vite__mapDeps: O, k, A + 43 more (~174073 tok)
- `syntaxhighlighter-OH4MV7E3-BXjvrO4l.js` — v: ee, te, y + 34 more (~21705 tok)
- `theming-WUj_MFW4.js` — Zustand store (~15802 tok)
- `version-D2iNG0R1.js` — c: l, u, n + 11 more (~4364 tok)
- `WithTooltip-65CFNBJE-CkQa25xi.js` — g: _, v, y + 49 more (~9487 tok)

## storybook-static/sb-addons/a11y-3/

- `manager-bundle.js` (~18932 tok)

## storybook-static/sb-addons/chromatic-com-storybook-1/

- `manager-bundle.js` — ud: k, f, po + 11 more (~161794 tok)
- `manager-bundle.js.LEGAL.txt` — filesize (~421 tok)

## storybook-static/sb-addons/docs-4/

- `manager-bundle.js` — Zustand store (~5344 tok)

## storybook-static/sb-addons/onboarding-5/

- `manager-bundle.js` — yi: Oi, Er (~46908 tok)

## storybook-static/sb-addons/storybook-core-server-presets-0/

- `common-manager-bundle.js` — sE: lE, uE, cE + 5 more (~122761 tok)

## storybook-static/sb-addons/vitest-2/

- `manager-bundle.js` — Y: He, Te, he, Ee (~7406 tok)

## storybook-static/sb-manager/

- `globals.js` — src/manager/globals/globals.ts (~292 tok)
- `manager-stores.js` — src/manager/manager-stores.ts (~187 tok)

## supabase/

- `פנצ'ריות לילה.kml` (~108 tok)
- `punctures_raw.kml` (~6840 tok)
- `seed_punctures.sql` — Run in Supabase SQL Editor (~7265 tok)

## supabase/migrations/

- `20251216_signed_forms_storage.sql` — Migration: Signed Forms Storage System (~504 tok)
- `20260118_add_license_plate_column.sql` — Add missing license_plate column to wheel_borrows table (~70 tok)
- `20260118_fix_wheel_borrows_rls.sql` — Fix RLS policies for wheel_borrows table (~750 tok)
- `20260119_add_category_column.sql` — Add missing columns to wheels table (~100 tok)
- `20260119_add_custom_deposit.sql` — Add custom_deposit column to wheels table for special deposit amounts (~75 tok)
- `20260202_add_recovery_key.sql` — Add recovery_key column for password reset via QR certificate (~42 tok)
- `20260205_add_wheel_unavailable_columns.sql` — Add temporarily unavailable columns to wheels table (~126 tok)
- `20260210_add_super_managers.sql` — Create super_managers table for cross-station management role (~152 tok)
- `20260212_add_audit_log_and_district_permissions.sql` — Audit log table - tracks all important actions (~298 tok)
- `20260212_add_wheel_soft_delete.sql` — Add soft delete columns to wheels table (~136 tok)
- `20260310_add_max_managers.sql` — Add max_managers column to wheel_stations (~54 tok)
- `20260311_fix_is_primary_default.sql` — Fix is_primary default value: new managers should NOT be primary by default (~114 tok)
- `20260329_add_puncture_managers.sql` — Puncture managers: separate admin role with access only to the punctures admin (~115 tok)
- `20260329_add_punctures_v2.sql` — Enrich punctures table with structured hours, location details, and Google Maps info (~600 tok)
- `20260329_add_punctures.sql` — Enable PostGIS (safe to run even if already enabled) (~512 tok)
- `20260405_unified_users.sql` — Migration: Unified users + user_roles tables (~1830 tok)
- `20260406_add_admin_role.sql` — Add 'admin' as a valid role in user_roles (~111 tok)
- `20260406_drop_legacy_tables.sql` — Drop legacy role tables now that all data is in users + user_roles (~133 tok)
- `20260421_fix_security_linter_warnings.sql` — Fix Security Linter Warnings - WHEELS_APP (~454 tok)
- `20260421_remove_permissive_rls_policies.sql` — Remove permissive RLS policies (rls_policy_always_true warnings) (~382 tok)
- `20260424_add_webauthn.sql` — WebAuthn / Passkeys support (~620 tok)
- `20260511_add_tire_size.sql` — Add tire_size column to wheels table (~53 tok)
