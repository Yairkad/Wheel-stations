'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast, { Toaster } from 'react-hot-toast'

interface VehicleModel {
  id: string
  make: string
  make_he: string
  model: string
  model_he: string | null
  year_from: number
  year_to: number | null
  bolt_count: number
  bolt_spacing: number
  center_bore: number | null
  rim_size: string | null
  tire_size_front: string | null
  created_at: string
  added_by: string | null
}

interface EditForm {
  make: string
  make_he: string
  model: string
  model_he: string
  year_from: string
  year_to: string
  bolt_count: string
  bolt_spacing: string
  center_bore: string
  rim_size: string
  tire_size_front: string
}

interface ScrapeResult {
  make: string
  model: string
  year: number
  bolt_count: number
  bolt_spacing: number
  center_bore: number | null
  rim_sizes: string[]
  tire_sizes: string[]
  source_url: string
}

const WHEELS_ADMIN_PASSWORD = process.env.NEXT_PUBLIC_WHEELS_ADMIN_PASSWORD || 'wheels2024'

export default function VehiclesAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const [vehicles, setVehicles] = useState<VehicleModel[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Scrape form state
  const [showScrapeModal, setShowScrapeModal] = useState(false)
  const [scrapeMode, setScrapeMode] = useState<'manual' | 'plate'>('manual')
  const [plateNumber, setPlateNumber] = useState('')
  const [plateLoading, setPlateLoading] = useState(false)
  const [plateVehicleInfo, setPlateVehicleInfo] = useState<{
    manufacturer: string
    manufacturer_he: string
    model: string
    year: number
  } | null>(null)
  const [scrapeForm, setScrapeForm] = useState({
    make: '',
    model: '',
    year: ''
  })
  const [scrapeLoading, setScrapeLoading] = useState(false)
  const [scrapeResult, setScrapeResult] = useState<ScrapeResult | null>(null)
  const [scrapeError, setScrapeError] = useState<string | null>(null)

  // Add model form
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({
    make: '',
    make_he: '',
    model: '',
    model_he: '',
    year_from: '',
    year_to: '',
    bolt_count: '',
    bolt_spacing: '',
    center_bore: '',
    rim_size: '',
    tire_size_front: ''
  })
  const [addLoading, setAddLoading] = useState(false)

  // Edit model state
  const [editingVehicle, setEditingVehicle] = useState<VehicleModel | null>(null)
  const [editForm, setEditForm] = useState<EditForm>({
    make: '',
    make_he: '',
    model: '',
    model_he: '',
    year_from: '',
    year_to: '',
    bolt_count: '',
    bolt_spacing: '',
    center_bore: '',
    rim_size: '',
    tire_size_front: ''
  })
  const [editLoading, setEditLoading] = useState(false)

  // Autocomplete state
  const [makeSuggestions, setMakeSuggestions] = useState<string[]>([])
  const [modelSuggestions, setModelSuggestions] = useState<string[]>([])
  const [showMakeSuggestions, setShowMakeSuggestions] = useState(false)
  const [showModelSuggestions, setShowModelSuggestions] = useState(false)

  // Column filters state
  const [columnFilters, setColumnFilters] = useState<{
    [key: string]: { type: 'empty' | 'equals' | 'greater' | 'less' | ''; value: string }
  }>({
    make: { type: '', value: '' },
    model: { type: '', value: '' },
    year_from: { type: '', value: '' },
    bolt_count: { type: '', value: '' },
    bolt_spacing: { type: '', value: '' },
    center_bore: { type: '', value: '' },
    rim_size: { type: '', value: '' },
  })

  // Common car makes for autocomplete
  const commonMakes = [
    'Toyota', 'Hyundai', 'Kia', 'Mazda', 'Honda', 'Nissan', 'Suzuki', 'Mitsubishi',
    'Subaru', 'Volkswagen', 'Skoda', 'Seat', 'Audi', 'BMW', 'Mercedes-Benz',
    'Peugeot', 'Citroen', 'Renault', 'Fiat', 'Alfa Romeo', 'Chevrolet', 'Ford',
    'Jeep', 'Dacia', 'Opel', 'Volvo', 'Lexus', 'Infiniti', 'Tesla', 'BYD', 'MG'
  ]

  // Fetch model suggestions based on make
  const fetchModelSuggestions = async (make: string, modelQuery: string) => {
    if (modelQuery.length < 1 || !make) {
      setModelSuggestions([])
      return
    }
    try {
      const response = await fetch(`/api/vehicle-models?make=${encodeURIComponent(make)}&model=${encodeURIComponent(modelQuery)}`)
      const data = await response.json()
      const uniqueModels = [...new Set(data.vehicles?.map((v: VehicleModel) => v.model) || [])]
      setModelSuggestions(uniqueModels.slice(0, 8) as string[])
    } catch {
      setModelSuggestions([])
    }
  }

  useEffect(() => {
    const saved = sessionStorage.getItem('wheels_admin_auth')
    if (saved === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchVehicles()
    }
  }, [isAuthenticated])

  const handleLogin = () => {
    if (password === WHEELS_ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      sessionStorage.setItem('wheels_admin_auth', 'true')
      setPasswordError('')
    } else {
      setPasswordError('סיסמא שגויה')
    }
  }

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicle-models')
      if (response.ok) {
        const data = await response.json()
        setVehicles(data.vehicles || [])
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err)
    } finally {
      setLoading(false)
    }
  }

  // Lookup vehicle by plate number
  const handlePlateLookup = async () => {
    if (!plateNumber || plateNumber.length < 7) {
      toast.error('נא להזין מספר רכב תקין (7-8 ספרות)')
      return
    }

    setPlateLoading(true)
    setPlateVehicleInfo(null)
    setScrapeResult(null)
    setScrapeError(null)

    try {
      const response = await fetch(`/api/vehicle/lookup?plate=${plateNumber}`)
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'רכב לא נמצא')
      }

      // Extract make from Hebrew manufacturer name
      const makeHebrew = data.vehicle.manufacturer || ''
      const makeEnglish = extractMakeFromHebrew(makeHebrew)

      setPlateVehicleInfo({
        manufacturer: makeEnglish || makeHebrew,
        manufacturer_he: makeHebrew,
        model: data.vehicle.model || '',
        year: data.vehicle.year
      })

      // Auto-fill the scrape form
      setScrapeForm({
        make: makeEnglish || '',
        model: data.vehicle.model || '',
        year: data.vehicle.year?.toString() || ''
      })

      toast.success('פרטי הרכב נמצאו!')
    } catch (err: any) {
      toast.error(err.message || 'שגיאה בחיפוש הרכב')
      setScrapeError(err.message)
    } finally {
      setPlateLoading(false)
    }
  }

  // Helper function to extract English make from Hebrew
  const extractMakeFromHebrew = (hebrew: string): string => {
    const makeMap: { [key: string]: string } = {
      'טויוטה': 'Toyota',
      'יונדאי': 'Hyundai',
      'קיה': 'Kia',
      'מאזדה': 'Mazda',
      'הונדה': 'Honda',
      'ניסאן': 'Nissan',
      'סוזוקי': 'Suzuki',
      'מיצובישי': 'Mitsubishi',
      'סובארו': 'Subaru',
      'פולקסווגן': 'Volkswagen',
      'סקודה': 'Skoda',
      'סיאט': 'Seat',
      'אאודי': 'Audi',
      'אודי': 'Audi',
      'ב.מ.וו': 'BMW',
      'מרצדס': 'Mercedes-Benz',
      'פיג\'ו': 'Peugeot',
      'פיגו': 'Peugeot',
      'סיטרואן': 'Citroen',
      'רנו': 'Renault',
      'פיאט': 'Fiat',
      'אלפא רומיאו': 'Alfa Romeo',
      'שברולט': 'Chevrolet',
      'פורד': 'Ford',
      "ג'יפ": 'Jeep',
      'דאצ\'יה': 'Dacia',
      'אופל': 'Opel',
      'וולוו': 'Volvo',
      'לקסוס': 'Lexus',
      'אינפיניטי': 'Infiniti',
      'טסלה': 'Tesla',
    }

    const hebrewLower = hebrew.toLowerCase()
    for (const [heb, eng] of Object.entries(makeMap)) {
      if (hebrewLower.includes(heb)) {
        return eng
      }
    }
    return ''
  }

  // Scrape from wheel-size.com
  const handleScrape = async () => {
    if (!scrapeForm.make || !scrapeForm.model || !scrapeForm.year) {
      toast.error('נא למלא את כל השדות')
      return
    }

    setScrapeLoading(true)
    setScrapeResult(null)
    setScrapeError(null)

    try {
      const response = await fetch('/api/vehicle-models/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          make: scrapeForm.make,
          model: scrapeForm.model,
          year: scrapeForm.year
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'שגיאה בגרידת המידע')
      }

      if (data.success && data.data) {
        setScrapeResult(data.data)
        toast.success('המידע נמצא בהצלחה!')
      } else {
        throw new Error('לא נמצא מידע')
      }
    } catch (err: any) {
      setScrapeError(err.message || 'שגיאה בגרידה')
      toast.error(err.message || 'שגיאה בגרידה')
    } finally {
      setScrapeLoading(false)
    }
  }

  // Add scraped result to database
  const handleAddScrapedResult = async () => {
    if (!scrapeResult) return

    setAddLoading(true)
    try {
      const response = await fetch('/api/vehicle-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          make: scrapeResult.make,
          make_he: '', // Admin can fill this later
          model: scrapeResult.model,
          year_from: scrapeResult.year,
          year_to: null,
          bolt_count: scrapeResult.bolt_count,
          bolt_spacing: scrapeResult.bolt_spacing,
          center_bore: scrapeResult.center_bore,
          rim_size: scrapeResult.rim_sizes?.join(', ') || '',
          tire_size_front: scrapeResult.tire_sizes?.[0] || '',
          added_by: 'admin-scrape'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'שגיאה בהוספת הדגם')
      }

      toast.success('הדגם נוסף בהצלחה למאגר!')
      fetchVehicles()
      setShowScrapeModal(false)
      setScrapeResult(null)
      setScrapeForm({ make: '', model: '', year: '' })
    } catch (err: any) {
      toast.error(err.message || 'שגיאה בהוספה')
    } finally {
      setAddLoading(false)
    }
  }

  // Add manual model
  const handleAddManual = async () => {
    if (!addForm.make || !addForm.model || !addForm.bolt_count || !addForm.bolt_spacing) {
      toast.error('נא למלא את שדות החובה')
      return
    }

    setAddLoading(true)
    try {
      const response = await fetch('/api/vehicle-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...addForm,
          year_from: addForm.year_from ? parseInt(addForm.year_from) : null,
          year_to: addForm.year_to ? parseInt(addForm.year_to) : null,
          bolt_count: parseInt(addForm.bolt_count),
          bolt_spacing: parseFloat(addForm.bolt_spacing),
          center_bore: addForm.center_bore ? parseFloat(addForm.center_bore) : null,
          added_by: 'admin-manual'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'שגיאה בהוספת הדגם')
      }

      toast.success('הדגם נוסף בהצלחה!')
      fetchVehicles()
      setShowAddModal(false)
      setAddForm({
        make: '', make_he: '', model: '', model_he: '', year_from: '', year_to: '',
        bolt_count: '', bolt_spacing: '', center_bore: '', rim_size: '', tire_size_front: ''
      })
    } catch (err: any) {
      toast.error(err.message || 'שגיאה בהוספה')
    } finally {
      setAddLoading(false)
    }
  }

  // Open edit modal
  const openEditModal = (vehicle: VehicleModel) => {
    setEditForm({
      make: vehicle.make || '',
      make_he: vehicle.make_he || '',
      model: vehicle.model || '',
      model_he: vehicle.model_he || '',
      year_from: vehicle.year_from?.toString() || '',
      year_to: vehicle.year_to?.toString() || '',
      bolt_count: vehicle.bolt_count?.toString() || '',
      bolt_spacing: vehicle.bolt_spacing?.toString() || '',
      center_bore: vehicle.center_bore?.toString() || '',
      rim_size: vehicle.rim_size || '',
      tire_size_front: vehicle.tire_size_front || ''
    })
    setEditingVehicle(vehicle)
  }

  // Update model
  const handleUpdateVehicle = async () => {
    if (!editingVehicle) return
    if (!editForm.make || !editForm.model || !editForm.bolt_count || !editForm.bolt_spacing) {
      toast.error('נא למלא את שדות החובה')
      return
    }

    setEditLoading(true)
    try {
      const response = await fetch(`/api/vehicle-models/${editingVehicle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          year_from: editForm.year_from ? parseInt(editForm.year_from) : null,
          year_to: editForm.year_to ? parseInt(editForm.year_to) : null,
          bolt_count: parseInt(editForm.bolt_count),
          bolt_spacing: parseFloat(editForm.bolt_spacing),
          center_bore: editForm.center_bore ? parseFloat(editForm.center_bore) : null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'שגיאה בעדכון')
      }

      toast.success('הדגם עודכן בהצלחה!')
      fetchVehicles()
      setEditingVehicle(null)
    } catch (err: any) {
      toast.error(err.message || 'שגיאה בעדכון')
    } finally {
      setEditLoading(false)
    }
  }

  // Delete model
  const handleDelete = async (id: string) => {
    if (!confirm('האם למחוק דגם זה?')) return

    try {
      const response = await fetch(`/api/vehicle-models/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('הדגם נמחק')
        fetchVehicles()
      } else {
        throw new Error('שגיאה במחיקה')
      }
    } catch {
      toast.error('שגיאה במחיקה')
    }
  }

  // Apply column filter to a value
  const applyColumnFilter = (value: any, filter: { type: string; value: string }): boolean => {
    if (!filter.type) return true

    if (filter.type === 'empty') {
      return value === null || value === undefined || value === ''
    }

    if (filter.type === 'equals') {
      if (typeof value === 'number') {
        return value === parseFloat(filter.value)
      }
      return String(value).toLowerCase() === filter.value.toLowerCase()
    }

    if (filter.type === 'greater') {
      const numVal = typeof value === 'number' ? value : parseFloat(value)
      return !isNaN(numVal) && numVal > parseFloat(filter.value)
    }

    if (filter.type === 'less') {
      const numVal = typeof value === 'number' ? value : parseFloat(value)
      return !isNaN(numVal) && numVal < parseFloat(filter.value)
    }

    return true
  }

  // Check if any filter is active
  const hasActiveFilters = () => {
    return Object.values(columnFilters).some(f => f.type !== '') || searchQuery !== ''
  }

  // Reset all filters
  const resetFilters = () => {
    setColumnFilters({
      make: { type: '', value: '' },
      model: { type: '', value: '' },
      year_from: { type: '', value: '' },
      bolt_count: { type: '', value: '' },
      bolt_spacing: { type: '', value: '' },
      center_bore: { type: '', value: '' },
      rim_size: { type: '', value: '' },
    })
    setSearchQuery('')
  }

  // Filter vehicles
  const filteredVehicles = vehicles.filter(v => {
    // Search query filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const matchesSearch = (
        v.make.toLowerCase().includes(q) ||
        v.make_he?.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q)
      )
      if (!matchesSearch) return false
    }

    // Column filters
    if (!applyColumnFilter(v.make, columnFilters.make)) return false
    if (!applyColumnFilter(v.model, columnFilters.model)) return false
    if (!applyColumnFilter(v.year_from, columnFilters.year_from)) return false
    if (!applyColumnFilter(v.bolt_count, columnFilters.bolt_count)) return false
    if (!applyColumnFilter(v.bolt_spacing, columnFilters.bolt_spacing)) return false
    if (!applyColumnFilter(v.center_bore, columnFilters.center_bore)) return false
    if (!applyColumnFilter(v.rim_size, columnFilters.rim_size)) return false

    return true
  })

  // Login screen
  if (!isAuthenticated) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginBox}>
          <div style={styles.loginLogoIcon}>🚗</div>
          <h1 style={styles.loginTitle}>ניהול מאגר רכבים</h1>
          <p style={styles.loginSubtitle}>הזן סיסמת מנהל</p>
          <input
            type="password"
            placeholder="סיסמא"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={styles.formInput}
          />
          {passwordError && <div style={styles.errorText}>{passwordError}</div>}
          <button style={styles.loginBtn} onClick={handleLogin}>כניסה</button>
          <Link href="/admin" style={styles.backLink}>← חזרה לניהול תחנות</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.pageWrapper}>
      <Toaster position="top-center" />

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLogo}>
            <div style={styles.logoIcon}>🚗</div>
            <div>
              <h1 style={styles.headerTitle}>ניהול מאגר דגמי רכבים</h1>
              <p style={styles.headerSubtitle}>גרידה והוספת דגמים למאגר PCD</p>
            </div>
          </div>
          <Link href="/admin" style={styles.btnBack}>← חזרה לניהול</Link>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📊</div>
          <div>
            <div style={styles.statLabel}>דגמים במאגר</div>
            <div style={styles.statValue}>{vehicles.length}</div>
          </div>
        </div>
      </div>

      <div style={styles.container}>
        {/* Actions */}
        <div style={styles.actionsRow}>
          <button style={styles.btnPrimary} onClick={() => setShowScrapeModal(true)}>
            🌐 גרידה מ-wheel-size.com
          </button>
          <button style={styles.btnSecondary} onClick={() => setShowAddModal(true)}>
            ➕ הוספה ידנית
          </button>
        </div>

        {/* Search */}
        <div style={styles.searchContainer}>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="🔍 חפש לפי יצרן או דגם..."
            style={styles.searchInput}
          />
        </div>

        {/* Vehicles Table */}
        <div style={styles.tableContainer}>
          {loading ? (
            <div style={styles.loading}>טוען...</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>יצרן</th>
                  <th style={styles.th}>דגם</th>
                  <th style={styles.th}>שנים</th>
                  <th style={styles.th}>PCD</th>
                  <th style={styles.th}>CB</th>
                  <th style={styles.th}>חישוק</th>
                  <th style={styles.th}>פעולות</th>
                </tr>
                <tr style={styles.filterRow}>
                  <th style={styles.thFilter}>
                    <select
                      style={styles.filterSelect}
                      value={columnFilters.make.type}
                      onChange={e => setColumnFilters({...columnFilters, make: {...columnFilters.make, type: e.target.value as any}})}
                    >
                      <option value="">הכל</option>
                      <option value="empty">ריק</option>
                      <option value="equals">שווה ל</option>
                    </select>
                    {columnFilters.make.type === 'equals' && (
                      <input
                        type="text"
                        style={styles.filterInput}
                        placeholder="ערך"
                        value={columnFilters.make.value}
                        onChange={e => setColumnFilters({...columnFilters, make: {...columnFilters.make, value: e.target.value}})}
                      />
                    )}
                  </th>
                  <th style={styles.thFilter}>
                    <select
                      style={styles.filterSelect}
                      value={columnFilters.model.type}
                      onChange={e => setColumnFilters({...columnFilters, model: {...columnFilters.model, type: e.target.value as any}})}
                    >
                      <option value="">הכל</option>
                      <option value="empty">ריק</option>
                      <option value="equals">שווה ל</option>
                    </select>
                    {columnFilters.model.type === 'equals' && (
                      <input
                        type="text"
                        style={styles.filterInput}
                        placeholder="ערך"
                        value={columnFilters.model.value}
                        onChange={e => setColumnFilters({...columnFilters, model: {...columnFilters.model, value: e.target.value}})}
                      />
                    )}
                  </th>
                  <th style={styles.thFilter}>
                    <select
                      style={styles.filterSelect}
                      value={columnFilters.year_from.type}
                      onChange={e => setColumnFilters({...columnFilters, year_from: {...columnFilters.year_from, type: e.target.value as any}})}
                    >
                      <option value="">הכל</option>
                      <option value="empty">ריק</option>
                      <option value="equals">שווה ל</option>
                      <option value="greater">גדול מ</option>
                      <option value="less">קטן מ</option>
                    </select>
                    {['equals', 'greater', 'less'].includes(columnFilters.year_from.type) && (
                      <input
                        type="number"
                        style={styles.filterInput}
                        placeholder="שנה"
                        value={columnFilters.year_from.value}
                        onChange={e => setColumnFilters({...columnFilters, year_from: {...columnFilters.year_from, value: e.target.value}})}
                      />
                    )}
                  </th>
                  <th style={styles.thFilter}>
                    <select
                      style={styles.filterSelect}
                      value={columnFilters.bolt_count.type}
                      onChange={e => setColumnFilters({...columnFilters, bolt_count: {...columnFilters.bolt_count, type: e.target.value as any}})}
                    >
                      <option value="">הכל</option>
                      <option value="equals">שווה ל</option>
                    </select>
                    {columnFilters.bolt_count.type === 'equals' && (
                      <input
                        type="number"
                        style={styles.filterInput}
                        placeholder="ברגים"
                        value={columnFilters.bolt_count.value}
                        onChange={e => setColumnFilters({...columnFilters, bolt_count: {...columnFilters.bolt_count, value: e.target.value}})}
                      />
                    )}
                  </th>
                  <th style={styles.thFilter}>
                    <select
                      style={styles.filterSelect}
                      value={columnFilters.center_bore.type}
                      onChange={e => setColumnFilters({...columnFilters, center_bore: {...columnFilters.center_bore, type: e.target.value as any}})}
                    >
                      <option value="">הכל</option>
                      <option value="empty">ריק</option>
                      <option value="equals">שווה ל</option>
                      <option value="greater">גדול מ</option>
                      <option value="less">קטן מ</option>
                    </select>
                    {['equals', 'greater', 'less'].includes(columnFilters.center_bore.type) && (
                      <input
                        type="number"
                        step="0.1"
                        style={styles.filterInput}
                        placeholder="CB"
                        value={columnFilters.center_bore.value}
                        onChange={e => setColumnFilters({...columnFilters, center_bore: {...columnFilters.center_bore, value: e.target.value}})}
                      />
                    )}
                  </th>
                  <th style={styles.thFilter}>
                    <select
                      style={styles.filterSelect}
                      value={columnFilters.rim_size.type}
                      onChange={e => setColumnFilters({...columnFilters, rim_size: {...columnFilters.rim_size, type: e.target.value as any}})}
                    >
                      <option value="">הכל</option>
                      <option value="empty">ריק</option>
                      <option value="equals">שווה ל</option>
                    </select>
                    {columnFilters.rim_size.type === 'equals' && (
                      <input
                        type="text"
                        style={styles.filterInput}
                        placeholder="גודל"
                        value={columnFilters.rim_size.value}
                        onChange={e => setColumnFilters({...columnFilters, rim_size: {...columnFilters.rim_size, value: e.target.value}})}
                      />
                    )}
                  </th>
                  <th style={styles.thFilter}></th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={styles.emptyRow}>
                      <div style={styles.emptyMessage}>
                        {hasActiveFilters() ? (
                          <>
                            <span>לא נמצאו תוצאות מתאימות לסינון</span>
                            <button style={styles.btnResetFilters} onClick={resetFilters}>
                              🔄 אפס מסננים
                            </button>
                          </>
                        ) : (
                          <span>אין דגמים במאגר</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredVehicles.map(v => (
                    <tr key={v.id} style={styles.tr}>
                      <td style={styles.td}>
                        <div>{v.make}</div>
                        {v.make_he && <div style={styles.hebrewName}>{v.make_he}</div>}
                      </td>
                      <td style={styles.td}>{v.model}</td>
                      <td style={styles.td}>
                        {v.year_from}{v.year_to ? `-${v.year_to}` : '+'}
                      </td>
                      <td style={styles.td}>
                        <span style={styles.pcdBadge}>{v.bolt_count}×{v.bolt_spacing}</span>
                      </td>
                      <td style={styles.td}>{v.center_bore || '-'}</td>
                      <td style={styles.td}>{v.rim_size || '-'}</td>
                      <td style={styles.td}>
                        <div style={{display: 'flex', gap: '6px'}}>
                          <button style={styles.btnEdit} onClick={() => openEditModal(v)}>✏️</button>
                          <button style={styles.btnDelete} onClick={() => handleDelete(v.id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Scrape Modal */}
      {showScrapeModal && (
        <div style={styles.modalOverlay} onClick={() => { setShowScrapeModal(false); setScrapeResult(null); setScrapeError(null); setPlateVehicleInfo(null); setPlateNumber('') }}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>🌐 גרידה מ-wheel-size.com</h3>
              <button style={styles.closeBtn} onClick={() => setShowScrapeModal(false)}>✕</button>
            </div>

            <div style={styles.modalBody}>
              {/* Mode Tabs */}
              <div style={styles.tabsContainer}>
                <button
                  style={{...styles.tab, ...(scrapeMode === 'plate' ? styles.tabActive : {})}}
                  onClick={() => { setScrapeMode('plate'); setScrapeResult(null); setScrapeError(null) }}
                >
                  🚗 לפי מספר רכב
                </button>
                <button
                  style={{...styles.tab, ...(scrapeMode === 'manual' ? styles.tabActive : {})}}
                  onClick={() => { setScrapeMode('manual'); setScrapeResult(null); setScrapeError(null) }}
                >
                  ✏️ הזנה ידנית
                </button>
              </div>

              {/* Plate Number Mode */}
              {scrapeMode === 'plate' && (
                <>
                  <p style={styles.modalDesc}>
                    הזן מספר רכב ישראלי כדי לשלוף את פרטי היצרן, דגם ושנה אוטומטית
                  </p>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>מספר רכב</label>
                    <div style={{display: 'flex', gap: '10px'}}>
                      <input
                        type="text"
                        value={plateNumber}
                        onChange={e => setPlateNumber(e.target.value.replace(/\D/g, ''))}
                        onKeyDown={e => e.key === 'Enter' && handlePlateLookup()}
                        placeholder="1234567"
                        maxLength={8}
                        style={{...styles.formInput, flex: 1}}
                      />
                      <button
                        style={styles.btnLookup}
                        onClick={handlePlateLookup}
                        disabled={plateLoading}
                      >
                        {plateLoading ? '🔄' : '🔍'}
                      </button>
                    </div>
                  </div>

                  {/* Vehicle Info from Plate */}
                  {plateVehicleInfo && (
                    <div style={styles.plateResult}>
                      <h4 style={styles.plateResultTitle}>📋 פרטי הרכב:</h4>
                      <div style={styles.plateResultGrid}>
                        <div><strong>יצרן:</strong> {plateVehicleInfo.manufacturer_he}</div>
                        <div><strong>דגם:</strong> {plateVehicleInfo.model}</div>
                        <div><strong>שנה:</strong> {plateVehicleInfo.year}</div>
                      </div>
                      <p style={{color: '#94a3b8', fontSize: '0.85rem', marginTop: '10px'}}>
                        הפרטים הועברו לטופס הגרידה. לחץ על &quot;חפש באתר&quot; להמשך.
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Manual Mode - Show form fields */}
              {(scrapeMode === 'manual' || plateVehicleInfo) && (
                <>
                  {scrapeMode === 'manual' && (
                    <p style={styles.modalDesc}>
                      הזן יצרן, דגם ושנה כדי לחפש אוטומטית את מידות ה-PCD מהאתר wheel-size.com
                    </p>
                  )}

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>יצרן (באנגלית)</label>
                <div style={{position: 'relative'}}>
                  <input
                    type="text"
                    value={scrapeForm.make}
                    onChange={e => {
                      setScrapeForm({...scrapeForm, make: e.target.value})
                      const filtered = commonMakes.filter(m =>
                        m.toLowerCase().includes(e.target.value.toLowerCase())
                      )
                      setMakeSuggestions(filtered)
                      setShowMakeSuggestions(e.target.value.length > 0)
                    }}
                    onFocus={() => {
                      if (scrapeForm.make.length > 0) {
                        const filtered = commonMakes.filter(m =>
                          m.toLowerCase().includes(scrapeForm.make.toLowerCase())
                        )
                        setMakeSuggestions(filtered)
                        setShowMakeSuggestions(true)
                      }
                    }}
                    onBlur={() => setTimeout(() => setShowMakeSuggestions(false), 200)}
                    placeholder="Toyota"
                    style={styles.formInput}
                  />
                  {showMakeSuggestions && makeSuggestions.length > 0 && (
                    <div style={styles.suggestionsList}>
                      {makeSuggestions.map((suggestion, i) => (
                        <div
                          key={i}
                          style={styles.suggestionItem}
                          onClick={() => {
                            setScrapeForm({...scrapeForm, make: suggestion})
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

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>דגם (באנגלית)</label>
                <div style={{position: 'relative'}}>
                  <input
                    type="text"
                    value={scrapeForm.model}
                    onChange={e => {
                      setScrapeForm({...scrapeForm, model: e.target.value})
                      fetchModelSuggestions(scrapeForm.make, e.target.value)
                      setShowModelSuggestions(e.target.value.length > 0)
                    }}
                    onFocus={() => {
                      if (scrapeForm.model.length > 0) {
                        fetchModelSuggestions(scrapeForm.make, scrapeForm.model)
                        setShowModelSuggestions(true)
                      }
                    }}
                    onBlur={() => setTimeout(() => setShowModelSuggestions(false), 200)}
                    placeholder="Corolla"
                    style={styles.formInput}
                  />
                  {showModelSuggestions && modelSuggestions.length > 0 && (
                    <div style={styles.suggestionsList}>
                      {modelSuggestions.map((suggestion, i) => (
                        <div
                          key={i}
                          style={styles.suggestionItem}
                          onClick={() => {
                            setScrapeForm({...scrapeForm, model: suggestion})
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

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>שנה</label>
                <input
                  type="text"
                  value={scrapeForm.year}
                  onChange={e => setScrapeForm({...scrapeForm, year: e.target.value})}
                  placeholder="2020"
                  style={styles.formInput}
                />
              </div>

              <button
                style={styles.btnScrape}
                onClick={handleScrape}
                disabled={scrapeLoading}
              >
                {scrapeLoading ? '🔄 מחפש...' : '🔍 חפש באתר'}
              </button>

              {/* Scrape Error */}
              {scrapeError && (
                <div style={styles.scrapeError}>
                  ❌ {scrapeError}
                  <a
                    href={`https://www.wheel-size.com/size/${scrapeForm.make.toLowerCase()}/${scrapeForm.model.toLowerCase()}/${scrapeForm.year}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.externalLink}
                  >
                    פתח באתר ידנית ↗
                  </a>
                </div>
              )}

              {/* Scrape Result */}
              {scrapeResult && (
                <div style={styles.scrapeResult}>
                  <h4 style={styles.resultTitle}>✅ נמצאו נתונים!</h4>
                  <div style={styles.resultGrid}>
                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>יצרן:</span>
                      <span>{scrapeResult.make}</span>
                    </div>
                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>דגם:</span>
                      <span>{scrapeResult.model}</span>
                    </div>
                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>שנה:</span>
                      <span>{scrapeResult.year}</span>
                    </div>
                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>PCD:</span>
                      <span style={styles.pcdBadge}>{scrapeResult.bolt_count}×{scrapeResult.bolt_spacing}</span>
                    </div>
                    {scrapeResult.center_bore && (
                      <div style={styles.resultItem}>
                        <span style={styles.resultLabel}>Center Bore:</span>
                        <span>{scrapeResult.center_bore}</span>
                      </div>
                    )}
                    {scrapeResult.rim_sizes?.length > 0 && (
                      <div style={styles.resultItem}>
                        <span style={styles.resultLabel}>חישוקים:</span>
                        <span>{scrapeResult.rim_sizes.join(', ')}"</span>
                      </div>
                    )}
                    {scrapeResult.tire_sizes?.length > 0 && (
                      <div style={styles.resultItem}>
                        <span style={styles.resultLabel}>צמיגים:</span>
                        <span>{scrapeResult.tire_sizes.slice(0, 3).join(', ')}</span>
                      </div>
                    )}
                  </div>
                  <a
                    href={scrapeResult.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.sourceLink}
                  >
                    🔗 מקור: wheel-size.com
                  </a>
                  <button
                    style={styles.btnAddResult}
                    onClick={handleAddScrapedResult}
                    disabled={addLoading}
                  >
                    {addLoading ? 'מוסיף...' : '➕ הוסף למאגר'}
                  </button>
                </div>
              )}
              </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Manual Modal */}
      {showAddModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>➕ הוספה ידנית</h3>
              <button style={styles.closeBtn} onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>יצרן (אנגלית) *</label>
                  <input
                    type="text"
                    value={addForm.make}
                    onChange={e => setAddForm({...addForm, make: e.target.value})}
                    placeholder="Toyota"
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>יצרן (עברית)</label>
                  <input
                    type="text"
                    value={addForm.make_he}
                    onChange={e => setAddForm({...addForm, make_he: e.target.value})}
                    placeholder="טויוטה"
                    style={styles.formInput}
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>דגם (אנגלית) *</label>
                  <input
                    type="text"
                    value={addForm.model}
                    onChange={e => setAddForm({...addForm, model: e.target.value})}
                    placeholder="Corolla"
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>דגם (עברית)</label>
                  <input
                    type="text"
                    value={addForm.model_he}
                    onChange={e => setAddForm({...addForm, model_he: e.target.value})}
                    placeholder="קורולה"
                    style={styles.formInput}
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>משנה</label>
                  <input
                    type="number"
                    value={addForm.year_from}
                    onChange={e => setAddForm({...addForm, year_from: e.target.value})}
                    placeholder="2015"
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>עד שנה</label>
                  <input
                    type="number"
                    value={addForm.year_to}
                    onChange={e => setAddForm({...addForm, year_to: e.target.value})}
                    placeholder="2020"
                    style={styles.formInput}
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>ברגים *</label>
                  <select
                    value={addForm.bolt_count}
                    onChange={e => setAddForm({...addForm, bolt_count: e.target.value})}
                    style={styles.formInput}
                  >
                    <option value="">בחר</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>PCD (מרווח) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={addForm.bolt_spacing}
                    onChange={e => setAddForm({...addForm, bolt_spacing: e.target.value})}
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
                    value={addForm.center_bore}
                    onChange={e => setAddForm({...addForm, center_bore: e.target.value})}
                    placeholder="60.1"
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>חישוק</label>
                  <input
                    type="text"
                    value={addForm.rim_size}
                    onChange={e => setAddForm({...addForm, rim_size: e.target.value})}
                    placeholder="15, 16, 17"
                    style={styles.formInput}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>צמיג</label>
                <input
                  type="text"
                  value={addForm.tire_size_front}
                  onChange={e => setAddForm({...addForm, tire_size_front: e.target.value})}
                  placeholder="195/65R15"
                  style={styles.formInput}
                />
              </div>

              <button
                style={styles.btnSubmit}
                onClick={handleAddManual}
                disabled={addLoading}
              >
                {addLoading ? 'מוסיף...' : '✅ הוסף למאגר'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingVehicle && (
        <div style={styles.modalOverlay} onClick={() => setEditingVehicle(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>✏️ עריכת דגם</h3>
              <button style={styles.closeBtn} onClick={() => setEditingVehicle(null)}>✕</button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>יצרן (אנגלית) *</label>
                  <input
                    type="text"
                    value={editForm.make}
                    onChange={e => setEditForm({...editForm, make: e.target.value})}
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>יצרן (עברית)</label>
                  <input
                    type="text"
                    value={editForm.make_he}
                    onChange={e => setEditForm({...editForm, make_he: e.target.value})}
                    style={styles.formInput}
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>דגם (אנגלית) *</label>
                  <input
                    type="text"
                    value={editForm.model}
                    onChange={e => setEditForm({...editForm, model: e.target.value})}
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>דגם (עברית)</label>
                  <input
                    type="text"
                    value={editForm.model_he}
                    onChange={e => setEditForm({...editForm, model_he: e.target.value})}
                    style={styles.formInput}
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>משנה</label>
                  <input
                    type="number"
                    value={editForm.year_from}
                    onChange={e => setEditForm({...editForm, year_from: e.target.value})}
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>עד שנה</label>
                  <input
                    type="number"
                    value={editForm.year_to}
                    onChange={e => setEditForm({...editForm, year_to: e.target.value})}
                    style={styles.formInput}
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>ברגים *</label>
                  <select
                    value={editForm.bolt_count}
                    onChange={e => setEditForm({...editForm, bolt_count: e.target.value})}
                    style={styles.formInput}
                  >
                    <option value="">בחר</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>PCD (מרווח) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editForm.bolt_spacing}
                    onChange={e => setEditForm({...editForm, bolt_spacing: e.target.value})}
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
                    value={editForm.center_bore}
                    onChange={e => setEditForm({...editForm, center_bore: e.target.value})}
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>חישוק</label>
                  <input
                    type="text"
                    value={editForm.rim_size}
                    onChange={e => setEditForm({...editForm, rim_size: e.target.value})}
                    style={styles.formInput}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>צמיג</label>
                <input
                  type="text"
                  value={editForm.tire_size_front}
                  onChange={e => setEditForm({...editForm, tire_size_front: e.target.value})}
                  style={styles.formInput}
                />
              </div>

              <button
                style={styles.btnSubmit}
                onClick={handleUpdateVehicle}
                disabled={editLoading}
              >
                {editLoading ? 'מעדכן...' : '✅ עדכן'}
              </button>
            </div>
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
  header: {
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    borderBottom: '1px solid #3b82f6',
    padding: '20px 30px',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  logoIcon: {
    width: '50px',
    height: '50px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
  },
  headerTitle: {
    color: 'white',
    fontSize: '1.5rem',
    fontWeight: 700,
    margin: 0,
  },
  headerSubtitle: {
    color: '#64748b',
    fontSize: '0.9rem',
    margin: 0,
  },
  btnBack: {
    color: '#94a3b8',
    textDecoration: 'none',
    padding: '10px 20px',
    border: '1px solid #334155',
    borderRadius: '10px',
    fontSize: '0.9rem',
  },
  statsRow: {
    maxWidth: '1200px',
    margin: '20px auto',
    padding: '0 20px',
  },
  statCard: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '15px 20px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
  },
  statIcon: {
    fontSize: '1.5rem',
  },
  statLabel: {
    color: '#64748b',
    fontSize: '0.8rem',
  },
  statValue: {
    color: '#3b82f6',
    fontSize: '1.5rem',
    fontWeight: 700,
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px 40px',
  },
  actionsRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.95rem',
  },
  btnSecondary: {
    background: '#334155',
    color: 'white',
    border: '1px solid #475569',
    padding: '12px 24px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.95rem',
  },
  searchContainer: {
    marginBottom: '20px',
  },
  searchInput: {
    width: '100%',
    maxWidth: '400px',
    padding: '12px 16px',
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '10px',
    color: 'white',
    fontSize: '0.95rem',
  },
  tableContainer: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '16px',
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
  },
  table: {
    width: '100%',
    minWidth: '800px',
    borderCollapse: 'collapse',
  },
  th: {
    background: '#0f172a',
    padding: '14px 16px',
    textAlign: 'right',
    color: '#94a3b8',
    fontSize: '0.85rem',
    fontWeight: 600,
    borderBottom: '1px solid #334155',
  },
  tr: {
    borderBottom: '1px solid #334155',
  },
  td: {
    padding: '12px 16px',
    fontSize: '0.9rem',
  },
  hebrewName: {
    color: '#64748b',
    fontSize: '0.8rem',
  },
  pcdBadge: {
    background: 'rgba(59, 130, 246, 0.2)',
    color: '#60a5fa',
    padding: '4px 10px',
    borderRadius: '6px',
    fontWeight: 600,
    fontSize: '0.85rem',
  },
  btnEdit: {
    background: 'rgba(59, 130, 246, 0.15)',
    color: '#3b82f6',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  btnDelete: {
    background: 'rgba(239, 68, 68, 0.15)',
    color: '#ef4444',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#64748b',
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    color: '#64748b',
  },
  // Modal
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalHeader: {
    padding: '20px',
    borderBottom: '1px solid #334155',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#3b82f6',
    fontSize: '1.2rem',
    fontWeight: 700,
    margin: 0,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    fontSize: '1.2rem',
    cursor: 'pointer',
  },
  modalBody: {
    padding: '20px',
  },
  modalDesc: {
    color: '#94a3b8',
    fontSize: '0.9rem',
    marginBottom: '20px',
    margin: '0 0 20px 0',
  },
  formGroup: {
    marginBottom: '16px',
    flex: 1,
  },
  formRow: {
    display: 'flex',
    gap: '12px',
  },
  formLabel: {
    display: 'block',
    color: '#94a3b8',
    fontSize: '0.85rem',
    marginBottom: '6px',
  },
  formInput: {
    width: '100%',
    padding: '10px 14px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: 'white',
    fontSize: '0.95rem',
    boxSizing: 'border-box',
  },
  btnScrape: {
    width: '100%',
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    color: 'white',
    border: 'none',
    padding: '14px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '1rem',
    marginTop: '10px',
  },
  scrapeError: {
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '10px',
    padding: '15px',
    marginTop: '20px',
    color: '#fca5a5',
    textAlign: 'center',
  },
  externalLink: {
    display: 'block',
    marginTop: '10px',
    color: '#60a5fa',
    textDecoration: 'none',
  },
  scrapeResult: {
    background: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    borderRadius: '12px',
    padding: '20px',
    marginTop: '20px',
  },
  resultTitle: {
    color: '#22c55e',
    fontSize: '1.1rem',
    marginBottom: '15px',
    margin: '0 0 15px 0',
  },
  resultGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  resultItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  resultLabel: {
    color: '#94a3b8',
    fontSize: '0.85rem',
  },
  sourceLink: {
    display: 'block',
    marginTop: '15px',
    color: '#60a5fa',
    textDecoration: 'none',
    fontSize: '0.85rem',
    textAlign: 'center',
  },
  btnAddResult: {
    width: '100%',
    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    color: 'white',
    border: 'none',
    padding: '14px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '1rem',
    marginTop: '15px',
  },
  btnSubmit: {
    width: '100%',
    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    color: 'white',
    border: 'none',
    padding: '14px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '1rem',
    marginTop: '10px',
  },
  // Login
  loginContainer: {
    minHeight: '100vh',
    background: '#0f172a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    direction: 'rtl',
  },
  loginBox: {
    maxWidth: '400px',
    width: '100%',
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '40px',
    textAlign: 'center',
  },
  loginLogoIcon: {
    width: '60px',
    height: '60px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.8rem',
    margin: '0 auto 20px',
  },
  loginTitle: {
    fontSize: '1.4rem',
    color: 'white',
    fontWeight: 700,
    marginBottom: '8px',
    margin: '0 0 8px 0',
  },
  loginSubtitle: {
    color: '#64748b',
    marginBottom: '20px',
    margin: '0 0 20px 0',
  },
  loginBtn: {
    width: '100%',
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    color: 'white',
    border: 'none',
    padding: '14px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 600,
    marginTop: '15px',
  },
  backLink: {
    display: 'block',
    color: '#64748b',
    textDecoration: 'none',
    marginTop: '20px',
    fontSize: '0.9rem',
  },
  errorText: {
    color: '#ef4444',
    fontSize: '0.9rem',
    marginTop: '8px',
  },
  suggestionsList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    marginTop: '4px',
    maxHeight: '200px',
    overflowY: 'auto',
    zIndex: 100,
  },
  suggestionItem: {
    padding: '10px 14px',
    cursor: 'pointer',
    borderBottom: '1px solid #334155',
    transition: 'background 0.2s',
  },
  filterRow: {
    background: '#0f172a',
  },
  thFilter: {
    padding: '8px',
    textAlign: 'right',
    borderBottom: '1px solid #334155',
  },
  filterSelect: {
    width: '100%',
    padding: '6px 8px',
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '6px',
    color: '#94a3b8',
    fontSize: '0.8rem',
    marginBottom: '4px',
  },
  filterInput: {
    width: '100%',
    padding: '6px 8px',
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '6px',
    color: 'white',
    fontSize: '0.8rem',
    boxSizing: 'border-box',
  },
  // Tabs for scrape modal
  tabsContainer: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    borderBottom: '1px solid #334155',
    paddingBottom: '12px',
  },
  tab: {
    flex: 1,
    padding: '10px 16px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 500,
    transition: 'all 0.2s',
  },
  tabActive: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    borderColor: '#3b82f6',
    color: 'white',
  },
  btnLookup: {
    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    minWidth: '50px',
  },
  plateResult: {
    background: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    borderRadius: '12px',
    padding: '16px',
    marginTop: '16px',
    marginBottom: '16px',
  },
  plateResultTitle: {
    color: '#60a5fa',
    fontSize: '1rem',
    margin: '0 0 12px 0',
    fontWeight: 600,
  },
  plateResultGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  // Empty state in table
  emptyRow: {
    padding: '40px 20px',
    textAlign: 'center',
  },
  emptyMessage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    color: '#64748b',
    fontSize: '1rem',
  },
  btnResetFilters: {
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9rem',
  },
}
