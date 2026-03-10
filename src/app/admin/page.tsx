'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { VERSION } from '@/lib/version'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { useAdminPendingReports } from '@/hooks/useAdminPendingReports'

interface Manager {
  id?: string
  full_name: string
  phone: string
  role: string
  is_primary: boolean
  password?: string
}

interface Station {
  id: string
  name: string
  address: string
  district?: string | null
  is_active: boolean
  max_managers?: number
  wheel_station_managers: Manager[]
  totalWheels: number
  availableWheels: number
}

interface District {
  id: string
  code: string
  name: string
  color: string
  created_at?: string
  updated_at?: string
}

interface SuperManager {
  id: string
  full_name: string
  phone: string
  is_active: boolean
  created_at?: string
  allowed_districts?: string[] | null
}


export default function WheelsAdminPage() {
  const { isAuthenticated, password, isLoading: authLoading, logout } = useAdminAuth()
  const pendingReports = useAdminPendingReports()

  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // Districts state
  const [districts, setDistricts] = useState<District[]>([])
  const [showAddDistrict, setShowAddDistrict] = useState(false)
  const [editingDistrict, setEditingDistrict] = useState<District | null>(null)
  const [districtForm, setDistrictForm] = useState({
    code: '',
    name: '',
    color: '#3b82f6'
  })

  // Search
  const [searchQuery, setSearchQuery] = useState('')

  // Expanded district for the new collapsible UI
  const [expandedDistrict, setExpandedDistrict] = useState<string | null>(null)
  // Expanded station within district
  const [expandedStation, setExpandedStation] = useState<string | null>(null)

  // Modals
  const [showAddStation, setShowAddStation] = useState(false)
  const [editingStation, setEditingStation] = useState<Station | null>(null)

  // Form
  const [stationForm, setStationForm] = useState({
    name: '',
    address: '',
    district: '' as string,
    max_managers: 4,
    managers: [] as Manager[]
  })

  // Confirm dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmDialogData, setConfirmDialogData] = useState<{
    title: string
    message: string
    onConfirm: () => void
  } | null>(null)

  // Vehicle scraping state
  const [showVehicleScrapeModal, setShowVehicleScrapeModal] = useState(false)
  const [scrapeForm, setScrapeForm] = useState({ make: '', model: '', year: '' })
  const [scrapeLoading, setScrapeLoading] = useState(false)
  const [scrapeResult, setScrapeResult] = useState<{
    make: string; model: string; year: number
    bolt_count: number; bolt_spacing: number; center_bore: number | null
    rim_sizes: string[]; tire_sizes: string[]; source_url: string
  } | null>(null)
  const [scrapeError, setScrapeError] = useState<string | null>(null)
  const [addVehicleLoading, setAddVehicleLoading] = useState(false)

  // Add Manager modal state
  const [showAddManager, setShowAddManager] = useState(false)
  const [addManagerForm, setAddManagerForm] = useState({
    station_id: '',
    full_name: '',
    phone: '',
    password: '',
    is_primary: false
  })
  const [addManagerLoading, setAddManagerLoading] = useState(false)

  // Super managers state
  const [superManagers, setSuperManagers] = useState<SuperManager[]>([])
  const [showSuperManagerSection, setShowSuperManagerSection] = useState(false)
  const [showAddSuperManager, setShowAddSuperManager] = useState(false)
  const [editingSuperManager, setEditingSuperManager] = useState<SuperManager | null>(null)
  const [superManagerForm, setSuperManagerForm] = useState({
    full_name: '',
    phone: '',
    password: '',
    allowed_districts: [] as string[],
  })
  const [superManagerLoading, setSuperManagerLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      fetchStations()
      fetchDistricts()
      fetchSuperManagers()
    }
  }, [isAuthenticated])

  // Close modals on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editingStation) setEditingStation(null)
        else if (showAddStation) setShowAddStation(false)
        else if (editingDistrict) setEditingDistrict(null)
        else if (showAddDistrict) setShowAddDistrict(false)
        else if (showAddSuperManager) setShowAddSuperManager(false)
        else if (editingSuperManager) setEditingSuperManager(null)
        else if (showConfirmDialog) setShowConfirmDialog(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [editingStation, showAddStation, editingDistrict, showAddDistrict, showAddSuperManager, editingSuperManager, showConfirmDialog])

  const fetchStations = async () => {
    try {
      const response = await fetch('/api/wheel-stations/admin')
      if (response.ok) {
        const data = await response.json()
        setStations(data.stations || [])
      }
    } catch (err) {
      console.error('Error fetching stations:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchDistricts = async () => {
    try {
      const response = await fetch('/api/districts')
      if (response.ok) {
        const data = await response.json()
        setDistricts(data.districts || [])
      }
    } catch (err) {
      console.error('Error fetching districts:', err)
    }
  }


  const fetchSuperManagers = async () => {
    try {
      const response = await fetch('/api/admin/super-managers')
      if (response.ok) {
        const data = await response.json()
        setSuperManagers(data.superManagers || [])
      }
    } catch (err) {
      console.error('Error fetching super managers:', err)
    }
  }

  const resetSuperManagerForm = () => {
    setSuperManagerForm({ full_name: '', phone: '', password: '', allowed_districts: [] })
  }

  const handleAddSuperManager = async () => {
    if (!superManagerForm.full_name || !superManagerForm.phone || !superManagerForm.password) {
      toast.error('נא למלא שם, טלפון וסיסמא')
      return
    }
    if (superManagerForm.password.length < 4) {
      toast.error('הסיסמא חייבת להכיל לפחות 4 תווים')
      return
    }
    setSuperManagerLoading(true)
    try {
      const response = await fetch('/api/admin/super-managers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...superManagerForm, admin_password: password })
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create super manager')
      }
      await fetchSuperManagers()
      setShowAddSuperManager(false)
      resetSuperManagerForm()
      toast.success('מנהל עליון נוצר בהצלחה!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'שגיאה ביצירת מנהל עליון')
    } finally {
      setSuperManagerLoading(false)
    }
  }

  const handleUpdateSuperManager = async () => {
    if (!editingSuperManager) return
    if (!superManagerForm.full_name || !superManagerForm.phone) {
      toast.error('נא למלא שם וטלפון')
      return
    }
    setSuperManagerLoading(true)
    try {
      const response = await fetch('/api/admin/super-managers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingSuperManager.id,
          ...superManagerForm,
          admin_password: password
        })
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update super manager')
      }
      await fetchSuperManagers()
      setEditingSuperManager(null)
      resetSuperManagerForm()
      toast.success('מנהל עליון עודכן בהצלחה!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'שגיאה בעדכון מנהל עליון')
    } finally {
      setSuperManagerLoading(false)
    }
  }

  const handleToggleSuperManagerActive = async (sm: SuperManager) => {
    setSuperManagerLoading(true)
    try {
      const response = await fetch('/api/admin/super-managers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: sm.id,
          is_active: !sm.is_active,
          admin_password: password
        })
      })
      if (!response.ok) throw new Error('Failed to update')
      await fetchSuperManagers()
      toast.success(sm.is_active ? `${sm.full_name} הושבת` : `${sm.full_name} הופעל`)
    } catch {
      toast.error('שגיאה בעדכון סטטוס')
    } finally {
      setSuperManagerLoading(false)
    }
  }

  const handleDeleteSuperManager = async (sm: SuperManager) => {
    setConfirmDialogData({
      title: 'מחיקת מנהל עליון',
      message: `האם למחוק את "${sm.full_name}"?`,
      onConfirm: async () => {
        setShowConfirmDialog(false)
        setConfirmDialogData(null)
        setSuperManagerLoading(true)
        try {
          const response = await fetch('/api/admin/super-managers', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: sm.id, admin_password: password })
          })
          const data = await response.json()
          if (!response.ok) {
            throw new Error(data.error || 'Failed to delete')
          }
          await fetchSuperManagers()
          toast.success('מנהל עליון נמחק!')
        } catch (err: unknown) {
          toast.error(err instanceof Error ? err.message : 'שגיאה במחיקת מנהל עליון')
        } finally {
          setSuperManagerLoading(false)
        }
      }
    })
    setShowConfirmDialog(true)
  }

  const openEditSuperManager = (sm: SuperManager) => {
    setSuperManagerForm({
      full_name: sm.full_name,
      phone: sm.phone,
      password: '',
      allowed_districts: sm.allowed_districts || [],
    })
    setEditingSuperManager(sm)
  }

  const resetForm = () => {
    setStationForm({
      name: '',
      address: '',
      district: '',
      max_managers: 4,
      managers: []
    })
  }

  const resetDistrictForm = () => {
    setDistrictForm({
      code: '',
      name: '',
      color: '#3b82f6'
    })
  }

  const handleAddDistrict = async () => {
    if (!districtForm.code || !districtForm.name || !districtForm.color) {
      toast.error('נא למלא את כל השדות')
      return
    }
    setActionLoading(true)
    try {
      const response = await fetch('/api/districts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(districtForm)
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create district')
      }
      await fetchDistricts()
      setShowAddDistrict(false)
      resetDistrictForm()
      toast.success('המחוז נוצר בהצלחה!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'שגיאה ביצירת מחוז')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdateDistrict = async () => {
    if (!editingDistrict) return
    setActionLoading(true)
    try {
      const response = await fetch(`/api/districts/${editingDistrict.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(districtForm)
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update district')
      }
      await fetchDistricts()
      setEditingDistrict(null)
      resetDistrictForm()
      toast.success('המחוז עודכן בהצלחה!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'שגיאה בעדכון מחוז')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteDistrict = async (district: District) => {
    setConfirmDialogData({
      title: 'מחיקת מחוז',
      message: `האם למחוק את מחוז "${district.name}"? פעולה זו תסיר את המחוז מכל התחנות שמשתמשות בו.`,
      onConfirm: async () => {
        setShowConfirmDialog(false)
        setConfirmDialogData(null)
        setActionLoading(true)
        try {
          const response = await fetch(`/api/districts/${district.id}`, {
            method: 'DELETE'
          })
          const data = await response.json()
          if (!response.ok) {
            throw new Error(data.error || 'Failed to delete district')
          }
          await fetchDistricts()
          toast.success('המחוז נמחק!')
        } catch (err: unknown) {
          toast.error(err instanceof Error ? err.message : 'שגיאה במחיקת מחוז')
        } finally {
          setActionLoading(false)
        }
      }
    })
    setShowConfirmDialog(true)
  }

  const openEditDistrictModal = (district: District) => {
    setDistrictForm({
      code: district.code,
      name: district.name,
      color: district.color
    })
    setEditingDistrict(district)
  }

  const handleAddStation = async () => {
    if (!stationForm.name) {
      toast.error('נא להזין שם תחנה')
      return
    }
    setActionLoading(true)
    try {
      const response = await fetch('/api/wheel-stations/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...stationForm,
          admin_password: password
        })
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create station')
      }
      await fetchStations()
      setShowAddStation(false)
      resetForm()
      toast.success('התחנה נוצרה בהצלחה!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'שגיאה ביצירת תחנה')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdateStation = async () => {
    if (!editingStation) return
    if (stationForm.max_managers < stationForm.managers.length) {
      toast(`שים לב: יש ${stationForm.managers.length} מנהלים פעילים אבל המגבלה הוגדרה ל-${stationForm.max_managers}`, { icon: '⚠️' })
    }
    setActionLoading(true)
    try {
      const response = await fetch(`/api/wheel-stations/admin/${editingStation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...stationForm,
          admin_password: password
        })
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update station')
      }
      await fetchStations()
      setEditingStation(null)
      resetForm()
      toast.success('התחנה עודכנה בהצלחה!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'שגיאה בעדכון תחנה')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteStation = async (station: Station) => {
    setConfirmDialogData({
      title: 'מחיקת תחנה',
      message: `האם למחוק את תחנת "${station.name}"? פעולה זו תמחק גם את כל הגלגלים והיסטוריית ההשאלות!`,
      onConfirm: async () => {
        setShowConfirmDialog(false)
        setConfirmDialogData(null)
        setActionLoading(true)
        try {
          const response = await fetch(`/api/wheel-stations/admin/${station.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ admin_password: password })
          })
          if (!response.ok) {
            const data = await response.json()
            throw new Error(data.error || 'Failed to delete station')
          }
          await fetchStations()
          toast.success('התחנה נמחקה!')
        } catch (err: unknown) {
          toast.error(err instanceof Error ? err.message : 'שגיאה במחיקת תחנה')
        } finally {
          setActionLoading(false)
        }
      }
    })
    setShowConfirmDialog(true)
  }

  const handleToggleActive = async (station: Station) => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/wheel-stations/admin/${station.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_active: !station.is_active,
          admin_password: password
        })
      })
      if (!response.ok) throw new Error('Failed to update')
      await fetchStations()
      toast.success(station.is_active ? `תחנת ${station.name} הושבתה` : `תחנת ${station.name} הופעלה`)
    } catch {
      toast.error('שגיאה בעדכון סטטוס')
    } finally {
      setActionLoading(false)
    }
  }

  const openEditModal = (station: Station) => {
    setStationForm({
      name: station.name,
      address: station.address || '',
      district: station.district || '',
      max_managers: station.max_managers ?? 4,
      managers: station.wheel_station_managers || []
    })
    setEditingStation(station)
  }

  const openAddStationModal = () => {
    resetForm()
    setShowAddStation(true)
  }

  // Add Manager to existing station
  const handleAddManagerToStation = async () => {
    if (!addManagerForm.station_id) {
      toast.error('נא לבחור תחנה')
      return
    }
    if (!addManagerForm.full_name || !addManagerForm.phone) {
      toast.error('נא למלא שם וטלפון')
      return
    }
    setAddManagerLoading(true)
    try {
      const response = await fetch('/api/wheel-stations/admin/managers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...addManagerForm,
          admin_password: password
        })
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add manager')
      }
      await fetchStations()
      setShowAddManager(false)
      setAddManagerForm({ station_id: '', full_name: '', phone: '', password: '', is_primary: false })
      toast.success(data.message || 'המנהל נוסף בהצלחה!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'שגיאה בהוספת מנהל')
    } finally {
      setAddManagerLoading(false)
    }
  }

  const addManager = () => {
    const maxMgr = stationForm.max_managers || 99
    if (stationForm.managers.length >= maxMgr) {
      toast.error(`ניתן להוסיף עד ${maxMgr} מנהלים`)
      return
    }
    setStationForm({
      ...stationForm,
      managers: [...stationForm.managers, { full_name: '', phone: '', role: 'מנהל תחנה', is_primary: false, password: '' }]
    })
  }

  const removeManager = (index: number) => {
    setStationForm({
      ...stationForm,
      managers: stationForm.managers.filter((_, i) => i !== index)
    })
  }

  const updateManager = (index: number, field: string, value: string | boolean) => {
    const updated = [...stationForm.managers]
    updated[index] = { ...updated[index], [field]: value }
    setStationForm({ ...stationForm, managers: updated })
  }

  // Calculate stats
  const totalWheels = stations.reduce((sum, s) => sum + s.totalWheels, 0)
  const availableWheels = stations.reduce((sum, s) => sum + s.availableWheels, 0)
  const totalManagers = stations.reduce((sum, s) => sum + (s.wheel_station_managers?.length || 0), 0)

  // Normalize text for fuzzy search (remove extra spaces, handle Hebrew variations)
  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ') // Multiple spaces to single space
      .replace(/[״"]/g, '"') // Normalize quotes
      .replace(/בת/g, 'בית') // בת -> בית
      .replace(/ב'/g, 'בית ') // ב' -> בית
  }

  // Filter stations by search
  const filterStations = (stationsList: Station[]) => {
    if (!searchQuery) return stationsList
    const query = normalizeText(searchQuery)
    return stationsList.filter(station => {
      const normalizedName = normalizeText(station.name)
      const normalizedAddress = normalizeText(station.address || '')
      const matchesName = normalizedName.includes(query)
      const matchesAddress = normalizedAddress.includes(query)
      const matchesManager = station.wheel_station_managers?.some(m =>
        normalizeText(m.full_name).includes(query)
      )
      return matchesName || matchesAddress || matchesManager
    })
  }

  // Auto-expand district and station when searching
  useEffect(() => {
    if (searchQuery && stations.length > 0) {
      const filtered = filterStations(stations)
      if (filtered.length > 0) {
        const firstMatch = filtered[0]
        // Expand the district containing the first match
        if (firstMatch.district) {
          setExpandedDistrict(firstMatch.district)
        }
        // Expand the station itself
        setExpandedStation(firstMatch.id)
      }
    } else if (!searchQuery) {
      // Clear expanded state when search is cleared
      setExpandedStation(null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, stations])

  // Get stations for a district
  const getDistrictStations = (districtCode: string) => {
    return filterStations(stations.filter(s => s.district === districtCode))
  }

  // Get stations without district
  const stationsWithoutDistrict = filterStations(stations.filter(s => !s.district))

  // Get district color or default
  const getDistrictColor = (index: number) => {
    const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6']
    return colors[index % colors.length]
  }

  // Show loading while checking auth
  if (authLoading || !isAuthenticated) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}>🛞</div>
        <p>טוען...</p>
      </div>
    )
  }

  return (
    <div style={styles.pageWrapper}>
      <style>{`
        @media (max-width: 768px) {
          .header-content-responsive {
            flex-direction: column !important;
            gap: 15px !important;
            align-items: center !important;
          }
          .header-logo-responsive {
            justify-content: center !important;
          }
          .header-buttons-responsive {
            display: flex !important;
            flex-direction: row !important;
            flex-wrap: nowrap !important;
            justify-content: center !important;
            gap: 6px !important;
          }
          .header-buttons-responsive a,
          .header-buttons-responsive button {
            padding: 8px 10px !important;
            font-size: 0.75rem !important;
            white-space: nowrap !important;
          }
          .stats-row-responsive {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
            margin-top: -40px !important;
          }
          .stat-value-responsive {
            font-size: 1.5rem !important;
          }
          .section-header-responsive {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
          }
          .section-header-responsive .section-buttons {
            width: 100% !important;
            justify-content: center !important;
          }
          .districts-grid-responsive {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 480px) {
          .stats-row-responsive {
            grid-template-columns: 1fr 1fr !important;
            gap: 10px !important;
          }
          .stat-card-responsive {
            padding: 12px !important;
          }
          .stat-icon-responsive {
            width: 32px !important;
            height: 32px !important;
            font-size: 1rem !important;
          }
          .station-actions-responsive {
            flex-wrap: wrap !important;
          }
          .station-actions-responsive button,
          .station-actions-responsive a {
            flex: 1 1 calc(50% - 3px) !important;
            text-align: center !important;
          }
        }
        @media (max-width: 360px) {
          .stats-row-responsive {
            grid-template-columns: 1fr !important;
          }
          .manager-row-responsive {
            flex-wrap: wrap !important;
          }
          .manager-row-responsive input {
            width: 100% !important;
            flex: 1 1 100% !important;
          }
        }
        @media (max-width: 480px) {
          .manager-row-responsive {
            flex-wrap: wrap !important;
          }
          .manager-row-responsive input {
            flex: 1 1 calc(50% - 20px) !important;
            min-width: 80px !important;
          }
        }
      `}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent} className="header-content-responsive">
          <div style={styles.headerLogo} className="header-logo-responsive">
            <div style={styles.logoIcon}>🛞</div>
            <div>
              <h1 style={styles.headerTitle}>ניהול תחנות גלגלים</h1>
              <p style={styles.headerSubtitle}>מערכת ניהול תחנות והשאלות</p>
            </div>
          </div>
          <div style={styles.headerButtons} className="header-buttons-responsive">
            <Link href="/admin/vehicles" style={styles.btnGhost}>🚗 מאגר רכבים</Link>
            <Link href="/admin/reports" style={{...styles.btnGhost, position: 'relative'}}>
              📋 דיווחי שגיאות
              {pendingReports > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '6px',
                  left: '6px',
                  width: '8px',
                  height: '8px',
                  background: '#ef4444',
                  borderRadius: '50%',
                  boxShadow: '0 0 6px #ef4444',
                  display: 'inline-block',
                }} />
              )}
            </Link>
            <Link href="/admin/call-centers" style={styles.btnGhost}>🎧 מוקדים</Link>
            <button style={styles.btnLogout} onClick={logout}>יציאה</button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={styles.statsRow} className="stats-row-responsive">
        <div style={styles.statCard} className="stat-card-responsive">
          <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'}} className="stat-icon-responsive">🏢</div>
          <div>
            <div style={styles.statLabel}>תחנות</div>
            <div style={styles.statValue} className="stat-value-responsive">{stations.length}</div>
          </div>
        </div>
        <div style={styles.statCard} className="stat-card-responsive">
          <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'}} className="stat-icon-responsive">🛞</div>
          <div>
            <div style={styles.statLabel}>גלגלים</div>
            <div style={{...styles.statValue, color: '#3b82f6'}} className="stat-value-responsive">{totalWheels}</div>
          </div>
        </div>
        <div style={styles.statCard} className="stat-card-responsive">
          <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}} className="stat-icon-responsive">✅</div>
          <div>
            <div style={styles.statLabel}>זמינים</div>
            <div style={{...styles.statValue, color: '#f59e0b'}} className="stat-value-responsive">{availableWheels}</div>
          </div>
        </div>
        <div style={styles.statCard} className="stat-card-responsive">
          <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'}} className="stat-icon-responsive">👥</div>
          <div>
            <div style={styles.statLabel}>מנהלים</div>
            <div style={{...styles.statValue, color: '#8b5cf6'}} className="stat-value-responsive">{totalManagers}</div>
          </div>
        </div>
      </div>

      <div style={styles.container}>
        {/* Districts & Stations Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader} className="section-header-responsive">
            <div style={styles.sectionTitle}>
              <div style={styles.sectionTitleIcon}>🗺️</div>
              מחוזות ותחנות
              <span style={styles.sectionCount}>{districts.length} מחוזות • {stations.length} תחנות</span>
            </div>
            <div style={styles.sectionButtons} className="section-buttons">
              <button style={styles.btnGhost} onClick={() => { resetDistrictForm(); setShowAddDistrict(true) }}>+ מחוז</button>
              <button style={styles.btnGhost} onClick={() => setShowAddManager(true)}>+ מנהל</button>
              <button style={styles.btnPrimary} onClick={() => openAddStationModal()}>+ תחנה</button>
            </div>
          </div>

          {/* Search Bar */}
          <div style={styles.searchContainer}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 חפש לפי שם תחנה, כתובת או שם מנהל..."
              style={styles.searchInput}
            />
            {searchQuery && (
              <p style={styles.searchResults}>
                נמצאו {filterStations(stations).length} תחנות
              </p>
            )}
          </div>

          <div style={styles.sectionContent}>
            {loading ? (
              <div style={styles.loading}>טוען...</div>
            ) : (
              <div style={styles.districtsGrid} className="districts-grid-responsive">
                {/* District Cards */}
                {districts.map((district, index) => {
                  const districtStations = getDistrictStations(district.code)
                  const districtWheels = districtStations.reduce((sum, s) => sum + s.totalWheels, 0)
                  const isExpanded = expandedDistrict === district.code
                  const districtColor = district.color || getDistrictColor(index)

                  return (
                    <div
                      key={district.id}
                      style={{
                        ...styles.districtCard,
                        borderColor: isExpanded ? '#22c55e' : '#334155',
                        boxShadow: isExpanded ? '0 10px 30px rgba(34, 197, 94, 0.15)' : 'none'
                      }}
                    >
                      <div
                        style={styles.districtHeader}
                        onClick={() => setExpandedDistrict(isExpanded ? null : district.code)}
                      >
                        <div style={{...styles.districtColorOrb, background: `linear-gradient(135deg, ${districtColor} 0%, ${districtColor}dd 100%)`}}>
                          <span style={{color: 'white', fontSize: '1.3rem'}}>📍</span>
                        </div>
                        <div style={styles.districtInfo}>
                          <div style={styles.districtName}>{district.name}</div>
                          <div style={styles.districtMeta}>
                            <span>🏢 {districtStations.length} תחנות</span>
                            <span>🛞 {districtWheels} גלגלים</span>
                          </div>
                        </div>
                        <span style={{...styles.expandIcon, transform: isExpanded ? 'rotate(180deg)' : 'none'}}>▼</span>
                      </div>

                      {/* Expanded Stations */}
                      <div style={{
                        ...styles.districtStations,
                        maxHeight: isExpanded ? '2000px' : '0',
                        opacity: isExpanded ? 1 : 0
                      }}>
                        <div style={styles.districtStationsInner}>
                          <div style={styles.districtStationsHeader}>
                            <div style={{display: 'flex', gap: '6px', alignItems: 'center'}}>
                              <button style={styles.btnIconSmall} onClick={(e) => { e.stopPropagation(); openEditDistrictModal(district) }}>✏️</button>
                              <button style={styles.btnIconSmall} onClick={(e) => { e.stopPropagation(); handleDeleteDistrict(district) }} disabled={actionLoading}>🗑️</button>
                            </div>
                          </div>

                          {districtStations.length === 0 ? (
                            <div style={styles.emptyDistrict}>
                              <div style={styles.emptyDistrictIcon}>🏢</div>
                              <div style={styles.emptyDistrictText}>אין תחנות במחוז זה</div>
                            </div>
                          ) : (
                            districtStations.map(station => (
                              <StationCard
                                key={station.id}
                                station={station}
                                districtColor={districtColor}
                                isExpanded={expandedStation === station.id}
                                onToggleExpand={() => setExpandedStation(expandedStation === station.id ? null : station.id)}
                                onEdit={() => openEditModal(station)}
                                onToggleActive={() => handleToggleActive(station)}
                                onDelete={() => handleDeleteStation(station)}
                                actionLoading={actionLoading}
                              />
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Stations without district */}
                {stationsWithoutDistrict.length > 0 && (
                  <div style={styles.noDistrictSection}>
                    <div style={styles.noDistrictTitle}>
                      ⚠️ תחנות ללא מחוז ({stationsWithoutDistrict.length})
                    </div>
                    {stationsWithoutDistrict.map(station => (
                      <StationCard
                        key={station.id}
                        station={station}
                        districtColor="#6b7280"
                        isExpanded={expandedStation === station.id}
                        onToggleExpand={() => setExpandedStation(expandedStation === station.id ? null : station.id)}
                        onEdit={() => openEditModal(station)}
                        onToggleActive={() => handleToggleActive(station)}
                        onDelete={() => handleDeleteStation(station)}
                        actionLoading={actionLoading}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Station Modal */}
      {(showAddStation || editingStation) && (
        <div style={styles.modalOverlay} onClick={() => { setShowAddStation(false); setEditingStation(null) }}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {editingStation ? '✏️ עריכת תחנה' : '➕ תחנה חדשה'}
              </h3>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>שם התחנה *</label>
                <input
                  type="text"
                  value={stationForm.name}
                  onChange={e => setStationForm({...stationForm, name: e.target.value})}
                  style={styles.formInput}
                  placeholder="לדוגמה: תחנת בית שמש"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>כתובת</label>
                <input
                  type="text"
                  value={stationForm.address}
                  onChange={e => setStationForm({...stationForm, address: e.target.value})}
                  style={styles.formInput}
                  placeholder="רחוב ומספר"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>מחוז</label>
                <select
                  value={stationForm.district}
                  onChange={e => setStationForm({...stationForm, district: e.target.value})}
                  style={styles.formInput}
                >
                  <option value="">ללא מחוז</option>
                  {districts.map((district) => (
                    <option key={district.code} value={district.code}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>מקסימום מנהלים לתחנה</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={stationForm.max_managers || ''}
                  onChange={e => setStationForm(f => ({...f, max_managers: parseInt(e.target.value) || 0}))}
                  onBlur={() => setStationForm(f => ({...f, max_managers: Math.max(1, f.max_managers || 1)}))}
                  style={{...styles.formInput, width: '100px'}}
                />
              </div>

              <div style={styles.managersSection}>
                <div style={styles.managersSectionHeader}>
                  <label style={styles.formLabel}>מנהלי תחנה ({stationForm.managers.length}/{stationForm.max_managers})</label>
                  <button style={styles.btnAddManager} onClick={addManager} disabled={stationForm.managers.length >= stationForm.max_managers}>
                    + הוסף מנהל
                  </button>
                </div>

                {stationForm.managers.map((manager, index) => (
                  <div key={index} style={styles.managerCard}>
                    <div style={styles.managerRow} className="manager-row-responsive">
                      <button
                        type="button"
                        style={{
                          ...styles.btnCrownSm,
                          background: manager.is_primary ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' : '#1e293b',
                          borderColor: manager.is_primary ? '#f59e0b' : '#334155',
                          color: manager.is_primary ? 'white' : '#64748b',
                        }}
                        onClick={() => updateManager(index, 'is_primary', !manager.is_primary)}
                        title={manager.is_primary ? 'יש הרשאות - לחץ להסרה' : 'אין הרשאות - לחץ להוספה'}
                      >
                        {manager.is_primary ? '🔓' : '🔒'}
                      </button>
                      <input
                        type="text"
                        placeholder="שם מלא"
                        value={manager.full_name}
                        onChange={e => updateManager(index, 'full_name', e.target.value)}
                        style={styles.managerInputCompact}
                      />
                      <input
                        type="tel"
                        placeholder="טלפון"
                        value={manager.phone}
                        onChange={e => updateManager(index, 'phone', e.target.value)}
                        style={styles.managerInputCompact}
                      />
                      <button style={styles.btnDeleteSm} onClick={() => removeManager(index)} title="הסר מנהל">🗑️</button>
                    </div>
                    <div style={styles.managerPasswordRow}>
                      <input
                        type="text"
                        placeholder="סיסמא אישית (לפחות 4 תווים)"
                        value={manager.password || ''}
                        onChange={e => updateManager(index, 'password', e.target.value)}
                        style={styles.managerPasswordInput}
                      />
                      {manager.id && (
                        <button
                          type="button"
                          style={styles.btnResetPassword}
                          onClick={() => updateManager(index, 'password', '')}
                          title="איפוס סיסמא"
                        >
                          🔄 איפוס
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.btnCancel} onClick={() => { setShowAddStation(false); setEditingStation(null) }}>
                ביטול
              </button>
              <button
                style={styles.btnSubmit}
                onClick={editingStation ? handleUpdateStation : handleAddStation}
                disabled={actionLoading}
              >
                {actionLoading ? 'שומר...' : (editingStation ? 'עדכן' : 'צור תחנה')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit District Modal */}
      {(showAddDistrict || editingDistrict) && (
        <div style={styles.modalOverlay} onClick={() => { setShowAddDistrict(false); setEditingDistrict(null) }}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {editingDistrict ? '✏️ עריכת מחוז' : '➕ מחוז חדש'}
              </h3>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>קוד מחוז (באנגלית) *</label>
                <input
                  type="text"
                  value={districtForm.code}
                  onChange={e => setDistrictForm({...districtForm, code: e.target.value})}
                  style={styles.formInput}
                  placeholder="לדוגמה: jerusalem"
                  disabled={!!editingDistrict}
                />
                {editingDistrict && (
                  <p style={{fontSize: '0.75rem', color: '#64748b', marginTop: '4px'}}>
                    לא ניתן לשנות את קוד המחוז לאחר יצירתו
                  </p>
                )}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>שם המחוז (בעברית) *</label>
                <input
                  type="text"
                  value={districtForm.name}
                  onChange={e => setDistrictForm({...districtForm, name: e.target.value})}
                  style={styles.formInput}
                  placeholder="לדוגמה: ירושלים"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>צבע המחוז *</label>
                <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                  <input
                    type="color"
                    value={districtForm.color}
                    onChange={e => setDistrictForm({...districtForm, color: e.target.value})}
                    style={{width: '60px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer'}}
                  />
                  <input
                    type="text"
                    value={districtForm.color}
                    onChange={e => setDistrictForm({...districtForm, color: e.target.value})}
                    style={{...styles.formInput, flex: 1}}
                    placeholder="#3b82f6"
                  />
                </div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.btnCancel} onClick={() => { setShowAddDistrict(false); setEditingDistrict(null) }}>
                ביטול
              </button>
              <button
                style={styles.btnSubmit}
                onClick={editingDistrict ? handleUpdateDistrict : handleAddDistrict}
                disabled={actionLoading}
              >
                {actionLoading ? 'שומר...' : (editingDistrict ? 'עדכן' : 'צור מחוז')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog Modal */}
      {showConfirmDialog && confirmDialogData && (
        <div style={styles.modalOverlay} onClick={() => { setShowConfirmDialog(false); setConfirmDialogData(null) }}>
          <div style={styles.confirmDialog} onClick={e => e.stopPropagation()}>
            <h3 style={styles.confirmTitle}>🗑️ {confirmDialogData.title}</h3>
            <p style={styles.confirmMessage}>{confirmDialogData.message}</p>
            <div style={styles.confirmButtons}>
              <button style={styles.btnCancel} onClick={() => { setShowConfirmDialog(false); setConfirmDialogData(null) }}>
                ביטול
              </button>
              <button style={styles.confirmDeleteBtn} onClick={confirmDialogData.onConfirm}>
                מחק
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Manager Modal */}
      {showAddManager && (
        <div style={styles.modalOverlay} onClick={() => setShowAddManager(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>👤 הוספת מנהל</h3>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>תחנה *</label>
                <select
                  value={addManagerForm.station_id}
                  onChange={e => setAddManagerForm({...addManagerForm, station_id: e.target.value})}
                  style={styles.formInput}
                >
                  <option value="">בחר תחנה...</option>
                  {stations.map(station => (
                    <option key={station.id} value={station.id}>
                      {station.name} ({station.wheel_station_managers?.length || 0}/{station.max_managers ?? 4} מנהלים)
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>שם מלא *</label>
                <input
                  type="text"
                  value={addManagerForm.full_name}
                  onChange={e => setAddManagerForm({...addManagerForm, full_name: e.target.value})}
                  style={styles.formInput}
                  placeholder="ישראל ישראלי"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>טלפון *</label>
                <input
                  type="tel"
                  value={addManagerForm.phone}
                  onChange={e => setAddManagerForm({...addManagerForm, phone: e.target.value})}
                  style={styles.formInput}
                  placeholder="050-1234567"
                  dir="ltr"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>סיסמא (אופציונלי)</label>
                <input
                  type="text"
                  value={addManagerForm.password}
                  onChange={e => setAddManagerForm({...addManagerForm, password: e.target.value})}
                  style={styles.formInput}
                  placeholder="סיסמא אישית למנהל"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={{...styles.formLabel, display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer'}}>
                  <input
                    type="checkbox"
                    checked={addManagerForm.is_primary}
                    onChange={e => setAddManagerForm({...addManagerForm, is_primary: e.target.checked})}
                    style={{width: '18px', height: '18px'}}
                  />
                  מנהל ראשי (יכול לערוך מנהלים אחרים)
                </label>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.btnCancel} onClick={() => setShowAddManager(false)}>
                ביטול
              </button>
              <button
                style={styles.btnSubmit}
                onClick={handleAddManagerToStation}
                disabled={addManagerLoading}
              >
                {addManagerLoading ? 'מוסיף...' : 'הוסף מנהל'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Super Managers Section */}
      <div style={styles.container}>
        <div style={styles.section}>
          <div style={styles.sectionHeader} className="section-header-responsive">
            <div
              style={{...styles.sectionTitle, cursor: 'pointer'}}
              onClick={() => setShowSuperManagerSection(!showSuperManagerSection)}
            >
              <div style={{...styles.sectionTitleIcon, background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'}}>👑</div>
              מנהלים עליונים
              <span style={{...styles.sectionCount, background: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6'}}>
                {superManagers.length} מנהלים
              </span>
              <span style={{...styles.expandIcon, transform: showSuperManagerSection ? 'rotate(180deg)' : 'none'}}>▼</span>
            </div>
            {showSuperManagerSection && (
              <div style={styles.sectionButtons} className="section-buttons">
                <button style={{...styles.btnPrimary, background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'}} onClick={() => { resetSuperManagerForm(); setShowAddSuperManager(true) }}>+ מנהל עליון</button>
              </div>
            )}
          </div>

          {showSuperManagerSection && (
            <div style={styles.sectionContent}>
              {superManagers.length === 0 ? (
                <div style={styles.loading}>אין מנהלים עליונים</div>
              ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                  {superManagers.map(sm => (
                    <div key={sm.id} style={{
                      background: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      flexWrap: 'wrap',
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: sm.is_active ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' : '#334155',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.1rem',
                        flexShrink: 0,
                      }}>👑</div>
                      <div style={{flex: 1, minWidth: '150px'}}>
                        <div style={{fontWeight: 600, color: 'white', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px'}}>
                          {sm.full_name}
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: sm.is_active ? '#22c55e' : '#f59e0b',
                            boxShadow: sm.is_active ? '0 0 8px rgba(34, 197, 94, 0.5)' : 'none',
                          }} />
                        </div>
                        <div style={{color: '#64748b', fontSize: '0.8rem', direction: 'ltr', textAlign: 'right'}}>{sm.phone}</div>
                        {sm.allowed_districts?.length ? (
                          <div style={{fontSize: '0.75rem', color: '#8b5cf6', marginTop: '2px'}}>
                            מחוזות: {sm.allowed_districts.map(code => districts.find(d => d.code === code)?.name || code).join(', ')}
                          </div>
                        ) : (
                          <div style={{fontSize: '0.75rem', color: '#9ca3af', marginTop: '2px'}}>כל המחוזות</div>
                        )}
                      </div>
                      <div style={{display: 'flex', gap: '6px', flexWrap: 'wrap'}}>
                        <button style={{...styles.btnCompact, ...styles.btnCompactEdit}} onClick={() => openEditSuperManager(sm)}>✏️ ערוך</button>
                        <button
                          style={{
                            ...styles.btnCompact,
                            ...(sm.is_active ? styles.btnCompactToggle : styles.btnCompactToggleActivate)
                          }}
                          onClick={() => handleToggleSuperManagerActive(sm)}
                          disabled={superManagerLoading}
                        >
                          {sm.is_active ? '🔴 השבת' : '🟢 הפעל'}
                        </button>
                        <button style={{...styles.btnCompact, ...styles.btnCompactDelete}} onClick={() => handleDeleteSuperManager(sm)} disabled={superManagerLoading}>🗑️ מחק</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Super Manager Modal */}
      {(showAddSuperManager || editingSuperManager) && (
        <div style={styles.modalOverlay} onClick={() => { setShowAddSuperManager(false); setEditingSuperManager(null) }}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{...styles.modalTitle, color: '#8b5cf6'}}>
                {editingSuperManager ? '✏️ עריכת מנהל עליון' : '👑 מנהל עליון חדש'}
              </h3>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>שם מלא *</label>
                <input
                  type="text"
                  value={superManagerForm.full_name}
                  onChange={e => setSuperManagerForm({...superManagerForm, full_name: e.target.value})}
                  style={styles.formInput}
                  placeholder="ישראל ישראלי"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>טלפון *</label>
                <input
                  type="tel"
                  value={superManagerForm.phone}
                  onChange={e => setSuperManagerForm({...superManagerForm, phone: e.target.value})}
                  style={styles.formInput}
                  placeholder="050-1234567"
                  dir="ltr"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  {editingSuperManager ? 'סיסמא חדשה (השאר ריק לשמירת הקיימת)' : 'סיסמא *'}
                </label>
                <input
                  type="text"
                  value={superManagerForm.password}
                  onChange={e => setSuperManagerForm({...superManagerForm, password: e.target.value})}
                  style={styles.formInput}
                  placeholder="לפחות 4 תווים"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>הרשאות מחוזות (ריק = גישה לכל המחוזות)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                  {districts.map(d => {
                    const isSelected = superManagerForm.allowed_districts.includes(d.code)
                    return (
                      <button
                        key={d.code}
                        type="button"
                        onClick={() => {
                          const newDistricts = isSelected
                            ? superManagerForm.allowed_districts.filter(c => c !== d.code)
                            : [...superManagerForm.allowed_districts, d.code]
                          setSuperManagerForm({...superManagerForm, allowed_districts: newDistricts})
                        }}
                        style={{
                          padding: '6px 14px', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer',
                          border: isSelected ? '2px solid #7c3aed' : '1px solid #d1d5db',
                          background: isSelected ? '#ede9fe' : 'white',
                          color: isSelected ? '#7c3aed' : '#374151',
                          fontWeight: isSelected ? 600 : 400
                        }}
                      >
                        {isSelected ? '✓ ' : ''}{d.name}
                      </button>
                    )
                  })}
                </div>
                {superManagerForm.allowed_districts.length === 0 && (
                  <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '4px' }}>
                    לא נבחרו מחוזות - למנהל תהיה גישה לכל התחנות
                  </div>
                )}
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.btnCancel} onClick={() => { setShowAddSuperManager(false); setEditingSuperManager(null) }}>
                ביטול
              </button>
              <button
                style={{...styles.btnSubmit, background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'}}
                onClick={editingSuperManager ? handleUpdateSuperManager : handleAddSuperManager}
                disabled={superManagerLoading}
              >
                {superManagerLoading ? 'שומר...' : (editingSuperManager ? 'עדכן' : 'צור מנהל עליון')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={styles.footer}>
        <span style={styles.footerVersion}>גרסה {VERSION}</span>
      </footer>
    </div>
  )
}

// Station Card Component
function StationCard({
  station,
  districtColor,
  isExpanded,
  onToggleExpand,
  onEdit,
  onToggleActive,
  onDelete,
  actionLoading
}: {
  station: Station
  districtColor: string
  isExpanded: boolean
  onToggleExpand: () => void
  onEdit: () => void
  onToggleActive: () => void
  onDelete: () => void
  actionLoading: boolean
}) {
  const getInitials = (name: string) => {
    const words = name.replace('תחנת ', '').split(' ')
    if (words.length >= 2) {
      return words[0].charAt(0) + '"' + words[1].charAt(0)
    }
    return words[0].substring(0, 2)
  }

  return (
    <div style={styles.stationCardCompact} onClick={e => e.stopPropagation()}>
      {/* Clickable header for expand/collapse */}
      <div style={styles.stationCompactTop} onClick={onToggleExpand}>
        <div style={{...styles.stationBadgeSmall, background: `linear-gradient(135deg, ${districtColor} 0%, ${districtColor}dd 100%)`}}>
          {getInitials(station.name)}
        </div>
        <div style={styles.stationCompactInfo}>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <div style={styles.stationCompactName}>{station.name}</div>
            <div style={{
              ...styles.statusDot,
              background: station.is_active ? '#22c55e' : '#f59e0b',
              boxShadow: station.is_active ? '0 0 8px rgba(34, 197, 94, 0.5)' : 'none'
            }} />
          </div>
          <div style={styles.stationCompactAddress}>{station.address || 'כתובת לא הוגדרה'}</div>
          <div style={styles.stationCompactStats}>
            <span style={{...styles.compactStat, color: '#22c55e'}}>{station.availableWheels} זמינים</span>
            <span style={{...styles.compactStat, color: '#f59e0b'}}>{station.totalWheels - station.availableWheels} מושאלים</span>
          </div>
        </div>
        <span style={{...styles.stationExpandIcon, transform: isExpanded ? 'rotate(180deg)' : 'none'}}>▼</span>
      </div>

      {/* Expanded content - only show when expanded */}
      {isExpanded && (
        <>
          <div style={styles.stationExpanded}>
            {station.wheel_station_managers?.length > 0 && (
              <div style={styles.managersCompact}>
                <div style={styles.managersCompactTitle}>מנהלים ({station.wheel_station_managers.length}/{station.max_managers ?? 4})</div>
                {station.wheel_station_managers.map((m, i) => (
                  <div key={i} style={styles.managerRowCompactDisplay}>
                    <span style={{color: m.is_primary ? '#22c55e' : '#64748b'}}>
                      {m.is_primary ? '🔓' : '🔒'}
                    </span>
                    <span style={{color: 'white'}}>{m.full_name}</span>
                    <span style={{color: '#64748b'}}>- {m.phone}</span>
                    <span style={{
                      marginRight: '8px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      background: m.password ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: m.password ? '#22c55e' : '#ef4444'
                    }}>
                      {m.password ? '🔐 יש סיסמא' : '⚠️ ללא סיסמא'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={styles.stationCompactActions} className="station-actions-responsive">
            <button style={{...styles.btnCompact, ...styles.btnCompactEdit}} onClick={onEdit}>✏️ ערוך</button>
            <Link href={`/${station.id}`} style={{...styles.btnCompact, ...styles.btnCompactView}}>👁️ צפה</Link>
            <button
              style={{
                ...styles.btnCompact,
                ...(station.is_active ? styles.btnCompactToggle : styles.btnCompactToggleActivate)
              }}
              onClick={onToggleActive}
              disabled={actionLoading}
            >
              {station.is_active ? '🔴 השבת' : '🟢 הפעל'}
            </button>
            <button style={{...styles.btnCompact, ...styles.btnCompactDelete}} onClick={onDelete} disabled={actionLoading}>🗑️ מחק</button>
          </div>
        </>
      )}
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  // Page wrapper
  pageWrapper: {
    background: '#0f172a',
    minHeight: '100vh',
    color: '#e2e8f0',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    direction: 'rtl',
  },

  // Header
  header: {
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)',
    borderBottom: '1px solid #22c55e',
    padding: '30px 30px 60px',
    position: 'relative',
  },
  headerContent: {
    maxWidth: '1300px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    position: 'relative',
    zIndex: 1,
    padding: '0 20px',
  },
  headerLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  logoIcon: {
    width: '55px',
    height: '55px',
    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.6rem',
    boxShadow: '0 8px 25px rgba(34, 197, 94, 0.3)',
    flexShrink: 0,
  },
  headerTitle: {
    color: 'white',
    fontSize: '1.8rem',
    fontWeight: 800,
    marginBottom: '6px',
    margin: 0,
  },
  headerSubtitle: {
    color: '#64748b',
    fontSize: '0.95rem',
    margin: 0,
  },

  // Buttons
  btnLogout: {
    padding: '10px 20px',
    borderRadius: '10px',
    border: '1px solid #dc2626',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '0.9rem',
    whiteSpace: 'nowrap',
    background: 'transparent',
    color: '#f87171',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    padding: '10px 16px',
    borderRadius: '12px',
    border: 'none',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '0.85rem',
    whiteSpace: 'nowrap',
    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnGhost: {
    padding: '10px 20px',
    borderRadius: '10px',
    border: '1px solid #334155',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '0.9rem',
    whiteSpace: 'nowrap',
    background: 'transparent',
    color: '#94a3b8',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  btnIcon: {
    width: '32px',
    height: '32px',
    fontSize: '0.8rem',
    background: '#1e293b',
    border: '1px solid #334155',
    color: '#64748b',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  btnIconSmall: {
    width: '28px',
    height: '28px',
    fontSize: '0.75rem',
    background: '#1e293b',
    border: '1px solid #334155',
    color: '#64748b',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  // Stats Row
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
    margin: '-40px auto 20px',
    position: 'relative',
    zIndex: 10,
    maxWidth: '1300px',
    padding: '0 20px',
  },
  statCard: {
    background: 'linear-gradient(145deg, #1e293b 0%, #1a2234 100%)',
    border: '1px solid #334155',
    borderRadius: '14px',
    padding: '12px 14px',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  statIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    flexShrink: 0,
  },
  statLabel: {
    color: '#64748b',
    fontSize: '0.7rem',
    marginBottom: '2px',
  },
  statValue: {
    fontSize: '1.3rem',
    fontWeight: 800,
    color: '#22c55e',
    lineHeight: 1,
  },

  // Container
  container: {
    maxWidth: '1300px',
    margin: '0 auto',
    padding: '30px 20px',
  },

  // Section
  section: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '24px',
    marginBottom: '25px',
    overflow: 'hidden',
  },
  sectionHeader: {
    padding: '18px 24px',
    borderBottom: '1px solid #334155',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'linear-gradient(90deg, rgba(34, 197, 94, 0.05) 0%, transparent 100%)',
    flexWrap: 'wrap',
    gap: '12px',
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  sectionTitleIcon: {
    width: '36px',
    height: '36px',
    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    flexShrink: 0,
  },
  sectionCount: {
    background: 'rgba(34, 197, 94, 0.2)',
    color: '#22c55e',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: 600,
  },
  sectionButtons: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  sectionContent: {
    padding: '20px 24px',
  },

  // Search
  searchContainer: {
    padding: '0 24px 16px',
    borderBottom: '1px solid #334155',
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '0.95rem',
    border: '1px solid #334155',
    borderRadius: '12px',
    background: '#0f172a',
    color: 'white',
    outline: 'none',
    transition: 'all 0.2s',
  },
  searchResults: {
    fontSize: '0.85rem',
    color: '#64748b',
    marginTop: '8px',
    margin: '8px 0 0 0',
  },

  // Districts Grid
  districtsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '16px',
  },

  // District Card
  districtCard: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '16px',
    overflow: 'hidden',
    transition: 'all 0.3s',
  },
  districtHeader: {
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  districtColorOrb: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  districtInfo: {
    flex: 1,
    minWidth: 0,
  },
  districtName: {
    fontWeight: 700,
    color: 'white',
    marginBottom: '4px',
    fontSize: '1rem',
  },
  districtMeta: {
    display: 'flex',
    gap: '12px',
    fontSize: '0.8rem',
    color: '#64748b',
  },
  districtActions: {
    display: 'flex',
    gap: '6px',
  },
  expandIcon: {
    color: '#64748b',
    fontSize: '0.9rem',
    transition: 'transform 0.3s',
  },

  // District Stations
  districtStations: {
    borderTop: '1px solid #334155',
    background: 'rgba(0, 0, 0, 0.2)',
    overflow: 'hidden',
    transition: 'max-height 0.4s ease-out, opacity 0.3s ease-out',
  },
  districtStationsInner: {
    padding: '16px',
  },
  districtStationsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
    paddingBottom: '10px',
    borderBottom: '1px dashed #334155',
  },
  districtStationsTitle: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    fontWeight: 600,
  },
  btnAddStation: {
    padding: '6px 12px',
    fontSize: '0.8rem',
    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  // Empty District
  emptyDistrict: {
    textAlign: 'center',
    padding: '30px 20px',
    color: '#64748b',
  },
  emptyDistrictIcon: {
    fontSize: '2.5rem',
    marginBottom: '10px',
    opacity: 0.5,
  },
  emptyDistrictText: {
    fontSize: '0.9rem',
    marginBottom: '15px',
  },

  // Station Card Compact
  stationCardCompact: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '14px',
    padding: '14px',
    marginBottom: '12px',
    transition: 'all 0.2s',
  },
  stationCompactTop: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    cursor: 'pointer',
  },
  stationExpandIcon: {
    color: '#64748b',
    fontSize: '0.8rem',
    transition: 'transform 0.3s',
    flexShrink: 0,
  },
  stationBadgeSmall: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    fontWeight: 800,
    color: 'white',
    flexShrink: 0,
  },
  stationCompactInfo: {
    flex: 1,
    minWidth: 0,
  },
  stationCompactName: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: 'white',
    marginBottom: '2px',
  },
  stationCompactAddress: {
    fontSize: '0.8rem',
    color: '#64748b',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  stationCompactStats: {
    display: 'flex',
    gap: '8px',
    marginTop: '8px',
  },
  compactStat: {
    background: '#0f172a',
    padding: '4px 10px',
    borderRadius: '8px',
    fontSize: '0.75rem',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },

  // Station Expanded
  stationExpanded: {
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px dashed #334155',
  },
  passwordRowCompact: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 10px',
    background: 'rgba(34, 197, 94, 0.1)',
    borderRadius: '8px',
    marginBottom: '10px',
    fontSize: '0.8rem',
  },
  passwordLabel: {
    color: '#64748b',
  },
  passwordValue: {
    fontFamily: "'Courier New', monospace",
    fontWeight: 700,
    color: '#22c55e',
    letterSpacing: '1px',
  },
  passwordMissing: {
    color: '#ef4444',
    fontWeight: 600,
  },

  // Managers Compact
  managersCompact: {
    background: '#0f172a',
    borderRadius: '10px',
    padding: '10px',
  },
  managersCompactTitle: {
    fontSize: '0.75rem',
    color: '#64748b',
    marginBottom: '8px',
  },
  managerRowCompactDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '6px',
    fontSize: '0.8rem',
  },

  // Station Actions
  stationCompactActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '10px',
    paddingTop: '10px',
    borderTop: '1px solid #334155',
  },
  btnCompact: {
    padding: '6px 10px',
    fontSize: '0.75rem',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  btnCompactEdit: {
    background: 'rgba(59, 130, 246, 0.15)',
    color: '#3b82f6',
  },
  btnCompactView: {
    background: '#334155',
    color: '#94a3b8',
  },
  btnCompactToggle: {
    background: 'rgba(245, 158, 11, 0.15)',
    color: '#f59e0b',
  },
  btnCompactToggleActivate: {
    background: 'rgba(34, 197, 94, 0.15)',
    color: '#22c55e',
  },
  btnCompactDelete: {
    background: 'rgba(239, 68, 68, 0.15)',
    color: '#ef4444',
  },

  // No District Section
  noDistrictSection: {
    marginTop: '20px',
    padding: '16px',
    background: 'rgba(245, 158, 11, 0.1)',
    border: '1px dashed #f59e0b',
    borderRadius: '14px',
    gridColumn: '1 / -1',
  },
  noDistrictTitle: {
    fontSize: '0.9rem',
    color: '#f59e0b',
    fontWeight: 600,
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  // Modal
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '15px',
  },
  modal: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
  },
  modalHeader: {
    padding: '20px 24px 16px',
    borderBottom: '1px solid #334155',
  },
  modalTitle: {
    fontSize: '1.2rem',
    fontWeight: 800,
    color: '#22c55e',
    margin: 0,
  },
  modalBody: {
    padding: '20px 24px',
  },
  modalFooter: {
    padding: '16px 24px 20px',
    display: 'flex',
    gap: '10px',
    borderTop: '1px solid #334155',
  },

  // Form
  formGroup: {
    marginBottom: '18px',
  },
  formLabel: {
    display: 'block',
    color: '#94a3b8',
    fontSize: '0.85rem',
    fontWeight: 600,
    marginBottom: '8px',
  },
  formInput: {
    width: '100%',
    padding: '12px 14px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '10px',
    color: 'white',
    fontSize: '0.95rem',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
  },

  // Managers Section
  managersSection: {
    marginTop: '20px',
    padding: '15px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '10px',
  },
  managersSectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  btnAddManager: {
    background: '#22c55e',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
  managerRow: {
    display: 'flex',
    gap: '6px',
    marginBottom: '8px',
    alignItems: 'center',
  },
  managerInputCompact: {
    flex: 1,
    padding: '6px 8px',
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '6px',
    color: 'white',
    fontSize: '0.75rem',
    minWidth: 0,
  },
  managerCard: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '10px',
    marginBottom: '8px',
  },
  managerPasswordRow: {
    display: 'flex',
    gap: '6px',
    marginTop: '8px',
    alignItems: 'center',
    width: '100%',
    overflow: 'hidden',
  },
  managerPasswordInput: {
    flex: 1,
    minWidth: 0,
    padding: '6px 8px',
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '6px',
    color: 'white',
    fontSize: '0.75rem',
  },
  btnResetPassword: {
    padding: '6px 10px',
    background: 'rgba(245, 158, 11, 0.15)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    borderRadius: '6px',
    color: '#f59e0b',
    cursor: 'pointer',
    fontSize: '0.7rem',
    whiteSpace: 'nowrap' as const,
    flexShrink: 0,
  },
  btnCrownSm: {
    width: '26px',
    height: '26px',
    borderRadius: '6px',
    border: '1px solid #334155',
    cursor: 'pointer',
    fontSize: '0.7rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  btnDeleteSm: {
    width: '26px',
    height: '26px',
    borderRadius: '6px',
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#ef4444',
    cursor: 'pointer',
    fontSize: '0.7rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  // Modal Buttons
  btnCancel: {
    flex: 1,
    background: '#334155',
    color: 'white',
    border: 'none',
    padding: '12px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.95rem',
  },
  btnSubmit: {
    flex: 1,
    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    color: 'white',
    border: 'none',
    padding: '12px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.95rem',
  },

  // Confirm Dialog
  confirmDialog: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '20px',
    padding: '25px',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
    boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
  },
  confirmTitle: {
    fontSize: '1.2rem',
    fontWeight: 800,
    color: '#ef4444',
    marginBottom: '15px',
    margin: '0 0 15px 0',
  },
  confirmMessage: {
    color: '#94a3b8',
    fontSize: '0.95rem',
    marginBottom: '25px',
    lineHeight: 1.6,
    margin: '0 0 25px 0',
  },
  confirmButtons: {
    display: 'flex',
    gap: '12px',
  },
  confirmDeleteBtn: {
    flex: 1,
    background: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '12px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.95rem',
  },

  // Loading styles
  loadingContainer: {
    minHeight: '100vh',
    background: '#0f172a',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  loadingSpinner: {
    fontSize: '3rem',
    marginBottom: '16px',
    animation: 'spin 1s linear infinite',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#64748b',
  },
  footer: {
    padding: '20px',
    textAlign: 'center',
    borderTop: '1px solid #334155',
    marginTop: '20px',
  },
  footerVersion: {
    color: '#64748b',
    fontSize: '0.8rem',
  },
}
