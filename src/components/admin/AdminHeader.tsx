'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAdminPendingReports } from '@/hooks/useAdminPendingReports'

// ─── Nav definition ────────────────────────────────────────────────────────────

const NAV = [
  { href: '/admin',              label: '🏢 תחנות' },
  { href: '/admin/vehicles',     label: '🚗 מאגר רכבים' },
  { href: '/admin/reports',      label: '📋 דיווחי שגיאות', badge: true },
  { href: '/admin/call-centers', label: '🎧 מוקדים' },
  { href: '/admin/punctures',    label: '🔧 פנצ׳ריות' },
]

// ─── Props ────────────────────────────────────────────────────────────────────

interface AdminHeaderProps {
  title:     string
  subtitle?: string
  icon:      string
  iconBg?:   string
  onLogout:  () => void
  /** When true, hides the nav links (e.g. puncture managers who can't access other pages) */
  hideNav?:  boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminHeader({
  title, subtitle, icon,
  iconBg = 'linear-gradient(135deg, #22c55e, #16a34a)',
  onLogout, hideNav = false,
}: AdminHeaderProps) {
  const pathname       = usePathname()
  const pendingReports = useAdminPendingReports()

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  return (
    <>
      <style>{`
        .admin-header-nav a:hover { color: #f8fafc !important; background: #1e293b !important; }
        @media (max-width: 640px) {
          .admin-header-wrap    { padding: 10px 12px !important; }
          .admin-header-icon    { width: 32px !important; height: 32px !important; font-size: 1rem !important; border-radius: 9px !important; }
          .admin-header-title   { font-size: 0.88rem !important; }
          .admin-header-sub     { display: none !important; }
          .admin-header-nav     { overflow-x: auto; flex-wrap: nowrap !important; gap: 4px !important; padding-bottom: 2px; }
          .admin-header-nav a,
          .admin-header-nav button { padding: 5px 8px !important; font-size: 0.73rem !important; }
        }
      `}</style>

      <div className="admin-header-wrap" style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)',
        borderBottom: '1px solid #334155',
        padding: '16px 24px',
        position: 'sticky', top: 0, zIndex: 200,
      }}>
        <div style={{
          maxWidth: 1400, margin: '0 auto',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          gap: 10,
        }}>

          {/* Logo + title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, minWidth: 0 }}>
            <div className="admin-header-icon" style={{
              width: 44, height: 44, background: iconBg,
              borderRadius: 13, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0,
            }}>{icon}</div>
            <div style={{ minWidth: 0 }}>
              <h1 className="admin-header-title" style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</h1>
              {subtitle && <p className="admin-header-sub" style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>{subtitle}</p>}
            </div>
          </div>

          {/* Nav + logout */}
          <div className="admin-header-nav" style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 1, minWidth: 0 }}>
            {!hideNav && NAV.map(link => (
              <Link key={link.href} href={link.href} style={{
                position: 'relative',
                padding: '7px 13px',
                borderRadius: 9,
                fontSize: '0.84rem',
                fontWeight: 600,
                textDecoration: 'none',
                color:      isActive(link.href) ? '#f8fafc' : '#94a3b8',
                background: isActive(link.href) ? '#334155' : 'transparent',
                border: `1px solid ${isActive(link.href) ? '#475569' : 'transparent'}`,
                transition: 'color 0.15s, background 0.15s',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}>
                {link.label}
                {link.badge && pendingReports > 0 && (
                  <span style={{
                    position: 'absolute', top: 5, left: 5,
                    width: 8, height: 8,
                    background: '#ef4444', borderRadius: '50%',
                    boxShadow: '0 0 6px #ef4444',
                  }} />
                )}
              </Link>
            ))}

            <button onClick={onLogout} style={{
              padding: '7px 14px',
              borderRadius: 9,
              fontSize: '0.84rem',
              fontWeight: 600,
              background: '#1e293b',
              color: '#f87171',
              border: '1px solid #334155',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}>יציאה</button>
          </div>

        </div>
      </div>
    </>
  )
}
