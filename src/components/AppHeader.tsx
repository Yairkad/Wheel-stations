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
  const [showFormSubmenu, setShowFormSubmenu] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Find user session from localStorage
    const sessionKeys = Object.keys(localStorage).filter(key => key.startsWith('station_session_'))
    if (sessionKeys.length > 0) {
      try {
        const session = JSON.parse(localStorage.getItem(sessionKeys[0]) || '{}')
        if (session.manager) {
          // Make sure stationId is set correctly from the session key or manager data
          const stationIdFromKey = sessionKeys[0].replace('station_session_', '')
          setUserSession({
            ...session,
            stationId: session.stationId || session.manager.station_id || stationIdFromKey,
            manager: {
              ...session.manager,
              station_id: session.manager.station_id || stationIdFromKey
            }
          })
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

  const getFormUrl = () => {
    if (!userSession?.stationId) return ''
    return `${window.location.origin}/sign/${userSession.stationId}`
  }

  const handleCopyFormLink = () => {
    const url = getFormUrl()
    if (url) {
      navigator.clipboard.writeText(url)
      toast.success('הקישור הועתק!')
      setShowProfileMenu(false)
      setShowFormSubmenu(false)
    }
  }

  const handleWhatsAppForm = () => {
    const url = getFormUrl()
    const stationName = userSession?.stationName || userSession?.manager.station_name || 'התחנה'
    const message = `שלום! הנה קישור לטופס השאלת גלגל מ${stationName}:\n${url}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
    setShowProfileMenu(false)
    setShowFormSubmenu(false)
  }

  // Check if current page is user's own station
  const isOwnStation = currentStationId && userSession?.stationId === currentStationId
  const isOnStationsPage = pathname === '/' || pathname === '/stations'
  const isOnSearchPage = pathname === '/search'

  // Get station initials for avatar
  const getStationInitials = (stationName: string | undefined) => {
    if (!stationName) return '🏠'
    const parts = stationName.split(' ')
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0]
    }
    return stationName.substring(0, 2)
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
      <style>{`
        @media (max-width: 768px) {
          .app-header {
            padding: 10px 12px !important;
            gap: 8px !important;
          }
          .app-header-right {
            gap: 6px !important;
          }
          .app-header-btn {
            padding: 6px 10px !important;
            font-size: 12px !important;
          }
          .app-header-btn span:last-child {
            display: none !important;
          }
          .app-header-btn span:first-child {
            font-size: 16px !important;
          }
          .station-indicator {
            display: none !important;
          }
          .profile-name {
            font-size: 12px !important;
          }
          .profile-role {
            display: none !important;
          }
          .profile-avatar {
            width: 32px !important;
            height: 32px !important;
            font-size: 12px !important;
          }
          .profile-arrow {
            display: none !important;
          }
        }
        @media (max-width: 480px) {
          .app-header-btn {
            padding: 6px 8px !important;
          }
          .profile-info {
            display: none !important;
          }
        }
      `}</style>
      <header className="app-header" style={styles.header}>
        {/* Right side - Profile (RTL) */}
        <div style={styles.headerRight}>
          {/* Profile Dropdown */}
          <div className="profile-dropdown" style={styles.profileDropdown}>
            <button
              style={styles.profileBtn}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="profile-avatar" style={styles.profileAvatar}>
                {getStationInitials(userSession.stationName)}
              </div>
              <div className="profile-info" style={styles.profileInfo}>
                <div className="profile-name" style={styles.profileName}>{userSession.manager.full_name}</div>
                <div className="profile-role" style={styles.profileRole}>{getRoleDisplay(userSession.manager.role)}</div>
              </div>
              <span className="profile-arrow" style={styles.profileArrow}>▼</span>
            </button>

            {showProfileMenu && (
              <div style={styles.dropdownMenu}>
                {/* User info section */}
                <div style={styles.menuUserInfo}>
                  <div style={styles.menuStationNameLarge}>{userSession.stationName || userSession.manager.station_name || 'התחנה שלי'}</div>
                  <div style={styles.menuUserPhone}>{userSession.manager.phone}</div>
                </div>

                <div style={styles.dropdownDivider} />

                {/* My Station - show if user has a station */}
                {userSession.stationId && (
                  <>
                    {/* Go to my station - only show if not already there */}
                    {!isOwnStation && (
                      <Link
                        href={`/${userSession.stationId}`}
                        style={styles.dropdownItem}
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <span>🏠</span>
                        <span>התחנה שלי</span>
                      </Link>
                    )}

                    {/* Station management actions - link to station page where modals exist */}
                    {(userSession.manager.role === 'manager' || userSession.manager.role === 'admin') && (
                      <>
                        <Link
                          href={`/${userSession.stationId}?action=add`}
                          style={styles.dropdownItem}
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <span>➕</span>
                          <span>הוסף גלגל</span>
                        </Link>
                        <Link
                          href={`/${userSession.stationId}?action=excel`}
                          style={styles.dropdownItem}
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <span>📊</span>
                          <span>יבוא/יצוא Excel</span>
                        </Link>
                        <Link
                          href={`/${userSession.stationId}?action=settings`}
                          style={styles.dropdownItem}
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <span>⚙️</span>
                          <span>הגדרות תחנה</span>
                        </Link>
                        <Link
                          href={`/${userSession.stationId}?action=notifications`}
                          style={styles.dropdownItem}
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <span>🔔</span>
                          <span>הפעל התראות</span>
                        </Link>
                      </>
                    )}

                    {/* Form link submenu */}
                    <div style={styles.submenuContainer}>
                      <button
                        style={{...styles.dropdownItem, ...styles.submenuTrigger}}
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowFormSubmenu(!showFormSubmenu)
                        }}
                      >
                        <span>🔗</span>
                        <span>קישור לטופס השאלה</span>
                        <span style={styles.submenuArrow}>{showFormSubmenu ? '▲' : '▼'}</span>
                      </button>
                      {showFormSubmenu && (
                        <div style={styles.submenu}>
                          <Link
                            href={`/sign/${userSession.stationId}`}
                            style={styles.submenuItem}
                            onClick={() => {
                              setShowProfileMenu(false)
                              setShowFormSubmenu(false)
                            }}
                          >
                            <span>📝</span>
                            <span>פתח טופס</span>
                          </Link>
                          <button
                            style={styles.submenuItem}
                            onClick={handleCopyFormLink}
                          >
                            <span>📋</span>
                            <span>העתק קישור</span>
                          </button>
                          <button
                            style={styles.submenuItem}
                            onClick={handleWhatsAppForm}
                          >
                            <span>💬</span>
                            <span>שלח בוואטסאפ</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}

                <div style={styles.dropdownDivider} />

                {/* Account actions */}
                {userSession.stationId && (
                  <Link
                    href={`/${userSession.stationId}?action=password`}
                    style={styles.dropdownItem}
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <span>🔑</span>
                    <span>שינוי סיסמא</span>
                  </Link>
                )}
                <Link
                  href="/guide?tab=manager"
                  style={styles.dropdownItem}
                  onClick={() => setShowProfileMenu(false)}
                >
                  <span>📖</span>
                  <span>מדריך למנהלים</span>
                </Link>

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

        {/* Left side - Buttons (RTL) */}
        <div className="app-header-right" style={styles.headerLeft}>
          {/* Station Indicator */}
          {currentStationId && (
            <div className="station-indicator" style={{...styles.stationIndicator, ...(isOwnStation ? styles.stationIndicatorOwn : styles.stationIndicatorOther)}}>
              <span>{isOwnStation ? '🏠' : '👁️'}</span>
              <span>{isOwnStation ? 'התחנה שלי' : 'צפייה בתחנה אחרת'}</span>
            </div>
          )}

          {/* All Stations Button */}
          <Link href="/" className="app-header-btn" style={{...styles.btn, ...styles.btnStations, ...(isOnStationsPage ? styles.btnActive : {})}}>
            <span>📍</span>
            <span>כל התחנות</span>
          </Link>

          {/* Search Button */}
          <Link href="/search" className="app-header-btn" style={{...styles.btn, ...styles.btnSearch, ...(isOnSearchPage ? styles.btnActive : {})}}>
            <span>🔍</span>
            <span>חיפוש רכב</span>
          </Link>
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
    direction: 'rtl',
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
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '13px',
  },
  stationIndicatorOwn: {
    background: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    color: '#22c55a',
  },
  stationIndicatorOther: {
    background: 'rgba(251, 191, 36, 0.1)',
    border: '1px solid rgba(251, 191, 36, 0.3)',
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
    fontSize: '10px',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
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
  menuUserInfo: {
    padding: '16px',
    background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
    textAlign: 'center' as const,
  },
  menuUserLabel: {
    fontSize: '11px',
    color: '#64748b',
    marginBottom: '4px',
    textTransform: 'uppercase' as const,
  },
  menuStationNameLarge: {
    fontWeight: 700,
    fontSize: '16px',
    color: '#60a5fa',
    marginBottom: '6px',
  },
  menuUserPhone: {
    fontSize: '13px',
    color: '#94a3b8',
  },
  submenuContainer: {
    position: 'relative' as const,
  },
  submenuTrigger: {
    justifyContent: 'flex-start',
  },
  submenuArrow: {
    marginRight: 'auto',
    fontSize: '10px',
    color: '#64748b',
  },
  submenu: {
    background: '#0f172a',
    borderTop: '1px solid #334155',
  },
  submenuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 16px 10px 30px',
    cursor: 'pointer',
    transition: 'background 0.2s',
    borderBottom: '1px solid #1e293b',
    textDecoration: 'none',
    color: '#94a3b8',
    background: 'none',
    border: 'none',
    width: '100%',
    textAlign: 'right' as const,
    fontSize: '13px',
  },
}
