'use client'

import { useState, useEffect } from 'react'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { AdminShell } from '@/components/admin/AdminShell'

interface Kpis {
  stations_active: number
  borrows_total: number
  borrows_active: number
  wheels_total: number
  wheels_available: number
  wheels_unavailable: number
  wheels_borrowed: number
  users_active: number
  logins_period: number
}

interface MonthBorrows { month: string; borrows: number; returned: number }
interface StationStat  { name: string; count: number }
interface WheelStation { name: string; total: number; available: number; borrowed: number; unavailable: number; deleted: number }
interface AuditItem    { action: string; count: number }
interface LoginUser    { full_name: string; phone: string | null; roles: string[]; count: number }
interface DayLogin     { date: string; count: number }
interface DepositType  { type: string; count: number }

interface LoginEntry {
  id: string
  user_id: string | null
  full_name: string
  phone: string | null
  role: string
  roleLabel: string
  ip: string | null
  created_at: string
}

interface LoginSummaryRow {
  full_name: string
  phone: string | null
  roles: string[]
  count: number
  last_login: string
}

interface AnalyticsData {
  kpis: Kpis
  borrowsByMonth: MonthBorrows[]
  topStations: StationStat[]
  wheelsByStation: WheelStation[]
  auditBreakdown: AuditItem[]
  avgDuration: number
  topLoginUsers: LoginUser[]
  loginsByDay: DayLogin[]
  depositTypes: DepositType[]
  loginSummary: LoginSummaryRow[]
  loginLog: LoginEntry[]
}

const AUDIT_COLORS: Record<string, string> = {
  'גלגל נוצר': '#22c55e', 'גלגל עודכן': '#3b82f6', 'גלגל נמחק': '#ef4444',
  'גלגל שוחזר': '#f59e0b', 'השאלה נפתחה': '#8b5cf6', 'גלגל הוחזר': '#14b8a6',
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 10, background: '#f1f5f9', borderRadius: 5, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 5, transition: 'width 0.5s' }} />
      </div>
      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', minWidth: 24, textAlign: 'left' }}>{value}</span>
    </div>
  )
}

function MiniBarChart({ data, valueKey, labelKey, color, everyNthLabel = 1 }: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[]
  valueKey: string
  labelKey: string
  color: string
  everyNthLabel?: number
}) {
  const max = Math.max(...data.map((d: Record<string, number>) => d[valueKey]), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80, direction: 'ltr' }}>
      {data.map((d: Record<string, number | string>, i: number) => {
        const val = d[valueKey] as number
        const pct = (val / max) * 100
        const showLabel = i % everyNthLabel === 0 || i === data.length - 1
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <div style={{ width: '100%', height: 60, display: 'flex', alignItems: 'flex-end' }}>
              <div
                title={`${d[labelKey]}: ${val}`}
                style={{
                  width: '100%', background: val > 0 ? color : '#e2e8f0',
                  height: `${Math.max(pct, val > 0 ? 5 : 0)}%`,
                  borderRadius: '3px 3px 0 0', transition: 'height 0.4s',
                }}
              />
            </div>
            {showLabel && <span style={{ fontSize: '0.55rem', color: '#94a3b8', textAlign: 'center', lineHeight: 1.1 }}>{d[labelKey] as string}</span>}
          </div>
        )
      })}
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={s.section}>
      <div style={s.sectionHeader}>
        <div style={s.sectionIcon}>{icon}</div>
        <span style={s.sectionTitle}>{title}</span>
      </div>
      <div style={s.sectionBody}>{children}</div>
    </div>
  )
}

