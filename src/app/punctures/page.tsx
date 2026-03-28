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

export default function PuncturesPage() {
  const [shops, setShops] = useState<PunctureShop[]>([])
  const [loading, setLoading] = useState(true)
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selectedRef = useRef<HTMLLIElement>(null)

  // Initial load: all shops
  const fetchAll = useCallback(async (q: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/punctures${q ? `?q=${encodeURIComponent(q)}` : ''}`)
      const data: PunctureShop[] = await res.json()
      setShops(data)
      setSelectedId(null)
    } catch {
      setShops([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll('')
  }, [fetchAll])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => fetchAll(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery, fetchAll])

  // Scroll selected item into view
  useEffect(() => {
    selectedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [selectedId])

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
          const res = await fetch(
            `/api/punctures/nearby?lat=${coords.latitude}&lng=${coords.longitude}`
          )
          const data: PunctureShop[] = await res.json()
          setShops(data)
          setSearchQuery('')
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
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <h1 className="text-xl font-bold text-gray-800 mb-3">פנצ׳ריות לילה</h1>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="חיפוש לפי שם או עיר..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleNearby}
            disabled={geoLoading}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {geoLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>📍</span>
            )}
            הקרוב אלי
          </button>
        </div>
        {geoError && (
          <p className="mt-2 text-sm text-red-600">{geoError}</p>
        )}
      </header>

      {/* Body: map + list */}
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
        {/* Map */}
        <div className="flex-1 p-3">
          <MapView
            shops={shops}
            selectedId={selectedId}
            onSelectShop={setSelectedId}
          />
        </div>

        {/* List */}
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="px-4 py-2 border-b border-gray-100 text-sm text-gray-500">
            {loading ? 'טוען...' : `${shops.length} תוצאות`}
          </div>
          {shops.length === 0 && !loading ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm px-4 text-center">
              לא נמצאו פנצ׳ריות
            </div>
          ) : (
            <ul className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {shops.map((shop) => (
                <li
                  key={shop.id}
                  ref={shop.id === selectedId ? selectedRef : null}
                  onClick={() => setSelectedId(shop.id)}
                  className={`px-4 py-3 cursor-pointer transition-colors ${
                    shop.id === selectedId
                      ? 'bg-blue-50 border-r-4 border-blue-500'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-gray-800 text-sm">{shop.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{shop.address}</div>
                  {shop.hours && (
                    <div className="text-xs text-gray-500 mt-0.5">🕐 {shop.hours}</div>
                  )}
                  {shop.phone && (
                    <a
                      href={`tel:${shop.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-blue-600 mt-0.5 block hover:underline"
                    >
                      📞 {shop.phone}
                    </a>
                  )}
                  {shop.distance_km !== undefined && (
                    <div className="text-xs text-green-600 mt-1 font-medium">
                      {shop.distance_km < 1
                        ? `${Math.round(shop.distance_km * 1000)} מ׳`
                        : `${shop.distance_km} ק״מ`}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  )
}
