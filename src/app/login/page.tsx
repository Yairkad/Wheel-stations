'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

type LoginMode = 'select' | 'station' | 'operator'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<LoginMode>('select')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      const session = {
        manager: data.manager,
        stationId: data.station_id,
        stationName: data.station_name,
        password: password,
        timestamp: Date.now()
      }
      localStorage.setItem(`station_session_${data.station_id}`, JSON.stringify(session))

      toast.success(`שלום ${data.manager.full_name}`)
      router.push(`/${data.station_id}`)
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

  // Selection screen
  if (mode === 'select') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.logo}>🛞</div>
          <h1 style={styles.title}>מערכת גלגלים</h1>
          <p style={styles.subtitle}>בחר סוג כניסה</p>

          <div style={styles.buttonGroup}>
            <button
              style={styles.selectButton}
              onClick={() => setMode('station')}
            >
              <span style={styles.buttonIcon}>🏪</span>
              <span style={styles.buttonText}>ניהול תחנה</span>
              <span style={styles.buttonDesc}>למנהלי תחנות השאלה</span>
            </button>

            <button
              style={styles.selectButton}
              onClick={() => setMode('operator')}
            >
              <span style={styles.buttonIcon}>🎧</span>
              <span style={styles.buttonText}>ממשק מוקדן</span>
              <span style={styles.buttonDesc}>למוקדנים ומנהלי מוקד</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Login form
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <button
          style={styles.backButton}
          onClick={() => { setMode('select'); setError(''); setPhone(''); setPassword('') }}
        >
          ← חזרה
        </button>

        <div style={styles.logo}>
          {mode === 'station' ? '🏪' : '🎧'}
        </div>
        <h1 style={styles.title}>
          {mode === 'station' ? 'כניסת מנהל תחנה' : 'כניסת מוקדן'}
        </h1>
        <p style={styles.subtitle}>הזן טלפון וסיסמה</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="tel"
            placeholder="טלפון"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={styles.input}
            dir="ltr"
          />
          <input
            type="password"
            placeholder="סיסמה"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            dir="ltr"
          />

          {error && <div style={styles.error}>{error}</div>}

          <button
            type="submit"
            style={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'מתחבר...' : 'כניסה'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    display: 'flex',
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
  }
}
