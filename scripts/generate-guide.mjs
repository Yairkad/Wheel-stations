/**
 * User Guide Generator — מערכת גלגלים ידידים
 *
 * Requires: Storybook running on http://localhost:6006
 * Run: node scripts/generate-guide.mjs
 * Output: public/user-guide.pdf + public/user-guide.html
 */

import { chromium } from 'playwright-core'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SCREENSHOTS_DIR = join(ROOT, 'public', 'guide-screenshots')
const STORYBOOK_URL = 'http://localhost:6006'

function findBrowser() {
  const candidates = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    (process.env.LOCALAPPDATA || '') + '\\ms-playwright\\chromium-1208\\chrome-win64\\chrome.exe',
    (process.env.USERPROFILE || '') + '\\AppData\\Local\\ms-playwright\\chromium-1208\\chrome-win64\\chrome.exe',
  ].filter(Boolean)
  for (const p of candidates) {
    if (existsSync(p)) return p
  }
  return null
}

async function launchBrowser() {
  const executablePath = findBrowser()
  return chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    ...(executablePath ? { executablePath } : {}),
  })
}

const STORIES = [
  { id: 'pages-login--default',              key: 'login'     },
  { id: 'pages-station--visitor',            key: 'visitor'   },
  { id: 'pages-station--manager-wheels',     key: 'mgr-wheels'},
  { id: 'pages-station--manager-tracking',   key: 'mgr-track' },
  { id: 'pages-station--manager-alerts',     key: 'mgr-alerts'},
  { id: 'pages-station--manager-reports',    key: 'mgr-report'},
  { id: 'pages-search--station-list',        key: 'search'    },
  { id: 'pages-callcenter--operators',       key: 'cc-ops'    },
  { id: 'pages-callcenter--managers',        key: 'cc-mgrs'   },
  { id: 'pages-callcenter--history',         key: 'cc-hist'   },
]

async function captureScreenshot(browser, story, attempt = 1) {
  const page = await browser.newPage()
  await page.setViewportSize({ width: 390, height: 844 })
  const url = `${STORYBOOK_URL}/iframe.html?id=${story.id}&viewMode=story`
  if (attempt === 1) console.log(`  → ${story.id}`)
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 60000 })
    // Wait for play functions to complete and content to render
    await page.waitForTimeout(6000)
    const path = join(SCREENSHOTS_DIR, `${story.id}.png`)
    await page.screenshot({ path, type: 'png' })
    const bytes = readFileSync(path).length
    // If screenshot is suspiciously small (<10KB), retry once
    if (bytes < 10000 && attempt === 1) {
      console.warn(`  ⚠ ${story.id}: screenshot too small (${bytes}B), retrying...`)
      await page.close()
      return captureScreenshot(browser, story, 2)
    }
    return readFileSync(path).toString('base64')
  } catch (err) {
    if (attempt === 1) {
      console.warn(`  ⚠ ${story.id}: ${err.message.split('\n')[0]}, retrying...`)
      await page.close()
      return captureScreenshot(browser, story, 2)
    }
    console.error(`  ✗ ${story.id}: ${err.message.split('\n')[0]}`)
    return null
  } finally {
    try { await page.close() } catch {}
  }
}

// ─── Guide content ────────────────────────────────────────────────────────────

