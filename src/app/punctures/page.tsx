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

// ─── Region ───────────────────────────────────────────────────────────────────

type Region = 'צפון' | 'מרכז' | 'ירושלים והסביבה' | 'דרום'
const REGIONS: Region[] = ['צפון', 'מרכז', 'ירושלים והסביבה', 'דרום']

function getRegion(lat: number): Region {
  if (lat >= 32.45) return 'צפון'
  if (lat >= 31.8)  return 'מרכז'
  if (lat >= 31.4)  return 'ירושלים והסביבה'
  return 'דרום'
}

// ─── Open-now ─────────────────────────────────────────────────────────────────

function parseRange(s: string | null | undefined): { start: number; end: number } | null {
  if (!s) return null
  if (/24\/[76]|פתוח 24|24 ש/.test(s)) return { start: 0, end: 1440 }
  const m = /(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/.exec(s)
  if (m) {
    const start = +m[1] * 60 + +m[2]
    let   end   = +m[3] * 60 + +m[4]
    if (end === 0) end = 1440
    if (end < start) end += 1440
    return { start, end }
  }
  if (/עד חצות/.test(s)) return { start: 0, end: 1440 }
  const em = /עד (\d{1,2}):(\d{2})/.exec(s)
  if (em) return { start: 0, end: +em[1] * 60 + +em[2] }
  return null
}

function inRange(r: ReturnType<typeof parseRange>, mins: number) {
  return r !== null && mins >= r.start && mins <= r.end
}

function isOpenNow(shop: PunctureShop): boolean {
  const now  = new Date()
  const day  = now.getDay()
  const mins = now.getHours() * 60 + now.getMinutes()

  const all = [shop.hours_regular, shop.hours_evening, shop.hours_friday, shop.hours_saturday, shop.hours]
  if (all.some(h => h && /24\/[76]|פתוח 24/.test(h))) return true

  let primary: string | null | undefined
  if      (day === 5) primary = shop.hours_friday  ?? shop.hours_regular
  else if (day === 6) primary = shop.hours_saturday
  else                primary = shop.hours_regular  ?? shop.hours

  return (
    inRange(parseRange(primary), mins) ||
    inRange(parseRange(shop.hours_evening), mins) ||
    inRange(parseRange(shop.hours), mins)
  )
}

// ─── WhatsApp ─────────────────────────────────────────────────────────────────

function wa(phone: string) {
  const d = phone.replace(/\D/g, '')
  return d.startsWith('972') ? d : d.startsWith('0') ? '972' + d.slice(1) : '972' + d
}

// ─── Shop card ───────────────────────────────────────────────────────────────

type EnrichedShop = PunctureShop & { openNow: boolean; region: Region }

function ShopCard({ shop, selected, onClick }: {
  shop: EnrichedShop
  selected: boolean
  onClick: () => void
}) {
  const mapsUrl = shop.google_maps_url
    ?? `https://www.google.com/maps/search/?api=1&query=${shop.lat},${shop.lng}`

  const contacts = shop.puncture_contacts ?? []
  const hasHours = shop.hours_regular || shop.hours_evening || shop.hours_friday || shop.hours_saturday
  const legacyPhone = contacts.length === 0 ? shop.phone : null
  const legacyHours = !hasHours ? shop.hours : null
  const addressLine = [shop.city, shop.address].filter(Boolean).join(', ')

  return (
    <li
      onClick={onClick}
      className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-0 transition-colors ${
        selected ? 'bg-blue-50 border-r-4 border-r-blue-500' : 'hover:bg-gray-50'
      }`}
    >
      {/* Row 1: name + badges */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="font-semibold text-gray-800 text-sm leading-tight">{shop.name}</span>
        {shop.google_rating != null && (
          <span className="text-xs text-amber-500 font-medium">★ {shop.google_rating}</span>
        )}
        <span className={`mr-auto text-xs font-medium px-1.5 py-0.5 rounded-full ${
          shop.openNow
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-500'
        }`}>
          {shop.openNow ? 'פתוח' : 'סגור'}
        </span>
        {shop.distance_km != null && (
          <span className="text-xs text-blue-600 font-medium">
            {shop.distance_km < 1 ? `${Math.round(shop.distance_km * 1000)} מ׳` : `${shop.distance_km} ק״מ`}
          </span>
        )}
      </div>

      {/* Address */}
      {addressLine && (
        <div className="text-xs text-gray-500 mt-0.5">{addressLine}</div>
      )}

      {/* Hours — structured */}
      {hasHours && (
        <div className="mt-1.5 space-y-0.5">
          {shop.hours_regular  && <div className="text-xs text-gray-600">א׳–ה׳: {shop.hours_regular}</div>}
          {shop.hours_evening  && <div className="text-xs text-gray-600">ערב/לילה: {shop.hours_evening}</div>}
          {shop.hours_friday   && <div className="text-xs text-gray-600">שישי: {shop.hours_friday}</div>}
          {shop.hours_saturday && <div className="text-xs text-gray-600">מוצש: {shop.hours_saturday}</div>}
        </div>
      )}

      {/* Hours — legacy */}
      {legacyHours && (
        <div className="mt-1 text-xs text-gray-600">🕐 {legacyHours}</div>
      )}

      {/* Contacts */}
      {contacts.length > 0 && (
        <div className="mt-2 space-y-1.5 border-t border-gray-100 pt-2">
          {contacts.map((c) => (
            <div key={c.id} className="flex items-center gap-1">
              <span className="text-xs text-gray-800 flex-1 truncate">
                <span className="font-medium">{c.name}</span>: {c.phone}
              </span>
              <a
                href={`tel:${c.phone}`}
                onClick={(e) => e.stopPropagation()}
                title="התקשר"
                className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-blue-50 hover:bg-blue-100 transition-colors text-sm"
              >📞</a>
              {c.has_whatsapp && (
                <>
                  <a
                    href={`https://wa.me/${wa(c.phone)}`}
                    target="_blank" rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    title="שיחת WhatsApp"
                    className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-green-50 hover:bg-green-100 transition-colors text-sm"
                  >💬</a>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(c.phone)}`}
                    target="_blank" rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    title="שלח מספר ב-WhatsApp"
                    className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 transition-colors text-xs text-gray-500"
                  >📤</a>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Legacy phone */}
      {legacyPhone && (
        <div className="mt-1.5 flex items-center gap-1 border-t border-gray-100 pt-1.5">
          <span className="text-xs text-gray-800 flex-1">{legacyPhone}</span>
          <a href={`tel:${legacyPhone}`} onClick={(e) => e.stopPropagation()}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-50 hover:bg-blue-100 text-sm">📞</a>
          <a href={`https://wa.me/${wa(legacyPhone)}`} target="_blank" rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-green-50 hover:bg-green-100 text-sm">💬</a>
        </div>
      )}

      {/* Footer links */}
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
  const [form, setForm] = useState({ name: '', city: '', address: '', phone: '', hours: '', notes: '', submitter_name: '', submitter_phone: '' })
  const [sending, setSending] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true); setError(null)
    try {
      const res = await fetch('/api/puncture-suggestions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) setError((await res.json()).error ?? 'שגיאה')
      else setSent(true)
    } catch { setError('שגיאת רשת') }
    finally { setSending(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto" dir="rtl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">הצעת פנצ׳ריה חדשה</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        {sent ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">✅</div>
            <p className="font-medium">תודה! ההצעה נשלחה לבדיקה.</p>
            <button onClick={onClose} className="mt-4 text-sm text-blue-600 hover:underline">סגור</button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="שם הפנצ׳ריה *" required value={form.name} onChange={v => set('name', v)} />
              <Field label="עיר *" required value={form.city} onChange={v => set('city', v)} />
            </div>
            <Field label="כתובת *" required value={form.address} onChange={v => set('address', v)} />
            <Field label="טלפון" value={form.phone} onChange={v => set('phone', v)} />
            <Field label="שעות פעילות" value={form.hours} onChange={v => set('hours', v)} placeholder="א׳–ה׳ 07:00–19:00, שישי עד 14:00..." textarea />
            <Field label="הערות" value={form.notes} onChange={v => set('notes', v)} textarea />
            <div className="border-t pt-3">
              <p className="text-xs text-gray-500 mb-2">פרטי המציע (אופציונלי)</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="שם" value={form.submitter_name} onChange={v => set('submitter_name', v)} />
                <Field label="טלפון" value={form.submitter_phone} onChange={v => set('submitter_phone', v)} />
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

function Field({ label, value, onChange, required, placeholder, textarea }: {
  label: string; value: string; onChange: (v: string) => void
  required?: boolean; placeholder?: string; textarea?: boolean
}) {
  const cls = "mt-0.5 w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  return (
    <div>
      <label className="text-xs font-medium text-gray-700">{label}</label>
      {textarea
        ? <textarea required={required} value={value} onChange={e => onChange(e.target.value)}
            placeholder={placeholder} rows={2} className={cls + ' resize-none'} />
        : <input required={required} value={value} onChange={e => onChange(e.target.value)}
            placeholder={placeholder} className={cls} />
      }
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
    } catch { setAllShops([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAll('') }, [fetchAll])

  useEffect(() => {
    const t = setTimeout(() => fetchAll(searchQuery), 300)
    return () => clearTimeout(t)
  }, [searchQuery, fetchAll])

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [selectedId])

  const enriched: EnrichedShop[] = allShops.map(s => ({
    ...s,
    openNow: isOpenNow(s),
    region:  getRegion(s.lat),
  }))

  const displayed = enriched
    .filter(s => !regionFilter  || s.region === regionFilter)
    .filter(s => !openNowFilter || s.openNow)

  const openCount = enriched.filter(s => s.openNow).length

  const handleNearby = () => {
    if (!navigator.geolocation) { setGeoError('הדפדפן שלך אינו תומך ב-Geolocation'); return }
    setGeoLoading(true); setGeoError(null)
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res  = await fetch(`/api/punctures/nearby?lat=${coords.latitude}&lng=${coords.longitude}`)
          const data = await res.json()
          setAllShops(Array.isArray(data) ? data : [])
          setSearchQuery(''); setRegionFilter('')
          if (data.length > 0) setSelectedId(data[0].id)
        } catch { setGeoError('שגיאה בחיפוש') }
        finally { setGeoLoading(false) }
      },
      () => { setGeoError('לא ניתן לקבל מיקום'); setGeoLoading(false) }
    )
  }

  return (
    <div dir="rtl" className="h-screen flex flex-col bg-gray-50 overflow-hidden">

      {/* ── Top bar ── */}
      <header className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3 px-4 py-2.5">
          <h1 className="text-lg font-bold text-gray-800 whitespace-nowrap">🔧 פנצ׳ריות לילה</h1>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="חיפוש לפי שם, עיר או כתובת..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={handleNearby} disabled={geoLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap">
            {geoLoading
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : '📍'}
            הקרוב אלי
          </button>
          <button onClick={() => setShowSuggest(true)}
            className="text-sm text-blue-600 hover:underline whitespace-nowrap hidden sm:block">
            + הצע מקום
          </button>
        </div>
        {geoError && <p className="px-4 pb-2 text-xs text-red-600">{geoError}</p>}
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Map */}
        <div className="flex-1 p-2">
          <MapView shops={displayed} selectedId={selectedId} onSelectShop={setSelectedId} />
        </div>

        {/* ── Sidebar ── */}
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">

          {/* Filter strip */}
          <div className="flex-shrink-0 bg-gray-50 border-b border-gray-200 px-3 py-2 space-y-2">

            {/* Region buttons */}
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setRegionFilter('')}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                  regionFilter === '' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                }`}
              >הכל</button>
              {REGIONS.map(r => (
                <button key={r}
                  onClick={() => setRegionFilter(regionFilter === r ? '' : r)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                    regionFilter === r ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                  }`}
                >{r}</button>
              ))}
            </div>

            {/* Open now + count */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setOpenNowFilter(p => !p)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  openNowFilter ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${openNowFilter ? 'bg-white' : 'bg-green-500'}`} />
                פתוח עכשיו ({openCount})
              </button>
              <span className="text-xs text-gray-400">
                {loading ? 'טוען...' : `${displayed.length} תוצאות`}
              </span>
            </div>
          </div>

          {/* List */}
          {displayed.length === 0 && !loading ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm px-4 text-center">
              {openNowFilter ? 'אין פנצ׳ריות פתוחות כרגע' : 'לא נמצאו פנצ׳ריות'}
            </div>
          ) : (
            <ul className="flex-1 overflow-y-auto">
              {displayed.map(shop => (
                <ShopCard
                  key={shop.id}
                  shop={shop}
                  selected={shop.id === selectedId}
                  onClick={() => setSelectedId(shop.id)}
                />
              ))}
            </ul>
          )}

          {/* Mobile suggest link */}
          <div className="flex-shrink-0 border-t border-gray-100 px-4 py-2 sm:hidden">
            <button onClick={() => setShowSuggest(true)} className="text-sm text-blue-600 hover:underline">
              + הצע מקום חדש
            </button>
          </div>
        </aside>
      </div>

      {showSuggest && <SuggestModal onClose={() => setShowSuggest(false)} />}
    </div>
  )
}
