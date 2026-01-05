'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Operator {
  id: string
  full_name: string
  phone: string
  call_center_id: string
  call_center_name: string
}

interface StationManager {
  id: string
  full_name: string
  phone: string
}

interface Station {
  id: string
  name: string
  address: string
  city?: string | null
  district?: string | null
  managers?: StationManager[]
}

interface WheelResult {
  station: Station
  wheels: { wheel_number: number; rim_size: string; pcd: string; is_available: boolean; is_donut?: boolean }[]
  availableCount: number
  totalCount: number
}

interface VehicleInfo {
  manufacturer: string
  model: string
  year: number
  bolt_count: number
  bolt_spacing: number
  rim_size: string
  front_tire?: string | null
  center_bore?: number | null
}

// Extract rim size from tire string (e.g., "205/55R16" -> 16)
const extractRimSize = (tire: string | null | undefined): number | null => {
  if (!tire) return null
  const match = tire.match(/R(\d+)/i)
  return match ? parseInt(match[1]) : null
}

interface FilterOptions {
  rim_sizes: string[]
  bolt_counts: number[]
  bolt_spacings: number[]
}

// Common Hebrew to English car brand mappings
const hebrewToEnglishMakes: Record<string, string> = {
  'טויוטה': 'Toyota', 'יונדאי': 'Hyundai', 'קיא': 'Kia', 'מזדה': 'Mazda',
  'הונדה': 'Honda', 'ניסאן': 'Nissan', 'סוזוקי': 'Suzuki', 'מיצובישי': 'Mitsubishi',
  'סובארו': 'Subaru', 'פולקסווגן': 'Volkswagen', 'סקודה': 'Skoda', 'סיאט': 'Seat',
  'אאודי': 'Audi', 'במוו': 'BMW', 'מרצדס': 'Mercedes-Benz', 'פיג\'ו': 'Peugeot',
  'סיטרואן': 'Citroen', 'רנו': 'Renault', 'פיאט': 'Fiat', 'אלפא רומאו': 'Alfa Romeo',
  'שברולט': 'Chevrolet', 'פורד': 'Ford', 'ג\'יפ': 'Jeep', 'דאצ\'יה': 'Dacia',
  'אופל': 'Opel', 'וולוו': 'Volvo', 'לקסוס': 'Lexus', 'אינפיניטי': 'Infiniti',
  'טסלה': 'Tesla', 'ביואיק': 'BYD', 'ג\'ילי': 'Geely', 'MG': 'MG'
}

// Common Hebrew to English car model mappings
const hebrewToEnglishModels: Record<string, string> = {
  // Toyota
  'קורולה': 'Corolla', 'קאמרי': 'Camry', 'יאריס': 'Yaris', 'אוריס': 'Auris',
  'ראב 4': 'RAV4', 'לנד קרוזר': 'Land Cruiser', 'היילקס': 'Hilux', 'פריוס': 'Prius',
  'אייגו': 'Aygo', 'סי-אייץ\'ר': 'C-HR', 'היילנדר': 'Highlander',
  // Hyundai
  'איי 10': 'i10', 'איי 20': 'i20', 'איי 30': 'i30', 'איי 40': 'i40',
  'טוסון': 'Tucson', 'סנטה פה': 'Santa Fe', 'קונה': 'Kona', 'יוניק': 'Ioniq',
  'אלנטרה': 'Elantra', 'סונטה': 'Sonata', 'אקסנט': 'Accent',
  // Kia
  'פיקנטו': 'Picanto', 'ריו': 'Rio', 'סיד': 'Ceed', 'ספורטאז\'': 'Sportage',
  'סורנטו': 'Sorento', 'נירו': 'Niro', 'סטוניק': 'Stonic', 'סול': 'Soul',
  // Mazda
  'מזדה 2': 'Mazda2', 'מזדה 3': 'Mazda3', 'מזדה 6': 'Mazda6',
  'סי-איקס 3': 'CX-3', 'סי-איקס 5': 'CX-5', 'סי-איקס 30': 'CX-30',
  // Honda
  'סיוויק': 'Civic', 'אקורד': 'Accord', 'ג\'אז': 'Jazz', 'סי-אר-וי': 'CR-V', 'האר-וי': 'HR-V',
  // Nissan
  'מיקרה': 'Micra', 'ג\'וק': 'Juke', 'קשקאי': 'Qashqai', 'איקס-טרייל': 'X-Trail',
  'ליף': 'Leaf', 'נוט': 'Note', 'סנטרה': 'Sentra',
  // Volkswagen
  'גולף': 'Golf', 'פולו': 'Polo', 'פאסאט': 'Passat', 'טיגואן': 'Tiguan',
  'טי-רוק': 'T-Roc', 'אפ': 'Up', 'ארטיאון': 'Arteon', 'טוארג': 'Touareg',
  // Skoda
  'פאביה': 'Fabia', 'אוקטביה': 'Octavia', 'סופרב': 'Superb', 'קארוק': 'Karoq', 'קודיאק': 'Kodiaq',
  // Other common
  'פוקוס': 'Focus', 'פיאסטה': 'Fiesta', 'אסטרה': 'Astra', 'קורסה': 'Corsa',
  'קליאו': 'Clio', 'מגאן': 'Megane', 'סי 3': 'C3', 'סי 4': 'C4', '208': '208', '308': '308',
  'סוויפט': 'Swift', 'ויטרה': 'Vitara', 'בלנו': 'Baleno'
}