const GUIDE_PAGES = [
  // ── COVER ──────────────────────────────────────────────────────────────────
  {
    type: 'cover',
    html: `
      <div class="cover-logo">🚗</div>
      <h1 class="cover-title">מדריך למשתמש</h1>
      <h2 class="cover-subtitle">מערכת גלגלים ידידים</h2>
      <p class="cover-desc">מערכת מקוונת לניהול תחנות גלגלים חלופיים —
        מהשאלה ועד מעקב, בממשק נוח לנייד.</p>
      <div class="cover-meta">
        גרסה 5.5.5 &nbsp;|&nbsp; ${new Date().toLocaleDateString('he-IL')}
      </div>
    `,
  },

  // ── TOC ────────────────────────────────────────────────────────────────────
  {
    type: 'toc',
    html: `
      <h2 class="section-heading" style="margin-top:0">תוכן עניינים</h2>
      <div class="toc-grid">
        <div class="toc-chapter">
          <div class="toc-num">1</div>
          <div>
            <div class="toc-ch-title">🔐 כניסה למערכת</div>
            <ul class="toc-items">
              <li>כיצד להתחבר</li>
              <li>סוגי משתמשים</li>
            </ul>
          </div>
        </div>
        <div class="toc-chapter">
          <div class="toc-num">2</div>
          <div>
            <div class="toc-ch-title">🏪 תחנת גלגלים — מבקר</div>
            <ul class="toc-items">
              <li>צפייה במלאי</li>
              <li>פילטור גלגלים</li>
            </ul>
          </div>
        </div>
        <div class="toc-chapter">
          <div class="toc-num">3</div>
          <div>
            <div class="toc-ch-title">🔧 תחנת גלגלים — מנהל</div>
            <ul class="toc-items">
              <li>מלאי גלגלים</li>
              <li>מעקב השאלות</li>
              <li>התראות</li>
              <li>דוחות</li>
            </ul>
          </div>
        </div>
        <div class="toc-chapter">
          <div class="toc-num">4</div>
          <div>
            <div class="toc-ch-title">🔍 חיפוש גלגלים</div>
            <ul class="toc-items">
              <li>חיפוש לפי רכב</li>
              <li>חיפוש לפי מפרט</li>
            </ul>
          </div>
        </div>
        <div class="toc-chapter">
          <div class="toc-num">5</div>
          <div>
            <div class="toc-ch-title">📞 מוקד שירות</div>
            <ul class="toc-items">
              <li>ניהול מוקדנים</li>
              <li>ניהול מנהלים</li>
              <li>היסטוריית הפניות</li>
            </ul>
          </div>
        </div>
      </div>
    `,
  },

  // ── 1. LOGIN ──────────────────────────────────────────────────────────────
  {
    type: 'section-header',
    num: '1',
    icon: '🔐',
    title: 'כניסה למערכת',
    subtitle: 'כיצד להתחבר ומה ההבדל בין סוגי המשתמשים',
    color: '#7c3aed',
  },
  {
    type: 'content',
    screenshot: 'login',
    title: 'כניסה למערכת',
    color: '#7c3aed',
    content: `
      <h3 class="ct-title">כיצד מתחברים?</h3>
      <p class="ct-body">
        בדף הכניסה מזינים <strong>שם משתמש</strong> (מספר טלפון או שם) ו<strong>סיסמה / קוד</strong>.
        לחיצה על כפתור <em>"כניסה"</em> תפנה אתכם לדף המתאים לפי הרשאותיכם.
      </p>

      <h3 class="ct-title">סוגי משתמשים במערכת</h3>
      <ul class="ct-list">
        <li><strong>מנהל תחנה</strong> — מנהל מלאי הגלגלים בתחנה ספציפית, מאשר השאלות ומנהל מעקב.</li>
        <li><strong>מנהל מחוז</strong> — מפקח על מספר תחנות במחוז, צופה בנתוני כל התחנות.</li>
        <li><strong>מנהל מוקד</strong> — מנהל את המוקד הטלפוני, מוסיף ומנהל מוקדנים.</li>
        <li><strong>מוקדן</strong> — מקבל שיחות ומפנה לוקחים לתחנות מתאימות.</li>
      </ul>

      <h3 class="ct-title">שכחתי סיסמה</h3>
      <p class="ct-body">
        לחצו על הקישור <em>"שכחתי סיסמא (למנהלי תחנה)"</em> בתחתית הטופס.
        תוכלו לאפס סיסמה באמצעות קוד שחזור שסופק לכם בעת הרשמה.
      </p>

      <div class="ct-note">
        💡 <strong>טיפ:</strong> המערכת שומרת את הכניסה שלכם למשך 7 ימים.
        אין צורך להתחבר מחדש בכל כניסה.
      </div>
    `,
  },

  // ── 2. VISITOR ────────────────────────────────────────────────────────────
  {
    type: 'section-header',
    num: '2',
    icon: '🏪',
    title: 'תחנת גלגלים — מבקר',
    subtitle: 'כיצד לצפות במלאי ולמצוא גלגל מתאים',
    color: '#0891b2',
  },
  {
    type: 'content',
    screenshot: 'visitor',
    title: 'צפייה במלאי הגלגלים',
    color: '#0891b2',
    content: `
      <h3 class="ct-title">מהי תחנת גלגלים?</h3>
      <p class="ct-body">
        תחנת גלגלים היא נקודה שבה שומרים גלגלים חלופיים להשאלה לנהגים שנתקעו.
        כל תחנה מציגה את מלאי הגלגלים הזמינים, כולל פרטים טכניים ומידע ליצירת קשר.
      </p>

      <h3 class="ct-title">פילטור גלגלים מתאימים</h3>
      <p class="ct-body">ניתן לסנן את רשימת הגלגלים לפי שלושה פרמטרים עיקריים:</p>
      <ul class="ct-list">
        <li><strong>גודל ג'אנט</strong> — גודל הגלגל באינצ'ים (למשל 15, 16, 17, 18).</li>
        <li><strong>כמות ברגים</strong> — מספר ברגי ההידוק (4 או 5 בדרך כלל).</li>
        <li><strong>מרווח ברגים (PCD)</strong> — המרחק בין הברגים, למשל 100, 108, 112 מ"מ.</li>
      </ul>

      <h3 class="ct-title">תצוגת כרטיסים ורשימה</h3>
      <p class="ct-body">
        ניתן לעבור בין תצוגת <strong>כרטיסים</strong> (ברירת מחדל) לתצוגת <strong>רשימה</strong>
        באמצעות הכפתורים בפינה. תצוגת הרשימה נוחה לסריקה מהירה של הנתונים הטכניים.
      </p>

      <div class="ct-note">
        📋 <strong>שים לב:</strong> גלגלים המסומנים בצבע אדום הם <em>מושאלים</em> כרגע
        ואינם זמינים לאיסוף מיידי.
      </div>
    `,
  },

  // ── 3. MANAGER ────────────────────────────────────────────────────────────
  {
    type: 'section-header',
    num: '3',
    icon: '🔧',
    title: 'תחנת גלגלים — מנהל',
    subtitle: 'ניהול מלאי, מעקב השאלות, התראות ודוחות',
    color: '#16a34a',
  },
  {
    type: 'content',
    screenshot: 'mgr-wheels',
    title: 'מנהל — מלאי גלגלים',
    color: '#16a34a',
    content: `
      <h3 class="ct-title">כניסה כמנהל תחנה</h3>
      <p class="ct-body">
        לאחר כניסה לחשבון, מנהל התחנה רואה את אותה עמוד התחנה אך עם
        <strong>לשוניות ניהול</strong> נוספות: מלאי גלגלים, מעקב השאלות, התראות ודוחות.
      </p>

      <h3 class="ct-title">הוספת גלגל חדש</h3>
      <ol class="ct-list">
        <li>לחצו על כפתור <strong>"+ הוסף גלגל"</strong> בפינה.</li>
        <li>מלאו את מספר הגלגל, גודל הג'אנט, מספר ברגים ומרווח ברגים.</li>
        <li>בחרו קטגוריה (גרמניות / צרפתיות / יפניות) אם רלוונטי.</li>
        <li>לחצו <strong>"שמור"</strong> — הגלגל יופיע מיד ברשימה.</li>
      </ol>

      <h3 class="ct-title">השאלת גלגל ידנית</h3>
      <p class="ct-body">
        לחצו על תפריט שלוש הנקודות (⋮) על כרטיס הגלגל ובחרו <em>"השאלה ידנית"</em>.
        מלאו שם שואל, טלפון, דגם רכב וסוג הפיקדון. לאחר אישור,
        הגלגל יסומן כ<strong>"מושאל"</strong> והרשומה תישמר במעקב.
      </p>

      <div class="ct-note">
        ✅ <strong>פיקדון:</strong> ניתן לקבל פיקדון במזומן, Bit, Paybox או העברה בנקאית —
        בהתאם להגדרות התחנה.
      </div>
    `,
  },
  {
    type: 'content',
    screenshot: 'mgr-track',
    title: 'מנהל — מעקב השאלות',
    color: '#16a34a',
    content: `
      <h3 class="ct-title">מה מציג מעקב ההשאלות?</h3>
      <p class="ct-body">
        לשונית <strong>מעקב השאלות</strong> מרכזת את כל ההשאלות הפעילות והסגורות
        בתחנה. בטבלה מופיע שם השואל, מספר הרכב, תאריך ההשאלה ופרטי הפיקדון.
      </p>

      <h3 class="ct-title">סינון לפי סטטוס</h3>
      <ul class="ct-list">
        <li><strong>הכל</strong> — כל ההשאלות ללא סינון.</li>
        <li><strong>ממתינות לאישור</strong> — טפסים שעדיין לא נחתמו דיגיטלית.</li>
        <li><strong>מושאלים</strong> — השאלות פעילות שהגלגל עדיין אצל השואל.</li>
        <li><strong>הוחזרו</strong> — גלגלים שהוחזרו בהצלחה.</li>
      </ul>

      <h3 class="ct-title">עדכון החזרה</h3>
      <p class="ct-body">
        כשגלגל מוחזר — לחצו על השורה המתאימה, בחרו <em>"סמן כהוחזר"</em>
        ואשרו. הגלגל יחזור לסטטוס <strong>"זמין"</strong> ברשימת המלאי.
      </p>

      <div class="ct-note">
        📊 <strong>ייצוא לאקסל:</strong> לחצו על כפתור הייצוא בראש הדף כדי להוריד
        את כל נתוני ההשאלות כקובץ Excel.
      </div>
    `,
  },
  {
    type: 'content',
    screenshot: 'mgr-alerts',
    title: 'מנהל — התראות',
    color: '#dc2626',
    content: `
      <h3 class="ct-title">מהן התראות?</h3>
      <p class="ct-body">
        לשונית <strong>התראות</strong> מציגה אירועים הדורשים תשומת לב מיידית של מנהל התחנה.
        המספר שמופיע על הלשונית מציין כמה התראות פעילות יש.
      </p>

      <h3 class="ct-title">סוגי התראות</h3>
      <ul class="ct-list">
        <li>
          <strong>השאלות ארוכות</strong> — כל גלגל שהושאל לפני יותר מ-7 ימים
          ועדיין לא הוחזר. לחיצה על ההתראה תראה את פרטי השואל.
        </li>
        <li>
          <strong>גלגלים שנמחקו</strong> — גלגלים שהוסרו מהמלאי עם אפשרות שחזור.
        </li>
      </ul>

      <h3 class="ct-title">טיפול בהתראה</h3>
      <ol class="ct-list">
        <li>לחצו על ההתראה לצפייה בפרטים.</li>
        <li>ניתן לצור קשר עם השואל ישירות מתוך ההתראה.</li>
        <li>לאחר טיפול — לחצו <em>"סמן כנראה"</em> להסרת ההתראה מהרשימה.</li>
      </ol>

      <div class="ct-note">
        🔔 <strong>התראות Push:</strong> ניתן להפעיל התראות דפדפן בלשונית זו
        כדי לקבל עדכון מיידי בכל בקשת השאלה חדשה.
      </div>
    `,
  },
  {
    type: 'content',
    screenshot: 'mgr-report',
    title: 'מנהל — דוחות',
    color: '#7c3aed',
    content: `
      <h3 class="ct-title">מה מציגים הדוחות?</h3>
      <p class="ct-body">
        לשונית <strong>דוחות</strong> מספקת תמונה סטטיסטית על פעילות התחנה לאורך זמן —
        כמה השאלות בוצעו, מה שיעור הניצול ומהם הגלגלים הפעילים ביותר.
      </p>

      <h3 class="ct-title">סוגי הנתונים בדוח</h3>
      <ul class="ct-list">
        <li><strong>השאלות לפי חודש</strong> — גרף עמודות של כמות ההשאלות החודשיות.</li>
        <li><strong>שיעור ניצול מלאי</strong> — אחוז הגלגלים שמושאלים בממוצע.</li>
        <li><strong>ממוצע זמן השאלה</strong> — כמה ימים בממוצע גלגל מושאל.</li>
        <li><strong>סוגי פיקדון</strong> — פילוח לפי מזומן, Bit ו-Paybox.</li>
      </ul>

      <h3 class="ct-title">ייצוא נתונים</h3>
      <p class="ct-body">
        לחצו על <strong>"ייצוא Excel"</strong> לקבלת קובץ מפורט של כל ההשאלות בתקופה
        הנבחרת, מתאים לדיווח ולניתוח חיצוני.
      </p>

      <div class="ct-note">
        📈 <strong>טיפ:</strong> ניתן לבחור טווח תאריכים מותאם אישית לסינון הדוח.
      </div>
    `,
  },

  // ── 4. SEARCH ─────────────────────────────────────────────────────────────
  {
    type: 'section-header',
    num: '4',
    icon: '🔍',
    title: 'חיפוש גלגלים',
    subtitle: 'מציאת גלגל מתאים לפי פרטי הרכב או המפרט הטכני',
    color: '#ea580c',
  },
  {
    type: 'content',
    screenshot: 'search',
    title: 'חיפוש גלגל מתאים',
    color: '#ea580c',
    content: `
      <h3 class="ct-title">שתי שיטות חיפוש</h3>
      <p class="ct-body">
        המערכת מציעה שתי דרכים למצוא גלגל חלופי מתאים לרכב שלכם:
      </p>

      <h3 class="ct-title">1. חיפוש לפי רכב</h3>
      <p class="ct-body">
        הזינו <strong>מספר לוחית רישוי</strong> או בחרו <strong>יצרן ודגם</strong> מהרשימה.
        המערכת תאחזר אוטומטית את מפרט הגלגל הסטנדרטי עבור אותו רכב ותציג תחנות עם גלגלים תואמים.
      </p>

      <h3 class="ct-title">2. חיפוש לפי מפרט טכני</h3>
      <p class="ct-body">
        אם ידוע לכם המפרט הטכני של הגלגל — הזינו ידנית:
      </p>
      <ul class="ct-list">
        <li><strong>גודל ג'אנט</strong> (אינצ'ים)</li>
        <li><strong>מספר ברגים</strong> (4 או 5)</li>
        <li><strong>מרווח ברגים — PCD</strong> (מ"מ)</li>
      </ul>

      <h3 class="ct-title">פירוש תוצאות החיפוש</h3>
      <p class="ct-body">
        התוצאות מסודרות לפי מרחק מיקום. כל תחנה מציגה:
        כמות גלגלים זמינים, כתובת ומספר טלפון לתיאום.
      </p>

      <div class="ct-note">
        📍 <strong>טיפ:</strong> ניתן לשתף את לינק החיפוש ישירות עם הלקוח
        כדי שיוכל לראות בעצמו אילו תחנות קרובות אליו.
      </div>
    `,
  },

  // ── 5. CALL CENTER ────────────────────────────────────────────────────────
  {
    type: 'section-header',
    num: '5',
    icon: '📞',
    title: 'מוקד שירות',
    subtitle: 'ניהול מוקדנים, מנהלים והיסטוריית הפניות',
    color: '#0891b2',
  },
  {
    type: 'content',
    screenshot: 'cc-ops',
    title: 'מוקד — ניהול מוקדנים',
    color: '#0891b2',
    content: `
      <h3 class="ct-title">תפקיד המוקדן</h3>
      <p class="ct-body">
        מוקדן הוא עובד שמקבל שיחות מנהגים שנתקעו, מחפש תחנה עם גלגל מתאים
        ומפנה אותם. לכל מוקדן יש <strong>קוד כניסה אישי</strong> בן 4 ספרות.
      </p>

      <h3 class="ct-title">הוספת מוקדן חדש</h3>
      <ol class="ct-list">
        <li>לחצו <strong>"+ הוסף מוקדן"</strong>.</li>
        <li>מלאו שם מלא ושם משתמש (טלפון).</li>
        <li>ניתן להגדיר קוד מותאם אישית, או להשאיר ריק לקוד אוטומטי.</li>
        <li>לחצו <strong>"הוסף"</strong> — הקוד יוצג מיד.</li>
      </ol>

      <h3 class="ct-title">ניהול מוקדנים קיימים</h3>
      <p class="ct-body">
        לחיצה על <strong>⋮</strong> ליד כל מוקדן פותחת תפריט:
      </p>
      <ul class="ct-list">
        <li><strong>עריכה</strong> — שינוי שם או שם משתמש.</li>
        <li><strong>קוד חדש</strong> — הפקת קוד כניסה חדש.</li>
        <li><strong>חסימה / הפעלה</strong> — חסימה זמנית מבלי למחוק.</li>
        <li><strong>מחיקה</strong> — הסרה מלאה מהמערכת.</li>
      </ul>

      <div class="ct-note">
        🔑 <strong>כניסת מוקדן:</strong> מוקדן נכנס במסך הכניסה עם שם המשתמש שלו
        והקוד בן 4 הספרות (ללא סיסמה ארוכה).
      </div>
    `,
  },
  {
    type: 'content',
    screenshot: 'cc-mgrs',
    title: 'מוקד — ניהול מנהלים',
    color: '#0891b2',
    content: `
      <h3 class="ct-title">מי רואה את לשונית המנהלים?</h3>
      <p class="ct-body">
        לשונית <strong>מנהלים</strong> מוצגת רק למנהל <em>ראשי</em> של המוקד.
        היא מאפשרת הוספה וניהול של מנהלי מוקד נוספים.
      </p>

      <h3 class="ct-title">הוספת מנהל מוקד</h3>
      <ol class="ct-list">
        <li>לחצו <strong>"+ הוסף מנהל"</strong>.</li>
        <li>מלאו שם מלא, שם משתמש, סיסמה ותפקיד (אופציונלי).</li>
        <li>לחצו <strong>"הוסף"</strong> לשמירה.</li>
      </ol>

      <h3 class="ct-title">הרשאות מנהל ראשי לעומת רגיל</h3>
      <ul class="ct-list">
        <li><strong>מנהל ראשי</strong> — גישה לניהול מנהלים, לא ניתן למחוק.</li>
        <li><strong>מנהל רגיל</strong> — ניהול מוקדנים והיסטוריה בלבד.</li>
      </ul>

      <div class="ct-note">
        🔒 <strong>אבטחה:</strong> כל מנהל יכול לשנות את הסיסמה שלו דרך
        תפריט הפרופיל בפינה הימנית העליונה.
      </div>
    `,
  },
  {
    type: 'content',
    screenshot: 'cc-hist',
    title: 'מוקד — היסטוריית הפניות',
    color: '#0891b2',
    content: `
      <h3 class="ct-title">מה מוצג בהיסטוריה?</h3>
      <p class="ct-body">
        לשונית <strong>היסטוריה</strong> מציגה יומן של כל ההפניות שבוצעו על ידי המוקדנים —
        מי ביצע את ההפניה, לאיזו תחנה, ומהם פרטי הלקוח שהופנה.
      </p>

      <h3 class="ct-title">פירוט כל רשומה</h3>
      <ul class="ct-list">
        <li><strong>תאריך ושעה</strong> — מתי בוצעה ההפניה.</li>
        <li><strong>שם המוקדן</strong> — מי ביצע את ההפניה.</li>
        <li><strong>שם התחנה</strong> — לאיזו תחנה הופנה הלקוח.</li>
        <li><strong>פרטי הלקוח</strong> — שם ומספר טלפון (אם הוזנו).</li>
      </ul>

      <h3 class="ct-title">מטרת ההיסטוריה</h3>
      <p class="ct-body">
        ההיסטוריה מאפשרת <strong>מעקב אחר ביצועי המוקדנים</strong>, בדיקת מקרים ספציפיים
        ומענה ללקוחות שפנו בעבר. ניתן לגלול אחורה ולראות את כל הפניות מאז פתיחת המוקד.
      </p>

      <div class="ct-note">
        📋 <strong>תזכורת:</strong> רשומות שבהן שם הלקוח ריק מייצגות הפניות
        שבוצעו ללא תיעוד פרטי הלקוח.
      </div>
    `,
  },
]

