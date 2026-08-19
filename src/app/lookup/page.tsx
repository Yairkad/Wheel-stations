'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// This page used to duplicate /reverse-search's "find a matching wheel" logic.
// Merged into /reverse-search (the more capable of the two public tools) —
// this page now just forwards visitors there instead of maintaining a second copy.
export default function VehicleLookupPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/reverse-search')
  }, [router])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc',
      direction: 'rtl',
      textAlign: 'center',
      padding: '20px',
    }}>
      <p style={{ color: '#64748b', fontSize: '0.95rem' }}>מעביר אותך לחיפוש גלגל תואם...</p>
    </div>
  )
}
