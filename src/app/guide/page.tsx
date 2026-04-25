'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type GuideType = 'public' | 'operator' | 'manager' | 'call_center_manager';

function GuideContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeGuide, setActiveGuide] = useState<GuideType>('public');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'operator') setActiveGuide('operator');
    else if (tab === 'manager') setActiveGuide('manager');
    else if (tab === 'call-center-manager') setActiveGuide('call_center_manager');
    else setActiveGuide('public');
  }, [searchParams]);

  const handleTabChange = (tab: GuideType) => {
    setActiveGuide(tab);
    const tabParam = tab === 'call_center_manager' ? 'call-center-manager' : tab;
    const newUrl = tab === 'public' ? '/guide' : `/guide?tab=${tabParam}`;
    window.history.replaceState(null, '', newUrl);
  };

  const tabs: { id: GuideType; label: string; icon: React.ReactNode }[] = [
    {
      id: 'public',
      label: 'ציבורי',
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    },
    {
      id: 'operator',
      label: 'מוקדן',
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>,
    },
    {
      id: 'manager',
      label: 'מנהל תחנה',
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
    },
    {
      id: 'call_center_manager',
      label: 'מנהל מוקד',
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">מדריכים למשתמש</h1>
          <button
            onClick={() => {
              if (window.history.length > 1) router.back();
              else router.push('/');
            }}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            חזרה
          </button>
        </div>

        {/* Tab selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`py-3 px-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                activeGuide === tab.id
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Guide Content */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {activeGuide === 'public' && <PublicGuide />}
          {activeGuide === 'operator' && <OperatorGuide />}
          {activeGuide === 'manager' && <ManagerGuide />}
          {activeGuide === 'call_center_manager' && <CallCenterManagerGuide />}
        </div>
      </div>
    </div>
  );
}

export default function GuidePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">טוען...</p>
      </div>
    }>
      <GuideContent />
    </Suspense>
  );
}

// ─── PUBLIC GUIDE ─────────────────────────────────────────────────────────────

