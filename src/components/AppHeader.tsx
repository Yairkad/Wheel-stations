'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { SESSION_VERSION } from '@/lib/version'
import type { RoleResult } from '@/app/api/auth/login/route'

interface UserSession {
  manager: {
    id: string
    full_name: string
    phone: string
    role: string
    station_id: string
    station_name: string
    is_primary?: boolean
  }
  stationId: string
  stationName: string
  version?: number
}

interface AppHeaderProps {
  currentStationId?: string
  notificationCount?: number
}

export default function AppHeader({ currentStationId, notificationCount }: AppHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [userSession, setUserSession] = useState<UserSession | null>(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showFormSubmenu, setShowFormSubmenu] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [authRoles, setAuthRoles] = useState<RoleResult[]>([])
  const [activeRole, setActiveRole] = useState<string | null>(null)
  const [showRoleMenu, setShowRoleMenu] = useState(false)
  const roleMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Helper to clear all sessions and redirect to login
    const forceLogout = (reason: string) => {
      console.log(`Force logout: ${reason}`)
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('station_session_') || key.startsWith('wheel_manager_') || key === 'operator_session') {
          localStorage.removeItem(key)
        }
      })
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }

    // Find user session from localStorage
    const sessionKeys = Object.keys(localStorage).filter(key => key.startsWith('station_session_'))
    if (sessionKeys.length > 0) {
      try {
        const session = JSON.parse(localStorage.getItem(sessionKeys[0]) || '{}')

        // Check session version - force logout if outdated
        if (!session.version || session.version < SESSION_VERSION) {
          forceLogout('Session version outdated')
          return
        }

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
        forceLogout('Invalid session data')
        return
      }
    }

    // Also check operator session
    const operatorSession = localStorage.getItem('operator_session')
    if (operatorSession) {
      try {
        const session = JSON.parse(operatorSession)

        // Check session version for operator too
        if (!session.version || session.version < SESSION_VERSION) {
          forceLogout('Operator session version outdated')
          return
        }

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
        forceLogout('Invalid operator session data')
        return
      }
    }

    // Load unified auth roles for role switcher
    try {
      const storedRoles = localStorage.getItem('auth_roles')
      const storedActiveRole = localStorage.getItem('active_role')
      if (storedRoles) {
        setAuthRoles(JSON.parse(storedRoles))
        if (storedActiveRole) setActiveRole(storedActiveRole)
      } else {
        // Fallback: synthesize a single role from legacy session keys
        const stationKey = Object.keys(localStorage).find(k => k.startsWith('station_session_'))
        const operatorRaw = localStorage.getItem('operator_session')
        const superRaw = localStorage.getItem('super_manager_session')
        const punctureRaw = localStorage.getItem('puncture_manager_auth')

        if (stationKey) {
          const s = JSON.parse(localStorage.getItem(stationKey) || '{}')
          if (s.manager) {
            setAuthRoles([{ role: 'station_manager', label: 'מנהל תחנה', data: s.manager }])
            setActiveRole('station_manager')
          }
        } else if (operatorRaw) {
          const s = JSON.parse(operatorRaw)
          if (s.user) {
            const label = s.role === 'manager' ? 'מוקדן' : 'מוקדן'
            setAuthRoles([{ role: 'operator', label, data: s.user }])
            setActiveRole('operator')
          }
        } else if (superRaw) {
          const s = JSON.parse(superRaw)
          if (s.superManager) {
            setAuthRoles([{ role: 'district_manager', label: 'מנהל מחוז', data: s.superManager }])
            setActiveRole('district_manager')
          }
        } else if (punctureRaw) {
          setAuthRoles([{ role: 'editor', label: 'עורך', data: {} }])
          setActiveRole('editor')
        }
      }
    } catch { /* ignore */ }

    setIsLoading(false)
  }, [])

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showProfileMenu && !(e.target as Element).closest('.profile-dropdown')) {
        setShowProfileMenu(false)
      }
      if (showRoleMenu && roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) {
        setShowRoleMenu(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showProfileMenu, showRoleMenu])

  const handleLogout = () => {
    Object.keys(localStorage).forEach(key => {
      if (
        key.startsWith('station_session_') ||
        key.startsWith('wheel_manager_') ||
        key === 'operator_session' ||
        key === 'super_manager_session' ||
        key === 'puncture_manager_auth' ||
        key === 'auth_roles' ||
        key === 'active_role'
      ) {
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
  const isOnStationsPage = pathname === '/stations'
  const isOnSearchPage = pathname === '/search'

  // Get user initials for avatar
  const getUserInitials = (fullName: string | undefined) => {
    if (!fullName) return '👤'
    const parts = fullName.trim().split(' ').filter(p => p.length > 0)
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0]
    }
    return fullName.substring(0, 2)
  }

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin': return 'מנהל מערכת'
      case 'manager': return 'מנהל תחנה'
      case 'operator': return 'מוקדן'
      default: return 'משתמש'
    }
  }

  const navigateToRole = (r: RoleResult) => {
    localStorage.setItem('active_role', r.role)
    setActiveRole(r.role)
    setShowRoleMenu(false)
    const d = r.data
    switch (r.role) {
      case 'station_manager': router.push(`/${d.station_id as string}`); break
      case 'operator': router.push(d.sub_role === 'manager' ? '/call-center' : '/operator'); break
      case 'district_manager': router.push('/super-manager'); break
      case 'editor': router.push('/admin/punctures'); break
    }
  }

  const currentRoleLabel = authRoles.find(r => r.role === activeRole)?.label
    ?? authRoles[0]?.label

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
          .app-header-btn .btn-text-full {
            display: none !important;
          }
          .app-header-btn .btn-text-short {
            display: inline !important;
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
        @media all and (display-mode: standalone) {
          .app-header {
            padding-top: max(12px, env(safe-area-inset-top, 12px)) !important;
          }
          .app-header-spacer {
            height: calc(70px + env(safe-area-inset-top, 0px)) !important;
          }
        }
      `}</style>
      <header className="app-header" style={styles.header}>
        {/* Right side - Profile (RTL) */}
        <div style={styles.headerRight}>
          {/* Role Switcher */}
          {authRoles.length > 0 && currentRoleLabel && (
            <div ref={roleMenuRef} style={{ position: 'relative' }}>
              {authRoles.length === 1 ? (
                <span style={styles.roleStatic}>{currentRoleLabel}</span>
              ) : (
                <>
                  <button
                    style={styles.roleBtn}
                    onClick={() => setShowRoleMenu(!showRoleMenu)}
                    aria-haspopup="menu"
                    aria-expanded={showRoleMenu}
                  >
                    {currentRoleLabel}
                    <span style={{ fontSize: '10px', color: '#60a5fa' }}>▼</span>
                  </button>
                  {showRoleMenu && (
                    <div style={styles.roleDropdown} role="menu">
                      {authRoles.map((r) => (
                        <button
                          key={r.role}
                          role="menuitem"
                          style={{
                            ...styles.roleOption,
                            ...(r.role === activeRole ? styles.roleOptionActive : {}),
                          }}
                          onClick={() => navigateToRole(r)}
                        >
                          <span style={{ fontSize: '11px', width: '14px' }}>
                            {r.role === activeRole ? '✓' : ''}
                          </span>
                          {r.label}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Profile Dropdown */}
          <div className="profile-dropdown" style={styles.profileDropdown}>
            <button
              style={styles.profileBtn}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              aria-haspopup="menu"
              aria-expanded={showProfileMenu}
              aria-controls="profile-menu"
              aria-label={`תפריט פרופיל - ${userSession.manager.full_name}`}
            >
              <div style={{position: 'relative', flexShrink: 0}}>
                <div className="profile-avatar" style={styles.profileAvatar}>
                  {getUserInitials(userSession.manager.full_name)}
                </div>
                {userSession.manager.is_primary && (
                  <span
                    title="מנהל ראשי"
                    style={{
                      position: 'absolute', bottom: '-4px', left: '-4px',
                      fontSize: '12px', lineHeight: 1,
                      filter: 'drop-shadow(0 0 3px #f59e0b)',
                    }}
                  >⭐</span>
                )}
              </div>
              <div className="profile-info" style={styles.profileInfo}>
                <div className="profile-name" style={styles.profileName}>{userSession.manager.full_name}</div>
                <div className="profile-role" style={styles.profileRole}>
                  {userSession.manager.is_primary ? '⭐ מנהל ראשי' : getRoleDisplay(userSession.manager.role)}
                </div>
              </div>
              <span className="profile-arrow" style={styles.profileArrow}>▼</span>
            </button>

            {showProfileMenu && (
              <div id="profile-menu" role="menu" style={styles.dropdownMenu}>
                {/* User info section */}
                <div style={styles.menuUserInfo}>
                  <div style={{...styles.menuStationNameLarge, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'}}>
                    {userSession.manager.is_primary && <span title="מנהל ראשי" style={{filter: 'drop-shadow(0 0 4px #f59e0b)'}}>⭐</span>}
                    {userSession.manager.full_name}
                  </div>
                  <div style={styles.menuUserPhone}>{userSession.stationName || userSession.manager.station_name || 'התחנה שלי'}</div>
                  {userSession.manager.is_primary && (
                    <div style={{fontSize: '11px', color: '#f59e0b', marginTop: '4px'}}>הרשאות עריכה מלאות</div>
                  )}
                </div>

                <div style={styles.dropdownDivider} />

                {/* My Station - show if user has a station */}
                {userSession.stationId && (
                  <>
                    {/* Go to my station - only show if not on own station */}
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

                    {/* Station management actions - only show on own station or search/home pages */}
                    {(isOwnStation || isOnStationsPage || isOnSearchPage) && (
                      <>
                        <Link
                          href={`/search?from=${userSession.stationId}`}
                          style={styles.dropdownItem}
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <span>🔍</span>
                          <span>חיפוש רכב</span>
                        </Link>
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

                        <div style={styles.dropdownDivider} />

                        {/* Account actions */}
                        <Link
                          href={`/${userSession.stationId}?action=password`}
                          style={styles.dropdownItem}
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <span>🔑</span>
                          <span>שינוי סיסמא</span>
                        </Link>
                        <Link
                          href={`/${userSession.stationId}?action=recovery`}
                          style={styles.dropdownItem}
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <span>📄</span>
                          <span>תעודת שחזור</span>
                        </Link>
                      </>
                    )}
                  </>
                )}

                {/* Always show guide and logout */}
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
          <Link href="/stations" className="app-header-btn" style={{...styles.btn, ...styles.btnStations, ...(isOnStationsPage ? styles.btnActive : {})}}>
            <span>🏪</span>
            <span className="btn-text-full">כל התחנות</span>
            <span className="btn-text-short" style={{display: 'none'}}>תחנות</span>
          </Link>

          {/* Search Button */}
          <Link href="/search" className="app-header-btn" style={{...styles.btn, ...styles.btnSearch, ...(isOnSearchPage ? styles.btnActive : {})}}>
            <span>🔍</span>
            <span className="btn-text-full">חיפוש רכב</span>
            <span className="btn-text-short" style={{display: 'none'}}>חיפוש</span>
          </Link>

          {/* Alerts Bell - only when there are notifications */}
          {notificationCount !== undefined && notificationCount > 0 && userSession?.stationId && (
            <Link
              href={`/${userSession.stationId}?tab=alerts`}
              className="app-header-btn"
              style={{...styles.btn, ...styles.btnAlerts, position: 'relative'}}
            >
              <span>🔔</span>
              <span className="btn-text-full">התראות</span>
              <span className="btn-text-short" style={{display: 'none'}}>התראות</span>
              <span style={styles.alertBadge}>{notificationCount}</span>
            </Link>
          )}
        </div>
      </header>
      {/* Spacer to push content below fixed header */}
      <div className="app-header-spacer" style={styles.headerSpacer} />
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
  btnAlerts: {
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  },
  alertBadge: {
    position: 'absolute' as const,
    top: '-6px',
    left: '-6px',
    background: '#ec4899',
    color: 'white',
    fontSize: '0.7rem',
    fontWeight: 700,
    minWidth: '18px',
    height: '18px',
    borderRadius: '9px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
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
  roleStatic: {
    background: 'rgba(30, 58, 95, 0.8)',
    border: '1px solid #3b82f6',
    color: '#93c5fd',
    fontSize: '13px',
    fontWeight: '600',
    padding: '5px 14px',
    borderRadius: '20px',
    whiteSpace: 'nowrap',
  } as React.CSSProperties,
  roleBtn: {
    background: 'rgba(30, 58, 95, 0.8)',
    border: '1px solid #3b82f6',
    color: '#93c5fd',
    fontSize: '13px',
    fontWeight: '600',
    padding: '5px 10px',
    borderRadius: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
    transition: 'background 0.15s',
  } as React.CSSProperties,
  roleDropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '10px',
    overflow: 'hidden',
    minWidth: '150px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    zIndex: 200,
  } as React.CSSProperties,
  roleOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    color: '#cbd5e1',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: '500',
    background: 'transparent',
    border: 'none',
    width: '100%',
    textAlign: 'right' as const,
    fontFamily: 'inherit',
    transition: 'background 0.15s',
  } as React.CSSProperties,
  roleOptionActive: {
    color: '#60a5fa',
    fontWeight: '700',
  } as React.CSSProperties,
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
