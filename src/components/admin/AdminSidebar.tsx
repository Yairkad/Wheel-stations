'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useAdminPendingReports } from '@/hooks/useAdminPendingReports'
import { SESSION_VERSION } from '@/lib/version'
import type { RoleResult } from '@/app/api/auth/login/route'

const icons = {
  stations: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  ),
  vehicles: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="15" cy="17" r="2"/>
    </svg>
  ),
  reports: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    </svg>
  ),
  callCenters: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
    </svg>
  ),
  punctures: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  logout: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  menu: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
}

const NAV: ({ href: string; label: string; icon: React.ReactNode; badge?: boolean; divider?: boolean } | { divider: true; href?: undefined })[] = [
  { href: '/admin',              label: 'תחנות',        icon: icons.stations    },
  { href: '/admin/vehicles',     label: 'מאגר רכבים',   icon: icons.vehicles    },
  { href: '/admin/reports',      label: 'דיווחי שגיאות', icon: icons.reports, badge: true },
  { href: '/admin/call-centers', label: 'מוקדים',       icon: icons.callCenters },
  { href: '/admin/punctures',    label: 'פנצ׳ריות',     icon: icons.punctures   },
  { divider: true },
  { href: '/admin/users',        label: 'משתמשים',      icon: icons.users       },
]

interface AdminSidebarProps {
  onLogout: () => void
}

