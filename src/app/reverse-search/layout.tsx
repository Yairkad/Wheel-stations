import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'חיפוש גלגל תואם - מצא רכב שיכול להשאיל לך',
  description: 'מצא אילו רכבים יכולים להשאיל לך גלגל עם התאמה מלאה',
  openGraph: {
    title: 'חיפוש גלגל תואם - מצא רכב שיכול להשאיל לך',
    description: 'מצא אילו רכבים יכולים להשאיל לך גלגל עם התאמה מלאה',
    locale: 'he_IL',
    type: 'website',
  },
}

export default function ReverseSearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
