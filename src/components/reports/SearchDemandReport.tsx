'use client'

/**
 * Wheel search demand report — shared by the station manager's reports tab (fixed
 * stationId) and the admin analytics page (stationId optional = whole network).
 * Data: /api/reports/search-demand. Splits "not found" into "no such wheel at all"
 * (a real inventory gap) vs "exists but not available" (borrowed / unavailable).
 * Export is not done here — the parent screen's single ExportDialog uses
 * searchDemandExportOptions() with the data this component reports via onData.
 */

import { useEffect, useState } from 'react'
import { DateRange, rangeLabel } from './DateRangeFilter'
import { ExportOption } from './ExportDialog'

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
export interface SearchDemandData {
  logAvailable: boolean
  counts: Counts
  topMissingSpecs: Top[]
  topMissingVehicles: Top[]
  topUnavailableSpecs: Top[]
  cases: Case[]
  perStation: { station_id: string; name: string; available: number; unavailable: number; none: number }[]
  history: { counts: Counts; topMissingSpecs: Top[]; items: HistoryItem[] }
}

const STATUS_LABEL: Record<Status, string> = { available: 'נמצא זמין', unavailable: 'היה מושאל / לא זמין', none: 'חסר במלאי' }
const STATUS_COLOR: Record<Status, string> = { available: '#16a34a', unavailable: '#d97706', none: '#dc2626' }
const SOURCE_LABEL = { operator: 'מוקדן', manager: 'מנהל תחנה' }
const TYPE_LABEL: Record<string, string> = { plate: 'לוחית', model: 'דגם', spec: 'מידות' }

const fmtDate = (iso: string) => {
  const d = new Date(iso)
  return `${d.toLocaleDateString('he-IL')} ${d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}`
}

