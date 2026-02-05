'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { getDistricts, getDistrictColor, getDistrictName, District } from '@/lib/districts'
import { VERSION } from '@/lib/version'
import AppHeader from '@/components/AppHeader'

interface Station {
  id: string
  name: string
  address: string
  city_id: string
  district: string | null
  cities: { name: string } | null
  wheel_station_managers: Manager[]
  totalWheels: number
  availableWheels: number
}

interface Manager {
  id: string
  full_name: string
  phone: string
  role: string
  is_primary: boolean
}

interface SearchResult {
  station: {
    id: string
    name: string
    address: string
    city: string | null
  }
  wheels: {
    id: string
    wheel_number: string
    rim_size: string
    bolt_count: number
    bolt_spacing: number
    center_bore?: number | null
    is_donut: boolean
    is_available: boolean
  }[]
  availableCount: number
  totalCount: number
}

interface FilterOptions {
  rim_sizes: string[]
  bolt_counts: number[]
  bolt_spacings: number[]
  center_bores: number[]
}

interface VehicleModelRecord {
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
  source_url?: string | null
  source?: string | null
}

function SearchPageContent() {
  const searchParams = useSearchParams()
  const fromStationId = searchParams.get('from')

  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [districts, setDistricts] = useState<District[]>([])

  // Station filter state
  const [stationFilter, setStationFilter] = useState('')

  // Search state
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null)
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null)
  const [searchFilters, setSearchFilters] = useState({
    rim_size: '',
    bolt_count: '',
    bolt_spacing: '',
    center_bore: '',
    district: '',
    available_only: true
  })

  // Vehicle lookup state
  const [showVehicleModal, setShowVehicleModal] = useState(false)
  const [vehicleSearchTab, setVehicleSearchTab] = useState<'plate' | 'model'>('plate')
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [vehicleLoading, setVehicleLoading] = useState(false)
  const [vehicleResult, setVehicleResult] = useState<{
    vehicle: {
      manufacturer: string
      model: string
      model_name?: string // Technical model code (degem_nm) from gov API
      year: number
      color?: string
      front_tire: string | null
      import_type?: string
      origin_country?: string
    }
    wheel_fitment: {
      pcd: string
      bolt_count: number
      bolt_spacing: number
      center_bore?: number
      rim_sizes_allowed?: number[]
      source_url?: string
    } | null
    source?: string // 'regular' | 'personal_import' | 'find_car_scrape' | 'local_db'
    is_personal_import?: boolean
    personal_import_warning?: string
  } | null>(null)
  const [vehicleError, setVehicleError] = useState<string | null>(null)
  const [vehicleSearchResults, setVehicleSearchResults] = useState<SearchResult[] | null>(null)
  const [manualRimSize, setManualRimSize] = useState<number | null>(null) // For personal imports without tire info

  // Model search state
  const [modelSearchMake, setModelSearchMake] = useState('')
  const [modelSearchModel, setModelSearchModel] = useState('')
  const [modelSearchYear, setModelSearchYear] = useState('')
  const [modelSearchTechnicalCode, setModelSearchTechnicalCode] = useState('') // degem_nm from gov API
  const [modelSearchLoading, setModelSearchLoading] = useState(false)
  const [modelMakeSuggestions, setModelMakeSuggestions] = useState<string[]>([])
  const [modelModelSuggestions, setModelModelSuggestions] = useState<string[]>([])
  const [showModelMakeSuggestions, setShowModelMakeSuggestions] = useState(false)
  const [showModelModelSuggestions, setShowModelModelSuggestions] = useState(false)
  const [modelSearchErrors, setModelSearchErrors] = useState<{make: boolean, model: boolean, year: boolean}>({make: false, model: false, year: false})

  // Multiple matching models state
  const [matchingModels, setMatchingModels] = useState<VehicleModelRecord[]>([])
  const [showModelSelectionModal, setShowModelSelectionModal] = useState(false)

  // Add vehicle model modal state
  const [showAddModelModal, setShowAddModelModal] = useState(false)
  const [addModelForm, setAddModelForm] = useState({
    make: '',
    make_he: '',
    model: '',
    year_from: '',
    year_to: '',
    bolt_count: '',
    bolt_spacing: '',
    center_bore: '',
    rim_size: '',
    tire_size_front: '',
    variants: '' // Technical model code (degem_nm) from gov API
  })
  const [addModelLoading, setAddModelLoading] = useState(false)
  const [makeSuggestions, setMakeSuggestions] = useState<string[]>([])
  const [makeHeSuggestions, setMakeHeSuggestions] = useState<string[]>([])
  const [modelSuggestions, setModelSuggestions] = useState<string[]>([])
  const [showMakeSuggestions, setShowMakeSuggestions] = useState(false)
  const [showMakeHeSuggestions, setShowMakeHeSuggestions] = useState(false)
  const [showModelSuggestions, setShowModelSuggestions] = useState(false)

  // Manager authentication for adding models
  const [isManagerLoggedIn, setIsManagerLoggedIn] = useState(false)
  const [managerPhone, setManagerPhone] = useState('')
  const [showManagerLoginModal, setShowManagerLoginModal] = useState(false)
  const [loginPhone, setLoginPhone] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [pendingVehicleData, setPendingVehicleData] = useState<any>(null)

  // Error report state
  const [showErrorReportModal, setShowErrorReportModal] = useState(false)
  const [errorReportVehicle, setErrorReportVehicle] = useState<any>(null)
  const [errorReportForm, setErrorReportForm] = useState({
    correct_bolt_count: '',
    correct_bolt_spacing: '',
    correct_center_bore: '',
    correct_rim_size: '',
    correct_tire_size: '',
    notes: ''
  })
  const [errorReportImage, setErrorReportImage] = useState<File | null>(null)
  const [errorReportLoading, setErrorReportLoading] = useState(false)

  useEffect(() => {
    // Check if user is authenticated (station manager or operator)
    const hasStationSession = Object.keys(localStorage).some(key => key.startsWith('station_session_'))
    const hasOperatorSession = localStorage.getItem('operator_session')
    const hasOldSession = Object.keys(localStorage).some(key => key.startsWith('wheel_manager_'))

    if (!hasStationSession && !hasOperatorSession && !hasOldSession) {
      // Not logged in - redirect to login
      window.location.href = '/login'
      return
    }

    // User is logged in - load stations
    fetchStations()
    fetchDistrictsData()
    // Check if manager is logged in from localStorage
    // Check multiple session types: vehicle_db_manager, call_center_session, operator_session
    const savedManager = localStorage.getItem('vehicle_db_manager')
    const callCenterSession = localStorage.getItem('call_center_session')
    const operatorSession = localStorage.getItem('operator_session')

    if (savedManager) {
      try {
        const { phone } = JSON.parse(savedManager)
        setIsManagerLoggedIn(true)
        setManagerPhone(phone)
      } catch {
        localStorage.removeItem('vehicle_db_manager')
      }
    } else if (callCenterSession) {
      // Manager logged in via call center page
      try {
        const { user, role } = JSON.parse(callCenterSession)
        if (role === 'manager' && user?.phone) {
          setIsManagerLoggedIn(true)
          setManagerPhone(user.phone)
        }
      } catch {
        // Invalid session, ignore
      }
    } else if (operatorSession) {
      // Check if operator is actually a manager
      try {
        const data = JSON.parse(operatorSession)
        // Check for new format from login page (managers can also work as operators)
        if (data.role === 'manager' && data.user?.phone) {
          setIsManagerLoggedIn(true)
          setManagerPhone(data.user.phone)
        } else if (data.is_manager && data.operator?.phone) {
          // Old format
          setIsManagerLoggedIn(true)
          setManagerPhone(data.operator.phone)
        }
      } catch {
        // Invalid session, ignore
      }
    }
  }, [])

  // Close modals on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showAddModelModal) setShowAddModelModal(false)
        else if (showManagerLoginModal) setShowManagerLoginModal(false)
        else if (showVehicleModal) closeVehicleModal()
        else if (showSearchModal) closeSearchModal()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [showSearchModal, showVehicleModal, showManagerLoginModal, showAddModelModal])

  const fetchDistrictsData = async () => {
    try {
      const districtsData = await getDistricts()
      setDistricts(districtsData)
    } catch (err) {
      console.error('Error fetching districts:', err)
    }
  }

  const fetchStations = async () => {
    try {
      const response = await fetch('/api/wheel-stations')
      if (!response.ok) throw new Error('Failed to fetch stations')
      const data = await response.json()
      setStations(data.stations || [])
    } catch (err) {
      setError('שגיאה בטעינת התחנות')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    // Need at least one filter
    if (!searchFilters.rim_size && !searchFilters.bolt_count && !searchFilters.bolt_spacing && !searchFilters.center_bore) {
      toast.error('נא לבחור לפחות פילטר אחד')
      return
    }

    setSearchLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchFilters.rim_size) params.append('rim_size', searchFilters.rim_size)
      if (searchFilters.bolt_count) params.append('bolt_count', searchFilters.bolt_count)
      if (searchFilters.bolt_spacing) params.append('bolt_spacing', searchFilters.bolt_spacing)
      if (searchFilters.center_bore) params.append('center_bore', searchFilters.center_bore)
      if (searchFilters.district) params.append('district', searchFilters.district)
      if (searchFilters.available_only) params.append('available_only', 'true')

      const response = await fetch(`/api/wheel-stations/search?${params}`)
      if (!response.ok) throw new Error('Failed to search')
      const data = await response.json()
      setSearchResults(data.results)
      setFilterOptions(data.filterOptions)
    } catch (err) {
      console.error(err)
      toast.error('שגיאה בחיפוש')
    } finally {
      setSearchLoading(false)
    }
  }

  const openSearchModal = async () => {
    setShowSearchModal(true)
    setSearchResults(null)
    // Fetch filter options
    if (!filterOptions) {
      try {
        const response = await fetch('/api/wheel-stations/filter-options')
        if (response.ok) {
          const data = await response.json()
          setFilterOptions(data.filterOptions)
        }
      } catch (err) {
        console.error(err)
      }
    }
  }

  const closeSearchModal = () => {
    setShowSearchModal(false)
    setSearchResults(null)
    setSearchFilters({
      rim_size: '',
      bolt_count: '',
      bolt_spacing: '',
      center_bore: '',
      district: '',
      available_only: true
    })
  }

  // Vehicle lookup functions
  const openVehicleModal = () => {
    setShowVehicleModal(true)
    setVehicleResult(null)
    setVehicleError(null)
    setVehicleSearchResults(null)
    setVehiclePlate('')
    setModelSearchMake('')
    setModelSearchModel('')
    setModelSearchYear('')
    setVehicleSearchTab('plate')
  }

  const closeVehicleModal = () => {
    setShowVehicleModal(false)
    setVehicleResult(null)
    setVehicleError(null)
    setVehicleSearchResults(null)
    setVehiclePlate('')
    setModelSearchMake('')
    setModelSearchModel('')
    setModelSearchYear('')
  }

  // Extract rim size from tire string
  const extractRimSize = (tire: string | null | undefined): number | null => {
    if (!tire) return null
    const match = tire.match(/R(\d+)/i)
    return match ? parseInt(match[1]) : null
  }

  const handleVehicleLookup = async () => {
    if (!vehiclePlate.trim()) {
      toast.error('נא להזין מספר רישוי')
      return
    }

    setVehicleLoading(true)
    setVehicleError(null)
    setVehicleResult(null)
    setVehicleSearchResults(null)

    try {
      const response = await fetch(`/api/vehicle/lookup?plate=${encodeURIComponent(vehiclePlate)}`)
      const data = await response.json()

      if (!response.ok) {
        setVehicleError(data.error || 'שגיאה בחיפוש')
        return
      }

      setVehicleResult(data)

      // If we have wheel fitment, search for matching wheels
      // Search by PCD only (don't filter by rim_size) to show all compatible wheels
      if (data.wheel_fitment) {
        const params = new URLSearchParams()
        params.set('bolt_count', data.wheel_fitment.bolt_count.toString())
        params.set('bolt_spacing', data.wheel_fitment.bolt_spacing.toString())
        // Don't filter by rim_size - show all PCD-compatible wheels
        params.set('available_only', 'true')

        const searchResponse = await fetch(`/api/wheel-stations/search?${params}`)
        if (searchResponse.ok) {
          const searchData = await searchResponse.json()
          setVehicleSearchResults(searchData.results)
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'בעיה בתקשורת עם השרת'
      setVehicleError(`שגיאה בחיבור לשרת: ${errorMessage}`)
    } finally {
      setVehicleLoading(false)
    }
  }

  // Search by make/model/year using wheel-size.com scraper
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
    setVehicleSearchResults(null)
    setShowModelMakeSuggestions(false)
    setShowModelModelSuggestions(false)

    // Extract English make name if contains Hebrew in parentheses
    const englishMake = modelSearchMake.includes('(') ? modelSearchMake.split(' (')[0] : (hebrewToEnglishMakes[modelSearchMake] || modelSearchMake)

    // Extract English model name if contains Hebrew in parentheses
    const englishModel = modelSearchModel.includes('(') ? modelSearchModel.split(' (')[0] : (hebrewToEnglishModels[modelSearchModel] || modelSearchModel)

    try {
      // First try local DB
      const localResponse = await fetch(
        `/api/vehicle-models?make=${encodeURIComponent(englishMake)}&model=${encodeURIComponent(englishModel)}&year=${modelSearchYear}`
      )
      const localData = await localResponse.json()

      let wheelFitment = null

      if (localData.models && localData.models.length > 0) {
        const models = localData.models as VehicleModelRecord[]

        // Group by unique PCD (bolt_count x bolt_spacing) + center_bore
        const uniqueSpecs = new Map<string, VehicleModelRecord>()
        models.forEach(m => {
          const specKey = `${m.bolt_count}x${m.bolt_spacing}-${m.center_bore || 'null'}`
          if (!uniqueSpecs.has(specKey)) {
            uniqueSpecs.set(specKey, m)
          }
        })

        // If more than one unique spec, show selection modal
        if (uniqueSpecs.size > 1) {
          setMatchingModels(Array.from(uniqueSpecs.values()))
          setShowModelSelectionModal(true)
          setModelSearchLoading(false)
          return
        }

        // Found in local DB - single result
        const model = models[0]
        wheelFitment = {
          pcd: `${model.bolt_count}×${model.bolt_spacing}`,
          bolt_count: model.bolt_count,
          bolt_spacing: model.bolt_spacing,
          center_bore: model.center_bore || undefined,
          rim_sizes_allowed: model.rim_sizes_allowed || undefined,
          source_url: model.source_url || undefined
        }
        setVehicleResult({
          vehicle: {
            manufacturer: model.make,
            model: model.model,
            year: parseInt(modelSearchYear),
            color: '',
            front_tire: model.tire_size_front || ''
          },
          wheel_fitment: wheelFitment,
          source: 'local_db' // From our local database
        })
      }

      // Search for matching wheels if we have fitment data
      if (wheelFitment) {
        const params = new URLSearchParams()
        params.set('bolt_count', wheelFitment.bolt_count.toString())
        params.set('bolt_spacing', wheelFitment.bolt_spacing.toString())
        params.set('available_only', 'true')

        const searchResponse = await fetch(`/api/wheel-stations/search?${params}`)
        if (searchResponse.ok) {
          const searchData = await searchResponse.json()
          setVehicleSearchResults(searchData.results)
        }
      } else {
        setVehicleError('לא נמצאו מידות גלגל לדגם זה. נסה לחפש באתר wheel-size.com')
      }
    } catch {
      setVehicleError('שגיאה בחיפוש')
    } finally {
      setModelSearchLoading(false)
    }
  }

  // Handle model selection when multiple models match
  const handleVehicleModelSelect = async (selectedModel: VehicleModelRecord) => {
    setShowModelSelectionModal(false)
    setMatchingModels([])
    setModelSearchLoading(true)

    try {
      const wheelFitment = {
        pcd: `${selectedModel.bolt_count}×${selectedModel.bolt_spacing}`,
        bolt_count: selectedModel.bolt_count,
        bolt_spacing: selectedModel.bolt_spacing,
        center_bore: selectedModel.center_bore || undefined,
        rim_sizes_allowed: selectedModel.rim_sizes_allowed || undefined,
        source_url: selectedModel.source_url || undefined
      }

      setVehicleResult({
        vehicle: {
          manufacturer: selectedModel.make,
          model: selectedModel.model,
          year: parseInt(modelSearchYear) || selectedModel.year_from || 0,
          color: '',
          front_tire: selectedModel.tire_size_front || ''
        },
        wheel_fitment: wheelFitment,
        source: 'local_db'
      })

      // Search for matching wheels
      const params = new URLSearchParams()
      params.set('bolt_count', wheelFitment.bolt_count.toString())
      params.set('bolt_spacing', wheelFitment.bolt_spacing.toString())
      params.set('available_only', 'true')

      const searchResponse = await fetch(`/api/wheel-stations/search?${params}`)
      if (searchResponse.ok) {
        const searchData = await searchResponse.json()
        setVehicleSearchResults(searchData.results)
      }
    } catch {
      setVehicleError('שגיאה בחיפוש')
    } finally {
      setModelSearchLoading(false)
    }
  }

  // Report error for incorrect vehicle model
  const handleReportVehicleModelError = async (model: VehicleModelRecord) => {
    try {
      const res = await fetch('/api/error-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle_model_id: model.id,
          make: model.make,
          model: model.model,
          year_from: model.year_from,
          notes: `דיווח על מידע שגוי/כפול. PCD: ${model.bolt_count}×${model.bolt_spacing}, CB: ${model.center_bore || 'לא צוין'}`
        })
      })

      if (res.ok) {
        toast.success('הדיווח נשלח בהצלחה')
      } else {
        toast.error('שגיאה בשליחת הדיווח')
      }
    } catch {
      toast.error('שגיאה בשליחת הדיווח')
    }
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
    'קליאו': 'Clio', 'מגאן': 'Megane', 'סי 3': 'C3', 'סי 4': 'C4', '208': '208', '308': '308'
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
    '208': 'Peugeot', '308': 'Peugeot'
  }

  // Fetch suggestions for model search (supports Hebrew and English)
  const fetchModelSearchMakeSuggestions = async (value: string) => {
    if (value.length < 2) {
      setModelMakeSuggestions([])
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

      data.vehicles?.forEach((v: any) => {
        if (v.make && !seen.has(v.make.toLowerCase())) {
          seen.add(v.make.toLowerCase())
          const hebrewName = Object.entries(hebrewToEnglishMakes).find(([, eng]) => eng.toLowerCase() === v.make.toLowerCase())?.[0]
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

      setModelMakeSuggestions(suggestions.slice(0, 8))
    } catch {
      setModelMakeSuggestions([])
    }
  }

  const fetchModelSearchModelSuggestions = async (make: string, value: string) => {
    if (value.length < 2 || !make) {
      setModelModelSuggestions([])
      return
    }

    // Extract English make name if contains Hebrew in parentheses
    const englishMake = make.includes('(') ? make.split(' (')[0] : (hebrewToEnglishMakes[make] || make)

    // Check if Hebrew model input, translate to English
    const englishModel = hebrewToEnglishModels[value] || value

    try {
      const response = await fetch(`/api/vehicle-models?make=${encodeURIComponent(englishMake)}&model=${encodeURIComponent(englishModel)}`)
      const data = await response.json()

      // Get unique models from database
      const suggestions: string[] = []
      const seen = new Set<string>()

      data.models?.forEach((v: any) => {
        if (v.model && !seen.has(v.model.toLowerCase())) {
          seen.add(v.model.toLowerCase())
          const hebrewName = Object.entries(hebrewToEnglishModels).find(([, eng]) => eng.toLowerCase() === v.model.toLowerCase())?.[0]
          suggestions.push(hebrewName ? `${v.model} (${hebrewName})` : v.model)
        }
      })

      // Add common models that match - ONLY if they belong to the selected make
      Object.entries(hebrewToEnglishModels).forEach(([he, en]) => {
        // Check if this model belongs to the selected make
        const modelMake = modelToMake[en]
        if (modelMake && modelMake.toLowerCase() === englishMake.toLowerCase()) {
          if ((he.includes(value) || en.toLowerCase().includes(value.toLowerCase())) && !seen.has(en.toLowerCase())) {
            seen.add(en.toLowerCase())
            suggestions.push(`${en} (${he})`)
          }
        }
      })

      setModelModelSuggestions(suggestions.slice(0, 8))
    } catch {
      setModelModelSuggestions([])
    }
  }

  // Fetch autocomplete suggestions
  const fetchMakeSuggestions = async (value: string) => {
    if (value.length < 2) {
      setMakeSuggestions([])
      return
    }
    try {
      const response = await fetch(`/api/vehicle-models?make=${encodeURIComponent(value)}`)
      const data = await response.json()
      const uniqueMakes = [...new Set(data.vehicles.map((v: any) => v.make as string))]
      setMakeSuggestions(uniqueMakes.slice(0, 5) as string[])
    } catch {
      setMakeSuggestions([])
    }
  }

  const fetchMakeHeSuggestions = async (value: string) => {
    if (value.length < 2) {
      setMakeHeSuggestions([])
      return
    }
    try {
      const response = await fetch(`/api/vehicle-models?make=${encodeURIComponent(value)}`)
      const data = await response.json()
      const uniqueMakes = [...new Set(data.vehicles.map((v: any) => v.make_he as string))]
      setMakeHeSuggestions(uniqueMakes.slice(0, 5) as string[])
    } catch {
      setMakeHeSuggestions([])
    }
  }

  const fetchModelSuggestions = async (value: string) => {
    if (value.length < 2) {
      setModelSuggestions([])
      return
    }
    try {
      const response = await fetch(`/api/vehicle-models?model=${encodeURIComponent(value)}`)
      const data = await response.json()
      const uniqueModels = [...new Set(data.vehicles.map((v: any) => v.model as string))]
      setModelSuggestions(uniqueModels.slice(0, 5) as string[])
    } catch {
      setModelSuggestions([])
    }
  }

  // Manager login
  const handleManagerLogin = async () => {
    if (!loginPhone || !loginPassword) {
      toast.error('נא למלא טלפון וסיסמה')
      return
    }

    setLoginLoading(true)
    try {
      // Try to authenticate as wheel station manager or city manager
      const response = await fetch('/api/wheel-stations/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: loginPhone, password: loginPassword })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'שגיאה בהתחברות')
      }

      // Save to localStorage
      const locationName = data.manager?.station_name || data.manager?.city_name || ''
      localStorage.setItem('vehicle_db_manager', JSON.stringify({
        phone: loginPhone,
        name: data.manager?.full_name || '',
        location: locationName
      }))

      setIsManagerLoggedIn(true)
      setManagerPhone(loginPhone)
      setShowManagerLoginModal(false)
      setLoginPhone('')
      setLoginPassword('')

      const welcomeMsg = locationName
        ? `ברוך הבא ${data.manager?.full_name}, ${locationName}!`
        : `ברוך הבא, ${data.manager?.full_name || 'מנהל'}!`
      toast.success(welcomeMsg)

      // If there's pending vehicle data, open the add model form
      if (pendingVehicleData) {
        setAddModelForm({
          ...addModelForm,
          make: pendingVehicleData.make,
          make_he: pendingVehicleData.make_he,
          model: pendingVehicleData.model,
          year_from: pendingVehicleData.year_from,
          tire_size_front: pendingVehicleData.tire_size_front
        })
        setShowAddModelModal(true)
        setPendingVehicleData(null)
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'בעיה בתקשורת עם השרת'
      toast.error(`התחברות נכשלה: ${errorMessage}`)
    } finally {
      setLoginLoading(false)
    }
  }

  // Open error report modal
  const handleOpenErrorReport = (vehicle: any, wheelFitment: any) => {
    setErrorReportVehicle({ vehicle, wheelFitment })
    setErrorReportForm({
      correct_bolt_count: '',
      correct_bolt_spacing: '',
      correct_center_bore: '',
      correct_rim_size: '',
      correct_tire_size: '',
      notes: ''
    })
    setErrorReportImage(null)
    setShowErrorReportModal(true)
  }

  // Submit error report
  const handleSubmitErrorReport = async () => {
    // Prevent double submission
    if (errorReportLoading) return

    // At least one correction or note is required
    if (!errorReportForm.correct_bolt_count && !errorReportForm.correct_bolt_spacing &&
        !errorReportForm.correct_center_bore && !errorReportForm.correct_rim_size &&
        !errorReportForm.correct_tire_size && !errorReportForm.notes) {
      toast.error('נא למלא לפחות שדה אחד')
      return
    }

    setErrorReportLoading(true)

    try {
      // Upload image to Supabase Storage if provided
      let imageUrl = null
      if (errorReportImage) {
        const formData = new FormData()
        formData.append('file', errorReportImage)
        formData.append('bucket', 'error-reports')

        // For now, we'll skip image upload and just save the report
        // Image upload would require Supabase Storage setup
      }

      const response = await fetch('/api/error-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          make: errorReportVehicle?.vehicle?.manufacturer,
          model: errorReportVehicle?.vehicle?.model,
          year_from: errorReportVehicle?.vehicle?.year,
          image_url: imageUrl,
          correct_bolt_count: errorReportForm.correct_bolt_count ? parseInt(errorReportForm.correct_bolt_count) : null,
          correct_bolt_spacing: errorReportForm.correct_bolt_spacing ? parseFloat(errorReportForm.correct_bolt_spacing) : null,
          correct_center_bore: errorReportForm.correct_center_bore ? parseFloat(errorReportForm.correct_center_bore) : null,
          correct_rim_size: errorReportForm.correct_rim_size || null,
          correct_tire_size: errorReportForm.correct_tire_size || null,
          notes: errorReportForm.notes || null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'שגיאה לא ידועה בשליחת הדיווח')
      }

      toast.success('הדיווח נשלח בהצלחה! תודה על העזרה')
      setShowErrorReportModal(false)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'שגיאה בתקשורת עם השרת'
      toast.error(`שליחת הדיווח נכשלה: ${errorMessage}`)
    } finally {
      setErrorReportLoading(false)
    }
  }

  // Open add model modal - check if logged in first
  const handleOpenAddModel = (vehicleData: any) => {
    if (!isManagerLoggedIn) {
      // Save vehicle data and show login modal
      setPendingVehicleData(vehicleData)
      setShowManagerLoginModal(true)
    } else {
      // Already logged in, open add model form
      setAddModelForm({
        ...addModelForm,
        ...vehicleData
      })
      setShowAddModelModal(true)
    }
  }

  const handleAddVehicleModel = async () => {
    // Validate required fields
    if (!addModelForm.make || !addModelForm.make_he || !addModelForm.model ||
        !addModelForm.bolt_count || !addModelForm.bolt_spacing) {
      toast.error('נא למלא את כל השדות החובה')
      return
    }

    setAddModelLoading(true)

    try {
      const response = await fetch('/api/vehicle-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...addModelForm,
          added_by: managerPhone
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'שגיאה בהוספת הדגם')
      }

      toast.success('הדגם נוסף בהצלחה למאגר!')
      setShowAddModelModal(false)
      // Reset form
      setAddModelForm({
        make: '',
        make_he: '',
        model: '',
        year_from: '',
        year_to: '',
        bolt_count: '',
        bolt_spacing: '',
        center_bore: '',
        rim_size: '',
        tire_size_front: '',
        variants: ''
      })
      setModelSearchTechnicalCode('') // Reset technical code
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'בעיה בתקשורת עם השרת'
      toast.error(`הוספת הדגם נכשלה: ${errorMessage}`)
    } finally {
      setAddModelLoading(false)
    }
  }

  // No loading screen needed - search page loads instantly

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <p>❌ {error}</p>
          <button onClick={fetchStations} style={styles.retryBtn}>נסה שוב</button>
        </div>
      </div>
    )
  }

  return (
    <>
      <AppHeader />
      <div style={styles.container}>
        <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.95); }
        }
        .suggestion-item:hover {
          background: #374151 !important;
        }
        .suggestion-item:last-child {
          border-bottom: none !important;
        }
        /* Focus states for accessibility */
        .wheels-search-btn:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
        }
        .wheels-close-btn {
          min-width: 44px;
          min-height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          transition: all 0.2s;
        }
        .wheels-close-btn:hover {
          background: rgba(255,255,255,0.1);
        }
        .wheels-close-btn:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
        }
        .wheels-card:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.5);
        }
        .wheels-card:hover {
          transform: translateY(-4px);
          border-color: #f59e0b;
        }
        .wheels-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }
        .wheels-station-filter::placeholder {
          color: rgba(255,255,255,0.5);
        }
        .wheels-station-filter:focus {
          border-color: #f59e0b;
          background: rgba(255,255,255,0.15);
        }
        .wheels-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }
        .wheels-btn-loading {
          pointer-events: none;
          opacity: 0.7;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .wheels-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          display: inline-block;
        }
        /* Tablet breakpoint (768px) */
        @media (max-width: 768px) {
          .wheels-search-btn {
            padding: 12px 20px !important;
            font-size: 0.9rem !important;
          }
          .wheels-header-title {
            font-size: 1.8rem !important;
          }
          .wheels-header-icon {
            width: 90px !important;
            height: 90px !important;
          }
          .wheels-filter-grid {
            grid-template-columns: 1fr !important;
          }
          .wheels-vehicle-modal {
            max-width: calc(100vw - 30px) !important;
            padding: 18px !important;
            max-height: 90vh !important;
          }
          .wheels-search-modal {
            padding: 18px !important;
            max-width: calc(100vw - 30px) !important;
            max-height: 90vh !important;
          }
          .wheels-add-model-modal {
            max-width: calc(100vw - 30px) !important;
            max-height: 90vh !important;
          }
          .wheels-add-model-modal .wheels-form-row {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .wheels-add-model-modal .wheels-form-section {
            padding: 14px !important;
          }
          .wheels-modal-title {
            font-size: 1.15rem !important;
          }
        }
        /* Mobile breakpoint (480px) */
        @media (max-width: 480px) {
          .wheels-search-btn {
            padding: 10px 16px !important;
            font-size: 0.85rem !important;
          }
          .wheels-header-title {
            font-size: 1.5rem !important;
          }
          .wheels-header-icon {
            width: 70px !important;
            height: 70px !important;
          }
          .wheels-vehicle-modal {
            padding: 15px !important;
            max-width: calc(100vw - 20px) !important;
          }
          .wheels-vehicle-modal .wheels-fitment-badges {
            flex-direction: column !important;
            gap: 8px !important;
          }
          .wheels-vehicle-modal .wheels-vehicle-info-details {
            flex-direction: column !important;
            gap: 5px !important;
          }
          .wheels-result-wheel-card {
            min-width: 80px !important;
            padding: 8px 10px !important;
          }
          .wheels-search-modal {
            padding: 15px !important;
            max-width: calc(100vw - 20px) !important;
          }
          .wheels-add-model-modal {
            max-width: calc(100vw - 20px) !important;
            border-radius: 16px !important;
          }
          .wheels-add-model-modal .wheels-form-row {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
          .wheels-add-model-modal .wheels-modal-header {
            padding: 16px 18px !important;
          }
          .wheels-add-model-modal .wheels-form-content {
            padding: 16px 18px 20px !important;
            gap: 16px !important;
          }
          .wheels-add-model-modal .wheels-form-section {
            padding: 12px !important;
          }
          .wheels-add-model-modal .wheels-form-actions {
            flex-direction: column !important;
          }
          .wheels-add-model-modal .wheels-form-actions button {
            width: 100% !important;
          }
          .wheels-modal-title {
            font-size: 1rem !important;
          }
        }
      `}</style>
      {/* Back to station button */}
      {fromStationId && (
        <div style={styles.backToStationContainer}>
          <Link href={`/${fromStationId}`} style={styles.backToStationBtn}>
            ← חזרה לתחנה
          </Link>
        </div>
      )}

      {/* Search Page Header */}
      <header style={styles.searchPageHeader}>
        <h1 style={styles.searchPageTitle}>🔍 חיפוש גלגל</h1>
        <p style={styles.searchPageSubtitle}>מצא גלגל מתאים לפי מספר רכב או מפרט טכני</p>
      </header>

      {/* Search Type Selection */}
      <div style={styles.searchTypeContainer}>
        <button
          style={{...styles.searchTypeBtn, ...(vehicleSearchTab === 'plate' || showVehicleModal ? styles.searchTypeBtnActive : {})}}
          onClick={openVehicleModal}
        >
          <span style={styles.searchTypeIcon}>🚗</span>
          <span>חיפוש לפי רכב</span>
        </button>
        <button
          style={{...styles.searchTypeBtn, ...(showSearchModal ? styles.searchTypeBtnActive : {})}}
          onClick={openSearchModal}
        >
          <span style={styles.searchTypeIcon}>🔧</span>
          <span>חיפוש לפי מפרט</span>
        </button>
      </div>

      <footer style={styles.footer}>
        <div style={styles.footerInfo}>
          <p style={styles.footerText}>
            מערכת גלגלים ידידים •{' '}
            <Link href="/feedback" style={styles.feedbackLink}>
              דווח על בעיה או הצע שיפור
            </Link>
          </p>
          <p style={styles.legalLinks}>
            <Link href="/guide" style={styles.legalLink}>
              מדריך למשתמש
            </Link>
            {' • '}
            <Link href="/privacy" style={styles.legalLink}>
              מדיניות פרטיות
            </Link>
            {' • '}
            <Link href="/accessibility" style={styles.legalLink}>
              הצהרת נגישות
            </Link>
          </p>
          <p style={styles.versionText}>גירסה {VERSION}</p>
        </div>
      </footer>

      {/* Search Modal */}
      {showSearchModal && (
        <div style={styles.modalOverlay} onClick={closeSearchModal}>
          <div style={styles.modal} className="wheels-search-modal" onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle} className="wheels-modal-title">🔍 חיפוש גלגל</h3>
              <button style={styles.closeBtn} className="wheels-close-btn" onClick={closeSearchModal} aria-label="סגור חיפוש">✕</button>
            </div>

            {!searchResults ? (
              <>
                <p style={styles.modalSubtitle}>בחר מפרט לחיפוש בכל התחנות</p>

                <div style={styles.filterGrid} className="wheels-filter-grid">
                  <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>גודל ג'אנט</label>
                    <select
                      style={styles.filterSelect}
                      value={searchFilters.rim_size}
                      onChange={e => setSearchFilters({...searchFilters, rim_size: e.target.value})}
                    >
                      <option value="">בחר...</option>
                      {filterOptions?.rim_sizes.map(size => (
                        <option key={size} value={size}>{size}"</option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>כמות ברגים</label>
                    <select
                      style={styles.filterSelect}
                      value={searchFilters.bolt_count}
                      onChange={e => setSearchFilters({...searchFilters, bolt_count: e.target.value})}
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
                      value={searchFilters.bolt_spacing}
                      onChange={e => setSearchFilters({...searchFilters, bolt_spacing: e.target.value})}
                    >
                      <option value="">בחר...</option>
                      {filterOptions?.bolt_spacings.map(spacing => (
                        <option key={spacing} value={spacing}>{spacing}</option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>CB (קוטר מרכז)</label>
                    <select
                      style={styles.filterSelect}
                      value={searchFilters.center_bore}
                      onChange={e => setSearchFilters({...searchFilters, center_bore: e.target.value})}
                    >
                      <option value="">בחר...</option>
                      {filterOptions?.center_bores?.map(cb => (
                        <option key={cb} value={cb}>{cb}</option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>מחוז</label>
                    <select
                      style={styles.filterSelect}
                      value={searchFilters.district}
                      onChange={e => setSearchFilters({...searchFilters, district: e.target.value})}
                    >
                      <option value="">כל המחוזות</option>
                      {districts.map(district => (
                        <option key={district.code} value={district.code}>{district.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    id="available_only"
                    checked={searchFilters.available_only}
                    onChange={e => setSearchFilters({...searchFilters, available_only: e.target.checked})}
                  />
                  <label htmlFor="available_only" style={styles.checkboxLabel}>הצג רק זמינים</label>
                </div>

                <button
                  style={styles.searchSubmitBtn}
                  onClick={handleSearch}
                  disabled={searchLoading}
                >
                  {searchLoading ? <><span className="wheels-spinner"></span> מחפש...</> : '🔍 חפש'}
                </button>
              </>
            ) : (
              <>
                <button style={styles.backToFiltersBtn} onClick={() => setSearchResults(null)}>
                  ← חזרה לסינון
                </button>

                {searchResults.length === 0 ? (
                  <div style={styles.noResults}>
                    <p>😕 לא נמצאו גלגלים מתאימים</p>
                    <p style={styles.noResultsHint}>נסה לשנות את הפילטרים</p>
                  </div>
                ) : (
                  <div style={styles.resultsList}>
                    <div style={styles.resultsHeader}>
                      נמצאו {searchResults.reduce((acc, r) => acc + (r.totalCount || 0), 0)} גלגלים ב-{searchResults.length} תחנות
                    </div>

                    {searchResults.map(result => (
                      <div key={result.station.id} style={styles.resultStationGroup}>
                        <div style={styles.resultStationHeader}>
                          <div style={styles.resultStationName}>{result.station.name}</div>
                        </div>
                        {result.station.address && (
                          <div style={styles.resultAddress}>📍 {result.station.address}</div>
                        )}
                        <div style={styles.resultWheelsList}>
                          {result.wheels.map(wheel => (
                            <Link
                              key={wheel.id}
                              href={`/${result.station.id}#wheel-${wheel.wheel_number}`}
                              style={{
                                ...styles.resultWheelCard,
                                ...(wheel.is_available ? {} : styles.resultWheelTaken)
                              }}
                              onClick={closeSearchModal}
                            >
                              <div style={styles.resultWheelNumber}>#{wheel.wheel_number}</div>
                              <div style={styles.resultWheelSpecs}>
                                <span>{wheel.rim_size}"</span>
                                <span>{wheel.bolt_count}×{wheel.bolt_spacing}</span>
                                {wheel.center_bore && <span>CB {wheel.center_bore}</span>}
                                {wheel.is_donut && <span style={styles.resultDonutBadge}>דונאט</span>}
                              </div>
                              <div style={{
                                ...styles.resultWheelStatus,
                                color: wheel.is_available ? '#10b981' : '#ef4444'
                              }}>
                                {wheel.is_available ? '✅ זמין' : '🔴 מושאל'}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Model Selection Modal - When multiple specs found */}
      {showModelSelectionModal && matchingModels.length > 0 && (
        <div style={styles.modalOverlay} onClick={() => setShowModelSelectionModal(false)}>
          <div style={{...styles.modal, maxWidth: '500px', background: '#1e293b'}} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>נמצאו מספר מפרטים לרכב זה</h3>
              <button style={styles.closeBtn} onClick={() => setShowModelSelectionModal(false)}>✕</button>
            </div>

            <div style={{padding: '15px'}}>
              <p style={{color: '#94a3b8', marginBottom: '15px', fontSize: '14px'}}>
                נמצאו {matchingModels.length} רשומות שונות. בחר את המפרט הנכון:
              </p>

              {matchingModels.map((m, idx) => (
                <div
                  key={m.id}
                  style={{
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '10px',
                    background: '#0f172a'
                  }}
                >
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                    <span style={{fontWeight: 600, color: '#e2e8f0'}}>
                      אפשרות {idx + 1}
                    </span>
                    <div style={{display: 'flex', gap: '8px'}}>
                      <button
                        onClick={() => handleVehicleModelSelect(m)}
                        style={{
                          background: '#2563eb',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        בחר
                      </button>
                      <button
                        onClick={() => handleReportVehicleModelError(m)}
                        style={{
                          background: '#f59e0b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        ⚠️ דווח שגיאה
                      </button>
                    </div>
                  </div>
                  <div style={{fontSize: '14px', color: '#94a3b8'}}>
                    <div><strong>PCD:</strong> {m.bolt_count}×{m.bolt_spacing}</div>
                    {m.center_bore && <div><strong>CB:</strong> {m.center_bore}</div>}
                    {m.rim_size && <div><strong>גודל ג&apos;אנט:</strong> {m.rim_size}&quot;</div>}
                    {m.year_from && <div><strong>שנים:</strong> {m.year_from}{m.year_to ? `-${m.year_to}` : '+'}</div>}
                    {m.source && <div style={{fontSize: '12px', color: '#64748b', marginTop: '4px'}}>מקור: {m.source}</div>}
                  </div>
                </div>
              ))}

              <p style={{color: '#64748b', fontSize: '12px', marginTop: '10px'}}>
                💡 בחר את המפרט הנכון. אם יש מידע שגוי - לחץ &quot;דווח שגיאה&quot; והאדמין יטפל
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Lookup Modal */}
      {showVehicleModal && (
        <div style={styles.modalOverlay} onClick={closeVehicleModal}>
          <div style={styles.vehicleModal} className="wheels-vehicle-modal" onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle} className="wheels-modal-title">🚗 חיפוש לפי רכב</h3>
              <button style={styles.closeBtn} className="wheels-close-btn" onClick={closeVehicleModal} aria-label="סגור חיפוש רכב">✕</button>
            </div>

            {/* Beta warning */}
            <div style={styles.betaWarning}>
              ⚠️ פיצ'ר בפיתוח - יתכנו טעויות בזיהוי מידות הגלגל
            </div>

            {/* Tabs */}
            <div style={{
              display: 'flex',
              gap: '0',
              marginBottom: '16px',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid #4b5563'
            }}>
              <button
                role="tab"
                aria-selected={vehicleSearchTab === 'plate'}
                aria-controls="plate-search-panel"
                onClick={() => { setVehicleSearchTab('plate'); setVehicleResult(null); setVehicleError(null); setVehicleSearchResults(null); setManualRimSize(null); }}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  border: 'none',
                  background: vehicleSearchTab === 'plate' ? '#3b82f6' : 'transparent',
                  color: vehicleSearchTab === 'plate' ? '#fff' : '#9ca3af',
                  cursor: 'pointer',
                  fontWeight: vehicleSearchTab === 'plate' ? 'bold' : 'normal',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s'
                }}
              >
                🔢 מספר רכב
              </button>
              <button
                role="tab"
                aria-selected={vehicleSearchTab === 'model'}
                aria-controls="model-search-panel"
                onClick={() => { setVehicleSearchTab('model'); setVehicleResult(null); setVehicleError(null); setVehicleSearchResults(null); setManualRimSize(null); }}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  border: 'none',
                  borderRight: '1px solid #4b5563',
                  background: vehicleSearchTab === 'model' ? '#3b82f6' : 'transparent',
                  color: vehicleSearchTab === 'model' ? '#fff' : '#9ca3af',
                  cursor: 'pointer',
                  fontWeight: vehicleSearchTab === 'model' ? 'bold' : 'normal',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s'
                }}
              >
                🚘 יצרן ודגם
              </button>
            </div>

            {/* Tab Content: Plate Search */}
            {vehicleSearchTab === 'plate' && (
              <div id="plate-search-panel" role="tabpanel" style={styles.vehicleInputRow}>
                <input
                  type="text"
                  inputMode="numeric"
                  value={vehiclePlate}
                  onChange={e => setVehiclePlate(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleVehicleLookup()}
                  placeholder="הזן מספר רישוי..."
                  style={styles.vehicleInput}
                  dir="ltr"
                  autoFocus
                />
                <button
                  onClick={handleVehicleLookup}
                  disabled={vehicleLoading}
                  style={styles.vehicleLookupBtn}
                >
                  {vehicleLoading ? (
                    <span className="spinning-wheel">🛞</span>
                  ) : '🔍'}
                </button>
              </div>
            )}

            {/* Tab Content: Model Search */}
            {vehicleSearchTab === 'model' && (
              <div id="model-search-panel" role="tabpanel" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Make Input with Autocomplete */}
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type="text"
                    value={modelSearchMake}
                    onChange={e => {
                      setModelSearchMake(e.target.value)
                      fetchModelSearchMakeSuggestions(e.target.value)
                      setShowModelMakeSuggestions(true)
                      if (modelSearchErrors.make) setModelSearchErrors(prev => ({...prev, make: false}))
                    }}
                    onFocus={() => modelSearchMake.length >= 2 && setShowModelMakeSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowModelMakeSuggestions(false), 200)}
                    placeholder="יצרן - לדוגמה: Toyota או טויוטה"
                    style={{...styles.vehicleInput, width: '100%', flex: 'none', ...(modelSearchErrors.make && {borderColor: '#ef4444', boxShadow: '0 0 0 1px #ef4444'})}}
                  />
                  {showModelMakeSuggestions && modelMakeSuggestions.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: '#1f2937',
                      border: '1px solid #4b5563',
                      borderRadius: '0 0 8px 8px',
                      zIndex: 100,
                      maxHeight: '200px',
                      overflowY: 'auto'
                    }}>
                      {modelMakeSuggestions.map((suggestion, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            setModelSearchMake(suggestion)
                            setShowModelMakeSuggestions(false)
                            setModelModelSuggestions([])
                          }}
                          style={{
                            padding: '10px 12px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #374151',
                            color: '#fff',
                            fontSize: '0.9rem'
                          }}
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
                    value={modelSearchModel}
                    onChange={e => {
                      setModelSearchModel(e.target.value)
                      fetchModelSearchModelSuggestions(modelSearchMake, e.target.value)
                      setShowModelModelSuggestions(true)
                      if (modelSearchErrors.model) setModelSearchErrors(prev => ({...prev, model: false}))
                    }}
                    onFocus={() => modelSearchModel.length >= 2 && setShowModelModelSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowModelModelSuggestions(false), 200)}
                    placeholder="דגם - לדוגמה: Corolla"
                    style={{...styles.vehicleInput, width: '100%', flex: 'none', ...(modelSearchErrors.model && {borderColor: '#ef4444', boxShadow: '0 0 0 1px #ef4444'})}}
                  />
                  {showModelModelSuggestions && modelModelSuggestions.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: '#1f2937',
                      border: '1px solid #4b5563',
                      borderRadius: '0 0 8px 8px',
                      zIndex: 100,
                      maxHeight: '200px',
                      overflowY: 'auto'
                    }}>
                      {modelModelSuggestions.map((suggestion, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            setModelSearchModel(suggestion)
                            setShowModelModelSuggestions(false)
                          }}
                          style={{
                            padding: '10px 12px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #374151',
                            color: '#fff',
                            fontSize: '0.9rem'
                          }}
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
                  value={modelSearchYear}
                  onChange={e => {
                    setModelSearchYear(e.target.value.replace(/\D/g, '').slice(0, 4))
                    if (modelSearchErrors.year) setModelSearchErrors(prev => ({...prev, year: false}))
                  }}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleModelSearch(); } }}
                  placeholder="שנה - לדוגמה: 2020"
                  style={{...styles.vehicleInput, ...(modelSearchErrors.year && {borderColor: '#ef4444', boxShadow: '0 0 0 1px #ef4444'})}}
                />
                <button
                  onClick={handleModelSearch}
                  disabled={modelSearchLoading}
                  style={{
                    ...styles.vehicleLookupBtn,
                    width: '100%',
                    padding: '12px',
                    fontSize: '1rem'
                  }}
                >
                  {modelSearchLoading ? (
                    <span className="spinning-wheel">🛞</span>
                  ) : '🔍 חפש'}
                </button>
              </div>
            )}

            {/* Error message with external links and add model button */}
            {vehicleError && vehicleSearchTab === 'model' && modelSearchMake && modelSearchModel && (
              <div style={{...styles.noFitmentCard, marginTop: '10px'}}>
                ⚠️ לא נמצא מידע לפי פרטי הרכב שהוזנו
                <div style={styles.externalLinks}>
                  <a
                    href="https://www.wheel-size.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.wheelSizeLink}
                  >
                    חפש ב-wheel-size.com ↗
                  </a>
                  <a
                    href="https://www.wheelfitment.eu/car.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.wheelSizeLink}
                  >
                    חפש ב-wheelfitment.eu ↗
                  </a>
                </div>
                <button
                  onClick={() => handleOpenAddModel({
                    make: (modelSearchMake.includes('(') ? modelSearchMake.split(' (')[0] : modelSearchMake).toLowerCase(),
                    make_he: modelSearchMake.includes('(') ? modelSearchMake.split(' (')[1]?.replace(')', '') : modelSearchMake,
                    model: modelSearchModel.toLowerCase(),
                    year_from: modelSearchYear,
                    tire_size_front: '',
                    variants: modelSearchTechnicalCode // Pass technical code for better matching
                  })}
                  style={styles.addModelBtn}
                >
                  ➕ הוסף דגם זה למאגר
                </button>
              </div>
            )}

            {/* Error message for plate search */}
            {vehicleError && vehicleSearchTab === 'plate' && (
              <div style={styles.vehicleError}>
                ❌ {vehicleError}
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/missing-vehicle-reports', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ plate_number: vehiclePlate })
                      })
                      const data = await response.json()
                      if (data.success) {
                        if (data.already_reported) {
                          toast.success('הדיווח כבר קיים במערכת, תודה!')
                        } else {
                          toast.success('הדיווח נשלח בהצלחה!')
                        }
                      } else {
                        toast.error('שגיאה בשליחת הדיווח')
                      }
                    } catch {
                      toast.error('שגיאה בשליחת הדיווח')
                    }
                  }}
                  style={{
                    marginTop: '12px',
                    padding: '10px 16px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    justifyContent: 'center'
                  }}
                >
                  📝 דווח על רכב חסר
                </button>
              </div>
            )}

            {/* Vehicle Result */}
            {vehicleResult && (
              <div style={styles.vehicleResultSection}>
                {/* Personal Import Warning */}
                {vehicleResult.is_personal_import && (
                  <div style={{
                    background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                    border: '1px solid #f59e0b',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.9rem',
                    color: '#92400e'
                  }}>
                    <span>⚠️</span>
                    <div>
                      <strong>רכב ייבוא אישי{vehicleResult.vehicle.origin_country ? ` מ${vehicleResult.vehicle.origin_country}` : ''}</strong>
                      <div style={{ fontSize: '0.8rem', marginTop: '2px' }}>
                        מידות הגלגלים עשויות להיות שונות מהדגם המקומי
                      </div>
                    </div>
                  </div>
                )}

                {/* Vehicle Info */}
                <div style={styles.vehicleInfoCard}>
                  <div style={styles.vehicleInfoTitle}>
                    {vehicleResult.vehicle.manufacturer} {vehicleResult.vehicle.model}
                  </div>
                  <div style={styles.vehicleInfoDetails} className="wheels-vehicle-info-details">
                    <span>📅 {vehicleResult.vehicle.year}</span>
                    {vehicleResult.vehicle.front_tire && (
                      <span style={{ direction: 'ltr' }}>🛞 {vehicleResult.vehicle.front_tire}</span>
                    )}
                  </div>
                </div>

                {/* Wheel Fitment */}
                {vehicleResult.wheel_fitment ? (
                  <div style={styles.vehicleFitmentCard}>
                    {/* Source indicator - external only when scraped live (find_car_scrape) */}
                    <div style={styles.sourceIndicator} title={vehicleResult.source === 'find_car_scrape' ? 'מידע נגרד כעת ממקור חיצוני' : 'מידע מהמאגר הפנימי'}>
                      {vehicleResult.source === 'find_car_scrape' ? (
                        <span style={styles.sourceVerified}>🌐 מקור חיצוני</span>
                      ) : (
                        <span style={styles.sourceInternal}>📊 מאגר פנימי</span>
                      )}
                    </div>
                    {/* Main specs row */}
                    <div style={styles.fitmentMainRow} className="wheels-fitment-badges">
                      <div style={styles.fitmentSpec}>
                        <span style={styles.fitmentLabel}>PCD</span>
                        <span style={styles.fitmentValue}>{vehicleResult.wheel_fitment.pcd}</span>
                      </div>
                      {vehicleResult.wheel_fitment.center_bore && (
                        <div style={styles.fitmentSpec}>
                          <span style={styles.fitmentLabel}>CB</span>
                          <span style={styles.fitmentValue}>{vehicleResult.wheel_fitment.center_bore}</span>
                        </div>
                      )}
                      {(extractRimSize(vehicleResult.vehicle.front_tire) || manualRimSize) && (
                        <div style={styles.fitmentSpec}>
                          <span style={styles.fitmentLabel}>גודל</span>
                          <span style={styles.fitmentValue}>{extractRimSize(vehicleResult.vehicle.front_tire) || manualRimSize}"</span>
                        </div>
                      )}
                    </div>

                    {/* Allowed sizes row */}
                    {vehicleResult.wheel_fitment.rim_sizes_allowed && vehicleResult.wheel_fitment.rim_sizes_allowed.length > 0 && (
                      <div style={styles.allowedSizesRow}>
                        <span style={styles.allowedSizesLabel}>גדלים מותרים:</span>
                        <span style={styles.allowedSizesValue}>
                          {vehicleResult.wheel_fitment.rim_sizes_allowed.join('" / ')}"
                        </span>
                      </div>
                    )}

                    {/* Actions row */}
                    <div style={styles.fitmentActionsRow}>
                      {/* Manual rim size selector when no tire info available */}
                      {!extractRimSize(vehicleResult.vehicle.front_tire) && (
                        <select
                          value={manualRimSize || ''}
                          onChange={(e) => setManualRimSize(e.target.value ? parseInt(e.target.value) : null)}
                          style={styles.rimSizeSelect}
                        >
                          <option value="">בחר קוטר</option>
                          {[14, 15, 16, 17, 18, 19, 20, 21, 22].map(size => (
                            <option key={size} value={size}>{size}"</option>
                          ))}
                        </select>
                      )}
                      {vehicleResult.wheel_fitment.source_url && (
                        <a
                          href={vehicleResult.wheel_fitment.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={styles.sourceLink}
                          title="אמת מידות באתר המקור"
                        >
                          🔗 אמת מידות
                        </a>
                      )}
                      <button
                        onClick={() => handleOpenErrorReport(vehicleResult.vehicle, vehicleResult.wheel_fitment)}
                        style={styles.reportErrorBtn}
                        title="דווח על טעות במידות"
                      >
                        🔧 דווח על טעות
                      </button>
                    </div>

                    {/* Search Results */}
                    {(() => {
                      const vehicleRimSize = extractRimSize(vehicleResult.vehicle.front_tire) || manualRimSize
                      const isPersonalImport = vehicleResult.is_personal_import
                      const allowedSizes = vehicleResult.wheel_fitment?.rim_sizes_allowed

                      // If no rim size available (no tire info and no manual selection), show all wheels
                      // Otherwise, filter by manufacturer allowed sizes or fallback to ±1 logic
                      const filteredResults = vehicleSearchResults?.map(result => ({
                        ...result,
                        wheels: result.wheels.filter(w => {
                          if (!w.is_available) return false
                          const wheelSize = parseInt(w.rim_size)
                          // No rim size available - show all available wheels with matching PCD
                          if (!vehicleRimSize) return true
                          // If we have manufacturer's allowed sizes, use them
                          if (allowedSizes && allowedSizes.length > 0) {
                            return allowedSizes.includes(wheelSize)
                          }
                          // Fallback: filter by size (exact or one size smaller)
                          return wheelSize === vehicleRimSize || wheelSize === vehicleRimSize - 1
                        })
                      })).filter(result => result.wheels.length > 0) || []

                      const exactSizeWheels = filteredResults.flatMap(r => r.wheels.filter(w => parseInt(w.rim_size) === vehicleRimSize))
                      const allowedSizeWheels = allowedSizes ? filteredResults.flatMap(r => r.wheels.filter(w => allowedSizes.includes(parseInt(w.rim_size)))) : []
                      const smallerSizeWheels = filteredResults.flatMap(r => r.wheels.filter(w => parseInt(w.rim_size) === (vehicleRimSize || 0) - 1))
                      const hasExactSize = exactSizeWheels.length > 0
                      const hasSmallerSize = smallerSizeWheels.length > 0
                      const hasAllowedSizes = allowedSizeWheels.length > 0

                      if (filteredResults.length > 0) {
                        return (
                          <div style={styles.vehicleWheelResults}>
                            <div style={styles.vehicleResultsHeader}>
                              ✅ נמצאו {filteredResults.reduce((acc, r) => acc + r.wheels.length, 0)} גלגלים עם PCD מתאים
                            </div>
                            {/* No rim size available - show selector hint */}
                            {!vehicleRimSize && (
                              <div style={{...styles.vehicleResultsNote, background: '#dbeafe', color: '#1e40af', padding: '8px 12px', borderRadius: '8px', marginBottom: '10px'}}>
                                ℹ️ בחר קוטר ג&apos;אנט לסינון התוצאות{isPersonalImport ? ', או בדוק מידת גלגל מקורית לפני השאלה' : ''}
                              </div>
                            )}
                            {/* Has manufacturer allowed sizes */}
                            {allowedSizes && allowedSizes.length > 0 && hasAllowedSizes && (
                              <div style={styles.vehicleResultsNote}>
                                לרכב שלך מתאימים גדלים: {allowedSizes.join('", ')}"
                              </div>
                            )}
                            {/* Has rim size but no manufacturer data - use fallback */}
                            {vehicleRimSize && hasExactSize && !allowedSizes && (
                              <div style={styles.vehicleResultsNote}>
                                {manualRimSize ? 'מציג' : 'לרכב שלך מתאים'} גודל {vehicleRimSize}"
                              </div>
                            )}
                            {vehicleRimSize && !hasExactSize && hasSmallerSize && !allowedSizes && (
                              <div style={{...styles.vehicleResultsNote, background: '#fef3c7', color: '#92400e', padding: '8px 12px', borderRadius: '8px', marginBottom: '10px'}}>
                                ⚠️ לא נמצאו גלגלים בגודל {vehicleRimSize}" - מוצגים גלגלים בגודל {(vehicleRimSize || 0) - 1}" (מידה קטנה יותר)
                              </div>
                            )}
                            {filteredResults.map(result => (
                              <div key={result.station.id} style={styles.resultStationGroup}>
                                <div style={styles.resultStationHeader}>
                                  <div style={styles.resultStationName}>{result.station.name}</div>
                                </div>
                                <div style={styles.resultWheelsList}>
                                  {result.wheels.map(wheel => {
                                    const vehicleCB = vehicleResult?.wheel_fitment?.center_bore
                                    const wheelCB = wheel.center_bore
                                    const cbMismatch = vehicleCB && wheelCB && vehicleCB < wheelCB
                                    return (
                                    <Link
                                      key={wheel.id}
                                      href={`/${result.station.id}#wheel-${wheel.wheel_number}`}
                                      style={{
                                        ...styles.resultWheelCard,
                                        // Only show warning style if no allowed sizes and wheel is smaller than vehicle size
                                        ...(!allowedSizes && !isPersonalImport && vehicleRimSize && parseInt(wheel.rim_size) < vehicleRimSize ? {border: '2px solid #f59e0b', background: '#fffbeb'} : {}),
                                        ...(cbMismatch ? {border: '2px solid #ef4444'} : {})
                                      }}
                                      className="wheels-result-wheel-card"
                                      onClick={closeVehicleModal}
                                    >
                                      <div style={styles.resultWheelNumber}>#{wheel.wheel_number}</div>
                                      <div style={styles.resultWheelSpecs}>
                                        <span>{wheel.rim_size}"</span>
                                        {/* Only show "smaller" label if no allowed sizes data */}
                                        {!allowedSizes && !isPersonalImport && vehicleRimSize && parseInt(wheel.rim_size) < vehicleRimSize && <span style={{fontSize: '10px', color: '#b45309'}}>קטן יותר</span>}
                                        {wheel.center_bore && <span>CB {wheel.center_bore}</span>}
                                        {wheel.is_donut && <span style={styles.resultDonutBadge}>דונאט</span>}
                                      </div>
                                      {cbMismatch && (
                                        <div style={{color: '#ef4444', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px'}}>
                                          <span style={{fontSize: '14px'}}>⚠️</span> CB גלגל ({wheelCB}) גדול מהרכב ({vehicleCB})
                                        </div>
                                      )}
                                    </Link>
                                    )
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      } else if (vehicleSearchResults && vehicleSearchResults.length === 0) {
                        return (
                          <div style={styles.noVehicleResults}>
                            😕 לא נמצאו גלגלים מתאימים במלאי
                          </div>
                        )
                      } else if (vehicleSearchResults && vehicleSearchResults.length > 0) {
                        // Has results but all are larger sizes
                        return (
                          <div style={styles.noVehicleResults}>
                            {!vehicleRimSize
                              ? '😕 לא נמצאו גלגלים עם PCD מתאים במלאי'
                              : `😕 לא נמצאו גלגלים בגודל ${vehicleRimSize}" או קטן יותר במלאי`
                            }
                          </div>
                        )
                      }
                      return null
                    })()}
                  </div>
                ) : (
                  <div style={styles.noFitmentCard}>
                    ⚠️ לא נמצא מידע לפי פרטי הרכב שהוזנו
                    <button
                      onClick={() => {
                        // Switch to model search tab with vehicle data pre-filled
                        setModelSearchMake(vehicleResult.vehicle.manufacturer)
                        setModelSearchModel(vehicleResult.vehicle.model)
                        setModelSearchYear(vehicleResult.vehicle.year.toString())
                        setModelSearchTechnicalCode(vehicleResult.vehicle.model_name || '') // Save technical code
                        setVehicleSearchTab('model')
                        setVehicleResult(null)
                        setVehicleError(null)
                      }}
                      style={styles.addModelBtn}
                    >
                      🔍 חפש לפי יצרן ודגם
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Report Modal */}
      {showErrorReportModal && (
        <div style={styles.modalOverlay} onClick={() => setShowErrorReportModal(false)}>
          <div style={{...styles.vehicleModal, maxWidth: '500px'}} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>🔧 דווח על טעות במידות</h3>
              <button style={styles.modalClose} onClick={() => setShowErrorReportModal(false)}>✕</button>
            </div>

            <div style={{padding: '20px'}}>
              {errorReportVehicle && (
                <div style={{background: '#1e3a5f', padding: '12px', borderRadius: '8px', marginBottom: '16px', textAlign: 'center'}}>
                  <strong style={{color: '#fbbf24'}}>{errorReportVehicle.vehicle?.manufacturer} {errorReportVehicle.vehicle?.model} {errorReportVehicle.vehicle?.year}</strong>
                  {errorReportVehicle.wheelFitment && (
                    <div style={{fontSize: '0.9rem', color: '#93c5fd', marginTop: '4px'}}>
                      PCD נוכחי: {errorReportVehicle.wheelFitment.pcd}
                    </div>
                  )}
                </div>
              )}

              <div style={{marginBottom: '16px'}}>
                <label style={{display: 'block', marginBottom: '6px', fontWeight: 500, color: '#e2e8f0'}}>
                  📷 צילום מסך (מומלץ)
                </label>
                <label style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px',
                  background: '#334155',
                  border: '2px dashed #64748b',
                  borderRadius: '8px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  fontSize: '0.9rem'
                }}>
                  {errorReportImage ? `✓ ${errorReportImage.name}` : '📁 לחץ לבחירת תמונה'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setErrorReportImage(e.target.files?.[0] || null)}
                    style={{display: 'none'}}
                  />
                </label>
              </div>

              <div style={{marginBottom: '12px', fontWeight: 600, color: '#f59e0b'}}>
                הפרטים הנכונים:
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px'}}>
                <div>
                  <label style={{display: 'block', marginBottom: '4px', fontSize: '0.85rem', color: '#94a3b8'}}>מס׳ ברגים</label>
                  <input
                    type="number"
                    value={errorReportForm.correct_bolt_count}
                    onChange={e => setErrorReportForm({...errorReportForm, correct_bolt_count: e.target.value})}
                    placeholder="5"
                    style={{width: '100%', padding: '10px', border: '1px solid #475569', borderRadius: '8px', background: '#1e293b', color: '#fff', fontSize: '1rem'}}
                  />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '4px', fontSize: '0.85rem', color: '#94a3b8'}}>מרווח (PCD)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={errorReportForm.correct_bolt_spacing}
                    onChange={e => setErrorReportForm({...errorReportForm, correct_bolt_spacing: e.target.value})}
                    placeholder="114.3"
                    style={{width: '100%', padding: '10px', border: '1px solid #475569', borderRadius: '8px', background: '#1e293b', color: '#fff', fontSize: '1rem'}}
                  />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '4px', fontSize: '0.85rem', color: '#94a3b8'}}>CB (Center Bore)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={errorReportForm.correct_center_bore}
                    onChange={e => setErrorReportForm({...errorReportForm, correct_center_bore: e.target.value})}
                    placeholder="60.1"
                    style={{width: '100%', padding: '10px', border: '1px solid #475569', borderRadius: '8px', background: '#1e293b', color: '#fff', fontSize: '1rem'}}
                  />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '4px', fontSize: '0.85rem', color: '#94a3b8'}}>גודל חישוק</label>
                  <input
                    type="text"
                    value={errorReportForm.correct_rim_size}
                    onChange={e => setErrorReportForm({...errorReportForm, correct_rim_size: e.target.value})}
                    placeholder='16"'
                    style={{width: '100%', padding: '10px', border: '1px solid #475569', borderRadius: '8px', background: '#1e293b', color: '#fff', fontSize: '1rem'}}
                  />
                </div>
              </div>

              <div style={{marginBottom: '16px'}}>
                <label style={{display: 'block', marginBottom: '4px', fontSize: '0.85rem', color: '#94a3b8'}}>גודל צמיג</label>
                <input
                  type="text"
                  value={errorReportForm.correct_tire_size}
                  onChange={e => setErrorReportForm({...errorReportForm, correct_tire_size: e.target.value})}
                  placeholder="205/55R16"
                  style={{width: '100%', padding: '10px', border: '1px solid #475569', borderRadius: '8px', background: '#1e293b', color: '#fff', fontSize: '1rem'}}
                />
              </div>

              <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '4px', fontSize: '0.85rem', color: '#94a3b8'}}>הערות נוספות</label>
                <textarea
                  value={errorReportForm.notes}
                  onChange={e => setErrorReportForm({...errorReportForm, notes: e.target.value})}
                  placeholder="תאר את הטעות שמצאת..."
                  rows={3}
                  style={{width: '100%', padding: '10px', border: '1px solid #475569', borderRadius: '8px', background: '#1e293b', color: '#fff', fontSize: '1rem', resize: 'vertical'}}
                />
              </div>

              <button
                onClick={handleSubmitErrorReport}
                disabled={errorReportLoading}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: errorReportLoading ? '#9ca3af' : 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: errorReportLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {errorReportLoading ? '⏳ שולח...' : '📤 שלח דיווח'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manager Login Modal */}
      {showManagerLoginModal && (
        <div style={styles.modalOverlay} onClick={() => setShowManagerLoginModal(false)}>
          <div style={styles.vehicleModal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>🔐 התחברות מנהל</h3>
              <button style={styles.closeBtn} className="wheels-close-btn" onClick={() => setShowManagerLoginModal(false)} aria-label="סגור התחברות">✕</button>
            </div>

            <div style={{ padding: '20px 0' }}>
              <p style={{ color: '#d1d5db', marginBottom: '20px', textAlign: 'center' }}>
                כדי להוסיף דגם רכב למאגר, יש להתחבר כמנהל
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={styles.formLabel}>שם משתמש</label>
                  <input
                    type="text"
                    value={loginPhone}
                    onChange={e => setLoginPhone(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleManagerLogin()}
                    placeholder="הזן שם משתמש"
                    style={styles.formInput}
                  />
                </div>

                <div>
                  <label style={styles.formLabel}>סיסמה</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleManagerLogin()}
                    placeholder="הזן סיסמה"
                    style={styles.formInput}
                  />
                </div>

                <button
                  onClick={handleManagerLogin}
                  disabled={loginLoading}
                  style={{
                    ...styles.submitBtn,
                    opacity: loginLoading ? 0.6 : 1,
                    cursor: loginLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loginLoading ? 'מתחבר...' : '🔓 התחבר'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Vehicle Model Modal */}
      {showAddModelModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddModelModal(false)}>
          <div style={styles.addModelModal} className="wheels-add-model-modal" onClick={e => e.stopPropagation()}>
            {/* Styled Header */}
            <div className="wheels-modal-header" style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              padding: '20px 24px',
              borderRadius: '20px 20px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, color: 'white', fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.4rem' }}>➕</span> הוסף דגם רכב למאגר
              </h3>
              <button
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  width: '36px',
                  height: '36px',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={() => setShowAddModelModal(false)}
                aria-label="סגור הוספת דגם"
              >
                ✕
              </button>
            </div>

            <div style={styles.addModelForm} className="wheels-form-content">
              {/* Section: Vehicle Info */}
              <div className="wheels-form-section" style={{
                background: 'rgba(16, 185, 129, 0.05)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '4px'
              }}>
                <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase' }}>
                  פרטי רכב
                </div>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>יצרן (עברית) <span style={{ color: '#ef4444' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={addModelForm.make_he}
                      onChange={e => {
                        setAddModelForm({ ...addModelForm, make_he: e.target.value })
                        fetchMakeHeSuggestions(e.target.value)
                        setShowMakeHeSuggestions(true)
                      }}
                      onFocus={() => addModelForm.make_he.length >= 2 && setShowMakeHeSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowMakeHeSuggestions(false), 200)}
                      placeholder="טויוטה"
                      style={styles.formInput}
                    />
                    {showMakeHeSuggestions && makeHeSuggestions.length > 0 && (
                      <div style={styles.suggestionsList}>
                        {makeHeSuggestions.map((suggestion, i) => (
                          <div
                            key={i}
                            className="suggestion-item"
                            style={styles.suggestionItem}
                            onClick={() => {
                              setAddModelForm({ ...addModelForm, make_he: suggestion })
                              setShowMakeHeSuggestions(false)
                            }}
                          >
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>יצרן (אנגלית) <span style={{ color: '#ef4444' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={addModelForm.make}
                      onChange={e => {
                        setAddModelForm({ ...addModelForm, make: e.target.value })
                        fetchMakeSuggestions(e.target.value)
                        setShowMakeSuggestions(true)
                      }}
                      onFocus={() => addModelForm.make.length >= 2 && setShowMakeSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowMakeSuggestions(false), 200)}
                      placeholder="toyota"
                      style={styles.formInput}
                    />
                    {showMakeSuggestions && makeSuggestions.length > 0 && (
                      <div style={styles.suggestionsList}>
                        {makeSuggestions.map((suggestion, i) => (
                          <div
                            key={i}
                            className="suggestion-item"
                            style={styles.suggestionItem}
                            onClick={() => {
                              setAddModelForm({ ...addModelForm, make: suggestion })
                              setShowMakeSuggestions(false)
                            }}
                          >
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>דגם <span style={{ color: '#ef4444' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={addModelForm.model}
                    onChange={e => {
                      setAddModelForm({ ...addModelForm, model: e.target.value })
                      fetchModelSuggestions(e.target.value)
                      setShowModelSuggestions(true)
                    }}
                    onFocus={() => addModelForm.model.length >= 2 && setShowModelSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowModelSuggestions(false), 200)}
                    placeholder="corolla"
                    style={styles.formInput}
                  />
                  {showModelSuggestions && modelSuggestions.length > 0 && (
                    <div style={styles.suggestionsList}>
                      {modelSuggestions.map((suggestion, i) => (
                        <div
                          key={i}
                          className="suggestion-item"
                          style={styles.suggestionItem}
                          onClick={() => {
                            setAddModelForm({ ...addModelForm, model: suggestion })
                            setShowModelSuggestions(false)
                          }}
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {addModelForm.variants && (
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>קוד טכני (מהממשלה)</label>
                  <input
                    type="text"
                    value={addModelForm.variants}
                    readOnly
                    style={{...styles.formInput, background: '#1e3a5f', color: '#60a5fa', cursor: 'default'}}
                  />
                </div>
              )}

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>שנה מ-</label>
                  <input
                    type="number"
                    value={addModelForm.year_from}
                    onChange={e => setAddModelForm({ ...addModelForm, year_from: e.target.value })}
                    placeholder="2015"
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>שנה עד</label>
                  <input
                    type="number"
                    value={addModelForm.year_to}
                    onChange={e => setAddModelForm({ ...addModelForm, year_to: e.target.value })}
                    placeholder="2020 (ריק = עד היום)"
                    style={styles.formInput}
                  />
                </div>
              </div>
              </div>

              {/* Section: Wheel Specs */}
              <div className="wheels-form-section" style={{
                background: 'rgba(59, 130, 246, 0.05)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <div style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase' }}>
                  מפרט גלגלים
                </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>כמות ברגים <span style={{ color: '#ef4444' }}>*</span></label>
                  <select
                    value={addModelForm.bolt_count}
                    onChange={e => setAddModelForm({ ...addModelForm, bolt_count: e.target.value })}
                    style={styles.formInput}
                  >
                    <option value="">בחר...</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>PCD (מרווח ברגים) <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="number"
                    step="0.1"
                    value={addModelForm.bolt_spacing}
                    onChange={e => setAddModelForm({ ...addModelForm, bolt_spacing: e.target.value })}
                    placeholder="114.3"
                    style={styles.formInput}
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Center Bore</label>
                  <input
                    type="number"
                    step="0.1"
                    value={addModelForm.center_bore}
                    onChange={e => setAddModelForm({ ...addModelForm, center_bore: e.target.value })}
                    placeholder="60.1"
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>גודל חישוק</label>
                  <input
                    type="text"
                    value={addModelForm.rim_size}
                    onChange={e => setAddModelForm({ ...addModelForm, rim_size: e.target.value })}
                    placeholder="15, 16, 17"
                    style={styles.formInput}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>גודל צמיג קדמי</label>
                <input
                  type="text"
                  value={addModelForm.tire_size_front}
                  onChange={e => setAddModelForm({ ...addModelForm, tire_size_front: e.target.value })}
                  placeholder="195/60R15"
                  style={styles.formInput}
                />
              </div>
              </div>

              <div style={styles.formActions} className="wheels-form-actions">
                <button
                  onClick={handleAddVehicleModel}
                  disabled={addModelLoading}
                  style={styles.submitBtn}
                >
                  {addModelLoading ? 'מוסיף...' : '✅ הוסף למאגר'}
                </button>
                <button
                  onClick={() => setShowAddModelModal(false)}
                  style={styles.cancelBtn}
                >
                  ביטול
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #374151 0%, #4b5563 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>טוען...</div>}>
      <SearchPageContent />
    </Suspense>
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
  backToStationContainer: {
    marginBottom: '10px',
    textAlign: 'center',
  },
  backToStationBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    borderRadius: '8px',
    color: 'white',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '0.95rem',
    transition: 'transform 0.2s',
  },
  searchPageHeader: {
    textAlign: 'center',
    marginBottom: '30px',
    padding: '20px',
  },
  searchPageTitle: {
    fontSize: '2rem',
    fontWeight: 700,
    marginBottom: '10px',
    color: 'white',
  },
  searchPageSubtitle: {
    fontSize: '1rem',
    color: '#9ca3af',
    margin: 0,
  },
  searchTypeContainer: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap' as const,
  },
  searchTypeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '20px 30px',
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    border: '2px solid #334155',
    borderRadius: '16px',
    color: 'white',
    fontSize: '1.1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s',
    minWidth: '200px',
    justifyContent: 'center',
  },
  searchTypeBtnActive: {
    borderColor: '#22c55e',
    boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)',
  },
  searchTypeIcon: {
    fontSize: '1.5rem',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  headerIcon: {
    fontSize: '4rem',
    marginBottom: '20px',
  },
  headerLogo: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginBottom: '20px',
    border: '3px solid #6b7280',
    boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
    display: 'block',
    margin: '0 auto 20px',
  },
  loadingLogo: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginBottom: '20px',
    border: '3px solid #6b7280',
    animation: 'pulse 1.5s ease-in-out infinite',
    display: 'block',
    margin: '0 auto 20px',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '10px',
  },
  subtitle: {
    color: '#a0aec0',
    fontSize: '1.1rem',
    marginBottom: '20px',
  },
  searchBtnsRow: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  stationFilterContainer: {
    maxWidth: '500px',
    margin: '0 auto 20px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  stationFilterInput: {
    width: '100%',
    padding: '12px 40px 12px 16px',
    borderRadius: '12px',
    border: '2px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s, background 0.2s',
  },
  clearFilterBtn: {
    position: 'absolute',
    left: '12px',
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtn: {
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: 'white',
    border: 'none',
    padding: '14px 28px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  },
  vehicleSearchBtn: {
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white',
    border: 'none',
    padding: '14px 28px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '50vh',
    gap: '20px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(255,255,255,0.1)',
    borderTopColor: '#f59e0b',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  error: {
    textAlign: 'center',
    padding: '40px',
  },
  retryBtn: {
    marginTop: '20px',
    padding: '10px 30px',
    background: '#f59e0b',
    color: '#000',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  empty: {
    textAlign: 'center',
    padding: '60px',
    color: '#a0aec0',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  card: {
    background: 'linear-gradient(145deg, #2d3748, #1a202c)',
    borderRadius: '16px',
    padding: '25px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    textDecoration: 'none',
    color: '#fff',
    border: '2px solid transparent',
    display: 'block',
  },
  cardTitle: {
    fontSize: '1.3rem',
    marginBottom: '10px',
    color: '#f59e0b',
  },
  address: {
    color: '#a0aec0',
    fontSize: '0.9rem',
    marginBottom: '5px',
  },
  cityName: {
    color: '#718096',
    fontSize: '0.85rem',
    marginBottom: '15px',
  },
  stats: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '15px 0',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  stat: {
    textAlign: 'center',
  },
  statValue: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: '0.85rem',
    color: '#a0aec0',
  },
  managers: {
    marginTop: '15px',
    padding: '10px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '8px',
    textAlign: 'center',
    color: '#a0aec0',
    fontSize: '0.9rem',
  },
  footer: {
    textAlign: 'center',
    marginTop: 'auto',
    paddingTop: '40px',
    paddingBottom: '20px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  footerInfo: {
    marginTop: '0',
  },
  footerText: {
    color: '#d1d5db',
    fontSize: '0.75rem',
    margin: 0,
  },
  feedbackLink: {
    color: '#93c5fd',
    textDecoration: 'none',
  },
  legalLinks: {
    color: '#9ca3af',
    fontSize: '0.7rem',
    marginTop: '8px',
    margin: 0,
  },
  legalLink: {
    color: '#9ca3af',
    textDecoration: 'none',
  },
  versionText: {
    color: '#9ca3af',
    fontSize: '0.65rem',
    marginTop: '8px',
  },
  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '5px',
    overflow: 'auto',
  },
  modal: {
    background: '#1e293b',
    borderRadius: '16px',
    padding: '15px',
    width: '100%',
    maxWidth: '95vw',
    maxHeight: 'calc(100vh - 10px)',
    overflowY: 'auto',
    margin: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  modalTitle: {
    color: '#f59e0b',
    margin: 0,
    fontSize: '1.3rem',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#a0aec0',
    fontSize: '1.5rem',
    cursor: 'pointer',
  },
  modalSubtitle: {
    color: '#a0aec0',
    marginBottom: '20px',
  },
  filterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '15px',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  filterLabel: {
    color: '#a0aec0',
    fontSize: '0.8rem',
  },
  filterSelect: {
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #4a5568',
    background: '#2d3748',
    color: 'white',
    fontSize: '0.9rem',
  },
  checkboxRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '20px',
  },
  checkboxLabel: {
    color: '#a0aec0',
    fontSize: '0.9rem',
  },
  searchSubmitBtn: {
    width: '100%',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white',
    border: 'none',
    padding: '14px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  backToFiltersBtn: {
    background: 'transparent',
    border: 'none',
    color: '#3b82f6',
    cursor: 'pointer',
    marginBottom: '15px',
    fontSize: '0.9rem',
  },
  noResults: {
    textAlign: 'center',
    padding: '30px',
  },
  noResultsHint: {
    color: '#a0aec0',
    fontSize: '0.9rem',
  },
  resultsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  resultsHeader: {
    color: '#10b981',
    fontWeight: 'bold',
    marginBottom: '10px',
    textAlign: 'center',
  },
  resultCard: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '12px',
    padding: '15px',
    textDecoration: 'none',
    color: '#fff',
    display: 'block',
    border: '1px solid transparent',
    transition: 'all 0.2s',
  },
  resultStationInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '5px',
  },
  resultStationGroup: {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '12px',
    padding: '12px',
    marginBottom: '12px',
  },
  resultStationHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '5px',
  },
  resultStationName: {
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  resultCityBadge: {
    background: 'rgba(59, 130, 246, 0.2)',
    color: '#60a5fa',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '0.8rem',
  },
  resultAddress: {
    color: '#a0aec0',
    fontSize: '0.85rem',
    marginBottom: '10px',
  },
  resultWheelsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  resultWheelCard: {
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: '8px',
    padding: '10px 14px',
    textDecoration: 'none',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minWidth: '100px',
    transition: 'all 0.2s',
  },
  resultWheelTaken: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    opacity: 0.7,
  },
  resultWheelNumber: {
    fontWeight: 'bold',
    fontSize: '1.1rem',
    color: '#f59e0b',
  },
  resultWheelSpecs: {
    display: 'flex',
    gap: '6px',
    fontSize: '0.8rem',
    color: '#a0aec0',
  },
  resultDonutBadge: {
    background: 'rgba(168, 85, 247, 0.3)',
    color: '#a855f7',
    padding: '1px 5px',
    borderRadius: '4px',
    fontSize: '0.7rem',
  },
  resultWheelStatus: {
    fontSize: '0.8rem',
    fontWeight: 'bold',
  },
  resultStats: {
    display: 'flex',
    gap: '15px',
  },
  resultAvailable: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  resultTotal: {
    color: '#a0aec0',
    fontSize: '0.9rem',
  },
  // Vehicle modal styles
  vehicleModal: {
    background: '#1e293b',
    borderRadius: '12px',
    padding: '14px',
    width: '100%',
    maxWidth: '450px',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  betaWarning: {
    background: 'rgba(251, 191, 36, 0.15)',
    border: '1px solid rgba(251, 191, 36, 0.3)',
    color: '#fbbf24',
    padding: '10px 15px',
    borderRadius: '10px',
    textAlign: 'center',
    fontSize: '0.85rem',
    marginBottom: '15px',
  },
  vehicleInputRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px',
  },
  vehicleInput: {
    flex: 1,
    padding: '14px 18px',
    borderRadius: '10px',
    border: '2px solid #4a5568',
    background: '#2d3748',
    color: 'white',
    fontSize: '1.2rem',
    textAlign: 'center',
    letterSpacing: '2px',
  },
  vehicleLookupBtn: {
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white',
    border: 'none',
    padding: '14px 20px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1.2rem',
  },
  vehicleError: {
    background: 'rgba(239, 68, 68, 0.2)',
    color: '#fca5a5',
    padding: '12px',
    borderRadius: '10px',
    textAlign: 'center',
    marginBottom: '15px',
  },
  vehicleResultSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  vehicleInfoCard: {
    background: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    borderRadius: '12px',
    padding: '15px',
    textAlign: 'center',
  },
  vehicleInfoTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#60a5fa',
    marginBottom: '8px',
    wordBreak: 'break-word' as const,
  },
  vehicleInfoDetails: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
    gap: '10px 20px',
    color: '#a0aec0',
    fontSize: '0.9rem',
  },
  vehicleFitmentCard: {
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: '12px',
    padding: '15px',
    position: 'relative' as const,
  },
  sourceIndicator: {
    position: 'absolute' as const,
    top: '8px',
    left: '8px',
    fontSize: '0.7rem',
    cursor: 'help',
  },
  sourceVerified: {
    color: '#10b981',
    background: 'rgba(16, 185, 129, 0.2)',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  sourceInternal: {
    color: '#60a5fa',
    background: 'rgba(96, 165, 250, 0.2)',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  fitmentBadges: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '15px',
  },
  fitmentMainRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginBottom: '12px',
  },
  fitmentSpec: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'rgba(30, 41, 59, 0.5)',
    padding: '10px 18px',
    borderRadius: '12px',
    minWidth: '70px',
  },
  fitmentLabel: {
    fontSize: '0.7rem',
    color: '#94a3b8',
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  fitmentValue: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#f1f5f9',
  },
  allowedSizesRow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
    padding: '8px 16px',
    background: 'rgba(34, 197, 94, 0.1)',
    borderRadius: '8px',
    border: '1px solid rgba(34, 197, 94, 0.2)',
  },
  allowedSizesLabel: {
    fontSize: '0.8rem',
    color: '#86efac',
  },
  allowedSizesValue: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: '#4ade80',
  },
  fitmentActionsRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  rimSizeSelect: {
    padding: '6px 12px',
    borderRadius: '8px',
    border: '1px solid #475569',
    background: '#1e293b',
    color: '#f1f5f9',
    fontWeight: 'bold',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  pcdBadge: {
    background: 'rgba(16, 185, 129, 0.3)',
    color: '#34d399',
    padding: '8px 16px',
    borderRadius: '20px',
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  rimBadge: {
    background: 'rgba(59, 130, 246, 0.3)',
    color: '#60a5fa',
    padding: '8px 16px',
    borderRadius: '20px',
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  centerBoreBadge: {
    background: 'rgba(168, 85, 247, 0.3)',
    color: '#c084fc',
    padding: '8px 16px',
    borderRadius: '20px',
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  sourceLink: {
    background: 'rgba(59, 130, 246, 0.15)',
    color: '#93c5fd',
    padding: '6px 12px',
    borderRadius: '8px',
    fontWeight: '500',
    fontSize: '0.8rem',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    transition: 'all 0.2s ease',
  },
  vehicleWheelResults: {
    marginTop: '10px',
  },
  vehicleResultsHeader: {
    color: '#10b981',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '5px',
    fontSize: '0.95rem',
  },
  vehicleResultsNote: {
    color: '#a0aec0',
    textAlign: 'center',
    marginBottom: '12px',
    fontSize: '0.8rem',
  },
  noVehicleResults: {
    textAlign: 'center',
    color: '#fbbf24',
    padding: '15px',
    background: 'rgba(251, 191, 36, 0.1)',
    borderRadius: '10px',
  },
  noFitmentCard: {
    background: 'rgba(251, 191, 36, 0.1)',
    border: '1px solid rgba(251, 191, 36, 0.3)',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    color: '#fbbf24',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  wheelSizeLink: {
    color: '#60a5fa',
    textDecoration: 'none',
    fontSize: '0.9rem',
  },
  externalLinks: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '5px',
  },
  addModelBtn: {
    marginTop: '15px',
    padding: '12px 20px',
    background: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  addModelModal: {
    background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
    borderRadius: '20px',
    padding: '0',
    maxWidth: '520px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)',
    border: '1px solid #334155',
  },
  addModelForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    padding: '20px 24px 24px',
  },
  formRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  formLabel: {
    fontSize: '0.9rem',
    color: '#94a3b8',
    fontWeight: '600',
    letterSpacing: '0.3px',
  },
  formInput: {
    padding: '12px 14px',
    background: '#0f172a',
    border: '2px solid #334155',
    borderRadius: '10px',
    color: '#f1f5f9',
    fontSize: '1rem',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #334155',
  },
  submitBtn: {
    flex: 2,
    padding: '14px 20px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: 'bold',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  cancelBtn: {
    flex: 1,
    padding: '14px 20px',
    background: 'transparent',
    color: '#94a3b8',
    border: '2px solid #475569',
    borderRadius: '10px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  suggestionsList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: '#1f2937',
    border: '1px solid #4b5563',
    borderRadius: '8px',
    marginTop: '4px',
    maxHeight: '200px',
    overflowY: 'auto',
    zIndex: 1000,
    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
  },
  suggestionItem: {
    padding: '10px 12px',
    cursor: 'pointer',
    borderBottom: '1px solid #374151',
    color: '#d1d5db',
    fontSize: '0.95rem',
  },
  reportErrorBtn: {
    background: 'rgba(239, 68, 68, 0.2)',
    color: '#fca5a5',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    marginTop: '10px',
  },
}
