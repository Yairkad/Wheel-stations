'use client'

import { useState, useEffect } from 'react'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { AdminShell } from '@/components/admin/AdminShell'

interface LoginEntry {
  id: string
  user_id: string | null
  full_name: string
  phone: string | null
  role: string
  ip: string | null
  created_at: string
}

interface UserSummary {
  user_id: string | null
  full_name: string
  phone: string | null
  roles: string[]
  count: number
  last_login: string
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'ניהול מערכת',
  station_manager: 'מנהל תחנה',
  district_manager: 'מנהל מחוז',
  super_manager: 'מנהל מחוז',
  operator: 'מוקדן',
  call_center_manager: 'מנהל מוקד',
  puncture_manager: 'עורך פנצ׳ריות',
  editor: 'עורך',
}

const ROLE_COLORS: Record<string, string> = {
  admin: '#8b5cf6',
  station_manager: '#22c55e',
  district_manager: '#3b82f6',
  super_manager: '#3b82f6',
  operator: '#f59e0b',
  call_center_manager: '#f59e0b',
  puncture_manager: '#ec4899',
  editor: '#ec4899',
}

function fmt(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('he-IL') + ' ' + d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
}

export default function LoginReportPage() {
  const { isAuthenticated, isLoading: authLoading, logout } = useAdminAuth()
  const [summary, setSummary] = useState<UserSummary[]>([])
  const [logs, setLogs] = useState<LoginEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(90)
  const [view, setView] = useState<'summary' | 'log'>('summary')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (isAuthenticated) fetchData()
  }, [isAuthenticated, days])

  async function fetchData() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/login-report?days=${days}`)
      if (res.ok) {
        const data = await res.json()
        setSummary(data.summary || [])
        setLogs(data.logs || [])
      }
    } finally {
      setLoading(false)
    }
  }

  const filteredSummary = search
    ? summary.filter(u =>
        u.full_name.includes(search) ||
        u.phone?.includes(search) ||
        u.roles.some(r => r.includes(search))
      )
    : summary

  const filteredLogs = search
    ? logs.filter(l =>
        l.full_name.includes(search) ||
        l.phone?.includes(search)
      )
    : logs

  if (authLoading || !isAuthenticated) {
    return (
      <div style={s.loadingPage}>
        <p>טוען...</p>
      </div>
    )
  }

  return (
    <AdminShell onLogout={logout}>
      <div style={s.page}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.headerTitle}>
            <div style={s.titleIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div>
              <h1 style={s.title}>דוח כניסות למערכת</h1>
              <p style={s.subtitle}>{summary.length} משתמשים • {logs.length} כניסות ב-{days} ימים אחרונים</p>
            </div>
          </div>

          <div style={s.controls}>
            <select value={days} onChange={e => setDays(Number(e.target.value))} style={s.select}>
              <option value={30}>30 יום</option>
              <option value={90}>90 יום</option>
              <option value={180}>180 יום</option>
              <option value={365}>שנה</option>
            </select>
            <div style={s.viewToggle}>
              <button
                style={{ ...s.toggleBtn, ...(view === 'summary' ? s.toggleActive : {}) }}
                onClick={() => setView('summary')}
              >
                סיכום
              </button>
              <button
                style={{ ...s.toggleBtn, ...(view === 'log' ? s.toggleActive : {}) }}
                onClick={() => setView('log')}
              >
                יומן מלא
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div style={s.searchWrap}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="חפש לפי שם, טלפון..."
            style={s.searchInput}
          />
        </div>

        {loading ? (
          <div style={s.empty}>טוען...</div>
        ) : view === 'summary' ? (
          <div style={s.tableWrap}>
            {filteredSummary.length === 0 ? (
              <div style={s.empty}>אין נתונים</div>
            ) : (
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>שם</th>
                    <th style={s.th}>טלפון</th>
                    <th style={s.th}>תפקיד</th>
                    <th style={s.th}>כניסות</th>
                    <th style={s.th}>כניסה אחרונה</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSummary.map((u, i) => (
                    <tr key={i} style={i % 2 === 0 ? s.rowEven : s.rowOdd}>
                      <td style={s.td}><strong>{u.full_name}</strong></td>
                      <td style={s.td}>{u.phone || '—'}</td>
                      <td style={s.td}>
                        <div style={s.rolesList}>
                          {u.roles.map(r => (
                            <span key={r} style={{ ...s.roleBadge, background: `${ROLE_COLORS[Object.entries(ROLE_LABELS).find(([,v]) => v === r)?.[0] || ''] || '#64748b'}20`, color: ROLE_COLORS[Object.entries(ROLE_LABELS).find(([,v]) => v === r)?.[0] || ''] || '#64748b' }}>
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ ...s.td, ...s.countCell }}>{u.count}</td>
                      <td style={s.td}>{fmt(u.last_login)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div style={s.tableWrap}>
            {filteredLogs.length === 0 ? (
              <div style={s.empty}>אין נתונים</div>
            ) : (
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>תאריך ושעה</th>
                    <th style={s.th}>שם</th>
                    <th style={s.th}>טלפון</th>
                    <th style={s.th}>תפקיד</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((l, i) => (
                    <tr key={l.id} style={i % 2 === 0 ? s.rowEven : s.rowOdd}>
                      <td style={s.td}>{fmt(l.created_at)}</td>
                      <td style={s.td}><strong>{l.full_name}</strong></td>
                      <td style={s.td}>{l.phone || '—'}</td>
                      <td style={s.td}>
                        <span style={{ ...s.roleBadge, background: `${ROLE_COLORS[l.role] || '#64748b'}20`, color: ROLE_COLORS[l.role] || '#64748b' }}>
                          {ROLE_LABELS[l.role] || l.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </AdminShell>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#f1f5f9',
    direction: 'rtl',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    paddingTop: 16,
    paddingBottom: 40,
  },
  loadingPage: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f1f5f9',
    color: '#64748b',
  },
  header: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '20px 20px 12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  titleIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  title: {
    margin: 0,
    fontSize: '1.4rem',
    fontWeight: 800,
    color: '#1e293b',
  },
  subtitle: {
    margin: 0,
    fontSize: '0.85rem',
    color: '#64748b',
  },
  controls: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  select: {
    padding: '8px 14px',
    borderRadius: 10,
    border: '1px solid #e2e8f0',
    background: '#ffffff',
    fontSize: '0.9rem',
    color: '#1e293b',
    cursor: 'pointer',
  },
  viewToggle: {
    display: 'flex',
    borderRadius: 10,
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
  },
  toggleBtn: {
    padding: '8px 16px',
    border: 'none',
    background: '#ffffff',
    fontSize: '0.85rem',
    cursor: 'pointer',
    color: '#64748b',
    fontWeight: 500,
  },
  toggleActive: {
    background: '#1e293b',
    color: '#ffffff',
    fontWeight: 700,
  },
  searchWrap: {
    maxWidth: 1100,
    margin: '0 auto 16px',
    padding: '0 20px',
  },
  searchInput: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid #e2e8f0',
    background: '#ffffff',
    fontSize: '0.95rem',
    color: '#1e293b',
    boxSizing: 'border-box',
  },
  tableWrap: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '0 20px',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    border: '1px solid #e2e8f0',
  },
  th: {
    padding: '12px 16px',
    background: '#f8fafc',
    fontWeight: 700,
    fontSize: '0.82rem',
    color: '#64748b',
    textAlign: 'right',
    borderBottom: '1px solid #e2e8f0',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '10px 16px',
    fontSize: '0.88rem',
    color: '#1e293b',
    borderBottom: '1px solid #f1f5f9',
    verticalAlign: 'middle',
  },
  rowEven: { background: '#ffffff' },
  rowOdd: { background: '#f8fafc' },
  countCell: {
    fontWeight: 800,
    fontSize: '1rem',
    color: '#3b82f6',
  },
  rolesList: {
    display: 'flex',
    gap: 4,
    flexWrap: 'wrap',
  },
  roleBadge: {
    padding: '2px 8px',
    borderRadius: 6,
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  empty: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#64748b',
    fontSize: '1rem',
  },
}
