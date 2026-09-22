'use client'

/**
 * Wheel search demand report — shared by the station manager's reports tab (fixed
 * stationId) and the admin analytics page (stationId optional = whole network).
 * Data: /api/reports/search-demand. Splits "not found" into "no such wheel at all"
 * (a real inventory gap) vs "exists but not available" (borrowed / unavailable).
 */

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { DateRange, rangeLabel } from './DateRangeFilter'
import ExportButton from './ExportButton'
import { exportStyledExcel, formatDateForFile } from '@/lib/excel-export'

type Status = 'available' | 'unavailable' | 'none'

interface Counts { total: number; available: number; unavailable: number; none: number }
interface Top { label: string; count: number }
interface Case {
  id: string
  created_at: string
  status: Status
  source: 'operator' | 'manager'
  search_type: string
  searched_by: string | null
  plate: string | null
  vehicle: string
  spec: string
  center_bore: number | null
  rim_size: string | null
  available_at: string[]
}
interface HistoryItem {
  plate: string
  vehicle: string
  spec: string
  center_bore: number | null
  searched_at: string
  searched_by: string | null
  status: Status
}
interface ReportData {
  logAvailable: boolean
  counts: Counts
  topMissingSpecs: Top[]
  topMissingVehicles: Top[]
  topUnavailableSpecs: Top[]
  cases: Case[]
  perStation: { station_id: string; name: string; available: number; unavailable: number; none: number }[]
  history: { counts: Counts; topMissingSpecs: Top[]; items: HistoryItem[] }
}

const STATUS_LABEL: Record<Status, string> = { available: 'נמצא זמין', unavailable: 'קיים – לא זמין', none: 'אין בכלל' }
const STATUS_COLOR: Record<Status, string> = { available: '#16a34a', unavailable: '#d97706', none: '#dc2626' }
const SOURCE_LABEL = { operator: 'מוקדן', manager: 'מנהל תחנה' }
const TYPE_LABEL: Record<string, string> = { plate: 'לוחית', model: 'דגם', spec: 'מידות' }

const fmtDate = (iso: string) => {
  const d = new Date(iso)
  return `${d.toLocaleDateString('he-IL')} ${d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}`
}