// ─── HTML builder ─────────────────────────────────────────────────────────────

function buildHTML(screenshots) {
  const imgSrc = (key) => {
    const story = STORIES.find(s => s.key === key)
    if (!story) return ''
    const b64 = screenshots[story.id]
    return b64 ? `data:image/png;base64,${b64}` : ''
  }

  let pages = ''
  for (const p of GUIDE_PAGES) {
    if (p.type === 'cover') {
      pages += `<div class="page cover-page">${p.html}</div>`
    } else if (p.type === 'toc') {
      pages += `<div class="page toc-page">${p.html}</div>`
    } else if (p.type === 'section-header') {
      pages += `
        <div class="page section-header-page" style="--sc:${p.color}">
          <div class="sh-num">${p.num}</div>
          <div class="sh-icon">${p.icon}</div>
          <h2 class="sh-title">${p.title}</h2>
          <p class="sh-sub">${p.subtitle}</p>
        </div>`
    } else if (p.type === 'content') {
      const src = imgSrc(p.screenshot)
      pages += `
        <div class="page content-page">
          <div class="cp-header" style="border-color:${p.color}">
            <span class="cp-title">${p.title}</span>
          </div>
          <div class="cp-body">
            <div class="cp-text">${p.content}</div>
            <div class="cp-shot">
              ${src
                ? `<img src="${src}" class="shot-img" alt="${p.title}">`
                : '<div class="shot-missing">צילום לא זמין</div>'}
            </div>
          </div>
        </div>`
    }
  }

  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
<meta charset="UTF-8">
<title>מדריך למשתמש — גלגלים ידידים</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

body{
  font-family:'Segoe UI',Arial,sans-serif;
  background:#f1f5f9;
  color:#1e293b;
  direction:rtl;
  -webkit-print-color-adjust:exact;
  print-color-adjust:exact;
}

/* ── PAGE ── */
.page{
  width:210mm;
  min-height:297mm;
  margin:0 auto 12px;
  background:white;
  page-break-after:always;
  page-break-inside:avoid;
  overflow:hidden;
}

/* ── COVER ── */
.cover-page{
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:14px;
  padding:40mm 30mm;
  background:linear-gradient(150deg,#7c3aed 0%,#4338ca 60%,#1e293b 100%);
  color:white;
  text-align:center;
}
.cover-logo{font-size:72px;line-height:1}
.cover-title{font-size:40px;font-weight:800;letter-spacing:-1px}
.cover-subtitle{font-size:22px;font-weight:600;opacity:.9}
.cover-desc{font-size:14px;opacity:.75;line-height:1.7;max-width:280px}
.cover-meta{font-size:12px;opacity:.55;margin-top:10px}

/* ── TOC ── */
.toc-page{padding:18mm 20mm}
.section-heading{font-size:26px;font-weight:800;color:#7c3aed;
  padding-bottom:10px;border-bottom:3px solid #7c3aed;margin-bottom:24px}
.toc-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.toc-chapter{display:flex;gap:14px;align-items:flex-start;
  background:#f8fafc;border-radius:12px;padding:14px;
  border:1px solid #e2e8f0}
.toc-num{width:32px;height:32px;border-radius:50%;background:#7c3aed;
  color:white;display:flex;align-items:center;justify-content:center;
  font-size:15px;font-weight:800;flex-shrink:0}
.toc-ch-title{font-size:14px;font-weight:700;color:#1e293b;margin-bottom:6px}
.toc-items{padding-right:14px;list-style:disc}
.toc-items li{font-size:12px;color:#64748b;margin-bottom:3px}

/* ── SECTION HEADER ── */
.section-header-page{
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:16px;
  padding:40mm 30mm;
  background:linear-gradient(150deg,var(--sc,#7c3aed) 0%,#1e293b 100%);
  color:white;
  text-align:center;
}
.sh-num{font-size:64px;font-weight:900;opacity:.25;line-height:1;margin-bottom:-10px}
.sh-icon{font-size:56px;line-height:1}
.sh-title{font-size:34px;font-weight:800}
.sh-sub{font-size:15px;opacity:.8;line-height:1.6;max-width:320px}

/* ── CONTENT PAGE ── */
.content-page{padding:14mm 16mm 12mm;display:flex;flex-direction:column;gap:14px}
.cp-header{
  border-right:5px solid #7c3aed;
  padding:6px 14px;
  background:#f8fafc;
  border-radius:0 8px 8px 0;
}
.cp-title{font-size:18px;font-weight:800;color:#1e293b}
.cp-body{display:flex;gap:18px;flex:1;align-items:flex-start}
.cp-text{flex:1;min-width:0}
.cp-shot{flex-shrink:0;width:170px}
.shot-img{width:170px;border-radius:14px;
  box-shadow:0 6px 24px rgba(0,0,0,.16);
  border:1px solid #e2e8f0;display:block}
.shot-missing{width:170px;height:340px;border-radius:14px;
  border:2px dashed #e2e8f0;display:flex;align-items:center;
  justify-content:center;color:#94a3b8;font-size:12px}

/* ── TEXT ELEMENTS ── */
.ct-title{
  font-size:13.5px;font-weight:700;color:#1e293b;
  margin:12px 0 5px;
  padding-bottom:3px;
  border-bottom:1px solid #f1f5f9;
}
.ct-title:first-child{margin-top:0}
.ct-body{font-size:13px;color:#374151;line-height:1.7}
.ct-list{font-size:13px;color:#374151;line-height:1.7;
  padding-right:18px;list-style:none}
.ct-list li{margin-bottom:5px;position:relative;padding-right:14px}
.ct-list li::before{content:"•";position:absolute;right:0;color:#7c3aed;font-weight:700}
ol.ct-list{counter-reset:item}
ol.ct-list li{counter-increment:item}
ol.ct-list li::before{content:counter(item)".";color:#7c3aed}
.ct-note{
  margin-top:10px;
  background:#faf5ff;
  border:1px solid #e9d5ff;
  border-radius:8px;
  padding:10px 12px;
  font-size:12px;
  color:#5b21b6;
  line-height:1.6;
}

@media print{
  body{background:white}
  .page{box-shadow:none;margin:0;page-break-after:always}
}
</style>
</head>
<body>
${pages}
</body>
</html>`
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 מתחיל יצירת מדריך...\n')
  mkdirSync(SCREENSHOTS_DIR, { recursive: true })

  // Verify Storybook is running
  {
    const browser = await launchBrowser()
    const page = await browser.newPage()
    try {
      await page.goto(STORYBOOK_URL, { timeout: 6000 })
    } catch {
      console.error('❌ Storybook לא רץ על פורט 6006. הפעל: npm run storybook')
      await browser.close(); process.exit(1)
    }
    await browser.close()
  }

  console.log('📸 מצלם סטוריז...\n')
  const browser = await launchBrowser()
  const screenshots = {}

  for (const story of STORIES) {
    process.stdout.write(`  📷 ${story.id} ... `)
    const b64 = await captureScreenshot(browser, story)
    screenshots[story.id] = b64
    console.log(b64 ? '✓' : '✗')
  }
  await browser.close()

  console.log('\n📄 בונה HTML...')
  const html = buildHTML(screenshots)
  const htmlPath = join(ROOT, 'public', 'user-guide.html')
  writeFileSync(htmlPath, html, 'utf-8')
  console.log(`   ✓ ${htmlPath}`)

  console.log('🖨️  מייצר PDF...')
  const pdfBrowser = await launchBrowser()
  const page = await pdfBrowser.newPage()
  await page.setContent(html, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  const pdfPath = join(ROOT, 'public', 'user-guide.pdf')
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  })
  await pdfBrowser.close()
  console.log(`   ✓ ${pdfPath}`)

  console.log('\n✅ הסתיים!')
  console.log(`   📄 PDF: ${pdfPath}`)
  console.log(`   🌐 HTML: ${htmlPath}`)
}

main().catch(err => { console.error('שגיאה:', err); process.exit(1) })
