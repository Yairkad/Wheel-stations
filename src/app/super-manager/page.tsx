'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { SESSION_VERSION } from '@/lib/version'

const SESSION_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000

interface SuperManager {
  id: string
  full_name: string
  phone: string
  allowed_districts: string[] | null
}

interface Station {
  id: string
  name: string
  address: string
  district: string | null
  totalWheels: number
  availableWheels: number
  wheel_station_managers: { id: string; full_name: string; phone: string; is_primary: boolean }[]
}

interface Wheel {
  id: string
  wheel_number: number
  rim_size: number
  bolt_count: number
  bolt_spacing: number
  center_bore: number | null
  category: string | null
  is_donut: boolean
  is_available: boolean
  notes: string | null
  custom_deposit: number | null
  temporarily_unavailable: boolean | null
  unavailable_reason: string | null
  unavailable_notes: string | null
  currentBorrow?: {
    borrower_name: string
    borrower_phone: string
    borrow_date: string
    deposit_type: string
    vehicle_model: string
  }
}

interface Borrow {
  id: string
  wheel_id: string
  borrower_name: string
  borrower_phone: string
  vehicle_model: string
  borrow_date: string
  actual_return_date: string | null
  deposit_type: string
  status: string
  wheels: { wheel_number: number; rim_size: number } | null
}

interface WheelForm {
  wheel_number: string
  rim_size: string
  bolt_count: string
  bolt_spacing: string
  center_bore: string
  category: string
  is_donut: boolean
  notes: string
  custom_deposit: string
}

const emptyForm: WheelForm = {
  wheel_number: '', rim_size: '', bolt_count: '', bolt_spacing: '',
  center_bore: '', category: '', is_donut: false, notes: '', custom_deposit: ''
}