// Model to Make mapping - which models belong to which make
const modelToMake: Record<string, string> = {
  // Toyota
  'Corolla': 'Toyota', 'Camry': 'Toyota', 'Yaris': 'Toyota', 'Auris': 'Toyota',
  'RAV4': 'Toyota', 'Land Cruiser': 'Toyota', 'Hilux': 'Toyota', 'Prius': 'Toyota',
  'Aygo': 'Toyota', 'C-HR': 'Toyota', 'Highlander': 'Toyota',
  // Hyundai
  'i10': 'Hyundai', 'i20': 'Hyundai', 'i30': 'Hyundai', 'i40': 'Hyundai',
  'Tucson': 'Hyundai', 'Santa Fe': 'Hyundai', 'Kona': 'Hyundai', 'Ioniq': 'Hyundai',
  'Elantra': 'Hyundai', 'Sonata': 'Hyundai', 'Accent': 'Hyundai',
  // Kia
  'Picanto': 'Kia', 'Rio': 'Kia', 'Ceed': 'Kia', 'Sportage': 'Kia',
  'Sorento': 'Kia', 'Niro': 'Kia', 'Stonic': 'Kia', 'Soul': 'Kia',
  // Mazda
  'Mazda2': 'Mazda', 'Mazda3': 'Mazda', 'Mazda6': 'Mazda',
  'CX-3': 'Mazda', 'CX-5': 'Mazda', 'CX-30': 'Mazda',
  // Honda
  'Civic': 'Honda', 'Accord': 'Honda', 'Jazz': 'Honda', 'CR-V': 'Honda', 'HR-V': 'Honda',
  // Nissan
  'Micra': 'Nissan', 'Juke': 'Nissan', 'Qashqai': 'Nissan', 'X-Trail': 'Nissan',
  'Leaf': 'Nissan', 'Note': 'Nissan', 'Sentra': 'Nissan',
  // Volkswagen
  'Golf': 'Volkswagen', 'Polo': 'Volkswagen', 'Passat': 'Volkswagen', 'Tiguan': 'Volkswagen',
  'T-Roc': 'Volkswagen', 'Up': 'Volkswagen', 'Arteon': 'Volkswagen', 'Touareg': 'Volkswagen',
  // Skoda
  'Fabia': 'Skoda', 'Octavia': 'Skoda', 'Superb': 'Skoda', 'Karoq': 'Skoda', 'Kodiaq': 'Skoda',
  // Ford
  'Focus': 'Ford', 'Fiesta': 'Ford',
  // Opel
  'Astra': 'Opel', 'Corsa': 'Opel',
  // Renault
  'Clio': 'Renault', 'Megane': 'Renault',
  // Citroen
  'C3': 'Citroen', 'C4': 'Citroen',
  // Peugeot
  '208': 'Peugeot', '308': 'Peugeot',
  // Suzuki
  'Swift': 'Suzuki', 'Vitara': 'Suzuki', 'Baleno': 'Suzuki'
}

