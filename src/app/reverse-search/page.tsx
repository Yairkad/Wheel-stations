'use client'

import { useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { VERSION } from '@/lib/version'
import { hebrewToEnglishMakes, hebrewToEnglishModels } from '@/lib/vehicle-mappings'

interface VehicleResult {
  vehicle: {
    manufacturer: string
    model: string
    year: number
    front_tire: string | null
  }
  wheel_fitment: {
    pcd: string
    bolt_count: number
    bolt_spacing: number
    center_bore?: number
    rim_sizes_allowed?: number[]
  } | null
  source?: string
}

interface ReverseResult {
  id: string
  make: string
  make_he?: string | null
  model: string
  variants?: string | null
  year_from?: number | null
  year_to?: number | null
  bolt_count: number
  bolt_spacing: number
  center_bore?: number | null
  rim_size?: string | null
  rim_sizes_allowed?: number[] | null
  cb_difference: number | null
  match_level: 'exact' | 'with_ring' | 'technical'
}

interface CompareVehicleState {
  tab: 'plate' | 'model'
  plate: string
  make: string
  model: string
  year: string
  result: VehicleResult | null
  loading: boolean
  error: string | null
}

interface CompareOutcome {
  pcdMatch: boolean
  cbLevel: 'exact' | 'with_ring' | 'no_fit' | 'unknown'
  cbDiff: number | null
  rimOverlap: boolean
  commonRimSizes: number[]
  overall: 'compatible' | 'with_ring' | 'incompatible'
}

interface ReverseSearchResponse {
  results: ReverseResult[]
  grouped: Record<string, ReverseResult[]>
  total: number
  counts: {
    exact: number
    with_ring: number
    technical: number
  }
}

export default function ReverseSearchPage() {
  // Search tab state
  const [searchTab, setSearchTab] = useState<'plate' | 'model'>('plate')

  // Plate search state
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [vehicleLoading, setVehicleLoading] = useState(false)
  const [vehicleError, setVehicleError] = useState<string | null>(null)
  const [vehicleResult, setVehicleResult] = useState<VehicleResult | null>(null)

  // Model search state
  const [modelSearchMake, setModelSearchMake] = useState('')
  const [modelSearchModel, setModelSearchModel] = useState('')
  const [modelSearchYear, setModelSearchYear] = useState('')
  const [modelSearchLoading, setModelSearchLoading] = useState(false)
  const [modelMakeSuggestions, setModelMakeSuggestions] = useState<string[]>([])
  const [modelModelSuggestions, setModelModelSuggestions] = useState<string[]>([])
  const [showModelMakeSuggestions, setShowModelMakeSuggestions] = useState(false)
  const [showModelModelSuggestions, setShowModelModelSuggestions] = useState(false)
  const [modelSearchErrors, setModelSearchErrors] = useState<{make: boolean, model: boolean, year: boolean}>({make: false, model: false, year: false})

  // Reverse search results
  const [reverseResults, setReverseResults] = useState<ReverseSearchResponse | null>(null)
  const [reverseLoading, setReverseLoading] = useState(false)
  const [showTechnical, setShowTechnical] = useState(false)

  // Page mode
  const [pageMode, setPageMode] = useState<'reverse' | 'compare'>('reverse')

  // Compare mode vehicles
  const emptyVehicle: CompareVehicleState = { tab: 'plate', plate: '', make: '', model: '', year: '', result: null, loading: false, error: null }
  const [cmpA, setCmpA] = useState<CompareVehicleState>(emptyVehicle)
  const [cmpB, setCmpB] = useState<CompareVehicleState>(emptyVehicle)

  // Autocomplete functions
  const fetchMakeSuggestions = async (value: string) => {
    if (value.length < 2) {
      setModelMakeSuggestions([])
      return
    }
    const englishValue = hebrewToEnglishMakes[value] || value
    try {
      const response = await fetch(`/api/vehicle-models?make=${encodeURIComponent(englishValue)}`)
      const data = await response.json()
      const suggestions: string[] = []
      const seen = new Set<string>()
      data.vehicles?.forEach((v: any) => {
        if (v.make && !seen.has(v.make.toLowerCase())) {
          seen.add(v.make.toLowerCase())
          const hebrewName = Object.entries(hebrewToEnglishMakes).find(([, eng]) => eng.toLowerCase() === v.make.toLowerCase())?.[0]
          suggestions.push(hebrewName ? `${v.make} (${hebrewName})` : v.make)
        }
      })
      Object.entries(hebrewToEnglishMakes).forEach(([he, en]) => {
        if ((he.includes(value) || en.toLowerCase().includes(value.toLowerCase())) && !seen.has(en.toLowerCase())) {
          seen.add(en.toLowerCase())
          suggestions.push(`${en} (${he})`)
        }
      })
      setModelMakeSuggestions(suggestions.slice(0, 8))
    } catch {
      setModelMakeSuggestions([])
    }
  }

  const fetchModelSuggestions = async (make: string, value: string) => {
    if (value.length < 2 || !make) {
      setModelModelSuggestions([])
      return
    }
    const englishMake = make.includes('(') ? make.split(' (')[0] : (hebrewToEnglishMakes[make] || make)
    const englishModel = hebrewToEnglishModels[value] || value
    try {
      const response = await fetch(`/api/vehicle-models?make=${encodeURIComponent(englishMake)}&model=${encodeURIComponent(englishModel)}`)
      const data = await response.json()
      const suggestions: string[] = []
      const seen = new Set<string>()
      data.models?.forEach((v: any) => {
        if (v.model && !seen.has(v.model.toLowerCase())) {
          seen.add(v.model.toLowerCase())
          const hebrewName = Object.entries(hebrewToEnglishModels).find(([, eng]) => eng.toLowerCase() === v.model.toLowerCase())?.[0]
          suggestions.push(hebrewName ? `${v.model} (${hebrewName})` : v.model)
        }
      })
      setModelModelSuggestions(suggestions.slice(0, 8))
    } catch {
      setModelModelSuggestions([])
    }
  }

  // Perform reverse search
  const doReverseSearch = async (bolt_count: number, bolt_spacing: number, center_bore?: number, rim_size?: number) => {
    setReverseLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('bolt_count', bolt_count.toString())
      params.set('bolt_spacing', bolt_spacing.toString())
      if (center_bore) params.set('center_bore', center_bore.toString())
      if (rim_size) params.set('rim_size', rim_size.toString())

      const response = await fetch(`/api/vehicle-models/reverse-search?${params}`)
      if (!response.ok) throw new Error('שגיאה בחיפוש')
      const data: ReverseSearchResponse = await response.json()
      setReverseResults(data)
    } catch {
      toast.error('שגיאה בחיפוש רכבים תואמים')
    } finally {
      setReverseLoading(false)
    }
  }

  // Handle plate lookup
  const handleVehicleLookup = async () => {
    if (!vehiclePlate.trim()) {
      toast.error('נא להזין מספר רישוי')
      return
    }
    setVehicleLoading(true)
    setVehicleError(null)
    setVehicleResult(null)
    setReverseResults(null)

    try {
      const response = await fetch(`/api/vehicle/lookup?plate=${encodeURIComponent(vehiclePlate)}`)
      const data = await response.json()
      if (!response.ok) {
        setVehicleError(data.error || 'שגיאה בחיפוש')
        return
      }
      setVehicleResult(data)
      if (data.wheel_fitment) {
        const defaultRim = data.wheel_fitment.rim_sizes_allowed?.[0]
        await doReverseSearch(
          data.wheel_fitment.bolt_count,
          data.wheel_fitment.bolt_spacing,
          data.wheel_fitment.center_bore,
          defaultRim
        )
      } else {
        setVehicleError('לא נמצאו מידות גלגל לרכב זה')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'בעיה בתקשורת עם השרת'
      setVehicleError(`שגיאה בחיבור לשרת: ${errorMessage}`)
    } finally {
      setVehicleLoading(false)
    }
  }

  // Handle model search
  const handleModelSearch = async () => {
    const errors = {
      make: !modelSearchMake.trim(),
      model: !modelSearchModel.trim(),
      year: !modelSearchYear.trim()
    }
    setModelSearchErrors(errors)
    if (errors.make || errors.model || errors.year) {
      toast.error('נא למלא יצרן, דגם ושנה', { id: 'model-search-validation' })
      return
    }

    setModelSearchLoading(true)
    setVehicleError(null)
    setVehicleResult(null)
    setReverseResults(null)
    setShowModelMakeSuggestions(false)
    setShowModelModelSuggestions(false)

    const englishMake = modelSearchMake.includes('(') ? modelSearchMake.split(' (')[0] : (hebrewToEnglishMakes[modelSearchMake] || modelSearchMake)
    const englishModel = modelSearchModel.includes('(') ? modelSearchModel.split(' (')[0] : (hebrewToEnglishModels[modelSearchModel] || modelSearchModel)

    try {
      const localResponse = await fetch(
        `/api/vehicle-models?make=${encodeURIComponent(englishMake)}&model=${encodeURIComponent(englishModel)}&year=${modelSearchYear}`
      )
      const localData = await localResponse.json()

      if (localData.models && localData.models.length > 0) {
        const model = localData.models[0]
        const wheelFitment = {
          pcd: `${model.bolt_count}×${model.bolt_spacing}`,
          bolt_count: model.bolt_count,
          bolt_spacing: model.bolt_spacing,
          center_bore: model.center_bore || undefined,
          rim_sizes_allowed: model.rim_sizes_allowed || undefined,
        }
        setVehicleResult({
          vehicle: {
            manufacturer: model.make_he || model.make,
            model: model.model,
            year: parseInt(modelSearchYear),
            front_tire: model.tire_size_front || null
          },
          wheel_fitment: wheelFitment,
          source: 'local_db'
        })
        const defaultRim = wheelFitment.rim_sizes_allowed?.[0] || (model.rim_size ? parseInt(model.rim_size) : undefined)
        await doReverseSearch(
          wheelFitment.bolt_count,
          wheelFitment.bolt_spacing,
          wheelFitment.center_bore,
          defaultRim
        )
      } else {
        setVehicleError('לא נמצאו מידות גלגל לדגם זה')
      }
    } catch {
      setVehicleError('שגיאה בחיפוש')
    } finally {
      setModelSearchLoading(false)
    }
  }

  const getMatchLevelStyle = (level: string): React.CSSProperties => {
    switch (level) {
      case 'exact':
        return { background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.4)', color: '#22c55e' }
      case 'with_ring':
        return { background: 'rgba(251, 191, 36, 0.15)', border: '1px solid rgba(251, 191, 36, 0.4)', color: '#fbbf24' }
      case 'technical':
        return { background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#ef4444' }
      default:
        return {}
    }
  }

  const getMatchLevelLabel = (level: string) => {
    switch (level) {
      case 'exact': return 'התאמה מלאה'
      case 'with_ring': return 'מומלץ טבעת התאמה'
      case 'technical': return 'התאמה טכנית בלבד'
      default: return ''
    }
  }

  // Generic vehicle lookup helper (plate or model)
  const lookupVehicleFitment = async (v: CompareVehicleState): Promise<VehicleResult> => {
    if (v.tab === 'plate') {
      const res = await fetch(`/api/vehicle/lookup?plate=${encodeURIComponent(v.plate.trim())}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'שגיאה בחיפוש')
      if (!data.wheel_fitment) throw new Error('לא נמצאו מידות גלגל לרכב זה')
      return data
    } else {
      const englishMake = v.make.includes('(') ? v.make.split(' (')[0] : (hebrewToEnglishMakes[v.make] || v.make)
      const englishModel = v.model.includes('(') ? v.model.split(' (')[0] : (hebrewToEnglishModels[v.model] || v.model)
      const res = await fetch(`/api/vehicle-models?make=${encodeURIComponent(englishMake)}&model=${encodeURIComponent(englishModel)}&year=${v.year}`)
      const data = await res.json()
      if (!data.models?.length) throw new Error('לא נמצאו מידות גלגל לדגם זה')
      const m = data.models[0]
      return {
        vehicle: { manufacturer: m.make_he || m.make, model: m.model, year: parseInt(v.year), front_tire: m.tire_size_front || null },
        wheel_fitment: {
          pcd: `${m.bolt_count}×${m.bolt_spacing}`,
          bolt_count: m.bolt_count, bolt_spacing: m.bolt_spacing,
          center_bore: m.center_bore || undefined,
          rim_sizes_allowed: m.rim_sizes_allowed || undefined,
        },
        source: 'local_db'
      }
    }
  }

  const handleLookupCompareVehicle = async (which: 'A' | 'B') => {
    const v = which === 'A' ? cmpA : cmpB
    const set = which === 'A' ? setCmpA : setCmpB
    if (v.tab === 'plate' && !v.plate.trim()) { set(prev => ({...prev, error: 'נא להזין מספר רישוי'})); return }
    if (v.tab === 'model' && (!v.make.trim() || !v.model.trim() || !v.year.trim())) { set(prev => ({...prev, error: 'נא למלא יצרן, דגם ושנה'})); return }
    set(prev => ({...prev, loading: true, error: null, result: null}))
    try {
      const result = await lookupVehicleFitment(v)
      set(prev => ({...prev, result}))
    } catch (err) {
      set(prev => ({...prev, error: err instanceof Error ? err.message : 'שגיאה בחיפוש'}))
    } finally {
      set(prev => ({...prev, loading: false}))
    }
  }

  // Calculate compare outcome when both vehicles are loaded
  const getCompareOutcome = (): CompareOutcome | null => {
    const fitA = cmpA.result?.wheel_fitment
    const fitB = cmpB.result?.wheel_fitment
    if (!fitA || !fitB) return null

    const pcdMatch = fitA.bolt_count === fitB.bolt_count && fitA.bolt_spacing === fitB.bolt_spacing
    let cbLevel: CompareOutcome['cbLevel'] = 'unknown'
    let cbDiff: number | null = null
    if (fitA.center_bore && fitB.center_bore) {
      cbDiff = Math.round((fitB.center_bore - fitA.center_bore) * 10) / 10
      if (cbDiff < -0.5) cbLevel = 'no_fit'
      else if (Math.abs(cbDiff) <= 0.5) cbLevel = 'exact'
      else if (cbDiff <= 3) cbLevel = 'with_ring'
      else cbLevel = 'no_fit'
    }
    const rimA = fitA.rim_sizes_allowed || []
    const rimB = fitB.rim_sizes_allowed || []
    const commonRimSizes = rimA.filter(r => rimB.includes(r))
    const rimOverlap = rimA.length === 0 || rimB.length === 0 || commonRimSizes.length > 0

    let overall: CompareOutcome['overall'] = 'incompatible'
    if (pcdMatch && (cbLevel === 'exact' || cbLevel === 'unknown')) overall = 'compatible'
    else if (pcdMatch && cbLevel === 'with_ring') overall = 'with_ring'

    return { pcdMatch, cbLevel, cbDiff, rimOverlap, commonRimSizes, overall }
  }

  const handleReset = () => {
    setVehicleResult(null)
    setReverseResults(null)
    setVehicleError(null)
    setVehiclePlate('')
    setModelSearchMake('')
    setModelSearchModel('')
    setModelSearchYear('')
    setShowTechnical(false)
  }

  const isLoading = vehicleLoading || modelSearchLoading || reverseLoading

  // Filter results based on showTechnical toggle
  const filteredResults = reverseResults
    ? showTechnical
      ? reverseResults.results
      : reverseResults.results.filter(r => r.match_level !== 'technical')
    : []

  // Group filtered results by make
  const groupedFiltered: Record<string, ReverseResult[]> = {}
  for (const vehicle of filteredResults) {
    const make = vehicle.make_he || vehicle.make
    if (!groupedFiltered[make]) groupedFiltered[make] = []
    groupedFiltered[make].push(vehicle)
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>חיפוש הפוך</h1>
        <p style={styles.subtitle}>
          מצא אילו רכבים יכולים להשאיל לך גלגל עם התאמה מלאה
        </p>
        <div style={styles.betaBadge}>BETA</div>
      </div>

      {/* Mode Switcher */}
      <div style={{ display: 'flex', gap: '8px', maxWidth: '600px', margin: '0 auto 16px', width: '100%' }}>
        <button
          onClick={() => setPageMode('reverse')}
          style={{
            flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.9rem',
            background: pageMode === 'reverse' ? '#f59e0b' : 'rgba(255,255,255,0.1)',
            color: pageMode === 'reverse' ? '#000' : '#9ca3af'
          }}
        >
          🔍 חיפוש הפוך
        </button>
        <button
          onClick={() => setPageMode('compare')}
          style={{
            flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.9rem',
            background: pageMode === 'compare' ? '#f59e0b' : 'rgba(255,255,255,0.1)',
            color: pageMode === 'compare' ? '#000' : '#9ca3af'
          }}
        >
          ⚖️ השוואה מיידית
        </button>
      </div>

      {/* Compare Mode */}
      {pageMode === 'compare' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
          {/* Vehicle A */}
          {(['A', 'B'] as const).map(which => {
            const v = which === 'A' ? cmpA : cmpB
            const set = which === 'A' ? setCmpA : setCmpB
            const label = which === 'A' ? 'רכב א׳ (שלי)' : 'רכב ב׳ (התורם)'
            return (
              <div key={which} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontWeight: 700, marginBottom: '10px', color: which === 'A' ? '#60a5fa' : '#34d399' }}>
                  {label}
                </div>
                {/* Mini tabs */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                  {(['plate', 'model'] as const).map(t => (
                    <button key={t} onClick={() => set(prev => ({...prev, tab: t, result: null, error: null}))}
                      style={{ padding: '4px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                        background: v.tab === t ? 'rgba(255,255,255,0.2)' : 'transparent', color: v.tab === t ? 'white' : '#6b7280' }}>
                      {t === 'plate' ? 'לוחית רישוי' : 'יצרן ודגם'}
                    </button>
                  ))}
                </div>
                {/* Input */}
                {v.tab === 'plate' ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="text" inputMode="numeric" value={v.plate}
                      onChange={e => set(prev => ({...prev, plate: e.target.value, result: null}))}
                      onKeyDown={e => e.key === 'Enter' && handleLookupCompareVehicle(which)}
                      placeholder="מספר רישוי..." style={{...styles.input, flex: 1}} dir="ltr" />
                    <button onClick={() => handleLookupCompareVehicle(which)} disabled={v.loading} style={styles.searchBtn}>
                      {v.loading ? <span className="spinning-wheel">🛞</span> : '🔍'}
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <input type="text" value={v.make} onChange={e => set(prev => ({...prev, make: e.target.value, result: null}))}
                      placeholder="יצרן (Toyota / טויוטה)" style={styles.input} />
                    <input type="text" value={v.model} onChange={e => set(prev => ({...prev, model: e.target.value, result: null}))}
                      placeholder="דגם (Corolla / קורולה)" style={styles.input} />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input type="text" inputMode="numeric" value={v.year} onChange={e => set(prev => ({...prev, year: e.target.value, result: null}))}
                        placeholder="שנה" style={{...styles.input, flex: 1}} dir="ltr" />
                      <button onClick={() => handleLookupCompareVehicle(which)} disabled={v.loading} style={styles.searchBtn}>
                        {v.loading ? <span className="spinning-wheel">🛞</span> : '🔍'}
                      </button>
                    </div>
                  </div>
                )}
                {/* Error */}
                {v.error && <p style={{ color: '#f87171', fontSize: '0.85rem', margin: '6px 0 0' }}>{v.error}</p>}
                {/* Found */}
                {v.result && (
                  <div style={{ marginTop: '8px', padding: '8px 10px', background: 'rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600, color: '#e2e8f0' }}>
                      {v.result.vehicle.manufacturer} {v.result.vehicle.model} {v.result.vehicle.year}
                    </span>
                    {v.result.wheel_fitment && (
                      <span style={{ color: '#9ca3af', marginRight: '8px' }}>
                        PCD {v.result.wheel_fitment.pcd}
                        {v.result.wheel_fitment.center_bore ? ` · CB ${v.result.wheel_fitment.center_bore}` : ''}
                        {v.result.wheel_fitment.rim_sizes_allowed?.length ? ` · R${v.result.wheel_fitment.rim_sizes_allowed.join('/')}` : ''}
                      </span>
                    )}
                    <button onClick={() => set(prev => ({...prev, result: null, plate: '', make: '', model: '', year: ''}))}
                      style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '0.8rem', marginRight: '6px' }}>
                      ✕
                    </button>
                  </div>
                )}
              </div>
            )
          })}

          {/* Compare Result */}
          {(() => {
            const outcome = getCompareOutcome()
            if (!outcome) return null
            const bgColor = outcome.overall === 'compatible' ? 'rgba(16,185,129,0.15)' : outcome.overall === 'with_ring' ? 'rgba(251,191,36,0.15)' : 'rgba(239,68,68,0.15)'
            const borderColor = outcome.overall === 'compatible' ? '#10b981' : outcome.overall === 'with_ring' ? '#fbbf24' : '#ef4444'
            const icon = outcome.overall === 'compatible' ? '✅' : outcome.overall === 'with_ring' ? '🟡' : '❌'
            const title = outcome.overall === 'compatible' ? 'מתאים!' : outcome.overall === 'with_ring' ? 'מתאים עם טבעת מרכוז' : 'לא מתאים'
            return (
              <div style={{ background: bgColor, border: `2px solid ${borderColor}`, borderRadius: '14px', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '6px' }}>{icon}</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: borderColor, marginBottom: '14px' }}>{title}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'right', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#9ca3af' }}>חישוק ברגים (PCD)</span>
                    <span style={{ fontWeight: 600, color: outcome.pcdMatch ? '#10b981' : '#ef4444' }}>
                      {outcome.pcdMatch ? `✓ זהה (${cmpA.result!.wheel_fitment!.pcd})` : `✗ שונה (${cmpA.result!.wheel_fitment!.pcd} vs ${cmpB.result!.wheel_fitment!.pcd})`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#9ca3af' }}>קוטר פנימי (CB)</span>
                    <span style={{ fontWeight: 600, color: outcome.cbLevel === 'exact' ? '#10b981' : outcome.cbLevel === 'with_ring' ? '#fbbf24' : outcome.cbLevel === 'no_fit' ? '#ef4444' : '#9ca3af' }}>
                      {outcome.cbLevel === 'exact' && `✓ זהה${outcome.cbDiff !== null ? ` (${cmpA.result!.wheel_fitment!.center_bore}mm)` : ''}`}
                      {outcome.cbLevel === 'with_ring' && `מומלץ טבעת מרכוז (+${outcome.cbDiff}mm)`}
                      {outcome.cbLevel === 'no_fit' && `✗ לא מתאים (${outcome.cbDiff !== null ? `${outcome.cbDiff}mm` : 'שונה'})`}
                      {outcome.cbLevel === 'unknown' && 'לא ידוע'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#9ca3af' }}>גודל חישוק</span>
                    <span style={{ fontWeight: 600, color: outcome.rimOverlap ? '#10b981' : '#fbbf24' }}>
                      {outcome.rimOverlap
                        ? outcome.commonRimSizes.length > 0 ? `✓ R${outcome.commonRimSizes.join('/')}` : '✓ לא ידוע'
                        : `⚠️ שים לב - גדלים שונים (R${cmpA.result!.wheel_fitment!.rim_sizes_allowed?.join('/')} vs R${cmpB.result!.wheel_fitment!.rim_sizes_allowed?.join('/')})`}
                    </span>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* Search Section */}
      {pageMode === 'reverse' && !vehicleResult && (
        <div style={styles.searchCard}>
          {/* Tabs */}
          <div role="tablist" style={styles.tabBar}>
            <button
              role="tab"
              aria-selected={searchTab === 'plate'}
              onClick={() => { setSearchTab('plate'); setVehicleError(null) }}
              style={{
                ...styles.tab,
                ...(searchTab === 'plate' ? styles.tabActive : {})
              }}
            >
              מספר רכב
            </button>
            <button
              role="tab"
              aria-selected={searchTab === 'model'}
              onClick={() => { setSearchTab('model'); setVehicleError(null) }}
              style={{
                ...styles.tab,
                ...(searchTab === 'model' ? styles.tabActive : {}),
                borderRight: '1px solid #4b5563'
              }}
            >
              יצרן ודגם
            </button>
          </div>

          {/* Plate Search */}
          {searchTab === 'plate' && (
            <div style={styles.inputRow}>
              <input
                type="text"
                inputMode="numeric"
                value={vehiclePlate}
                onChange={e => setVehiclePlate(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleVehicleLookup()}
                placeholder="הזן מספר רישוי..."
                style={styles.input}
                dir="ltr"
                autoFocus
              />
              <button
                onClick={handleVehicleLookup}
                disabled={isLoading}
                style={styles.searchBtn}
              >
                {isLoading ? <span className="spinning-wheel">🛞</span> : '🔍'}
              </button>
            </div>
          )}

          {/* Model Search */}
          {searchTab === 'model' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '0 4px' }}>
              {/* Make Input */}
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type="text"
                  value={modelSearchMake}
                  onChange={e => {
                    setModelSearchMake(e.target.value)
                    fetchMakeSuggestions(e.target.value)
                    setShowModelMakeSuggestions(true)
                    if (modelSearchErrors.make) setModelSearchErrors(prev => ({...prev, make: false}))
                  }}
                  onFocus={() => modelSearchMake.length >= 2 && setShowModelMakeSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowModelMakeSuggestions(false), 200)}
                  placeholder="יצרן - לדוגמה: Toyota או טויוטה"
                  style={{...styles.input, width: '100%', flex: 'none', ...(modelSearchErrors.make && {borderColor: '#ef4444', boxShadow: '0 0 0 1px #ef4444'})}}
                />
                {showModelMakeSuggestions && modelMakeSuggestions.length > 0 && (
                  <div style={styles.suggestionsDropdown}>
                    {modelMakeSuggestions.map((suggestion, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setModelSearchMake(suggestion)
                          setShowModelMakeSuggestions(false)
                          setModelModelSuggestions([])
                        }}
                        style={styles.suggestionItem}
                        onMouseOver={e => (e.currentTarget.style.background = '#374151')}
                        onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Model Input */}
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type="text"
                  value={modelSearchModel}
                  onChange={e => {
                    setModelSearchModel(e.target.value)
                    fetchModelSuggestions(modelSearchMake, e.target.value)
                    setShowModelModelSuggestions(true)
                    if (modelSearchErrors.model) setModelSearchErrors(prev => ({...prev, model: false}))
                  }}
                  onFocus={() => modelSearchModel.length >= 2 && setShowModelModelSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowModelModelSuggestions(false), 200)}
                  placeholder="דגם - לדוגמה: Corolla"
                  style={{...styles.input, width: '100%', flex: 'none', ...(modelSearchErrors.model && {borderColor: '#ef4444', boxShadow: '0 0 0 1px #ef4444'})}}
                />
                {showModelModelSuggestions && modelModelSuggestions.length > 0 && (
                  <div style={styles.suggestionsDropdown}>
                    {modelModelSuggestions.map((suggestion, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setModelSearchModel(suggestion)
                          setShowModelModelSuggestions(false)
                        }}
                        style={styles.suggestionItem}
                        onMouseOver={e => (e.currentTarget.style.background = '#374151')}
                        onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Year Input */}
              <input
                type="text"
                inputMode="numeric"
                value={modelSearchYear}
                onChange={e => {
                  setModelSearchYear(e.target.value.replace(/\D/g, '').slice(0, 4))
                  if (modelSearchErrors.year) setModelSearchErrors(prev => ({...prev, year: false}))
                }}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleModelSearch() } }}
                placeholder="שנה - לדוגמה: 2020"
                style={{...styles.input, ...(modelSearchErrors.year && {borderColor: '#ef4444', boxShadow: '0 0 0 1px #ef4444'})}}
              />
              <button
                onClick={handleModelSearch}
                disabled={isLoading}
                style={{ ...styles.searchBtn, width: '100%', padding: '12px', justifyContent: 'center' }}
              >
                {isLoading ? <span className="spinning-wheel">🛞</span> : 'חפש רכבים תואמים'}
              </button>
            </div>
          )}

          {/* Error */}
          {vehicleError && (
            <div style={styles.errorBox}>
              {vehicleError}
            </div>
          )}
        </div>
      )}

      {/* Vehicle Info + Results */}
      {pageMode === 'reverse' && vehicleResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
          {/* Vehicle Info Card */}
          <div style={styles.vehicleInfoCard}>
            <div style={styles.vehicleInfoTitle}>
              {vehicleResult.vehicle.manufacturer} {vehicleResult.vehicle.model} {vehicleResult.vehicle.year}
            </div>
            {vehicleResult.wheel_fitment && (
              <div style={styles.vehicleSpecs}>
                <span style={styles.specBadge}>PCD: {vehicleResult.wheel_fitment.pcd}</span>
                {vehicleResult.wheel_fitment.center_bore && (
                  <span style={styles.specBadge}>CB: {vehicleResult.wheel_fitment.center_bore}mm</span>
                )}
              </div>
            )}
            <button onClick={handleReset} style={styles.resetBtn}>
              חיפוש חדש
            </button>
          </div>

          {/* Loading */}
          {reverseLoading && (
            <div style={styles.loadingBox}>
              <span className="spinning-wheel" style={{ fontSize: '2rem' }}>🛞</span>
              <p>מחפש רכבים תואמים...</p>
            </div>
          )}

          {/* Results */}
          {reverseResults && !reverseLoading && (
            <>
              {/* Summary */}
              <div style={styles.summaryBar}>
                <span>
                  נמצאו <strong>{filteredResults.length}</strong> דגמים תואמים
                </span>
                {reverseResults.counts.exact > 0 && (
                  <span style={{ color: '#22c55e' }}>
                    {reverseResults.counts.exact} התאמה מלאה
                  </span>
                )}
              </div>

              {/* Toggle technical matches */}
              {reverseResults.counts.technical > 0 && (
                <label style={styles.toggleRow}>
                  <input
                    type="checkbox"
                    checked={showTechnical}
                    onChange={e => setShowTechnical(e.target.checked)}
                  />
                  <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                    הצג גם התאמות טכניות בלבד ({reverseResults.counts.technical})
                  </span>
                </label>
              )}

              {/* Results grouped by make */}
              {filteredResults.length === 0 ? (
                <div style={styles.noResults}>
                  <p>לא נמצאו דגמים תואמים</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {Object.entries(groupedFiltered).map(([make, vehicles]) => (
                    <div key={make} style={styles.makeGroup}>
                      <div style={styles.makeHeader}>
                        {make}
                        <span style={styles.makeCount}>{vehicles.length} דגמים</span>
                      </div>
                      {vehicles.map(vehicle => (
                        <div key={vehicle.id} style={{ ...styles.vehicleRow, ...getMatchLevelStyle(vehicle.match_level) }}>
                          <div style={styles.vehicleRowMain}>
                            <span style={styles.vehicleModel}>{vehicle.model}</span>
                            <span style={styles.vehicleYears}>
                              {vehicle.year_from || '?'} - {vehicle.year_to || 'היום'}
                            </span>
                          </div>
                          <div style={styles.vehicleRowDetails}>
                            <span style={styles.detailBadge}>
                              {vehicle.bolt_count}×{vehicle.bolt_spacing}
                            </span>
                            {vehicle.center_bore && (
                              <span style={styles.detailBadge}>
                                CB: {vehicle.center_bore}
                              </span>
                            )}
                            {vehicle.cb_difference !== null && vehicle.cb_difference !== 0 && (
                              <span style={{ ...styles.detailBadge, color: vehicle.match_level === 'exact' ? '#22c55e' : vehicle.match_level === 'with_ring' ? '#fbbf24' : '#ef4444' }}>
                                {vehicle.cb_difference > 0 ? '+' : ''}{vehicle.cb_difference}mm
                              </span>
                            )}
                            <span style={{
                              ...styles.matchBadge,
                              color: vehicle.match_level === 'exact' ? '#22c55e' : vehicle.match_level === 'with_ring' ? '#fbbf24' : '#ef4444'
                            }}>
                              {getMatchLevelLabel(vehicle.match_level)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={styles.footer}>
        <p style={styles.footerText}>
          <Link href="/login" style={{ color: '#93c5fd', textDecoration: 'none' }}>
            כניסה למערכת
          </Link>
        </p>
        <p style={styles.footerVersion}>v{VERSION}</p>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #374151 0%, #4b5563 100%)',
    color: '#fff',
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    direction: 'rtl',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px',
    padding: '20px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 700,
    marginBottom: '8px',
    color: 'white',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#9ca3af',
    margin: '0 0 12px 0',
  },
  betaBadge: {
    display: 'inline-block',
    background: 'rgba(251, 191, 36, 0.2)',
    border: '1px solid rgba(251, 191, 36, 0.4)',
    color: '#fbbf24',
    padding: '4px 16px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '2px',
  },
  searchCard: {
    background: '#1e293b',
    borderRadius: '16px',
    padding: '16px',
    maxWidth: '450px',
    margin: '0 auto',
    width: '100%',
  },
  tabBar: {
    display: 'flex',
    gap: '0',
    marginBottom: '16px',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #4b5563',
  },
  tab: {
    flex: 1,
    padding: '10px 16px',
    border: 'none',
    background: 'transparent',
    color: '#9ca3af',
    cursor: 'pointer',
    fontWeight: 'normal' as const,
    fontSize: '0.9rem',
    transition: 'all 0.2s',
  },
  tabActive: {
    background: '#3b82f6',
    color: '#fff',
    fontWeight: 'bold' as const,
  },
  inputRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px',
  },
  input: {
    flex: 1,
    padding: '14px 18px',
    borderRadius: '10px',
    border: '2px solid #4a5568',
    background: '#2d3748',
    color: 'white',
    fontSize: '1.2rem',
    textAlign: 'center' as const,
    letterSpacing: '2px',
    outline: 'none',
  },
  searchBtn: {
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white',
    border: 'none',
    padding: '14px 20px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1.2rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  },
  suggestionsDropdown: {
    position: 'absolute' as const,
    top: '100%',
    left: 0,
    right: 0,
    background: '#1f2937',
    border: '1px solid #4b5563',
    borderRadius: '0 0 8px 8px',
    zIndex: 100,
    maxHeight: '200px',
    overflowY: 'auto' as const,
  },
  suggestionItem: {
    padding: '10px 12px',
    cursor: 'pointer',
    borderBottom: '1px solid #374151',
    color: '#fff',
    fontSize: '0.9rem',
  },
  errorBox: {
    background: 'rgba(239, 68, 68, 0.2)',
    color: '#fca5a5',
    padding: '12px',
    borderRadius: '10px',
    textAlign: 'center' as const,
    marginTop: '10px',
  },
  vehicleInfoCard: {
    background: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center' as const,
  },
  vehicleInfoTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#60a5fa',
    marginBottom: '10px',
  },
  vehicleSpecs: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
    marginBottom: '12px',
  },
  specBadge: {
    background: 'rgba(255,255,255,0.1)',
    padding: '4px 12px',
    borderRadius: '6px',
    fontSize: '0.9rem',
    color: '#e2e8f0',
  },
  resetBtn: {
    background: 'transparent',
    border: '1px solid #4b5563',
    color: '#9ca3af',
    padding: '8px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  loadingBox: {
    textAlign: 'center' as const,
    padding: '30px',
    color: '#9ca3af',
  },
  summaryBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '10px',
    fontSize: '0.9rem',
  },
  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    padding: '0 4px',
  },
  noResults: {
    textAlign: 'center' as const,
    padding: '30px',
    color: '#9ca3af',
  },
  makeGroup: {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  makeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.05)',
    fontWeight: 'bold',
    fontSize: '1rem',
    color: '#f59e0b',
  },
  makeCount: {
    fontSize: '0.8rem',
    color: '#9ca3af',
    fontWeight: 'normal' as const,
  },
  vehicleRow: {
    padding: '10px 16px',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '0',
  },
  vehicleRowMain: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  vehicleModel: {
    fontWeight: 600,
    fontSize: '0.95rem',
  },
  vehicleYears: {
    color: '#9ca3af',
    fontSize: '0.8rem',
  },
  vehicleRowDetails: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap' as const,
    alignItems: 'center',
  },
  detailBadge: {
    fontSize: '0.75rem',
    color: '#9ca3af',
    background: 'rgba(255,255,255,0.05)',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  matchBadge: {
    fontSize: '0.75rem',
    fontWeight: 600,
    marginRight: 'auto',
  },
  footer: {
    textAlign: 'center' as const,
    marginTop: 'auto',
    paddingTop: '40px',
    paddingBottom: '20px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  footerText: {
    color: '#d1d5db',
    fontSize: '0.8rem',
    margin: '0 0 4px 0',
  },
  footerVersion: {
    color: '#9ca3af',
    fontSize: '0.65rem',
    margin: 0,
  },
}
