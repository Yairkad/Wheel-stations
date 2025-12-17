'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type GuideType = 'user' | 'manager';

export default function GuidePage() {
  const router = useRouter();
  const [activeGuide, setActiveGuide] = useState<GuideType>('user');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">מדריך למשתמש</h1>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            חזרה
          </button>
        </div>

        {/* Guide Type Selector */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveGuide('user')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeGuide === 'user'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            👤 מדריך לשואלים
          </button>
          <button
            onClick={() => setActiveGuide('manager')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeGuide === 'manager'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            🔧 מדריך למנהלי תחנות
          </button>
        </div>

        {/* Guide Content */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {activeGuide === 'user' ? <UserGuide /> : <ManagerGuide />}
        </div>
      </div>
    </div>
  );
}

function UserGuide() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          ברוכים הבאים למערכת השאלת גלגלים
        </h2>
        <p className="text-gray-700 leading-relaxed">
          מערכת השאלת הגלגלים מאפשרת לך למצוא ולשאול גלגל חילוף זמני בקלות ובמהירות.
          השירות מופעל על ידי מתנדבים ומיועד לסייע בעת תקר או צורך בגלגל חילוף.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">🔍</span>
          שלב 1: מציאת גלגל מתאים
        </h2>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-gray-800">אפשרות א&apos; - חיפוש לפי מספר רכב:</h3>
          <ol className="list-decimal list-inside text-gray-700 space-y-2 mr-4">
            <li>לחצו על &quot;חיפוש לפי מספר רכב&quot; בעמוד הראשי</li>
            <li>הזינו את מספר הרכב שלכם (7-8 ספרות)</li>
            <li>המערכת תציג את סוג הרכב ומידות הגלגל המתאימות</li>
            <li>תוצגנה התחנות עם גלגלים זמינים התואמים לרכב שלכם</li>
          </ol>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3 mt-3">
          <h3 className="font-semibold text-gray-800">אפשרות ב&apos; - חיפוש לפי דגם רכב:</h3>
          <ol className="list-decimal list-inside text-gray-700 space-y-2 mr-4">
            <li>לחצו על &quot;חיפוש לפי דגם רכב&quot;</li>
            <li>בחרו יצרן, דגם ושנה</li>
            <li>המערכת תציג את מידות הגלגל הנדרשות</li>
          </ol>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3 mt-3">
          <h3 className="font-semibold text-gray-800">אפשרות ג&apos; - חיפוש לפי מידות:</h3>
          <ol className="list-decimal list-inside text-gray-700 space-y-2 mr-4">
            <li>לחצו על &quot;חיפוש מתקדם&quot;</li>
            <li>סננו לפי: גודל חישוק, מספר ברגים, מרווח ברגים (PCD)</li>
            <li>ניתן לסנן גם לפי מחוז ולפי זמינות</li>
          </ol>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">📋</span>
          שלב 2: מילוי טופס השאלה
        </h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-blue-800 font-medium">💡 טיפ: ודאו שאתם פונים לתחנה בשעות הפעילות שלה</p>
        </div>
        <ol className="list-decimal list-inside text-gray-700 space-y-3 mr-4">
          <li>לחצו על כפתור &quot;השאלת גלגל&quot; בתחנה הרצויה</li>
          <li>
            מלאו את הפרטים האישיים:
            <ul className="list-disc list-inside mr-6 mt-1 text-gray-600">
              <li>שם פרטי ומשפחה</li>
              <li>תעודת זהות (9 ספרות)</li>
              <li>מספר טלפון</li>
              <li>כתובת מגורים</li>
            </ul>
          </li>
          <li>בחרו את הגלגל הרצוי מהרשימה</li>
          <li>הזינו את דגם הרכב שלכם</li>
          <li>
            בחרו אמצעי פיקדון:
            <ul className="list-disc list-inside mr-6 mt-1 text-gray-600">
              <li><strong>מזומן</strong> - פיקדון במזומן בתחנה</li>
              <li><strong>ביט / פייבוקס</strong> - העברה באפליקציה</li>
              <li><strong>העברה בנקאית</strong> - העברה לחשבון</li>
              <li><strong>פיקדון תעודה</strong> - הפקדת ת.ז. או רישיון (באישור מנהל)</li>
            </ul>
          </li>
        </ol>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">✍️</span>
          שלב 3: חתימה ואישור
        </h2>
        <ol className="list-decimal list-inside text-gray-700 space-y-2 mr-4">
          <li>קראו את תנאי ההשאלה בקפידה</li>
          <li>גללו את התנאים עד הסוף כדי להפעיל את תיבת האישור</li>
          <li>סמנו את תיבת האישור</li>
          <li>חתמו בשדה החתימה הדיגיטלית (באמצעות אצבע או עכבר)</li>
          <li>לחצו על &quot;שלח בקשה&quot;</li>
        </ol>
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mt-4">
          <p className="text-yellow-800">
            <strong>⚠️ שימו לב:</strong> הבקשה תישלח למנהל התחנה לאישור.
            תקבלו הודעה כאשר הבקשה תאושר.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">⏰</span>
          תנאי ההשאלה
        </h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <ul className="text-red-800 space-y-2">
            <li>• <strong>זמן החזרה:</strong> עד 72 שעות (3 ימים) מרגע ההשאלה</li>
            <li>• <strong>הארכה:</strong> ניתן להאריך עד 5 ימים באישור מנהל התחנה</li>
            <li>• <strong>מהירות:</strong> יש לנסוע עד 80 קמ&quot;ש בלבד</li>
            <li>• <strong>פיקדון:</strong> יוחזר עם החזרת הגלגל במצב תקין</li>
            <li>• <strong>אי החזרה:</strong> אי החזרה בזמן עלולה לגרום לחילוט הפיקדון</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">🔄</span>
          החזרת הגלגל
        </h2>
        <ol className="list-decimal list-inside text-gray-700 space-y-2 mr-4">
          <li>החזירו את הגלגל לתחנה ממנה שאלתם</li>
          <li>צרו קשר עם מנהל התחנה לתיאום</li>
          <li>וודאו שהגלגל תקין ונקי</li>
          <li>קבלו את הפיקדון חזרה</li>
        </ol>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">❓</span>
          שאלות נפוצות
        </h2>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">מה עושים אם אין גלגל מתאים?</h4>
            <p className="text-gray-600">נסו לחפש בתחנות אחרות באזור, או התקשרו למנהל התחנה - יתכן שיש גלגל שלא מופיע במערכת.</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">כמה עולה השירות?</h4>
            <p className="text-gray-600">השירות הוא בהתנדבות וללא עלות. הפיקדון מוחזר במלואו עם החזרת הגלגל.</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">איך יודעים אם הגלגל מתאים לרכב שלי?</h4>
            <p className="text-gray-600">השתמשו בחיפוש לפי מספר רכב - המערכת תציג רק גלגלים תואמים. אם אתם לא בטוחים, התייעצו עם מנהל התחנה.</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">מה קורה אם לא אחזיר בזמן?</h4>
            <p className="text-gray-600">צרו קשר עם מנהל התחנה מראש לבקשת הארכה. אי החזרה ללא תיאום עלולה לגרום לחילוט הפיקדון.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function ManagerGuide() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
          <span className="text-2xl">🔧</span>
          מדריך למנהלי תחנות
        </h2>
        <p className="text-gray-700 leading-relaxed">
          מדריך זה מיועד למנהלי תחנות השאלה. כמנהל תחנה, באחריותכם לנהל את מלאי הגלגלים,
          לטפל בבקשות השאלה ולהבטיח שירות מעולה לשואלים.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">🔐</span>
          התחברות למערכת
        </h2>
        <ol className="list-decimal list-inside text-gray-700 space-y-2 mr-4">
          <li>גשו לדף התחנה שלכם</li>
          <li>לחצו על &quot;כניסת מנהלים&quot;</li>
          <li>הזינו את מספר הטלפון שלכם (חייב להיות רשום כמנהל)</li>
          <li>הזינו את סיסמת התחנה</li>
          <li>לחצו על &quot;התחבר&quot;</li>
        </ol>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <p className="text-blue-800">
            <strong>💡 טיפ:</strong> ההתחברות נשמרת במכשיר - לא תצטרכו להתחבר שוב בכל כניסה.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">📦</span>
          ניהול מלאי גלגלים
        </h2>

        <h3 className="font-semibold text-gray-800 mt-4 mb-2">הוספת גלגל חדש:</h3>
        <ol className="list-decimal list-inside text-gray-700 space-y-2 mr-4">
          <li>לחצו על &quot;הוסף גלגל&quot;</li>
          <li>
            מלאו את פרטי הגלגל:
            <ul className="list-disc list-inside mr-6 mt-1 text-gray-600">
              <li>מספר גלגל (מזהה ייחודי)</li>
              <li>גודל חישוק (15&quot;, 16&quot; וכו&apos;)</li>
              <li>מספר ברגים (4 או 5)</li>
              <li>מרווח ברגים (PCD)</li>
              <li>קטגוריה (גרמני, צרפתי, יפני/קוריאני)</li>
              <li>האם זה גלגל דונאט (חירום)</li>
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
            השתמשו באפשרות זו כשגלגל צריך תיקון או לא זמין זמנית (לא למחוק!)
          </p>
          <ol className="list-decimal list-inside text-yellow-800 space-y-1">
            <li>לחצו על &quot;סמן כלא זמין&quot;</li>
            <li>בחרו סיבה (תיקון, אחסון וכו&apos;)</li>
            <li>הוסיפו הערה במידת הצורך</li>
            <li>הגלגל יישאר במערכת אך לא יוצג לשואלים</li>
          </ol>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">📝</span>
          טיפול בבקשות השאלה
        </h2>

        <h3 className="font-semibold text-gray-800 mt-4 mb-2">בקשות ממתינות:</h3>
        <ol className="list-decimal list-inside text-gray-700 space-y-2 mr-4">
          <li>בקשות חדשות יופיעו בלשונית &quot;ממתינים&quot;</li>
          <li>תקבלו התראה על כל בקשה חדשה</li>
          <li>לחצו על הבקשה לצפייה בפרטים המלאים</li>
          <li>בדקו את פרטי השואל והגלגל המבוקש</li>
          <li>
            <strong>לאישור:</strong> לחצו על &quot;אשר בקשה&quot;
          </li>
          <li>
            <strong>לדחייה:</strong> לחצו על &quot;דחה&quot; (הגלגל ישוחרר)
          </li>
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
          <span className="text-2xl">🔄</span>
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
            <strong>⚠️ חשוב:</strong> בדקו את הגלגל לפני סימון ההחזרה.
            אם יש נזק, תעדו אותו ושקלו ניכוי מהפיקדון.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">⚙️</span>
          הגדרות תחנה
        </h2>
        <p className="text-gray-700 mb-4">רק מנהל ראשי יכול לשנות את הגדרות התחנה:</p>

        <h3 className="font-semibold text-gray-800 mt-4 mb-2">פרטי תחנה:</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
          <li>כתובת התחנה</li>
          <li>סכום פיקדון</li>
          <li>כתובות מייל לקבלת התראות</li>
        </ul>

        <h3 className="font-semibold text-gray-800 mt-4 mb-2">אמצעי תשלום:</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
          <li>הפעלה/כיבוי של מזומן</li>
          <li>ביט - עם מספר טלפון לקבלה</li>
          <li>פייבוקס - עם מספר טלפון לקבלה</li>
          <li>העברה בנקאית - עם פרטי חשבון</li>
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
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">📊</span>
          דוחות וסטטיסטיקות
        </h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
          <li><strong>לשונית &quot;היסטוריה&quot;</strong> - צפייה בכל ההשאלות לאורך זמן</li>
          <li><strong>סינון</strong> - לפי סטטוס (ממתין/מושאל/הוחזר)</li>
          <li><strong>חיפוש</strong> - לפי שם או טלפון של שואל</li>
          <li><strong>ייצוא לאקסל</strong> - הורדת כל הנתונים לקובץ</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">📱</span>
          שיתוף בוואטסאפ
        </h2>
        <p className="text-gray-700 mb-2">
          ניתן לשתף פרטי גלגל בוואטסאפ בקלות:
        </p>
        <ol className="list-decimal list-inside text-gray-700 space-y-1 mr-4">
          <li>לחצו על אייקון הוואטסאפ ליד הגלגל</li>
          <li>תיפתח אפליקציית וואטסאפ עם הודעה מוכנה</li>
          <li>בחרו את איש הקשר ושלחו</li>
        </ol>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">❓</span>
          שאלות נפוצות למנהלים
        </h2>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">מה עושים אם שכחתי את הסיסמה?</h4>
            <p className="text-gray-600">פנו למנהל המערכת לאיפוס הסיסמה.</p>
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
            <p className="text-gray-600">לחצו על &quot;ייבוא מאקסל&quot;, בחרו קובץ בפורמט המתאים, והמערכת תייבא את הגלגלים אוטומטית.</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">📞</span>
          תמיכה
        </h2>
        <p className="text-gray-700">
          לשאלות נוספות או תמיכה טכנית, השתמשו בעמוד המשוב במערכת או פנו למנהל המערכת.
        </p>
      </section>
    </div>
  );
}
