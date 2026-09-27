'use client'

/**
 * Date range picker for reports: one segmented control (7 / 30 / 90 days, year, all,
 * custom). The from/to date fields appear only when "מותאם" is selected.
 * Values are YYYY-MM-DD strings; '' means open-ended.
 */

import { useState } from 'react'

export interface DateRange { from: string; to: string }

const PRESETS: { key: string; label: string; days: number | null }[] = [
  { key: '7', label: '7 ימים', days: 7 },
  { key: '30', label: '30 ימים', days: 30 },
  { key: '90', label: '90 ימים', days: 90 },
  { key: '365', label: 'שנה', days: 365 },
  { key: 'all', label: 'הכל', days: null },
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
  const matchedPreset = PRESETS.find(p => {
    const r = rangeForDays(p.days)
    return r.from === value.from && r.to === value.to
  })
  const [customMode, setCustomMode] = useState(!matchedPreset)
  const active = customMode ? 'custom' : matchedPreset?.key

  const options = [...PRESETS.map(p => ({ key: p.key, label: p.label })), { key: 'custom', label: 'מותאם' }]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
      <div role="radiogroup" aria-label="תקופה" style={seg.group}>
        {options.map(o => {
          const on = active === o.key
          return (
            <button
              key={o.key}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => {
                if (o.key === 'custom') { setCustomMode(true); return }
                setCustomMode(false)
                onChange(rangeForDays(PRESETS.find(p => p.key === o.key)!.days))
              }}
              style={{ ...seg.btn, ...(on ? seg.btnOn : {}) }}
            >
              {o.label}
            </button>
          )
        })}
      </div>
      {customMode && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <label style={seg.field}>
            <span style={seg.fieldLabel}>מתאריך</span>
            <input type="date" value={value.from} max={value.to || undefined} onChange={e => onChange({ ...value, from: e.target.value })} style={seg.input} />
          </label>
          <label style={seg.field}>
            <span style={seg.fieldLabel}>עד תאריך</span>
            <input type="date" value={value.to} min={value.from || undefined} onChange={e => onChange({ ...value, to: e.target.value })} style={seg.input} />
          </label>
        </div>
      )}
    </div>
  )
}

const seg: Record<string, React.CSSProperties> = {
  // 6 options: one row on wide screens, a neat 3x2 grid on phones
  group: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(92px, 1fr))',
    background: '#f1f5f9', borderRadius: 12, padding: 4, gap: 2,
  },
  btn: {
    padding: '8px 10px', border: 'none', borderRadius: 9, background: 'transparent',
    color: '#475569', fontSize: '0.84rem', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
    transition: 'background 0.15s, color 0.15s',
  },
  btnOn: { background: '#ffffff', color: '#1d4ed8', fontWeight: 700, boxShadow: '0 1px 3px rgba(15,23,42,0.12)' },
  field: { display: 'flex', flexDirection: 'column', gap: 4, flex: '1 1 140px', minWidth: 0 },
  fieldLabel: { fontSize: '0.75rem', fontWeight: 600, color: '#64748b' },
  input: {
    padding: '9px 10px', borderRadius: 10, border: '1px solid #cbd5e1', background: '#ffffff',
    color: '#1e293b', fontSize: '0.88rem', width: '100%', boxSizing: 'border-box',
  },
}
