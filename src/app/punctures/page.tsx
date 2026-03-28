'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import type { PunctureShop } from '@/components/punctures/MapView'

const MapView = dynamic(() => import('@/components/punctures/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
      <span className="text-gray-500 text-sm">טוען מפה...</span>
    </div>
  ),
})

// ─── Region detection ─────────────────────────────────────────────────────────

type Region = 'צפון' | 'מרכז' | 'ירושלים והסביבה' | 'דרום'
const REGIONS: Region[] = ['צפון', 'מרכז', 'ירושלים והסביבה', 'דרום']

function getRegion(lat: number): Region {
  if (lat >= 32.45) return 'צפון'
  if (lat >= 31.8)  return 'מרכז'
  if (lat >= 31.4)  return 'ירושלים והסביבה'
  return 'דרום'
}

// ─── Open-now logic ───────────────────────────────────────────────────────────

function parseTimeRange(s: string | null): { start: number; end: number } | null {
  if (!s) return null
  if (/24\/[76]|פתוח 24|24 ש/.test(s)) return { start: 0, end: 1440 }

  // Full range HH:MM - HH:MM
  const full = /(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/.exec(s)
  if (full) {
    const start = parseInt(full[1]) * 60 + parseInt(full[2])
    let end   = parseInt(full[3]) * 60 + parseInt(full[4])
    if (end === 0) end = 1440           // "00:00" = midnight = end of day
    if (end < start) end += 1440        // crosses midnight
    return { start, end }
  }

  // "עד חצות" → until midnight
  if (/עד חצות/.test(s)) return { start: 0, end: 1440 }

  // "עד HH:MM" → end time only (assume open from morning)
  const endOnly = /עד (\d{1,2}):(\d{2})/.exec(s)
  if (endOnly) return { start: 0, end: parseInt(endOnly[1]) * 60 + parseInt(endOnly[2]) }

  return null
}

function isOpenNow(shop: PunctureShop): boolean {
  const now     = new Date()
  const day     = now.getDay()                              // 0=Sun 5=Fri 6=Sat
  const minutes = now.getHours() * 60 + now.getMinutes()

  // Check all fields for 24/7 indicators
  const allFields = [
    shop.hours_regular, shop.hours_evening,
    shop.hours_friday, shop.hours_saturday, shop.hours,
  ]
  if (allFields.some(h => h && /24\/[76]|פתוח 24/.test(h))) return true

  // Pick primary hours for today
  let primary: string | null = null
  if      (day === 5) primary = shop.hours_friday  ?? shop.hours_regular ?? null
  else if (day === 6) primary = shop.hours_saturday ?? null
  else                primary = shop.hours_regular  ?? shop.hours        ?? null

  const inRange = (range: ReturnType<typeof parseTimeRange>) =>
    range !== null && minutes >= range.start && minutes <= range.end

  if (inRange(parseTimeRange(primary ?? null)))            return true
  if (inRange(parseTimeRange(shop.hours_evening ?? null))) return true
  if (inRange(parseTimeRange(shop.hours ?? null)))         return true

  return false
}

// ─── WhatsApp helper ──────────────────────────────────────────────────────────

function toWhatsApp(phone: string): string {
  const d = phone.replace(/\D/g, '')
  if (d.startsWith('972')) return d
  if (d.startsWith('0'))   return '972' + d.slice(1)
  return '972' + d
}

// ─── Shop card ───────────────────────────────────────────────────────────────

function ShopCard({ shop, selected, onClick }: {
  shop: PunctureShop & { openNow?: boolean }
  selected: boolean
  onClick: () => void
}) {
  const mapsUrl =
    shop.google_maps_url ??
    `https://www.google.com/maps/search/?api=1&query=${shop.lat},${shop.lng}`

  // Fallback: use original `hours` field if new structured fields are all empty
  const hasStructuredHours =
    shop.hours_regular || shop.hours_evening || shop.hours_friday || shop.hours_saturday
  const legacyHours = !hasStructuredHours ? (shop.hours ?? null) : null

  // Fallback: use original `phone` if no contacts
  const contacts     = shop.puncture_contacts ?? []
  const legacyPhone  = contacts.length === 0 ? (shop.phone ?? null) : null

  // Address line: prefer city + address, fallback to address alone
  const addressLine = [shop.city, shop.address].filter(Boolean).join(', ')

  return (
    <li
      onClick={onClick}
      className={`px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 last:border-0 ${
        selected ? 'bg-blue-50 border-r-4 border-r-blue-500' : 'hover:bg-gray-50'
      }`}
    >
      {/* Name row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-semibold text-gray-800 text-sm">{shop.name}</span>
        {shop.google_rating && (
          <span className="text-xs text-amber-500 font-medium">★ {shop.google_rating}</span>
        )}
        {shop.openNow !== undefined && (
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
            shop.openNow ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}>
            {shop.openNow ? 'פתוח עכשיו' : 'סגור'}
          </span>
        )}
        {shop.distance_km !== undefined && (
          <span className="text-xs text-green-600 font-medium mr-auto">
            {shop.distance_km < 1
              ? `${Math.round(shop.distance_km * 1000)} מ׳`
              : `${shop.distance_km} ק״מ`}
          </span>
        )}
      </div>

      {/* Address */}
      {addressLine && (
        <div className="text-xs text-gray-500 mt-0.5">{addressLine}</div>
      )}

      {/* Hours — structured */}
      {hasStructuredHours && (
        <div className="mt-1.5 text-xs text-gray-600 space-y-0.5">
          {shop.hours_regular  && <div>א׳–ה׳: {shop.hours_regular}</div>}
          {shop.hours_evening  && <div>ערב/לילה: {shop.hours_evening}</div>}
          {shop.hours_friday   && <div>שישי: {shop.hours_friday}</div>}
          {shop.hours_saturday && <div>מוצש: {shop.hours_saturday}</div>}
        </div>
      )}

      {/* Hours — legacy fallback */}
      {legacyHours && (
        <div className="mt-1.5 text-xs text-gray-600">🕐 {legacyHours}</div>
      )}

      {/* Contacts */}
      {contacts.length > 0 && (
        <div className="mt-2 space-y-1">
          {contacts.map((c) => (
            <div key={c.id} className="flex items-center gap-2">
              <span className="text-xs text-gray-700 flex-1">{c.name}: {c.phone}</span>
              <a
                href={`tel:${c.phone}`}
                onClick={(e) => e.stopPropagation()}
                className="p-1 rounded hover:bg-gray-200 transition-colors text-sm leading-none"
                title="התקשר"
              >📞</a>
              {c.has_whatsapp && (
                <>
                  <a
                    href={`https://wa.me/${toWhatsApp(c.phone)}`}
                    target="_blank" rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 rounded hover:bg-gray-200 transition-colors text-sm leading-none"
                    title="פתח שיחת WhatsApp"
                  >💬</a>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(c.phone)}`}
                    target="_blank" rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 rounded hover:bg-gray-200 transition-colors text-xs text-gray-400 leading-none"
                    title="שלח מספר ב-WhatsApp"
                  >📤</a>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Legacy phone fallback */}
      {legacyPhone && (
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-xs text-gray-700 flex-1">{legacyPhone}</span>
          <a href={`tel:${legacyPhone}`} onClick={(e) => e.stopPropagation()}
            className="p-1 rounded hover:bg-gray-200 text-sm">📞</a>
          <a href={`https://wa.me/${toWhatsApp(legacyPhone)}`}
            target="_blank" rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1 rounded hover:bg-gray-200 text-sm">💬</a>
        </div>
      )}

      {/* Bottom links */}
      <div className="mt-2 flex items-center gap-3">
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-blue-600 hover:underline">
          📍 מפות Google
        </a>
        {shop.website && (
          <a href={shop.website} target="_blank" rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-blue-600 hover:underline">
            🌐 אתר
          </a>
        )}
      </div>
    </li>
  )
}

// ─── Suggestion modal ─────────────────────────────────────────────────────────

function SuggestModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    name: '', city: '', address: '', phone: '', hours: '',
    notes: '', submitter_name: '', submitter_phone: '',
  })
  const [sending, setSending] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const set = (field: string, value: string) =>
    setForm((p) => ({ ...p, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError(null)
    try {
      const res = await fetch('/api/puncture-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'שגיאה בשליחה')
      } else {
        setSent(true)
      }
    } catch {
      setError('שגיאת רשת')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
      onClick={onClose}>
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        dir="rtl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">הצעת פנצ׳ריה חדשה</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        {sent ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-gray-700 font-medium">תודה! ההצעה נשלחה לבדיקה.</p>
            <button onClick={onClose} className="mt-4 text-sm text-blue-600 hover:underline">סגור</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700">שם הפנצ׳ריה *</label>
                <input required value={form.name} onChange={(e) => set('name', e.target.value)}
                  className="mt-0.5 w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">עיר *</label>
                <input required value={form.city} onChange={(e) => set('city', e.target.value)}
                  className="mt-0.5 w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700">כתובת *</label>
              <input required value={form.address} onChange={(e) => set('address', e.target.value)}
                className="mt-0.5 w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700">טלפון</label>
              <input value={form.phone} onChange={(e) => set('phone', e.target.value)}
                className="mt-0.5 w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700">שעות פעילות</label>
              <textarea value={form.hours} onChange={(e) => set('hours', e.target.value)} rows={2}
                placeholder="למשל: א׳–ה׳ 07:00–19:00, שישי עד 14:00..."
                className="mt-0.5 w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700">הערות</label>
              <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2}
                className="mt-0.5 w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs text-gray-500 mb-2">פרטי המציע (אופציונלי)</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700">שם</label>
                  <input value={form.submitter_name} onChange={(e) => set('submitter_name', e.target.value)}
                    className="mt-0.5 w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700">טלפון</label>
                  <input value={form.submitter_phone} onChange={(e) => set('submitter_phone', e.target.value)}
                    className="mt-0.5 w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={sending}
              className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {sending ? 'שולח...' : 'שלח הצעה'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PuncturesPage() {
  const [allShops,    setAllShops]    = useState<PunctureShop[]>([])
  const [loading,     setLoading]     = useState(true)
  const [geoLoading,  setGeoLoading]  = useState(false)
  const [geoError,    setGeoError]    = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedId,  setSelectedId]  = useState<string | null>(null)
  const [showSuggest, setShowSuggest] = useState(false)

  // Filters
  const [regionFilter,  setRegionFilter]  = useState<Region | ''>('')
  const [openNowFilter, setOpenNowFilter] = useState(false)

  const selectedRef = useRef<HTMLLIElement>(null)

  const fetchAll = useCallback(async (q: string) => {
    setLoading(true)
    try {
      const res  = await fetch(`/api/punctures${q ? `?q=${encodeURIComponent(q)}` : ''}`)
      const data = await res.json()
      setAllShops(Array.isArray(data) ? data : [])
      setSelectedId(null)
    } catch {
      setAllShops([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll('') }, [fetchAll])

  useEffect(() => {
    const t = setTimeout(() => fetchAll(searchQuery), 300)
    return () => clearTimeout(t)
  }, [searchQuery, fetchAll])

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [selectedId])

  // Enrich with openNow + region, then filter
  const displayShops = allShops
    .map((s) => ({ ...s, openNow: isOpenNow(s), region: getRegion(s.lat) }))
    .filter((s) => !regionFilter  || s.region === regionFilter)
    .filter((s) => !openNowFilter || s.openNow)

  const handleNearby = () => {
    if (!navigator.geolocation) {
      setGeoError('הדפדפן שלך אינו תומך ב-Geolocation')
      return
    }
    setGeoLoading(true)
    setGeoError(null)
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res  = await fetch(`/api/punctures/nearby?lat=${coords.latitude}&lng=${coords.longitude}`)
          const data = await res.json()
          setAllShops(Array.isArray(data) ? data : [])
          setSearchQuery('')
          setRegionFilter('')
          if (data.length > 0) setSelectedId(data[0].id)
        } catch {
          setGeoError('שגיאה בחיפוש פנצ׳ריות קרובות')
        } finally {
          setGeoLoading(false)
        }
      },
      () => {
        setGeoError('לא ניתן לקבל מיקום — אנא אשר גישה למיקום')
        setGeoLoading(false)
      }
    )
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-800">פנצ׳ריות לילה 🔧</h1>
          <button onClick={() => setShowSuggest(true)}
            className="text-sm text-blue-600 hover:underline">
            + הצע מקום
          </button>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="חיפוש לפי שם, עיר או כתובת..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleNearby}
            disabled={geoLoading}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
          >
            {geoLoading
              ? <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <span>📍</span>}
            הקרוב אלי
          </button>
        </div>
        {geoError && <p className="mt-2 text-sm text-red-600">{geoError}</p>}
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>

        {/* Map */}
        <div className="flex-1 p-3">
          <MapView shops={displayShops} selectedId={selectedId} onSelectShop={setSelectedId} />
        </div>

        {/* Sidebar */}
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden">

          {/* Filter bar */}
          <div className="px-3 py-2 border-b border-gray-100 space-y-2">
            <div className="flex items-center gap-2">
              {/* Region select */}
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value as Region | '')}
                className="flex-1 border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">כל האזורים</option>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>

              {/* Open now toggle */}
              <button
                onClick={() => setOpenNowFilter((p) => !p)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap ${
                  openNowFilter
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'
                }`}
              >
                🟢 פתוח עכשיו
              </button>
            </div>

            <div className="text-xs text-gray-400">
              {loading ? 'טוען...' : `${displayShops.length} תוצאות`}
              {openNowFilter && (
                <span className="mr-2 text-green-600">
                  ({allShops.filter(isOpenNow).length} פתוחות)
                </span>
              )}
            </div>
          </div>

          {/* List */}
          {displayShops.length === 0 && !loading ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm px-4 text-center">
              {openNowFilter ? 'אין פנצ׳ריות פתוחות כרגע באזור זה' : 'לא נמצאו פנצ׳ריות'}
            </div>
          ) : (
            <ul className="flex-1 overflow-y-auto">
              {displayShops.map((shop) => (
                <ShopCard
                  key={shop.id}
                  shop={shop}
                  selected={shop.id === selectedId}
                  onClick={() => setSelectedId(shop.id)}
                />
              ))}
            </ul>
          )}
        </aside>
      </div>

      {showSuggest && <SuggestModal onClose={() => setShowSuggest(false)} />}
    </div>
  )
}