export default function SuperManagerPage() {
  const router = useRouter()
  const [superManager, setSuperManager] = useState<SuperManager | null>(null)
  const [sessionPassword, setSessionPassword] = useState('')
  const [stations, setStations] = useState<Station[]>([])
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [wheels, setWheels] = useState<Wheel[]>([])
  const [borrows, setBorrows] = useState<Borrow[]>([])
  const [activeTab, setActiveTab] = useState<'wheels' | 'borrows'>('wheels')
  const [loading, setLoading] = useState(true)
  const [stationLoading, setStationLoading] = useState(false)

  // Wheel form state
  const [showForm, setShowForm] = useState(false)
  const [editingWheel, setEditingWheel] = useState<Wheel | null>(null)
  const [form, setForm] = useState<WheelForm>(emptyForm)
  const [formLoading, setFormLoading] = useState(false)

  // Borrow filter
  const [borrowFilter, setBorrowFilter] = useState<'all' | 'borrowed' | 'returned'>('all')

  // Confirm dialog
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmDialogData, setConfirmDialogData] = useState<{
    title: string
    message: string
    onConfirm: () => void
    confirmText?: string
    cancelText?: string
    variant?: 'danger' | 'warning' | 'info'
  } | null>(null)

  // Districts lookup (code → Hebrew name)
  const [districtNames, setDistrictNames] = useState<Record<string, string>>({})

  // Session validation
  useEffect(() => {
    const raw = localStorage.getItem('super_manager_session')
    if (!raw) { router.push('/login'); return }

    try {
      const session = JSON.parse(raw)
      if (!session.timestamp || Date.now() - session.timestamp > SESSION_EXPIRY_MS) {
        localStorage.removeItem('super_manager_session')
        router.push('/login')
        return
      }
      if (session.version !== SESSION_VERSION) {
        localStorage.removeItem('super_manager_session')
        router.push('/login')
        return
      }
      setSuperManager(session.superManager)
      setSessionPassword(session.password)
    } catch {
      router.push('/login')
    }
  }, [router])

  // Fetch stations
  const fetchStations = useCallback(async () => {
    try {
      const res = await fetch('/api/wheel-stations')
      const data = await res.json()
      if (data.stations) setStations(data.stations)
    } catch {
      toast.error('שגיאה בטעינת תחנות')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (superManager) {
      fetchStations()
      // Fetch districts for Hebrew names
      fetch('/api/districts').then(r => r.json()).then(data => {
        const map: Record<string, string> = {}
        for (const d of (data.districts || [])) map[d.code] = d.name
        setDistrictNames(map)
      }).catch(() => {})
    }
  }, [superManager, fetchStations])

  // Fetch station details
  const fetchStationDetail = useCallback(async (stationId: string) => {
    setStationLoading(true)
    try {
      const [stationRes, borrowsRes] = await Promise.all([
        fetch(`/api/wheel-stations/${stationId}`),
        fetch(`/api/wheel-stations/${stationId}/borrows?limit=100`)
      ])
      const stationData = await stationRes.json()
      const borrowsData = await borrowsRes.json()

      if (stationData.station) {
        setWheels(stationData.station.wheels || [])
      }
      if (borrowsData.borrows) {
        setBorrows(borrowsData.borrows)
      }
    } catch {
      toast.error('שגיאה בטעינת פרטי תחנה')
    } finally {
      setStationLoading(false)
    }
  }, [])

  const handleSelectStation = (station: Station) => {
    setSelectedStation(station)
    setActiveTab('wheels')
    fetchStationDetail(station.id)
  }

  const handleBack = () => {
    setSelectedStation(null)
    setWheels([])
    setBorrows([])
    setShowForm(false)
    setEditingWheel(null)
    fetchStations()
  }

  const handleLogout = () => {
    localStorage.removeItem('super_manager_session')
    router.push('/login')
  }

  // Wheel CRUD
  const handleAddWheel = () => {
    setEditingWheel(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const handleEditWheel = (wheel: Wheel) => {
    setEditingWheel(wheel)
    setForm({
      wheel_number: String(wheel.wheel_number),
      rim_size: String(wheel.rim_size),
      bolt_count: String(wheel.bolt_count),
      bolt_spacing: String(wheel.bolt_spacing),
      center_bore: wheel.center_bore ? String(wheel.center_bore) : '',
      category: wheel.category || '',
      is_donut: wheel.is_donut,
      notes: wheel.notes || '',
      custom_deposit: wheel.custom_deposit ? String(wheel.custom_deposit) : ''
    })
    setShowForm(true)
  }

  const handleSaveWheel = async () => {
    if (!selectedStation || !superManager) return
    if (!form.wheel_number || !form.rim_size || !form.bolt_count || !form.bolt_spacing) {
      toast.error('יש למלא את כל שדות החובה')
      return
    }

    setFormLoading(true)
    try {
      const payload = {
        wheel_number: parseInt(form.wheel_number),
        rim_size: parseFloat(form.rim_size),
        bolt_count: parseInt(form.bolt_count),
        bolt_spacing: parseFloat(form.bolt_spacing),
        center_bore: form.center_bore ? parseFloat(form.center_bore) : null,
        category: form.category || null,
        is_donut: form.is_donut,
        notes: form.notes || null,
        custom_deposit: form.custom_deposit ? parseFloat(form.custom_deposit) : null,
        sm_phone: superManager.phone,
        sm_password: sessionPassword
      }

      const url = editingWheel
        ? `/api/wheel-stations/${selectedStation.id}/wheels/${editingWheel.id}`
        : `/api/wheel-stations/${selectedStation.id}/wheels`

      const res = await fetch(url, {
        method: editingWheel ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'שגיאה בשמירה')
        return
      }

      toast.success(editingWheel ? 'הגלגל עודכן' : 'הגלגל נוסף')
      setShowForm(false)
      setEditingWheel(null)
      fetchStationDetail(selectedStation.id)
    } catch {
      toast.error('שגיאה בשמירה')
    } finally {
      setFormLoading(false)
    }
  }

  const showConfirm = (options: {
    title: string
    message: string
    onConfirm: () => void
    confirmText?: string
    cancelText?: string
    variant?: 'danger' | 'warning' | 'info'
  }) => {
    setConfirmDialogData(options)
    setShowConfirmDialog(true)
  }

  const closeConfirmDialog = () => {
    setShowConfirmDialog(false)
    setConfirmDialogData(null)
  }

  const handleDeleteWheel = async (wheel: Wheel) => {
    if (!selectedStation || !superManager) return
    if (!wheel.is_available) {
      toast.error('לא ניתן למחוק גלגל מושאל')
      return
    }

    showConfirm({
      title: 'מחיקת גלגל',
      message: `למחוק את גלגל #${wheel.wheel_number}?\nפעולה זו תסמן את הגלגל כמחוק. למנהל התחנה תהיה אפשרות לשחזר תוך 14 יום.`,
      confirmText: 'מחק',
      variant: 'danger',
      onConfirm: async () => {
        closeConfirmDialog()
        try {
          const res = await fetch(`/api/wheel-stations/${selectedStation.id}/wheels/${wheel.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sm_phone: superManager.phone, sm_password: sessionPassword })
          })
          if (!res.ok) {
            const data = await res.json()
            toast.error(data.error || 'שגיאה במחיקה')
            return
          }
          toast.success('הגלגל נמחק')
          fetchStationDetail(selectedStation.id)
        } catch {
          toast.error('שגיאה במחיקה')
        }
      }
    })
  }

  const filteredBorrows = borrows.filter(b => {
    if (borrowFilter === 'all') return true
    return b.status === borrowFilter
  })

  // Filter stations by allowed districts
  const filteredStations = superManager?.allowed_districts?.length
    ? stations.filter(s => s.district && superManager.allowed_districts!.includes(s.district))
    : stations

  if (!superManager) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#7dd3fc' }}>טוען...</p>
      </div>
    )
  }

  // Station detail view
  if (selectedStation) {
    return (
      <div style={{ minHeight: '100vh', background: '#f1f5f9', direction: 'rtl' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', padding: '16px 20px', color: 'white' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <button onClick={handleBack} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', marginLeft: '12px' }}>
                ← חזרה לרשימה
              </button>
              <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedStation.name}</span>
              <span style={{ fontSize: '0.85rem', opacity: 0.8, marginRight: '10px' }}>{selectedStation.address}</span>
            </div>
            <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>👑 {superManager.full_name}</span>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <button
              onClick={() => setActiveTab('wheels')}
              style={{
                padding: '10px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem',
                background: activeTab === 'wheels' ? '#4f46e5' : 'white',
                color: activeTab === 'wheels' ? 'white' : '#374151',
                boxShadow: activeTab === 'wheels' ? '0 4px 12px rgba(79,70,229,0.3)' : '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              📦 גלגלים ({wheels.length})
            </button>
            <button
              onClick={() => setActiveTab('borrows')}
              style={{
                padding: '10px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem',
                background: activeTab === 'borrows' ? '#4f46e5' : 'white',
                color: activeTab === 'borrows' ? 'white' : '#374151',
                boxShadow: activeTab === 'borrows' ? '0 4px 12px rgba(79,70,229,0.3)' : '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              📋 מעקב השאלות ({borrows.length})
            </button>
          </div>

          {stationLoading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>טוען...</div>
          ) : activeTab === 'wheels' ? (
            <>
              {/* Add wheel button */}
              <button
                onClick={handleAddWheel}
                style={{ marginBottom: '16px', padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem' }}
              >
                + הוסף גלגל
              </button>

              {/* Wheel form modal */}
              {showForm && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={() => !formLoading && setShowForm(false)}>
                  <div style={{ background: 'white', borderRadius: '16px', padding: '24px', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                    <h3 style={{ marginBottom: '16px', fontSize: '1.2rem', fontWeight: 700 }}>
                      {editingWheel ? `עריכת גלגל #${editingWheel.wheel_number}` : 'הוספת גלגל חדש'}
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={labelStyle}>מספר גלגל *</label>
                        <input type="number" value={form.wheel_number} onChange={e => setForm({ ...form, wheel_number: e.target.value })} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>גודל חישוק *</label>
                        <input type="number" value={form.rim_size} onChange={e => setForm({ ...form, rim_size: e.target.value })} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>מספר ברגים *</label>
                        <select value={form.bolt_count} onChange={e => setForm({ ...form, bolt_count: e.target.value })} style={inputStyle}>
                          <option value="">בחר</option>
                          <option value="4">4</option>
                          <option value="5">5</option>
                          <option value="6">6</option>
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>מרווח ברגים (PCD) *</label>
                        <input type="number" step="0.1" value={form.bolt_spacing} onChange={e => setForm({ ...form, bolt_spacing: e.target.value })} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>קדח מרכזי (CB)</label>
                        <input type="number" step="0.1" value={form.center_bore} onChange={e => setForm({ ...form, center_bore: e.target.value })} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>קטגוריה</label>
                        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inputStyle}>
                          <option value="">ללא</option>
                          <option value="german">גרמני</option>
                          <option value="french">צרפתי</option>
                          <option value="japanese">יפני/קוריאני</option>
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>פיקדון מותאם</label>
                        <input type="number" value={form.custom_deposit} onChange={e => setForm({ ...form, custom_deposit: e.target.value })} style={inputStyle} placeholder="ברירת מחדל" />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '24px' }}>
                        <input type="checkbox" checked={form.is_donut} onChange={e => setForm({ ...form, is_donut: e.target.checked })} id="is_donut" />
                        <label htmlFor="is_donut" style={{ fontSize: '0.9rem', color: '#374151' }}>גלגל דונאט</label>
                      </div>
                    </div>

                    <div style={{ marginTop: '12px' }}>
                      <label style={labelStyle}>הערות</label>
                      <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                      <button
                        onClick={handleSaveWheel}
                        disabled={formLoading}
                        style={{ flex: 1, padding: '12px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, opacity: formLoading ? 0.6 : 1 }}
                      >
                        {formLoading ? 'שומר...' : 'שמור'}
                      </button>
                      <button
                        onClick={() => { setShowForm(false); setEditingWheel(null) }}
                        disabled={formLoading}
                        style={{ padding: '12px 20px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '10px', cursor: 'pointer' }}
                      >
                        ביטול
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Wheels grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                {wheels.map(wheel => (
                  <div key={wheel.id} style={{
                    background: 'white', borderRadius: '12px', padding: '16px',
                    border: `2px solid ${wheel.temporarily_unavailable ? '#fca5a5' : !wheel.is_available ? '#fbbf24' : '#d1fae5'}`,
                    opacity: wheel.temporarily_unavailable ? 0.7 : 1
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10b981' }}>#{wheel.wheel_number}</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {wheel.is_donut && <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem' }}>🍩 דונאט</span>}
                        {wheel.temporarily_unavailable && <span style={{ background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem' }}>לא זמין</span>}
                        {!wheel.is_available && !wheel.temporarily_unavailable && <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem' }}>מושאל</span>}
                        {wheel.is_available && !wheel.temporarily_unavailable && <span style={{ background: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem' }}>זמין</span>}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '4px' }}>
                      {wheel.bolt_count}x{wheel.bolt_spacing} | R{wheel.rim_size}
                      {wheel.center_bore ? ` | CB ${wheel.center_bore}` : ''}
                    </div>
                    {wheel.custom_deposit && (
                      <div style={{ fontSize: '0.8rem', color: '#7c3aed', marginBottom: '4px' }}>פיקדון: ₪{wheel.custom_deposit}</div>
                    )}
                    {wheel.notes && (
                      <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '8px' }}>{wheel.notes}</div>
                    )}
                    {wheel.temporarily_unavailable && wheel.unavailable_reason && (
                      <div style={{ fontSize: '0.8rem', color: '#dc2626', marginBottom: '8px' }}>סיבה: {wheel.unavailable_reason}</div>
                    )}

                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                      <button onClick={() => handleEditWheel(wheel)} style={{ flex: 1, padding: '6px', background: '#eef2ff', color: '#4f46e5', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                        ✏️ עריכה
                      </button>
                      {wheel.is_available && (
                        <button onClick={() => handleDeleteWheel(wheel)} style={{ padding: '6px 10px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {wheels.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>אין גלגלים בתחנה זו</div>}
            </>
          ) : (
            <>
              {/* Borrow filter */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {(['all', 'borrowed', 'returned'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setBorrowFilter(f)}
                    style={{
                      padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.85rem',
                      background: borrowFilter === f ? '#4f46e5' : 'white',
                      color: borrowFilter === f ? 'white' : '#374151'
                    }}
                  >
                    {f === 'all' ? 'הכל' : f === 'borrowed' ? 'מושאלים' : 'הוחזרו'}
                  </button>
                ))}
              </div>

              {/* Borrows list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredBorrows.map(borrow => (
                  <div key={borrow.id} style={{
                    background: 'white', borderRadius: '10px', padding: '14px',
                    borderRight: `4px solid ${borrow.status === 'borrowed' ? '#f59e0b' : '#10b981'}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: 600 }}>{borrow.borrower_name}</span>
                        <span style={{ color: '#6b7280', marginRight: '8px', fontSize: '0.85rem' }}>{borrow.borrower_phone}</span>
                      </div>
                      <span style={{
                        padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600,
                        background: borrow.status === 'borrowed' ? '#fef3c7' : '#d1fae5',
                        color: borrow.status === 'borrowed' ? '#92400e' : '#065f46'
                      }}>
                        {borrow.status === 'borrowed' ? 'מושאל' : 'הוחזר'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '4px' }}>
                      גלגל #{borrow.wheels?.wheel_number || '?'} | {borrow.vehicle_model || '-'} | {new Date(borrow.borrow_date).toLocaleDateString('he-IL')}
                      {borrow.actual_return_date && ` → ${new Date(borrow.actual_return_date).toLocaleDateString('he-IL')}`}
                    </div>
                  </div>
                ))}
                {filteredBorrows.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>אין השאלות להצגה</div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Confirm dialog */}
        {showConfirmDialog && confirmDialogData && (
          <div role="presentation" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }} onClick={closeConfirmDialog}>
            <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-dialog-title" aria-describedby="confirm-dialog-message" style={{ background: '#1e293b', borderRadius: '16px', padding: '25px', width: '100%', maxWidth: '360px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
              <h3 id="confirm-dialog-title" style={{
                fontSize: '1.3rem', marginBottom: '12px', fontWeight: 'bold',
                color: confirmDialogData.variant === 'danger' ? '#ef4444' : confirmDialogData.variant === 'warning' ? '#f59e0b' : '#3b82f6'
              }}>
                {confirmDialogData.title}
              </h3>
              <p id="confirm-dialog-message" style={{ color: '#a0aec0', fontSize: '1rem', marginBottom: '25px', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                {confirmDialogData.message}
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={{ flex: 1, color: '#d1d5db', background: '#374151', border: 'none', padding: '14px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }} onClick={closeConfirmDialog}>
                  {confirmDialogData.cancelText || 'ביטול'}
                </button>
                <button style={{
                  flex: 1, color: 'white', border: 'none', padding: '14px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem',
                  background: confirmDialogData.variant === 'danger' ? '#ef4444' : confirmDialogData.variant === 'warning' ? '#f59e0b' : '#3b82f6'
                }} onClick={confirmDialogData.onConfirm}>
                  {confirmDialogData.confirmText || 'אישור'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Station list view
  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', direction: 'rtl' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', padding: '16px 20px', color: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '1.3rem', fontWeight: 700 }}>👑 מנהל עליון</span>
            <span style={{ fontSize: '0.9rem', opacity: 0.8, marginRight: '10px' }}>{superManager.full_name}</span>
          </div>
          <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
            יציאה
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#1f2937', marginBottom: '16px' }}>
          {superManager.allowed_districts?.length ? 'תחנות במחוזות שלי' : 'כל התחנות'} ({filteredStations.length})
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>טוען תחנות...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
            {filteredStations.map(station => (
              <button
                key={station.id}
                onClick={() => handleSelectStation(station)}
                style={{
                  background: 'white', borderRadius: '12px', padding: '18px', border: '1px solid #e5e7eb',
                  cursor: 'pointer', textAlign: 'right', transition: 'all 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1f2937' }}>{station.name}</span>
                  <span style={{
                    background: station.availableWheels > 0 ? '#d1fae5' : '#fee2e2',
                    color: station.availableWheels > 0 ? '#065f46' : '#991b1b',
                    padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600
                  }}>
                    {station.availableWheels}/{station.totalWheels} זמינים
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{station.address}</div>
                {station.district && (
                  <div style={{ fontSize: '0.8rem', color: '#7c3aed', marginTop: '4px' }}>מחוז: {districtNames[station.district] || station.district}</div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.85rem', color: '#374151', marginBottom: '4px', fontWeight: 500 }
const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', boxSizing: 'border-box' }