export default function AnalyticsPage() {
  const { isAuthenticated, isLoading: authLoading, logout } = useAdminAuth()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(90)
  const [loginView, setLoginView] = useState<'summary' | 'log'>('summary')
  const [loginSearch, setLoginSearch] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true)
      fetch(`/api/admin/analytics?days=${days}`)
        .then(r => r.json())
        .then(d => { setData(d); setLoading(false) })
        .catch(() => setLoading(false))
    }
  }, [isAuthenticated, days])

  if (authLoading || !isAuthenticated) {
    return <div style={s.loadingPage}><p>טוען...</p></div>
  }

  const kpis = data?.kpis

  return (
    <AdminShell onLogout={logout}>
      <div style={s.page}>
        {/* Header */}
        <div style={s.pageHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={s.headerIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
            </div>
            <div>
              <h1 style={s.pageTitle}>סטטיסטיקות ודוחות</h1>
              <p style={s.pageSubtitle}>מבט מקיף על פעילות המערכת</p>
            </div>
          </div>
          <select value={days} onChange={e => setDays(Number(e.target.value))} style={s.select}>
            <option value={30}>30 יום</option>
            <option value={90}>90 יום</option>
            <option value={180}>180 יום</option>
            <option value={365}>שנה</option>
          </select>
        </div>

        {loading ? (
          <div style={s.loadingInner}>טוען נתונים...</div>
        ) : !data ? (
          <div style={s.loadingInner}>שגיאה בטעינת נתונים</div>
        ) : (
          <div style={s.content}>

            {/* KPI Row */}
            <div style={s.kpiGrid}>
              {[
                { label: 'תחנות פעילות',    value: kpis?.stations_active,   color: '#22c55e', icon: '🏠' },
                { label: 'גלגלים במלאי',    value: kpis?.wheels_total,      color: '#3b82f6', icon: '🔵' },
                { label: 'גלגלים זמינים',   value: kpis?.wheels_available,  color: '#22c55e', icon: '✅' },
                { label: 'גלגלים מושאלים',  value: kpis?.wheels_borrowed,   color: '#f59e0b', icon: '📤' },
                { label: 'בלתי זמינים',     value: kpis?.wheels_unavailable, color: '#ef4444', icon: '🚫' },
                { label: `השאלות (${days}י)`, value: kpis?.borrows_total,  color: '#8b5cf6', icon: '📋' },
                { label: 'השאלות פתוחות',   value: kpis?.borrows_active,    color: '#f59e0b', icon: '⏳' },
                { label: 'משתמשים פעילים',  value: kpis?.users_active,      color: '#14b8a6', icon: '👥' },
                { label: `כניסות (${days}י)`, value: kpis?.logins_period,  color: '#ec4899', icon: '🔐' },
              ].map(({ label, value, color, icon }) => (
                <div key={label} style={s.kpiCard}>
                  <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>{icon}</div>
                  <div style={{ ...s.kpiValue, color }}>{value ?? '—'}</div>
                  <div style={s.kpiLabel}>{label}</div>
                </div>
              ))}
            </div>

            {/* Row: Borrows by Month + Logins by Day */}
            <div style={s.twoCol}>
              <Section title={`השאלות לפי חודש (12 חודשים אחרונים)`} icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
              }>
                <MiniBarChart data={data.borrowsByMonth} valueKey="borrows" labelKey="month" color="#8b5cf6" />
                <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
                  {data.borrowsByMonth.slice(-3).map(m => (
                    <div key={m.month} style={s.monthPill}>
                      <span style={{ fontWeight: 700, color: '#1e293b' }}>{m.month}</span>
                      <span style={{ color: '#8b5cf6' }}> {m.borrows} השאלות</span>
                      {m.returned > 0 && <span style={{ color: '#22c55e' }}> · {m.returned} הוחזרו</span>}
                    </div>
                  ))}
                </div>
                {data.avgDuration > 0 && (
                  <div style={{ marginTop: 12, padding: '8px 12px', background: '#f8fafc', borderRadius: 8, fontSize: '0.82rem', color: '#64748b' }}>
                    משך השאלה ממוצע: <strong style={{ color: '#8b5cf6' }}>{data.avgDuration} ימים</strong>
                  </div>
                )}
              </Section>

              <Section title="כניסות למערכת (30 ימים אחרונים)" icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              }>
                <MiniBarChart
                  data={data.loginsByDay.map((d: DayLogin) => ({
                    ...d,
                    label: (() => { const dt = new Date(d.date + 'T12:00:00'); return `${dt.getDate()}/${dt.getMonth()+1}` })(),
                  }))}
                  valueKey="count"
                  labelKey="label"
                  color="#ec4899"
                  everyNthLabel={5}
                />
                <div style={{ marginTop: 10, fontSize: '0.82rem', color: '#64748b' }}>
                  סה״כ <strong style={{ color: '#ec4899' }}>{data.loginsByDay.reduce((s, d) => s + d.count, 0)}</strong> כניסות ב-30 ימים אחרונים
                </div>
              </Section>
            </div>

            {/* Row: Top Stations + Audit Breakdown */}
            <div style={s.twoCol}>
              <Section title={`תחנות מובילות בהשאלות (${days} ימים)`} icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
              }>
                {data.topStations.length === 0 ? (
                  <p style={s.empty}>אין נתונים לתקופה זו</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {data.topStations.map((st, i) => (
                      <div key={st.name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>
                            {i + 1}. {st.name}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{st.count} השאלות</span>
                        </div>
                        <Bar value={st.count} max={data.topStations[0].count} color="#8b5cf6" />
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              <Section title={`פעולות במערכת (${days} ימים)`} icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
              }>
                {data.auditBreakdown.length === 0 ? (
                  <p style={s.empty}>אין נתונים לתקופה זו</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {data.auditBreakdown.map(a => (
                      <div key={a.action}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: AUDIT_COLORS[a.action] || '#64748b' }}>{a.action}</span>
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{a.count}</span>
                        </div>
                        <Bar value={a.count} max={data.auditBreakdown[0].count} color={AUDIT_COLORS[a.action] || '#64748b'} />
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            </div>

            {/* Wheels by Station table */}
            <Section title="גלגלים לפי תחנה" icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
            }>
              {data.wheelsByStation.length === 0 ? (
                <p style={s.empty}>אין נתונים</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={s.table}>
                    <thead>
                      <tr>
                        {['תחנה', 'סה״כ', 'זמינים', 'מושאלים', 'בלתי זמין', 'נמחקו'].map(h => (
                          <th key={h} style={s.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.wheelsByStation.map((st, i) => (
                        <tr key={st.name} style={{ background: i % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                          <td style={s.td}><strong>{st.name}</strong></td>
                          <td style={{ ...s.tdNum, color: '#1e293b' }}>{st.total}</td>
                          <td style={{ ...s.tdNum, color: '#22c55e' }}>{st.available}</td>
                          <td style={{ ...s.tdNum, color: '#f59e0b' }}>{st.borrowed || '—'}</td>
                          <td style={{ ...s.tdNum, color: '#ef4444' }}>{st.unavailable || '—'}</td>
                          <td style={{ ...s.tdNum, color: '#94a3b8' }}>{st.deleted || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>

            {/* Row: Top Logins + Deposit Types */}
            <div style={s.twoCol}>
              <Section title={`משתמשים פעילים (${days} ימים)`} icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              }>
                {data.topLoginUsers.length === 0 ? (
                  <p style={s.empty}>אין כניסות מתועדות לתקופה זו</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {data.topLoginUsers.map((u, i) => (
                      <div key={i} style={s.userRow}>
                        <div style={{ ...s.userRank, background: i === 0 ? '#fef3c7' : '#f1f5f9', color: i === 0 ? '#d97706' : '#64748b' }}>
                          {i + 1}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b' }}>{u.full_name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{u.phone || ''} · {u.roles.join(', ')}</div>
                        </div>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#ec4899', minWidth: 28, textAlign: 'center' }}>
                          {u.count}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              <Section title={`סוגי פיקדון בהשאלות (${days} ימים)`} icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              }>
                {data.depositTypes.length === 0 ? (
                  <p style={s.empty}>אין נתונים לתקופה זו</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {data.depositTypes.map(d => (
                      <div key={d.type}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>{d.type}</span>
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{d.count}</span>
                        </div>
                        <Bar value={d.count} max={data.depositTypes[0].count} color="#14b8a6" />
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            </div>

            {/* Login Report Section */}
            {(() => {
              const q = loginSearch.trim()
              const filteredSummary = q
                ? (data.loginSummary || []).filter(u =>
                    u.full_name.includes(q) || u.phone?.includes(q) || u.roles.some(r => r.includes(q))
                  )
                : (data.loginSummary || [])
              const filteredLog = q
                ? (data.loginLog || []).filter(l =>
                    l.full_name.includes(q) || l.phone?.includes(q) || l.roleLabel.includes(q)
                  )
                : (data.loginLog || [])

              return (
                <Section
                  title={`כניסות מנהלים למערכת — ${days} ימים אחרונים`}
                  icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
                    </svg>
                  }
                >
                  <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                    <input
                      value={loginSearch}
                      onChange={e => setLoginSearch(e.target.value)}
                      placeholder="חפש לפי שם, טלפון, תפקיד..."
                      style={{ ...s.select, flex: 1, minWidth: 180, padding: '8px 12px' }}
                    />
                    <div style={s.viewToggle}>
                      <button style={{ ...s.toggleBtn, ...(loginView === 'summary' ? s.toggleActive : {}) }} onClick={() => setLoginView('summary')}>
                        סיכום ({filteredSummary.length})
                      </button>
                      <button style={{ ...s.toggleBtn, ...(loginView === 'log' ? s.toggleActive : {}) }} onClick={() => setLoginView('log')}>
                        יומן מלא ({filteredLog.length})
                      </button>
                    </div>
                  </div>

                  {loginView === 'summary' ? (
                    filteredSummary.length === 0 ? <p style={s.empty}>אין נתונים</p> : (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={s.table}>
                          <thead>
                            <tr>{['שם', 'טלפון', 'תפקיד', 'כניסות', 'כניסה אחרונה'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
                          </thead>
                          <tbody>
                            {filteredSummary.map((u, i) => (
                              <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                                <td style={s.td}><strong>{u.full_name}</strong></td>
                                <td style={s.td}>{u.phone || '—'}</td>
                                <td style={s.td}>
                                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                    {u.roles.map(r => (
                                      <span key={r} style={{ padding: '2px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600, background: '#f1f5f9', color: '#475569' }}>{r}</span>
                                    ))}
                                  </div>
                                </td>
                                <td style={{ ...s.tdNum, color: '#ec4899' }}>{u.count}</td>
                                <td style={s.td}>{new Date(u.last_login).toLocaleDateString('he-IL')} {new Date(u.last_login).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  ) : (
                    filteredLog.length === 0 ? <p style={s.empty}>אין נתונים</p> : (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={s.table}>
                          <thead>
                            <tr>{['תאריך ושעה', 'שם', 'טלפון', 'תפקיד'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
                          </thead>
                          <tbody>
                            {filteredLog.map((l, i) => (
                              <tr key={l.id} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                                <td style={s.td}>
                                  {new Date(l.created_at).toLocaleDateString('he-IL')} {new Date(l.created_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td style={s.td}><strong>{l.full_name}</strong></td>
                                <td style={s.td}>{l.phone || '—'}</td>
                                <td style={s.td}>
                                  <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600, background: '#fdf2f8', color: '#ec4899' }}>
                                    {l.roleLabel}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  )}
                </Section>
              )
            })()}

          </div>
        )}
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
  loadingInner: {
    textAlign: 'center', padding: '80px 20px', color: '#64748b', fontSize: '1rem',
  },
  pageHeader: {
    maxWidth: 1200, margin: '0 auto', padding: '20px 20px 16px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
  },
  headerIcon: {
    width: 46, height: 46, borderRadius: 12, flexShrink: 0,
    background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  pageTitle: { margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#1e293b' },
  pageSubtitle: { margin: 0, fontSize: '0.85rem', color: '#64748b' },
  select: {
    padding: '8px 14px', borderRadius: 10, border: '1px solid #e2e8f0',
    background: '#ffffff', fontSize: '0.9rem', color: '#1e293b', cursor: 'pointer',
  },
  viewToggle: {
    display: 'flex', borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e8f0',
  },
  toggleBtn: {
    padding: '8px 14px', border: 'none', background: '#ffffff',
    fontSize: '0.82rem', cursor: 'pointer', color: '#64748b', fontWeight: 500,
  },
  toggleActive: {
    background: '#1e293b', color: '#ffffff', fontWeight: 700,
  },
  content: { maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 20 },

  kpiGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12,
  },
  kpiCard: {
    background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14,
    padding: '14px 12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  kpiValue: { fontSize: '1.8rem', fontWeight: 800, lineHeight: 1 },
  kpiLabel: { fontSize: '0.72rem', color: '#64748b', marginTop: 4, lineHeight: 1.3 },

  twoCol: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20,
  },

  section: {
    background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 18,
    overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  sectionHeader: {
    padding: '14px 20px', borderBottom: '1px solid #f1f5f9',
    background: '#f8fafc', display: 'flex', alignItems: 'center', gap: 10,
  },
  sectionIcon: {
    width: 30, height: 30, borderRadius: 8, background: '#1e293b',
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0,
  },
  sectionTitle: { fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' },
  sectionBody: { padding: '16px 20px' },

  monthPill: {
    fontSize: '0.78rem', background: '#f8fafc', padding: '4px 10px',
    borderRadius: 8, border: '1px solid #e2e8f0',
  },

  table: {
    width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem',
  },
  th: {
    padding: '10px 14px', background: '#f8fafc', fontWeight: 700,
    fontSize: '0.78rem', color: '#64748b', textAlign: 'right',
    borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap',
  },
  td: {
    padding: '9px 14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle',
  },
  tdNum: {
    padding: '9px 14px', fontWeight: 700, textAlign: 'center',
    borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle',
  },

  userRow: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '8px 10px', borderRadius: 10, background: '#f8fafc', border: '1px solid #f1f5f9',
  },
  userRank: {
    width: 26, height: 26, borderRadius: '50%', display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0,
  },

  empty: { color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0', margin: 0 },
}
