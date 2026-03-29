'use client'

import { useState, useEffect, useRef } from 'react'

// ─── Time options ──────────────────────────────────────────────────────────────

const TIME_OPTIONS: string[] = []
for (let h = 0; h < 24; h++) {
  for (const m of [0, 30]) {
    TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DayHours {
  from: string
  to:   string
}

export interface HoursState {
  regular:  DayHours  // א׳–ה׳
  evening:  DayHours  // ערב/לילה
  friday:   DayHours  // שישי
  saturday: DayHours  // מוצ״ש
}

export function emptyHours(): HoursState {
  return {
    regular:  { from: '', to: '' },
    evening:  { from: '', to: '' },
    friday:   { from: '', to: '' },
    saturday: { from: '', to: '' },
  }
}

export function parseHoursState(
  regular?: string | null,
  evening?: string | null,
  friday?: string | null,
  saturday?: string | null,
): HoursState {
  return {
    regular:  splitRange(regular),
    evening:  splitRange(evening),
    friday:   splitRange(friday),
    saturday: splitRange(saturday),
  }
}

function splitRange(s?: string | null): DayHours {
  if (!s) return { from: '', to: '' }
  const m = /(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/.exec(s)
  if (m) return { from: padTime(m[1]), to: padTime(m[2]) }
  return { from: '', to: '' }
}

function padTime(t: string) {
  const [h, m] = t.split(':')
  return `${String(+h).padStart(2, '0')}:${m}`
}

export function hoursToString(d: DayHours): string {
  if (!d.from || !d.to) return ''
  return `${d.from}-${d.to}`
}

// ─── TimeCombo (input + filtered dropdown) ────────────────────────────────────

interface TimeSelectProps {
  value:    string
  onChange: (v: string) => void
  dark?:    boolean
}

function TimeSelect({ value, onChange, dark }: TimeSelectProps) {
  const [typed, setTyped] = useState(value)
  const [open,  setOpen]  = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  // Sync when external value changes
  useEffect(() => { setTyped(value) }, [value])

  const filtered = typed.length >= 1
    ? TIME_OPTIONS.filter(t => t.startsWith(typed))
    : TIME_OPTIONS

  const pick = (t: string) => {
    onChange(t)
    setTyped(t)
    setOpen(false)
  }

  const handleBlur = (e: React.FocusEvent) => {
    if (wrapRef.current?.contains(e.relatedTarget as Node)) return
    setOpen(false)
    if (TIME_OPTIONS.includes(typed)) {
      onChange(typed)
    } else if (!typed.trim()) {
      onChange('')
      setTyped('')
    } else {
      setTyped(value) // revert to last valid
    }
  }

  const bg     = dark ? '#0f172a' : '#fff'
  const border = dark ? '1px solid #334155' : '1px solid #d1d5db'
  const color  = dark ? '#f8fafc' : '#1e293b'
  const ddBg   = dark ? '#1e293b' : '#fff'
  const ddHov  = dark ? '#334155' : '#f1f5f9'

  return (
    <div ref={wrapRef} style={{ position: 'relative', flex: 1 }} onBlur={handleBlur}>
      <input
        value={typed}
        onChange={e => { setTyped(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder="--:--"
        style={{
          width: '100%', padding: '6px 8px', background: bg, border, borderRadius: 8,
          color: typed ? color : '#94a3b8', fontSize: '0.82rem',
          direction: 'ltr', textAlign: 'center', boxSizing: 'border-box',
        }}
      />
      {open && filtered.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 2px)', left: 0, right: 0,
          zIndex: 300, background: ddBg, border, borderRadius: 8,
          maxHeight: 160, overflowY: 'auto',
          boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
        }}>
          {filtered.map(t => (
            <div
              key={t}
              onMouseDown={() => pick(t)}
              style={{
                padding: '6px 10px', cursor: 'pointer', fontSize: '0.82rem',
                color, direction: 'ltr', textAlign: 'center',
                background: t === value ? (dark ? '#334155' : '#e0f2fe') : 'transparent',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = ddHov)}
              onMouseLeave={e => (e.currentTarget.style.background = t === value ? (dark ? '#334155' : '#e0f2fe') : 'transparent')}
            >
              {t}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── HoursRow ─────────────────────────────────────────────────────────────────

interface HoursRowProps {
  label:    string
  value:    DayHours
  onChange: (v: DayHours) => void
  dark?:    boolean
}

function HoursRow({ label, value, onChange, dark }: HoursRowProps) {
  const labelColor = dark ? '#94a3b8' : '#6b7280'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: '0.8rem', color: labelColor, width: 70, flexShrink: 0, textAlign: 'right' }}>{label}</span>
      <TimeSelect value={value.from} onChange={v => onChange({ ...value, from: v })} dark={dark} />
      <span style={{ color: labelColor, fontSize: '0.8rem', flexShrink: 0 }}>עד</span>
      <TimeSelect value={value.to}   onChange={v => onChange({ ...value, to:   v })} dark={dark} />
    </div>
  )
}

// ─── HoursFields (full block) ─────────────────────────────────────────────────

interface HoursFieldsProps {
  value:    HoursState
  onChange: (v: HoursState) => void
  dark?:    boolean
  /** show evening & saturday rows (admin forms) — default true */
  extended?: boolean
}

export function HoursFields({ value, onChange, dark, extended = true }: HoursFieldsProps) {
  const set = (key: keyof HoursState) => (v: DayHours) => onChange({ ...value, [key]: v })
  const wrapStyle = dark
    ? { background: '#0f172a', border: '1px solid #334155', borderRadius: 10, padding: '10px 12px', display: 'flex', flexDirection: 'column' as const, gap: 10 }
    : { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 12px', display: 'flex', flexDirection: 'column' as const, gap: 10 }

  return (
    <div style={wrapStyle}>
      <HoursRow label="א׳–ה׳:"   value={value.regular}  onChange={set('regular')}  dark={dark} />
      {extended && (
        <HoursRow label="ערב/לילה:" value={value.evening}  onChange={set('evening')}  dark={dark} />
      )}
      <HoursRow label="שישי:"    value={value.friday}   onChange={set('friday')}   dark={dark} />
      {extended && (
        <HoursRow label="מוצ״ש:"   value={value.saturday} onChange={set('saturday')} dark={dark} />
      )}
    </div>
  )
}
