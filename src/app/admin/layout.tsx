import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ניהול תחנות השאלת גלגלים - ידידים',
  description: 'ממשק ניהול תחנות השאלת גלגלים',
  manifest: '/admin-manifest.json',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
