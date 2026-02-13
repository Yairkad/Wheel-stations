'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { SESSION_VERSION, VERSION } from '@/lib/version'

type LoginMode = 'select' | 'station' | 'operator'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<LoginMode>('select')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

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

      // Read file as data URL
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(file)
      })

      // Load image
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new window.Image()
        image.onload = () => resolve(image)
        image.onerror = () => reject(new Error('Failed to load image'))
        image.src = dataUrl
      })

      // Scan QR - scale down large images for mobile compatibility
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

      // Reset password with recovery key
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
    }
    // Reset file input
    e.target.value = ''
  }

  const handleStationLogin = async () => {
    if (!phone || !password) {
      setError('יש למלא טלפון וסיסמה')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/wheel-stations/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      })

      const data = await response.json()

      if (!response.ok) {
        // Station manager auth failed - try super manager auth as fallback
        try {
          const smResponse = await fetch('/api/super-manager/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, password })
          })
          const smData = await smResponse.json()

          if (smResponse.ok) {
            const session = {
              superManager: smData.super_manager,
              password: password,
              timestamp: Date.now(),
              version: SESSION_VERSION
            }
            localStorage.setItem('super_manager_session', JSON.stringify(session))
            toast.success(`שלום ${smData.super_manager.full_name}`)
            router.push('/super-manager')
            return
          }
        } catch {
          // Super manager auth also failed, show original error
        }

        setError(data.error || 'שגיאה בכניסה')
        setLoading(false)
        return
      }

      // Save session to localStorage
      const stationId = data.manager.station_id
      const session = {
        manager: data.manager,
        stationId: stationId,
        stationName: data.manager.station_name,
        password: password,
        timestamp: Date.now(),
        version: SESSION_VERSION
      }
      localStorage.setItem(`station_session_${stationId}`, JSON.stringify(session))

      toast.success(`שלום ${data.manager.full_name}`)
      router.push(`/${stationId}`)
    } catch {
      setError('שגיאה בכניסה')
      setLoading(false)
    }
  }

  const handleOperatorLogin = async () => {
    if (!phone || !password) {
      setError('יש למלא טלפון וסיסמה')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Try unified auth - works for both operators and managers
      const response = await fetch('/api/call-center/unified-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'שגיאה בהתחברות')
        setLoading(false)
        return
      }

      // Save session
      const session = {
        user: data.user,
        role: data.role, // 'operator' | 'manager'
        callCenterId: data.call_center_id,
        callCenterName: data.call_center_name,
        password: password,
        timestamp: Date.now(),
        version: SESSION_VERSION
      }
      localStorage.setItem('operator_session', JSON.stringify(session))

      toast.success(`שלום ${data.user.full_name}`)

      // Redirect based on role
      if (data.role === 'manager') {
        router.push('/call-center')
      } else {
        router.push('/operator')
      }
    } catch {
      setError('שגיאה בהתחברות')
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'station') {
      handleStationLogin()
    } else if (mode === 'operator') {
      handleOperatorLogin()
    }
  }

  // Responsive CSS + animations
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

    .login-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 25px 50px rgba(0,0,0,0.15);
    }

    .login-card:hover .card-icon {
      background: rgba(255,255,255,0.3) !important;
      transform: scale(1.1);
    }

    @media (max-width: 768px) {
      .login-cards-container {
        gap: 15px !important;
      }
      .login-card {
        width: 180px !important;
        padding: 28px 22px !important;
      }
      .card-icon {
        width: 60px !important;
        height: 60px !important;
        font-size: 28px !important;
      }
      .card-title {
        font-size: 1.1rem !important;
      }
      .card-desc {
        font-size: 0.8rem !important;
      }
      .main-title {
        font-size: 1.8rem !important;
      }
      .main-logo {
        width: 85px !important;
        height: 85px !important;
      }
    }

    @media (max-width: 480px) {
      .login-cards-container {
        flex-direction: column !important;
        gap: 12px !important;
        align-items: center !important;
      }
      .login-card {
        width: 100% !important;
        max-width: 280px !important;
        padding: 24px 20px !important;
      }
      .main-title {
        font-size: 1.5rem !important;
      }
      .main-subtitle {
        font-size: 0.9rem !important;
      }
      .main-logo {
        width: 75px !important;
        height: 75px !important;
      }
      .admin-btn {
        width: 36px !important;
        height: 36px !important;
        font-size: 16px !important;
      }
    }

    /* Form responsive */
    @media (max-width: 768px) {
      .form-card {
        padding: 30px 25px !important;
        max-width: 380px !important;
      }
    }
    @media (max-width: 480px) {
      .form-card {
        padding: 25px 20px !important;
        margin: 10px !important;
      }
      .form-input {
        padding: 14px !important;
        font-size: 15px !important;
      }
      .form-submit {
        padding: 14px !important;
        font-size: 16px !important;
      }
      .form-logo {
        width: 70px !important;
        height: 70px !important;
        font-size: 32px !important;
      }
      .form-title {
        font-size: 1.3rem !important;
      }
    }
  `

  // Selection screen - new design
  if (mode === 'select') {
    return (
      <div style={styles.container}>
        <style>{responsiveStyles}</style>

        {/* Admin button - hidden */}
        <Link href="/admin" style={styles.adminBtn} className="admin-btn">
          ⚙️
        </Link>

        <div style={styles.mainContainer}>
          {/* Logo */}
          <div style={styles.mainLogo} className="main-logo">
            <Image
              src="/logo.wheels.png"
              alt="לוגו מערכת גלגלים"
              width={80}
              height={80}
              style={{ objectFit: 'contain' }}
            />
          </div>

          <h1 style={styles.mainTitle} className="main-title">מערכת גלגלים</h1>
          <p style={styles.mainSubtitle} className="main-subtitle">בחרו את סוג הכניסה למערכת</p>

          {/* Cards */}
          <div style={styles.cardsContainer} className="login-cards-container">
            <button
              style={styles.loginCard}
              onClick={() => setMode('station')}
              className="login-card"
            >
              <div style={styles.cardIcon} className="card-icon">🏪</div>
              <div style={styles.cardTitle} className="card-title">ניהול תחנה</div>
              <div style={styles.cardDesc} className="card-desc">למנהלי תחנות השאלה</div>
            </button>

            <button
              style={styles.loginCard}
              onClick={() => setMode('operator')}
              className="login-card"
            >
              <div style={styles.cardIcon} className="card-icon">🎧</div>
              <div style={styles.cardTitle} className="card-title">ממשק מוקדן</div>
              <div style={styles.cardDesc} className="card-desc">למוקדנים ומנהלי מוקד</div>
            </button>

          </div>

          {/* Footer */}
          <div style={styles.mainFooter}>
            <Link href="/guide" style={styles.footerLink}>מדריך למשתמש</Link>
            {' • '}
            <Link href="/privacy" style={styles.footerLink}>מדיניות פרטיות</Link>
            {' • '}
            <Link href="/accessibility" style={styles.footerLink}>הצהרת נגישות</Link>
            {' • '}
            <Link href="/reverse-search" style={styles.footerLink}>חיפוש הפוך (בטא)</Link>
          </div>
          <div style={styles.versionText}>גרסה {VERSION}</div>
        </div>
      </div>
    )
  }

  // Login form
  return (
    <div style={styles.container}>
      <style>{responsiveStyles}</style>

      <div style={styles.formCard} className="form-card">
        <button
          style={styles.backButton}
          onClick={() => { setMode('select'); setError(''); setPhone(''); setPassword('') }}
        >
          ← חזרה
        </button>

        <div style={styles.formLogo} className="form-logo">
          {mode === 'station' ? '🏪' : '🎧'}
        </div>
        <h1 style={styles.formTitle} className="form-title">
          {mode === 'station' ? 'כניסת מנהל תחנה' : 'כניסת מוקדן'}
        </h1>
        <p style={styles.formSubtitle}>הזן שם משתמש וסיסמה</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="שם משתמש"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={styles.formInput}
            className="form-input"
            dir="ltr"
          />
          <div style={styles.passwordWrapper}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="סיסמה"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.passwordInput}
              className="form-input"
              dir="ltr"
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

          <button
            type="submit"
            style={styles.formSubmit}
            className="form-submit"
            disabled={loading}
          >
            {loading ? 'מתחבר...' : 'כניסה'}
          </button>
          {mode === 'station' && (
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
              style={{
                background: 'none',
                border: 'none',
                color: '#60a5fa',
                cursor: 'pointer',
                fontSize: '0.85rem',
                marginTop: '12px',
                textDecoration: 'underline',
                width: '100%',
                textAlign: 'center'
              }}
            >
              שכחתי סיסמא
            </button>
          )}
        </form>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:'20px'}} onClick={() => !forgotLoading && setShowForgotPassword(false)}>
          <div style={{background:'#1e293b',borderRadius:'16px',padding:'24px',maxWidth:'400px',width:'100%',border:'1px solid #334155',position:'relative'}} onClick={e => e.stopPropagation()}>
            <h3 style={{color:'#fff',textAlign:'center',marginBottom:'8px',fontSize:'1.2rem'}}>🔓 איפוס סיסמא</h3>
            {forgotSuccess ? (
              <>
                <p style={{textAlign:'center',color:'#10b981',fontSize:'1rem',marginBottom:'16px'}}>הסיסמא אופסה בהצלחה!</p>
                <p style={{textAlign:'center',color:'#9ca3af',fontSize:'0.85rem',marginBottom:'20px'}}>יש להתחבר עם הסיסמא החדשה ולהוריד תעודת שחזור חדשה.</p>
                <button onClick={() => setShowForgotPassword(false)} style={{width:'100%',padding:'12px',borderRadius:'10px',border:'none',background:'linear-gradient(135deg,#06b6d4,#8b5cf6)',color:'#fff',fontWeight:'bold',cursor:'pointer',fontSize:'1rem'}}>
                  חזור להתחברות
                </button>
              </>
            ) : (
              <>
                <p style={{fontSize:'0.85rem',color:'#9ca3af',marginBottom:'16px',textAlign:'center'}}>העלה את תמונת תעודת השחזור שלך כדי לאפס את הסיסמא</p>
                <div style={{marginBottom:'12px'}}>
                  <label style={{display:'block',color:'#d1d5db',fontSize:'0.85rem',marginBottom:'6px'}}>מספר טלפון</label>
                  <input type="text" placeholder="הזן מספר טלפון" value={forgotPhone} onChange={e => setForgotPhone(e.target.value)} dir="ltr" style={{width:'100%',padding:'10px 12px',borderRadius:'8px',border:'1px solid #4a5568',background:'#2d3748',color:'#fff',fontSize:'0.95rem',boxSizing:'border-box'}} />
                </div>
                <div style={{display:'flex',gap:'10px',marginBottom:'12px'}}>
                  <div style={{flex:1}}>
                    <label style={{display:'block',color:'#d1d5db',fontSize:'0.85rem',marginBottom:'6px'}}>סיסמא חדשה</label>
                    <input type="password" value={forgotNewPassword} onChange={e => setForgotNewPassword(e.target.value)} dir="ltr" style={{width:'100%',padding:'10px 12px',borderRadius:'8px',border:'1px solid #4a5568',background:'#2d3748',color:'#fff',fontSize:'0.95rem',boxSizing:'border-box'}} />
                  </div>
                  <div style={{flex:1}}>
                    <label style={{display:'block',color:'#d1d5db',fontSize:'0.85rem',marginBottom:'6px'}}>אימות סיסמא</label>
                    <input type="password" value={forgotConfirmPassword} onChange={e => setForgotConfirmPassword(e.target.value)} dir="ltr" style={{width:'100%',padding:'10px 12px',borderRadius:'8px',border:'1px solid #4a5568',background:'#2d3748',color:'#fff',fontSize:'0.95rem',boxSizing:'border-box'}} />
                  </div>
                </div>
                <label style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',padding:'14px',borderRadius:'10px',border:'2px dashed #4a5568',background:'#2d3748',color:'#60a5fa',cursor:'pointer',fontSize:'0.95rem',marginTop:'8px'}}>
                  📷 העלה תמונת תעודת שחזור
                  <input type="file" accept="image/*" style={{display:'none'}} onChange={handleForgotUpload} disabled={forgotLoading} />
                </label>
                {forgotLoading && (
                  <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.8)',borderRadius:'16px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:10}}>
                    <div style={{width:'50px',height:'50px',border:'3px solid #334155',borderTopColor:'#f59e0b',borderRadius:'50%',animation:'spin 1s linear infinite'}} />
                    <p style={{color:'#f59e0b',fontSize:'1rem',marginTop:'16px'}}>סורק קוד QR...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                  </div>
                )}
                {forgotError && <p style={{textAlign:'center',color:'#ef4444',fontSize:'0.85rem',marginTop:'10px'}}>{forgotError}</p>}
                <button onClick={() => setShowForgotPassword(false)} disabled={forgotLoading} style={{width:'100%',padding:'10px',borderRadius:'8px',border:'1px solid #4a5568',background:'transparent',color:'#9ca3af',cursor:'pointer',fontSize:'0.9rem',marginTop:'16px',opacity:forgotLoading?0.5:1}}>
                  ביטול
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={styles.footerLinks}>
          <Link href="/guide" style={styles.footerLink}>מדריך למשתמש</Link>
          {' • '}
          <Link href="/privacy" style={styles.footerLink}>מדיניות פרטיות</Link>
          {' • '}
          <Link href="/accessibility" style={styles.footerLink}>הצהרת נגישות</Link>
          {' • '}
          <Link href="/reverse-search" style={styles.footerLink}>חיפוש הפוך (בטא)</Link>
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
    overflow: 'hidden'
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
    backdropFilter: 'blur(10px)',
    textDecoration: 'none'
  },
  mainContainer: {
    textAlign: 'center',
    width: '100%',
    maxWidth: '550px',
    position: 'relative',
    zIndex: 1
  },
  mainLogo: {
    width: '100px',
    height: '100px',
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
    animation: 'float 3s ease-in-out infinite',
    overflow: 'hidden'
  },
  mainTitle: {
    fontSize: '2.2rem',
    fontWeight: 800,
    color: 'white',
    marginBottom: '8px',
    textShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  mainSubtitle: {
    color: '#7dd3fc',
    marginBottom: '40px',
    fontSize: '1rem'
  },
  cardsContainer: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  loginCard: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '24px',
    padding: '35px 30px',
    width: '220px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  cardIcon: {
    width: '70px',
    height: '70px',
    background: 'linear-gradient(135deg, #00d4ff 0%, #7b2ff7 100%)',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    margin: '0 auto 18px',
    transition: 'all 0.3s ease'
  },
  cardTitle: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: 'white',
    marginBottom: '10px'
  },
  cardDesc: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 1.5
  },
  mainFooter: {
    marginTop: '40px',
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.6)'
  },
  versionText: {
    marginTop: '15px',
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.4)'
  },
  footerLink: {
    color: 'rgba(255,255,255,0.8)',
    textDecoration: 'none',
    margin: '0 10px',
    transition: 'color 0.2s'
  },
  // Form styles
  formCard: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '24px',
    padding: '40px',
    maxWidth: '420px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    textAlign: 'center',
    position: 'relative'
  },
  backButton: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    fontSize: '14px',
    color: 'rgba(255,255,255,0.8)',
    cursor: 'pointer',
    padding: '8px 12px',
    transition: 'all 0.2s'
  },
  formLogo: {
    width: '80px',
    height: '80px',
    background: 'linear-gradient(135deg, #00d4ff 0%, #7b2ff7 100%)',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '40px',
    margin: '0 auto 20px',
    boxShadow: '0 10px 30px rgba(0, 212, 255, 0.3)'
  },
  formTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'white',
    marginBottom: '8px'
  },
  formSubtitle: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '30px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  formInput: {
    padding: '16px',
    fontSize: '16px',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '12px',
    outline: 'none',
    transition: 'all 0.2s',
    textAlign: 'center',
    color: 'white'
  },
  passwordWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  passwordInput: {
    padding: '16px',
    paddingLeft: '45px',
    fontSize: '16px',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '12px',
    outline: 'none',
    transition: 'all 0.2s',
    textAlign: 'center',
    width: '100%',
    color: 'white'
  },
  toggleButton: {
    position: 'absolute',
    left: '10px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '5px'
  },
  error: {
    color: '#ff6b6b',
    fontSize: '14px',
    padding: '12px',
    background: 'rgba(255, 107, 107, 0.1)',
    borderRadius: '10px',
    border: '1px solid rgba(255, 107, 107, 0.3)'
  },
  formSubmit: {
    padding: '16px',
    fontSize: '18px',
    fontWeight: 'bold',
    color: 'white',
    background: 'linear-gradient(135deg, #00d4ff 0%, #7b2ff7 100%)',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    marginTop: '10px',
    boxShadow: '0 10px 30px rgba(0, 212, 255, 0.3)'
  },
  footer: {
    position: 'absolute',
    bottom: '20px',
    left: 0,
    right: 0,
    textAlign: 'center'
  },
  footerLinks: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.6)',
    margin: 0
  }
}
