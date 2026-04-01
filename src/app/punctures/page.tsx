'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import dynamic from 'next/dynamic'
import type { PunctureShop } from '@/components/punctures/MapView'
import { HoursFields, HoursState, emptyHours, hoursToString } from '@/components/punctures/HoursFields'

const MapView = dynamic(() => import('@/components/punctures/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
      <span className="text-gray-500 text-sm">טוען מפה...</span>
    </div>
  ),
})

// ─── WhatsApp SVG icon ────────────────────────────────────────────────────────

function WaIcon({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="#25D366">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

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
  const all  = [shop.hours_regular, shop.hours_evening, shop.hours_friday, shop.hours_saturday, shop.hours]
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

// ─── WhatsApp URL ─────────────────────────────────────────────────────────────

function wa(phone: string) {
  const d = phone.replace(/\D/g, '')
  return d.startsWith('972') ? d : d.startsWith('0') ? '972' + d.slice(1) : '972' + d
}

// ─── Share text ───────────────────────────────────────────────────────────────

function buildShareText(shop: PunctureShop): string {
  const address = [shop.city, shop.address].filter(Boolean).join(', ')
  const lines: string[] = [`🔧 ${shop.name}`]
  if (address) lines.push(`📍 ${address}`)
  if (shop.hours_regular)  lines.push(`א׳–ה׳: ${shop.hours_regular}`)
  if (shop.hours_evening)  lines.push(`ערב/לילה: ${shop.hours_evening}`)
  if (shop.hours_friday)   lines.push(`שישי: ${shop.hours_friday}`)
  if (shop.hours_saturday) lines.push(`מוצש: ${shop.hours_saturday}`)
  if (!shop.hours_regular && shop.hours) lines.push(shop.hours)
  const contacts = shop.puncture_contacts ?? []
  if (contacts.length > 0) {
    lines.push('')
    contacts.forEach(c => lines.push(`${c.name}: ${c.phone}`))
  } else if (shop.phone) {
    lines.push(shop.phone)
  }
  return lines.join('\n')
}

// ─── Types ────────────────────────────────────────────────────────────────────

type EnrichedShop = PunctureShop & { openNow: boolean; region: Region }

// ─── Shop card ───────────────────────────────────────────────────────────────

function ShopCard({ shop, selected, onClick, onShowMap }: {
  shop: EnrichedShop
  selected: boolean
  onClick: () => void
  onShowMap: () => void
}) {
  const mapsUrl = shop.google_maps_url
    ?? `https://www.google.com/maps/search/?api=1&query=${shop.lat},${shop.lng}`
  const contacts    = shop.puncture_contacts ?? []
  const hasHours    = shop.hours_regular || shop.hours_evening || shop.hours_friday || shop.hours_saturday
  const legacyPhone = contacts.length === 0 ? shop.phone : null
  const legacyHours = !hasHours ? shop.hours : null
  const addressLine = [shop.city, shop.address].filter(Boolean).join(', ')

  return (
    <li
      onClick={onClick}
      className={`border-b border-gray-100 last:border-0 cursor-pointer transition-colors ${
        selected ? 'bg-blue-50 border-r-4 border-r-blue-500' : 'hover:bg-gray-50'
      }`}
    >
      {/* ── Compact row (always visible) ── */}
      <div className="px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-gray-800 text-sm leading-tight flex-1 truncate">
            {shop.name}
          </span>
          {shop.distance_km != null && (
            <span className="flex-shrink-0 text-xs text-blue-600 font-medium">
              {shop.distance_km < 1 ? `${Math.round(shop.distance_km * 1000)}מ׳` : `${shop.distance_km}ק״מ`}
            </span>
          )}
          <span className={`flex-shrink-0 text-xs font-medium px-1.5 py-0.5 rounded-full ${
            shop.openNow ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}>
            {shop.openNow ? 'פתוח' : 'סגור'}
          </span>
          <span className="flex-shrink-0 text-gray-400 text-xs">{selected ? '▲' : '▼'}</span>
        </div>
        {addressLine && (
          <div className="text-xs text-gray-500 mt-0.5 truncate">{addressLine}</div>
        )}
      </div>

      {/* ── Expanded details (only when selected) ── */}
      {selected && (
        <div className="px-3 pb-3 space-y-2">

          {/* Hours — structured */}
          {hasHours && (
            <div className="space-y-0.5 text-xs text-gray-600 bg-gray-50 rounded-lg px-2.5 py-2">
              {shop.hours_regular  && <div className="flex gap-1"><span className="text-gray-400 w-14">א׳–ה׳:</span>{shop.hours_regular}</div>}
              {shop.hours_evening  && <div className="flex gap-1"><span className="text-gray-400 w-14">ערב/לילה:</span>{shop.hours_evening}</div>}
              {shop.hours_friday   && <div className="flex gap-1"><span className="text-gray-400 w-14">שישי:</span>{shop.hours_friday}</div>}
              {shop.hours_saturday && <div className="flex gap-1"><span className="text-gray-400 w-14">מוצש:</span>{shop.hours_saturday}</div>}
            </div>
          )}

          {/* Hours — legacy */}
          {legacyHours && (
            <div className="text-xs text-gray-600 bg-gray-50 rounded-lg px-2.5 py-2">🕐 {legacyHours}</div>
          )}

          {/* Contacts */}
          {contacts.length > 0 && (
            <div className="space-y-1.5">
              {contacts.map((c) => (
                <div key={c.id} className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-800 flex-1 min-w-0 truncate">
                    <span className="font-medium">{c.name}</span>: {c.phone}
                  </span>
                  <a href={`tel:${c.phone}`} onClick={e => e.stopPropagation()}
                    title="התקשר"
                    className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-blue-50 hover:bg-blue-100 transition-colors">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                    </svg>
                  </a>
                  {c.has_whatsapp && (
                    <a href={`https://wa.me/${wa(c.phone)}`} target="_blank" rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()} title="פתח WhatsApp"
                      className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-green-50 hover:bg-green-100 transition-colors">
                      <WaIcon size={14} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Legacy phone */}
          {legacyPhone && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-800 flex-1">{legacyPhone}</span>
              <a href={`tel:${legacyPhone}`} onClick={e => e.stopPropagation()}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-50 hover:bg-blue-100 transition-colors">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
              </a>
              <a href={`https://wa.me/${wa(legacyPhone)}`} target="_blank" rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-green-50 hover:bg-green-100 transition-colors">
                <WaIcon size={14} />
              </a>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Show on map — mobile only */}
            <button
              onClick={e => { e.stopPropagation(); onShowMap() }}
              className="md:hidden inline-flex items-center gap-1 text-xs text-indigo-600 font-medium hover:underline">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="#4f46e5"><path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/></svg>
              הצג במפה
            </button>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="#2563eb"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              Google Maps
            </a>
            <a href={`https://waze.com/ul?ll=${shop.lat},${shop.lng}&navigate=yes`} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-xs text-cyan-600 hover:underline">
              🗺 Waze
            </a>
            <a href={`https://wa.me/?text=${encodeURIComponent(buildShareText(shop))}`} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-xs text-green-600 hover:underline">
              <WaIcon size={11} /> שתף
            </a>
          </div>
        </div>
      )}
    </li>
  )
}

