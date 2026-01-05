import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ממשק מוקדן - תחנות גלגלים',
  description: 'ממשק מוקדן לחיפוש גלגלים ויצירת טפסי השאלה',
  manifest: '/operator-manifest.json',
  openGraph: {
    title: 'ממשק מוקדן - תחנות גלגלים',
    description: 'ממשק מוקדן לחיפוש גלגלים ויצירת טפסי השאלה',
    locale: 'he_IL',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'ממשק מוקדן - תחנות גלגלים',
    description: 'ממשק מוקדן לחיפוש גלגלים ויצירת טפסי השאלה',
  },
}

export default function OperatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
