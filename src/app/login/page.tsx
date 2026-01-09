'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

type LoginMode = 'select' | 'station' | 'operator'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<LoginMode>('select')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

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
        timestamp: Date.now()
      }
      localStorage.setItem(`station_session_${stationId}`, JSON.stringify(session))

      toast.success(`שלום ${data.manager.full_name}`)
      router.push(`/${stationId}`)
    } catch (err) {
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
        timestamp: Date.now()
      }
      localStorage.setItem('operator_session', JSON.stringify(session))

      toast.success(`שלום ${data.user.full_name}`)

      // Redirect based on role
      if (data.role === 'manager') {
        router.push('/call-center')
      } else {
        router.push('/operator')
      }
    } catch (err) {
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

  // Responsive CSS
  const responsiveStyles = `
    @media (max-width: 768px) {
      .login-card-responsive {
        padding: 30px 25px !important;
        margin: 10px !important;
      }
      .login-logo-responsive {
        font-size: 50px !important;
      }
      .login-title-responsive {
        font-size: 1.4rem !important;
      }
      .select-button-responsive {
        padding: 20px !important;
      }
      .button-icon-responsive {
        font-size: 32px !important;
      }
      .button-text-responsive {
        font-size: 16px !important;
      }
      .form-input-responsive {
        padding: 14px !important;
      }
      .submit-button-responsive {
        padding: 14px !important;
        font-size: 16px !important;
      }
    }
    @media (max-width: 480px) {
      .login-card-responsive {
        padding: 25px 20px !important;
        border-radius: 16px !important;
      }
      .login-logo-responsive {
        font-size: 45px !important;
        margin-bottom: 8px !important;
      }
      .login-title-responsive {
        font-size: 1.25rem !important;
      }
      .login-subtitle-responsive {
        font-size: 13px !important;
        margin-bottom: 20px !important;
      }
      .select-button-responsive {
        padding: 18px !important;
        border-radius: 12px !important;
      }
      .button-icon-responsive {
        font-size: 28px !important;
        margin-bottom: 8px !important;
      }
      .button-text-responsive {
        font-size: 15px !important;
      }
      .button-desc-responsive {
        font-size: 11px !important;
      }
      .form-input-responsive {
        padding: 12px !important;
        font-size: 15px !important;
      }
      .submit-button-responsive {
        padding: 12px !important;
        font-size: 15px !important;
      }
      .back-button-responsive {
        font-size: 14px !important;
        top: 10px !important;
        right: 10px !important;
      }
    }
  `

  // Selection screen
  if (mode === 'select') {
    return (
      <div style={styles.container}>
        <style>{responsiveStyles}</style>
        <div style={styles.card} className="login-card-responsive">
          <div style={styles.logo} className="login-logo-responsive">🛞</div>
          <h1 style={styles.title} className="login-title-responsive">מערכת גלגלים</h1>
          <p style={styles.subtitle} className="login-subtitle-responsive">בחר סוג כניסה</p>

          <div style={styles.buttonGroup}>
            <button
              style={styles.selectButton}
              onClick={() => setMode('station')}
              className="select-button-responsive"
            >
              <span style={styles.buttonIcon} className="button-icon-responsive">🏪</span>
              <span style={styles.buttonText} className="button-text-responsive">ניהול תחנה</span>
              <span style={styles.buttonDesc} className="button-desc-responsive">למנהלי תחנות השאלה</span>
            </button>

            <button
              style={styles.selectButton}
              onClick={() => setMode('operator')}
              className="select-button-responsive"
            >
              <span style={styles.buttonIcon} className="button-icon-responsive">🎧</span>
              <span style={styles.buttonText} className="button-text-responsive">ממשק מוקדן</span>
              <span style={styles.buttonDesc} className="button-desc-responsive">למוקדנים ומנהלי מוקד</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer style={styles.footer}>
          <p style={styles.footerLinks}>
            <Link href="/guide" style={styles.footerLink}>מדריך למשתמש</Link>
            {' • '}
            <Link href="/privacy" style={styles.footerLink}>מדיניות פרטיות</Link>
            {' • '}
            <Link href="/accessibility" style={styles.footerLink}>הצהרת נגישות</Link>
          </p>
        </footer>
      </div>
    )
  }

  // Login form
  return (
    <div style={styles.container}>
      <style>{responsiveStyles}</style>
      <div style={styles.card} className="login-card-responsive">
        <button
          style={styles.backButton}
          onClick={() => { setMode('select'); setError(''); setPhone(''); setPassword('') }}
          className="back-button-responsive"
        >
          ← חזרה
        </button>

        <div style={styles.logo} className="login-logo-responsive">
          {mode === 'station' ? '🏪' : '🎧'}
        </div>
        <h1 style={styles.title} className="login-title-responsive">
          {mode === 'station' ? 'כניסת מנהל תחנה' : 'כניסת מוקדן'}
        </h1>
        <p style={styles.subtitle} className="login-subtitle-responsive">הזן שם משתמש וסיסמה</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="שם משתמש"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={styles.input}
            className="form-input-responsive"
            dir="ltr"
          />
          <div style={styles.passwordWrapper}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="סיסמה"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.passwordInput}
              className="form-input-responsive"
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
            style={styles.submitButton}
            className="submit-button-responsive"
            disabled={loading}
          >
            {loading ? 'מתחבר...' : 'כניסה'}
          </button>
        </form>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={styles.footerLinks}>
          <Link href="/guide" style={styles.footerLink}>מדריך למשתמש</Link>
          {' • '}
          <Link href="/privacy" style={styles.footerLink}>מדיניות פרטיות</Link>
          {' • '}
          <Link href="/accessibility" style={styles.footerLink}>הצהרת נגישות</Link>
        </p>
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
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
    direction: 'rtl'
  },
  card: {
    background: 'white',
    borderRadius: '20px',
    padding: '40px',
    maxWidth: '400px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    textAlign: 'center',
    position: 'relative'
  },
  backButton: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    background: 'none',
    border: 'none',
    fontSize: '16px',
    color: '#666',
    cursor: 'pointer',
    padding: '5px 10px'
  },
  logo: {
    fontSize: '60px',
    marginBottom: '10px'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '5px'
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '30px'
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  selectButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '25px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '15px',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
  },
  buttonIcon: {
    fontSize: '40px',
    marginBottom: '10px'
  },
  buttonText: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '5px'
  },
  buttonDesc: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.8)'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  input: {
    padding: '15px',
    fontSize: '16px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    outline: 'none',
    transition: 'border-color 0.2s',
    textAlign: 'center'
  },
  passwordWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  passwordInput: {
    padding: '15px',
    paddingLeft: '45px',
    fontSize: '16px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    outline: 'none',
    transition: 'border-color 0.2s',
    textAlign: 'center',
    width: '100%'
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
    color: '#e74c3c',
    fontSize: '14px',
    padding: '10px',
    background: '#fdeaea',
    borderRadius: '8px'
  },
  submitButton: {
    padding: '15px',
    fontSize: '18px',
    fontWeight: 'bold',
    color: 'white',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    marginTop: '10px'
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
    color: 'rgba(255,255,255,0.7)',
    margin: 0
  },
  footerLink: {
    color: 'rgba(255,255,255,0.9)',
    textDecoration: 'none'
  }
}
