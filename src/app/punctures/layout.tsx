import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'פנצ׳ריות לילה | גלגלים',
  description: 'מצא פנצ׳ריית לילה קרובה אליך — מפה אינטראקטיבית עם שעות פעילות, טלפונים וניווט ישיר',
  openGraph: {
    title: 'פנצ׳ריות לילה | גלגלים',
    description: 'מצא פנצ׳ריית לילה קרובה אליך — שעות פעילות, טלפונים וניווט',
    siteName: 'גלגלים',
    locale: 'he_IL',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'פנצ׳ריות לילה | גלגלים',
    description: 'מצא פנצ׳ריית לילה קרובה אליך',
  },
}

export default function PuncturesLayout({ children }: { children: React.ReactNode }) {
  return children
}
