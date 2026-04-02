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
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const roleMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const forceLogout = (reason: string) => {
      console.log(`Force logout: ${reason}`)
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('station_session_') || key.startsWith('wheel_manager_') || key === 'operator_session') {
          localStorage.removeItem(key)
        }
      })
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }

    const sessionKeys = Object.keys(localStorage).filter(key => key.startsWith('station_session_'))
    if (sessionKeys.length > 0) {
      try {
        const session = JSON.parse(localStorage.getItem(sessionKeys[0]) || '{}')
        if (!session.version || session.version < SESSION_VERSION) {
          forceLogout('Session version outdated')
          return
        }
        if (session.manager) {
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
        forceLogout('Invalid session data')
        return
      }
    }

    const operatorSession = localStorage.getItem('operator_session')
    if (operatorSession) {
      try {
        const session = JSON.parse(operatorSession)
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
        forceLogout('Invalid operator session data')
        return
      }
    }

    try {
      const storedRoles = localStorage.getItem('auth_roles')
      const storedActiveRole = localStorage.getItem('active_role')
      if (storedRoles) {
        setAuthRoles(JSON.parse(storedRoles))
        if (storedActiveRole) setActiveRole(storedActiveRole)
      } else {
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
            setAuthRoles([{ role: 'operator', label: 'מוקדן', data: s.user }])
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

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false)
  }, [pathname])

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

  const isOwnStation = currentStationId && userSession?.stationId === currentStationId
  const isOnStationsPage = pathname === '/stations'
  const isOnSearchPage = pathname === '/search'

  const getUserInitials = (fullName: string | undefined) => {
    if (!fullName) return '?'
    const parts = fullName.trim().split(' ').filter(p => p.length > 0)
    if (parts.length >= 2) return parts[0][0] + parts[1][0]
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

  const currentRoleLabel = authRoles.find(r => r.role === activeRole)?.label ?? authRoles[0]?.label

  if (isLoading || !userSession) return null

  const dropdownMenuContent = (
    <>
      <div style={styles.menuUserInfo}>
        <div style={styles.menuStationNameLarge}>{userSession.manager.full_name}</div>
        <div style={styles.menuUserPhone}>{userSession.stationName || userSession.manager.station_name || 'התחנה שלי'}</div>
      </div>

      <div style={styles.dropdownDivider} />

      {userSession.stationId && (
        <>
          {!isOwnStation && (
            <Link href={`/${userSession.stationId}`} style={styles.dropdownItem} onClick={() => setShowProfileMenu(false)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <span>התחנה שלי</span>
            </Link>
          )}

          {(isOwnStation || isOnStationsPage || isOnSearchPage) && (
            <>
              <Link href={`/search?from=${userSession.stationId}`} style={styles.dropdownItem} onClick={() => setShowProfileMenu(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <span>חיפוש רכב</span>
              </Link>
              <Link href={`/${userSession.stationId}?action=add`} style={styles.dropdownItem} onClick={() => setShowProfileMenu(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
                <span>הוסף גלגל</span>
              </Link>
              <Link href={`/${userSession.stationId}?action=excel`} style={styles.dropdownItem} onClick={() => setShowProfileMenu(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="12" y1="3" x2="12" y2="21"/>
                </svg>
                <span>יבוא/יצוא Excel</span>
              </Link>
              <Link href={`/${userSession.stationId}?action=settings`} style={styles.dropdownItem} onClick={() => setShowProfileMenu(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
                </svg>
                <span>הגדרות תחנה</span>
              </Link>
              <Link href={`/${userSession.stationId}?action=notifications`} style={styles.dropdownItem} onClick={() => setShowProfileMenu(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
                <span>הפעל התראות</span>
              </Link>

              <div style={styles.submenuContainer}>
                <button
                  style={{ ...styles.dropdownItem, ...styles.submenuTrigger }}
                  onClick={(e) => { e.stopPropagation(); setShowFormSubmenu(!showFormSubmenu) }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                  </svg>
                  <span>קישור לטופס השאלה</span>
                  <span style={styles.submenuArrow}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      {showFormSubmenu ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
                    </svg>
                  </span>
                </button>
                {showFormSubmenu && (
                  <div style={styles.submenu}>
                    <Link href={`/sign/${userSession.stationId}`} style={styles.submenuItem} onClick={() => { setShowProfileMenu(false); setShowFormSubmenu(false) }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                      </svg>
                      <span>פתח טופס</span>
                    </Link>
                    <button style={styles.submenuItem} onClick={handleCopyFormLink}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                        <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                      </svg>
                      <span>העתק קישור</span>
                    </button>
                    <button style={styles.submenuItem} onClick={handleWhatsAppForm}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                      </svg>
                      <span>שלח בוואטסאפ</span>
                    </button>
                  </div>
                )}
              </div>

              <div style={styles.dropdownDivider} />

              <Link href={`/${userSession.stationId}?action=password`} style={styles.dropdownItem} onClick={() => setShowProfileMenu(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <span>שינוי סיסמא</span>
              </Link>
              <Link href={`/${userSession.stationId}?action=recovery`} style={styles.dropdownItem} onClick={() => setShowProfileMenu(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
                <span>תעודת שחזור</span>
              </Link>
            </>
          )}
        </>
      )}

      <Link href="/guide?tab=manager" style={styles.dropdownItem} onClick={() => setShowProfileMenu(false)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <span>מדריך למנהלים</span>
      </Link>

      <div style={styles.dropdownDivider} />

      <button style={{ ...styles.dropdownItem, ...styles.dropdownItemDanger }} onClick={handleLogout}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        <span>התנתק</span>
      </button>
    </>
  )

  return (
    <>
      <style>{`
        .header-nav { display: flex; align-items: center; gap: 6px; padding-right: 10px; }
        .header-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; padding: 0 14px; border-right: 1px solid rgba(226,232,240,0.6); border-left: 1px solid rgba(226,232,240,0.6); height: 54px; flex-shrink: 0; }
        .hamburger-btn { display: none !important; }

        @media (max-width: 640px) {
          .header-nav { display: none !important; }
          .header-logo-text { display: none !important; }
          .hamburger-btn { display: flex !important; }
          .station-indicator { display: none !important; }
          .profile-info { display: none !important; }
          .profile-role { display: none !important; }
          .role-chip { display: none !important; }
          .app-header { padding: 0 10px !important; }
        }
        @media (max-width: 380px) {
          .header-logo { padding: 0 8px !important; }
        }
        @media all and (display-mode: standalone) {
          .app-header-wrap {
            padding-top: max(8px, env(safe-area-inset-top, 8px)) !important;
          }
          .app-header-spacer {
            height: calc(70px + env(safe-area-inset-top, 0px)) !important;
          }
        }
      `}</style>

      {/* Floating glass header */}
      <div className="app-header-wrap" style={styles.headerWrap}>
        <header className="app-header" style={styles.header}>

          {/* ── RIGHT (RTL start): Avatar ── */}
          <div className="profile-dropdown" style={styles.profileDropdown}>
            <button
              style={styles.profileBtn}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              aria-haspopup="menu"
              aria-expanded={showProfileMenu}
              aria-label={`תפריט פרופיל - ${userSession.manager.full_name}`}
              title={userSession.manager.full_name}
            >
              <div className="profile-avatar" style={styles.profileAvatar}>
                {getUserInitials(userSession.manager.full_name)}
              </div>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {showProfileMenu && (
              <div id="profile-menu" role="menu" style={styles.dropdownMenu}>
                {dropdownMenuContent}
              </div>
            )}
          </div>

          {/* ── Logo ── */}
          <a className="header-logo" href="/stations" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '0 14px', borderRight: '1px solid rgba(226,232,240,0.6)', borderLeft: '1px solid rgba(226,232,240,0.6)', height: '54px', flexShrink: 0 }}>
            <div style={styles.logoIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="3"/>
                <line x1="12" y1="2" x2="12" y2="9"/>
                <line x1="12" y1="15" x2="12" y2="22"/>
                <line x1="2" y1="12" x2="9" y2="12"/>
                <line x1="15" y1="12" x2="22" y2="12"/>
              </svg>
            </div>
          </a>

          {/* ── Nav buttons (desktop) ── */}
          <nav className="header-nav">
            <Link
              href="/stations"
              className="app-header-btn"
              style={{ ...styles.btn, ...styles.btnStations, ...(isOnStationsPage ? styles.btnActive : {}) }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <span>כל התחנות</span>
            </Link>
            <Link
              href="/search"
              className="app-header-btn"
              style={{ ...styles.btn, ...styles.btnSearch, ...(isOnSearchPage ? styles.btnActive : {}) }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <span>חיפוש רכב</span>
            </Link>
          </nav>

          {/* ── Spacer ── */}
          <div style={{ flex: 1 }} />

          {/* ── LEFT (RTL end): station indicator, alerts, role, hamburger ── */}
          <div style={styles.headerLeft}>
            {/* Station indicator */}
            {currentStationId && (
              <div
                className="station-indicator"
                style={{ ...styles.stationIndicator, ...(isOwnStation ? styles.stationIndicatorOwn : styles.stationIndicatorOther) }}
              >
                {isOwnStation ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
                <span>{isOwnStation ? 'התחנה שלי' : 'צפייה בתחנה אחרת'}</span>
              </div>
            )}

            {/* Alerts bell */}
            {notificationCount !== undefined && notificationCount > 0 && userSession?.stationId && (
              <Link
                href={`/${userSession.stationId}?tab=alerts`}
                style={{ ...styles.alertsBtn, position: 'relative' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
                <span style={styles.alertBadge}>{notificationCount}</span>
              </Link>
            )}

            {/* Role chip */}
            {authRoles.length > 0 && currentRoleLabel && (
              <div ref={roleMenuRef} style={{ position: 'relative' }} className="role-chip">
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
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </button>
                    {showRoleMenu && (
                      <div style={styles.roleDropdown} role="menu">
                        {authRoles.map((r) => (
                          <button
                            key={r.role}
                            role="menuitem"
                            style={{ ...styles.roleOption, ...(r.role === activeRole ? styles.roleOptionActive : {}) }}
                            onClick={() => navigateToRole(r)}
                          >
                            {r.role === activeRole && (
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            )}
                            {r.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Hamburger (mobile only) */}
            <button
              className="hamburger-btn"
              style={styles.hamburgerBtn}
              onClick={() => setShowMobileMenu(true)}
              aria-label="תפריט"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>
        </header>
      </div>

      {/* Spacer */}
      <div className="app-header-spacer" style={styles.headerSpacer} />

      {/* ── Mobile Drawer ── */}
      {showMobileMenu && (
        <div style={styles.drawerOverlay} onClick={() => setShowMobileMenu(false)}>
          <div style={styles.drawer} onClick={(e) => e.stopPropagation()}>
            {/* Drawer header */}
            <div style={styles.drawerHeader}>
              <div style={styles.drawerAvatar}>{getUserInitials(userSession.manager.full_name)}</div>
              <div>
                <div style={styles.drawerName}>{userSession.manager.full_name}</div>
                <div style={styles.drawerRoleBadge}>{currentRoleLabel || getRoleDisplay(userSession.manager.role)}</div>
              </div>
              <button style={styles.drawerClose} onClick={() => setShowMobileMenu(false)} aria-label="סגור">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Nav items */}
            <div style={styles.drawerNav}>
              <Link href="/stations" style={{ ...styles.drawerItem, ...(isOnStationsPage ? styles.drawerItemActive : {}) }} onClick={() => setShowMobileMenu(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                כל התחנות
              </Link>
              <Link href="/search" style={{ ...styles.drawerItem, ...(isOnSearchPage ? styles.drawerItemActive : {}) }} onClick={() => setShowMobileMenu(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                חיפוש רכב
              </Link>
              {notificationCount !== undefined && notificationCount > 0 && userSession?.stationId && (
                <Link href={`/${userSession.stationId}?tab=alerts`} style={styles.drawerItem} onClick={() => setShowMobileMenu(false)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
                  </svg>
                  התראות
                  <span style={styles.drawerBadge}>{notificationCount}</span>
                </Link>
              )}
              {userSession.stationId && (
                <Link href={`/${userSession.stationId}`} style={styles.drawerItem} onClick={() => setShowMobileMenu(false)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  התחנה שלי
                </Link>
              )}
            </div>

            {/* Logout */}
            <div style={styles.drawerFooter}>
              <button style={styles.drawerLogout} onClick={() => { setShowMobileMenu(false); handleLogout() }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                התנתק
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  /* ── Header wrap (adds top padding for floating) ── */
  headerWrap: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    padding: '8px 12px 0',
  },
  /* ── Glassmorphism header ── */
  header: {
    background: 'rgba(255,255,255,0.82)',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    border: '1px solid rgba(255,255,255,0.9)',
    boxShadow: '0 4px 20px rgba(37,99,235,0.08), 0 1px 4px rgba(0,0,0,0.04)',
    borderRadius: '16px',
    padding: '0 14px',
    height: '54px',
    display: 'flex',
    alignItems: 'center',
    gap: '0',
    direction: 'rtl',
  },
  headerSpacer: {
    height: '70px',
  },
  /* ── Logo ── */
  logoIcon: {
    width: '30px',
    height: '30px',
    background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
    borderRadius: '9px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(37,99,235,0.28)',
    flexShrink: 0,
  },
  logoText: {
    fontSize: '15px',
    fontWeight: 800,
    color: '#1e293b',
    letterSpacing: '-0.3px',
  },
  /* ── Nav buttons ── */
  btn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 12px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  },
  btnStations: {
    background: 'rgba(37,99,235,0.10)',
    color: '#2563eb',
  },
  btnSearch: {
    background: 'rgba(22,163,74,0.10)',
    color: '#16a34a',
  },
  btnActive: {
    boxShadow: '0 0 0 2px currentColor',
    opacity: 1,
  },
  /* ── Left cluster ── */
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  stationIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '5px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
  },
  stationIndicatorOwn: {
    background: 'rgba(22,163,74,0.10)',
    color: '#16a34a',
  },
  stationIndicatorOther: {
    background: 'rgba(234,179,8,0.12)',
    color: '#ca8a04',
  },
  alertsBtn: {
    width: '34px',
    height: '34px',
    background: 'rgba(234,179,8,0.12)',
    borderRadius: '9px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    textDecoration: 'none',
    border: 'none',
    flexShrink: 0,
  },
  alertBadge: {
    position: 'absolute' as const,
    top: '-5px',
    left: '-5px',
    background: '#ef4444',
    color: 'white',
    fontSize: '9px',
    fontWeight: 700,
    minWidth: '16px',
    height: '16px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 3px',
    border: '1.5px solid rgba(255,255,255,0.9)',
  },
  roleStatic: {
    background: 'rgba(37,99,235,0.08)',
    color: '#2563eb',
    fontSize: '12px',
    fontWeight: 600,
    padding: '5px 12px',
    borderRadius: '20px',
    whiteSpace: 'nowrap',
  } as React.CSSProperties,
  roleBtn: {
    background: 'rgba(37,99,235,0.08)',
    color: '#2563eb',
    fontSize: '12px',
    fontWeight: 600,
    padding: '5px 10px',
    borderRadius: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
    border: 'none',
  } as React.CSSProperties,
  roleDropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    overflow: 'hidden',
    minWidth: '150px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
    zIndex: 200,
  } as React.CSSProperties,
  roleOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    color: '#1e293b',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: 500,
    background: 'transparent',
    border: 'none',
    width: '100%',
    textAlign: 'right' as const,
    fontFamily: 'inherit',
  } as React.CSSProperties,
  roleOptionActive: {
    color: '#2563eb',
    fontWeight: 700,
  } as React.CSSProperties,
  hamburgerBtn: {
    width: '34px',
    height: '34px',
    background: 'rgba(255,255,255,0.7)',
    border: '1px solid rgba(226,232,240,0.7)',
    borderRadius: '9px',
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
  },
  /* ── Profile avatar button ── */
  profileDropdown: {
    position: 'relative',
  },
  profileBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    background: 'rgba(255,255,255,0.8)',
    border: '1px solid rgba(226,232,240,0.8)',
    borderRadius: '50px',
    padding: '4px 8px 4px 6px',
    cursor: 'pointer',
    color: '#1e293b',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  profileAvatar: {
    width: '32px',
    height: '32px',
    background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '13px',
    color: 'white',
    flexShrink: 0,
  },
  primaryStar: {
    position: 'absolute' as const,
    bottom: '-3px',
    left: '-3px',
    lineHeight: 1,
    filter: 'drop-shadow(0 0 3px rgba(245,158,11,0.5))',
  },
  profileInfo: {
    textAlign: 'right' as const,
  },
  profileName: {
    fontWeight: 600,
    fontSize: '13px',
    color: '#1e293b',
  },
  profileRole: {
    fontSize: '11px',
    color: '#64748b',
  },
  /* ── Profile dropdown menu ── */
  dropdownMenu: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    minWidth: '210px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
    zIndex: 100,
    overflow: 'hidden',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '11px 16px',
    cursor: 'pointer',
    borderBottom: '1px solid #f1f5f9',
    border: 'none',
    textDecoration: 'none',
    color: '#1e293b',
    background: 'none',
    width: '100%',
    textAlign: 'right' as const,
    fontSize: '13px',
    fontFamily: 'inherit',
    fontWeight: 500,
  },
  dropdownItemDanger: {
    color: '#ef4444',
  },
  dropdownDivider: {
    height: '1px',
    background: '#e2e8f0',
    margin: '4px 0',
  },
  menuUserInfo: {
    padding: '16px',
    background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)',
    textAlign: 'center' as const,
    borderBottom: '1px solid #e2e8f0',
  },
  menuStationNameLarge: {
    fontWeight: 700,
    fontSize: '15px',
    color: '#2563eb',
    marginBottom: '4px',
  },
  menuUserPhone: {
    fontSize: '12px',
    color: '#64748b',
  },
  submenuContainer: {
    position: 'relative' as const,
  },
  submenuTrigger: {
    justifyContent: 'flex-start',
  },
  submenuArrow: {
    marginRight: 'auto',
    color: '#94a3b8',
  },
  submenu: {
    background: '#f8fafc',
    borderTop: '1px solid #e2e8f0',
  },
  submenuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 16px 10px 30px',
    cursor: 'pointer',
    borderBottom: '1px solid #f1f5f9',
    textDecoration: 'none',
    color: '#475569',
    background: 'none',
    border: 'none',
    width: '100%',
    textAlign: 'right' as const,
    fontSize: '13px',
    fontFamily: 'inherit',
  },
  /* ── Mobile drawer ── */
  drawerOverlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(15,23,42,0.4)',
    zIndex: 2000,
    display: 'flex',
    justifyContent: 'flex-end',
    direction: 'rtl',
  },
  drawer: {
    background: '#ffffff',
    width: '280px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    direction: 'rtl',
    boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
    overflowY: 'auto',
  },
  drawerHeader: {
    background: 'linear-gradient(135deg, #dbeafe 0%, #faf5ff 100%)',
    padding: '20px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid #e2e8f0',
    position: 'relative' as const,
  },
  drawerAvatar: {
    width: '46px',
    height: '46px',
    background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '15px',
    fontWeight: 700,
    color: 'white',
    flexShrink: 0,
  },
  drawerName: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: '4px',
  },
  drawerRoleBadge: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: 600,
    color: '#2563eb',
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    padding: '2px 9px',
    borderRadius: '10px',
  },
  drawerClose: {
    position: 'absolute' as const,
    top: '14px',
    left: '14px',
    background: 'rgba(255,255,255,0.7)',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  drawerNav: {
    flex: 1,
    padding: '8px 0',
    borderBottom: '1px solid #f1f5f9',
  },
  drawerItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '13px 18px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#475569',
    textDecoration: 'none',
    borderBottom: '1px solid #f8fafc',
    cursor: 'pointer',
  },
  drawerItemActive: {
    color: '#2563eb',
    background: '#eff6ff',
  },
  drawerBadge: {
    marginRight: 'auto',
    background: '#ef4444',
    color: 'white',
    fontSize: '10px',
    fontWeight: 700,
    minWidth: '18px',
    height: '18px',
    borderRadius: '9px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
  },
  drawerFooter: {
    padding: '8px 0 12px',
  },
  drawerLogout: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '13px 18px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#ef4444',
    background: 'none',
    border: 'none',
    width: '100%',
    textAlign: 'right' as const,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
}
