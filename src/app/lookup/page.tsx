'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getDistricts, District } from '@/lib/districts'

interface VehicleData {
  plate: number
  manufacturer: string
  model: string
  model_name: string
  year: number
  color: string
  front_tire: string
  rear_tire: string
}

interface WheelFitment {
  bolt_count: number
  bolt_spacing: number
  pcd: string
  center_bore?: number
  rim_sizes_allowed?: number[]
  source_url?: string
}

// Extract rim size from tire string (e.g., "195/60R15" -> 15)
function extractRimSize(tire: string | null | undefined): number | null {
  if (!tire) return null
  const match = tire.match(/R(\d+)/i)
  return match ? parseInt(match[1]) : null
}

interface LookupResponse {
  success: boolean
  vehicle: VehicleData
  wheel_fitment: WheelFitment | null
  pcd_found: boolean
  error?: string
}

export default function VehicleLookupPage() {
  const [plate, setPlate] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<LookupResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [districts, setDistricts] = useState<District[]>([])
  const [districtFilter, setDistrictFilter] = useState<string>('')

  useEffect(() => {
    const fetchDistrictsData = async () => {
      try {
        const districtsData = await getDistricts()
        setDistricts(districtsData)
      } catch (err) {
        console.error('Error fetching districts:', err)
      }
    }
    fetchDistrictsData()
  }, [])

  const handleSearch = async () => {
    if (!plate.trim()) {
      setError('נא להזין מספר רישוי')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`/api/vehicle/lookup?plate=${encodeURIComponent(plate)}`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'שגיאה בחיפוש')
        return
      }

      setResult(data)
    } catch {
      setError('שגיאה בחיבור לשרת')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              חיפוש גלגל לפי מספר רישוי
            </h1>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              חזרה לתחנות
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Search Box */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  מספר רישוי
                </label>
                <input
                  type="text"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="לדוגמה: 12-345-67"
                  className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-center tracking-widest"
                  style={{ direction: 'ltr' }}
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      מחפש...
                    </span>
                  ) : 'חפש'}
                </button>
              </div>
            </div>

            {/* District Filter */}
            {districts.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  סנן לפי מחוז (אופציונלי)
                </label>
                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  <option value="">כל המחוזות</option>
                  {districts.map((district) => (
                    <option key={district.code} value={district.code}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Vehicle Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="15" cy="17" r="2"/></svg>
                פרטי הרכב
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm text-gray-500">יצרן</span>
                  <p className="font-medium">{result.vehicle.manufacturer}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">דגם</span>
                  <p className="font-medium">{result.vehicle.model}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">שנה</span>
                  <p className="font-medium">{result.vehicle.year}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">צבע</span>
                  <p className="font-medium">{result.vehicle.color}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">צמיג קדמי</span>
                  <p className="font-medium" style={{ direction: 'ltr' }}>{result.vehicle.front_tire}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">צמיג אחורי</span>
                  <p className="font-medium" style={{ direction: 'ltr' }}>{result.vehicle.rear_tire}</p>
                </div>
              </div>
            </div>

            {/* Wheel Fitment */}
            {result.wheel_fitment ? (
              <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="20 6 9 17 4 12"/></svg>
                  נמצא! מידות גלגל מתאימות
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-4 text-center shadow">
                    <span className="text-sm text-gray-500">PCD</span>
                    <p className="text-2xl font-bold text-green-700">{result.wheel_fitment.pcd}</p>
                  </div>
                  {result.wheel_fitment.center_bore && (
                    <div className="bg-white rounded-xl p-4 text-center shadow">
                      <span className="text-sm text-gray-500">CB</span>
                      <p className="text-2xl font-bold text-purple-600">{result.wheel_fitment.center_bore}</p>
                    </div>
                  )}
                  <div className="bg-white rounded-xl p-4 text-center shadow">
                    <span className="text-sm text-gray-500">גודל נוכחי</span>
                    <p className="text-2xl font-bold text-blue-600">
                      {extractRimSize(result.vehicle.front_tire) || '—'}"
                    </p>
                  </div>
                </div>

                {/* Allowed sizes */}
                {result.wheel_fitment.rim_sizes_allowed && result.wheel_fitment.rim_sizes_allowed.length > 0 && (
                  <div className="mt-4 bg-green-100 rounded-xl p-4 text-center">
                    <span className="text-sm text-green-700">גדלים מותרים לרכב:</span>
                    <p className="text-lg font-bold text-green-800 mt-1">
                      {result.wheel_fitment.rim_sizes_allowed.join('" / ')}"
                    </p>
                  </div>
                )}

                {/* Source link */}
                {result.wheel_fitment.source_url && (
                  <div className="mt-3 text-center">
                    <a
                      href={result.wheel_fitment.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> אמת מידות באתר המקור
                    </a>
                  </div>
                )}

                {/* Search Link */}
                <div className="mt-6 text-center">
                  <Link
                    href={`/search?bolt_count=${result.wheel_fitment.bolt_count}&bolt_spacing=${result.wheel_fitment.bolt_spacing}${extractRimSize(result.vehicle.front_tire) ? `&rim_size=${extractRimSize(result.vehicle.front_tire)}` : ''}${districtFilter ? `&district=${districtFilter}` : ''}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    חפש גלגלים מתאימים במלאי
                    {districtFilter && districts.find(d => d.code === districtFilter) && (
                      <span className="text-sm opacity-90">
                        ({districts.find(d => d.code === districtFilter)?.name})
                      </span>
                    )}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-yellow-800 mb-2 flex items-center gap-2">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  לא נמצאו מידות גלגל
                </h2>
                <p className="text-yellow-700">
                  הדגם {result.vehicle.manufacturer} {result.vehicle.model} {result.vehicle.year} לא נמצא במאגר שלנו.
                </p>
                <p className="text-yellow-600 text-sm mt-2">
                  ניתן לחפש ידנית באתר wheel-size.com או לפנות למנהל התחנה.
                </p>
                <div className="mt-4">
                  <a
                    href="https://www.wheel-size.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                  >
                    חפש ב-wheel-size.com
                    <span>↗</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        {!result && !loading && (
          <div className="bg-gray-50 rounded-2xl p-6 text-center">
            <p className="text-gray-600 mb-4">
              הזן מספר רישוי של הרכב כדי לקבל את מידות הגלגל המתאימות
            </p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>• המערכת מחפשת במאגר משרד התחבורה</p>
              <p>• תומך במספרי רישוי עם או בלי מקפים</p>
              <p>• לדוגמה: 5765111 או 57-651-11</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
