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
  tire_size_front?: string | null
  cb_difference: number | null
  match_level: 'exact' | 'with_ring' | 'technical'
}

interface CompareVehicleState {
  tab: 'plate' | 'model'
  plate: string
  make: string
  model: string
  year: string
  boltCount: string
  boltSpacing: string
  centerBore: string
  rimSize: string
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
  const emptyVehicle: CompareVehicleState = { tab: 'plate', plate: '', make: '', model: '', year: '', boltCount: '', boltSpacing: '', centerBore: '', rimSize: '', result: null, loading: false, error: null }
  const [cmpA, setCmpA] = useState<CompareVehicleState>(emptyVehicle)
  const [cmpB, setCmpB] = useState<CompareVehicleState>(emptyVehicle)

  // Custom specs editor (shown after results)
  const [showSpecsEditor, setShowSpecsEditor] = useState(false)
  const [specBoltCount, setSpecBoltCount] = useState('')
  const [specBoltSpacing, setSpecBoltSpacing] = useState('')
  const [specCenterBore, setSpecCenterBore] = useState('')
  const [specRimSize, setSpecRimSize] = useState('')
  const [specTireWidth, setSpecTireWidth] = useState('')
  const [specTireProfile, setSpecTireProfile] = useState('')

  const parseTireSize = (tireStr: string): { width?: number; profile?: number; rim?: number } => {
    if (!tireStr) return {}
    const m = tireStr.match(/(\d{3})[\/\s]*(\d{2,3})[\/R\s]+(\d{2})/i)
    if (!m) return {}
    return { width: parseInt(m[1]), profile: parseInt(m[2]), rim: parseInt(m[3]) }
  }

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
  const doReverseSearch = async (bolt_count: number, bolt_spacing: number, center_bore?: number, rim_sizes?: number[]) => {
    setReverseLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('bolt_count', bolt_count.toString())
      params.set('bolt_spacing', bolt_spacing.toString())
      if (center_bore) params.set('center_bore', center_bore.toString())
      if (rim_sizes && rim_sizes.length > 0) params.set('rim_sizes', rim_sizes.join(','))

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
        populateSpecsFromFitment(data.wheel_fitment, data.vehicle?.front_tire)
        await doReverseSearch(
          data.wheel_fitment.bolt_count,
          data.wheel_fitment.bolt_spacing,
          data.wheel_fitment.center_bore,
          data.wheel_fitment.rim_sizes_allowed
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
        const vResult = {
          vehicle: {
            manufacturer: model.make_he || model.make,
            model: model.model,
            year: parseInt(modelSearchYear),
            front_tire: model.tire_size_front || null
          },
          wheel_fitment: wheelFitment,
          source: 'local_db'
        }
        setVehicleResult(vResult)
        populateSpecsFromFitment(wheelFitment, model.tire_size_front)
        const rimSizes = wheelFitment.rim_sizes_allowed || (model.rim_size ? [parseInt(model.rim_size)] : undefined)
        await doReverseSearch(
          wheelFitment.bolt_count,
          wheelFitment.bolt_spacing,
          wheelFitment.center_bore,
          rimSizes
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
        return { background: 'rgba(251, 191, 36, 0.12)', border: '1px solid rgba(217, 119, 6, 0.4)', color: '#92400e' }
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
    setShowSpecsEditor(false)
    setSpecBoltCount('')
    setSpecBoltSpacing('')
    setSpecCenterBore('')
    setSpecRimSize('')
    setSpecTireWidth('')
    setSpecTireProfile('')
  }

  const populateSpecsFromFitment = (fitment: VehicleResult['wheel_fitment'], frontTire?: string | null) => {
    if (!fitment) return
    setSpecBoltCount(fitment.bolt_count.toString())
    setSpecBoltSpacing(fitment.bolt_spacing.toString())
    setSpecCenterBore(fitment.center_bore?.toString() || '')
    setSpecRimSize(fitment.rim_sizes_allowed?.[0]?.toString() || '')
    if (frontTire) {
      const parsed = parseTireSize(frontTire)
      setSpecTireWidth(parsed.width?.toString() || '')
      setSpecTireProfile(parsed.profile?.toString() || '')
      if (!fitment.rim_sizes_allowed?.length && parsed.rim) setSpecRimSize(parsed.rim.toString())
    }
  }

  const handleSpecsSearch = async () => {
    const bc = parseInt(specBoltCount)
    const bs = parseFloat(specBoltSpacing)
    if (!bc || !bs) { toast.error('נא למלא מספר ברגים ומרווח PCD'); return }
    const cb = specCenterBore ? parseFloat(specCenterBore) : undefined
    const rs = specRimSize ? [parseInt(specRimSize)] : undefined
    setShowSpecsEditor(false)
    await doReverseSearch(bc, bs, cb, rs)
  }

  const isLoading = vehicleLoading || modelSearchLoading || reverseLoading

  // Filter results based on showTechnical toggle
  const filteredResults = reverseResults
    ? showTechnical
      ? reverseResults.results
      : reverseResults.results.filter(r => r.match_level !== 'technical')
    : []

  // Further filter by tire width/profile if set
  const tireFilteredResults = filteredResults.filter(v => {
    if (!specTireWidth && !specTireProfile) return true
    if (!v.tire_size_front) return true // unknown → show
    const parsed = parseTireSize(v.tire_size_front)
    if (specTireWidth && parsed.width) {
      if (Math.abs(parsed.width - parseInt(specTireWidth)) > 10) return false
    }
    if (specTireProfile && parsed.profile) {
      if (parsed.profile !== parseInt(specTireProfile)) return false
    }
    return true
  })

  // Group filtered results by make
  const groupedFiltered: Record<string, ReverseResult[]> = {}
  for (const vehicle of tireFilteredResults) {
    const make = vehicle.make_he || vehicle.make
    if (!groupedFiltered[make]) groupedFiltered[make] = []
    groupedFiltered[make].push(vehicle)
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <a href="/" style={{ position: 'absolute', top: '16px', right: '16px', color: '#64748b', fontSize: '13px', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', background: '#ffffff', border: '1px solid #e2e8f0' }}>← דף הבית</a>
        <h1 style={styles.title}>חיפוש הפוך</h1>
        <p style={styles.subtitle}>
          מצא אילו רכבים יכולים להשאיל לך גלגל עם התאמה מלאה
        </p>
        <div style={styles.betaBadge}>BETA</div>
        <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '8px 0 0', fontStyle: 'italic' }}>
          <span style={{display:'inline-flex',alignItems:'center',gap:'5px'}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> המידע מבוסס על נתוני יצרן בלבד — יש לוודא התאמה פיזית לפני שימוש בפועל</span>
        </p>
      </div>

      {/* Mode Switcher */}
      <div style={{ display: 'flex', gap: '8px', maxWidth: '600px', margin: '0 auto 16px', width: '100%' }}>
        <button
          onClick={() => setPageMode('reverse')}
          style={{
            flex: 1, padding: '10px', borderRadius: '10px', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.9rem',
            background: pageMode === 'reverse' ? '#2563eb' : '#ffffff',
            color: pageMode === 'reverse' ? '#ffffff' : '#64748b',
            border: pageMode === 'reverse' ? '1px solid #2563eb' : '1px solid #e2e8f0',
          }}
        >
          <span style={{display:'inline-flex',alignItems:'center',gap:'6px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> חיפוש הפוך</span>
        </button>
        <button
          onClick={() => setPageMode('compare')}
          style={{
            flex: 1, padding: '10px', borderRadius: '10px', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.9rem',
            background: pageMode === 'compare' ? '#2563eb' : '#ffffff',
            color: pageMode === 'compare' ? '#ffffff' : '#64748b',
            border: pageMode === 'compare' ? '1px solid #2563eb' : '1px solid #e2e8f0',
          }}
        >
          <span style={{display:'inline-flex',alignItems:'center',gap:'6px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg> השוואה מיידית</span>
        </button>
      </div>

      {/* Compare Mode */}
      {pageMode === 'compare' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
          {/* Vehicle A */}
          {(['A', 'B'] as const).map(which => {
            const v = which === 'A' ? cmpA : cmpB
            const set = which === 'A' ? setCmpA : setCmpB
            const label = which === 'A' ? 'רכב 1' : 'רכב 2'
            return (
              <div key={which} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ fontWeight: 700, marginBottom: '10px', color: which === 'A' ? '#2563eb' : '#16a34a' }}>
                  {label}
                </div>
                {/* Mini tabs */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  {(['plate', 'model'] as const).map(t => (
                    <button key={t} onClick={() => set(prev => ({...prev, tab: t, result: null, error: null}))}
                      style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                        background: v.tab === t ? '#2563eb' : '#f8fafc',
                        color: v.tab === t ? '#ffffff' : '#64748b',
                        borderColor: v.tab === t ? '#2563eb' : '#e2e8f0' }}>
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
                      {v.loading ? <svg className="spinning-wheel" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="9"/><line x1="12" y1="15" x2="12" y2="22"/><line x1="2" y1="12" x2="9" y2="12"/><line x1="15" y1="12" x2="22" y2="12"/></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>}
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
                        {v.loading ? <svg className="spinning-wheel" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>}
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
                    <button onClick={() => set(prev => ({...prev, result: null, plate: '', make: '', model: '', year: '', boltCount: '', boltSpacing: '', centerBore: '', rimSize: ''}))}
                      style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '2px', marginRight: '6px', display: 'inline-flex', alignItems: 'center' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
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
            const borderColor = outcome.overall === 'compatible' ? '#10b981' : outcome.overall === 'with_ring' ? '#d97706' : '#ef4444'
            const icon = outcome.overall === 'compatible'
              ? <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="20 6 9 17 4 12"/></svg>
              : outcome.overall === 'with_ring'
              ? <svg width="44" height="44" viewBox="0 0 24 24" fill="#d97706" stroke="#d97706" strokeWidth="1"><circle cx="12" cy="12" r="10"/></svg>
              : <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            const title = outcome.overall === 'compatible' ? 'מתאים!' : outcome.overall === 'with_ring' ? 'מתאים עם טבעת מרכוז' : 'לא מתאים'
            return (
              <div style={{ background: bgColor, border: `2px solid ${borderColor}`, borderRadius: '14px', padding: '20px', textAlign: 'center' }}>
                <div style={{ marginBottom: '6px', display: 'flex', justifyContent: 'center' }}>{icon}</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: borderColor, marginBottom: '14px' }}>{title}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'right', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#9ca3af' }}>חישוק ברגים (PCD)</span>
                    <span style={{ fontWeight: 600, color: outcome.pcdMatch ? '#10b981' : '#ef4444' }}>
                      {outcome.pcdMatch
                        ? <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 12 4 10"/></svg>{`זהה (${cmpA.result!.wheel_fitment!.pcd})`}</span>
                        : <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>{`שונה (${cmpA.result!.wheel_fitment!.pcd} vs ${cmpB.result!.wheel_fitment!.pcd})`}</span>}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#9ca3af' }}>קוטר פנימי (CB)</span>
                    <span style={{ fontWeight: 600, color: outcome.cbLevel === 'exact' ? '#10b981' : outcome.cbLevel === 'with_ring' ? '#d97706' : outcome.cbLevel === 'no_fit' ? '#ef4444' : '#9ca3af' }}>
                      {outcome.cbLevel === 'exact' && <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 12 4 10"/></svg>{`זהה${outcome.cbDiff !== null ? ` (${cmpA.result!.wheel_fitment!.center_bore}mm)` : ''}`}</span>}
                      {outcome.cbLevel === 'with_ring' && `מומלץ טבעת מרכוז (+${outcome.cbDiff}mm)`}
                      {outcome.cbLevel === 'no_fit' && <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>{`לא מתאים (${outcome.cbDiff !== null ? `${outcome.cbDiff}mm` : 'שונה'})`}</span>}
                      {outcome.cbLevel === 'unknown' && 'לא ידוע'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#9ca3af' }}>גודל חישוק</span>
                    <span style={{ fontWeight: 600, color: outcome.rimOverlap ? '#10b981' : '#d97706' }}>
                      {outcome.rimOverlap
                        ? outcome.commonRimSizes.length > 0
                          ? <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 12 4 10"/></svg>{`R${outcome.commonRimSizes.join('/')}`}</span>
                          : <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 12 4 10"/></svg>לא ידוע</span>
                        : <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>{`שים לב - גדלים שונים (R${cmpA.result!.wheel_fitment!.rim_sizes_allowed?.join('/')} vs R${cmpB.result!.wheel_fitment!.rim_sizes_allowed?.join('/')})`}</span>}
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
                ...(searchTab === 'model' ? styles.tabActive : {})
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
                {isLoading ? <svg className="spinning-wheel" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="9"/><line x1="12" y1="15" x2="12" y2="22"/><line x1="2" y1="12" x2="9" y2="12"/><line x1="15" y1="12" x2="22" y2="12"/></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>}
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
                {isLoading ? <><svg className="spinning-wheel" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="9"/><line x1="12" y1="15" x2="12" y2="22"/><line x1="2" y1="12" x2="9" y2="12"/><line x1="15" y1="12" x2="22" y2="12"/></svg></> : 'חפש רכבים תואמים'}
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

          {/* Custom specs editor */}
          {!showSpecsEditor ? (
            <button
              onClick={() => setShowSpecsEditor(true)}
              style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 16px', cursor: 'pointer', fontSize: '0.88rem', color: '#475569', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px', width: '100%', justifyContent: 'center', boxSizing: 'border-box' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              סנן לפי מידות גלגל
            </button>
          ) : (
            <div style={{ background: '#fff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '14px', boxSizing: 'border-box', width: '100%' }}>
              <div style={{ fontWeight: 600, marginBottom: '10px', color: '#2563eb', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                סינון לפי מידות גלגל
              </div>

              {/* Tire size from vehicle */}
              {vehicleResult?.vehicle?.front_tire && (
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '6px 12px', marginBottom: '10px', fontSize: '0.82rem', color: '#1e40af' }}>
                  <span style={{ color: '#64748b' }}>מידת צמיג מקורית: </span>
                  <strong>{vehicleResult.vehicle.front_tire}</strong>
                </div>
              )}

              {/* Row 1: Bolt count + PCD */}
              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, marginBottom: '3px' }}>מספר ברגים · ריווח (PCD)</div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input type="text" inputMode="numeric" value={specBoltCount}
                    onChange={e => setSpecBoltCount(e.target.value)} placeholder="5"
                    style={{ ...styles.input, flex: '0 0 60px', width: '60px', fontSize: '0.88rem', padding: '8px 8px', letterSpacing: 0 }} dir="ltr" />
                  <input type="text" inputMode="decimal" value={specBoltSpacing}
                    onChange={e => setSpecBoltSpacing(e.target.value)} placeholder="114.3"
                    style={{ ...styles.input, flex: 1, minWidth: 0, fontSize: '0.88rem', padding: '8px 8px', letterSpacing: 0 }} dir="ltr" />
                </div>
              </div>

              {/* Row 2: CB + Rim size */}
              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, marginBottom: '3px' }}>קוטר מרכזי (CB) · גודל חישוק (R)</div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input type="text" inputMode="decimal" value={specCenterBore}
                    onChange={e => setSpecCenterBore(e.target.value)} placeholder="67.1 (אופציונלי)"
                    style={{ ...styles.input, flex: 1, minWidth: 0, fontSize: '0.88rem', padding: '8px 8px', letterSpacing: 0 }} dir="ltr" />
                  <input type="text" inputMode="numeric" value={specRimSize}
                    onChange={e => setSpecRimSize(e.target.value)} placeholder='16"'
                    style={{ ...styles.input, flex: '0 0 60px', width: '60px', fontSize: '0.88rem', padding: '8px 8px', letterSpacing: 0 }} dir="ltr" />
                </div>
              </div>

              {/* Row 3: Tire width + profile (optional filter) */}
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, marginBottom: '3px' }}>
                  מידת צמיג: רוחב · פרופיל <span style={{ fontWeight: 400 }}>(אופציונלי — מסנן תוצאות)</span>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <input type="text" inputMode="numeric" value={specTireWidth}
                    onChange={e => setSpecTireWidth(e.target.value)} placeholder="205"
                    style={{ ...styles.input, flex: 1, minWidth: 0, fontSize: '0.88rem', padding: '8px 8px', letterSpacing: 0 }} dir="ltr" />
                  <span style={{ color: '#94a3b8', fontWeight: 700, flexShrink: 0 }}>/</span>
                  <input type="text" inputMode="numeric" value={specTireProfile}
                    onChange={e => setSpecTireProfile(e.target.value)} placeholder="55"
                    style={{ ...styles.input, flex: '0 0 60px', width: '60px', fontSize: '0.88rem', padding: '8px 8px', letterSpacing: 0 }} dir="ltr" />
                  <span style={{ color: '#94a3b8', fontWeight: 700, flexShrink: 0 }}>R{specRimSize || '?'}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleSpecsSearch} disabled={reverseLoading} style={{ ...styles.searchBtn, flex: 1, padding: '10px', justifyContent: 'center', fontSize: '0.9rem' }}>
                  {reverseLoading ? <svg className="spinning-wheel" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> : 'חפש לפי מידות'}
                </button>
                <button onClick={() => setShowSpecsEditor(false)} style={{ ...styles.resetBtn, padding: '10px 16px', flexShrink: 0 }}>ביטול</button>
              </div>
            </div>
          )}

          {/* Loading */}
          {reverseLoading && (
            <div style={styles.loadingBox}>
              <svg className="spinning-wheel" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="9"/><line x1="12" y1="15" x2="12" y2="22"/><line x1="2" y1="12" x2="9" y2="12"/><line x1="15" y1="12" x2="22" y2="12"/></svg>
              <p>מחפש רכבים תואמים...</p>
            </div>
          )}

          {/* Results */}
          {reverseResults && !reverseLoading && (
            <>
              {/* Summary */}
              <div style={styles.summaryBar}>
                <span>
                  נמצאו <strong>{tireFilteredResults.length}</strong> דגמים תואמים{tireFilteredResults.length !== filteredResults.length && <span style={{ color: '#64748b', fontWeight: 'normal', fontSize: '0.8rem' }}> (מתוך {filteredResults.length})</span>}
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
              {tireFilteredResults.length === 0 ? (
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
                              <span style={styles.detailBadge}>CB {vehicle.center_bore}</span>
                            )}
                            {vehicle.cb_difference !== null && vehicle.cb_difference !== 0 && (
                              <span style={{ ...styles.detailBadge, color: vehicle.match_level === 'exact' ? '#15803d' : vehicle.match_level === 'with_ring' ? '#92400e' : '#dc2626' }}>
                                {vehicle.cb_difference > 0 ? '+' : ''}{vehicle.cb_difference}mm
                              </span>
                            )}
                            {vehicle.tire_size_front && (
                              <span style={{ ...styles.detailBadge, color: '#475569' }}>
                                {vehicle.tire_size_front}
                              </span>
                            )}
                            <span style={{
                              ...styles.matchBadge,
                              color: vehicle.match_level === 'exact' ? '#15803d' : vehicle.match_level === 'with_ring' ? '#92400e' : '#dc2626'
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
    background: '#f1f5f9',
    color: '#1e293b',
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
    color: '#1e293b',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#64748b',
    margin: '0 0 12px 0',
  },
  betaBadge: {
    display: 'inline-block',
    background: '#fffbeb',
    border: '1px solid #fde68a',
    color: '#d97706',
    padding: '4px 16px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '2px',
  },
  searchCard: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '16px',
    maxWidth: '450px',
    margin: '0 auto',
    width: '100%',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
  },
  tabBar: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
    marginBottom: '16px',
  },
  tab: {
    width: '100%',
    padding: '10px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '9px',
    background: '#f8fafc',
    color: '#64748b',
    cursor: 'pointer',
    fontWeight: 'normal' as const,
    fontSize: '0.9rem',
    transition: 'all 0.2s',
  },
  tabActive: {
    background: '#2563eb',
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
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    color: '#1e293b',
    fontSize: '1.2rem',
    textAlign: 'center' as const,
    letterSpacing: '2px',
    outline: 'none',
  },
  searchBtn: {
    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
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
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '0 0 8px 8px',
    zIndex: 100,
    maxHeight: '200px',
    overflowY: 'auto' as const,
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
  suggestionItem: {
    padding: '10px 12px',
    cursor: 'pointer',
    borderBottom: '1px solid #f1f5f9',
    color: '#1e293b',
    fontSize: '0.9rem',
  },
  errorBox: {
    background: '#fef2f2',
    color: '#ef4444',
    padding: '12px',
    borderRadius: '10px',
    textAlign: 'center' as const,
    marginTop: '10px',
    border: '1px solid #fecaca',
  },
  vehicleInfoCard: {
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center' as const,
  },
  vehicleInfoTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#2563eb',
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
    background: '#f1f5f9',
    padding: '4px 12px',
    borderRadius: '6px',
    fontSize: '0.9rem',
    color: '#475569',
    border: '1px solid #e2e8f0',
  },
  resetBtn: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    color: '#64748b',
    padding: '8px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  loadingBox: {
    textAlign: 'center' as const,
    padding: '30px',
    color: '#64748b',
  },
  summaryBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: '#ffffff',
    borderRadius: '10px',
    fontSize: '0.9rem',
    border: '1px solid #e2e8f0',
    color: '#1e293b',
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
    color: '#64748b',
  },
  makeGroup: {
    background: '#ffffff',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  makeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: '#f8fafc',
    fontWeight: 'bold',
    fontSize: '1rem',
    color: '#2563eb',
    borderBottom: '1px solid #e2e8f0',
  },
  makeCount: {
    fontSize: '0.8rem',
    color: '#64748b',
    fontWeight: 'normal' as const,
  },
  vehicleRow: {
    padding: '10px 16px',
    borderTop: '1px solid #f1f5f9',
    borderRadius: '0',
    color: '#1e293b',
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
    color: '#1e293b',
  },
  vehicleYears: {
    color: '#64748b',
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
    color: '#64748b',
    background: '#f1f5f9',
    padding: '2px 8px',
    borderRadius: '4px',
    border: '1px solid #e2e8f0',
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
    borderTop: '1px solid #e2e8f0',
  },
  footerText: {
    color: '#94a3b8',
    fontSize: '0.8rem',
    margin: '0 0 4px 0',
  },
  footerVersion: {
    color: '#94a3b8',
    fontSize: '0.65rem',
    margin: 0,
  },
}
