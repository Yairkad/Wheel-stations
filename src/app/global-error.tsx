'use client'

import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Unhandled app crash:', error)
  }, [error])

  return (
    <html lang="he" dir="rtl">
      <body>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
          <div style={{ maxWidth: '420px', background: '#fff', borderRadius: '16px', padding: '32px 24px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '10px' }}>אירעה שגיאה באפליקציה</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
              נסה לרענן את העמוד, או חזור לרשימת התחנות.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={reset}
                style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
              >
                נסה שוב
              </button>
              {/* Plain <a>, not next/link — this replaces the root layout entirely, so a
                  full navigation is the most reliable way out of a broken render state. */}
              <a
                href="/stations"
                style={{ padding: '10px 24px', borderRadius: '10px', border: '1px solid #cbd5e1', color: '#334155', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
              >
                חזרה לתחנות
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