function PublicGuide() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          מה זמין לציבור
        </h2>
        <p className="text-gray-700 leading-relaxed">
          האתר מציע לציבור הרחב שתי תכונות עיקריות: מאגר פנצ׳ריות לילה ומנוע חיפוש הפוך לגלגלים.
        </p>
      </section>

      {/* פנצ'ריות לילה */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          פנצ׳ריות לילה
        </h2>
        <p className="text-gray-700 mb-4">
          מאגר פנצ׳ריות הפועלות בשעות הלילה. מועיל כשנתקלים בפנצ׳ר בשעות לא שגרתיות ומחפשים מוסך פתוח בסביבה.
        </p>

        <h3 className="font-semibold text-gray-800 mb-2">איך מוצאים פנצ׳ריה:</h3>
        <ol className="list-decimal list-inside text-gray-700 space-y-2 mr-4 mb-4">
          <li>בחרו אזור מהסרגל: צפון / מרכז / ירושלים והסביבה / דרום</li>
          <li>הרשימה תסתנן לפנצ׳ריות באותו אזור</li>
          <li>לחצו על פנצ׳ריה ברשימה לפתיחת הפרטים המלאים</li>
        </ol>

        <h3 className="font-semibold text-gray-800 mb-2">מידע שמוצג לכל פנצ׳ריה:</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4 mb-4">
          <li><strong>פתוח / סגור</strong> — סטטוס בזמן אמת לפי השעה הנוכחית</li>
          <li>שעות פירוט: א׳–ה׳, ערב/לילה, שישי, שבת</li>
          <li>כתובת מלאה עם אפשרויות ניווט</li>
          <li>פרטי קשר: שם איש קשר, טלפון, WhatsApp</li>
        </ul>

        <h3 className="font-semibold text-gray-800 mb-2">פעולות זמינות:</h3>
        <div className="space-y-2 mr-4 mb-4">
          <div className="flex items-start gap-2">
            <span className="text-blue-600 font-medium min-w-fit">התקשר</span>
            <span className="text-gray-600">לחיצה על אייקון הטלפון → פותח חיוג ישיר</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 font-medium min-w-fit">WhatsApp</span>
            <span className="text-gray-600">לחיצה על אייקון הוואטסאפ → פותח שיחה ישירה</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-indigo-600 font-medium min-w-fit">ניווט</span>
            <span className="text-gray-600">לחיצה על Google Maps או Waze → מפתח ניווט ישיר למקום</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-gray-600 font-medium min-w-fit">שתף</span>
            <span className="text-gray-600">שליחת פרטי הפנצ׳ריה בהודעת WhatsApp לאחר</span>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">
            <strong>הצעת פנצ׳ריה חדשה:</strong> אם אתם מכירים פנצ׳ריית לילה שאינה ברשימה, לחצו על &quot;הצע פנצ׳ריה&quot; ומלאו את הפרטים. ההצעה תועבר לבדיקה לפני הוספה למאגר.
          </p>
        </div>
      </section>

      {/* חיפוש הפוך */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3"/></svg>
          חיפוש הפוך
        </h2>
        <p className="text-gray-700 mb-4">
          כלי לגלות אילו רכבים תואמים לגלגל שברשותכם — שימושי כשיש גלגל ורוצים לדעת על אילו רכבים ניתן להרכיב אותו.
        </p>

        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-5">
          <p className="text-yellow-800">
            <strong className="inline-flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              שימו לב — הנתונים עלולים להיות חלקיים:
            </strong>{' '}
            מסד הנתונים מבוסס על מידע שנאסף ועלול להכיל שגיאות או פערים. תוצאות החיפוש הן אינדיקציה בלבד — לפני הרכבה בפועל, אמתו תמיד מול תיעוד הרכב הספציפי שברשותכם.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3"/></svg>
              מצב חיפוש הפוך — אילו רכבים מתאימים לגלגל שלי?
            </h3>
            <p className="text-gray-600 mb-3">מזינים את מפרט הגלגל והמערכת מחזירה רשימת רכבים שיכולים להשתמש בו:</p>
            <ol className="list-decimal list-inside text-gray-700 space-y-1 mr-4">
              <li>הזינו מספר רישוי של רכב שהגלגל שייך אליו (אם ידוע) — המערכת תמשוך את המפרט אוטומטית</li>
              <li>לחלופין: הזינו יצרן, דגם ושנה ידנית</li>
              <li>ניתן גם לערוך את מפרטי הגלגל ידנית לאחר המשיכה</li>
              <li>לחצו &quot;חפש&quot; — יוצגו רכבים תואמים מקובצים לפי יצרן</li>
            </ol>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="15" cy="17" r="2"/></svg>
              מצב השוואת רכבים — האם שני רכבים חולקים גלגל?
            </h3>
            <p className="text-gray-600 mb-3">שימושי כשרוצים לדעת האם ניתן להשאיל גלגל בין שני רכבים:</p>
            <ol className="list-decimal list-inside text-gray-700 space-y-1 mr-4">
              <li>הזינו פרטי הרכב הראשון (לפי לוחית רישוי או דגם)</li>
              <li>הזינו פרטי הרכב השני</li>
              <li>המערכת תציג האם הגלגלים תואמים ומה רמת ההתאמה</li>
            </ol>
          </div>
        </div>

        <h3 className="font-semibold text-gray-800 mt-5 mb-2">רמות התאמה בתוצאות:</h3>
        <div className="space-y-2 mr-4">
          <div className="flex items-start gap-2">
            <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-medium whitespace-nowrap">תואם מדויק</span>
            <span className="text-gray-600">PCD זהה ו-CB מתאים — הגלגל אמור להתאים</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-medium whitespace-nowrap">עם טבעת</span>
            <span className="text-gray-600">PCD תואם אך יש הפרש בקדח המרכזי — ייתכן צורך בטבעת מרכוז</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="inline-block px-2 py-1 bg-red-100 text-red-800 rounded text-sm font-medium whitespace-nowrap">טכני בלבד</span>
            <span className="text-gray-600">הגלגל נמצא במסד הנתונים אך לא מומלץ להרכבה בפועל</span>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── OPERATOR GUIDE ───────────────────────────────────────────────────────────

function OperatorGuide() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
          ברוכים הבאים לממשק המוקדן
        </h2>
        <p className="text-gray-700 leading-relaxed">
          ממשק המוקדן מאפשר לחפש גלגלים זמינים בתחנות ולסייע לפונים למצוא גלגל חילוף מתאים לרכב שלהם.
          לאחר מציאת גלגל מתאים, תוכלו לשלוח לפונה את פרטי התחנה וקישור למילוי טופס ההשאלה.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          התחברות למערכת
        </h2>
        <ol className="list-decimal list-inside text-gray-700 space-y-2 mr-4">
          <li>גשו לדף ההתחברות</li>
          <li>הזינו את מספר הטלפון שלכם</li>
          <li>הזינו את הסיסמה שקיבלתם ממנהל המוקד</li>
          <li>לחצו על &quot;התחבר&quot; — המערכת תנווט אתכם אוטומטית לממשק המוקדן</li>
        </ol>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <p className="text-blue-800">
            <strong>טיפ:</strong> ההתחברות נשמרת במכשיר למשך 12 שעות — לא תצטרכו להתחבר שוב בכל שיחה.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          חיפוש גלגל — 3 דרכים
        </h2>
        <p className="text-gray-700 mb-4">בממשק המוקדן יש 3 טאבים לחיפוש. בחרו את הדרך המתאימה לפי המידע שקיבלתם מהפונה:</p>

        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-gray-800 flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="7" y1="2" x2="7" y2="6"/><line x1="17" y1="2" x2="17" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            טאב מספר רכב (מומלץ):
          </h3>
          <ol className="list-decimal list-inside text-gray-700 space-y-2 mr-4">
            <li>בקשו מהפונה את מספר הרכב (7–8 ספרות)</li>
            <li>הזינו את המספר ולחצו חיפוש</li>
            <li>המערכת תמשוך אוטומטית: יצרן, דגם, שנה, PCD ו-CB</li>
            <li>יוצגו גלגלים זמינים התואמים לרכב</li>
          </ol>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 space-y-3 mt-3">
          <h3 className="font-semibold text-gray-800 flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="15" cy="17" r="2"/></svg>
            טאב יצרן ודגם:
          </h3>
          <ol className="list-decimal list-inside text-gray-700 space-y-2 mr-4">
            <li>הקלידו יצרן (בעברית או אנגלית) — תופיע השלמה אוטומטית</li>
            <li>בחרו דגם מהרשימה</li>
            <li>הזינו שנת ייצור</li>
            <li>לחצו חיפוש</li>
          </ol>
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 mt-2">
            <p className="text-yellow-800 text-sm">
              <strong>שימו לב:</strong> אם יש כמה מפרטים אפשריים לאותו דגם, יופיע מודאל לבחירת המפרט הנכון.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 space-y-3 mt-3">
          <h3 className="font-semibold text-gray-800 flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
            טאב לפי מפרט:
          </h3>
          <p className="text-gray-600 mb-2">כשהפונה יודע את מידות הגלגל שלו:</p>
          <ol className="list-decimal list-inside text-gray-700 space-y-2 mr-4">
            <li>סננו לפי: כמות ברגים, מרווח ברגים (PCD), גודל ג׳אנט, קדח מרכזי (CB)</li>
            <li>יש לבחור לפחות פילטר אחד</li>
            <li>לחצו חיפוש</li>
          </ol>
        </div>
      </section>

      {/* NEW: מונחים טכניים */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          הסבר מונחים טכניים
        </h2>
        <p className="text-gray-600 mb-4">הבנת המונחים האלה תעזור לכם לפרש תוצאות חיפוש ולהסביר לפונים.</p>

        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-800 mb-2">PCD — מרווח ברגים (Pitch Circle Diameter)</h3>
            <p className="text-gray-700 mb-2">
              קוטר העיגול הדמיוני שעובר דרך מרכז כל ברגי הגלגל. מסומן בפורמט <strong>כמות×קוטר</strong>, למשל <span className="font-mono bg-gray-100 px-1 rounded">5×114.3</span> = 5 ברגים על קוטר עיגול 114.3 מ&quot;מ.
            </p>
            <p className="text-gray-700 mb-3">
              <strong>למה זה קריטי:</strong> גלגל עם PCD שונה לא ייכנס פיזית — הברגים פשוט לא יצאו.
            </p>
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <p className="font-medium text-gray-700 mb-1">קטגוריות נפוצות:</p>
              <ul className="space-y-1 text-gray-600">
                <li><span className="font-medium">גרמני (5×112):</span> VW, Audi, Mercedes, BMW</li>
                <li><span className="font-medium">יפני/קוריאני (5×114.3):</span> Toyota, Hyundai, Kia, Honda, Mazda</li>
                <li><span className="font-medium">צרפתי (4×108):</span> Peugeot, Citroën, Renault</li>
              </ul>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-800 mb-2">CB — קדח מרכזי (Center Bore)</h3>
            <p className="text-gray-700 mb-2">
              קוטר החור המרכזי של הג׳אנט (בדרך כלל 56–74 מ&quot;מ). קדח הגלגל <strong>חייב להיות שווה או גדול</strong> מהקדח של הרכב.
            </p>
            <div className="space-y-2 mt-3">
              <div className="flex items-start gap-2">
                <span className="inline-flex items-center gap-1 text-green-700 font-bold whitespace-nowrap">ירוק —</span>
                <span className="text-gray-600">קדח הגלגל תואם בדיוק. אין בעיה.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="inline-flex items-center gap-1 text-orange-600 font-bold whitespace-nowrap">כתום —</span>
                <span className="text-gray-600">הפרש של 2 מ&quot;מ ומעלה. הגלגל יכנס, אך ייתכן ויידרשת טבעת מרכוז למניעת רטט.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="inline-flex items-center gap-1 text-red-600 font-bold whitespace-nowrap">אדום —</span>
                <span className="text-gray-600">קדח הגלגל קטן מקדח הרכב. הגלגל לא ייכנס פיזית.</span>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-800 mb-2">גודל ג׳אנט (אינצ׳ים)</h3>
            <p className="text-gray-700">
              קוטר הג׳אנט בסנטימטרים — לרוב 14&quot; עד 20&quot;. גלגל <strong>&quot;קטן יותר&quot;</strong> (כתום) הוא גלגל שגודל הג׳אנט שלו קטן יותר מהמקורי של הרכב — ניתן להרכבה זמנית כגלגל חילוף, אך יש ליידע את הפונה שמדובר במידה קטנה יותר.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-800 mb-2">גלגל דונאט</h3>
            <p className="text-gray-700">
              גלגל חירום קטן ורזה שנועד לנסיעה זמנית בלבד. <strong>מגבלות:</strong> מהירות מקסימלית 80 קמ"ש עקב קוד עומס שונה מהגלגלים המקוריים. הפונה חייב להחליפו בגלגל רגיל בהקדם.
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          קריאת תוצאות החיפוש
        </h2>
        <p className="text-gray-700 mb-4">
          התוצאות מוצגות לפי תחנות. כל גלגל מופיע ככרטיס עם המפרט שלו (PCD, גודל, CB).
        </p>

        <h3 className="font-semibold text-gray-800 mb-2">תגיות צבעוניות:</h3>
        <div className="space-y-2 mr-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>מתאים
            </span>
            <span className="text-gray-600">— גודל החישוק תואם בדיוק לרכב</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm font-medium">↓ קטן יותר</span>
            <span className="text-gray-600">— חישוק קטן יותר מהמקורי (ניתן לשימוש זמני)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-medium">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>דונאט
            </span>
            <span className="text-gray-600">— גלגל חירום (נסיעה עד 80 קמ&quot;ש בלבד)</span>
          </div>
        </div>

        <h3 className="font-semibold text-gray-800 mt-4 mb-2">אזהרות CB (קדח מרכזי):</h3>
        <div className="space-y-2 mr-4">
          <div className="flex items-start gap-2">
            <span className="text-red-600 font-bold whitespace-nowrap">אדום —</span>
            <span className="text-gray-600">קדח הגלגל קטן מקדח הרכב — הגלגל לא יתאים פיזית</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-orange-600 font-bold whitespace-nowrap">כתום —</span>
            <span className="text-gray-600">הפרש של 2 מ&quot;מ ומעלה — ייתכן צורך בטבעת מרכוז</span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          שליחת פרטים לפונה
        </h2>
        <ol className="list-decimal list-inside text-gray-700 space-y-3 mr-4">
          <li>לחצו על הגלגל המתאים — ייפתח מודאל</li>
          <li>בחרו את איש הקשר בתחנה (מנהל התחנה)</li>
          <li>
            בחרו אחת משתי האפשרויות:
            <ul className="list-disc list-inside mr-6 mt-2 text-gray-600 space-y-2">
              <li>
                <strong>&quot;העתק הודעה&quot;</strong> — מעתיק הודעה מלאה הכוללת הוראות לפונה, כתובת התחנה, שם וטלפון מנהל התחנה, וקישור לטופס ההשאלה
              </li>
              <li>
                <strong>&quot;העתק לינק לכונן&quot;</strong> — מעתיק רק את הקישור לטופס. מיועד לפונים עם מכשיר כשר — ניתן לשלוח לכונן שיוצא אליו
              </li>
            </ul>
          </li>
          <li>שלחו את ההודעה או הלינק לפונה</li>
        </ol>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <p className="text-blue-800">
            <strong>טיפ:</strong> הלינק כולל אוטומטית את מספר הגלגל ואת מזהה המוקדן שלכם למעקב.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          שאלות נפוצות למוקדנים
        </h2>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">הרכב לא נמצא לפי מספר רכב — מה עושים?</h4>
            <p className="text-gray-600">נסו חיפוש בטאב &quot;יצרן ודגם&quot; — הזינו את פרטי הרכב ידנית. אם גם זה לא עוזר, נסו חיפוש לפי מפרט אם הפונה יודע את מידות הגלגל.</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">אין גלגלים תואמים בתוצאות — מה עושים?</h4>
            <p className="text-gray-600">נסו חיפוש לפי מפרט עם מידות קרובות (למשל חישוק קטן יותר ב-1 אינץ׳). ניתן גם להציע גלגל דונאט כפתרון זמני.</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">מה זה CB ולמה זה חשוב?</h4>
            <p className="text-gray-600">
              CB הוא קוטר החור המרכזי של הג׳אנט. הקדח של הגלגל חייב להיות שווה או גדול מקדח הרכב.
              אם הקדח קטן מדי — הגלגל לא ייכנס. אם גדול מדי ב-2 מ&quot;מ ומעלה — ייתכן צורך בטבעת מרכוז.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">מה ההבדל בין &quot;מתאים&quot; ל&quot;קטן יותר&quot;?</h4>
            <p className="text-gray-600">
              &quot;מתאים&quot; (ירוק) — גודל החישוק זהה לגלגל המקורי.
              &quot;קטן יותר&quot; (כתום) — חישוק קטן יותר, שעדיין ניתן להרכבה זמנית. יש ליידע את הפונה שמדובר במידה קטנה יותר.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── MANAGER GUIDE ────────────────────────────────────────────────────────────

function ManagerGuide() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          מדריך למנהלי תחנות
        </h2>
        <p className="text-gray-700 leading-relaxed">
          מדריך זה מיועד למנהלי תחנות השאלה. כמנהל תחנה, באחריותכם לנהל את מלאי הגלגלים,
          לטפל בבקשות השאלה ולהבטיח שירות מעולה לשואלים.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          התחברות למערכת
        </h2>
        <ol className="list-decimal list-inside text-gray-700 space-y-2 mr-4">
          <li>גשו לדף התחנה שלכם</li>
          <li>לחצו על &quot;כניסת מנהל&quot;</li>
          <li>הזינו את מספר הטלפון שלכם (חייב להיות רשום כמנהל)</li>
          <li>הזינו את סיסמת התחנה</li>
          <li>לחצו על &quot;התחבר&quot;</li>
        </ol>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <p className="text-blue-800">
            <strong>טיפ:</strong> ההתחברות נשמרת במכשיר — לא תצטרכו להתחבר שוב בכל כניסה.
          </p>
        </div>

        <h3 className="font-semibold text-gray-800 mt-4 mb-2">שחזור סיסמה באמצעות תעודת שחזור:</h3>
        <p className="text-gray-700 mb-2">אם שכחתם את הסיסמה וברשותכם תעודת שחזור (QR):</p>
        <ol className="list-decimal list-inside text-gray-700 space-y-2 mr-4">
          <li>לחצו על &quot;שכחתי סיסמה&quot; בדף ההתחברות</li>
          <li>העלו תמונה של תעודת השחזור</li>
          <li>הזינו סיסמה חדשה ואשרו</li>
        </ol>
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mt-2">
          <p className="text-yellow-800 text-sm">
            <strong>חשוב:</strong> אם אין לכם תעודת שחזור, פנו למנהל המערכת. ראו בהמשך כיצד להוריד תעודת שחזור מההגדרות.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
          ניהול מלאי גלגלים
        </h2>

        <h3 className="font-semibold text-gray-800 mt-4 mb-2">הוספת גלגל חדש:</h3>
        <ol className="list-decimal list-inside text-gray-700 space-y-2 mr-4">
          <li>לחצו על &quot;הוסף גלגל&quot;</li>
          <li>
            מלאו את פרטי הגלגל:
            <ul className="list-disc list-inside mr-6 mt-1 text-gray-600">
              <li>מספר גלגל (מזהה ייחודי)</li>
              <li>גודל חישוק (15&quot;, 16&quot; וכו׳)</li>
              <li>מספר ברגים (4 או 5)</li>
              <li>מרווח ברגים (PCD)</li>
              <li>קדח מרכזי (CB) — קוטר החור המרכזי במ&quot;מ</li>
              <li>קטגוריה (גרמני, צרפתי, יפני/קוריאני)</li>
              <li>האם זה גלגל דונאט (חירום)</li>
              <li>פיקדון מותאם אישית (אופציונלי) — סכום שונה מברירת המחדל</li>
              <li>הערות (אופציונלי)</li>
            </ul>
          </li>
          <li>לחצו על &quot;שמור&quot;</li>
        </ol>

        <h3 className="font-semibold text-gray-800 mt-4 mb-2">עריכת גלגל:</h3>
        <ol className="list-decimal list-inside text-gray-700 space-y-2 mr-4">
          <li>מצאו את הגלגל ברשימה</li>
          <li>לחצו על כפתור העריכה (עיפרון)</li>
          <li>עדכנו את הפרטים הנדרשים</li>
          <li>לחצו על &quot;שמור&quot;</li>
        </ol>

        <h3 className="font-semibold text-gray-800 mt-4 mb-2">סימון גלגל כלא זמין:</h3>
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
          <p className="text-yellow-800 mb-2">
            השתמשו באפשרות זו כשגלגל צריך תיקון או לא זמין זמנית — אל תמחקו אותו!
          </p>
          <ol className="list-decimal list-inside text-yellow-800 space-y-1">
            <li>לחצו על &quot;סמן כלא זמין&quot;</li>
            <li>בחרו סיבה (תיקון, אחסון וכו׳)</li>
            <li>הוסיפו הערה במידת הצורך</li>
          </ol>
          <p className="text-yellow-800 mt-2 text-sm">
            הגלגל יישאר במערכת אך לא יוצג למוקדנים ולפונים. ניתן להחזיר לזמינות בכל עת.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          טיפול בבקשות השאלה
        </h2>

        <h3 className="font-semibold text-gray-800 mt-4 mb-2">בקשות ממתינות:</h3>
        <ol className="list-decimal list-inside text-gray-700 space-y-2 mr-4">
          <li>בקשות חדשות יופיעו בלשונית &quot;ממתינים&quot;</li>
          <li>תקבלו התראה על כל בקשה חדשה</li>
          <li>לחצו על הבקשה לצפייה בפרטים המלאים</li>
          <li>בדקו את פרטי השואל, מספר הרכב והגלגל המבוקש</li>
          <li><strong>לאישור:</strong> לחצו על &quot;אשר בקשה&quot;</li>
          <li><strong>לדחייה:</strong> לחצו על &quot;דחה&quot; (הגלגל ישוחרר)</li>
        </ol>

        <h3 className="font-semibold text-gray-800 mt-4 mb-2">השאלה ידנית (ללא טופס):</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-700 mb-2">במקרים דחופים ניתן לרשום השאלה ישירות:</p>
          <ol className="list-decimal list-inside text-gray-700 space-y-1">
            <li>לחצו על &quot;השאלה חדשה&quot;</li>
            <li>מלאו שם וטלפון של השואל</li>
            <li>בחרו גלגל</li>
            <li>בחרו סוג פיקדון</li>
            <li>לחצו &quot;שמור&quot;</li>
          </ol>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3"/></svg>
          החזרת גלגלים
        </h2>
        <ol className="list-decimal list-inside text-gray-700 space-y-2 mr-4">
          <li>מצאו את ההשאלה בלשונית &quot;מושאלים&quot;</li>
          <li>וודאו שהגלגל תקין</li>
          <li>לחצו על &quot;החזר גלגל&quot;</li>
          <li>הגלגל יסומן אוטומטית כזמין</li>
          <li>החזירו את הפיקדון לשואל</li>
        </ol>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
          <p className="text-red-800">
            <strong>חשוב:</strong> בדקו את הגלגל לפני סימון ההחזרה. אם יש נזק, תעדו אותו ושקלו ניכוי מהפיקדון.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          הגדרות תחנה
        </h2>
        <p className="text-gray-700 mb-4">רק מנהל ראשי יכול לשנות את הגדרות התחנה:</p>

        <h3 className="font-semibold text-gray-800 mt-4 mb-2">פרטי תחנה:</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
          <li>כתובת התחנה</li>
          <li>סכום פיקדון ברירת מחדל</li>
          <li>כתובות מייל לקבלת התראות</li>
        </ul>

        <h3 className="font-semibold text-gray-800 mt-4 mb-2">אמצעי תשלום:</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
          <li>הפעלה/כיבוי של מזומן</li>
          <li>ביט — עם מספר טלפון לקבלה</li>
          <li>פייבוקס — עם מספר טלפון לקבלה</li>
          <li>העברה בנקאית — עם פרטי חשבון</li>
          <li>פיקדון ת.ז./רישיון</li>
        </ul>

        <h3 className="font-semibold text-gray-800 mt-4 mb-2">ניהול מנהלים:</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
          <li>ניתן להוסיף עד 4 מנהלים לתחנה</li>
          <li>מנהל ראשי יכול לשנות את רשימת המנהלים</li>
          <li>לכל מנהל יש שם ומספר טלפון</li>
        </ul>

        <h3 className="font-semibold text-gray-800 mt-4 mb-2">שינוי סיסמה:</h3>
        <ol className="list-decimal list-inside text-gray-700 space-y-1 mr-4">
          <li>רק מנהל ראשי יכול לשנות סיסמה</li>
          <li>לחצו על &quot;שנה סיסמה&quot;</li>
          <li>הזינו את הסיסמה הנוכחית</li>
          <li>הזינו סיסמה חדשה (לפחות 4 תווים)</li>
          <li>לחצו &quot;שמור&quot;</li>
        </ol>

        <h3 className="font-semibold text-gray-800 mt-4 mb-2">תעודת שחזור סיסמה:</h3>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 mb-2">
            תעודת שחזור מאפשרת לאפס סיסמה בעצמכם, ללא צורך בפנייה למנהל מערכת.
          </p>
          <ol className="list-decimal list-inside text-green-800 space-y-1">
            <li>גשו להגדרות התחנה</li>
            <li>לחצו על &quot;הצג תעודת שחזור&quot;</li>
            <li>לחצו &quot;הורד תעודה&quot; — תישמר כתמונה עם קוד QR</li>
            <li>שמרו את התעודה במקום בטוח (הדפסה או שמירה בטלפון)</li>
          </ol>
          <p className="text-green-800 mt-2 text-sm">
            <strong>מומלץ:</strong> הורידו את התעודה מיד לאחר הגדרת התחנה ושמרו אותה במקום נגיש.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          דוחות וסטטיסטיקות
        </h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
          <li><strong>לשונית &quot;היסטוריה&quot;</strong> — צפייה בכל ההשאלות לאורך זמן</li>
          <li><strong>סינון</strong> — לפי סטטוס (ממתין/מושאל/הוחזר)</li>
          <li><strong>חיפוש</strong> — לפי שם או טלפון של שואל</li>
          <li><strong>ייצוא לאקסל</strong> — הורדת כל הנתונים לקובץ</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
          שיתוף קישור לטופס ההשאלה
        </h2>
        <p className="text-gray-700 mb-2">
          ניתן לשתף את קישור טופס ההשאלה ישירות מהתפריט:
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
          <li><strong>שלח בוואטסאפ</strong> — פותח WhatsApp עם הודעה מוכנה</li>
          <li><strong>העתק קישור</strong> — מעתיק את הקישור ללוח</li>
          <li><strong>פתח טופס</strong> — פותח את הטופס בדפדפן</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          שאלות נפוצות למנהלים
        </h2>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">מה עושים אם שכחתי את הסיסמה?</h4>
            <p className="text-gray-600">אם יש לכם תעודת שחזור (QR) — לחצו &quot;שכחתי סיסמה&quot; בדף ההתחברות, העלו את התעודה והגדירו סיסמה חדשה. אם אין לכם תעודה — פנו למנהל המערכת.</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">איך מוסיפים מנהל חדש?</h4>
            <p className="text-gray-600">רק מנהל ראשי יכול להוסיף מנהלים. גשו להגדרות ← ניהול מנהלים ← הוסף מנהל.</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">גלגל נשבר, מה עושים?</h4>
            <p className="text-gray-600">סמנו אותו כ&quot;לא זמין&quot; עם סיבה &quot;תיקון&quot;. אל תמחקו אותו מהמערכת.</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">שואל לא מחזיר בזמן?</h4>
            <p className="text-gray-600">צרו קשר טלפוני. אם אין מענה, שקלו חילוט הפיקדון. תעדו הכל במערכת.</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">איך מייבאים גלגלים מאקסל?</h4>
            <p className="text-gray-600">לחצו על &quot;יבוא/יצוא Excel&quot; מהתפריט, בחרו קובץ בפורמט המתאים, והמערכת תייבא את הגלגלים אוטומטית.</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">מה זה פיקדון מותאם אישית?</h4>
            <p className="text-gray-600">ניתן לקבוע סכום פיקדון שונה לגלגל ספציפי (למשל גלגל יקר יותר). הסכום המותאם יחליף את ברירת המחדל עבור אותו גלגל בלבד.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── CALL CENTER MANAGER GUIDE ────────────────────────────────────────────────

function CallCenterManagerGuide() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          מדריך למנהלי מוקד
        </h2>
        <p className="text-gray-700 leading-relaxed">
          מנהל המוקד אחראי על הפעלת המוקד — ניהול צוות המוקדנים ומנהלי המוקד, מעקב אחרי פניות, ושמירת פרטי הגישה לצוות.
          בנוסף, ניתן לעבור בכל עת למצב מוקדן רגיל לביצוע חיפוש גלגלים.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          התחברות למערכת
        </h2>
        <ol className="list-decimal list-inside text-gray-700 space-y-2 mr-4">
          <li>גשו לדף ההתחברות</li>
          <li>הזינו את מספר הטלפון שלכם</li>
          <li>הזינו את הסיסמה</li>
          <li>לחצו על &quot;התחבר&quot; — המערכת תנווט אתכם אוטומטית לממשק מנהל המוקד</li>
        </ol>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <p className="text-blue-800">
            <strong>טיפ:</strong> אם יש לכם גם תפקיד אחר במערכת (כגון מנהל תחנה), תוכלו לעבור בין התפקידים דרך תפריט התפקיד בכותרת.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
          ממשק מנהל המוקד — 3 לשוניות
        </h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-4">
            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold whitespace-nowrap">מוקדנים</span>
            <span className="text-gray-700">רשימת כל המוקדנים במוקד, ניהולם, קודי הכניסה שלהם וסטטוס פעילות.</span>
          </div>
          <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-4">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold whitespace-nowrap">מנהלים</span>
            <span className="text-gray-700">רשימת מנהלי המוקד ואפשרות להוסיף מנהלים נוספים.</span>
          </div>
          <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-4">
            <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-bold whitespace-nowrap">היסטוריה</span>
            <span className="text-gray-700">יומן פניות המוקד — פירוט של כל השאלה שטופלה: המוקדן שטיפל, התחנה, ופרטי השואל.</span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          ניהול מוקדנים
        </h2>

        <h3 className="font-semibold text-gray-800 mt-4 mb-2">הוספת מוקדן חדש:</h3>
        <ol className="list-decimal list-inside text-gray-700 space-y-2 mr-4">
          <li>לחצו על &quot;+ הוסף מוקדן&quot;</li>
          <li>הזינו שם מלא ומספר טלפון</li>
          <li>ניתן להזין קוד כניסה מותאם, או להשאיר ריק לקוד אוטומטי</li>
          <li>לחצו &quot;הוסף&quot;</li>
        </ol>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-3">
          <p className="text-green-800 text-sm">
            <strong>קוד כניסה:</strong> לאחר ההוספה המערכת תציג את קוד הכניסה שנוצר למוקדן. מסרו קוד זה למוקדן — הוא ישתמש בו יחד עם מספר הטלפון שלו להתחברות.
          </p>
        </div>

        <h3 className="font-semibold text-gray-800 mt-4 mb-2">עריכת מוקדן:</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
          <li>לחצו על כפתור העריכה ליד המוקדן</li>
          <li>ניתן לעדכן שם, טלפון, או לייצר קוד כניסה חדש</li>
          <li>יצירת קוד חדש תבטל את הקוד הישן</li>
        </ul>

        <h3 className="font-semibold text-gray-800 mt-4 mb-2">חסימת / הפעלת מוקדן:</h3>
        <p className="text-gray-700 mr-4">
          לחצו על &quot;חסום&quot; להשהיית הגישה של מוקדן מבלי למחוק אותו. לחצו שוב להפעלה מחדש.
        </p>

        <h3 className="font-semibold text-gray-800 mt-4 mb-2">מחיקת מוקדן:</h3>
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            מחיקה היא פעולה בלתי הפיכה. המערכת תבקש אישור לפני המחיקה.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          ניהול מנהלי מוקד
        </h2>

        <h3 className="font-semibold text-gray-800 mb-2">הוספת מנהל:</h3>
        <ol className="list-decimal list-inside text-gray-700 space-y-2 mr-4">
          <li>עברו ללשונית &quot;מנהלים&quot;</li>
          <li>לחצו &quot;+ הוסף מנהל&quot;</li>
          <li>מלאו שם מלא, מספר טלפון, סיסמה ותפקיד (כותרת)</li>
          <li>לחצו &quot;הוסף&quot;</li>
        </ol>

        <h3 className="font-semibold text-gray-800 mt-4 mb-2">מחיקת מנהל:</h3>
        <p className="text-gray-700 mr-4">
          לחצו על כפתור המחיקה ליד המנהל ואשרו. לא ניתן למחוק את עצמכם.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          היסטוריית פניות
        </h2>
        <p className="text-gray-700 mb-3">
          לשונית &quot;היסטוריה&quot; מציגה את כל הפניות שטופלו על ידי מוקדני המוקד:
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
          <li>תאריך ושעת הפנייה</li>
          <li>שם המוקדן שטיפל</li>
          <li>התחנה אליה הופנה השואל</li>
          <li>שם וטלפון השואל (אם מולאו בטופס)</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          חיפוש גלגלים (מצב מוקדן)
        </h2>
        <p className="text-gray-700 mb-3">
          מנהל מוקד יכול לעבור למצב מוקדן לחיפוש גלגלים בזמן אמת:
        </p>
        <ol className="list-decimal list-inside text-gray-700 space-y-2 mr-4">
          <li>לחצו על &quot;חיפוש גלגלים&quot; בכותרת הדף</li>
          <li>תועברו לממשק המוקדן הרגיל לביצוע חיפוש</li>
          <li>לחצו על &quot;חזור לניהול&quot; לחזרה לממשק מנהל המוקד</li>
        </ol>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-3">
          <p className="text-blue-800 text-sm">
            <strong>הסבר:</strong> הגישה למוקדן היא זמנית — הסשן שלכם כמנהל מוקד נשמר ותוכלו לחזור אליו.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          שינוי סיסמה
        </h2>
        <ol className="list-decimal list-inside text-gray-700 space-y-2 mr-4">
          <li>לחצו על שמכם בפינה הימנית העליונה</li>
          <li>בחרו &quot;שינוי סיסמה&quot;</li>
          <li>הזינו את הסיסמה הנוכחית</li>
          <li>הזינו וחזרו על הסיסמה החדשה</li>
          <li>לחצו &quot;שמור&quot;</li>
        </ol>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          שאלות נפוצות
        </h2>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">מוקדן שכח את קוד הכניסה שלו — מה עושים?</h4>
            <p className="text-gray-600">לחצו על כפתור העריכה ליד המוקדן ← &quot;צור קוד חדש&quot;. הקוד החדש יבטל את הישן.</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">מוקדן עזב — איך מונעים גישה?</h4>
            <p className="text-gray-600">ניתן לחסום אותו (מהיר, הפיך) או למחוק אותו לחלוטין. עדיף לחסום תחילה ולמחוק רק לאחר שמוודאים שאין צורך בהיסטוריה שלו.</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">כמה מנהלי מוקד ניתן להוסיף?</h4>
            <p className="text-gray-600">אין הגבלה קשיחה על מספר מנהלי המוקד.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
