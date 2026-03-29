'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAdminPendingReports } from '@/hooks/useAdminPendingReports'

const NAV = [
  { href: '/admin',              label: '🏢 תחנות' },
  { href: '/admin/vehicles',     label: '🚗 מאגר רכבים' },
  { href: '/admin/reports',      label: '📋 דיווחי שגיאות', badge: true },
  { href: '/admin/call-centers', label: '🎧 מוקדים' },
  { href: '/admin/punctures',    label: '🔧 פנצ׳ריות' },
]

interface AdminHeaderProps {
  title:     string
  subtitle?: string
  icon:      string
  iconBg?:   string
  onLogout:  () => void
  hideNav?:  boolean
}

export function AdminHeader({
  title, subtitle, icon,
  iconBg = 'linear-gradient(135deg, #22c55e, #16a34a)',
  onLogout, hideNav = false,
}: AdminHeaderProps) {
  const pathname       = usePathname()
  const pendingReports = useAdminPendingReports()

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  const linkStyle = (active: boolean): React.CSSProperties => ({
    position: 'relative',
    padding: '6px 12px',
    borderRadius: 8,
    fontSize: '0.83rem',
    fontWeight: 600,
    textDecoration: 'none',
    color:      active ? '#f8fafc' : '#94a3b8',
    background: active ? '#334155' : 'transparent',
    border:     `1px solid ${active ? '#475569' : 'transparent'}`,
    transition: 'color 0.15s, background 0.15s',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  })

  return (
    <>
      <style>{`
        .ah-nav a:hover { color: #f8fafc !important; background: #334155 !important; border-color: #475569 !important; }
      `}</style>

      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)',
        borderBottom: '1px solid #334155',
        position: 'sticky', top: 0, zIndex: 200,
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '12px 20px 0' }}>

          {/* Row 1 — logo + title + logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 10 }}>
            <div style={{
              width: 40, height: 40, background: iconBg, borderRadius: 11,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.25rem', flexShrink: 0,
            }}>{icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</h1>
              {subtitle && <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b' }}>{subtitle}</p>}
            </div>
            <button onClick={onLogout} style={{
              padding: '6px 14px', borderRadius: 8, fontSize: '0.83rem', fontWeight: 600,
              background: 'transparent', color: '#f87171', border: '1px solid #334155',
              cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
            }}>יציאה</button>
          </div>

          {/* Row 2 — nav tabs (hidden when hideNav) */}
          {!hideNav && (
            <div className="ah-nav" style={{
              display: 'flex', gap: 2, overflowX: 'auto',
              scrollbarWidth: 'none', msOverflowStyle: 'none',
            }}>
              {NAV.map(link => (
                <Link key={link.href} href={link.href} style={linkStyle(isActive(link.href))}>
                  {link.label}
                  {link.badge && pendingReports > 0 && (
                    <span style={{
                      position: 'absolute', top: 4, left: 4,
                      width: 7, height: 7,
                      background: '#ef4444', borderRadius: '50%',
                      boxShadow: '0 0 5px #ef4444',
                    }} />
                  )}
                </Link>
              ))}
              {/* Active tab underline */}
            </div>
          )}

        </div>
      </div>
    </>
  )
}
