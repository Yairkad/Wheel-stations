import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'צפייה בטופס השאלה | ידידים',
  description: 'צפייה והורדת טופס השאלת גלגל חתום',
  robots: 'noindex, nofollow', // Don't index private forms
}

export default function FormViewerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
