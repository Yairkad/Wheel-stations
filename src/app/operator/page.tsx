'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { SESSION_VERSION } from '@/lib/version'
import { VehicleModelRecord } from '@/lib/types'
import { hebrewToEnglishMakes, hebrewToEnglishModels, modelToMake, extractRimSize } from '@/lib/vehicle-mappings'

interface RoleResult {
  role: string
  label: string
  data: Record<string, unknown>
}

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
  wheels: { wheel_number: number; rim_size: string; pcd: string; center_bore?: number | null; is_available: boolean; is_donut?: boolean }[]
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
  rim_sizes_allowed?: number[] | null
  source_url?: string | null
}

interface FilterOptions {
  rim_sizes: string[]
  bolt_counts: number[]
  bolt_spacings: number[]
  center_bores: number[]
}

export default function OperatorPage() {
  const [operator, setOperator] = useState<Operator | null>(null)
  const [isManager, setIsManager] = useState(false)

  // Header menus
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const [authRoles, setAuthRoles] = useState<RoleResult[]>([])
  const [activeRole, setActiveRole] = useState<string | null>(null)
  const [showRoleMenu, setShowRoleMenu] = useState(false)
  const roleMenuRef = useRef<HTMLDivElement>(null)
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

  // Multiple matching models state
  const [matchingModels, setMatchingModels] = useState<VehicleModelRecord[]>([])
  const [showModelSelection, setShowModelSelection] = useState(false)

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
    const SESSION_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000 // 7 days
    const saved = localStorage.getItem('operator_session')
    if (saved) {
      try {
        const data = JSON.parse(saved)

        // Check session version - if outdated, clear and redirect
        if (data.version !== undefined && data.version !== SESSION_VERSION) {
          localStorage.removeItem('operator_session')
          window.location.href = '/login'
          return
        }

        // Check both old format (expiry) and new format from login page (timestamp)
        const hasValidOldFormat = data.expiry && new Date().getTime() < data.expiry && data.operator
        const hasValidNewFormat = data.timestamp && data.user && (Date.now() - data.timestamp < SESSION_EXPIRY_MS)

        if (hasValidOldFormat) {
          setOperator(data.operator)
          setIsManager(data.is_manager || false)
        } else if (hasValidNewFormat) {
          // New format from /login page
          setOperator({
            id: data.user.id,
            full_name: data.user.full_name,
            phone: data.user.phone,
            call_center_id: data.callCenterId,
            call_center_name: data.callCenterName
          })
          setIsManager(data.role === 'manager')
        } else {
          // Session expired or invalid format
          localStorage.removeItem('operator_session')
          window.location.href = '/login'
          return
        }
      } catch {
        localStorage.removeItem('operator_session')
        window.location.href = '/login'
        return
      }
    } else {
      // No session - redirect to login
      window.location.href = '/login'
      return
    }

    // Fetch filter options for spec search
    const fetchFilterOptions = async () => {
      try {
        const response = await fetch('/api/wheel-stations/filter-options')
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
          expiry,
          version: SESSION_VERSION
        }))
        toast.success(`שלום ${data.user.full_name}!`)
        window.location.href = '/call-center'
        return
      }

      // Operator - stay on this page
      const expiry = new Date().getTime() + (12 * 60 * 60 * 1000)
      localStorage.setItem('operator_session', JSON.stringify({
        operator: data.user,
        expiry,
        version: SESSION_VERSION
      }))

      setOperator(data.user)
      toast.success(`שלום ${data.user.full_name}!`)
    } catch {
      setLoginError('שגיאה בהתחברות')
    } finally {
      setLoginLoading(false)
    }
  }

  // Load auth_roles for role switching
  useEffect(() => {
    try {
      const storedRoles = localStorage.getItem('auth_roles')
      const storedActiveRole = localStorage.getItem('active_role')
      if (storedRoles) {
        setAuthRoles(JSON.parse(storedRoles))
        setActiveRole(storedActiveRole || 'operator')
      }
    } catch { /* ignore */ }
  }, [])

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showProfileMenu && profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) setShowProfileMenu(false)
      if (showRoleMenu && roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) setShowRoleMenu(false)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showProfileMenu, showRoleMenu])

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ').filter(p => p.length > 0)
    return parts.length >= 2 ? parts[0][0] + parts[1][0] : name.substring(0, 2)
  }

  const navigateToRole = (r: RoleResult) => {
    localStorage.setItem('active_role', r.role)
    setActiveRole(r.role)
    setShowRoleMenu(false)
    const d = r.data
    switch (r.role) {
      case 'station_manager': {
        localStorage.setItem(`station_session_${d.station_id as string}`, JSON.stringify({
          manager: { id: d.id, full_name: d.full_name, phone: d.phone, role: d.role || 'מנהל תחנה', is_primary: d.is_primary || false },
          stationId: d.station_id, stationName: d.station_name,
          timestamp: Date.now(), version: SESSION_VERSION,
        }))
        window.location.href = `/${d.station_id as string}`
        break
      }
      case 'operator': {
        localStorage.setItem('operator_session', JSON.stringify({
          user: { id: d.id, full_name: d.full_name, phone: d.phone, title: d.title, is_primary: d.is_primary },
          role: (d as {sub_role?: string}).sub_role === 'manager' ? 'manager' : 'operator',
          callCenterId: d.call_center_id, callCenterName: d.call_center_name,
          timestamp: Date.now(), version: SESSION_VERSION,
        }))
        window.location.href = (d as {sub_role?: string}).sub_role === 'manager' ? '/call-center' : '/operator'
        break
      }
      case 'district_manager': {
        localStorage.setItem('super_manager_session', JSON.stringify({
          superManager: { id: d.id, full_name: d.full_name, phone: d.phone, allowed_districts: d.allowed_districts },
          timestamp: Date.now(), version: SESSION_VERSION,
        }))
        window.location.href = '/super-manager'
        break
      }
      case 'editor': {
        localStorage.setItem('puncture_manager_auth', JSON.stringify({ expiry: Date.now() + 30 * 24 * 60 * 60 * 1000, phone: d.phone }))
        window.location.href = '/admin/punctures'
        break
      }
      case 'admin': {
        const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000
        const existing = (() => { try { return JSON.parse(localStorage.getItem('wheels_admin_auth') || '{}') } catch { return {} } })()
        localStorage.setItem('wheels_admin_auth', JSON.stringify({ expiry, pwd: existing.pwd || '' }))
        window.location.href = '/admin'
        break
      }
    }
  }

  const currentRoleLabel = authRoles.find(r => r.role === activeRole)?.label ?? authRoles[0]?.label

  const handleLogout = () => {
    localStorage.removeItem('operator_session')
    setOperator(null)
    setIsManager(false)
    setVehicleInfo(null)
    setResults([])
    window.location.href = '/login'
  }

  // Navigate back to manager dashboard (only for managers)
  const handleBackToManagement = () => {
    localStorage.removeItem('operator_session')
    window.location.href = '/call-center'
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
          wheels: { wheel_number: number; rim_size: string; bolt_count: number; bolt_spacing: number; center_bore?: number | null; is_available: boolean; is_donut?: boolean }[]
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
            center_bore: w.center_bore,
            is_donut: w.is_donut
          })),
          availableCount: result.availableCount,
          totalCount: result.totalCount
        }))

        setResults(transformedResults)

        if (transformedResults.length === 0) {
          toast('לא נמצאו גלגלים מתאימים')
        } else {
          const totalAvailable = transformedResults.reduce((sum, r) => sum + r.wheels.filter(w => w.is_available).length, 0)
          toast.success(`נמצאו ${totalAvailable} גלגלים זמינים ב-${transformedResults.length} תחנות`)
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
            center_bore: plateData.wheel_fitment.center_bore || null,
            rim_sizes_allowed: plateData.wheel_fitment.rim_sizes_allowed || null,
            source_url: plateData.wheel_fitment.source_url || null
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

        // Check for multiple models with different specs
        const models = modelsData.models as VehicleModelRecord[]

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
          setShowModelSelection(true)
          setSearchLoading(false)
          return
        }

        const vehicleModel = models[0]
        pcdInfo = {
          manufacturer: vehicleModel.make_he || vehicleModel.make,
          model: vehicleModel.model,
          year: parseInt(year) || vehicleModel.year_from || 0,
          bolt_count: vehicleModel.bolt_count,
          bolt_spacing: vehicleModel.bolt_spacing,
          rim_size: vehicleModel.rim_size || '',
          front_tire: vehicleModel.tire_size_front || null,
          center_bore: vehicleModel.center_bore || null,
          rim_sizes_allowed: vehicleModel.rim_sizes_allowed || null,
          source_url: vehicleModel.source_url || null
        }
      }

      if (!pcdInfo) return

      setVehicleInfo(pcdInfo)

      // Step 2: Search for wheels
      const wheelParams = new URLSearchParams({
        bolt_count: pcdInfo.bolt_count.toString(),
        bolt_spacing: pcdInfo.bolt_spacing.toString(),
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
        wheels: { wheel_number: number; rim_size: string; center_bore?: number | null; is_available: boolean; is_donut?: boolean }[]
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
          center_bore: (w as any).center_bore,
          is_donut: w.is_donut
        })),
        availableCount: result.availableCount,
        totalCount: result.totalCount
      }))

      setResults(transformedResults)

      if (transformedResults.length === 0) {
        toast('לא נמצאו גלגלים מתאימים')
      } else {
        const totalAvailable = transformedResults.reduce((sum, r) => sum + r.wheels.filter(w => w.is_available).length, 0)
        toast.success(`נמצאו ${totalAvailable} גלגלים זמינים ב-${transformedResults.length} תחנות`)
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchError('שגיאה בחיפוש')
    } finally {
      setSearchLoading(false)
    }
  }

  // Handle model selection when multiple models match
  const handleModelSelect = async (selectedModel: VehicleModelRecord) => {
    setShowModelSelection(false)
    setMatchingModels([])
    setSearchLoading(true)

    try {
      const pcdInfo: VehicleInfo = {
        manufacturer: selectedModel.make_he || selectedModel.make,
        model: selectedModel.model,
        year: parseInt(year) || selectedModel.year_from || 0,
        bolt_count: selectedModel.bolt_count,
        bolt_spacing: selectedModel.bolt_spacing,
        rim_size: selectedModel.rim_size || '',
        front_tire: selectedModel.tire_size_front || null,
        center_bore: selectedModel.center_bore || null,
        rim_sizes_allowed: selectedModel.rim_sizes_allowed || null,
        source_url: selectedModel.source_url || null
      }

      setVehicleInfo(pcdInfo)

      // Search for wheels
      const wheelParams = new URLSearchParams({
        bolt_count: pcdInfo.bolt_count.toString(),
        bolt_spacing: pcdInfo.bolt_spacing.toString(),
      })

      const wheelsRes = await fetch(`/api/wheel-stations/search?${wheelParams}`)
      const wheelsData = await wheelsRes.json()

      if (!wheelsRes.ok) {
        setSearchError('שגיאה בחיפוש גלגלים')
        return
      }

      // Get station managers
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
        wheels: { wheel_number: number; rim_size: string; bolt_count: number; bolt_spacing: number; center_bore?: number | null; is_available: boolean; is_donut?: boolean }[]
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
          center_bore: w.center_bore,
          is_donut: w.is_donut
        })),
        availableCount: result.availableCount,
        totalCount: result.totalCount
      }))

      setResults(transformedResults)

      if (transformedResults.length === 0) {
        toast('לא נמצאו גלגלים מתאימים')
      } else {
        const totalAvailable = transformedResults.reduce((sum, r) => sum + r.wheels.filter(w => w.is_available).length, 0)
        toast.success(`נמצאו ${totalAvailable} גלגלים זמינים ב-${transformedResults.length} תחנות`)
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchError('שגיאה בחיפוש')
    } finally {
      setSearchLoading(false)
    }
  }

  // Report error for incorrect vehicle model
  const handleReportError = async (model: VehicleModelRecord) => {
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

  // Get just the link for driver
  const getFormLink = () => {
    if (!selectedWheel || !operator) return ''
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://wheel-stations.vercel.app'
    return `${baseUrl}/sign/${selectedWheel.station.id}?wheel=${selectedWheel.wheelNumber}&ref=operator_${operator.id}`
  }

  const [copiedLink, setCopiedLink] = useState(false)

  const copyLinkForDriver = () => {
    navigator.clipboard.writeText(getFormLink())
    setCopiedLink(true)
    toast.success('הלינק הועתק - שלח לכונן!')
    setTimeout(() => setCopiedLink(false), 2000)
  }

  // If no session, useEffect will redirect to /login
  if (!operator) {
    return (
      <div style={styles.loginContainer}>
        <div style={{color: '#94a3b8', textAlign: 'center'}}>
          <div style={{marginBottom: '10px'}}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3"/></svg></div>
          מעביר לדף ההתחברות...
        </div>
      </div>
    )
  }

  // Main interface
  return (
    <div style={styles.pageWrapper}>
      {/* Keyframes for spinner animation + responsive styles */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 640px) {
          .op-profile-name { display: none !important; }
        }
        @media all and (display-mode: standalone) {
          .op-glass-header-wrap { padding-top: max(8px, env(safe-area-inset-top, 8px)) !important; }
          .op-glass-spacer { height: calc(70px + env(safe-area-inset-top, 0px)) !important; }
        }

        /* Tablet breakpoint (768px) */
        @media (max-width: 768px) {
          .operator-search-tabs {
            flex-wrap: wrap !important;
          }
          .operator-search-tab {
            flex: 1 1 45% !important;
            min-width: 100px !important;
          }
          .operator-filter-grid-row {
            grid-template-columns: 1fr !important;
          }
          .operator-vehicle-specs-row {
            flex-wrap: wrap !important;
            gap: 10px !important;
          }
          .operator-wheels-grid {
            grid-template-columns: repeat(auto-fill, minmax(85px, 1fr)) !important;
          }
          .operator-station-header {
            flex-direction: column !important;
            gap: 8px !important;
            align-items: flex-start !important;
          }
        }

        /* Mobile breakpoint (640px) */
        @media (max-width: 640px) {
          .operator-search-tab {
            flex: 1 1 100% !important;
            padding: 8px !important;
            font-size: 0.8rem !important;
          }
          .operator-section {
            padding: 15px !important;
          }
          .operator-section-title {
            font-size: 1rem !important;
          }
          .operator-modal {
            max-width: calc(100% - 30px) !important;
            padding: 15px !important;
          }
          .operator-footer-text {
            font-size: 0.7rem !important;
          }
        }
      `}</style>
      {/* Glass header */}
      <div className="op-glass-header-wrap" style={styles.glassHeaderWrap}>
        <header style={styles.glassHeader}>

          {/* Avatar / profile dropdown */}
          <div ref={profileMenuRef} style={{ position: 'relative' }}>
            <button style={styles.profileBtn} onClick={() => setShowProfileMenu(!showProfileMenu)}>
              <div style={styles.avatar}>{getInitials(operator.full_name)}</div>
              <span className="op-profile-name" style={styles.profileName}>{operator.full_name.trim().split(' ')[0]}</span>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" style={{flexShrink:0}}><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {showProfileMenu && (
              <div style={styles.profileDropdown}>
                <div style={styles.profileInfo}>
                  <div style={styles.profileInfoName}>{operator.full_name}</div>
                  <div style={styles.profileInfoSub}>{operator.call_center_name}</div>
                </div>
                <div style={styles.profileDivider}/>
                {isManager && (
                  <button style={styles.profileItem} onClick={() => { setShowProfileMenu(false); handleBackToManagement() }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    חזרה לניהול
                  </button>
                )}
                <button style={{...styles.profileItem, color:'#ef4444'}} onClick={handleLogout}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  יציאה
                </button>
              </div>
            )}
          </div>

          <div style={{flex:1}}/>

          {/* Role chip */}
          {authRoles.length > 0 && currentRoleLabel && (
            <div ref={roleMenuRef} style={{ position: 'relative' }}>
              {authRoles.length === 1 ? (
                <span style={styles.roleStatic}>{currentRoleLabel}</span>
              ) : (
                <>
                  <button style={styles.roleBtn} onClick={() => setShowRoleMenu(!showRoleMenu)} aria-haspopup="menu" aria-expanded={showRoleMenu}>
                    {currentRoleLabel}
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  {showRoleMenu && (
                    <div style={styles.roleDropdown} role="menu">
                      {authRoles.map((r) => (
                        <button key={r.role} role="menuitem" style={{...styles.roleOption, ...(r.role === activeRole ? styles.roleOptionActive : {})}} onClick={() => navigateToRole(r)}>
                          {r.label}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

        </header>
      </div>
      <div className="op-glass-spacer" style={styles.glassSpacer}/>

      <div style={styles.container}>
        {/* Search Section */}
        <div style={styles.section} className="operator-section">
          <h3 style={styles.sectionTitle} className="operator-section-title"><span style={{display:'inline-flex',alignItems:'center',gap:'6px'}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> חיפוש גלגל לרכב</span></h3>

          {/* Search Tabs - 3 options */}
          <div style={styles.searchTabs} className="operator-search-tabs">
            <button
              style={{...styles.searchTab, ...(searchTab === 'plate' ? styles.searchTabActive : {})}}
              className="operator-search-tab"
              onClick={() => { setSearchTab('plate'); setSearchError(''); setVehicleInfo(null); setResults([]); }}
            >
              <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="7" y1="2" x2="7" y2="6"/><line x1="17" y1="2" x2="17" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> מספר רכב</span>
            </button>
            <button
              style={{...styles.searchTab, ...(searchTab === 'model' ? styles.searchTabActive : {})}}
              className="operator-search-tab"
              onClick={() => { setSearchTab('model'); setSearchError(''); setVehicleInfo(null); setResults([]); }}
            >
              <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="15" cy="17" r="2"/></svg> יצרן ודגם</span>
            </button>
            <button
              style={{...styles.searchTab, ...(searchTab === 'spec' ? styles.searchTabActive : {})}}
              className="operator-search-tab"
              onClick={() => { setSearchTab('spec'); setSearchError(''); setVehicleInfo(null); setResults([]); }}
            >
              <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg> לפי מפרט</span>
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
                {searchLoading ? <span style={styles.spinner}></span> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>}
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
                  {searchLoading ? <span style={styles.spinner}></span> : <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> חפש</span>}
                </button>
                {(make || model || year) && (
                  <button
                    onClick={() => { setMake(''); setModel(''); setYear(''); setFieldErrors({make: false, model: false, year: false}); }}
                    style={styles.clearBtn}
                    title="נקה שדות"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Search by Spec (PCD) */}
          {searchTab === 'spec' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* First row - 2 columns */}
              <div style={styles.filterGridRow} className="operator-filter-grid-row">
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
              <div style={styles.filterGridRow} className="operator-filter-grid-row">
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
                  <select
                    style={styles.filterSelect}
                    value={specFilters.center_bore}
                    onChange={e => setSpecFilters({...specFilters, center_bore: e.target.value})}
                  >
                    <option value="">בחר...</option>
                    {filterOptions?.center_bores.map(cb => (
                      <option key={cb} value={cb}>{cb}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleSearch}
                disabled={searchLoading}
                style={{...styles.searchBtn, width: '100%', padding: '12px'}}
              >
                {searchLoading ? <span style={styles.spinner}></span> : <span style={{display:'inline-flex',alignItems:'center',gap:'5px'}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>חפש</span>}
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
              <div style={styles.vehicleInfoHeader}>
                <span>{vehicleInfo.manufacturer} {vehicleInfo.model} {vehicleInfo.year}</span>
                {vehicleInfo.source_url && (
                  <a
                    href={vehicleInfo.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.sourceLink}
                  >
                    <span style={{display:'inline-flex',alignItems:'center',gap:'3px'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> אמת מידות</span>
                  </a>
                )}
              </div>
              <div style={styles.vehicleSpecsRow} className="operator-vehicle-specs-row">
                <div style={styles.specBox}>
                  <span style={styles.specLabel}>PCD</span>
                  <span style={styles.specValue}>{vehicleInfo.bolt_count}×{vehicleInfo.bolt_spacing}</span>
                </div>
                {vehicleInfo.center_bore && (
                  <div style={styles.specBox}>
                    <span style={styles.specLabel}>CB</span>
                    <span style={styles.specValue}>{vehicleInfo.center_bore}</span>
                  </div>
                )}
                {vehicleInfo.rim_size && (
                  <div style={styles.specBox}>
                    <span style={styles.specLabel}>גודל</span>
                    <span style={styles.specValue}>{vehicleInfo.rim_size}"</span>
                  </div>
                )}
              </div>
              {vehicleInfo.rim_sizes_allowed && vehicleInfo.rim_sizes_allowed.length > 0 && (
                <div style={styles.allowedSizesBox}>
                  <span style={styles.allowedSizesLabel}>גדלים מותרים:</span>
                  <span style={styles.allowedSizesValue}>
                    {vehicleInfo.rim_sizes_allowed.join('" / ')}"
                  </span>
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
                  return w.is_available && !(vrs && ws > vrs)
                }).length, 0)} גלגלים זמינים ב-{results.length} תחנות
              </span>
            </div>

            {results.map(result => (
              <div key={result.station.id} style={styles.stationCard}>
                <div style={styles.stationHeader} className="operator-station-header">
                  <div>
                    <div style={styles.stationName}>{result.station.name}</div>
                    <div style={styles.stationAddress}>{result.station.address || 'כתובת לא הוגדרה'}</div>
                  </div>
                  <span style={styles.wheelCount}>
                    {result.wheels.filter(w => {
                      const ws = parseInt(w.rim_size)
                      const vrs = vehicleInfo?.rim_size ? parseInt(vehicleInfo.rim_size) : null
                      return w.is_available && !(vrs && ws > vrs)
                    }).length} זמינים
                    {result.wheels.filter(w => !w.is_available).length > 0 && (
                      <span style={{color: '#94a3b8', fontSize: '0.8em', marginRight: '4px'}}>
                        ({result.wheels.filter(w => !w.is_available).length} בהשאלה)
                      </span>
                    )}
                  </span>
                </div>
                <div style={styles.wheelsGrid} className="operator-wheels-grid">
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
                    if (!wheel.is_available) {
                      return (
                        <div
                          key={wheel.wheel_number}
                          style={{
                            ...styles.wheelItem,
                            background: 'rgba(148, 163, 184, 0.1)',
                            border: '1px solid rgba(148, 163, 184, 0.3)',
                            cursor: 'default',
                            opacity: 0.7,
                          }}
                        >
                          <div style={styles.wheelNumber}>#{wheel.wheel_number}</div>
                          <div style={styles.wheelSpecs}>{wheel.rim_size}&quot;</div>
                          <div style={{fontSize: '0.65rem', color: '#94a3b8', marginTop: '4px', fontWeight: 600, display:'flex', alignItems:'center', gap:'2px'}}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> בהשאלה</div>
                        </div>
                      )
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
                        <div style={styles.wheelSpecs}>{wheel.pcd} | {wheel.rim_size}&quot;{wheel.center_bore ? ` | CB ${wheel.center_bore}` : ''}</div>
                        {wheel.is_donut && (
                          <div style={{...styles.donutBadge, display:'flex', alignItems:'center', gap:'3px'}}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg> דונאט</div>
                        )}
                        {sizeMatch && (
                          <div style={{
                            fontSize: '0.7rem',
                            marginTop: '4px',
                            color: sizeMatch === 'exact' ? '#10b981' : '#f59e0b'
                          }}>
                            {sizeMatch === 'exact' ? <span style={{display:'inline-flex',alignItems:'center',gap:'3px'}}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>מתאים</span> : '↓ קטן יותר'}
                          </div>
                        )}
                        {(() => {
                          const vCB = vehicleInfo?.center_bore
                          const wCB = wheel.center_bore
                          if (!vCB || !wCB) return null
                          if (wCB < vCB) return (
                            <div style={{fontSize: '0.7rem', marginTop: '4px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '2px'}}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> CB גלגל ({wCB}) קטן מהרכב ({vCB})
                            </div>
                          )
                          if ((wCB - vCB) >= 2) return (
                            <div style={{fontSize: '0.7rem', marginTop: '4px', color: '#b45309', display: 'flex', alignItems: 'center', gap: '2px'}}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> יתכן ונדרש טבעת מירכוז
                            </div>
                          )
                          return null
                        })()}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Model Selection Modal - When multiple specs found */}
      {showModelSelection && matchingModels.length > 0 && (
        <div style={styles.modalOverlay} onClick={() => setShowModelSelection(false)}>
          <div style={{...styles.modal, maxWidth: '500px'}} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>נמצאו מספר מפרטים לרכב זה</h3>
              <button style={styles.closeBtn} onClick={() => setShowModelSelection(false)}>×</button>
            </div>

            <div style={{padding: '15px'}}>
              <p style={{color: '#64748b', marginBottom: '15px', fontSize: '14px'}}>
                נמצאו {matchingModels.length} רשומות שונות. בחר את המפרט הנכון:
              </p>

              {matchingModels.map((m, idx) => (
                <div
                  key={m.id}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '10px',
                    background: '#f8fafc'
                  }}
                >
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                    <span style={{fontWeight: 600, color: '#1e293b'}}>
                      אפשרות {idx + 1}
                    </span>
                    <div style={{display: 'flex', gap: '8px'}}>
                      <button
                        onClick={() => handleModelSelect(m)}
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
                        onClick={() => handleReportError(m)}
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
                        <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> דווח שגיאה</span>
                      </button>
                    </div>
                  </div>
                  <div style={{fontSize: '14px', color: '#475569'}}>
                    <div><strong>PCD:</strong> {m.bolt_count}×{m.bolt_spacing}</div>
                    {m.center_bore && <div><strong>CB:</strong> {m.center_bore}</div>}
                    {m.rim_size && <div><strong>גודל ג&apos;אנט:</strong> {m.rim_size}&quot;</div>}
                    {m.year_from && <div><strong>שנים:</strong> {m.year_from}{m.year_to ? `-${m.year_to}` : '+'}</div>}
                    {m.source && <div style={{fontSize: '12px', color: '#94a3b8', marginTop: '4px'}}>מקור: {m.source}</div>}
                  </div>
                </div>
              ))}

              <p style={{color: '#94a3b8', fontSize: '12px', marginTop: '10px'}}>
                <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg> בחר את המפרט הנכון. אם יש מידע שגוי - לחץ &quot;דווח שגיאה&quot; והאדמין יטפל</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {selectedWheel && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modal} className="operator-modal" onClick={e => e.stopPropagation()}>
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                style={{...styles.copyBtn, ...(copied ? styles.copyBtnCopied : {})}}
                onClick={copyMessage}
              >
                {copied ? <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> הועתק!</span> : <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg> העתק הודעה</span>}
              </button>

              <button
                style={{
                  ...styles.copyBtn,
                  background: copiedLink
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  fontSize: '0.9rem'
                }}
                onClick={copyLinkForDriver}
              >
                {copiedLink ? <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> הלינק הועתק!</span> : <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="15" cy="17" r="2"/></svg> העתק לינק לכונן (ללא ווצאפ)</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerInfo}>
          <p style={styles.footerText} className="operator-footer-text">
            מערכת גלגלים ידידים •{' '}
            <Link href="/feedback" style={styles.footerLink}>
              דווח על בעיה או הצע שיפור
            </Link>
          </p>
          <p style={styles.legalLinks}>
            <Link href="/guide" style={styles.footerLink}>
              מדריך למשתמש
            </Link>
            {' • '}
            <Link href="/privacy" style={styles.footerLink}>
              מדיניות פרטיות
            </Link>
            {' • '}
            <Link href="/accessibility" style={styles.footerLink}>
              הצהרת נגישות
            </Link>
          </p>
        </div>
      </footer>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  pageWrapper: {
    background: '#f1f5f9',
    minHeight: '100vh',
    color: '#1e293b',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    direction: 'rtl',
    display: 'flex',
    flexDirection: 'column',
  },
  loginContainer: {
    minHeight: '100vh',
    background: '#f1f5f9',
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
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    padding: '40px 30px',
    textAlign: 'center',
    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
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
    color: '#1e293b',
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
  glassHeaderWrap: {
    position: 'fixed' as const,
    top: 0, left: 0, right: 0,
    zIndex: 1000,
    padding: '8px 12px 0',
  },
  glassHeader: {
    background: 'rgba(255,255,255,0.82)',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    border: '1px solid rgba(255,255,255,0.9)',
    boxShadow: '0 4px 20px rgba(16,185,129,0.08), 0 1px 4px rgba(0,0,0,0.04)',
    borderRadius: '16px',
    padding: '0 14px',
    height: '54px',
    display: 'flex',
    alignItems: 'center',
    direction: 'rtl' as const,
  },
  glassSpacer: { height: '70px' },
  profileBtn: {
    display: 'flex', alignItems: 'center', gap: '5px',
    background: 'rgba(255,255,255,0.8)',
    border: '1px solid rgba(226,232,240,0.8)',
    borderRadius: '50px', padding: '4px 8px 4px 6px',
    cursor: 'pointer', color: '#1e293b',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  avatar: {
    width: '32px', height: '32px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: '13px', color: 'white', flexShrink: 0,
  },
  profileName: { fontSize: '13px', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap' as const },
  profileDropdown: {
    position: 'absolute' as const, top: 'calc(100% + 8px)', right: 0,
    background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.10)', zIndex: 200, minWidth: '200px', overflow: 'hidden',
  },
  profileInfo: { padding: '12px 16px' },
  profileInfoName: { fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' },
  profileInfoSub: { fontSize: '0.75rem', color: '#10b981', marginTop: '2px' },
  profileDivider: { height: '1px', background: '#f1f5f9' },
  profileItem: {
    display: 'flex', alignItems: 'center', gap: '10px',
    width: '100%', padding: '10px 16px',
    background: 'transparent', border: 'none', cursor: 'pointer',
    fontSize: '0.85rem', color: '#374151',
    textAlign: 'right' as const, fontFamily: 'inherit', direction: 'rtl' as const,
  },
  roleStatic: {
    background: 'rgba(16,185,129,0.09)', color: '#059669',
    fontSize: '12px', fontWeight: 600, padding: '5px 12px',
    borderRadius: '20px', whiteSpace: 'nowrap',
  } as React.CSSProperties,
  roleBtn: {
    background: 'rgba(16,185,129,0.09)', color: '#059669',
    fontSize: '12px', fontWeight: 600, padding: '5px 10px',
    borderRadius: '20px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '5px',
    fontFamily: 'inherit', whiteSpace: 'nowrap', border: 'none',
  } as React.CSSProperties,
  roleDropdown: {
    position: 'absolute', top: 'calc(100% + 8px)', left: 0,
    background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px',
    overflow: 'hidden', minWidth: '150px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.10)', zIndex: 200,
  } as React.CSSProperties,
  roleOption: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '10px 16px', color: '#1e293b', fontSize: '13px',
    cursor: 'pointer', fontWeight: 500,
    background: 'transparent', border: 'none', width: '100%',
    textAlign: 'right' as const, fontFamily: 'inherit',
  } as React.CSSProperties,
  roleOptionActive: { color: '#059669', fontWeight: 700 } as React.CSSProperties,
  btnBackToManagement: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #8b5cf6',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 500,
  },
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '20px',
    flex: 1,
  },
  section: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  sectionTitle: {
    color: '#1e293b',
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
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  searchTabActive: {
    background: '#f0fdf4',
    borderColor: '#bbf7d0',
    color: '#16a34a',
    fontWeight: 600,
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
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '0 0 8px 8px',
    zIndex: 100,
    maxHeight: '200px',
    overflowY: 'auto',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
  suggestionItem: {
    padding: '10px 12px',
    cursor: 'pointer',
    borderBottom: '1px solid #f1f5f9',
    color: '#1e293b',
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
    color: '#64748b',
    fontSize: '0.85rem',
    fontWeight: 500,
  },
  filterSelect: {
    padding: '10px 12px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    color: '#1e293b',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  filterInput: {
    padding: '10px 12px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    color: '#1e293b',
    fontSize: '0.9rem',
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: '15px',
    textAlign: 'right',
  },
  formLabel: {
    display: 'block',
    color: '#475569',
    fontSize: '0.85rem',
    marginBottom: '6px',
  },
  formInput: {
    width: '100%',
    padding: '12px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    color: '#1e293b',
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
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '10px',
    padding: '12px',
    marginTop: '15px',
  },
  vehicleInfoHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#1e293b',
    fontWeight: 600,
    marginBottom: '12px',
  },
  vehicleSpecsRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    marginBottom: '10px',
  },
  specBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: '#f1f5f9',
    padding: '8px 16px',
    borderRadius: '10px',
    minWidth: '60px',
    border: '1px solid #e2e8f0',
  },
  specLabel: {
    fontSize: '0.65rem',
    color: '#64748b',
    marginBottom: '2px',
    textTransform: 'uppercase',
  },
  specValue: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#1e293b',
  },
  allowedSizesBox: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    background: '#f0fdf4',
    borderRadius: '8px',
    border: '1px solid #bbf7d0',
  },
  allowedSizesLabel: {
    fontSize: '0.75rem',
    color: '#16a34a',
  },
  allowedSizesValue: {
    fontSize: '0.85rem',
    fontWeight: 'bold',
    color: '#16a34a',
  },
  sourceLink: {
    background: '#eff6ff',
    color: '#2563eb',
    padding: '4px 10px',
    borderRadius: '6px',
    fontWeight: '500',
    fontSize: '0.75rem',
    textDecoration: 'none',
    border: '1px solid #bfdbfe',
  },
  vehicleInfoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#1e293b',
    fontWeight: 600,
  },
  pcdBadge: {
    background: '#dcfce7',
    color: '#16a34a',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.85rem',
  },
  rimBadge: {
    background: '#dbeafe',
    color: '#2563eb',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  centerBoreBadge: {
    background: '#f3e8ff',
    color: '#9333ea',
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
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '15px',
    marginBottom: '12px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  stationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
    paddingBottom: '12px',
    borderBottom: '1px solid #e2e8f0',
  },
  stationName: {
    color: '#1e293b',
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
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    padding: '10px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  wheelItemExact: {
    background: '#dcfce7',
    border: '2px solid #22c55e',
  },
  wheelItemSmaller: {
    background: '#fffbeb',
    border: '1px solid #fde68a',
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
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '450px',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  modalTitle: {
    color: '#1e293b',
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
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '10px',
    padding: '12px',
    marginBottom: '15px',
  },
  wheelInfoTitle: {
    color: '#16a34a',
    fontWeight: 700,
  },
  wheelInfoSub: {
    color: '#64748b',
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
    background: '#f8fafc',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    padding: '12px',
    marginBottom: '8px',
    cursor: 'pointer',
  },
  contactOptionSelected: {
    borderColor: '#2563eb',
    background: '#eff6ff',
  },
  contactName: {
    color: '#1e293b',
    fontWeight: 600,
  },
  contactPhone: {
    color: '#2563eb',
    fontSize: '0.9rem',
  },
  previewTitle: {
    color: '#94a3b8',
    fontSize: '0.9rem',
    margin: '0 0 10px 0',
  },
  messagePreview: {
    background: '#f8fafc',
    borderRadius: '10px',
    padding: '15px',
    marginBottom: '15px',
    whiteSpace: 'pre-line',
    fontSize: '0.9rem',
    lineHeight: 1.6,
    color: '#1e293b',
    border: '1px solid #e2e8f0',
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
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
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
  footer: {
    textAlign: 'center',
    marginTop: 'auto',
    paddingTop: '40px',
    paddingBottom: '20px',
    borderTop: '1px solid #e2e8f0',
  },
  footerInfo: {
    marginTop: '0',
  },
  footerText: {
    color: '#94a3b8',
    fontSize: '0.75rem',
    margin: 0,
  },
  footerLink: {
    color: '#16a34a',
    textDecoration: 'none',
  },
  legalLinks: {
    color: '#94a3b8',
    fontSize: '0.7rem',
    marginTop: '8px',
  },
}
