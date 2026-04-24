'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { Fingerprint } from 'lucide-react'
import { SESSION_VERSION, VERSION } from '@/lib/version'
import type { RoleResult } from '@/app/api/auth/login/route'

export default function LoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [roles, setRoles] = useState<RoleResult[] | null>(null)
  const [rememberRole, setRememberRole] = useState(false)
  const [savedPreferredRole, setSavedPreferredRole] = useState<string | null>(null)
  const [passkeyLoading, setPasskeyLoading] = useState(false)
  const [showPasskeyPrompt, setShowPasskeyPrompt] = useState(false)
  const [promptRoles, setPromptRoles] = useState<RoleResult[] | null>(null)
  const [promptPhone, setPromptPhone] = useState('')
  const [promptRegistering, setPromptRegistering] = useState(false)

  useEffect(() => {
    setSavedPreferredRole(localStorage.getItem('preferred_role'))
  }, [])

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPhone, setForgotPhone] = useState('')
  const [forgotNewPassword, setForgotNewPassword] = useState('')
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('')
  const [forgotError, setForgotError] = useState('')
  const [forgotSuccess, setForgotSuccess] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)

  const handleForgotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!forgotPhone) { setForgotError('נא להזין מספר טלפון'); return }
    if (!forgotNewPassword || !forgotConfirmPassword) { setForgotError('נא למלא סיסמא חדשה ואימות'); return }
    if (forgotNewPassword !== forgotConfirmPassword) { setForgotError('הסיסמאות לא תואמות'); return }
    if (forgotNewPassword.length < 4) { setForgotError('הסיסמא חייבת להכיל לפחות 4 תווים'); return }

    setForgotError('')
    setForgotLoading(true)

    try {
      const jsQR = (await import('jsqr')).default
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(file)
      })
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new window.Image()
        image.onload = () => resolve(image)
        image.onerror = () => reject(new Error('Failed to load image'))
        image.src = dataUrl
      })
      const canvas = document.createElement('canvas')
      const maxSize = 1024
      let w = img.width
      let h = img.height
      if (w > maxSize || h > maxSize) {
        const ratio = Math.min(maxSize / w, maxSize / h)
        w = Math.round(w * ratio)
        h = Math.round(h * ratio)
      }
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) { setForgotError('שגיאה בעיבוד התמונה'); setForgotLoading(false); return }
      ctx.drawImage(img, 0, 0, w, h)
      const imageData = ctx.getImageData(0, 0, w, h)
      const qrCode = jsQR(imageData.data, imageData.width, imageData.height)
      if (!qrCode) {
        setForgotError('לא נמצא קוד QR בתמונה. נסה תמונה ברורה יותר.')
        setForgotLoading(false)
        return
      }
      const response = await fetch('/api/wheel-stations/recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: forgotPhone, recovery_key: qrCode.data, new_password: forgotNewPassword })
      })
      const data = await response.json()
      if (!response.ok) {
        setForgotError(data.error || 'שגיאה באיפוס הסיסמא')
        setForgotLoading(false)
        return
      }
      setForgotSuccess(true)
      toast.success('הסיסמא אופסה בהצלחה!')
    } catch {
      setForgotError('שגיאה באיפוס הסיסמא')
    } finally {
      setForgotLoading(false)
      e.target.value = ''
    }
  }

  // Save session to localStorage and redirect for a given role
  const applyRole = (role: RoleResult) => {
    const d = role.data
    switch (role.role) {
      case 'station_manager': {
        const session = {
          manager: { ...d, type: 'wheel_station' },
          stationId: d.station_id,
          stationName: d.station_name,
          password,
          timestamp: Date.now(),
          version: SESSION_VERSION
        }
        localStorage.setItem(`station_session_${d.station_id}`, JSON.stringify(session))
        router.push(`/${d.station_id}`)
        break
      }
      case 'operator': {
        const session = {
          user: { id: d.id, full_name: d.full_name, phone: d.phone, title: d.title, is_primary: d.is_primary },
          role: d.sub_role === 'manager' ? 'manager' : 'operator',
          callCenterId: d.call_center_id,
          callCenterName: d.call_center_name,
          password,
          timestamp: Date.now(),
          version: SESSION_VERSION
        }
        localStorage.setItem('operator_session', JSON.stringify(session))
        router.push(d.sub_role === 'manager' ? '/call-center' : '/operator')
        break
      }
      case 'district_manager': {
        const session = {
          superManager: { id: d.id, full_name: d.full_name, phone: d.phone, allowed_districts: d.allowed_districts },
          password,
          timestamp: Date.now(),
          version: SESSION_VERSION
        }
        localStorage.setItem('super_manager_session', JSON.stringify(session))
        router.push('/super-manager')
        break
      }
      case 'editor': {
        const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000
        localStorage.setItem('puncture_manager_auth', JSON.stringify({ expiry, phone: d.phone, password }))
        router.push('/admin/punctures')
        break
      }
      case 'admin': {
        const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000
        localStorage.setItem('wheels_admin_auth', JSON.stringify({ expiry, pwd: password }))
        router.push('/admin')
        break
      }
    }
  }

  // After roles are resolved, optionally show passkey setup prompt then redirect
  const proceedWithRoles = (foundRoles: RoleResult[]) => {
    if (foundRoles.length === 1) {
      localStorage.setItem('active_role', foundRoles[0].role)
      toast.success(`שלום ${foundRoles[0].data.full_name as string}`)
      applyRole(foundRoles[0])
      return
    }
    const saved = localStorage.getItem('preferred_role')
    const auto = foundRoles.find(r => r.role === saved)
    if (auto) {
      localStorage.setItem('active_role', auto.role)
      toast.success(`שלום ${auto.data.full_name as string}`)
      applyRole(auto)
      return
    }
    setRoles(foundRoles)
    setLoading(false)
  }

  // Shared post-auth role handler — checks passkey status before redirecting
  const handleRolesReceived = async (foundRoles: RoleResult[]) => {
    const userPhone = (foundRoles[0]?.data?.phone as string) || phone
    const dismissed = localStorage.getItem('passkey_prompt_dismissed')
    const supportsPasskey = typeof window !== 'undefined' && !!window.PublicKeyCredential

    if (supportsPasskey && !dismissed && userPhone) {
      try {
        const res = await fetch(`/api/auth/webauthn/status?phone=${encodeURIComponent(userPhone)}`)
        const { hasPasskey } = await res.json()
        if (!hasPasskey) {
          setPromptRoles(foundRoles)
          setPromptPhone(userPhone)
          setShowPasskeyPrompt(true)
          setLoading(false)
          return
        }
      } catch {
        // Status check failed — proceed normally
      }
    }

    proceedWithRoles(foundRoles)
  }

  const handleLogin = async () => {
    if (!phone || !password) { setError('יש למלא טלפון וסיסמה'); return }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'שגיאה בכניסה')
        setLoading(false)
        return
      }

      const foundRoles: RoleResult[] = data.roles
      // Store all roles + password for the header role switcher
      localStorage.setItem('auth_roles', JSON.stringify(foundRoles))
      localStorage.setItem('auth_password', password)

      handleRolesReceived(foundRoles)
    } catch {
      setError('שגיאה בכניסה')
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleLogin()
  }

  const handlePasskeyLogin = async () => {
    setPasskeyLoading(true)
    setError('')
    try {
      const beginRes = await fetch('/api/auth/webauthn/authenticate/begin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(phone ? { phone } : {}),
      })
      const beginData = await beginRes.json()
      if (!beginRes.ok) {
        setError(beginRes.status === 404
          ? 'לא נמצאו מפתחות passkey למספר זה. כדי להפעיל, היכנס עם סיסמה והגדר טביעת אצבע בהגדרות.'
          : beginData.error || 'שגיאה בכניסה עם passkey')
        return
      }

      const { startAuthentication } = await import('@simplewebauthn/browser')
      const authResponse = await startAuthentication({ optionsJSON: beginData })

      const completeRes = await fetch('/api/auth/webauthn/authenticate/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authResponse),
      })
      const completeData = await completeRes.json()
      if (!completeRes.ok) {
        setError(completeData.error || 'אימות הpasskey נכשל')
        return
      }

      const foundRoles: RoleResult[] = completeData.roles
      localStorage.setItem('auth_roles', JSON.stringify(foundRoles))
      handleRolesReceived(foundRoles)
    } catch (err) {
      // User cancelled the biometric prompt — no error needed
      if (err instanceof Error && err.name === 'NotAllowedError') return
      setError('שגיאה בכניסה עם passkey')
    } finally {
      setPasskeyLoading(false)
    }
  }

  const responsiveStyles = `
    .role-card:hover {
      background: #eff6ff !important;
      border-color: #bfdbfe !important;
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(37,99,235,0.10) !important;
    }
    .form-input:focus {
      border-color: #93c5fd !important;
      background: #ffffff !important;
      outline: none;
      box-shadow: 0 0 0 3px rgba(37,99,235,0.08);
    }
    .form-submit:hover:not(:disabled) {
      opacity: 0.92;
      transform: translateY(-1px);
    }
    @media (max-width: 480px) {
      .form-card { padding: 28px 20px !important; margin: 12px !important; }
      .form-input { font-size: 15px !important; }
    }
  `

  // One-time passkey setup prompt (shown after first password login when no passkey exists)
  if (showPasskeyPrompt && promptRoles) {
    const dismiss = () => {
      localStorage.setItem('passkey_prompt_dismissed', 'true')
      setShowPasskeyPrompt(false)
      proceedWithRoles(promptRoles)
    }

    const registerAndProceed = async () => {
      setPromptRegistering(true)
      try {
        const beginRes = await fetch('/api/auth/webauthn/register/begin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: promptPhone, password }),
        })
        const beginData = await beginRes.json()
        if (!beginRes.ok) { dismiss(); return }

        const { startRegistration } = await import('@simplewebauthn/browser')
        const regResponse = await startRegistration({ optionsJSON: beginData })

        const completeRes = await fetch('/api/auth/webauthn/register/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(regResponse),
        })
        if (completeRes.ok) toast.success('טביעת אצבע הוגדרה בהצלחה!')
      } catch (err) {
        if (!(err instanceof Error && err.name === 'NotAllowedError')) {
          toast.error('שגיאה בהגדרת טביעת האצבע')
        }
      } finally {
        setPromptRegistering(false)
        localStorage.setItem('passkey_prompt_dismissed', 'true')
        setShowPasskeyPrompt(false)
        proceedWithRoles(promptRoles)
      }
    }

    return (
      <div style={styles.container}>
        <style>{responsiveStyles}</style>
        <div style={{ ...styles.formCard, maxWidth: '380px', textAlign: 'center' }} className="form-card">
          <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 4px 14px rgba(37,99,235,0.25)' }}>
            <Fingerprint size={32} color="white" />
          </div>
          <h2 style={{ color: '#1e293b', fontSize: '1.3rem', fontWeight: 800, margin: '0 0 10px' }}>כניסה מהירה עם טביעת אצבע</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 28px', lineHeight: 1.6 }}>
            בפעם הבאה תוכל להיכנס בלחיצה אחת, בלי להקליד שם משתמש וסיסמה
          </p>
          <button
            onClick={registerAndProceed}
            disabled={promptRegistering}
            style={{ ...styles.formSubmit, width: '100%', marginBottom: '12px', opacity: promptRegistering ? 0.7 : 1 }}
            className="form-submit"
          >
            {promptRegistering ? 'מגדיר...' : 'הגדר עכשיו'}
          </button>
          <button
            onClick={dismiss}
            disabled={promptRegistering}
            style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            אחר כך
          </button>
        </div>
      </div>
    )
  }

  // Role picker (multiple roles found)
  if (roles) {
    const roleConfig: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
      station_manager: {
        color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe',
        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
      },
      operator: {
        color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe',
        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.08 2.18 2 2 0 012.07 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.26 7.74a16 16 0 006 6l1.1-1.1a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
      },
      district_manager: {
        color: '#d97706', bg: '#fffbeb', border: '#fde68a',
        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
      },
      editor: {
        color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0',
        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
      },
      admin: {
        color: '#dc2626', bg: '#fef2f2', border: '#fecaca',
        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
      },
    }

    return (
      <div style={styles.container}>
        <style>{responsiveStyles}</style>
        <div style={styles.formCard} className="form-card">
          <div style={{ textAlign: 'center', marginBottom: '6px' }}>
            <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 4px 14px rgba(37,99,235,0.25)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
              </svg>
            </div>
          </div>
          <h1 style={styles.formTitle} className="form-title">בחר תפקיד</h1>
          <p style={{ ...styles.formSubtitle, marginBottom: '20px' }}>נמצאו מספר תפקידים עבור חשבון זה</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {roles.map((r) => {
              const cfg = roleConfig[r.role] ?? { color: '#475569', bg: '#f8fafc', border: '#e2e8f0', icon: null }
              return (
                <button
                  key={r.role}
                  className="role-card"
                  onClick={() => {
                    localStorage.setItem('active_role', r.role)
                    if (rememberRole) localStorage.setItem('preferred_role', r.role)
                    toast.success(`שלום ${r.data.full_name as string}`)
                    applyRole(r)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '14px 18px',
                    background: cfg.bg,
                    border: `1px solid ${cfg.border}`,
                    borderRadius: '12px',
                    color: cfg.color,
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.18s',
                    textAlign: 'right' as const,
                    fontFamily: 'inherit',
                    width: '100%',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  }}
                >
                  <span style={{ flexShrink: 0, color: cfg.color }}>{cfg.icon}</span>
                  <span style={{ flex: 1 }}>{r.label}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ opacity: 0.4 }}>
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                </button>
              )
            })}
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', cursor: 'pointer', fontSize: '13px', color: '#64748b', userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={rememberRole}
              onChange={e => setRememberRole(e.target.checked)}
              style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#2563eb' }}
            />
            זכור את הבחירה שלי ותמיד כנס לתפקיד זה
          </label>
        </div>
      </div>
    )
  }

  // Login form
  return (
    <div style={styles.container}>
      <style>{responsiveStyles}</style>

      <Link href="/" style={styles.backHomeBtn}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        דף הבית
      </Link>

      <div style={styles.formCard} className="form-card">
        <div style={styles.formLogo} className="form-logo">
          <Image src="/logo.wheels.png" alt="לוגו מערכת גלגלים" width={80} height={80} style={{ objectFit: 'contain' }} />
        </div>
        <h1 style={styles.formTitle} className="form-title">כניסה למערכת</h1>
        <p style={styles.formSubtitle}>הזן טלפון וסיסמה</p>

        {savedPreferredRole && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '8px 12px', marginBottom: '12px', fontSize: '12px', color: '#2563eb' }}>
            <span>כניסה אוטומטית פעילה</span>
            <button
              type="button"
              onClick={() => { localStorage.removeItem('preferred_role'); setSavedPreferredRole(null) }}
              style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
            >
              ביטול
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="שם משתמש"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={styles.formInput}
            className="form-input"
            dir="rtl"
            autoComplete="username"
          />
          <div style={styles.passwordWrapper}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="סיסמה / קוד"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.passwordInput}
              className="form-input"
              dir="rtl"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.toggleButton}
              aria-label={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" style={styles.formSubmit} className="form-submit" disabled={loading}>
            {loading ? 'מתחבר...' : 'כניסה'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '2px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            <span style={{ color: '#94a3b8', fontSize: '12px', flexShrink: 0 }}>או</span>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          </div>

          <button
            type="button"
            onClick={handlePasskeyLogin}
            disabled={passkeyLoading || loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '13px',
              borderRadius: '12px',
              border: '1.5px solid #e2e8f0',
              background: '#f8fafc',
              color: '#374151',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'border-color 0.15s, background 0.15s',
              opacity: passkeyLoading || loading ? 0.6 : 1,
            }}
          >
            <Fingerprint size={18} />
            {passkeyLoading ? 'מאמת...' : 'כניסה עם טביעת אצבע'}
          </button>

          <button
            type="button"
            onClick={() => {
              setForgotPhone(phone)
              setForgotNewPassword('')
              setForgotConfirmPassword('')
              setForgotError('')
              setForgotSuccess(false)
              setShowForgotPassword(true)
            }}
            style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '0.85rem', marginTop: '12px', textDecoration: 'underline', width: '100%', textAlign: 'center', fontFamily: 'inherit' }}
          >
            שכחתי סיסמא (למנהלי תחנה)
          </button>
        </form>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={() => !forgotLoading && setShowForgotPassword(false)}>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', maxWidth: '400px', width: '100%', border: '1px solid #e2e8f0', boxShadow: '0 8px 32px rgba(0,0,0,0.10)', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#1e293b', textAlign: 'center', marginBottom: '8px', fontSize: '1.2rem' }}>איפוס סיסמא</h3>
            {forgotSuccess ? (
              <>
                <p style={{ textAlign: 'center', color: '#16a34a', fontSize: '1rem', marginBottom: '16px' }}>הסיסמא אופסה בהצלחה!</p>
                <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.85rem', marginBottom: '20px' }}>יש להתחבר עם הסיסמא החדשה ולהוריד תעודת שחזור חדשה.</p>
                <button onClick={() => setShowForgotPassword(false)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>
                  חזור להתחברות
                </button>
              </>
            ) : (
              <>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px', textAlign: 'center' }}>העלה את תמונת תעודת השחזור שלך כדי לאפס את הסיסמא</p>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', color: '#475569', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>מספר טלפון</label>
                  <input type="text" placeholder="הזן מספר טלפון" value={forgotPhone} onChange={e => setForgotPhone(e.target.value)} dir="ltr" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', color: '#475569', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>סיסמא חדשה</label>
                    <input type="password" value={forgotNewPassword} onChange={e => setForgotNewPassword(e.target.value)} dir="ltr" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', color: '#475569', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>אימות סיסמא</label>
                    <input type="password" value={forgotConfirmPassword} onChange={e => setForgotConfirmPassword(e.target.value)} dir="ltr" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                  </div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', borderRadius: '10px', border: '2px dashed #e2e8f0', background: '#f8fafc', color: '#2563eb', cursor: 'pointer', fontSize: '0.95rem', marginTop: '8px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg> העלה תמונת תעודת שחזור
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleForgotUpload} disabled={forgotLoading} />
                </label>
                {forgotLoading && (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.9)', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                    <div style={{ width: '50px', height: '50px', border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <p style={{ color: '#2563eb', fontSize: '1rem', marginTop: '16px' }}>סורק קוד QR...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                  </div>
                )}
                {forgotError && <p style={{ textAlign: 'center', color: '#ef4444', fontSize: '0.85rem', marginTop: '10px' }}>{forgotError}</p>}
                <button onClick={() => setShowForgotPassword(false)} disabled={forgotLoading} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #4a5568', background: 'transparent', color: '#9ca3af', cursor: 'pointer', fontSize: '0.9rem', marginTop: '16px', opacity: forgotLoading ? 0.5 : 1, fontFamily: 'inherit' }}>
                  ביטול
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <footer style={styles.footer}>
        <p style={styles.footerLinks}>
          <Link href="/guide" style={styles.footerLink}>מדריך למשתמש</Link>
          {' • '}
          <Link href="/privacy" style={styles.footerLink}>מדיניות פרטיות</Link>
          {' • '}
          <Link href="/accessibility" style={styles.footerLink}>הצהרת נגישות</Link>
        </p>
        <p style={styles.versionText}>גרסה {VERSION}</p>
      </footer>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #dbeafe 0%, #f0fdf4 50%, #faf5ff 100%)',
    padding: '20px',
    direction: 'rtl',
    position: 'relative',
  },
  backHomeBtn: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    color: '#475569',
    fontSize: '13px',
    fontWeight: 600,
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    borderRadius: '20px',
    background: 'rgba(255,255,255,0.75)',
    border: '1px solid rgba(226,232,240,0.8)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  },
  formCard: {
    background: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.9)',
    borderRadius: '24px',
    padding: '40px 36px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 8px 40px rgba(37,99,235,0.10), 0 2px 8px rgba(0,0,0,0.04)',
  },
  formLogo: {
    width: '80px',
    height: '80px',
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    overflow: 'hidden',
  },
  formTitle: {
    color: '#1e293b',
    fontSize: '1.6rem',
    fontWeight: '800',
    textAlign: 'center',
    margin: '0 0 8px',
  },
  formSubtitle: {
    color: '#64748b',
    fontSize: '0.9rem',
    textAlign: 'center',
    margin: '0 0 28px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  formInput: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    color: '#1e293b',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  passwordWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  passwordInput: {
    width: '100%',
    padding: '14px 48px 14px 16px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    color: '#1e293b',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  toggleButton: {
    position: 'absolute',
    left: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
  },
  error: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '10px',
    color: '#ef4444',
    padding: '10px 14px',
    fontSize: '0.9rem',
    textAlign: 'center',
  },
  formSubmit: {
    padding: '14px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'opacity 0.2s, transform 0.15s',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(37,99,235,0.30)',
  },
  footer: {
    marginTop: '32px',
    textAlign: 'center',
  },
  footerLinks: {
    color: '#94a3b8',
    fontSize: '0.8rem',
    margin: '0 0 4px',
  },
  footerLink: {
    color: '#64748b',
    textDecoration: 'none',
  },
  versionText: {
    color: '#94a3b8',
    fontSize: '0.75rem',
  },
}