export default function OperatorPage() {
  const [operator, setOperator] = useState<Operator | null>(null)
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  // Search state - 3 tabs: plate, model, spec
  const [searchTab, setSearchTab] = useState<'plate' | 'model' | 'spec'>('plate')
  const [plateNumber, setPlateNumber] = useState('')
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo | null>(null)
  const [searchError, setSearchError] = useState('')

  // Autocomplete state
  const [makeSuggestions, setMakeSuggestions] = useState<string[]>([])
  const [modelSuggestions, setModelSuggestions] = useState<string[]>([])
  const [showMakeSuggestions, setShowMakeSuggestions] = useState(false)
  const [showModelSuggestions, setShowModelSuggestions] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{make: boolean, model: boolean, year: boolean}>({make: false, model: false, year: false})

  // Spec search state
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null)
  const [specFilters, setSpecFilters] = useState({
    rim_size: '',
    bolt_count: '',
    bolt_spacing: '',
    center_bore: ''
  })

  // Results
  const [results, setResults] = useState<WheelResult[]>([])

  // Modal
  const [selectedWheel, setSelectedWheel] = useState<{
    station: Station
    wheelNumber: number
    pcd: string
  } | null>(null)
  const [selectedContact, setSelectedContact] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Check for saved session and fetch filter options
  useEffect(() => {
    const saved = localStorage.getItem('operator_session')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        if (data.expiry && new Date().getTime() < data.expiry) {
          setOperator(data.operator)
        } else {
          localStorage.removeItem('operator_session')
        }
      } catch {
        localStorage.removeItem('operator_session')
      }
    }

    // Fetch filter options for spec search
    const fetchFilterOptions = async () => {
      try {
        const response = await fetch('/api/wheel-stations/search?')
        if (response.ok) {
          const data = await response.json()
          setFilterOptions(data.filterOptions)
        }
      } catch (err) {
        console.error('Error fetching filter options:', err)
      }
    }
    fetchFilterOptions()
  }, [])

  // Fetch autocomplete suggestions for make (supports Hebrew and English)
  const fetchMakeSuggestions = async (value: string) => {
    if (value.length < 2) {
      setMakeSuggestions([])
      return
    }

    // Check if Hebrew input, translate to English
    const englishValue = hebrewToEnglishMakes[value] || value

    try {
      // Search in local DB by both make and make_he
      const response = await fetch(`/api/vehicle-models?make=${encodeURIComponent(englishValue)}`)
      const data = await response.json()

      // Get unique makes and make_he pairs
      const suggestions: string[] = []
      const seen = new Set<string>()

      data.vehicles?.forEach((v: { make?: string }) => {
        if (v.make && !seen.has(v.make.toLowerCase())) {
          seen.add(v.make.toLowerCase())
          const hebrewName = Object.entries(hebrewToEnglishMakes).find(([, eng]) => eng.toLowerCase() === v.make?.toLowerCase())?.[0]
          suggestions.push(hebrewName ? `${v.make} (${hebrewName})` : v.make)
        }
      })

      // Add common makes that match
      Object.entries(hebrewToEnglishMakes).forEach(([he, en]) => {
        if ((he.includes(value) || en.toLowerCase().includes(value.toLowerCase())) && !seen.has(en.toLowerCase())) {
          seen.add(en.toLowerCase())
          suggestions.push(`${en} (${he})`)
        }
      })

      setMakeSuggestions(suggestions.slice(0, 8))
    } catch {
      setMakeSuggestions([])
    }
  }

  // Fetch autocomplete suggestions for model
  const fetchModelSuggestions = async (makeValue: string, value: string) => {
    if (value.length < 2 || !makeValue) {
      setModelSuggestions([])
      return
    }

    // Extract English make name if contains Hebrew in parentheses
    const englishMake = makeValue.includes('(') ? makeValue.split(' (')[0] : (hebrewToEnglishMakes[makeValue] || makeValue)

    // Check if Hebrew model input, translate to English
    const englishModel = hebrewToEnglishModels[value] || value

    try {
      const response = await fetch(`/api/vehicle-models?make=${encodeURIComponent(englishMake)}&model=${encodeURIComponent(englishModel)}`)
      const data = await response.json()

      // Get unique models from database
      const suggestions: string[] = []
      const seen = new Set<string>()

      data.models?.forEach((v: { model?: string }) => {
        if (v.model && !seen.has(v.model.toLowerCase())) {
          seen.add(v.model.toLowerCase())
          const hebrewName = Object.entries(hebrewToEnglishModels).find(([, eng]) => eng.toLowerCase() === v.model?.toLowerCase())?.[0]
          suggestions.push(hebrewName ? `${v.model} (${hebrewName})` : v.model)
        }
      })

      // Add common models that match - ONLY if they belong to the selected make
      Object.entries(hebrewToEnglishModels).forEach(([he, en]) => {
        // Check if this model belongs to the selected make
        const modelMakeValue = modelToMake[en]
        if (modelMakeValue && modelMakeValue.toLowerCase() === englishMake.toLowerCase()) {
          if ((he.includes(value) || en.toLowerCase().includes(value.toLowerCase())) && !seen.has(en.toLowerCase())) {
            seen.add(en.toLowerCase())
            suggestions.push(`${en} (${he})`)
          }
        }
      })

      setModelSuggestions(suggestions.slice(0, 8))
    } catch {
      setModelSuggestions([])
    }
  }

  const handleLogin = async () => {
    if (!phone || !code) {
      setLoginError('יש להזין שם משתמש וסיסמה')
      return
    }

    setLoginLoading(true)
    setLoginError('')

    try {
      // Use unified auth - works for both managers and operators
      const response = await fetch('/api/call-center/unified-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password: code })
      })

      const data = await response.json()

      if (!response.ok) {
        setLoginError(data.error || 'שגיאה בהתחברות')
        return
      }

      // Check role - if manager, redirect to call-center page
      if (data.role === 'manager') {
        // Save manager session and redirect
        const expiry = new Date().getTime() + (12 * 60 * 60 * 1000)
        localStorage.setItem('call_center_session', JSON.stringify({
          role: 'manager',
          user: data.user,
          expiry
        }))
        toast.success(`שלום ${data.user.full_name}!`)
        window.location.href = '/call-center'
        return
      }

      // Operator - stay on this page
      const expiry = new Date().getTime() + (12 * 60 * 60 * 1000)
      localStorage.setItem('operator_session', JSON.stringify({
        operator: data.user,
        expiry
      }))

      setOperator(data.user)
      toast.success(`שלום ${data.user.full_name}!`)
    } catch {
      setLoginError('שגיאה בהתחברות')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('operator_session')
    setOperator(null)
    setVehicleInfo(null)
    setResults([])
  }

  const handleSearch = async () => {
    setSearchError('')
    setVehicleInfo(null)
    setResults([])
    setShowMakeSuggestions(false)
    setShowModelSuggestions(false)

    // Validation based on tab
    if (searchTab === 'plate') {
      if (!plateNumber) {
        setSearchError('יש להזין מספר רכב')
        return
      }
    } else if (searchTab === 'model') {
      const errors = {
        make: !make.trim(),
        model: !model.trim(),
        year: !year.trim()
      }
      setFieldErrors(errors)
      if (errors.make || errors.model || errors.year) {
        toast.error('נא למלא יצרן, דגם ושנה', { id: 'model-search-validation' })
        return
      }
    } else if (searchTab === 'spec') {
      if (!specFilters.bolt_count && !specFilters.bolt_spacing && !specFilters.rim_size) {
        setSearchError('יש לבחור לפחות פילטר אחד')
        return
      }
    }

    setSearchLoading(true)

    try {
      // For spec search, go directly to wheel search
      if (searchTab === 'spec') {
        const params = new URLSearchParams()
        if (specFilters.rim_size) params.append('rim_size', specFilters.rim_size)
        if (specFilters.bolt_count) params.append('bolt_count', specFilters.bolt_count)
        if (specFilters.bolt_spacing) params.append('bolt_spacing', specFilters.bolt_spacing)
        params.append('available_only', 'true')

        const wheelsRes = await fetch(`/api/wheel-stations/search?${params}`)
        const wheelsData = await wheelsRes.json()

        if (!wheelsRes.ok) {
          setSearchError('שגיאה בחיפוש גלגלים')
          return
        }

        // Get station managers for all found stations
        const stationIds = wheelsData.results?.map((r: { station: { id: string } }) => r.station.id) || []
        let managersMap: Record<string, StationManager[]> = {}

        if (stationIds.length > 0) {
          const managersRes = await fetch(`/api/wheel-stations/managers?station_ids=${stationIds.join(',')}`)
          if (managersRes.ok) {
            const managersData = await managersRes.json()
            managersMap = managersData.managers || {}
          }
        }

        // Transform results
        const transformedResults: WheelResult[] = (wheelsData.results || []).map((result: {
          station: { id: string; name: string; address: string; city?: string | null; district?: string | null }
          wheels: { wheel_number: number; rim_size: string; bolt_count: number; bolt_spacing: number; is_available: boolean; is_donut?: boolean }[]
          availableCount: number
          totalCount: number
        }) => ({
          station: {
            ...result.station,
            managers: managersMap[result.station.id] || []
          },
          wheels: result.wheels.map(w => ({
            ...w,
            pcd: `${w.bolt_count}×${w.bolt_spacing}`,
            is_donut: w.is_donut
          })),
          availableCount: result.availableCount,
          totalCount: result.totalCount
        }))

        setResults(transformedResults)

        if (transformedResults.length === 0) {
          toast('לא נמצאו גלגלים מתאימים', { icon: '😕' })
        } else {
          const totalWheels = transformedResults.reduce((sum, r) => sum + r.wheels.length, 0)
          toast.success(`נמצאו ${totalWheels} גלגלים ב-${transformedResults.length} תחנות`)
        }
        return
      }

      // For plate and model tabs, get vehicle PCD info first
      let pcdInfo: VehicleInfo | null = null

      if (searchTab === 'plate') {
        const plateRes = await fetch(`/api/vehicle/lookup?plate=${encodeURIComponent(plateNumber.replace(/-/g, ''))}`)
        const plateData = await plateRes.json()

        if (!plateRes.ok || !plateData.success) {
          setSearchError(plateData.error || 'לא נמצא רכב עם מספר זה')
          return
        }

        if (plateData.wheel_fitment) {
          const rimSize = extractRimSize(plateData.vehicle.front_tire)
          pcdInfo = {
            manufacturer: plateData.vehicle.manufacturer,
            model: plateData.vehicle.model,
            year: plateData.vehicle.year,
            bolt_count: plateData.wheel_fitment.bolt_count,
            bolt_spacing: plateData.wheel_fitment.bolt_spacing,
            rim_size: rimSize ? rimSize.toString() : '',
            front_tire: plateData.vehicle.front_tire,
            center_bore: plateData.wheel_fitment.center_bore || null
          }
        } else {
          setSearchError('לא נמצא מידע PCD לרכב זה')
          return
        }
      } else if (searchTab === 'model') {
        // Manual search by make/model/year
        // Extract English make name if contains Hebrew in parentheses or translate from Hebrew
        const englishMake = make.includes('(') ? make.split(' (')[0] : (hebrewToEnglishMakes[make] || make)
        // Extract English model name if contains Hebrew in parentheses or translate from Hebrew
        const englishModel = model.includes('(') ? model.split(' (')[0] : (hebrewToEnglishModels[model] || model)

        const modelsRes = await fetch(
          `/api/vehicle-models?make=${encodeURIComponent(englishMake)}&model=${encodeURIComponent(englishModel)}${year ? `&year=${year}` : ''}`
        )
        const modelsData = await modelsRes.json()

        if (!modelsRes.ok || !modelsData.models?.length) {
          setSearchError('לא נמצא מידע לרכב זה')
          return
        }

        const vehicleModel = modelsData.models[0]
        pcdInfo = {
          manufacturer: vehicleModel.make_he || vehicleModel.make,
          model: vehicleModel.model,
          year: parseInt(year) || vehicleModel.year_from,
          bolt_count: vehicleModel.bolt_count,
          bolt_spacing: vehicleModel.bolt_spacing,
          rim_size: vehicleModel.rim_size || '',
          front_tire: vehicleModel.tire_size_front || null,
          center_bore: vehicleModel.center_bore || null
        }
      }

      if (!pcdInfo) return

      setVehicleInfo(pcdInfo)

      // Step 2: Search for wheels
      const wheelParams = new URLSearchParams({
        bolt_count: pcdInfo.bolt_count.toString(),
        bolt_spacing: pcdInfo.bolt_spacing.toString(),
        available_only: 'true'
      })
      // Don't filter by rim_size to show more options

      const wheelsRes = await fetch(`/api/wheel-stations/search?${wheelParams}`)
      const wheelsData = await wheelsRes.json()

      if (!wheelsRes.ok) {
        setSearchError('שגיאה בחיפוש גלגלים')
        return
      }

      // Get station managers for all found stations
      const stationIds = wheelsData.results?.map((r: { station: { id: string } }) => r.station.id) || []
      let managersMap: Record<string, StationManager[]> = {}

      if (stationIds.length > 0) {
        const managersRes = await fetch(`/api/wheel-stations/managers?station_ids=${stationIds.join(',')}`)
        if (managersRes.ok) {
          const managersData = await managersRes.json()
          managersMap = managersData.managers || {}
        }
      }

      // Transform results to our format
      const transformedResults: WheelResult[] = (wheelsData.results || []).map((result: {
        station: { id: string; name: string; address: string; city?: string | null; district?: string | null }
        wheels: { wheel_number: number; rim_size: string; is_available: boolean; is_donut?: boolean }[]
        availableCount: number
        totalCount: number
      }) => ({
        station: {
          ...result.station,
          managers: managersMap[result.station.id] || []
        },
        wheels: result.wheels.map(w => ({
          ...w,
          pcd: `${pcdInfo.bolt_count}×${pcdInfo.bolt_spacing}`,
          is_donut: w.is_donut
        })),
        availableCount: result.availableCount,
        totalCount: result.totalCount
      }))

      setResults(transformedResults)

      if (transformedResults.length === 0) {
        toast('לא נמצאו גלגלים מתאימים', { icon: '😕' })
      } else {
        const totalWheels = transformedResults.reduce((sum, r) => sum + r.wheels.length, 0)
        toast.success(`נמצאו ${totalWheels} גלגלים ב-${transformedResults.length} תחנות`)
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchError('שגיאה בחיפוש')
    } finally {
      setSearchLoading(false)
    }
  }

  const openModal = (station: Station, wheelNumber: number, pcd: string) => {
    setSelectedWheel({ station, wheelNumber, pcd })
    setSelectedContact(station.managers?.[0]?.id || null)
    setCopied(false)
  }

  const closeModal = () => {
    setSelectedWheel(null)
    setSelectedContact(null)
  }

  const getMessage = () => {
    if (!selectedWheel || !operator) return ''

    const contact = selectedWheel.station.managers?.find(m => m.id === selectedContact)
    const stationName = selectedWheel.station.name.replace('תחנת ', '')
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://wheel-stations.vercel.app'

    return `תפתח קריאה שינוע לפנצ'ריה
בפרטים: איסוף מתחנת השאלת צמיגים
${stationName}, ${selectedWheel.station.address}
במידע פרטי: איש קשר בתחנה ${contact?.full_name || ''}
${contact?.phone || ''}
ולשלוח לפונה שימלא
${baseUrl}/sign/${selectedWheel.station.id}?wheel=${selectedWheel.wheelNumber}&ref=operator_${operator.id}`
  }

  const copyMessage = () => {
    navigator.clipboard.writeText(getMessage())
    setCopied(true)
    toast.success('ההודעה הועתקה!')
    setTimeout(() => setCopied(false), 2000)
  }

  // Login screen
  if (!operator) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginBox}>
          <div style={styles.loginLogoIcon}>🎧</div>
          <h1 style={styles.loginTitle}>מערכת מוקדים</h1>
          <p style={styles.loginSubtitle}>הזן שם משתמש וסיסמה</p>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>שם משתמש</label>
            <input
              type="text"
              placeholder="שם משתמש"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              style={styles.formInput}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>סיסמה / קוד</label>
            <input
              type="password"
              placeholder="הסיסמה או הקוד שקיבלת"
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={styles.formInput}
              dir="ltr"
            />
          </div>

          {loginError && <div style={styles.errorText}>{loginError}</div>}

          <button
            style={styles.loginBtn}
            onClick={handleLogin}
            disabled={loginLoading}
          >
            {loginLoading ? 'מתחבר...' : 'כניסה'}
          </button>
          <Link href="/" style={styles.backLink}>← חזרה לדף הראשי</Link>
        </div>
      </div>
    )
  }

  // Main interface
  return (
    <div style={styles.pageWrapper}>
      {/* Keyframes for spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLogo}>
            <div style={styles.logoIcon}>🎧</div>
            <div>
              <h1 style={styles.headerTitle}>ממשק מוקדן</h1>
              <p style={styles.headerSubtitle}>{operator.call_center_name}</p>
            </div>
          </div>
          <div style={styles.userInfo}>
            <span style={styles.userName}>{operator.full_name}</span>
            <button style={styles.btnLogout} onClick={handleLogout}>יציאה</button>
          </div>
        </div>
      </div>

      <div style={styles.container}>
        {/* Search Section */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>🔍 חיפוש גלגל לרכב</h3>

          {/* Search Tabs - 3 options */}
          <div style={styles.searchTabs}>
            <button
              style={{...styles.searchTab, ...(searchTab === 'plate' ? styles.searchTabActive : {})}}
              onClick={() => { setSearchTab('plate'); setSearchError(''); setVehicleInfo(null); setResults([]); }}
            >
              🔢 מספר רכב
            </button>
            <button
              style={{...styles.searchTab, ...(searchTab === 'model' ? styles.searchTabActive : {})}}
              onClick={() => { setSearchTab('model'); setSearchError(''); setVehicleInfo(null); setResults([]); }}
            >
              🚘 יצרן ודגם
            </button>
            <button
              style={{...styles.searchTab, ...(searchTab === 'spec' ? styles.searchTabActive : {})}}
              onClick={() => { setSearchTab('spec'); setSearchError(''); setVehicleInfo(null); setResults([]); }}
            >
              🔧 לפי מפרט
            </button>
          </div>

          {/* Search by Plate */}
          {searchTab === 'plate' && (
            <div style={styles.searchRow}>
              <input
                type="text"
                inputMode="numeric"
                placeholder="12-345-67"
                value={plateNumber}
                onChange={e => setPlateNumber(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                style={{...styles.formInput, flex: 1, textAlign: 'center', letterSpacing: '2px', fontSize: '1.1rem'}}
                dir="ltr"
              />
              <button style={styles.searchBtn} onClick={handleSearch} disabled={searchLoading}>
                {searchLoading ? <span style={styles.spinner}></span> : '🔍'}
              </button>
            </div>
          )}

          {/* Search by Make/Model with Autocomplete */}
          {searchTab === 'model' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Make Input with Autocomplete */}
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type="text"
                  value={make}
                  onChange={e => {
                    setMake(e.target.value)
                    fetchMakeSuggestions(e.target.value)
                    setShowMakeSuggestions(true)
                    if (fieldErrors.make) setFieldErrors(prev => ({...prev, make: false}))
                  }}
                  onFocus={() => make.length >= 2 && setShowMakeSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowMakeSuggestions(false), 200)}
                  placeholder="יצרן - לדוגמה: Toyota או טויוטה"
                  style={{...styles.formInput, width: '100%', ...(fieldErrors.make && {borderColor: '#ef4444', boxShadow: '0 0 0 1px #ef4444'})}}
                />
                {showMakeSuggestions && makeSuggestions.length > 0 && (
                  <div style={styles.suggestionsDropdown}>
                    {makeSuggestions.map((suggestion, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setMake(suggestion)
                          setShowMakeSuggestions(false)
                          setModelSuggestions([])
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

              {/* Model Input with Autocomplete */}
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type="text"
                  value={model}
                  onChange={e => {
                    setModel(e.target.value)
                    fetchModelSuggestions(make, e.target.value)
                    setShowModelSuggestions(true)
                    if (fieldErrors.model) setFieldErrors(prev => ({...prev, model: false}))
                  }}
                  onFocus={() => model.length >= 2 && setShowModelSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowModelSuggestions(false), 200)}
                  placeholder="דגם - לדוגמה: Corolla"
                  style={{...styles.formInput, width: '100%', ...(fieldErrors.model && {borderColor: '#ef4444', boxShadow: '0 0 0 1px #ef4444'})}}
                />
                {showModelSuggestions && modelSuggestions.length > 0 && (
                  <div style={styles.suggestionsDropdown}>
                    {modelSuggestions.map((suggestion, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setModel(suggestion)
                          setShowModelSuggestions(false)
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

              <input
                type="text"
                inputMode="numeric"
                value={year}
                onChange={e => {
                  setYear(e.target.value.replace(/\D/g, '').slice(0, 4))
                  if (fieldErrors.year) setFieldErrors(prev => ({...prev, year: false}))
                }}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } }}
                placeholder="שנה - לדוגמה: 2020"
                style={{...styles.formInput, ...(fieldErrors.year && {borderColor: '#ef4444', boxShadow: '0 0 0 1px #ef4444'})}}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleSearch}
                  disabled={searchLoading}
                  style={{...styles.searchBtn, flex: 1, padding: '12px'}}
                >
                  {searchLoading ? <span style={styles.spinner}></span> : '🔍 חפש'}
                </button>
                {(make || model || year) && (
                  <button
                    onClick={() => { setMake(''); setModel(''); setYear(''); setFieldErrors({make: false, model: false, year: false}); }}
                    style={styles.clearBtn}
                    title="נקה שדות"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Search by Spec (PCD) */}
          {searchTab === 'spec' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* First row - 2 columns */}
              <div style={styles.filterGridRow}>
                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>כמות ברגים</label>
                  <select
                    style={styles.filterSelect}
                    value={specFilters.bolt_count}
                    onChange={e => setSpecFilters({...specFilters, bolt_count: e.target.value})}
                  >
                    <option value="">בחר...</option>
                    {filterOptions?.bolt_counts.map(count => (
                      <option key={count} value={count}>{count}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>מרווח ברגים</label>
                  <select
                    style={styles.filterSelect}
                    value={specFilters.bolt_spacing}
                    onChange={e => setSpecFilters({...specFilters, bolt_spacing: e.target.value})}
                  >
                    <option value="">בחר...</option>
                    {filterOptions?.bolt_spacings.map(spacing => (
                      <option key={spacing} value={spacing}>{spacing}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Second row - 2 columns */}
              <div style={styles.filterGridRow}>
                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>גודל ג&apos;אנט</label>
                  <select
                    style={styles.filterSelect}
                    value={specFilters.rim_size}
                    onChange={e => setSpecFilters({...specFilters, rim_size: e.target.value})}
                  >
                    <option value="">בחר...</option>
                    {filterOptions?.rim_sizes.map(size => (
                      <option key={size} value={size}>{size}&quot;</option>
                    ))}
                  </select>
                </div>

                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>קדח מרכזי (CB)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="לדוגמה: 57.1"
                    value={specFilters.center_bore}
                    onChange={e => setSpecFilters({...specFilters, center_bore: e.target.value})}
                    style={styles.filterInput}
                    dir="ltr"
                  />
                </div>
              </div>

              <button
                onClick={handleSearch}
                disabled={searchLoading}
                style={{...styles.searchBtn, width: '100%', padding: '12px'}}
              >
                {searchLoading ? <span style={styles.spinner}></span> : '🔍 חפש'}
              </button>
            </div>
          )}

          {/* Loading Animation */}
          {searchLoading && (
            <div style={styles.loadingContainer}>
              <div style={styles.loadingSpinner}></div>
              <div style={styles.loadingText}>מחפש גלגלים מתאימים...</div>
            </div>
          )}

          {searchError && <div style={styles.errorText}>{searchError}</div>}

          {/* Vehicle Info */}
          {vehicleInfo && (
            <div style={styles.vehicleInfoBox}>
              <div style={styles.vehicleInfoHeader}>פרטי רכב:</div>
              <div style={styles.vehicleInfoRow}>
                <span>{vehicleInfo.manufacturer} {vehicleInfo.model} {vehicleInfo.year}</span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={styles.pcdBadge}>
                    PCD: {vehicleInfo.bolt_count}×{vehicleInfo.bolt_spacing}
                  </span>
                  {vehicleInfo.rim_size && (
                    <span style={styles.rimBadge}>{vehicleInfo.rim_size}&quot;</span>
                  )}
                  {vehicleInfo.center_bore && (
                    <span style={styles.centerBoreBadge}>CB: {vehicleInfo.center_bore}</span>
                  )}
                </div>
              </div>
              {vehicleInfo.front_tire && (
                <div style={{ marginTop: '8px', color: '#94a3b8', fontSize: '0.85rem', direction: 'ltr', textAlign: 'left' }}>
                  🛞 {vehicleInfo.front_tire}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div style={styles.section}>
            <div style={styles.resultsHeader}>
              <h3 style={styles.sectionTitle}>תוצאות חיפוש</h3>
              <span style={styles.resultsCount}>
                נמצאו {results.reduce((sum, r) => sum + r.wheels.filter(w => {
                  const ws = parseInt(w.rim_size)
                  const vrs = vehicleInfo?.rim_size ? parseInt(vehicleInfo.rim_size) : null
                  return !(vrs && ws > vrs)
                }).length, 0)} גלגלים ב-{results.length} תחנות
              </span>
            </div>

            {results.map(result => (
              <div key={result.station.id} style={styles.stationCard}>
                <div style={styles.stationHeader}>
                  <div>
                    <div style={styles.stationName}>{result.station.name}</div>
                    <div style={styles.stationAddress}>{result.station.address || 'כתובת לא הוגדרה'}</div>
                  </div>
                  <span style={styles.wheelCount}>
                    {result.wheels.filter(w => {
                      const ws = parseInt(w.rim_size)
                      const vrs = vehicleInfo?.rim_size ? parseInt(vehicleInfo.rim_size) : null
                      return !(vrs && ws > vrs)
                    }).length} גלגלים
                  </span>
                </div>
                <div style={styles.wheelsGrid}>
                  {result.wheels
                    .filter(wheel => {
                      // Filter out wheels larger than vehicle rim size
                      const wheelSize = parseInt(wheel.rim_size)
                      const vehicleRimSize = vehicleInfo?.rim_size ? parseInt(vehicleInfo.rim_size) : null
                      if (vehicleRimSize && wheelSize > vehicleRimSize) return false
                      return true
                    })
                    .map(wheel => {
                    const wheelSize = parseInt(wheel.rim_size)
                    const vehicleRimSize = vehicleInfo?.rim_size ? parseInt(vehicleInfo.rim_size) : null
                    let sizeMatch: 'exact' | 'smaller' | null = null
                    if (vehicleRimSize && wheelSize) {
                      if (wheelSize === vehicleRimSize) sizeMatch = 'exact'
                      else if (wheelSize < vehicleRimSize) sizeMatch = 'smaller'
                    }
                    return (
                      <div
                        key={wheel.wheel_number}
                        style={{
                          ...styles.wheelItem,
                          ...(sizeMatch === 'exact' ? styles.wheelItemExact : {}),
                          ...(sizeMatch === 'smaller' ? styles.wheelItemSmaller : {}),
                          ...(wheel.is_donut ? styles.wheelItemDonut : {})
                        }}
                        onClick={() => openModal(result.station, wheel.wheel_number, wheel.pcd)}
                      >
                        <div style={styles.wheelNumber}>#{wheel.wheel_number}</div>
                        <div style={styles.wheelSpecs}>{wheel.pcd} | {wheel.rim_size}&quot;</div>
                        {wheel.is_donut && (
                          <div style={styles.donutBadge}>🍩 דונאט</div>
                        )}
                        {sizeMatch && (
                          <div style={{
                            fontSize: '0.7rem',
                            marginTop: '4px',
                            color: sizeMatch === 'exact' ? '#10b981' : '#f59e0b'
                          }}>
                            {sizeMatch === 'exact' ? '✓ מתאים' : '↓ קטן יותר'}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedWheel && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>יצירת הודעה לפונה</h3>
              <button style={styles.closeBtn} onClick={closeModal}>×</button>
            </div>

            <div style={styles.wheelInfoBox}>
              <div style={styles.wheelInfoTitle}>גלגל #{selectedWheel.wheelNumber}</div>
              <div style={styles.wheelInfoSub}>
                {selectedWheel.station.name} | {selectedWheel.pcd}
              </div>
            </div>

            <div style={styles.contactSection}>
              <h4 style={styles.contactTitle}>בחר איש קשר בתחנה:</h4>
              {selectedWheel.station.managers && selectedWheel.station.managers.length > 0 ? (
                selectedWheel.station.managers.map(manager => (
                  <div
                    key={manager.id}
                    style={{
                      ...styles.contactOption,
                      ...(selectedContact === manager.id ? styles.contactOptionSelected : {})
                    }}
                    onClick={() => setSelectedContact(manager.id)}
                  >
                    <div style={styles.contactName}>{manager.full_name}</div>
                    <div style={styles.contactPhone}>{manager.phone}</div>
                  </div>
                ))
              ) : (
                <div style={{color: '#64748b', textAlign: 'center', padding: '10px'}}>
                  אין אנשי קשר זמינים לתחנה זו
                </div>
              )}
            </div>

            <h4 style={styles.previewTitle}>תצוגה מקדימה:</h4>
            <div style={styles.messagePreview}>{getMessage()}</div>

            <button
              style={{...styles.copyBtn, ...(copied ? styles.copyBtnCopied : {})}}
              onClick={copyMessage}
            >
              {copied ? '✓ הועתק!' : '📋 העתק הודעה'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  pageWrapper: {
    background: '#0f172a',
    minHeight: '100vh',
    color: '#e2e8f0',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    direction: 'rtl',
  },
  loginContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    direction: 'rtl',
  },
  loginBox: {
    maxWidth: '380px',
    width: '100%',
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '20px',
    padding: '40px 30px',
    textAlign: 'center',
  },
  loginLogoIcon: {
    width: '70px',
    height: '70px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    margin: '0 auto 20px',
    boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
  },
  loginTitle: {
    fontSize: '1.5rem',
    color: 'white',
    fontWeight: 800,
    margin: '0 0 8px 0',
  },
  loginSubtitle: {
    color: '#64748b',
    margin: '0 0 25px 0',
  },
  loginBtn: {
    width: '100%',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    padding: '14px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '1rem',
    marginTop: '10px',
  },
  backLink: {
    display: 'block',
    color: '#64748b',
    textDecoration: 'none',
    marginTop: '20px',
    fontSize: '0.9rem',
    textAlign: 'center',
  },
  header: {
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    borderBottom: '1px solid #10b981',
    padding: '15px 20px',
  },
  headerContent: {
    maxWidth: '900px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoIcon: {
    width: '45px',
    height: '45px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.3rem',
  },
  headerTitle: {
    color: 'white',
    fontSize: '1.2rem',
    fontWeight: 700,
    margin: 0,
  },
  headerSubtitle: {
    color: '#10b981',
    fontSize: '0.85rem',
    margin: 0,
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  userName: {
    color: '#94a3b8',
    fontSize: '0.9rem',
  },
  btnLogout: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #ef4444',
    background: 'transparent',
    color: '#ef4444',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '20px',
  },
  section: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '20px',
  },
  sectionTitle: {
    color: 'white',
    fontSize: '1.1rem',
    fontWeight: 600,
    margin: '0 0 15px 0',
  },
  searchTabs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px',
  },
  searchTab: {
    flex: 1,
    padding: '10px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  searchTabActive: {
    background: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10b981',
    color: '#10b981',
  },
  searchRow: {
    display: 'flex',
    gap: '10px',
  },
  searchGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 80px auto',
    gap: '10px',
  },
  suggestionsDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: '#1f2937',
    border: '1px solid #4b5563',
    borderRadius: '0 0 8px 8px',
    zIndex: 100,
    maxHeight: '200px',
    overflowY: 'auto',
  },
  suggestionItem: {
    padding: '10px 12px',
    cursor: 'pointer',
    borderBottom: '1px solid #374151',
    color: '#fff',
    fontSize: '0.9rem',
  },
  filterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  filterGridRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  filterLabel: {
    color: '#94a3b8',
    fontSize: '0.85rem',
    fontWeight: 500,
  },
  filterSelect: {
    padding: '10px 12px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: 'white',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  filterInput: {
    padding: '10px 12px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: 'white',
    fontSize: '0.9rem',
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: '15px',
    textAlign: 'right',
  },
  formLabel: {
    display: 'block',
    color: '#94a3b8',
    fontSize: '0.85rem',
    marginBottom: '6px',
  },
  formInput: {
    width: '100%',
    padding: '12px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: 'white',
    fontSize: '0.95rem',
    boxSizing: 'border-box',
  },
  searchBtn: {
    padding: '12px 20px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  clearBtn: {
    padding: '12px 16px',
    background: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid #ef4444',
    borderRadius: '8px',
    color: '#ef4444',
    cursor: 'pointer',
    fontWeight: 600,
  },
  errorText: {
    color: '#ef4444',
    fontSize: '0.9rem',
    marginTop: '10px',
  },
  vehicleInfoBox: {
    background: 'rgba(96, 165, 250, 0.1)',
    border: '1px solid rgba(96, 165, 250, 0.3)',
    borderRadius: '10px',
    padding: '12px',
    marginTop: '15px',
  },
  vehicleInfoHeader: {
    color: '#94a3b8',
    fontSize: '0.8rem',
    marginBottom: '6px',
  },
  vehicleInfoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'white',
    fontWeight: 600,
  },
  pcdBadge: {
    background: 'rgba(16, 185, 129, 0.2)',
    color: '#10b981',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.85rem',
  },
  rimBadge: {
    background: 'rgba(59, 130, 246, 0.2)',
    color: '#3b82f6',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  centerBoreBadge: {
    background: 'rgba(168, 85, 247, 0.2)',
    color: '#a855f7',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  resultsCount: {
    color: '#10b981',
    fontSize: '0.85rem',
  },
  stationCard: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '15px',
    marginBottom: '12px',
  },
  stationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
    paddingBottom: '12px',
    borderBottom: '1px solid #334155',
  },
  stationName: {
    color: 'white',
    fontWeight: 600,
    fontSize: '1rem',
  },
  stationAddress: {
    color: '#64748b',
    fontSize: '0.85rem',
    marginTop: '4px',
  },
  wheelCount: {
    color: '#10b981',
    fontSize: '0.85rem',
  },
  wheelsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: '8px',
  },
  wheelItem: {
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: '8px',
    padding: '10px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  wheelItemExact: {
    background: 'rgba(16, 185, 129, 0.2)',
    border: '2px solid #10b981',
  },
  wheelItemSmaller: {
    background: 'rgba(245, 158, 11, 0.1)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
  },
  wheelItemDonut: {
    borderStyle: 'dashed',
  },
  donutBadge: {
    fontSize: '0.65rem',
    color: '#f59e0b',
    marginTop: '2px',
  },
  wheelNumber: {
    color: '#10b981',
    fontSize: '1.3rem',
    fontWeight: 700,
  },
  wheelSpecs: {
    color: '#64748b',
    fontSize: '0.75rem',
    marginTop: '4px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '15px',
  },
  modal: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '450px',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '20px',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  modalTitle: {
    color: 'white',
    fontSize: '1.1rem',
    fontWeight: 600,
    margin: 0,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    fontSize: '1.5rem',
    cursor: 'pointer',
  },
  wheelInfoBox: {
    background: 'rgba(16, 185, 129, 0.1)',
    borderRadius: '10px',
    padding: '12px',
    marginBottom: '15px',
  },
  wheelInfoTitle: {
    color: '#10b981',
    fontWeight: 700,
  },
  wheelInfoSub: {
    color: '#94a3b8',
    fontSize: '0.85rem',
  },
  contactSection: {
    marginBottom: '15px',
  },
  contactTitle: {
    color: '#94a3b8',
    fontSize: '0.9rem',
    margin: '0 0 10px 0',
  },
  contactOption: {
    background: 'rgba(255,255,255,0.05)',
    border: '2px solid transparent',
    borderRadius: '10px',
    padding: '12px',
    marginBottom: '8px',
    cursor: 'pointer',
  },
  contactOptionSelected: {
    borderColor: '#60a5fa',
    background: 'rgba(96, 165, 250, 0.1)',
  },
  contactName: {
    color: 'white',
    fontWeight: 600,
  },
  contactPhone: {
    color: '#60a5fa',
    fontSize: '0.9rem',
  },
  previewTitle: {
    color: '#94a3b8',
    fontSize: '0.9rem',
    margin: '0 0 10px 0',
  },
  messagePreview: {
    background: '#0f172a',
    borderRadius: '10px',
    padding: '15px',
    marginBottom: '15px',
    whiteSpace: 'pre-line',
    fontSize: '0.9rem',
    lineHeight: 1.6,
    color: '#e2e8f0',
    border: '1px solid #334155',
  },
  copyBtn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    border: 'none',
    borderRadius: '10px',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '1rem',
  },
  copyBtnCopied: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  },
  spinner: {
    display: 'inline-block',
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '30px 20px',
    marginTop: '15px',
    background: 'rgba(16, 185, 129, 0.05)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    borderRadius: '12px',
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(16, 185, 129, 0.2)',
    borderTop: '3px solid #10b981',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '15px',
  },
  loadingText: {
    color: '#10b981',
    fontSize: '0.95rem',
    fontWeight: 500,
  },
}
