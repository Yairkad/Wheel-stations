'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAdminPendingReports } from '@/hooks/useAdminPendingReports'

const buildingIcon = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline',verticalAlign:'middle',marginLeft:4}}><rect x="2" y="7" width="20" height="14"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
const carIcon      = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline',verticalAlign:'middle',marginLeft:4}}><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="15" cy="17" r="2"/></svg>
const clipboardIcon = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline',verticalAlign:'middle',marginLeft:4}}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
const headphonesIcon = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline',verticalAlign:'middle',marginLeft:4}}><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
const wrenchIcon   = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline',verticalAlign:'middle',marginLeft:4}}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>

const NAV = [
  { href: '/admin',              labelText: 'תחנות',        labelIcon: buildingIcon },
  { href: '/admin/vehicles',     labelText: 'מאגר רכבים',   labelIcon: carIcon },
  { href: '/admin/reports',      labelText: 'דיווחי שגיאות', labelIcon: clipboardIcon, badge: true },
  { href: '/admin/call-centers', labelText: 'מוקדים',       labelIcon: headphonesIcon },
  { href: '/admin/punctures',    labelText: 'פנצ׳ריות',     labelIcon: wrenchIcon },
]

interface AdminHeaderProps {
  title:     string
  subtitle?: string
  icon:      React.ReactNode
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
              flexShrink: 0, color: '#ffffff',
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
                  <span style={{display:'inline-flex',alignItems:'center'}}>{link.labelIcon}{link.labelText}</span>
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
