'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Operator {
  id: string
  full_name: string
  phone: string
  call_center_id: string
  call_center_name: string
}

interface StationManager {
  id: string
  full_name: string
  phone: string
}

interface Station {
  id: string
  name: string
  address: string
  city?: string | null
  district?: string | null
  managers?: StationManager[]
}

interface WheelResult {
  station: Station
  wheels: { wheel_number: number; rim_size: string; pcd: string; is_available: boolean }[]
  availableCount: number
  totalCount: number
}

interface VehicleInfo {
  manufacturer: string
  model: string
  year: number
  bolt_count: number
  bolt_spacing: number
  rim_size: string
}

export default function OperatorPage() {
  const [operator, setOperator] = useState<Operator | null>(null)
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  // Search state
  const [searchTab, setSearchTab] = useState<'plate' | 'manual'>('plate')
  const [plateNumber, setPlateNumber] = useState('')
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo | null>(null)
  const [searchError, setSearchError] = useState('')

  // Results
  const [results, setResults] = useState<WheelResult[]>([])

  // Modal
  const [selectedWheel, setSelectedWheel] = useState<{
    station: Station
    wheelNumber: number
    pcd: string
  } | null>(null)
  const [selectedContact, setSelectedContact] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Check for saved session
  useEffect(() => {
    const saved = localStorage.getItem('operator_session')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        if (data.expiry && new Date().getTime() < data.expiry) {
          setOperator(data.operator)
        } else {
          localStorage.removeItem('operator_session')
        }
      } catch {
        localStorage.removeItem('operator_session')
      }
    }
  }, [])

  const handleLogin = async () => {
    if (!phone || !code) {
      setLoginError('יש להזין שם משתמש וסיסמה')
      return
    }

    setLoginLoading(true)
    setLoginError('')

    try {
      // Use unified auth - works for both managers and operators
      const response = await fetch('/api/call-center/unified-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password: code })
      })

      const data = await response.json()

      if (!response.ok) {
        setLoginError(data.error || 'שגיאה בהתחברות')
        return
      }

      // Check role - if manager, redirect to call-center page
      if (data.role === 'manager') {
        // Save manager session and redirect
        const expiry = new Date().getTime() + (12 * 60 * 60 * 1000)
        localStorage.setItem('call_center_session', JSON.stringify({
          role: 'manager',
          user: data.user,
          expiry
        }))
        toast.success(`שלום ${data.user.full_name}!`)
        window.location.href = '/call-center'
        return
      }

      // Operator - stay on this page
      const expiry = new Date().getTime() + (12 * 60 * 60 * 1000)
      localStorage.setItem('operator_session', JSON.stringify({
        operator: data.user,
        expiry
      }))

      setOperator(data.user)
      toast.success(`שלום ${data.user.full_name}!`)
    } catch {
      setLoginError('שגיאה בהתחברות')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('operator_session')
    setOperator(null)
    setVehicleInfo(null)
    setResults([])
  }

  const handleSearch = async () => {
    setSearchError('')
    setVehicleInfo(null)
    setResults([])

    if (searchTab === 'plate') {
      if (!plateNumber) {
        setSearchError('יש להזין מספר רכב')
        return
      }
    } else {
      if (!make || !model) {
        setSearchError('יש להזין יצרן ודגם')
        return
      }
    }

    setSearchLoading(true)

    try {
      // Step 1: Get vehicle PCD info
      let pcdInfo: VehicleInfo | null = null

      if (searchTab === 'plate') {
        const plateRes = await fetch(`/api/vehicle/lookup?plate=${encodeURIComponent(plateNumber.replace(/-/g, ''))}`)
        const plateData = await plateRes.json()

        if (!plateRes.ok || !plateData.success) {
          setSearchError(plateData.error || 'לא נמצא רכב עם מספר זה')
          return
        }

        if (plateData.vehicle?.pcd) {
          pcdInfo = {
            manufacturer: plateData.vehicle.manufacturer,
            model: plateData.vehicle.model,
            year: plateData.vehicle.year,
            bolt_count: plateData.vehicle.pcd.bolt_count,
            bolt_spacing: plateData.vehicle.pcd.bolt_spacing,
            rim_size: plateData.vehicle.pcd.rim_size || ''
          }
        } else {
          setSearchError('לא נמצא מידע PCD לרכב זה')
          return
        }
      } else {
        // Manual search by make/model/year
        const searchParams = new URLSearchParams({
          make,
          model,
          ...(year && { year })
        })
        const modelsRes = await fetch(`/api/vehicle-models?${searchParams}`)
        const modelsData = await modelsRes.json()

        if (!modelsRes.ok || !modelsData.models?.length) {
          setSearchError('לא נמצא מידע לרכב זה')
          return
        }

        const vehicleModel = modelsData.models[0]
        pcdInfo = {
          manufacturer: vehicleModel.make_he || vehicleModel.make,
          model: vehicleModel.model,
          year: parseInt(year) || vehicleModel.year_from,
          bolt_count: vehicleModel.bolt_count,
          bolt_spacing: vehicleModel.bolt_spacing,
          rim_size: vehicleModel.rim_size || ''
        }
      }

      setVehicleInfo(pcdInfo)

      // Step 2: Search for wheels
      const wheelParams = new URLSearchParams({
        bolt_count: pcdInfo.bolt_count.toString(),
        bolt_spacing: pcdInfo.bolt_spacing.toString(),
        available_only: 'true'
      })
      // Don't filter by rim_size to show more options
      // ...(pcdInfo.rim_size && { rim_size: pcdInfo.rim_size })

      const wheelsRes = await fetch(`/api/wheel-stations/search?${wheelParams}`)
      const wheelsData = await wheelsRes.json()

      if (!wheelsRes.ok) {
        setSearchError('שגיאה בחיפוש גלגלים')
        return
      }

      // Get station managers for all found stations
      const stationIds = wheelsData.results?.map((r: { station: { id: string } }) => r.station.id) || []
      let managersMap: Record<string, StationManager[]> = {}

      if (stationIds.length > 0) {
        const managersRes = await fetch(`/api/wheel-stations/managers?station_ids=${stationIds.join(',')}`)
        if (managersRes.ok) {
          const managersData = await managersRes.json()
          managersMap = managersData.managers || {}
        }
      }

      // Transform results to our format
      const transformedResults: WheelResult[] = (wheelsData.results || []).map((result: {
        station: { id: string; name: string; address: string; city?: string | null; district?: string | null }
        wheels: { wheel_number: number; rim_size: string; is_available: boolean }[]
        availableCount: number
        totalCount: number
      }) => ({
        station: {
          ...result.station,
          managers: managersMap[result.station.id] || []
        },
        wheels: result.wheels.map(w => ({
          ...w,
          pcd: `${pcdInfo.bolt_count}×${pcdInfo.bolt_spacing}`
        })),
        availableCount: result.availableCount,
        totalCount: result.totalCount
      }))

      setResults(transformedResults)

      if (transformedResults.length === 0) {
        toast('לא נמצאו גלגלים מתאימים', { icon: '😕' })
      } else {
        const totalWheels = transformedResults.reduce((sum, r) => sum + r.wheels.length, 0)
        toast.success(`נמצאו ${totalWheels} גלגלים ב-${transformedResults.length} תחנות`)
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchError('שגיאה בחיפוש')
    } finally {
      setSearchLoading(false)
    }
  }

  const openModal = (station: Station, wheelNumber: number, pcd: string) => {
    setSelectedWheel({ station, wheelNumber, pcd })
    setSelectedContact(station.managers?.[0]?.id || null)
    setCopied(false)
  }

  const closeModal = () => {
    setSelectedWheel(null)
    setSelectedContact(null)
  }

  const getMessage = () => {
    if (!selectedWheel || !operator) return ''

    const contact = selectedWheel.station.managers?.find(m => m.id === selectedContact)
    const stationName = selectedWheel.station.name.replace('תחנת ', '')

    return `תפתח קריאה שינוע לפנצ'ריה
בפרטים: איסוף מתחנת השאלת צמיגים
${stationName}, ${selectedWheel.station.address}
במידע פרטי: איש קשר בתחנה ${contact?.full_name || ''}
${contact?.phone || ''}
ולשלוח לפונה שימלא
https://wheels.co.il/sign/${selectedWheel.station.id}?wheel=${selectedWheel.wheelNumber}&ref=operator_${operator.id}`
  }

  const copyMessage = () => {
    navigator.clipboard.writeText(getMessage())
    setCopied(true)
    toast.success('ההודעה הועתקה!')
    setTimeout(() => setCopied(false), 2000)
  }

  // Login screen
  if (!operator) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginBox}>
          <div style={styles.loginLogoIcon}>🎧</div>
          <h1 style={styles.loginTitle}>מערכת מוקדים</h1>
          <p style={styles.loginSubtitle}>הזן שם משתמש וסיסמה</p>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>שם משתמש</label>
            <input
              type="text"
              placeholder="שם משתמש"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              style={styles.formInput}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>סיסמה / קוד</label>
            <input
              type="password"
              placeholder="הסיסמה או הקוד שקיבלת"
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={styles.formInput}
              dir="ltr"
            />
          </div>

          {loginError && <div style={styles.errorText}>{loginError}</div>}

          <button
            style={styles.loginBtn}
            onClick={handleLogin}
            disabled={loginLoading}
          >
            {loginLoading ? 'מתחבר...' : 'כניסה'}
          </button>
          <Link href="/" style={styles.backLink}>← חזרה לדף הראשי</Link>
        </div>
      </div>
    )
  }

  // Main interface
  return (
    <div style={styles.pageWrapper}>
      {/* Keyframes for spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLogo}>
            <div style={styles.logoIcon}>🎧</div>
            <div>
              <h1 style={styles.headerTitle}>ממשק מוקדן</h1>
              <p style={styles.headerSubtitle}>{operator.call_center_name}</p>
            </div>
          </div>
          <div style={styles.userInfo}>
            <span style={styles.userName}>{operator.full_name}</span>
            <button style={styles.btnLogout} onClick={handleLogout}>יציאה</button>
          </div>
        </div>
      </div>

      <div style={styles.container}>
        {/* Search Section */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>🔍 חיפוש גלגל לרכב</h3>

          {/* Search Tabs */}
          <div style={styles.searchTabs}>
            <button
              style={{...styles.searchTab, ...(searchTab === 'plate' ? styles.searchTabActive : {})}}
              onClick={() => setSearchTab('plate')}
            >
              לפי מספר רכב
            </button>
            <button
              style={{...styles.searchTab, ...(searchTab === 'manual' ? styles.searchTabActive : {})}}
              onClick={() => setSearchTab('manual')}
            >
              לפי יצרן ודגם
            </button>
          </div>

          {/* Search by Plate */}
          {searchTab === 'plate' && (
            <div style={styles.searchRow}>
              <input
                type="text"
                placeholder="12-345-67"
                value={plateNumber}
                onChange={e => setPlateNumber(e.target.value)}
                style={{...styles.formInput, flex: 1, textAlign: 'center', letterSpacing: '2px', fontSize: '1.1rem'}}
                dir="ltr"
              />
              <button style={styles.searchBtn} onClick={handleSearch} disabled={searchLoading}>
                {searchLoading ? <span style={styles.spinner}></span> : 'חפש'}
              </button>
            </div>
          )}

          {/* Search by Make/Model */}
          {searchTab === 'manual' && (
            <div style={styles.searchGrid}>
              <input
                type="text"
                placeholder="יצרן"
                value={make}
                onChange={e => setMake(e.target.value)}
                style={styles.formInput}
              />
              <input
                type="text"
                placeholder="דגם"
                value={model}
                onChange={e => setModel(e.target.value)}
                style={styles.formInput}
              />
              <input
                type="number"
                placeholder="שנה"
                value={year}
                onChange={e => setYear(e.target.value)}
                style={styles.formInput}
              />
              <button style={styles.searchBtn} onClick={handleSearch} disabled={searchLoading}>
                {searchLoading ? <span style={styles.spinner}></span> : 'חפש'}
              </button>
            </div>
          )}

          {/* Loading Animation */}
          {searchLoading && (
            <div style={styles.loadingContainer}>
              <div style={styles.loadingSpinner}></div>
              <div style={styles.loadingText}>מחפש גלגלים מתאימים...</div>
            </div>
          )}

          {searchError && <div style={styles.errorText}>{searchError}</div>}

          {/* Vehicle Info */}
          {vehicleInfo && (
            <div style={styles.vehicleInfoBox}>
              <div style={styles.vehicleInfoHeader}>פרטי רכב:</div>
              <div style={styles.vehicleInfoRow}>
                <span>{vehicleInfo.manufacturer} {vehicleInfo.model} {vehicleInfo.year}</span>
                <span style={styles.pcdBadge}>
                  {vehicleInfo.bolt_count}×{vehicleInfo.bolt_spacing} | {vehicleInfo.rim_size || '?'}&quot;
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div style={styles.section}>
            <div style={styles.resultsHeader}>
              <h3 style={styles.sectionTitle}>תוצאות חיפוש</h3>
              <span style={styles.resultsCount}>
                נמצאו {results.reduce((sum, r) => sum + r.wheels.length, 0)} גלגלים ב-{results.length} תחנות
              </span>
            </div>

            {results.map(result => (
              <div key={result.station.id} style={styles.stationCard}>
                <div style={styles.stationHeader}>
                  <div>
                    <div style={styles.stationName}>{result.station.name}</div>
                    <div style={styles.stationAddress}>{result.station.address || 'כתובת לא הוגדרה'}</div>
                  </div>
                  <span style={styles.wheelCount}>{result.wheels.length} גלגלים</span>
                </div>
                <div style={styles.wheelsGrid}>
                  {result.wheels.map(wheel => (
                    <div
                      key={wheel.wheel_number}
                      style={styles.wheelItem}
                      onClick={() => openModal(result.station, wheel.wheel_number, wheel.pcd)}
                    >
                      <div style={styles.wheelNumber}>#{wheel.wheel_number}</div>
                      <div style={styles.wheelSpecs}>{wheel.pcd} | {wheel.rim_size}&quot;</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedWheel && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>יצירת הודעה לפונה</h3>
              <button style={styles.closeBtn} onClick={closeModal}>×</button>
            </div>

            <div style={styles.wheelInfoBox}>
              <div style={styles.wheelInfoTitle}>גלגל #{selectedWheel.wheelNumber}</div>
              <div style={styles.wheelInfoSub}>
                {selectedWheel.station.name} | {selectedWheel.pcd}
              </div>
            </div>

            <div style={styles.contactSection}>
              <h4 style={styles.contactTitle}>בחר איש קשר בתחנה:</h4>
              {selectedWheel.station.managers && selectedWheel.station.managers.length > 0 ? (
                selectedWheel.station.managers.map(manager => (
                  <div
                    key={manager.id}
                    style={{
                      ...styles.contactOption,
                      ...(selectedContact === manager.id ? styles.contactOptionSelected : {})
                    }}
                    onClick={() => setSelectedContact(manager.id)}
                  >
                    <div style={styles.contactName}>{manager.full_name}</div>
                    <div style={styles.contactPhone}>{manager.phone}</div>
                  </div>
                ))
              ) : (
                <div style={{color: '#64748b', textAlign: 'center', padding: '10px'}}>
                  אין אנשי קשר זמינים לתחנה זו
                </div>
              )}
            </div>

            <h4 style={styles.previewTitle}>תצוגה מקדימה:</h4>
            <div style={styles.messagePreview}>{getMessage()}</div>

            <button
              style={{...styles.copyBtn, ...(copied ? styles.copyBtnCopied : {})}}
              onClick={copyMessage}
            >
              {copied ? '✓ הועתק!' : '📋 העתק הודעה'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  pageWrapper: {
    background: '#0f172a',
    minHeight: '100vh',
    color: '#e2e8f0',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    direction: 'rtl',
  },
  loginContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    direction: 'rtl',
  },
  loginBox: {
    maxWidth: '380px',
    width: '100%',
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '20px',
    padding: '40px 30px',
    textAlign: 'center',
  },
  loginLogoIcon: {
    width: '70px',
    height: '70px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    margin: '0 auto 20px',
    boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
  },
  loginTitle: {
    fontSize: '1.5rem',
    color: 'white',
    fontWeight: 800,
    margin: '0 0 8px 0',
  },
  loginSubtitle: {
    color: '#64748b',
    margin: '0 0 25px 0',
  },
  loginBtn: {
    width: '100%',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    padding: '14px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '1rem',
    marginTop: '10px',
  },
  backLink: {
    display: 'block',
    color: '#64748b',
    textDecoration: 'none',
    marginTop: '20px',
    fontSize: '0.9rem',
    textAlign: 'center',
  },
  header: {
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    borderBottom: '1px solid #10b981',
    padding: '15px 20px',
  },
  headerContent: {
    maxWidth: '900px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoIcon: {
    width: '45px',
    height: '45px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.3rem',
  },
  headerTitle: {
    color: 'white',
    fontSize: '1.2rem',
    fontWeight: 700,
    margin: 0,
  },
  headerSubtitle: {
    color: '#10b981',
    fontSize: '0.85rem',
    margin: 0,
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  userName: {
    color: '#94a3b8',
    fontSize: '0.9rem',
  },
  btnLogout: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #ef4444',
    background: 'transparent',
    color: '#ef4444',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '20px',
  },
  section: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '20px',
  },
  sectionTitle: {
    color: 'white',
    fontSize: '1.1rem',
    fontWeight: 600,
    margin: '0 0 15px 0',
  },
  searchTabs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px',
  },
  searchTab: {
    flex: 1,
    padding: '10px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  searchTabActive: {
    background: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10b981',
    color: '#10b981',
  },
  searchRow: {
    display: 'flex',
    gap: '10px',
  },
  searchGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 80px auto',
    gap: '10px',
  },
  formGroup: {
    marginBottom: '15px',
    textAlign: 'right',
  },
  formLabel: {
    display: 'block',
    color: '#94a3b8',
    fontSize: '0.85rem',
    marginBottom: '6px',
  },
  formInput: {
    width: '100%',
    padding: '12px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: 'white',
    fontSize: '0.95rem',
    boxSizing: 'border-box',
  },
  searchBtn: {
    padding: '12px 20px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  errorText: {
    color: '#ef4444',
    fontSize: '0.9rem',
    marginTop: '10px',
  },
  vehicleInfoBox: {
    background: 'rgba(96, 165, 250, 0.1)',
    border: '1px solid rgba(96, 165, 250, 0.3)',
    borderRadius: '10px',
    padding: '12px',
    marginTop: '15px',
  },
  vehicleInfoHeader: {
    color: '#94a3b8',
    fontSize: '0.8rem',
    marginBottom: '6px',
  },
  vehicleInfoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'white',
    fontWeight: 600,
  },
  pcdBadge: {
    background: 'rgba(16, 185, 129, 0.2)',
    color: '#10b981',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.85rem',
  },
  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  resultsCount: {
    color: '#10b981',
    fontSize: '0.85rem',
  },
  stationCard: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '15px',
    marginBottom: '12px',
  },
  stationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
    paddingBottom: '12px',
    borderBottom: '1px solid #334155',
  },
  stationName: {
    color: 'white',
    fontWeight: 600,
    fontSize: '1rem',
  },
  stationAddress: {
    color: '#64748b',
    fontSize: '0.85rem',
    marginTop: '4px',
  },
  wheelCount: {
    color: '#10b981',
    fontSize: '0.85rem',
  },
  wheelsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: '8px',
  },
  wheelItem: {
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: '8px',
    padding: '10px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  wheelNumber: {
    color: '#10b981',
    fontSize: '1.3rem',
    fontWeight: 700,
  },
  wheelSpecs: {
    color: '#64748b',
    fontSize: '0.75rem',
    marginTop: '4px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '15px',
  },
  modal: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '450px',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '20px',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  modalTitle: {
    color: 'white',
    fontSize: '1.1rem',
    fontWeight: 600,
    margin: 0,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    fontSize: '1.5rem',
    cursor: 'pointer',
  },
  wheelInfoBox: {
    background: 'rgba(16, 185, 129, 0.1)',
    borderRadius: '10px',
    padding: '12px',
    marginBottom: '15px',
  },
  wheelInfoTitle: {
    color: '#10b981',
    fontWeight: 700,
  },
  wheelInfoSub: {
    color: '#94a3b8',
    fontSize: '0.85rem',
  },
  contactSection: {
    marginBottom: '15px',
  },
  contactTitle: {
    color: '#94a3b8',
    fontSize: '0.9rem',
    margin: '0 0 10px 0',
  },
  contactOption: {
    background: 'rgba(255,255,255,0.05)',
    border: '2px solid transparent',
    borderRadius: '10px',
    padding: '12px',
    marginBottom: '8px',
    cursor: 'pointer',
  },
  contactOptionSelected: {
    borderColor: '#60a5fa',
    background: 'rgba(96, 165, 250, 0.1)',
  },
  contactName: {
    color: 'white',
    fontWeight: 600,
  },
  contactPhone: {
    color: '#60a5fa',
    fontSize: '0.9rem',
  },
  previewTitle: {
    color: '#94a3b8',
    fontSize: '0.9rem',
    margin: '0 0 10px 0',
  },
  messagePreview: {
    background: '#0f172a',
    borderRadius: '10px',
    padding: '15px',
    marginBottom: '15px',
    whiteSpace: 'pre-line',
    fontSize: '0.9rem',
    lineHeight: 1.6,
    color: '#e2e8f0',
    border: '1px solid #334155',
  },
  copyBtn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    border: 'none',
    borderRadius: '10px',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '1rem',
  },
  copyBtnCopied: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  },
  spinner: {
    display: 'inline-block',
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '30px 20px',
    marginTop: '15px',
    background: 'rgba(16, 185, 129, 0.05)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    borderRadius: '12px',
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(16, 185, 129, 0.2)',
    borderTop: '3px solid #10b981',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '15px',
  },
  loadingText: {
    color: '#10b981',
    fontSize: '0.95rem',
    fontWeight: 500,
  },
}
