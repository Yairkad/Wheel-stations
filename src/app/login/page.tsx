'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'
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
    }
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
      // Store all roles for the header switcher
      localStorage.setItem('auth_roles', JSON.stringify(foundRoles))

      if (foundRoles.length === 1) {
        localStorage.setItem('active_role', foundRoles[0].role)
        toast.success(`שלום ${foundRoles[0].data.full_name as string}`)
        applyRole(foundRoles[0])
      } else {
        // Multiple roles — show picker
        setRoles(foundRoles)
        setLoading(false)
      }
    } catch {
      setError('שגיאה בכניסה')
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleLogin()
  }

  const responsiveStyles = `
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    .admin-btn {
      opacity: 0 !important;
      background: transparent !important;
      border-color: transparent !important;
    }
    .admin-btn:hover {
      opacity: 1 !important;
      background: rgba(255,255,255,0.15) !important;
      border-color: rgba(255,255,255,0.2) !important;
      transform: rotate(45deg);
    }
    .role-card:hover {
      background: rgba(255,255,255,0.12) !important;
      border-color: rgba(99,179,237,0.5) !important;
      transform: translateY(-3px);
    }
    @media (max-width: 768px) {
      .form-card { padding: 30px 25px !important; max-width: 380px !important; }
    }
    @media (max-width: 480px) {
      .form-card { padding: 25px 20px !important; margin: 10px !important; }
      .form-input { padding: 14px !important; font-size: 15px !important; }
      .form-submit { padding: 14px !important; font-size: 16px !important; }
      .form-logo { width: 70px !important; height: 70px !important; font-size: 32px !important; }
      .form-title { font-size: 1.3rem !important; }
    }
  `

  // Role picker (multiple roles found)
  if (roles) {
    const roleIcons: Record<string, string> = {
      station_manager: '🏪',
      operator: '🎧',
      district_manager: '👑',
      editor: '✏️',
    }

    return (
      <div style={styles.container}>
        <style>{responsiveStyles}</style>
        <div style={styles.formCard} className="form-card">
          <div style={{ fontSize: '40px', textAlign: 'center', marginBottom: '8px' }}>🔀</div>
          <h1 style={styles.formTitle} className="form-title">בחר תפקיד</h1>
          <p style={{ ...styles.formSubtitle, marginBottom: '24px' }}>נמצאו מספר תפקידים עבור חשבון זה</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {roles.map((r) => (
              <button
                key={r.role}
                className="role-card"
                onClick={() => {
                  localStorage.setItem('active_role', r.role)
                  toast.success(`שלום ${r.data.full_name as string}`)
                  applyRole(r)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '16px 20px',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'right',
                  fontFamily: 'inherit',
                }}
              >
                <span style={{ fontSize: '28px' }}>{roleIcons[r.role]}</span>
                <span>{r.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Login form
  return (
    <div style={styles.container}>
      <style>{responsiveStyles}</style>

      <Link href="/admin" style={styles.adminBtn} className="admin-btn">⚙️</Link>
      <Link href="/" style={styles.backHomeBtn}>← דף הבית</Link>

      <div style={styles.formCard} className="form-card">
        <div style={styles.formLogo} className="form-logo">
          <Image src="/logo.wheels.png" alt="לוגו מערכת גלגלים" width={60} height={60} style={{ objectFit: 'contain' }} />
        </div>
        <h1 style={styles.formTitle} className="form-title">כניסה למערכת</h1>
        <p style={styles.formSubtitle}>הזן טלפון וסיסמה</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="מספר טלפון"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={styles.formInput}
            className="form-input"
            dir="ltr"
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
              dir="ltr"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.toggleButton}
              aria-label={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" style={styles.formSubmit} className="form-submit" disabled={loading}>
            {loading ? 'מתחבר...' : 'כניסה'}
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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={() => !forgotLoading && setShowForgotPassword(false)}>
          <div style={{ background: '#1e293b', borderRadius: '16px', padding: '24px', maxWidth: '400px', width: '100%', border: '1px solid #334155', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#fff', textAlign: 'center', marginBottom: '8px', fontSize: '1.2rem' }}>🔓 איפוס סיסמא</h3>
            {forgotSuccess ? (
              <>
                <p style={{ textAlign: 'center', color: '#10b981', fontSize: '1rem', marginBottom: '16px' }}>הסיסמא אופסה בהצלחה!</p>
                <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem', marginBottom: '20px' }}>יש להתחבר עם הסיסמא החדשה ולהוריד תעודת שחזור חדשה.</p>
                <button onClick={() => setShowForgotPassword(false)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#06b6d4,#8b5cf6)', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>
                  חזור להתחברות
                </button>
              </>
            ) : (
              <>
                <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '16px', textAlign: 'center' }}>העלה את תמונת תעודת השחזור שלך כדי לאפס את הסיסמא</p>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', color: '#d1d5db', fontSize: '0.85rem', marginBottom: '6px' }}>מספר טלפון</label>
                  <input type="text" placeholder="הזן מספר טלפון" value={forgotPhone} onChange={e => setForgotPhone(e.target.value)} dir="ltr" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #4a5568', background: '#2d3748', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', color: '#d1d5db', fontSize: '0.85rem', marginBottom: '6px' }}>סיסמא חדשה</label>
                    <input type="password" value={forgotNewPassword} onChange={e => setForgotNewPassword(e.target.value)} dir="ltr" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #4a5568', background: '#2d3748', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', color: '#d1d5db', fontSize: '0.85rem', marginBottom: '6px' }}>אימות סיסמא</label>
                    <input type="password" value={forgotConfirmPassword} onChange={e => setForgotConfirmPassword(e.target.value)} dir="ltr" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #4a5568', background: '#2d3748', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                  </div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', borderRadius: '10px', border: '2px dashed #4a5568', background: '#2d3748', color: '#60a5fa', cursor: 'pointer', fontSize: '0.95rem', marginTop: '8px' }}>
                  📷 העלה תמונת תעודת שחזור
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleForgotUpload} disabled={forgotLoading} />
                </label>
                {forgotLoading && (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                    <div style={{ width: '50px', height: '50px', border: '3px solid #334155', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <p style={{ color: '#f59e0b', fontSize: '1rem', marginTop: '16px' }}>סורק קוד QR...</p>
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
    background: 'linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%)',
    padding: '20px',
    direction: 'rtl',
    position: 'relative',
  },
  backHomeBtn: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    color: '#475569',
    fontSize: '13px',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  adminBtn: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    width: '40px',
    height: '40px',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    zIndex: 10,
    textDecoration: 'none'
  },
  formCard: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '24px',
    padding: '40px 35px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  formLogo: {
    width: '80px',
    height: '80px',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    overflow: 'hidden',
  },
  formTitle: {
    color: '#fff',
    fontSize: '1.6rem',
    fontWeight: '800',
    textAlign: 'center',
    margin: '0 0 8px',
  },
  formSubtitle: {
    color: '#94a3b8',
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
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.08)',
    color: '#fff',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  passwordWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  passwordInput: {
    width: '100%',
    padding: '14px 48px 14px 16px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.08)',
    color: '#fff',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  toggleButton: {
    position: 'absolute',
    left: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '4px',
  },
  error: {
    background: 'rgba(239,68,68,0.15)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '10px',
    color: '#fca5a5',
    padding: '10px 14px',
    fontSize: '0.9rem',
    textAlign: 'center',
  },
  formSubmit: {
    padding: '14px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    fontFamily: 'inherit',
  },
  footer: {
    marginTop: '32px',
    textAlign: 'center',
  },
  footerLinks: {
    color: '#475569',
    fontSize: '0.8rem',
    margin: '0 0 4px',
  },
  footerLink: {
    color: '#475569',
    textDecoration: 'none',
  },
  versionText: {
    color: '#334155',
    fontSize: '0.75rem',
  },
}
