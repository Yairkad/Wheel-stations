'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { VERSION } from '@/lib/version'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { AdminShell } from '@/components/admin/AdminShell'

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


export default function WheelsAdminPage() {
  const { isAuthenticated, isLoading: authLoading, logout } = useAdminAuth()

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

  useEffect(() => {
    if (isAuthenticated) {
      fetchStations()
      fetchDistricts()
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
        else if (showConfirmDialog) setShowConfirmDialog(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [editingStation, showAddStation, editingDistrict, showAddDistrict, showConfirmDialog])

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


  const resetForm = () => {
    setStationForm({
      name: '',
      address: '',
      district: '',
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
        body: JSON.stringify({ ...stationForm })
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
    setActionLoading(true)
    try {
      const response = await fetch(`/api/wheel-stations/admin/${editingStation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...stationForm })
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
            body: JSON.stringify({})
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
        body: JSON.stringify({ is_active: !station.is_active })
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
    })
    setEditingStation(station)
  }

  const openAddStationModal = () => {
    resetForm()
    setShowAddStation(true)
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
        <div style={styles.loadingSpinner}><svg className="spinning-wheel" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></svg></div>
        <p>טוען...</p>
      </div>
    )
  }

  return (
    <AdminShell onLogout={logout}>
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
            margin-top: 16px !important;
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
          .header-buttons-responsive {
            gap: 4px !important;
          }
          .header-buttons-responsive a,
          .header-buttons-responsive button {
            padding: 5px 6px !important;
            font-size: 0.65rem !important;
          }
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


      {/* Stats Row */}
      <div style={styles.statsRow} className="stats-row-responsive">
        <div style={styles.statCard} className="stat-card-responsive">
          <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'}} className="stat-icon-responsive"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>
          <div>
            <div style={styles.statLabel}>תחנות</div>
            <div style={styles.statValue} className="stat-value-responsive">{stations.length}</div>
          </div>
        </div>
        <div style={styles.statCard} className="stat-card-responsive">
          <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'}} className="stat-icon-responsive"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="9"/><line x1="12" y1="15" x2="12" y2="22"/><line x1="2" y1="12" x2="9" y2="12"/><line x1="15" y1="12" x2="22" y2="12"/></svg></div>
          <div>
            <div style={styles.statLabel}>גלגלים</div>
            <div style={{...styles.statValue, color: '#3b82f6'}} className="stat-value-responsive">{totalWheels}</div>
          </div>
        </div>
        <div style={styles.statCard} className="stat-card-responsive">
          <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}} className="stat-icon-responsive"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
          <div>
            <div style={styles.statLabel}>זמינים</div>
            <div style={{...styles.statValue, color: '#f59e0b'}} className="stat-value-responsive">{availableWheels}</div>
          </div>
        </div>
        <div style={styles.statCard} className="stat-card-responsive">
          <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'}} className="stat-icon-responsive"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
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
              <div style={styles.sectionTitleIcon}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg></div>
              מחוזות ותחנות
              <span style={styles.sectionCount}>{districts.length} מחוזות • {stations.length} תחנות</span>
            </div>
            <div style={styles.sectionButtons} className="section-buttons">
              <button style={styles.btnGhost} onClick={() => { resetDistrictForm(); setShowAddDistrict(true) }}>+ מחוז</button>
              <button style={styles.btnPrimary} onClick={() => openAddStationModal()}>+ תחנה</button>
            </div>
          </div>

          {/* Search Bar */}
          <div style={styles.searchContainer}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חפש לפי שם תחנה, כתובת או שם מנהל..."
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
                        borderColor: isExpanded ? '#16a34a' : '#e2e8f0',
                        boxShadow: isExpanded ? '0 4px 16px rgba(22, 163, 74, 0.12)' : '0 2px 8px rgba(0,0,0,0.04)'
                      }}
                    >
                      <div
                        style={styles.districtHeader}
                        onClick={() => setExpandedDistrict(isExpanded ? null : district.code)}
                      >
                        <div style={{...styles.districtColorOrb, background: `linear-gradient(135deg, ${districtColor} 0%, ${districtColor}dd 100%)`}}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        </div>
                        <div style={styles.districtInfo}>
                          <div style={styles.districtName}>{district.name}</div>
                          <div style={styles.districtMeta}>
                            <span style={{display:'inline-flex',alignItems:'center',gap:'3px'}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>{districtStations.length} תחנות</span>
                            <span style={{display:'inline-flex',alignItems:'center',gap:'3px'}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>{districtWheels} גלגלים</span>
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
                              <button style={styles.btnIconSmall} onClick={(e) => { e.stopPropagation(); openEditDistrictModal(district) }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                              <button style={styles.btnIconSmall} onClick={(e) => { e.stopPropagation(); handleDeleteDistrict(district) }} disabled={actionLoading}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></button>
                            </div>
                          </div>

                          {districtStations.length === 0 ? (
                            <div style={styles.emptyDistrict}>
                              <div style={styles.emptyDistrictIcon}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>
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
                      <span style={{display:'inline-flex',alignItems:'center',gap:'6px'}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>תחנות ללא מחוז ({stationsWithoutDistrict.length})</span>
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
                {editingStation ? (
                  <span style={{display:'inline-flex',alignItems:'center',gap:'6px'}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>עריכת תחנה</span>
                ) : (
                  <span style={{display:'inline-flex',alignItems:'center',gap:'6px'}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>תחנה חדשה</span>
                )}
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
                {editingDistrict ? (
                  <span style={{display:'inline-flex',alignItems:'center',gap:'6px'}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>עריכת מחוז</span>
                ) : (
                  <span style={{display:'inline-flex',alignItems:'center',gap:'6px'}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>מחוז חדש</span>
                )}
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
            <h3 style={styles.confirmTitle}><span style={{display:'inline-flex',alignItems:'center',gap:'6px'}}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>{confirmDialogData.title}</span></h3>
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

      {/* Footer */}
      <footer style={styles.footer}>
        <span style={styles.footerVersion}>גרסה {VERSION}</span>
      </footer>
    </div>
    </AdminShell>
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
                    <span
                      title={m.is_primary ? 'מנהל ראשי' : 'מנהל משני'}
                      style={{
                        filter: m.is_primary ? 'drop-shadow(0 0 4px #f59e0b)' : 'grayscale(1) opacity(0.35)',
                        fontSize: '12px',
                        lineHeight: 1,
                      }}
                    >⭐</span>
                    <Link href={`/admin/users?phone=${encodeURIComponent(m.phone)}`} style={{color: '#2563eb', textDecoration: 'none', fontWeight: 600}} onClick={e => e.stopPropagation()}>{m.full_name}</Link>
                    <span style={{color: '#64748b'}}>- {m.phone}</span>
                    <span style={{
                      marginRight: '8px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      background: m.password ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: m.password ? '#22c55e' : '#ef4444'
                    }}>
                      {m.password ? (
                        <span style={{display:'inline-flex',alignItems:'center',gap:'3px'}}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>יש סיסמא</span>
                      ) : (
                        <span style={{display:'inline-flex',alignItems:'center',gap:'3px'}}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>ללא סיסמא</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={styles.stationCompactActions} className="station-actions-responsive">
            <button style={{...styles.btnCompact, ...styles.btnCompactEdit}} onClick={onEdit}><span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>ערוך</span></button>
            <Link href={`/${station.id}`} style={{...styles.btnCompact, ...styles.btnCompactView}}><span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>צפה</span></Link>
            <button
              style={{
                ...styles.btnCompact,
                ...(station.is_active ? styles.btnCompactToggle : styles.btnCompactToggleActivate)
              }}
              onClick={onToggleActive}
              disabled={actionLoading}
            >
              {station.is_active ? (
                <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="10" height="10" viewBox="0 0 24 24" fill="#ef4444" stroke="none"><circle cx="12" cy="12" r="12"/></svg>השבת</span>
              ) : (
                <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="10" height="10" viewBox="0 0 24 24" fill="#22c55e" stroke="none"><circle cx="12" cy="12" r="12"/></svg>הפעל</span>
              )}
            </button>
            <button style={{...styles.btnCompact, ...styles.btnCompactDelete}} onClick={onDelete} disabled={actionLoading}><span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>מחק</span></button>
          </div>
        </>
      )}
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  // Page wrapper
  pageWrapper: {
    background: '#f1f5f9',
    minHeight: '100vh',
    color: '#1e293b',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    direction: 'rtl',
    paddingTop: 16,
  },

  // Header
  header: {
    background: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
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
    background: '#16a34a',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.6rem',
    boxShadow: '0 8px 25px rgba(34, 197, 94, 0.3)',
    flexShrink: 0,
  },
  headerTitle: {
    color: '#1e293b',
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
    color: '#dc2626',
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
    background: '#16a34a',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnGhost: {
    padding: '10px 20px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '0.9rem',
    whiteSpace: 'nowrap',
    background: 'transparent',
    color: '#64748b',
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
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    color: '#64748b',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  btnIconSmall: {
    width: '28px',
    height: '28px',
    fontSize: '0.75rem',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
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
    margin: '24px auto 20px',
    position: 'relative',
    zIndex: 10,
    maxWidth: '1300px',
    padding: '0 20px',
  },
  statCard: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    padding: '12px 14px',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
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
    color: '#1e293b',
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
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '24px',
    marginBottom: '25px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  sectionHeader: {
    padding: '18px 24px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#f8fafc',
    flexWrap: 'wrap',
    gap: '12px',
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  sectionTitleIcon: {
    width: '36px',
    height: '36px',
    background: '#16a34a',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    flexShrink: 0,
  },
  sectionCount: {
    background: 'rgba(34, 197, 94, 0.15)',
    color: '#16a34a',
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
    borderBottom: '1px solid #e2e8f0',
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '0.95rem',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    background: '#f8fafc',
    color: '#1e293b',
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
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
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
    color: '#1e293b',
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
    borderTop: '1px solid #e2e8f0',
    background: '#f1f5f9',
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
    borderBottom: '1px dashed #e2e8f0',
  },
  districtStationsTitle: {
    fontSize: '0.85rem',
    color: '#64748b',
    fontWeight: 600,
  },
  btnAddStation: {
    padding: '6px 12px',
    fontSize: '0.8rem',
    background: '#16a34a',
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
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    padding: '14px',
    marginBottom: '12px',
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
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
    color: '#1e293b',
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
    background: '#f8fafc',
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
    borderTop: '1px dashed #e2e8f0',
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
    background: '#f8fafc',
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
    borderTop: '1px solid #e2e8f0',
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
    background: '#f1f5f9',
    color: '#64748b',
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
    background: 'rgba(15,23,42,0.5)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '15px',
  },
  modal: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
  },
  modalHeader: {
    padding: '20px 24px 16px',
    borderBottom: '1px solid #e2e8f0',
  },
  modalTitle: {
    fontSize: '1.2rem',
    fontWeight: 800,
    color: '#1e293b',
    margin: 0,
  },
  modalBody: {
    padding: '20px 24px',
  },
  modalFooter: {
    padding: '16px 24px 20px',
    display: 'flex',
    gap: '10px',
    borderTop: '1px solid #e2e8f0',
  },

  // Form
  formGroup: {
    marginBottom: '18px',
  },
  formLabel: {
    display: 'block',
    color: '#64748b',
    fontSize: '0.85rem',
    fontWeight: 600,
    marginBottom: '8px',
  },
  formInput: {
    width: '100%',
    padding: '12px 14px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    color: '#1e293b',
    fontSize: '0.95rem',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
  },

  // Managers Section
  managersSection: {
    marginTop: '20px',
    padding: '15px',
    background: '#f8fafc',
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
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    color: '#1e293b',
    fontSize: '0.75rem',
    minWidth: 0,
  },
  managerCard: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
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
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    color: '#1e293b',
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
    border: '1px solid #e2e8f0',
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
    background: '#f1f5f9',
    color: '#64748b',
    border: '1px solid #e2e8f0',
    padding: '12px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.95rem',
  },
  btnSubmit: {
    flex: 1,
    background: '#16a34a',
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
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    padding: '25px',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
    boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
  },
  confirmTitle: {
    fontSize: '1.2rem',
    fontWeight: 800,
    color: '#ef4444',
    marginBottom: '15px',
    margin: '0 0 15px 0',
  },
  confirmMessage: {
    color: '#64748b',
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
    background: '#f1f5f9',
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
    borderTop: '1px solid #e2e8f0',
    marginTop: '20px',
  },
  footerVersion: {
    color: '#64748b',
    fontSize: '0.8rem',
  },
}
