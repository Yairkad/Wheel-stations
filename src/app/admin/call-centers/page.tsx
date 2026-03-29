'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { VERSION } from '@/lib/version'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { AdminHeader } from '@/components/admin/AdminHeader'

interface Operator {
  id: string
  full_name: string
  phone: string
  code?: string
  is_active: boolean
  created_at: string
}

interface Manager {
  id: string
  full_name: string
  title: string
  phone: string
  is_primary: boolean
  is_active: boolean
  created_at: string
}

interface CallCenter {
  id: string
  name: string
  is_active: boolean
  created_at: string
  call_center_managers: Manager[]
  operators: Operator[]
}

export default function CallCentersAdminPage() {
  const { isAuthenticated, password, isLoading: authLoading, logout } = useAdminAuth()

  const [callCenters, setCallCenters] = useState<CallCenter[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // Expanded call center
  const [expandedCenter, setExpandedCenter] = useState<string | null>(null)

  // Add Call Center Modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({
    name: '',
    manager_name: '',
    manager_phone: '',
    manager_password: ''
  })

  // Confirm dialog
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmDialogData, setConfirmDialogData] = useState<{
    title: string
    message: string
    onConfirm: () => void
  } | null>(null)

  // Edit manager
  const [editingManager, setEditingManager] = useState<Manager | null>(null)
  const [editManagerForm, setEditManagerForm] = useState({ full_name: '', phone: '', title: '', password: '' })

  // Add manager
  const [addManagerCenterId, setAddManagerCenterId] = useState<string | null>(null)
  const [addManagerForm, setAddManagerForm] = useState({ full_name: '', phone: '', title: 'מנהל מוקד', password: '' })

  // Add operator
  const [addOperatorCenterId, setAddOperatorCenterId] = useState<string | null>(null)
  const [addOperatorForm, setAddOperatorForm] = useState({ full_name: '', phone: '' })

  useEffect(() => {
    if (isAuthenticated) {
      fetchCallCenters()
    }
  }, [isAuthenticated])

  const fetchCallCenters = async () => {
    try {
      const response = await fetch('/api/admin/call-centers')
      if (response.ok) {
        const data = await response.json()
        setCallCenters(data.callCenters || [])
      }
    } catch (err) {
      console.error('Error fetching call centers:', err)
      toast.error('שגיאה בטעינת מוקדים')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCallCenter = async () => {
    if (!addForm.name || !addForm.manager_name || !addForm.manager_phone || !addForm.manager_password) {
      toast.error('יש למלא את כל השדות')
      return
    }

    setActionLoading(true)
    try {
      const response = await fetch('/api/admin/call-centers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm)
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'שגיאה ביצירת מוקד')
      }

      await fetchCallCenters()
      setShowAddModal(false)
      setAddForm({ name: '', manager_name: '', manager_phone: '', manager_password: '' })
      toast.success('המוקד נוצר בהצלחה!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'שגיאה ביצירת מוקד')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteCallCenter = async (center: CallCenter) => {
    setConfirmDialogData({
      title: 'מחיקת מוקד',
      message: `האם למחוק את מוקד "${center.name}"? פעולה זו תמחק גם את כל המנהלים והמוקדנים!`,
      onConfirm: async () => {
        setShowConfirmDialog(false)
        setConfirmDialogData(null)
        setActionLoading(true)
        try {
          const response = await fetch(`/api/admin/call-centers/${center.id}`, {
            method: 'DELETE'
          })
          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || 'שגיאה במחיקת מוקד')
          }

          await fetchCallCenters()
          toast.success('המוקד נמחק!')
        } catch (err: unknown) {
          toast.error(err instanceof Error ? err.message : 'שגיאה במחיקת מוקד')
        } finally {
          setActionLoading(false)
        }
      }
    })
    setShowConfirmDialog(true)
  }

  const handleToggleActive = async (center: CallCenter) => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/call-centers/${center.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !center.is_active })
      })

      if (!response.ok) throw new Error('שגיאה בעדכון')

      await fetchCallCenters()
      toast.success(center.is_active ? `מוקד ${center.name} הושבת` : `מוקד ${center.name} הופעל`)
    } catch {
      toast.error('שגיאה בעדכון סטטוס')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSaveManager = async () => {
    if (!editingManager) return
    setActionLoading(true)
    try {
      const response = await fetch(`/api/call-center/managers/${editingManager.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editManagerForm)
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'שגיאה בעדכון')
      await fetchCallCenters()
      setEditingManager(null)
      toast.success('המנהל עודכן בהצלחה!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'שגיאה בעדכון')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteManager = (manager: Manager) => {
    setConfirmDialogData({
      title: 'מחיקת מנהל',
      message: `האם למחוק את "${manager.full_name}"?`,
      onConfirm: async () => {
        setShowConfirmDialog(false)
        setConfirmDialogData(null)
        setActionLoading(true)
        try {
          const response = await fetch(`/api/call-center/managers/${manager.id}`, { method: 'DELETE' })
          const data = await response.json()
          if (!response.ok) throw new Error(data.error || 'שגיאה במחיקה')
          await fetchCallCenters()
          toast.success('המנהל נמחק!')
        } catch (err: unknown) {
          toast.error(err instanceof Error ? err.message : 'שגיאה במחיקה')
        } finally {
          setActionLoading(false)
        }
      }
    })
    setShowConfirmDialog(true)
  }

  const handleSaveAddManager = async () => {
    if (!addManagerCenterId || !addManagerForm.full_name || !addManagerForm.phone || !addManagerForm.password) {
      toast.error('יש למלא שם, טלפון וסיסמה')
      return
    }
    setActionLoading(true)
    try {
      const response = await fetch('/api/call-center/managers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ call_center_id: addManagerCenterId, ...addManagerForm })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'שגיאה בהוספה')
      await fetchCallCenters()
      setAddManagerCenterId(null)
      setAddManagerForm({ full_name: '', phone: '', title: 'מנהל מוקד', password: '' })
      toast.success('המנהל נוסף בהצלחה!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'שגיאה בהוספה')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSaveAddOperator = async () => {
    if (!addOperatorCenterId || !addOperatorForm.full_name || !addOperatorForm.phone) {
      toast.error('יש למלא שם וטלפון')
      return
    }
    setActionLoading(true)
    try {
      const response = await fetch('/api/call-center/operators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ call_center_id: addOperatorCenterId, ...addOperatorForm })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'שגיאה בהוספה')
      await fetchCallCenters()
      setAddOperatorCenterId(null)
      setAddOperatorForm({ full_name: '', phone: '' })
      toast.success(`המוקדן נוסף! קוד: ${data.operator?.code}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'שגיאה בהוספה')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteOperator = (operator: Operator) => {
    setConfirmDialogData({
      title: 'מחיקת מוקדן',
      message: `האם למחוק את "${operator.full_name}"?`,
      onConfirm: async () => {
        setShowConfirmDialog(false)
        setConfirmDialogData(null)
        setActionLoading(true)
        try {
          const response = await fetch(`/api/call-center/operators/${operator.id}`, { method: 'DELETE' })
          const data = await response.json()
          if (!response.ok) throw new Error(data.error || 'שגיאה במחיקה')
          await fetchCallCenters()
          toast.success('המוקדן נמחק!')
        } catch (err: unknown) {
          toast.error(err instanceof Error ? err.message : 'שגיאה במחיקה')
        } finally {
          setActionLoading(false)
        }
      }
    })
    setShowConfirmDialog(true)
  }

  // Stats
  const totalManagers = callCenters.reduce((sum, c) => sum + (c.call_center_managers?.length || 0), 0)
  const totalOperators = callCenters.reduce((sum, c) => sum + (c.operators?.length || 0), 0)

  // Show loading while checking auth
  if (authLoading || !isAuthenticated) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}>🎧</div>
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
            width: 100% !important;
          }
          .header-buttons-responsive a,
          .header-buttons-responsive button {
            padding: 8px 10px !important;
            font-size: 0.75rem !important;
            white-space: nowrap !important;
          }
          .stats-row-responsive {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 8px !important;
            margin-top: -30px !important;
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
            grid-template-columns: 1fr 1fr 1fr !important;
            gap: 6px !important;
          }
        }
      `}</style>

      <AdminHeader
        title="ניהול מוקדים"
        subtitle="סניפים, מנהלים ומוקדנים"
        icon="🎧"
        iconBg="linear-gradient(135deg, #8b5cf6, #7c3aed)"
        onLogout={logout}
      />

      {/* Stats Row */}
      <div style={styles.statsRow} className="stats-row-responsive">
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'}}>🎧</div>
          <div>
            <div style={styles.statLabel}>מוקדים</div>
            <div style={{...styles.statValue, color: '#8b5cf6'}}>{callCenters.length}</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'}}>👔</div>
          <div>
            <div style={styles.statLabel}>מנהלים</div>
            <div style={{...styles.statValue, color: '#3b82f6'}}>{totalManagers}</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'}}>👤</div>
          <div>
            <div style={styles.statLabel}>מוקדנים</div>
            <div style={{...styles.statValue, color: '#22c55e'}}>{totalOperators}</div>
          </div>
        </div>
      </div>

      <div style={styles.container}>
        {/* Call Centers Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionTitle}>
              <div style={styles.sectionTitleIcon}>🎧</div>
              רשימת מוקדים
            </div>
            <button style={styles.btnPrimary} onClick={() => setShowAddModal(true)}>
              + מוקד חדש
            </button>
          </div>

          <div style={styles.sectionContent}>
            {loading ? (
              <div style={styles.loading}>טוען...</div>
            ) : callCenters.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyStateIcon}>🎧</div>
                <div>אין מוקדים עדיין</div>
                <button style={styles.btnPrimary} onClick={() => setShowAddModal(true)}>
                  צור מוקד ראשון
                </button>
              </div>
            ) : (
              <div style={styles.callCentersGrid}>
                {callCenters.map(center => {
                  const isExpanded = expandedCenter === center.id
                  const primaryManager = center.call_center_managers?.find(m => m.is_primary)

                  return (
                    <div
                      key={center.id}
                      style={{
                        ...styles.centerCard,
                        borderColor: isExpanded ? '#8b5cf6' : '#334155',
                        boxShadow: isExpanded ? '0 10px 30px rgba(139, 92, 246, 0.15)' : 'none'
                      }}
                    >
                      <div
                        style={styles.centerHeader}
                        onClick={() => setExpandedCenter(isExpanded ? null : center.id)}
                      >
                        <div style={styles.centerColorOrb}>
                          <span style={{color: 'white', fontSize: '1.3rem'}}>🎧</span>
                        </div>
                        <div style={styles.centerInfo}>
                          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <div style={styles.centerName}>{center.name}</div>
                            <div style={{
                              ...styles.statusDot,
                              background: center.is_active ? '#22c55e' : '#f59e0b'
                            }} />
                          </div>
                          <div style={styles.centerMeta}>
                            <span>👔 {center.call_center_managers?.length || 0} מנהלים</span>
                            <span>👤 {center.operators?.length || 0} מוקדנים</span>
                          </div>
                        </div>
                        <span style={{...styles.expandIcon, transform: isExpanded ? 'rotate(180deg)' : 'none'}}>▼</span>
                      </div>

                      {isExpanded && (
                        <div style={styles.centerExpanded}>
                          {/* Managers */}
                          <div style={styles.listSection}>
                            <div style={{...styles.listTitle, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                              <span>👔 מנהלים ({center.call_center_managers?.length || 0})</span>
                              <button
                                style={{...styles.btnCompact, background: '#3b82f6', color: '#fff', border: 'none', fontSize: '0.75rem', padding: '4px 10px'}}
                                onClick={() => { setAddManagerCenterId(center.id); setAddManagerForm({ full_name: '', phone: '', title: 'מנהל מוקד', password: '' }) }}
                              >+ הוסף מנהל</button>
                            </div>
                            {center.call_center_managers?.map(manager => (
                              <div key={manager.id} style={{...styles.listItem, alignItems: 'center'}}>
                                <span style={{flex: 1}}>{manager.full_name} {manager.is_primary && <span style={{color: '#f59e0b', fontSize: '0.75rem'}}>★ ראשי</span>}</span>
                                <span style={{color: '#64748b', fontSize: '0.85rem'}}>{manager.phone}</span>
                                <span style={{color: '#8b5cf6', fontSize: '0.78rem'}}>{manager.title}</span>
                                <button
                                  style={{background: '#334155', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '3px 8px', borderRadius: '5px', fontSize: '0.75rem'}}
                                  onClick={() => { setEditingManager(manager); setEditManagerForm({ full_name: manager.full_name, phone: manager.phone, title: manager.title || '', password: '' }) }}
                                >✏️</button>
                                <button
                                  style={{background: '#450a0a', border: 'none', color: '#f87171', cursor: 'pointer', padding: '3px 8px', borderRadius: '5px', fontSize: '0.75rem'}}
                                  onClick={() => handleDeleteManager(manager)}
                                >🗑️</button>
                              </div>
                            ))}
                          </div>

                          {/* Operators */}
                          <div style={styles.listSection}>
                            <div style={{...styles.listTitle, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                              <span>👤 מוקדנים ({center.operators?.length || 0})</span>
                              <button
                                style={{...styles.btnCompact, background: '#22c55e', color: '#fff', border: 'none', fontSize: '0.75rem', padding: '4px 10px'}}
                                onClick={() => { setAddOperatorCenterId(center.id); setAddOperatorForm({ full_name: '', phone: '' }) }}
                              >+ הוסף מוקדן</button>
                            </div>
                            {center.operators?.map(operator => (
                              <div key={operator.id} style={{...styles.listItem, alignItems: 'center'}}>
                                <span style={{flex: 1}}>{operator.full_name}</span>
                                <span style={{color: '#64748b', fontSize: '0.85rem'}}>{operator.phone}</span>
                                <span style={{color: operator.is_active ? '#22c55e' : '#f59e0b', fontSize: '0.78rem'}}>
                                  {operator.is_active ? 'פעיל' : 'לא פעיל'}
                                </span>
                                <button
                                  style={{background: '#450a0a', border: 'none', color: '#f87171', cursor: 'pointer', padding: '3px 8px', borderRadius: '5px', fontSize: '0.75rem'}}
                                  onClick={() => handleDeleteOperator(operator)}
                                >🗑️</button>
                              </div>
                            ))}
                          </div>

                          {/* Actions */}
                          <div style={styles.centerActions}>
                            <button
                              style={{...styles.btnCompact, ...styles.btnCompactToggle}}
                              onClick={() => handleToggleActive(center)}
                              disabled={actionLoading}
                            >
                              {center.is_active ? '🔴 השבת' : '🟢 הפעל'}
                            </button>
                            <button
                              style={{...styles.btnCompact, ...styles.btnCompactDelete}}
                              onClick={() => handleDeleteCallCenter(center)}
                              disabled={actionLoading}
                            >
                              🗑️ מחק
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Call Center Modal */}
      {showAddModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>➕ מוקד חדש</h3>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>שם המוקד *</label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={e => setAddForm({...addForm, name: e.target.value})}
                  style={styles.formInput}
                  placeholder="לדוגמה: מוקד מרכז"
                />
              </div>

              <div style={styles.formDivider}>פרטי מנהל ראשי</div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>שם מלא *</label>
                <input
                  type="text"
                  value={addForm.manager_name}
                  onChange={e => setAddForm({...addForm, manager_name: e.target.value})}
                  style={styles.formInput}
                  placeholder="ישראל ישראלי"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>שם משתמש *</label>
                <input
                  type="text"
                  value={addForm.manager_phone}
                  onChange={e => setAddForm({...addForm, manager_phone: e.target.value})}
                  style={styles.formInput}
                  placeholder="שם משתמש לכניסה"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>סיסמה *</label>
                <input
                  type="text"
                  value={addForm.manager_password}
                  onChange={e => setAddForm({...addForm, manager_password: e.target.value})}
                  style={styles.formInput}
                  placeholder="סיסמה לכניסה למערכת"
                />
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.btnCancel} onClick={() => setShowAddModal(false)}>
                ביטול
              </button>
              <button
                style={styles.btnSubmit}
                onClick={handleAddCallCenter}
                disabled={actionLoading}
              >
                {actionLoading ? 'יוצר...' : 'צור מוקד'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
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

      {/* Edit Manager Modal */}
      {editingManager && (
        <div style={styles.modalOverlay} onClick={() => setEditingManager(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>✏️ עריכת מנהל</h3>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>שם מלא</label>
                <input type="text" value={editManagerForm.full_name} onChange={e => setEditManagerForm({...editManagerForm, full_name: e.target.value})} style={styles.formInput} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>טלפון / שם משתמש</label>
                <input type="text" value={editManagerForm.phone} onChange={e => setEditManagerForm({...editManagerForm, phone: e.target.value})} style={styles.formInput} dir="ltr" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>תואר</label>
                <input type="text" value={editManagerForm.title} onChange={e => setEditManagerForm({...editManagerForm, title: e.target.value})} style={styles.formInput} placeholder="מנהל מוקד" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>סיסמה חדשה (השאר ריק לאי-שינוי)</label>
                <input type="text" value={editManagerForm.password} onChange={e => setEditManagerForm({...editManagerForm, password: e.target.value})} style={styles.formInput} placeholder="••••••" />
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.btnCancel} onClick={() => setEditingManager(null)}>ביטול</button>
              <button style={styles.btnSubmit} onClick={handleSaveManager} disabled={actionLoading}>
                {actionLoading ? 'שומר...' : 'שמור'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Manager Modal */}
      {addManagerCenterId && (
        <div style={styles.modalOverlay} onClick={() => setAddManagerCenterId(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>➕ הוספת מנהל</h3>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>שם מלא *</label>
                <input type="text" value={addManagerForm.full_name} onChange={e => setAddManagerForm({...addManagerForm, full_name: e.target.value})} style={styles.formInput} placeholder="ישראל ישראלי" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>טלפון / שם משתמש *</label>
                <input type="text" value={addManagerForm.phone} onChange={e => setAddManagerForm({...addManagerForm, phone: e.target.value})} style={styles.formInput} dir="ltr" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>תואר</label>
                <input type="text" value={addManagerForm.title} onChange={e => setAddManagerForm({...addManagerForm, title: e.target.value})} style={styles.formInput} placeholder="מנהל מוקד" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>סיסמה *</label>
                <input type="text" value={addManagerForm.password} onChange={e => setAddManagerForm({...addManagerForm, password: e.target.value})} style={styles.formInput} />
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.btnCancel} onClick={() => setAddManagerCenterId(null)}>ביטול</button>
              <button style={styles.btnSubmit} onClick={handleSaveAddManager} disabled={actionLoading}>
                {actionLoading ? 'מוסיף...' : 'הוסף מנהל'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Operator Modal */}
      {addOperatorCenterId && (
        <div style={styles.modalOverlay} onClick={() => setAddOperatorCenterId(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>➕ הוספת מוקדן</h3>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>שם מלא *</label>
                <input type="text" value={addOperatorForm.full_name} onChange={e => setAddOperatorForm({...addOperatorForm, full_name: e.target.value})} style={styles.formInput} placeholder="ישראל ישראלי" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>טלפון *</label>
                <input type="tel" value={addOperatorForm.phone} onChange={e => setAddOperatorForm({...addOperatorForm, phone: e.target.value})} style={styles.formInput} dir="ltr" placeholder="050-0000000" />
              </div>
              <p style={{fontSize: '0.8rem', color: '#64748b', margin: '8px 0 0'}}>
                קוד כניסה ייווצר אוטומטית ויוצג לאחר ההוספה
              </p>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.btnCancel} onClick={() => setAddOperatorCenterId(null)}>ביטול</button>
              <button style={styles.btnSubmit} onClick={handleSaveAddOperator} disabled={actionLoading}>
                {actionLoading ? 'מוסיף...' : 'הוסף מוקדן'}
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

const styles: { [key: string]: React.CSSProperties } = {
  pageWrapper: {
    background: '#0f172a',
    minHeight: '100vh',
    color: '#e2e8f0',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    direction: 'rtl',
    overflowX: 'hidden',
  },
  header: {
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)',
    borderBottom: '1px solid #8b5cf6',
    padding: '30px 30px 60px',
  },
  headerContent: {
    maxWidth: '1000px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.6rem',
    boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)',
  },
  headerTitle: {
    color: 'white',
    fontSize: '1.8rem',
    fontWeight: 800,
    margin: 0,
  },
  headerSubtitle: {
    color: '#64748b',
    fontSize: '0.95rem',
    margin: 0,
  },
  headerButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  btnLogout: {
    padding: '10px 20px',
    borderRadius: '10px',
    border: '1px solid #dc2626',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.9rem',
    background: 'transparent',
    color: '#f87171',
  },
  btnGhost: {
    padding: '10px 20px',
    borderRadius: '10px',
    border: '1px solid #334155',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.9rem',
    background: 'transparent',
    color: '#94a3b8',
    textDecoration: 'none',
  },
  btnPrimary: {
    padding: '10px 16px',
    borderRadius: '12px',
    border: 'none',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.85rem',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    color: 'white',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    margin: '-40px auto 20px',
    maxWidth: '1000px',
    padding: '0 20px',
  },
  statCard: {
    background: 'linear-gradient(145deg, #1e293b 0%, #1a2234 100%)',
    border: '1px solid #334155',
    borderRadius: '14px',
    padding: '12px 14px',
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
  },
  statLabel: {
    color: '#64748b',
    fontSize: '0.7rem',
    marginBottom: '2px',
  },
  statValue: {
    fontSize: '1.3rem',
    fontWeight: 800,
    lineHeight: 1,
  },
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '30px 20px',
  },
  section: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '24px',
    overflow: 'hidden',
  },
  sectionHeader: {
    padding: '18px 24px',
    borderBottom: '1px solid #334155',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.05) 0%, transparent 100%)',
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
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
  },
  sectionContent: {
    padding: '20px 24px',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#64748b',
  },
  emptyState: {
    textAlign: 'center',
    padding: '50px 20px',
    color: '#64748b',
  },
  emptyStateIcon: {
    fontSize: '3rem',
    marginBottom: '15px',
    opacity: 0.5,
  },
  callCentersGrid: {
    display: 'grid',
    gap: '16px',
  },
  centerCard: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '16px',
    overflow: 'hidden',
    transition: 'all 0.3s',
  },
  centerHeader: {
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    cursor: 'pointer',
  },
  centerColorOrb: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerInfo: {
    flex: 1,
  },
  centerName: {
    fontWeight: 700,
    color: 'white',
    fontSize: '1rem',
  },
  centerMeta: {
    display: 'flex',
    gap: '12px',
    fontSize: '0.8rem',
    color: '#64748b',
    marginTop: '4px',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  expandIcon: {
    color: '#64748b',
    fontSize: '0.9rem',
    transition: 'transform 0.3s',
  },
  centerExpanded: {
    padding: '16px',
    borderTop: '1px solid #334155',
    background: 'rgba(0, 0, 0, 0.2)',
  },
  primaryManagerBox: {
    background: 'rgba(139, 92, 246, 0.1)',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    borderRadius: '10px',
    padding: '12px',
    marginBottom: '16px',
  },
  primaryManagerLabel: {
    color: '#8b5cf6',
    fontSize: '0.8rem',
    marginBottom: '4px',
  },
  primaryManagerInfo: {
    color: 'white',
  },
  listSection: {
    marginBottom: '16px',
  },
  listTitle: {
    color: '#64748b',
    fontSize: '0.85rem',
    marginBottom: '8px',
  },
  listItem: {
    display: 'flex',
    gap: '12px',
    padding: '8px 10px',
    background: '#1e293b',
    borderRadius: '8px',
    marginBottom: '6px',
    fontSize: '0.9rem',
    color: 'white',
    alignItems: 'center',
  },
  centerActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #334155',
  },
  btnCompact: {
    padding: '8px 14px',
    fontSize: '0.8rem',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
  },
  btnCompactToggle: {
    background: 'rgba(245, 158, 11, 0.15)',
    color: '#f59e0b',
  },
  btnCompactDelete: {
    background: 'rgba(239, 68, 68, 0.15)',
    color: '#ef4444',
  },
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
    maxWidth: '450px',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalHeader: {
    padding: '20px 24px 16px',
    borderBottom: '1px solid #334155',
  },
  modalTitle: {
    fontSize: '1.2rem',
    fontWeight: 800,
    color: '#8b5cf6',
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
    boxSizing: 'border-box',
  },
  formDivider: {
    color: '#8b5cf6',
    fontSize: '0.9rem',
    fontWeight: 600,
    marginBottom: '16px',
    paddingBottom: '8px',
    borderBottom: '1px dashed #334155',
  },
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
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    color: 'white',
    border: 'none',
    padding: '12px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.95rem',
  },
  confirmDialog: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '20px',
    padding: '25px',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
  },
  confirmTitle: {
    fontSize: '1.2rem',
    fontWeight: 800,
    color: '#ef4444',
    margin: '0 0 15px 0',
  },
  confirmMessage: {
    color: '#94a3b8',
    fontSize: '0.95rem',
    margin: '0 0 25px 0',
    lineHeight: 1.6,
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
