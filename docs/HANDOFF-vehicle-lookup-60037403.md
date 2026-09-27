# העברת משימה: רכב 60037403 "לא נמצא במאגרים"

> להדביק לסשן חדש כמו שהוא. ענף: `claude/vehicle-not-found-inventory-u1kef8`, PR: https://github.com/Yairkad/Wheel-stations/pull/17

## הבעיה
חיפוש מספר רכב **60037403** (במסכי החיפוש וגם בגרידה לפי מספר רכב ב-admin/vehicles) מחזיר "הרכב לא נמצא במאגרים".
הרכב: צ'רי FX EV, 2024, פרטי (ליסינג), עלה לכביש 05/2024, צמיג 215/55R18.

## עובדות מאומתות
1. **הרכב קיים במאגר הרגיל של data.gov.il.** אותה שאילתה שהקוד שולח, כשפותחים אותה בדפדפן, מחזירה רשומה (`_id` 2545887, `tozeret_nm: "צ'רי סין"`, `kinuy_mishari: "FX EV"`):
   `https://data.gov.il/api/3/action/datastore_search?resource_id=053cea08-09bc-40ec-8f7a-156f0677aff3&filters={"mispar_rechev":"60037403"}`
2. **find-car.co.il חוסם את Vercel.** בלוג של Vercel מופיע `find-car.co.il fetch failed: 403`. בדפדפן הרכב מופיע מיד.
3. **הפענוח של find-car תקין.** `scrapeFromFindCar` הורץ על עותק שמור של הדף וחילץ צ'רי / FX EV / 2024 / 215/55R18.
4. **main כבר שולח `filters` ולא `q`** (תיקון קודם, bug-149/150).

**מסקנה:** הבקשה מהשרת (Vercel) למאגר הרגיל נכשלת (non-OK או exception). הקוד הישן התייחס לכישלון כאל "לא נמצא", ואחר כך נפל גם ב-find-car.

## מה כבר שונה (PR #17, קובץ `src/app/api/vehicle/lookup/route.ts`)
- פונקציה חדשה `fetchGovData()`: ניסיון חוזר אחד, ורישום בלוג של כל כישלון (`data.gov.il regular API error (attempt N)` / `fetch failed`).
- אם המאגר הרגיל נכשל ולא נמצא כלום: מחזיר **502 "שגיאה בחיבור למאגר הממשלתי"** במקום 404.
- נוסף `צ'רי`/`צרי` → `chery` ל-`MAKE_TRANSLATIONS`.
- טרם נבדק מול ה-API האמיתי. typecheck ו-lint לא רצו (הסביבה בענן חסמה את data.gov.il, ו-node_modules לא הותקנו).

## מצב: עדיין לא עובד. מה לבדוק, לפי הסדר
1. **האם PR #17 מוזג ועלה לאוויר?** אם לא, האתר עדיין מריץ את הקוד הישן.
2. **לוגים ב-Vercel** אחרי חיפוש של 60037403: לחפש `data.gov.il regular` ולרשום את קוד השגיאה (403/429/timeout/ECONNRESET וכו').
3. **הרצה מקומית:** `npm run dev`, ואז `curl "http://localhost:3000/api/vehicle/lookup?plate=60037403"`.
   - עובד מקומית ונכשל ב-Vercel: data.gov.il חוסם או מגביל את כתובות ה-IP של Vercel.
   - נכשל גם מקומית: באג בקוד. לבדוק את ה-headers, את ה-URL שנבנה ואת `limit=1`.
4. **המטמון של Next** (`next: { revalidate: 3600 }` ב-fetch): ייתכן שנשמרה במטמון תגובה כושלת. לנסות `cache: 'no-store'` ולבדוק שוב.
5. **אם data.gov.il חוסם את Vercel**, כיווני פתרון לדיון עם המשתמש לפני מימוש:
   - לבצע את השאילתה ל-data.gov.il מהדפדפן (client-side). לבדוק קודם ש-CORS מאפשר את זה.
   - לשנות את ה-region של הפונקציה ב-Vercel (למשל ל-`fra1`), או להגדיר region קרוב לישראל.
   - לעבור דרך פרוקסי או שירות ביניים.

## הערות
- `/api/vehicle/lookup` משמש גם בגרידה לפי מספר רכב ב-admin/vehicles, לא רק במסכי החיפוש.
- באג מתועד: `bug-411` ב-`.wolf/buglog.json`.
- המשתמש מעדיף תשובות קצרות, ושיאשרו איתו תוכנית לפני פיצ'ר חדש.
