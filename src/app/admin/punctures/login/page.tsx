'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PunctureManagerLoginPage() {
  const router = useRouter()
  const [phone,    setPhone]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  useEffect(() => {
    // Already logged in as admin?
    const adminAuth = localStorage.getItem('wheels_admin_auth')
    if (adminAuth) {
      try {
        const { expiry } = JSON.parse(adminAuth)
        if (expiry && new Date().getTime() < expiry) {
          router.push('/admin/punctures')
          return
        }
      } catch { /* ignore */ }
    }
    // Already logged in as puncture manager?
    const pmAuth = localStorage.getItem('puncture_manager_auth')
    if (pmAuth) {
      try {
        const { expiry } = JSON.parse(pmAuth)
        if (expiry && new Date().getTime() < expiry) {
          router.push('/admin/punctures')
          return
        }
      } catch { /* ignore */ }
    }
  }, [router])

  const handleLogin = async () => {
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/admin/puncture-manager-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'שגיאה בהתחברות')
        return
      }
      const expiry = new Date().getTime() + 30 * 24 * 60 * 60 * 1000
      localStorage.setItem('puncture_manager_auth', JSON.stringify({ expiry, phone: phone.replace(/\D/g, ''), password }))
      router.push('/admin/punctures')
    } catch {
      setError('שגיאת רשת')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.box}>
        <div style={s.icon}>🔧</div>
        <h1 style={s.title}>ניהול פנצ׳ריות לילה</h1>
        <p style={s.sub}>הזן שם משתמש וסיסמה</p>
        <input
          type="text"
          placeholder="שם משתמש"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          style={s.input}
        />
        <input
          type="password"
          placeholder="סיסמה"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          style={{ ...s.input, marginTop: 10 }}
        />
        {error && <div style={s.error}>{error}</div>}
        <button onClick={handleLogin} disabled={loading} style={s.btn}>
          {loading ? 'מתחבר...' : 'כניסה'}
        </button>
        <a href="/punctures" style={s.back}>← חזרה לרשימת הפנצ׳ריות</a>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh', background: '#0f172a',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 20, fontFamily: "'Segoe UI', sans-serif", direction: 'rtl',
  },
  box: {
    width: '100%', maxWidth: 380,
    background: '#1e293b', border: '1px solid #334155',
    borderRadius: 20, padding: 40, textAlign: 'center',
  },
  icon: {
    width: 64, height: 64, borderRadius: 16,
    background: 'linear-gradient(135deg,#f59e0b,#d97706)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.8rem', margin: '0 auto 18px',
    boxShadow: '0 8px 24px rgba(245,158,11,0.3)',
  },
  title:  { fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 6px' },
  sub:    { color: '#64748b', margin: '0 0 22px', fontSize: '0.9rem' },
  input:  {
    width: '100%', padding: '11px 14px', background: '#0f172a',
    border: '1px solid #334155', borderRadius: 10, color: '#f8fafc',
    fontSize: '0.95rem', boxSizing: 'border-box',
  },
  error:  { color: '#ef4444', fontSize: '0.85rem', marginTop: 8 },
  btn: {
    width: '100%', marginTop: 16, padding: '13px',
    background: 'linear-gradient(135deg,#f59e0b,#d97706)',
    color: '#fff', border: 'none', borderRadius: 10,
    fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
  },
  back: { display: 'block', marginTop: 18, color: '#475569', fontSize: '0.85rem', textDecoration: 'none' },
}