export function AdminSidebar({ onLogout }: AdminSidebarProps) {
  const pathname       = usePathname()
  const router         = useRouter()
  const pendingReports = useAdminPendingReports()
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [otherRoles,   setOtherRoles]   = useState<RoleResult[]>([])
  const [showRolePick, setShowRolePick] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('auth_roles')
      if (stored) {
        const all: RoleResult[] = JSON.parse(stored)
        setOtherRoles(all.filter(r => r.role !== 'admin'))
      }
    } catch { /* ignore */ }
  }, [])

  function navigateToRole(r: RoleResult) {
    localStorage.setItem('active_role', r.role)
    setShowRolePick(false)
    const d = r.data
    const pwd = localStorage.getItem('auth_password') || ''
    switch (r.role) {
      case 'station_manager': {
        localStorage.setItem(`station_session_${d.station_id as string}`, JSON.stringify({
          manager: { id: d.id, full_name: d.full_name, phone: d.phone, role: d.role || 'מנהל תחנה', is_primary: d.is_primary || false },
          stationId: d.station_id,
          stationName: d.station_name,
          password: pwd,
          timestamp: Date.now(),
          version: SESSION_VERSION,
        }))
        router.push(`/${d.station_id as string}`)
        break
      }
      case 'operator': {
        localStorage.setItem('operator_session', JSON.stringify({
          user: { id: d.id, full_name: d.full_name, phone: d.phone, title: d.title, is_primary: d.is_primary },
          role: d.sub_role === 'manager' ? 'manager' : 'operator',
          callCenterId: d.call_center_id,
          callCenterName: d.call_center_name,
          password: pwd,
          timestamp: Date.now(),
          version: SESSION_VERSION,
        }))
        router.push(d.sub_role === 'manager' ? '/call-center' : '/operator')
        break
      }
      case 'district_manager': {
        localStorage.setItem('super_manager_session', JSON.stringify({
          superManager: { id: d.id, full_name: d.full_name, phone: d.phone, allowed_districts: d.allowed_districts },
          password: pwd,
          timestamp: Date.now(),
          version: SESSION_VERSION,
        }))
        router.push('/super-manager')
        break
      }
      case 'editor': {
        localStorage.setItem('puncture_manager_auth', JSON.stringify({
          expiry: Date.now() + 30 * 24 * 60 * 60 * 1000,
          phone: d.phone,
          password: pwd,
        }))
        router.push('/admin/punctures')
        break
      }
    }
  }

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  const sidebarContent = (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
      borderLeft: '1px solid #334155',
      direction: 'rtl',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.2 }}>גלגלנט</div>
            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>ממשק ניהול</div>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        <div style={{ marginBottom: 4, padding: '0 8px 6px', fontSize: '0.65rem', color: '#475569', fontWeight: 700, letterSpacing: '0.08em' }}>
          ניהול מערכת
        </div>
        {NAV.map((item, i) => {
          if (item.divider) {
            return <div key={`divider-${i}`} style={{ height: 1, background: '#1e293b', margin: '12px 8px' }} />
          }
          const active = isActive(item.href!)
          return (
            <Link
              key={item.href}
              href={item.href!}
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8, marginBottom: 2,
                textDecoration: 'none', position: 'relative',
                color:      active ? '#f8fafc' : '#94a3b8',
                background: active ? '#334155' : 'transparent',
                fontWeight: active ? 700 : 500,
                fontSize: '0.875rem',
                transition: 'all 0.15s',
              }}
              className="sidebar-link"
            >
              <span style={{ flexShrink: 0, opacity: active ? 1 : 0.7 }}>{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && pendingReports > 0 && (
                <span style={{
                  marginRight: 'auto',
                  minWidth: 18, height: 18,
                  background: '#ef4444', borderRadius: 9,
                  fontSize: '0.65rem', fontWeight: 800, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 5px',
                  boxShadow: '0 0 6px rgba(239,68,68,0.6)',
                }}>
                  {pendingReports}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Role switcher + Logout */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid #1e293b' }}>
        {/* Switch role */}
        {otherRoles.length > 0 && (
          <div style={{ position: 'relative', marginBottom: 4 }}>
            <button
              onClick={() => setShowRolePick(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '9px 12px', borderRadius: 8,
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500,
                transition: 'background 0.15s',
              }}
              className="sidebar-switch"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span>החלף תפקיד</span>
            </button>
            {showRolePick && (
              <div style={{
                position: 'absolute', bottom: '110%', right: 0, left: 0,
                background: '#1e293b', border: '1px solid #334155', borderRadius: 8,
                overflow: 'hidden', zIndex: 50,
              }}>
                {otherRoles.map(r => (
                  <button
                    key={r.role}
                    onClick={() => navigateToRole(r)}
                    style={{
                      display: 'block', width: '100%', textAlign: 'right',
                      padding: '10px 14px', background: 'none', border: 'none',
                      color: '#e2e8f0', fontSize: '0.85rem', cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#334155')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <button
          onClick={onLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            width: '100%', padding: '9px 12px', borderRadius: 8,
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: '#f87171', fontSize: '0.875rem', fontWeight: 600,
            transition: 'background 0.15s',
          }}
          className="sidebar-logout"
        >
          {icons.logout}
          <span>יציאה</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        .sidebar-link:hover { color: #f8fafc !important; background: #1e293b !important; }
        .sidebar-logout:hover { background: rgba(248,113,113,0.1) !important; }
        .sidebar-switch:hover { background: #1e293b !important; color: #f8fafc !important; }
        @media (max-width: 768px) {
          .admin-sidebar-desktop { display: none !important; }
          .admin-sidebar-mobile-btn { display: flex !important; }
        }
        @media (min-width: 769px) {
          .admin-sidebar-mobile-btn { display: none !important; }
          .admin-sidebar-overlay { display: none !important; }
        }
      `}</style>

      {/* Desktop sidebar */}
      <div className="admin-sidebar-desktop" style={{
        width: 220, flexShrink: 0, height: '100vh',
        position: 'sticky', top: 0,
      }}>
        {sidebarContent}
      </div>

      {/* Mobile top bar */}
      <div className="admin-sidebar-mobile-btn" style={{
        display: 'none',
        position: 'fixed', top: 0, right: 0, left: 0, zIndex: 300,
        background: '#0f172a', borderBottom: '1px solid #334155',
        padding: '10px 16px', alignItems: 'center', gap: 12,
        direction: 'rtl',
      }}>
        <button
          onClick={() => setMobileOpen(v => !v)}
          style={{ background: 'none', border: 'none', color: '#f8fafc', cursor: 'pointer', padding: 4 }}
        >
          {icons.menu}
        </button>
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>ניהול</span>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 400,
            background: 'rgba(0,0,0,0.5)',
          }}
        />
      )}

      {/* Mobile drawer */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 500,
          width: 240,
        }}>
          {sidebarContent}
        </div>
      )}
    </>
  )
}
