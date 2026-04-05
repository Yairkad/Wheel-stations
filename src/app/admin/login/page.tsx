'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { verifyAdminPasswordClient } from '@/lib/admin-auth'
import { VERSION } from '@/lib/version'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    // Check if already logged in
    const savedAuth = localStorage.getItem('wheels_admin_auth')
    if (savedAuth) {
      try {
        const { expiry } = JSON.parse(savedAuth)
        if (expiry && new Date().getTime() < expiry) {
          // Already authenticated, redirect to admin
          router.push('/admin')
          return
        } else {
          localStorage.removeItem('wheels_admin_auth')
        }
      } catch {
        localStorage.removeItem('wheels_admin_auth')
      }
    }
  }, [router])

  const handleLogin = () => {
    if (verifyAdminPasswordClient(password)) {
      // Save with 30-day expiry
      const expiry = new Date().getTime() + (30 * 24 * 60 * 60 * 1000)
      localStorage.setItem('wheels_admin_auth', JSON.stringify({ expiry, pwd: password }))
      setPasswordError('')
      router.push('/admin')
    } else {
      setPasswordError('סיסמא שגויה')
    }
  }

  return (
    <div style={styles.loginContainer}>
      <style>{`
        @media (max-width: 480px) {
          .login-box-responsive {
            padding: 30px 20px !important;
          }
          .login-title-responsive {
            font-size: 1.3rem !important;
          }
          .login-logo-responsive {
            width: 60px !important;
            height: 60px !important;
          }
        }
      `}</style>
      <div style={styles.loginBox} className="login-box-responsive">
        <div style={styles.loginLogoIcon} className="login-logo-responsive"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
        <h1 style={styles.loginTitle} className="login-title-responsive">ניהול תחנות גלגלים</h1>
        <p style={styles.loginSubtitle}>הזן סיסמת מנהל</p>
        <div style={{ position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="סיסמא"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{...styles.formInput, paddingLeft: '40px'}}
            aria-label="סיסמת מנהל"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              fontSize: '16px',
              opacity: 0.7,
            }}
          >
            {showPassword
              ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            }
          </button>
        </div>
        {passwordError && <div style={styles.errorText}>{passwordError}</div>}
        <button style={styles.loginBtn} onClick={handleLogin}>כניסה</button>
        <Link href="/login" style={styles.backLink}>← חזרה ללוגין ראשי</Link>
        <div style={styles.versionText}>גרסה {VERSION}</div>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  loginContainer: {
    minHeight: '100vh',
    background: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    direction: 'rtl',
  },
  loginBox: {
    maxWidth: '400px',
    width: '100%',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    padding: '40px',
    textAlign: 'center',
    boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
  },
  loginLogoIcon: {
    width: '70px',
    height: '70px',
    background: '#16a34a',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    boxShadow: '0 8px 25px rgba(34, 197, 94, 0.3)',
  },
  loginTitle: {
    fontSize: '1.5rem',
    color: '#1e293b',
    fontWeight: 800,
    marginBottom: '8px',
    margin: '0 0 8px 0',
  },
  loginSubtitle: {
    color: '#64748b',
    marginBottom: '25px',
    margin: '0 0 25px 0',
  },
  formInput: {
    width: '100%',
    padding: '12px 14px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    color: '#1e293b',
    fontSize: '0.95rem',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
  },
  loginBtn: {
    width: '100%',
    background: '#16a34a',
    color: 'white',
    border: 'none',
    padding: '14px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '1rem',
    marginTop: '15px',
    transition: 'all 0.3s',
  },
  errorText: {
    color: '#ef4444',
    fontSize: '0.9rem',
    marginTop: '8px',
  },
  backLink: {
    display: 'block',
    marginTop: '20px',
    color: '#64748b',
    fontSize: '0.9rem',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  versionText: {
    marginTop: '20px',
    fontSize: '0.75rem',
    color: '#64748b',
  },
}
