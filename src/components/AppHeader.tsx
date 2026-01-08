'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface UserSession {
  manager: {
    id: string
    full_name: string
    phone: string
    role: string
    station_id: string
    station_name: string
  }
  stationId: string
  stationName: string
}

interface AppHeaderProps {
  currentStationId?: string
}

export default function AppHeader({ currentStationId }: AppHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [userSession, setUserSession] = useState<UserSession | null>(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Find user session from localStorage
    const sessionKeys = Object.keys(localStorage).filter(key => key.startsWith('station_session_'))
    if (sessionKeys.length > 0) {
      try {
        const session = JSON.parse(localStorage.getItem(sessionKeys[0]) || '{}')
        if (session.manager) {
          setUserSession(session)
        }
      } catch {
        // Invalid session
      }
    }

    // Also check operator session
    const operatorSession = localStorage.getItem('operator_session')
    if (operatorSession) {
      try {
        const session = JSON.parse(operatorSession)
        if (session.operator) {
          setUserSession({
            manager: {
              id: session.operator.id,
              full_name: session.operator.full_name,
              phone: session.operator.phone,
              role: 'operator',
              station_id: session.stationId,
              station_name: session.stationName || ''
            },
            stationId: session.stationId,
            stationName: session.stationName || ''
          })
        }
      } catch {
        // Invalid session
      }
    }

    setIsLoading(false)
  }, [])

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showProfileMenu && !(e.target as Element).closest('.profile-dropdown')) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showProfileMenu])

  const handleLogout = () => {
    // Clear all session data
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('station_session_') || key.startsWith('wheel_manager_') || key === 'operator_session') {
        localStorage.removeItem(key)
      }
    })
    toast.success('התנתקת בהצלחה')
    router.push('/login')
  }

  const isOwnStation = userSession?.stationId === currentStationId
  const isOnStationsPage = pathname === '/' || pathname === '/stations'
  const isOnSearchPage = pathname === '/search'

  // Get user initials for avatar
  const getInitials = (name: string) => {
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0]
    }
    return name.substring(0, 2)
  }

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin': return 'מנהל מערכת'
      case 'manager': return 'מנהל תחנה'
      case 'operator': return 'מוקדן'
      default: return 'משתמש'
    }
  }

  if (isLoading) {
    return null
  }

  if (!userSession) {
    return null // Don't show header if not logged in
  }

  return (
    <>
      <header style={styles.header}>
        <div style={styles.headerRight}>
          {/* Search Button */}
          <Link href="/search" style={{...styles.btn, ...styles.btnSearch, ...(isOnSearchPage ? styles.btnActive : {})}}>
            <span>🔍</span>
            <span>חיפוש רכב</span>
          </Link>

          {/* All Stations Button */}
          <Link href="/" style={{...styles.btn, ...styles.btnStations, ...(isOnStationsPage ? styles.btnActive : {})}}>
            <span>📍</span>
            <span>כל התחנות</span>
          </Link>

          {/* Station Indicator */}
          {currentStationId && (
            <div style={{...styles.stationIndicator, ...(isOwnStation ? {} : styles.stationIndicatorOther)}}>
              <span>{isOwnStation ? '🏠' : '👁️'}</span>
              <span>{isOwnStation ? 'התחנה שלי' : 'צפייה בתחנה אחרת'}</span>
            </div>
          )}
        </div>

        <div style={styles.headerLeft}>
          {/* Profile Dropdown */}
          <div className="profile-dropdown" style={styles.profileDropdown}>
            <button
              style={styles.profileBtn}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <span style={styles.profileArrow}>▼</span>
              <div style={styles.profileInfo}>
                <div style={styles.profileName}>{userSession.manager.full_name}</div>
                <div style={styles.profileRole}>{getRoleDisplay(userSession.manager.role)}</div>
              </div>
              <div style={styles.profileAvatar}>
                {getInitials(userSession.manager.full_name)}
              </div>
            </button>

            {showProfileMenu && (
              <div style={styles.dropdownMenu}>
                {/* My Station - show if not on own station */}
                {!isOwnStation && userSession.stationId && (
                  <Link
                    href={`/${userSession.stationId}`}
                    style={styles.dropdownItem}
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <span>🏠</span>
                    <span>התחנה שלי</span>
                  </Link>
                )}

                {/* Station actions - only on own station */}
                {isOwnStation && (
                  <>
                    <Link
                      href={`/${currentStationId}/add`}
                      style={styles.dropdownItem}
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <span>➕</span>
                      <span>הוספת גלגל</span>
                    </Link>
                    <Link
                      href={`/sign/${currentStationId}`}
                      style={styles.dropdownItem}
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <span>📝</span>
                      <span>טופס השאלה</span>
                    </Link>
                    <Link
                      href={`/${currentStationId}/history`}
                      style={styles.dropdownItem}
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <span>📋</span>
                      <span>היסטוריית התחנה</span>
                    </Link>
                    <Link
                      href={`/${currentStationId}/settings`}
                      style={styles.dropdownItem}
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <span>⚙️</span>
                      <span>הגדרות תחנה</span>
                    </Link>
                  </>
                )}

                <div style={styles.dropdownDivider} />

                <button
                  style={{...styles.dropdownItem, ...styles.dropdownItemDanger}}
                  onClick={handleLogout}
                >
                  <span>🚪</span>
                  <span>התנתק</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      {/* Spacer to push content below fixed header */}
      <div style={styles.headerSpacer} />
    </>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    borderBottom: '1px solid #334155',
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '15px',
  },
  headerSpacer: {
    height: '70px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  btn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s',
    textDecoration: 'none',
    color: 'white',
  },
  btnSearch: {
    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
  },
  btnStations: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  },
  btnActive: {
    boxShadow: '0 0 0 2px white',
    transform: 'scale(1.02)',
  },
  stationIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    color: '#22c55a',
  },
  stationIndicatorOther: {
    background: 'rgba(251, 191, 36, 0.1)',
    borderColor: 'rgba(251, 191, 36, 0.3)',
    color: '#fbbf24',
  },
  profileDropdown: {
    position: 'relative',
  },
  profileBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#334155',
    border: '1px solid #475569',
    borderRadius: '10px',
    padding: '8px 14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: 'white',
  },
  profileAvatar: {
    width: '36px',
    height: '36px',
    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '14px',
  },
  profileInfo: {
    textAlign: 'right' as const,
  },
  profileName: {
    fontWeight: 600,
    fontSize: '14px',
  },
  profileRole: {
    fontSize: '11px',
    color: '#94a3b8',
  },
  profileArrow: {
    color: '#64748b',
    marginRight: '5px',
    fontSize: '10px',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: 0,
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '10px',
    minWidth: '200px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
    zIndex: 100,
    overflow: 'hidden',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    cursor: 'pointer',
    transition: 'background 0.2s',
    borderBottom: '1px solid #334155',
    textDecoration: 'none',
    color: 'white',
    background: 'none',
    border: 'none',
    width: '100%',
    textAlign: 'right' as const,
    fontSize: '14px',
  },
  dropdownItemDanger: {
    color: '#f87171',
  },
  dropdownDivider: {
    height: '1px',
    background: '#334155',
    margin: '4px 0',
  },
}
