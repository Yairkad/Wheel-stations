import { getDistrictColor, getDistrictName, District } from '@/lib/districts'

export function filterByDistricts<T extends { station: { district?: string | null } }>(results: T[], selected: string[]): T[] {
  if (selected.length === 0) return results
  return results.filter(r => r.station.district && selected.includes(r.station.district))
}

// Toggleable district chips, shown above search results — only lists districts actually
// present in the current result set, and hides itself when there's nothing to narrow.
export default function DistrictFilterChips({ results, selected, onToggle, districts }: {
  results: { station: { district?: string | null } }[]
  selected: string[]
  onToggle: (code: string) => void
  districts: District[]
}) {
  const codes = [...new Set(results.map(r => r.station.district).filter((d): d is string => !!d))]
    .sort((a, b) => getDistrictName(a, districts).localeCompare(getDistrictName(b, districts)))
  if (codes.length < 2) return null
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
      {codes.map(code => {
        const active = selected.includes(code)
        const color = getDistrictColor(code, districts)
        return (
          <button
            key={code}
            onClick={() => onToggle(code)}
            aria-pressed={active}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '4px 10px', borderRadius: '999px', fontSize: '0.8rem',
              border: `1px solid ${active ? color : '#e2e8f0'}`,
              background: active ? color : '#f8fafc',
              color: active ? '#fff' : '#475569',
              cursor: 'pointer',
            }}
          >
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: active ? '#fff' : color, display: 'inline-block' }} />
            {getDistrictName(code, districts)}
          </button>
        )
      })}
    </div>
  )
}