export default function SearchDemandReport({ stationId, stationName, range }: {
  stationId?: string | null
  stationName?: string
  range: DateRange
}) {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [caseFilter, setCaseFilter] = useState<'all' | 'none' | 'unavailable'>('none')
  const [showAll, setShowAll] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    const p = new URLSearchParams()
    if (stationId) p.set('station_id', stationId)
    if (range.from) p.set('from', range.from)
    if (range.to) p.set('to', range.to)
    fetch(`/api/reports/search-demand?${p}`)
      .then(async r => {
        const d = await r.json()
        if (!r.ok) throw new Error(d.error || 'שגיאה')
        return d
      })
      .then(d => { if (!cancelled) setData(d) })
      .catch(e => { if (!cancelled) setError(e.message || 'שגיאה בטעינת הדוח') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [stationId, range.from, range.to])

  const scopeName = stationId ? (stationName || 'התחנה') : 'כל התחנות'

  const handleExport = () => {
    if (!data) return
    const title = `חיפושי גלגלים · ${scopeName} · ${rangeLabel(range)}`
    const ok = exportStyledExcel(`search_demand_${formatDateForFile()}`, [
      {
        name: 'סיכום',
        title,
        rows: [
          { 'מדד': 'סה״כ בדיקות', 'כמות': data.counts.total },
          { 'מדד': 'נמצא גלגל זמין', 'כמות': data.counts.available },
          { 'מדד': 'קיים אך לא זמין (מושאל / מושבת)', 'כמות': data.counts.unavailable },
          { 'מדד': 'אין גלגל כזה בכלל (חוסר במלאי)', 'כמות': data.counts.none },
        ],
      },
      {
        name: 'הכי חסר – מידות',
        title: `מידות שחסרות במלאי · ${scopeName}`,
        color: 'DC2626',
        rows: data.topMissingSpecs.map(t => ({ 'מידות (ברגים x מרווח)': t.label, 'פעמים שלא נמצא': t.count })),
      },
      {
        name: 'הכי חסר – רכבים',
        title: `רכבים שלא נמצא להם גלגל · ${scopeName}`,
        color: 'DC2626',
        rows: data.topMissingVehicles.map(t => ({ 'רכב': t.label, 'פעמים שלא נמצא': t.count })),
      },
      {
        name: 'קיים אך לא זמין',
        title: `מידות שקיימות אך לא היו זמינות · ${scopeName}`,
        color: 'D97706',
        rows: data.topUnavailableSpecs.map(t => ({ 'מידות': t.label, 'פעמים': t.count })),
      },
      {
        name: 'מקרים שלא נמצאו',
        title,
        rows: data.cases.map(c => ({
          'תאריך': fmtDate(c.created_at),
          'תוצאה': STATUS_LABEL[c.status],
          'רכב': c.vehicle,
          'לוחית': c.plate || '',
          'מידות': c.spec,
          'CB': c.center_bore ?? '',
          'קוטר': c.rim_size || '',
          'סוג חיפוש': TYPE_LABEL[c.search_type] || c.search_type,
          'חיפש': `${c.searched_by || ''} (${SOURCE_LABEL[c.source]})`,
          ...(stationId ? { 'זמין בתחנות אחרות': c.available_at.join(', ') } : {}),
        })),
      },
      ...(!stationId ? [{
        name: 'לפי תחנה',
        title: `פילוח לפי תחנה · ${rangeLabel(range)}`,
        rows: data.perStation.map(s => ({
          'תחנה': s.name, 'נמצא זמין': s.available, 'קיים – לא זמין': s.unavailable, 'אין בכלל': s.none,
        })),
      }] : []),
      {
        name: 'חיפושי עבר מול מלאי',
        title: `חיפושי לוחית קודמים מול המלאי של היום · ${scopeName}`,
        color: '7C3AED',
        rows: data.history.items.map(h => ({
          'תאריך חיפוש אחרון': fmtDate(h.searched_at),
          'רכב': h.vehicle,
          'לוחית': h.plate,
          'מידות': h.spec,
          'CB': h.center_bore ?? '',
          'מצב היום': STATUS_LABEL[h.status],
          'חיפש': h.searched_by || '',
        })),
      },
    ])
    if (ok) toast.success('הקובץ הורד בהצלחה')
    else toast.error('אין נתונים לייצוא')
  }

  if (loading) return <div style={st.card}><p style={st.muted}>טוען דוח חיפושים...</p></div>
  if (error || !data) return <div style={st.card}><p style={st.muted}>{error || 'שגיאה בטעינת הדוח'}</p></div>

  const pct = (n: number) => (data.counts.total ? Math.round((n / data.counts.total) * 100) : 0)
  const filteredCases = data.cases.filter(c => caseFilter === 'all' || c.status === caseFilter)
  const visibleCases = showAll ? filteredCases : filteredCases.slice(0, 15)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {!data.logAvailable && (
        <div style={{ ...st.card, background: '#fffbeb', borderColor: '#fcd34d', color: '#92400e', fontSize: '0.85rem' }}>
          תיעוד החיפושים עדיין לא הופעל (חסרה טבלת wheel_search_log). בינתיים מוצג רק ניתוח חיפושי העבר.
        </div>
      )}

      {/* KPI tiles */}
      <div style={st.tiles}>
        {([
          { label: 'בדיקות', value: data.counts.total, color: '#2563eb', sub: '' },
          { label: 'נמצא זמין', value: data.counts.available, color: STATUS_COLOR.available, sub: `${pct(data.counts.available)}%` },
          { label: 'קיים – לא זמין', value: data.counts.unavailable, color: STATUS_COLOR.unavailable, sub: `${pct(data.counts.unavailable)}%` },
          { label: 'אין בכלל', value: data.counts.none, color: STATUS_COLOR.none, sub: `${pct(data.counts.none)}%` },
        ]).map(t => (
          <div key={t.label} style={st.tile}>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: t.color, lineHeight: 1 }}>{t.value}</div>
            <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: 6 }}>{t.label}</div>
            {t.sub && <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{t.sub}</div>}
          </div>
        ))}
      </div>

      {/* Top missing */}
      <div style={st.twoCol}>
        <TopList title="הכי חסר במלאי – מידות" hint="חיפושים שלא היה להם גלגל בכלל" items={data.topMissingSpecs} color={STATUS_COLOR.none} ltr />
        <TopList title="הכי חסר – רכבים" hint="רכבים שלא נמצא להם גלגל בכלל" items={data.topMissingVehicles} color={STATUS_COLOR.none} />
        <TopList title="קיים אך לא היה זמין" hint="יש במלאי, אבל היה מושאל / מושבת" items={data.topUnavailableSpecs} color={STATUS_COLOR.unavailable} ltr />
      </div>

      {/* Per-station (network view only) */}
      {!stationId && data.perStation.length > 0 && (
        <div style={st.card}>
          <h4 style={st.h4}>פילוח לפי תחנה</h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={st.table}>
              <thead><tr>{['תחנה', 'נמצא זמין', 'קיים – לא זמין', 'אין בכלל'].map(h => <th key={h} style={st.th}>{h}</th>)}</tr></thead>
              <tbody>
                {data.perStation.map((s, i) => (
                  <tr key={s.station_id} style={{ background: i % 2 ? '#f8fafc' : '#fff' }}>
                    <td style={st.td}><strong>{s.name}</strong></td>
                    <td style={{ ...st.td, color: STATUS_COLOR.available, fontWeight: 700 }}>{s.available}</td>
                    <td style={{ ...st.td, color: STATUS_COLOR.unavailable, fontWeight: 700 }}>{s.unavailable}</td>
                    <td style={{ ...st.td, color: STATUS_COLOR.none, fontWeight: 700 }}>{s.none}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cases */}
      <div style={st.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          <h4 style={{ ...st.h4, margin: 0 }}>מקרים שלא נמצא גלגל זמין</h4>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {([['none', 'אין בכלל'], ['unavailable', 'לא זמין'], ['all', 'הכל']] as const).map(([k, l]) => (
              <button key={k} type="button" onClick={() => setCaseFilter(k)} style={{ ...st.chip, ...(caseFilter === k ? st.chipOn : {}) }}>{l}</button>
            ))}
          </div>
        </div>
        {filteredCases.length === 0 ? (
          <p style={st.muted}>אין מקרים בתקופה זו</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {visibleCases.map(c => (
              <div key={c.id} style={st.caseRow}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <strong style={{ color: '#1e293b', fontSize: '0.9rem' }}>{c.vehicle}</strong>
                  <span style={{ ...st.badge, color: STATUS_COLOR[c.status], borderColor: STATUS_COLOR[c.status] }}>{STATUS_LABEL[c.status]}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
                  <span dir="ltr">{c.spec}{c.center_bore ? ` · CB ${c.center_bore}` : ''}{c.rim_size ? ` · R${c.rim_size}` : ''}</span>
                  <span>{fmtDate(c.created_at)}</span>
                  <span>{c.searched_by || SOURCE_LABEL[c.source]}</span>
                </div>
                {stationId && c.available_at.length > 0 && (
                  <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: 3 }}>זמין בתחנות אחרות: {c.available_at.join(', ')}</div>
                )}
              </div>
            ))}
            {filteredCases.length > 15 && (
              <button type="button" onClick={() => setShowAll(v => !v)} style={st.linkBtn}>
                {showAll ? 'הצג פחות' : `הצג את כל ${filteredCases.length} המקרים`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* History vs today's inventory */}
      <div style={{ ...st.card, borderColor: '#ddd6fe' }}>
        <h4 style={st.h4}>חיפושי עבר מול המלאי של היום</h4>
        <p style={{ ...st.muted, textAlign: 'right', padding: 0, margin: '0 0 10px' }}>
          רכבים שחיפשו לפי לוחית בעבר ({data.history.counts.total}) – בבדיקה מול המלאי הנוכחי. מראה חוסרים, לא מה שהיה זמין בזמן החיפוש.
        </p>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: '0.85rem', marginBottom: 10 }}>
          <span style={{ color: STATUS_COLOR.none, fontWeight: 700 }}>אין בכלל: {data.history.counts.none}</span>
          <span style={{ color: STATUS_COLOR.unavailable, fontWeight: 700 }}>קיים – לא זמין עכשיו: {data.history.counts.unavailable}</span>
          <span style={{ color: STATUS_COLOR.available, fontWeight: 700 }}>יש זמין: {data.history.counts.available}</span>
        </div>
        {data.history.topMissingSpecs.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {data.history.topMissingSpecs.map(t => (
              <span key={t.label} dir="ltr" style={{ ...st.badge, color: STATUS_COLOR.none, borderColor: '#fecaca', background: '#fef2f2' }}>{t.label} · {t.count}</span>
            ))}
          </div>
        )}
        {data.history.items.length > 0 && (
          <>
            <button type="button" onClick={() => setShowHistory(v => !v)} style={st.linkBtn}>
              {showHistory ? 'הסתר רשימה' : `הצג ${data.history.items.length} רכבים ללא גלגל זמין`}
            </button>
            {showHistory && (
              <div style={{ overflowX: 'auto', marginTop: 8 }}>
                <table style={st.table}>
                  <thead><tr>{['רכב', 'מידות', 'מצב היום', 'חיפוש אחרון'].map(h => <th key={h} style={st.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {data.history.items.map((h, i) => (
                      <tr key={h.plate} style={{ background: i % 2 ? '#f8fafc' : '#fff' }}>
                        <td style={st.td}>{h.vehicle}</td>
                        <td style={st.td} dir="ltr">{h.spec}</td>
                        <td style={{ ...st.td, color: STATUS_COLOR[h.status], fontWeight: 600 }}>{STATUS_LABEL[h.status]}</td>
                        <td style={st.td}>{new Date(h.searched_at).toLocaleDateString('he-IL')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      <div><ExportButton onClick={handleExport} label="ייצוא דוח חיפושים לאקסל" /></div>
    </div>
  )
}

function TopList({ title, hint, items, color, ltr }: { title: string; hint: string; items: Top[]; color: string; ltr?: boolean }) {
  const max = items[0]?.count || 1
  return (
    <div style={st.card}>
      <h4 style={{ ...st.h4, marginBottom: 2 }}>{title}</h4>
      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 10 }}>{hint}</div>
      {items.length === 0 ? <p style={st.muted}>אין נתונים</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.slice(0, 6).map(t => (
            <div key={t.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 3, gap: 8 }}>
                <span dir={ltr ? 'ltr' : undefined} style={{ color: '#1e293b', fontWeight: 600, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.label}</span>
                <span style={{ color: '#64748b', flexShrink: 0 }}>{t.count}</span>
              </div>
              <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${(t.count / max) * 100}%`, height: '100%', background: color, borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const st: Record<string, React.CSSProperties> = {
  card: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 14, minWidth: 0 },
  tiles: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 },
  tile: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 10px', textAlign: 'center' },
  twoCol: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 },
  h4: { margin: '0 0 10px', fontSize: '0.92rem', fontWeight: 700, color: '#1e293b' },
  muted: { color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', padding: '10px 0', margin: 0 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' },
  th: { padding: '8px 10px', background: '#f8fafc', color: '#64748b', fontWeight: 700, textAlign: 'right', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' },
  td: { padding: '8px 10px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' },
  chip: { padding: '4px 10px', borderRadius: 999, border: '1px solid #cbd5e1', background: '#fff', color: '#334155', fontSize: '0.75rem', cursor: 'pointer' },
  chipOn: { background: '#1e293b', color: '#fff', borderColor: '#1e293b', fontWeight: 700 },
  caseRow: { border: '1px solid #f1f5f9', background: '#f8fafc', borderRadius: 10, padding: '10px 12px' },
  badge: { fontSize: '0.72rem', fontWeight: 700, border: '1px solid', borderRadius: 999, padding: '2px 8px', whiteSpace: 'nowrap' },
  linkBtn: { background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, padding: '4px 0', alignSelf: 'flex-start' },
}
