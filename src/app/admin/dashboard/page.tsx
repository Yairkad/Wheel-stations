'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { useAdminPendingReports } from '@/hooks/useAdminPendingReports'
import { AdminShell } from '@/components/admin/AdminShell'
import { icons } from '@/components/admin/AdminSidebar'
import Footer from '@/components/Footer'

interface DashboardStats {
  users: number
  stations: number
  callCenters: number
  punctures: number
  vehicles: number
  trustedMatches: number
}

interface CardDef {
  href: string
  label: string
  icon: React.ReactNode
  color: string
  value: number | undefined
}

export default function AdminDashboardPage() {
  const { isAuthenticated, isLoading: authLoading, logout } = useAdminAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const pendingReports = useAdminPendingReports()

  useEffect(() => {
    if (isAuthenticated) {
      fetch('/api/admin/dashboard-stats')
        .then(r => r.json())
        .then(d => { setStats(d); setLoading(false) })
        .catch(() => setLoading(false))
    }
  }, [isAuthenticated])

  if (authLoading || !isAuthenticated) {
    return <div style={s.loadingPage}><p>טוען...</p></div>
  }

  const cards: CardDef[] = [
    { href: '/admin/users',           label: 'משתמשים',        icon: icons.users,          color: '#14b8a6', value: stats?.users },
    { href: '/admin',                 label: 'תחנות',          icon: icons.stations,       color: '#22c55e', value: stats?.stations },
    { href: '/admin/call-centers',    label: 'מוקדים',         icon: icons.callCenters,    color: '#3b82f6', value: stats?.callCenters },
    { href: '/admin/punctures',       label: 'פנצ׳ריות',       icon: icons.punctures,      color: '#f59e0b', value: stats?.punctures },
    { href: '/admin/analytics',       label: 'סטטיסטיקות',      icon: icons.analytics,      color: '#8b5cf6', value: undefined },
    { href: '/admin/vehicles',        label: 'מאגר רכבים',      icon: icons.vehicles,       color: '#ec4899', value: stats?.vehicles },
    { href: '/admin/reports',         label: 'דיווחי שגיאות',   icon: icons.reports,        color: '#ef4444', value: pendingReports },
    { href: '/admin/trusted-matches', label: 'התאמות מהימנות',  icon: icons.trustedMatches, color: '#06b6d4', value: stats?.trustedMatches },
  ]

  return (
    <AdminShell onLogout={logout}>
      <style>{`
        .dash-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.08) !important; }
      `}</style>
      <div style={s.page}>
        {/* Header */}
        <div style={s.pageHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={s.headerIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>
              </svg>
            </div>
            <div>
              <h1 style={s.pageTitle}>לוח בקרה</h1>
              <p style={s.pageSubtitle}>גישה מהירה לכל תחומי הניהול</p>
            </div>
          </div>
        </div>

        <div style={s.content}>
          <div style={s.grid}>
            {cards.map(card => (
              <Link key={card.href} href={card.href} style={s.card} className="dash-card">
                <div style={{ ...s.cardIcon, background: card.color }}>
                  {card.icon}
                </div>
                {card.value !== undefined && (
                  <div style={s.cardValue}>{loading ? '—' : card.value}</div>
                )}
                <div style={s.cardLabel}>{card.label}</div>
              </Link>
            ))}
          </div>
        </div>

        <Footer />
      </div>
    </AdminShell>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh', background: '#f1f5f9', direction: 'rtl',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", paddingBottom: 40,
  },
  loadingPage: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#f1f5f9', color: '#64748b',
  },
  pageHeader: {
    maxWidth: 1200, margin: '0 auto', padding: '20px 20px 16px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
  },
  headerIcon: {
    width: 46, height: 46, borderRadius: 12, flexShrink: 0,
    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  pageTitle: { margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#1e293b' },
  pageSubtitle: { margin: 0, fontSize: '0.85rem', color: '#64748b' },
  content: { maxWidth: 1200, margin: '0 auto', padding: '0 20px' },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14,
  },
  card: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14,
    padding: '20px 14px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    textDecoration: 'none', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s',
  },
  cardIcon: {
    width: 44, height: 44, borderRadius: 12, marginBottom: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
  },
  cardValue: { fontSize: '1.6rem', fontWeight: 800, color: '#1e293b', lineHeight: 1 },
  cardLabel: { fontSize: '0.82rem', color: '#64748b', marginTop: 6, fontWeight: 600 },
}
