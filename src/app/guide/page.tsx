'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type GuideType = 'operator' | 'manager';

function GuideContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeGuide, setActiveGuide] = useState<GuideType>('operator');
  const [isManagerMode, setIsManagerMode] = useState(false);

  // Read tab from URL on mount - manager tab only accessible via URL param
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'manager') {
      setActiveGuide('manager');
      setIsManagerMode(true);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {isManagerMode ? 'מדריך למנהלי תחנות' : 'מדריך למוקדנים'}
          </h1>
          <button
            onClick={() => {
              // If we have history, go back; otherwise go to home
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push('/');
              }
            }}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            חזרה
          </button>
        </div>

        {/* Guide Type Selector - only show if manager mode (came from manager menu) */}
        {isManagerMode && (
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveGuide('operator')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                activeGuide === 'operator'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              🎧 מדריך למוקדנים
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
        )}

        {/* Guide Content */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {activeGuide === 'operator' ? <OperatorGuide /> : <ManagerGuide />}
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

function OperatorGuide() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
          <span className="text-2xl">🎧</span>
          ברוכים הבאים לממשק המוקדן
        </h2>
        <p className="text-gray-700 leading-relaxed">
          ממשק המוקדן מאפשר לכם לחפש גלגלים זמינים בתחנות ולסייע לפונים למצוא גלגל חילוף מתאים לרכב שלהם.
          לאחר מציאת גלגל מתאים, תוכלו לשלוח לפונה את פרטי התחנה וקישור למילוי טופס השאלה.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">🔐</span>
          התחברות למערכת
        </h2>
        <ol className="list-decimal list-inside text-gray-700 space-y-2 mr-4">
          <li>גשו לדף ההתחברות ובחרו &quot;מוקדן&quot;</li>
          <li>הזינו את מספר הטלפון שלכם</li>
          <li>הזינו את הסיסמה שקיבלתם ממנהל המוקד</li>
          <li>לחצו על &quot;התחבר&quot;</li>
        </ol>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <p className="text-blue-800">
            <strong>💡 טיפ:</strong> ההתחברות נשמרת במכשיר למשך 12 שעות - לא תצטרכו להתחבר שוב בכל שיחה.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">🔍</span>
          חיפוש גלגל - 3 דרכים
        </h2>
        <p className="text-gray-700 mb-4">בממשק המוקדן יש 3 טאבים לחיפוש. בחרו את הדרך המתאימה לפי המידע שקיבלתם מהפונה:</p>

        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-gray-800">🔢 טאב מספר רכב (מומלץ):</h3>
          <ol className="list-decimal list-inside text-gray-700 space-y-2 mr-4">
            <li>בקשו מהפונה את מספר הרכב (7-8 ספרות)</li>
            <li>הזינו את המספר ולחצו חיפוש</li>
            <li>המערכת תמשוך אוטומטית את נתוני הרכב: יצרן, דגם, שנה, PCD (מרווח ברגים) ו-CB (קדח מרכזי)</li>
            <li>יוצגו גלגלים זמינים התואמים לרכב</li>
          </ol>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 space-y-3 mt-3">
          <h3 className="font-semibold text-gray-800">🚘 טאב יצרן ודגם:</h3>
          <ol className="list-decimal list-inside text-gray-700 space-y-2 mr-4">
            <li>הקלידו יצרן (בעברית או אנגלית) - תופיע השלמה אוטומטית</li>
            <li>בחרו דגם מהרשימה</li>
            <li>הזינו שנת ייצור</li>
            <li>לחצו חיפוש</li>
          </ol>
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 mt-2">
            <p className="text-yellow-800 text-sm">
              <strong>⚠️ שימו לב:</strong> אם יש כמה מפרטים אפשריים לאותו דגם, יופיע מודאל לבחירת המפרט הנכון (PCD, CB שונים).
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 space-y-3 mt-3">
          <h3 className="font-semibold text-gray-800">🔧 טאב לפי מפרט:</h3>
          <p className="text-gray-600 mb-2">כשהפונה יודע את מידות הגלגל שלו:</p>
          <ol className="list-decimal list-inside text-gray-700 space-y-2 mr-4">
            <li>סננו לפי: כמות ברגים, מרווח ברגים (PCD), גודל ג&apos;אנט, קדח מרכזי (CB)</li>
            <li>יש לבחור לפחות פילטר אחד</li>
            <li>לחצו חיפוש</li>
          </ol>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">📊</span>
          קריאת תוצאות החיפוש
        </h2>
        <p className="text-gray-700 mb-4">
          התוצאות מוצגות לפי תחנות. כל גלגל מופיע ככרטיס עם המפרט שלו (PCD, גודל, CB).
        </p>

        <h3 className="font-semibold text-gray-800 mb-2">תגיות צבעוניות:</h3>
        <div className="space-y-2 mr-4">
          <div className="flex items-center gap-2">
            <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">✓ מתאים</span>
            <span className="text-gray-600">- גודל החישוק תואם בדיוק לרכב</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm font-medium">↓ קטן יותר</span>
            <span className="text-gray-600">- חישוק קטן יותר מהמקורי (ניתן לשימוש זמני)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-medium">🍩 דונאט</span>
            <span className="text-gray-600">- גלגל חירום (נסיעה עד 80 קמ&quot;ש בלבד)</span>
          </div>
        </div>

        <h3 className="font-semibold text-gray-800 mt-4 mb-2">אזהרות CB (קדח מרכזי):</h3>
        <div className="space-y-2 mr-4">
          <div className="flex items-start gap-2">
            <span className="text-red-600 font-bold">⚠️ אדום</span>
            <span className="text-gray-600">- קדח הגלגל קטן מקדח הרכב - הגלגל לא יתאים פיזית</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-orange-600 font-bold">⚠️ כתום</span>
            <span className="text-gray-600">- הפרש של 2 מ&quot;מ ומעלה - ייתכן צורך בטבעת מרכוז</span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">📤</span>
          שליחת פרטים לפונה
        </h2>
        <ol className="list-decimal list-inside text-gray-700 space-y-3 mr-4">
          <li>לחצו על הגלגל המתאים - ייפתח מודאל</li>
          <li>בחרו את איש הקשר בתחנה (מנהל התחנה)</li>
          <li>
            בחרו אחת משתי האפשרויות:
            <ul className="list-disc list-inside mr-6 mt-2 text-gray-600 space-y-2">
              <li>
                <strong>&quot;העתק הודעה&quot;</strong> - מעתיק הודעה מלאה הכוללת: הוראות לפונה, כתובת התחנה, שם וטלפון של מנהל התחנה, וקישור למילוי טופס ההשאלה
              </li>
              <li>
                <strong>&quot;העתק לינק לכונן&quot;</strong> - מעתיק רק את הקישור לטופס ההשאלה. מיועד לפונים עם מכשיר כשר (ללא וואטסאפ) - ניתן לשלוח את הלינק ב-SMS
              </li>
            </ul>
          </li>
          <li>שלחו את ההודעה או הלינק לפונה</li>
        </ol>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <p className="text-blue-800">
            <strong>💡 טיפ:</strong> הלינק כולל אוטומטית את מספר הגלגל ואת מזהה המוקדן שלכם למעקב.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">❓</span>
          שאלות נפוצות למוקדנים
        </h2>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">הרכב לא נמצא לפי מספר רכב - מה עושים?</h4>
            <p className="text-gray-600">נסו חיפוש בטאב &quot;יצרן ודגם&quot; - הזינו את פרטי הרכב ידנית. אם גם זה לא עוזר, נסו חיפוש לפי מפרט אם הפונה יודע את מידות הגלגל.</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">אין גלגלים תואמים בתוצאות - מה עושים?</h4>
            <p className="text-gray-600">נסו חיפוש לפי מפרט עם מידות קרובות (למשל חישוק קטן יותר ב-1 אינץ&apos;). ניתן גם להציע לפונה גלגל דונאט כפתרון זמני.</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">מה זה CB (קדח מרכזי) ולמה זה חשוב?</h4>
            <p className="text-gray-600">
              CB (Center Bore) הוא קוטר החור המרכזי של הג&apos;אנט. הקדח של הגלגל חייב להיות שווה או גדול מקדח הרכב.
              אם הקדח קטן מדי - הגלגל פשוט לא ייכנס. אם הקדח גדול מדי ב-2 מ&quot;מ ומעלה - ייתכן צורך בטבעת מרכוז.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">מה ההבדל בין &quot;מתאים&quot; ל&quot;קטן יותר&quot;?</h4>
            <p className="text-gray-600">
              &quot;מתאים&quot; (ירוק) - גודל החישוק זהה לגלגל המקורי של הרכב.
              &quot;קטן יותר&quot; (כתום) - חישוק קטן יותר, שעדיין ניתן להרכבה זמנית כגלגל חילוף. יש ליידע את הפונה שמדובר במידה קטנה יותר.
            </p>
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

        <h3 className="font-semibold text-gray-800 mt-4 mb-2">שחזור סיסמה באמצעות תעודת שחזור:</h3>
        <p className="text-gray-700 mb-2">אם שכחתם את הסיסמה וברשותכם תעודת שחזור (QR):</p>
        <ol className="list-decimal list-inside text-gray-700 space-y-2 mr-4">
          <li>לחצו על &quot;שכחתי סיסמה&quot; בדף ההתחברות</li>
          <li>העלו תמונה של תעודת השחזור או סרקו את קוד ה-QR</li>
          <li>הזינו סיסמה חדשה ואשרו</li>
        </ol>
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mt-2">
          <p className="text-yellow-800 text-sm">
            <strong>⚠️ חשוב:</strong> אם אין לכם תעודת שחזור, פנו למנהל המערכת. ראו בהמשך כיצד להוריד תעודת שחזור מההגדרות.
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
              <li>קדח מרכזי (CB) - קוטר החור המרכזי במ&quot;מ</li>
              <li>קטגוריה (גרמני, צרפתי, יפני/קוריאני)</li>
              <li>האם זה גלגל דונאט (חירום)</li>
              <li>פיקדון מותאם אישית (אופציונלי) - סכום שונה מברירת המחדל של התחנה</li>
              <li>הערות (אופציונלי) - הערות חופשיות על הגלגל</li>
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
            <li>הגלגל יישאר במערכת אך לא יוצג למוקדנים ולפונים</li>
          </ol>
          <p className="text-yellow-800 mt-2 text-sm">
            המערכת מתעדת אוטומטית מי סימן את הגלגל כלא זמין ומתי. ניתן להחזיר את הגלגל לזמינות בכל עת.
          </p>
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
          <li>בדקו את פרטי השואל, מספר הרכב (לוחית רישוי) והגלגל המבוקש</li>
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

        <h3 className="font-semibold text-gray-800 mt-4 mb-2">תעודת שחזור סיסמה:</h3>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 mb-2">
            תעודת שחזור מאפשרת לאפס סיסמה בעצמכם, ללא צורך בפנייה למנהל מערכת.
          </p>
          <ol className="list-decimal list-inside text-green-800 space-y-1">
            <li>גשו להגדרות התחנה</li>
            <li>לחצו על &quot;הצג תעודת שחזור&quot;</li>
            <li>לחצו &quot;הורד תעודה&quot; - תישמר כתמונה עם קוד QR</li>
            <li>שמרו את התעודה במקום בטוח (הדפסה או שמירה בטלפון)</li>
          </ol>
          <p className="text-green-800 mt-2 text-sm">
            <strong>💡 מומלץ:</strong> הורידו את התעודה מיד לאחר הגדרת התחנה ושמרו אותה במקום נגיש.
          </p>
        </div>
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
            <p className="text-gray-600">אם יש לכם תעודת שחזור (QR) - לחצו &quot;שכחתי סיסמה&quot; בדף ההתחברות, העלו את התעודה והגדירו סיסמה חדשה. אם אין לכם תעודה - פנו למנהל המערכת.</p>
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
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">מה זה פיקדון מותאם אישית?</h4>
            <p className="text-gray-600">ניתן לקבוע סכום פיקדון שונה לגלגל ספציפי (למשל גלגל יקר יותר). הסכום המותאם יחליף את ברירת המחדל של התחנה עבור אותו גלגל בלבד.</p>
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
