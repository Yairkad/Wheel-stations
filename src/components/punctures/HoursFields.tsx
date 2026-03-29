'use client'

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

// ─── TimeSelect ───────────────────────────────────────────────────────────────

interface TimeSelectProps {
  value:    string
  onChange: (v: string) => void
  dark?:    boolean
}

function TimeSelect({ value, onChange, dark }: TimeSelectProps) {
  const bg = dark ? '#0f172a' : '#fff'
  const border = dark ? '1px solid #334155' : '1px solid #d1d5db'
  const color = dark ? '#f8fafc' : '#1e293b'

  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        flex: 1, padding: '6px 8px', background: bg, border, borderRadius: 8,
        color: value ? color : '#94a3b8', fontSize: '0.82rem', cursor: 'pointer',
        direction: 'ltr', textAlign: 'center',
      }}
    >
      <option value="">--:--</option>
      {TIME_OPTIONS.map(t => (
        <option key={t} value={t}>{t}</option>
      ))}
    </select>
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
