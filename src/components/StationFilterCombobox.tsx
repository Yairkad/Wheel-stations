import { useRef, useState } from 'react'
import { useClickOutside } from '@/hooks/useClickOutside'

export function filterByStation<T extends { station: { id: string } }>(results: T[], stationId: string): T[] {
  if (!stationId) return results
  return results.filter(r => r.station.id === stationId)
}

// Typeahead station picker shown above search results — lists every active
// station (not just ones present in the current results), filtered as you type.
export default function StationFilterCombobox({ stations, selectedId, onChange }: {
  stations: { id: string; name: string }[]
  selectedId: string
  onChange: (id: string) => void
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, () => setOpen(false), open)

  const selected = stations.find(s => s.id === selectedId)
  const filtered = [...stations]
    .filter(s => s.name.includes(query.trim()))
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div ref={ref} style={{ position: 'relative', marginBottom: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
        <input
          type="text"
          value={open ? query : (selected?.name || '')}
          onChange={e => { setQuery(e.target.value); if (selectedId) onChange('') }}
          onFocus={() => { setQuery(''); setOpen(true) }}
          placeholder="סנן לפי תחנה..."
          style={{
            flex: 1,
            padding: '6px 26px 6px 10px',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '0.85rem',
            background: '#f8fafc',
            color: '#1e293b',
            outline: 'none',
          }}
        />
        {selected && (
          <button
            onClick={() => { onChange(''); setQuery('') }}
            style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px', lineHeight: 1 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        )}
      </div>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', right: 0, left: 0, zIndex: 30,
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)', maxHeight: '220px', overflowY: 'auto',
        }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '10px 12px', fontSize: '0.85rem', color: '#94a3b8' }}>לא נמצאה תחנה</div>
          ) : (
            filtered.map(s => (
              <button
                key={s.id}
                onClick={() => { onChange(s.id); setQuery(''); setOpen(false) }}
                style={{
                  display: 'block', width: '100%', textAlign: 'right', padding: '9px 12px',
                  background: s.id === selectedId ? '#f1f5f9' : 'none', border: 'none',
                  color: '#1e293b', fontSize: '0.85rem', cursor: 'pointer',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={e => (e.currentTarget.style.background = s.id === selectedId ? '#f1f5f9' : 'none')}
              >
                {s.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
