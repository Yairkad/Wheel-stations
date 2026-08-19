# הערות למפתחים

תזכורות קטנות שקל לפספס בקוד הזה.

## חיפוש/זמינות גלגלים — לבדוק בכל מקום

יש כמה עמודים שכל אחד מהם מיישם בנפרד את הלוגיקה של "אילו גלגלים זמינים להשאלה":
`src/app/search/page.tsx`, `src/app/stations/page.tsx`, `src/app/[stationId]/page.tsx`,
`src/app/api/wheel-stations/[stationId]/public-borrow/route.ts`,
`src/app/api/wheel-stations/[stationId]/wheels/[wheelId]/borrow/route.ts`,
ו-**`src/app/operator/page.tsx`**.

כבר קרה בעבר (bug-129) ששינוי בכלל זמינות (למשל השדה `temporarily_unavailable`) נוסף לכל
העמודים האלה **חוץ** מ-`operator/page.tsx` — כי הוא נראה כמו כלי נפרד ("חיפוש למוקדן"), אבל
בפועל מריץ עותק שלישי משלו של אותה לוגיקה בדיוק.

**כל שינוי בכלל זמינות/התאמת גלגל — לבדוק גם ב-`operator/page.tsx`, לא רק בדפי החיפוש/תחנה
ה"רגילים".**
