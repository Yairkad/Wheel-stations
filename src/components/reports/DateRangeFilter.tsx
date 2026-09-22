'use client'

/**
 * Date range picker for reports: quick presets (7/30/90/365 days, all time) plus a
 * custom from/to. Values are YYYY-MM-DD strings; '' means open-ended.
 */

export interface DateRange { from: string; to: string }

const PRESETS: { label: string; days: number | null }[] = [
  { label: '7 ימים', days: 7 },
  { label: '30 ימים', days: 30 },
  { label: '90 ימים', days: 90 },
  { label: 'שנה', days: 365 },
  { label: 'הכל', days: null },
]

const toYMD = (d: Date) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return z.toISOString().slice(0, 10)
}

export function rangeForDays(days: number | null): DateRange {
  if (days === null) return { from: '', to: '' }
  const d = new Date()
  d.setDate(d.getDate() - (days - 1))
  return { from: toYMD(d), to: '' }
}

export function rangeLabel(r: DateRange): string {
  const fmt = (s: string) => new Date(`${s}T12:00:00`).toLocaleDateString('he-IL')
  if (!r.from && !r.to) return 'כל התקופה'
  if (r.from && !r.to) return `מ-${fmt(r.from)} עד היום`
  if (!r.from) return `עד ${fmt(r.to)}`
  return `${fmt(r.from)} – ${fmt(r.to)}`
}

/** True when a timestamp falls inside the range (inclusive, local dates). */
export function inRange(iso: string | null | undefined, r: DateRange): boolean {
  if (!iso) return !r.from && !r.to
  const t = new Date(iso).getTime()
  if (r.from && t < new Date(`${r.from}T00:00:00`).getTime()) return false
  if (r.to && t > new Date(`${r.to}T23:59:59.999`).getTime()) return false
  return true
}

export default function DateRangeFilter({ value, onChange }: { value: DateRange; onChange: (r: DateRange) => void }) {
  const activePreset = PRESETS.find(p => {
    const r = rangeForDays(p.days)
    return r.from === value.from && r.to === value.to
  })

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {PRESETS.map(p => {
          const on = activePreset?.label === p.label
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => onChange(rangeForDays(p.days))}
              style={{
                padding: '6px 12px', borderRadius: 999, fontSize: '0.8rem', cursor: 'pointer',
                border: `1px solid ${on ? '#2563eb' : '#cbd5e1'}`,
                background: on ? '#2563eb' : '#ffffff', color: on ? '#ffffff' : '#334155',
                fontWeight: on ? 700 : 500, whiteSpace: 'nowrap',
              }}
            >
              {p.label}
            </button>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="date"
          value={value.from}
          max={value.to || undefined}
          onChange={e => onChange({ ...value, from: e.target.value })}
          aria-label="מתאריך"
          style={dateInput}
        />
        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>עד</span>
        <input
          type="date"
          value={value.to}
          min={value.from || undefined}
          onChange={e => onChange({ ...value, to: e.target.value })}
          aria-label="עד תאריך"
          style={dateInput}
        />
      </div>
    </div>
  )
}

const dateInput: React.CSSProperties = {
  padding: '6px 8px', borderRadius: 8, border: '1px solid #cbd5e1',
  background: '#ffffff', color: '#1e293b', fontSize: '0.82rem', minWidth: 0,
}