/** Export datasets for the parent's ExportDialog */
export function searchDemandExportOptions(
  data: SearchDemandData | null,
  opts: { stationId?: string | null; scopeName: string; range: DateRange }
): ExportOption[] {
  const { stationId, scopeName, range } = opts
  const period = rangeLabel(range)
  const ready = <T,>(fn: (d: SearchDemandData) => T) => (data ? () => fn(data) : null)
  return [
    {
      key: 'search_summary',
      label: 'חיפושי גלגלים – סיכום',
      hint: 'כמות בדיקות, נמצא / היה מושאל / חסר במלאי',
      build: ready(d => [{
        name: 'חיפושים – סיכום',
        title: `חיפושי גלגלים · ${scopeName} · ${period}`,
        rows: [
          { 'מדד': 'סה״כ בדיקות', 'כמות': d.counts.total },
          { 'מדד': 'נמצא גלגל זמין', 'כמות': d.counts.available },
          { 'מדד': 'היה מושאל / לא זמין', 'כמות': d.counts.unavailable },
          { 'מדד': 'חסר במלאי (אין גלגל כזה)', 'כמות': d.counts.none },
        ],
      }, ...(!stationId ? [{
        name: 'חיפושים לפי תחנה',
        title: `חיפושים – פילוח לפי תחנה · ${period}`,
        rows: d.perStation.map(s => ({ 'תחנה': s.name, 'נמצא זמין': s.available, 'היה מושאל': s.unavailable, 'חסר במלאי': s.none })),
      }] : [])]),
    },
    {
      key: 'search_missing',
      label: 'הכי חסר במלאי',
      hint: 'מידות ורכבים שהכי הרבה פעמים לא היה להם גלגל',
      build: ready(d => [
        { name: 'חסר – מידות', title: `מידות חסרות · ${scopeName} · ${period}`, color: 'DC2626',
          rows: d.topMissingSpecs.map(t => ({ 'מידות (ברגים x מרווח)': t.label, 'פעמים שחיפשו ולא היה': t.count })) },
        { name: 'חסר – רכבים', title: `רכבים ללא גלגל · ${scopeName} · ${period}`, color: 'DC2626',
          rows: d.topMissingVehicles.map(t => ({ 'רכב': t.label, 'פעמים שחיפשו ולא היה': t.count })) },
        { name: 'היה מושאל – מידות', title: `מידות שהיו מושאלות · ${scopeName} · ${period}`, color: 'D97706',
          rows: d.topUnavailableSpecs.map(t => ({ 'מידות': t.label, 'פעמים': t.count })) },
      ]),
    },
    {
      key: 'search_cases',
      label: 'רשימת חיפושים שלא נמצא גלגל',
      hint: 'כל מקרה: תאריך, רכב, מידות, מי חיפש',
      build: ready(d => [{
        name: 'חיפושים שלא נמצאו',
        title: `חיפושים שלא נמצא גלגל זמין · ${scopeName} · ${period}`,
        rows: d.cases.map(c => ({
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
      }]),
    },
    {
      key: 'search_history',
      label: 'חיפושי עבר מול המלאי של היום',
      hint: 'רכבים שחיפשו בעבר ואין להם היום גלגל זמין',
      build: ready(d => [{
        name: 'חיפושי עבר',
        title: `חיפושי עבר מול המלאי של היום · ${scopeName}`,
        color: '7C3AED',
        rows: d.history.items.map(h => ({
          'מידות': h.spec,
          'מצב היום': STATUS_LABEL[h.status],
          'רכב': h.vehicle,
          'לוחית': h.plate,
          'CB': h.center_bore ?? '',
          'חיפוש אחרון': fmtDate(h.searched_at),
          'חיפש': h.searched_by || '',
        })),
      }]),
    },
  ]
}

export default function SearchDemandReport({ stationId, range, onData }: {
  stationId?: string | null
  range: DateRange
  onData?: (d: SearchDemandData | null) => void
}) {
  const [data, setData] = useState<SearchDemandData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [caseTab, setCaseTab] = useState<'none' | 'unavailable'>('none')
  const [showAll, setShowAll] = useState(false)
  const [openSpec, setOpenSpec] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    onData?.(null)
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
      .then(d => { if (!cancelled) { setData(d); onData?.(d) } })
      .catch(e => { if (!cancelled) setError(e.message || 'שגיאה בטעינת הדוח') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stationId, range.from, range.to])

  if (loading) return <p style={st.muted}>טוען דוח חיפושים...</p>
  if (error || !data) return <p style={st.muted}>{error || 'שגיאה בטעינת הדוח'}</p>

  const pct = (n: number) => (data.counts.total ? Math.round((n / data.counts.total) * 100) : 0)
  const tabCases = data.cases.filter(c => c.status === caseTab)
  const visibleCases = showAll ? tabCases : tabCases.slice(0, 10)

  // Past searches grouped by wheel spec — gaps ('none') first, then biggest groups
  const historyGroups = Object.values(
    data.history.items.reduce<Record<string, { spec: string; status: Status; items: HistoryItem[] }>>((acc, h) => {
      (acc[h.spec] ||= { spec: h.spec, status: h.status, items: [] }).items.push(h)
      return acc
    }, {})
  ).sort((a, b) => (a.status === b.status ? b.items.length - a.items.length : a.status === 'none' ? -1 : 1))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {!data.logAvailable && (
        <div style={{ ...st.note, background: '#fffbeb', borderColor: '#fcd34d', color: '#92400e' }}>
          תיעוד החיפושים עדיין לא הופעל. בינתיים מוצג רק ניתוח חיפושי העבר.
        </div>
      )}

      {/* KPI tiles */}
      <div style={st.tiles}>
        {([
          { label: 'בדיקות', value: data.counts.total, color: '#2563eb', sub: 'סה״כ חיפושים' },
          { label: 'נמצא זמין', value: data.counts.available, color: STATUS_COLOR.available, sub: `${pct(data.counts.available)}%` },
          { label: 'היה מושאל', value: data.counts.unavailable, color: STATUS_COLOR.unavailable, sub: `${pct(data.counts.unavailable)}% · יש גלגל, לא היה זמין` },
          { label: 'חסר במלאי', value: data.counts.none, color: STATUS_COLOR.none, sub: `${pct(data.counts.none)}% · אין גלגל כזה` },
        ]).map(t => (
          <div key={t.label} style={{ ...st.tile, borderTop: `3px solid ${t.color}` }}>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: t.color, lineHeight: 1 }}>{t.value}</div>
            <div style={{ fontSize: '0.82rem', color: '#1e293b', fontWeight: 600, marginTop: 6 }}>{t.label}</div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 2 }}>{t.sub}</div>
          </div>
        ))}
      </div>

      {/* Top missing */}
      <div style={st.twoCol}>
        <TopList title="מידות שהכי חסרות" hint="חיפשו ולא היה גלגל כזה בכלל" items={data.topMissingSpecs} color={STATUS_COLOR.none} ltr />
        <TopList title="רכבים שלא נמצא להם גלגל" hint="לפי מספר החיפושים" items={data.topMissingVehicles} color={STATUS_COLOR.none} />
      </div>

      {/* Per-station (network view only) */}
      {!stationId && data.perStation.length > 0 && (
        <div>
          <h4 style={st.h4}>פילוח לפי תחנה</h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={st.table}>
              <thead><tr>{['תחנה', 'נמצא זמין', 'היה מושאל', 'חסר במלאי'].map(h => <th key={h} style={st.th}>{h}</th>)}</tr></thead>
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

      {/* Cases — two clear tabs */}
      <div>
        <h4 style={st.h4}>חיפושים שלא נמצא בהם גלגל זמין</h4>
        <div role="tablist" style={st.tabs}>
          {([
            { key: 'none', label: 'חסר במלאי', count: data.counts.none, color: STATUS_COLOR.none },
            { key: 'unavailable', label: 'היה מושאל', count: data.counts.unavailable, color: STATUS_COLOR.unavailable },
          ] as const).map(t => {
            const on = caseTab === t.key
            return (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => { setCaseTab(t.key); setShowAll(false) }}
                style={{ ...st.tab, ...(on ? { color: t.color, borderBottomColor: t.color, fontWeight: 700 } : {}) }}
              >
                {t.label}
                <span style={{ ...st.tabCount, background: on ? t.color : '#e2e8f0', color: on ? '#fff' : '#475569' }}>{t.count}</span>
              </button>
            )
          })}
        </div>
        <div style={st.tabHint}>
          {caseTab === 'none'
            ? 'חיפשו גלגל למידות האלה – ואין בכלל גלגל כזה בתחנה. אלה החוסרים האמיתיים במלאי.'
            : 'יש בתחנה גלגל מתאים, אבל בזמן החיפוש הוא היה מושאל או מושבת.'}
        </div>
        {tabCases.length === 0 ? (
          <p style={st.muted}>אין מקרים בתקופה זו</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {visibleCases.map(c => (
              <div key={c.id} style={st.caseRow}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
                  <strong style={{ color: '#1e293b', fontSize: '0.9rem', minWidth: 0 }}>{c.vehicle}</strong>
                  <span dir="ltr" style={st.specPill}>{c.spec}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
                  <span>{fmtDate(c.created_at)}</span>
                  <span>{c.searched_by || SOURCE_LABEL[c.source]}</span>
                  {c.center_bore ? <span dir="ltr">CB {c.center_bore}</span> : null}
                </div>
                {stationId && c.available_at.length > 0 && (
                  <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: 4 }}>✓ היה זמין ב: {c.available_at.join(', ')}</div>
                )}
              </div>
            ))}
            {tabCases.length > 10 && (
              <button type="button" onClick={() => setShowAll(v => !v)} style={st.linkBtn}>
                {showAll ? 'הצג פחות' : `הצג את כל ${tabCases.length} המקרים`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Past searches vs today's inventory */}
      <div style={st.historyBox}>
        <h4 style={{ ...st.h4, marginBottom: 4 }}>רכבים שחיפשו בעבר – מול המלאי של היום</h4>
        <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5, marginBottom: 12 }}>
          בדקנו את {data.history.counts.total} הרכבים שחיפשו לפי לוחית בתקופה, מול הגלגלים שיש {stationId ? 'בתחנה' : 'ברשת'} היום.
          זה מראה אילו מידות כדאי להשיג.
        </div>
        <div style={st.historyStats}>
          {([
            { v: data.history.counts.none, l: 'אין גלגל בכלל', c: STATUS_COLOR.none },
            { v: data.history.counts.unavailable, l: 'יש, כרגע מושאל', c: STATUS_COLOR.unavailable },
            { v: data.history.counts.available, l: 'יש גלגל זמין', c: STATUS_COLOR.available },
          ]).map(x => (
            <div key={x.l} style={st.historyStat}>
              <div style={{ color: x.c, fontSize: '1.3rem', fontWeight: 800, lineHeight: 1 }}>{x.v}</div>
              <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 4 }}>{x.l}</div>
            </div>
          ))}
        </div>
        {historyGroups.length > 0 && <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: 8 }}>מה חסר – לפי מידה (לחץ לרשימת הרכבים):</div>}
        {historyGroups.length === 0 ? (
          <p style={st.muted}>לכל הרכבים שחיפשו יש היום גלגל זמין 👍</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {historyGroups.map(g => {
              const open = openSpec === g.spec
              return (
                <div key={g.spec} style={st.groupRow}>
                  <button type="button" onClick={() => setOpenSpec(open ? null : g.spec)} aria-expanded={open} style={st.groupHead}>
                    <span dir="ltr" style={{ ...st.specPill, color: STATUS_COLOR[g.status], borderColor: STATUS_COLOR[g.status] }}>{g.spec}</span>
                    <span style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
                      <span style={{ display: 'block', fontSize: '0.88rem', color: '#1e293b', fontWeight: 700 }}>{g.items.length} רכבים</span>
                      <span style={{ display: 'block', fontSize: '0.72rem', color: STATUS_COLOR[g.status] }}>{g.status === 'none' ? 'חסר במלאי' : 'יש במלאי, כרגע מושאל'}</span>
                    </span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }}><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  {open && (
                    <div style={{ padding: '4px 12px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {g.items.map(h => (
                        <div key={h.plate} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: '0.8rem', color: '#334155' }}>
                          <span>{h.vehicle}</span>
                          <span style={{ color: '#94a3b8', flexShrink: 0 }}>{new Date(h.searched_at).toLocaleDateString('he-IL')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function TopList({ title, hint, items, color, ltr }: { title: string; hint: string; items: Top[]; color: string; ltr?: boolean }) {
  const max = items[0]?.count || 1
  return (
    <div style={st.card}>
      <h4 style={{ ...st.h4, marginBottom: 2 }}>{title}</h4>
      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 10 }}>{hint}</div>
      {items.length === 0 ? <p style={st.muted}>אין חוסרים בתקופה זו</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.slice(0, 6).map(t => (
            <div key={t.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 3, gap: 8 }}>
                <span dir={ltr ? 'ltr' : undefined} style={{ color: '#1e293b', fontWeight: 600, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.label}</span>
                <span style={{ color: '#64748b', flexShrink: 0 }}>{t.count} פעמים</span>
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
  note: { border: '1px solid', borderRadius: 10, padding: '10px 12px', fontSize: '0.82rem' },
  tiles: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 },
  tile: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 10px', textAlign: 'center' },
  twoCol: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 },
  h4: { margin: '0 0 10px', fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' },
  muted: { color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', padding: '12px 0', margin: 0 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' },
  th: { padding: '8px 10px', background: '#f8fafc', color: '#64748b', fontWeight: 700, textAlign: 'right', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' },
  td: { padding: '8px 10px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' },
  tabs: { display: 'flex', borderBottom: '1px solid #e2e8f0', gap: 4 },
  tab: {
    flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '10px 8px', background: 'none', border: 'none', borderBottom: '3px solid transparent',
    marginBottom: -1, color: '#64748b', fontSize: '0.9rem', cursor: 'pointer',
  },
  tabCount: { borderRadius: 999, padding: '1px 8px', fontSize: '0.75rem', fontWeight: 700 },
  tabHint: { fontSize: '0.78rem', color: '#64748b', background: '#f8fafc', borderRadius: 8, padding: '8px 10px', margin: '10px 0' },
  caseRow: { border: '1px solid #e2e8f0', background: '#ffffff', borderRadius: 10, padding: '10px 12px' },
  specPill: { fontSize: '0.78rem', fontWeight: 700, border: '1px solid #cbd5e1', borderRadius: 6, padding: '2px 8px', whiteSpace: 'nowrap', color: '#334155', flexShrink: 0 },
  linkBtn: { background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, padding: '4px 0', alignSelf: 'flex-start' },
  historyBox: { background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 12, padding: 14 },
  historyStats: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 },
  historyStat: { background: '#ffffff', border: '1px solid #e9d5ff', borderRadius: 10, padding: '10px 6px', textAlign: 'center' },
  groupRow: { background: '#ffffff', border: '1px solid #e9d5ff', borderRadius: 10, overflow: 'hidden' },
  groupHead: { width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'none', border: 'none', cursor: 'pointer' },
}