// ─── Suggestion modal ─────────────────────────────────────────────────────────

function SuggestModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: '', city: '', address: '', phone: '', notes: '', submitter_name: '', submitter_phone: '' })
  const [hours,   setHours]   = useState<HoursState>(emptyHours())
  const [sending, setSending] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSending(true); setError(null)
    const hoursParts = [
      hoursToString(hours.regular)  && `א׳-ה׳: ${hoursToString(hours.regular)}`,
      hoursToString(hours.friday)   && `שישי: ${hoursToString(hours.friday)}`,
    ].filter(Boolean).join('\n')
    try {
      const res = await fetch('/api/puncture-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, hours: hoursParts }),
      })
      if (!res.ok) setError((await res.json()).error ?? 'שגיאה')
      else setSent(true)
    } catch { setError('שגיאת רשת') }
    finally { setSending(false) }
  }

  const inp = "mt-0.5 w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"

  return (
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
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
              <div><label className="text-xs font-medium text-gray-700">שם הפנצ׳ריה *</label><input required value={form.name} onChange={e => set('name', e.target.value)} className={inp} /></div>
              <div><label className="text-xs font-medium text-gray-700">עיר *</label><input required value={form.city} onChange={e => set('city', e.target.value)} className={inp} /></div>
            </div>
            <div><label className="text-xs font-medium text-gray-700">כתובת *</label><input required value={form.address} onChange={e => set('address', e.target.value)} className={inp} /></div>
            <div><label className="text-xs font-medium text-gray-700">טלפון</label><input value={form.phone} onChange={e => set('phone', e.target.value)} className={inp} /></div>
            <div>
              <label className="text-xs font-medium text-gray-700">שעות פעילות</label>
              <div className="mt-1.5">
                <HoursFields value={hours} onChange={setHours} extended={false} />
              </div>
            </div>
            <div><label className="text-xs font-medium text-gray-700">הערות</label><textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} className={inp + ' resize-none'} /></div>
            <div className="border-t pt-3 grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium text-gray-700">שם המציע</label><input value={form.submitter_name} onChange={e => set('submitter_name', e.target.value)} className={inp} /></div>
              <div><label className="text-xs font-medium text-gray-700">טלפון</label><input value={form.submitter_phone} onChange={e => set('submitter_phone', e.target.value)} className={inp} /></div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={sending} className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
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
  const [regionFilter, setRegionFilter] = useState<Region | ''>('')
  // toggle: false = הכל, true = פתוח כרגע
  const [openNowOnly, setOpenNowOnly] = useState(false)
  // mobile: 'list' or 'map'
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list')
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

  const enriched = useMemo<EnrichedShop[]>(() =>
    allShops.map(s => ({ ...s, openNow: isOpenNow(s), region: getRegion(s.lat) })),
    [allShops]
  )

  const displayed = useMemo(() =>
    enriched
      .filter(s => !regionFilter || s.region === regionFilter)
      .filter(s => !openNowOnly || s.openNow),
    [enriched, regionFilter, openNowOnly]
  )

  const openCount = useMemo(() => enriched.filter(s => s.openNow).length, [enriched])

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
    <div dir="rtl" className="h-[100dvh] flex flex-col bg-gray-50 overflow-hidden">

      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0 z-10">
        <div className="flex items-center gap-2 px-3 py-2">
          <a href="/" className="text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none" title="חזרה לדף הראשי">←</a>
          <h1 className="text-base font-bold text-gray-800 whitespace-nowrap">🔧 פנצ׳ריות לילה</h1>
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="חיפוש לפי שם, עיר..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0" />
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar — RIGHT on desktop / full-screen on mobile when mobileView='list' ── */}
        <aside className={`
          w-full md:w-72 bg-white md:border-l border-gray-200 flex flex-col flex-shrink-0 overflow-hidden
          ${mobileView === 'list' ? 'flex' : 'hidden'} md:flex
        `}>

          {/* Filter strip */}
          <div className="flex-shrink-0 border-b border-gray-200 px-3 py-2 space-y-2">

            {/* Row 1: region + nearby button */}
            <div className="flex gap-2">
              <select
                value={regionFilter}
                onChange={e => setRegionFilter(e.target.value as Region | '')}
                className="flex-1 border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-0"
              >
                <option value="">כל האזורים</option>
                {REGIONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <button onClick={handleNearby} disabled={geoLoading}
                title="הקרוב אלי"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap flex-shrink-0">
                {geoLoading
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <svg viewBox="0 0 24 24" width="15" height="15" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>}
                <span className="hidden sm:inline">הקרוב אלי</span>
              </button>
            </div>

            {/* Row 2: open-now toggle + count */}
            <div className="flex items-center justify-between">
              <button
                role="switch"
                aria-checked={openNowOnly}
                onClick={() => setOpenNowOnly(p => !p)}
                className="flex items-center gap-2"
              >
                <div className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${openNowOnly ? 'bg-green-500' : 'bg-gray-300'}`}>
                  <span
                    className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200"
                    style={{ transform: openNowOnly ? 'translateX(18px)' : 'translateX(2px)' }}
                  />
                </div>
                <span className="text-xs text-gray-700 select-none">
                  {openNowOnly ? `פתוח כרגע (${openCount})` : 'פתוח כרגע'}
                </span>
              </button>
              <span className="text-xs text-gray-400">
                {loading ? 'טוען...' : `${displayed.length} תוצאות`}
              </span>
            </div>

            {geoError && <p className="text-xs text-red-600">{geoError}</p>}
          </div>

          {/* Scrollable list */}
          {displayed.length === 0 && !loading ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm px-4 text-center">
              {openNowOnly ? 'אין פנצ׳ריות פתוחות כרגע' : 'לא נמצאו פנצ׳ריות'}
            </div>
          ) : (
            <ul className="flex-1 overflow-y-auto min-h-0">
              {displayed.map(shop => (
                <ShopCard
                  key={shop.id}
                  shop={shop}
                  selected={shop.id === selectedId}
                  onClick={() => setSelectedId(prev => prev === shop.id ? null : shop.id)}
                  onShowMap={() => { setSelectedId(shop.id); setMobileView('map') }}
                />
              ))}
            </ul>
          )}

          {/* Bottom spacer for mobile fixed nav bar */}
          <div className="flex-shrink-0 pb-[84px] md:pb-0" />
        </aside>

        {/* Map — LEFT on desktop / full-screen on mobile when mobileView='map' ── */}
        <div className={`relative flex-1 min-w-0 ${mobileView === 'map' ? 'flex' : 'hidden'} md:flex`}>
          <MapView shops={displayed} selectedId={selectedId} onSelectShop={setSelectedId} visible={mobileView === 'map'} />

          <button
            onClick={handleNearby}
            disabled={geoLoading}
            title="הקרוב אלי"
            className="absolute z-[1000] w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-50 disabled:opacity-60 transition-colors"
            style={{ bottom: 'calc(env(safe-area-inset-bottom) + 140px)', left: 12 }}
          >
            {geoLoading
              ? <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              : <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
                  <circle cx="12" cy="12" r="8" strokeDasharray="3 2"/>
                </svg>
            }
          </button>
        </div>
      </div>

      {/* ── Mobile bottom nav — fixed to bottom ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-[500] flex flex-col border-t border-gray-200 bg-white"
           style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>

        {/* Tab buttons */}
        <div className="flex">
          {([
            { view: 'list', label: 'רשימה', icon: (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            )},
            { view: 'map', label: 'מפה', icon: (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
                <line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
              </svg>
            )},
          ] as const).map(({ view, label, icon }) => (
            <button key={view} onClick={() => setMobileView(view)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1 text-xs font-medium transition-colors ${
                mobileView === view ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              {icon}{label}
            </button>
          ))}
        </div>

        {/* Footer links — 2 centered rows */}
        <div className="w-full text-center border-t border-gray-100 pt-0.5 pb-1 leading-none">
          <div className="text-[10px] text-gray-400">
            <a href="/privacy"        className="hover:text-gray-600">פרטיות</a>
            {' · '}
            <a href="/accessibility"  className="hover:text-gray-600">נגישות</a>
            {' · '}
            <a href="/admin/punctures" className="hover:text-gray-600">כניסה לעריכה</a>
          </div>
          <button onClick={() => setShowSuggest(true)}
            className="text-[10px] text-blue-500 hover:text-blue-700 mt-0.5">+ הצע מקום חדש</button>
        </div>

      </nav>

      {/* ── Public footer (desktop) ── */}
      <footer className="hidden md:flex flex-shrink-0 items-center justify-center gap-3 py-1 border-t border-gray-200 bg-white text-xs text-gray-400">
        <button onClick={() => setShowSuggest(true)}
          className="text-blue-500 hover:text-blue-700 hover:underline">+ הצע מקום חדש</button>
        <span>·</span>
        <a href="/privacy"       className="hover:text-gray-600 hover:underline">פרטיות</a>
        <span>·</span>
        <a href="/accessibility" className="hover:text-gray-600 hover:underline">נגישות</a>
        <span>·</span>
        <a href="/admin/punctures" className="hover:text-gray-600 hover:underline">כניסה לעריכה</a>
      </footer>

      {showSuggest && <SuggestModal onClose={() => setShowSuggest(false)} />}
    </div>
  )
}
