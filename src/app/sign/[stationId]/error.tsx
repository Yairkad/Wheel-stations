'use client'

import { useEffect } from 'react'

export default function SignFormError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Sign form crashed:', error)
  }, [error])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', direction: 'rtl', textAlign: 'center' }}>
      <div style={{ maxWidth: '420px', background: '#fff', borderRadius: '16px', padding: '32px 24px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '10px' }}>אירעה שגיאה בטעינת הטופס</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
          נסה לרענן את העמוד. אם הבעיה חוזרת, פנה לתחנה לקבלת קישור חדש.
        </p>
        <button
          onClick={reset}
          style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
        >
          נסה שוב
        </button>
      </div>
    </div>
  )
}
