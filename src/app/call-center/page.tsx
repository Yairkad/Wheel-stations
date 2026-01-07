'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface Manager {
  id: string
  full_name: string
  title: string
  phone: string
  is_primary: boolean
  call_center_id: string
  call_center_name: string
}

interface Operator {
  id: string
  full_name: string
  phone: string
  code: string
  is_active: boolean
  created_at: string
}

interface ManagerData {
  id: string
  full_name: string
  title: string
  phone: string
  is_primary: boolean
  is_active: boolean
}

interface HistoryItem {
  id: string
  created_at: string
  operator_name: string
  station_name: string
  borrower_name?: string | null
  borrower_phone?: string | null
}

export default function CallCenterPage() {
  const [manager, setManager] = useState<Manager | null>(null)
  const [activeTab, setActiveTab] = useState<'operators' | 'managers' | 'history'>('operators')
  const [loading, setLoading] = useState(true)

  // Data
  const [operators, setOperators] = useState<Operator[]>([])
  const [managers, setManagers] = useState<ManagerData[]>([])
  const [history, setHistory] = useState<HistoryItem[]>([])

  // Modals
  const [showAddOperator, setShowAddOperator] = useState(false)
  const [showAddManager, setShowAddManager] = useState(false)
  const [showEditOperator, setShowEditOperator] = useState<Operator | null>(null)
  const [addOperatorForm, setAddOperatorForm] = useState({ full_name: '', phone: '' })
  const [editOperatorForm, setEditOperatorForm] = useState({ full_name: '', phone: '' })
  const [addManagerForm, setAddManagerForm] = useState({ full_name: '', phone: '', password: '', title: '' })
  const [actionLoading, setActionLoading] = useState(false)

  // Dropdown menu
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  // Confirm dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string
    message: string
    onConfirm: () => void
  } | null>(null)

  // Check session on load
  useEffect(() => {
    const saved = localStorage.getItem('call_center_session')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        if (data.expiry && new Date().getTime() < data.expiry && data.role === 'manager') {
          setManager(data.user)
        } else {
          localStorage.removeItem('call_center_session')
          window.location.href = '/operator'
        }
      } catch {
        window.location.href = '/operator'
      }
    } else {
      window.location.href = '/operator'
    }
  }, [])

  // Fetch data when manager is set
  useEffect(() => {
    if (manager) {
      fetchOperators()
      fetchManagers()
      fetchHistory()
    }
  }, [manager])

  const fetchOperators = async () => {
    if (!manager) return
    try {
      const res = await fetch(`/api/call-center/operators?call_center_id=${manager.call_center_id}`)
      const data = await res.json()
      setOperators(data.operators || [])
    } catch (err) {
      console.error('Error fetching operators:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchManagers = async () => {
    if (!manager) return
    try {
      const res = await fetch(`/api/call-center/managers?call_center_id=${manager.call_center_id}`)
      const data = await res.json()
      setManagers(data.managers || [])
    } catch (err) {
      console.error('Error fetching managers:', err)
    }
  }

  const fetchHistory = async () => {
    if (!manager) return
    try {
      const res = await fetch(`/api/call-center/history?call_center_id=${manager.call_center_id}`)
      const data = await res.json()
      setHistory(data.history || [])
    } catch (err) {
      console.error('Error fetching history:', err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('call_center_session')
    window.location.href = '/operator'
  }

  // Navigate to operator page while keeping manager session
  const handleWorkAsOperator = () => {
    if (!manager) return

    // Create an operator session from manager data
    const expiry = new Date().getTime() + (12 * 60 * 60 * 1000) // 12 hours
    localStorage.setItem('operator_session', JSON.stringify({
      operator: {
        id: manager.id,
        full_name: manager.full_name,
        phone: manager.phone,
        call_center_id: manager.call_center_id,
        call_center_name: manager.call_center_name,
      },
      expiry,
      is_manager: true // Flag to show "back to management" button
    }))

    window.location.href = '/operator'
  }

  const handleAddOperator = async () => {
    if (!addOperatorForm.full_name || !addOperatorForm.phone) {
      toast.error('יש למלא שם וטלפון')
      return
    }

    setActionLoading(true)
    try {
      const res = await fetch('/api/call-center/operators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          call_center_id: manager?.call_center_id,
          ...addOperatorForm
        })
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      await fetchOperators()
      setShowAddOperator(false)
      setAddOperatorForm({ full_name: '', phone: '' })
      toast.success(`המוקדן נוסף! קוד כניסה: ${data.operator.code}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'שגיאה בהוספת מוקדן')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteOperator = (op: Operator) => {
    setConfirmDialog({
      title: 'מחיקת מוקדן',
      message: `האם למחוק את ${op.full_name}?`,
      onConfirm: async () => {
        setConfirmDialog(null)
        try {
          const res = await fetch(`/api/call-center/operators/${op.id}`, { method: 'DELETE' })
          if (!res.ok) throw new Error('שגיאה במחיקה')
          await fetchOperators()
          toast.success('המוקדן נמחק')
        } catch {
          toast.error('שגיאה במחיקה')
        }
      }
    })
  }

  const handleRegenerateCode = async (op: Operator) => {
    try {
      const res = await fetch(`/api/call-center/operators/${op.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regenerate_code: true })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      await fetchOperators()
      toast.success(`קוד חדש: ${data.operator.code}`)
    } catch {
      toast.error('שגיאה ביצירת קוד חדש')
    }
  }

  const handleToggleActive = async (op: Operator) => {
    try {
      const res = await fetch(`/api/call-center/operators/${op.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !op.is_active })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      await fetchOperators()
      toast.success(op.is_active ? 'המוקדן חסום' : 'המוקדן הופעל')
    } catch {
      toast.error('שגיאה בעדכון סטטוס')
    }
    setOpenMenuId(null)
  }

  const openEditOperator = (op: Operator) => {
    setEditOperatorForm({ full_name: op.full_name, phone: op.phone })
    setShowEditOperator(op)
    setOpenMenuId(null)
  }

  const handleEditOperator = async () => {
    if (!showEditOperator || !editOperatorForm.full_name || !editOperatorForm.phone) {
      toast.error('יש למלא שם ושם משתמש')
      return
    }

    setActionLoading(true)
    try {
      const res = await fetch(`/api/call-center/operators/${showEditOperator.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editOperatorForm)
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      await fetchOperators()
      setShowEditOperator(null)
      toast.success('המוקדן עודכן!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'שגיאה בעדכון מוקדן')
    } finally {
      setActionLoading(false)
    }
  }

  const handleAddManager = async () => {
    if (!addManagerForm.full_name || !addManagerForm.phone || !addManagerForm.password) {
      toast.error('יש למלא את כל השדות')
      return
    }

    setActionLoading(true)
    try {
      const res = await fetch('/api/call-center/managers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          call_center_id: manager?.call_center_id,
          ...addManagerForm
        })
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      await fetchManagers()
      setShowAddManager(false)
      setAddManagerForm({ full_name: '', phone: '', password: '', title: '' })
      toast.success('המנהל נוסף!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'שגיאה בהוספת מנהל')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteManager = (m: ManagerData) => {
    if (m.is_primary) {
      toast.error('לא ניתן למחוק מנהל ראשי')
      return
    }
    setConfirmDialog({
      title: 'מחיקת מנהל',
      message: `האם למחוק את ${m.full_name}?`,
      onConfirm: async () => {
        setConfirmDialog(null)
        try {
          const res = await fetch(`/api/call-center/managers/${m.id}`, { method: 'DELETE' })
          if (!res.ok) throw new Error('שגיאה במחיקה')
          await fetchManagers()
          toast.success('המנהל נמחק')
        } catch {
          toast.error('שגיאה במחיקה')
        }
      }
    })
  }

  if (!manager) {
    return (
      <div style={styles.loading}>טוען...</div>
    )
  }

  return (
    <div style={styles.pageWrapper}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLogo}>
            <div style={styles.logoIcon}>🎧</div>
            <div>
              <h1 style={styles.headerTitle}>{manager.call_center_name}</h1>
              <p style={styles.headerSubtitle}>{manager.title} - {manager.full_name}</p>
            </div>
          </div>
          <div style={styles.headerButtons}>
            <button style={styles.btnPrimary} onClick={handleWorkAsOperator}>🔍 חיפוש גלגלים</button>
            <button style={styles.btnLogout} onClick={handleLogout}>יציאה</button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'}}>👤</div>
          <div>
            <div style={styles.statLabel}>מוקדנים</div>
            <div style={{...styles.statValue, color: '#22c55e'}}>{operators.length}</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'}}>👔</div>
          <div>
            <div style={styles.statLabel}>מנהלים</div>
            <div style={{...styles.statValue, color: '#3b82f6'}}>{managers.length}</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'}}>📋</div>
          <div>
            <div style={styles.statLabel}>הפניות</div>
            <div style={{...styles.statValue, color: '#8b5cf6'}}>{history.length}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.container}>
        <div style={styles.tabs}>
          <button
            style={{...styles.tab, ...(activeTab === 'operators' ? styles.tabActive : {})}}
            onClick={() => setActiveTab('operators')}
          >
            👤 מוקדנים
          </button>
          {manager.is_primary && (
            <button
              style={{...styles.tab, ...(activeTab === 'managers' ? styles.tabActive : {})}}
              onClick={() => setActiveTab('managers')}
            >
              👔 מנהלים
            </button>
          )}
          <button
            style={{...styles.tab, ...(activeTab === 'history' ? styles.tabActive : {})}}
            onClick={() => setActiveTab('history')}
          >
            📋 היסטוריה
          </button>
        </div>

        {/* Content */}
        <div style={styles.section}>
          {/* Operators Tab */}
          {activeTab === 'operators' && (
            <>
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>רשימת מוקדנים</h3>
                <button style={styles.btnAdd} onClick={() => setShowAddOperator(true)}>+ הוסף מוקדן</button>
              </div>

              {loading ? (
                <div style={styles.loadingText}>טוען...</div>
              ) : operators.length === 0 ? (
                <div style={styles.emptyState}>אין מוקדנים עדיין</div>
              ) : (
                <div style={styles.list}>
                  {operators.map(op => (
                    <div key={op.id} style={{...styles.listItem, ...(op.is_active ? {} : styles.listItemBlocked)}}>
                      <div style={styles.listItemInfo}>
                        <div style={styles.listItemName}>
                          {op.full_name}
                          {!op.is_active && <span style={styles.blockedBadge}>חסום</span>}
                        </div>
                        <div style={styles.listItemMeta}>{op.phone}</div>
                      </div>
                      <div style={styles.codeBox}>
                        <span style={styles.codeLabel}>קוד:</span>
                        <span style={styles.codeValue}>{op.code}</span>
                      </div>
                      <div style={styles.menuWrapper}>
                        <button
                          style={styles.btnSettings}
                          onClick={() => setOpenMenuId(openMenuId === op.id ? null : op.id)}
                        >
                          ⚙️
                        </button>
                        {openMenuId === op.id && (
                          <div style={styles.dropdownMenu}>
                            <button style={styles.menuItem} onClick={() => openEditOperator(op)}>
                              ✏️ עריכה
                            </button>
                            <button style={styles.menuItem} onClick={() => { handleRegenerateCode(op); setOpenMenuId(null) }}>
                              🔄 קוד חדש
                            </button>
                            <button
                              style={{...styles.menuItem, color: op.is_active ? '#f59e0b' : '#22c55e'}}
                              onClick={() => handleToggleActive(op)}
                            >
                              {op.is_active ? '🚫 חסימה' : '✅ הפעלה'}
                            </button>
                            <button style={{...styles.menuItem, color: '#ef4444'}} onClick={() => { handleDeleteOperator(op); setOpenMenuId(null) }}>
                              🗑️ מחיקה
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Managers Tab */}
          {activeTab === 'managers' && manager.is_primary && (
            <>
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>רשימת מנהלים</h3>
                <button style={styles.btnAdd} onClick={() => setShowAddManager(true)}>+ הוסף מנהל</button>
              </div>

              <div style={styles.list}>
                {managers.map(m => (
                  <div key={m.id} style={styles.listItem}>
                    <div style={styles.listItemInfo}>
                      <div style={styles.listItemName}>
                        {m.full_name}
                        {m.is_primary && <span style={styles.primaryBadge}>ראשי</span>}
                      </div>
                      <div style={styles.listItemMeta}>{m.phone} • {m.title}</div>
                    </div>
                    {!m.is_primary && (
                      <button style={{...styles.btnAction, color: '#ef4444'}} onClick={() => handleDeleteManager(m)}>🗑️</button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <>
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>היסטוריית הפניות</h3>
              </div>

              {history.length === 0 ? (
                <div style={styles.emptyState}>אין הפניות עדיין</div>
              ) : (
                <div style={styles.list}>
                  {history.map(item => (
                    <div key={item.id} style={styles.historyItem}>
                      <div style={styles.historyDateTime}>
                        <div style={styles.historyDate}>
                          {new Date(item.created_at).toLocaleDateString('he-IL')}
                        </div>
                        <div style={styles.historyTime}>
                          {new Date(item.created_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div style={styles.historyMainInfo}>
                        <div style={styles.historyInfo}>
                          <span style={styles.historyOperator}>{item.operator_name}</span>
                          <span style={styles.historyArrow}>→</span>
                          <span style={styles.historyStation}>{item.station_name}</span>
                        </div>
                        {item.borrower_name && (
                          <div style={styles.historyBorrower}>
                            <span style={styles.historyBorrowerName}>👤 {item.borrower_name}</span>
                            {item.borrower_phone && (
                              <span style={styles.historyBorrowerPhone}>📞 {item.borrower_phone}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Operator Modal */}
      {showAddOperator && (
        <div style={styles.modalOverlay} onClick={() => setShowAddOperator(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>➕ הוספת מוקדן</h3>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>שם מלא</label>
              <input
                type="text"
                value={addOperatorForm.full_name}
                onChange={e => setAddOperatorForm({...addOperatorForm, full_name: e.target.value})}
                style={styles.formInput}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>שם משתמש</label>
              <input
                type="text"
                value={addOperatorForm.phone}
                onChange={e => setAddOperatorForm({...addOperatorForm, phone: e.target.value})}
                style={styles.formInput}
              />
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.btnCancel} onClick={() => setShowAddOperator(false)}>ביטול</button>
              <button style={styles.btnSubmit} onClick={handleAddOperator} disabled={actionLoading}>
                {actionLoading ? 'מוסיף...' : 'הוסף'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Operator Modal */}
      {showEditOperator && (
        <div style={styles.modalOverlay} onClick={() => setShowEditOperator(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>✏️ עריכת מוקדן</h3>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>שם מלא</label>
              <input
                type="text"
                value={editOperatorForm.full_name}
                onChange={e => setEditOperatorForm({...editOperatorForm, full_name: e.target.value})}
                style={styles.formInput}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>שם משתמש</label>
              <input
                type="text"
                value={editOperatorForm.phone}
                onChange={e => setEditOperatorForm({...editOperatorForm, phone: e.target.value})}
                style={styles.formInput}
              />
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.btnCancel} onClick={() => setShowEditOperator(null)}>ביטול</button>
              <button style={styles.btnSubmit} onClick={handleEditOperator} disabled={actionLoading}>
                {actionLoading ? 'שומר...' : 'שמור'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Manager Modal */}
      {showAddManager && (
        <div style={styles.modalOverlay} onClick={() => setShowAddManager(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>➕ הוספת מנהל</h3>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>שם מלא</label>
              <input
                type="text"
                value={addManagerForm.full_name}
                onChange={e => setAddManagerForm({...addManagerForm, full_name: e.target.value})}
                style={styles.formInput}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>שם משתמש</label>
              <input
                type="text"
                value={addManagerForm.phone}
                onChange={e => setAddManagerForm({...addManagerForm, phone: e.target.value})}
                style={styles.formInput}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>סיסמה</label>
              <input
                type="text"
                value={addManagerForm.password}
                onChange={e => setAddManagerForm({...addManagerForm, password: e.target.value})}
                style={styles.formInput}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>תפקיד (אופציונלי)</label>
              <input
                type="text"
                value={addManagerForm.title}
                onChange={e => setAddManagerForm({...addManagerForm, title: e.target.value})}
                style={styles.formInput}
                placeholder="סגן מנהל מוקד"
              />
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.btnCancel} onClick={() => setShowAddManager(false)}>ביטול</button>
              <button style={styles.btnSubmit} onClick={handleAddManager} disabled={actionLoading}>
                {actionLoading ? 'מוסיף...' : 'הוסף'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmDialog && (
        <div style={styles.modalOverlay} onClick={() => setConfirmDialog(null)}>
          <div style={styles.confirmDialog} onClick={e => e.stopPropagation()}>
            <h3 style={styles.confirmTitle}>{confirmDialog.title}</h3>
            <p style={styles.confirmMessage}>{confirmDialog.message}</p>
            <div style={styles.modalFooter}>
              <button style={styles.btnCancel} onClick={() => setConfirmDialog(null)}>ביטול</button>
              <button style={styles.btnDelete} onClick={confirmDialog.onConfirm}>מחק</button>
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
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#0f172a',
    color: '#64748b',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  header: {
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    borderBottom: '1px solid #8b5cf6',
    padding: '15px 20px',
  },
  headerContent: {
    maxWidth: '800px',
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
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
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
    color: '#8b5cf6',
    fontSize: '0.85rem',
    margin: 0,
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
  headerButtons: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  btnPrimary: {
    padding: '10px 20px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
    padding: '15px 20px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  statCard: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '12px',
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
  },
  statValue: {
    fontSize: '1.2rem',
    fontWeight: 700,
  },
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '0 20px 20px',
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '15px',
  },
  tab: {
    flex: 1,
    padding: '12px',
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '10px',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 500,
  },
  tabActive: {
    background: 'rgba(139, 92, 246, 0.2)',
    borderColor: '#8b5cf6',
    color: '#8b5cf6',
  },
  section: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '20px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  sectionTitle: {
    color: 'white',
    fontSize: '1rem',
    fontWeight: 600,
    margin: 0,
  },
  btnAdd: {
    padding: '8px 14px',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 500,
  },
  loadingText: {
    textAlign: 'center',
    color: '#64748b',
    padding: '30px',
  },
  emptyState: {
    textAlign: 'center',
    color: '#64748b',
    padding: '40px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  listItem: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '10px',
    padding: '12px 15px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  listItemInfo: {
    flex: 1,
  },
  listItemName: {
    color: 'white',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  listItemMeta: {
    color: '#64748b',
    fontSize: '0.85rem',
    marginTop: '2px',
  },
  codeBox: {
    background: 'rgba(139, 92, 246, 0.1)',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    borderRadius: '8px',
    padding: '6px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  codeLabel: {
    color: '#64748b',
    fontSize: '0.8rem',
  },
  codeValue: {
    color: '#8b5cf6',
    fontWeight: 700,
    fontFamily: 'monospace',
    fontSize: '1rem',
    letterSpacing: '2px',
  },
  listItemActions: {
    display: 'flex',
    gap: '6px',
  },
  menuWrapper: {
    position: 'relative',
  },
  btnSettings: {
    width: '36px',
    height: '36px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid #334155',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: '4px',
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '10px',
    padding: '6px',
    minWidth: '120px',
    zIndex: 100,
    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    padding: '10px 12px',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: '#e2e8f0',
    cursor: 'pointer',
    fontSize: '0.9rem',
    textAlign: 'right',
  },
  btnAction: {
    width: '32px',
    height: '32px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid #334155',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  primaryBadge: {
    background: 'rgba(34, 197, 94, 0.2)',
    color: '#22c55e',
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '0.7rem',
    fontWeight: 600,
  },
  blockedBadge: {
    background: 'rgba(239, 68, 68, 0.2)',
    color: '#ef4444',
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '0.7rem',
    fontWeight: 600,
  },
  listItemBlocked: {
    opacity: 0.6,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  historyItem: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '10px',
    padding: '12px 15px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '15px',
  },
  historyDateTime: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '70px',
  },
  historyDate: {
    color: '#94a3b8',
    fontSize: '0.8rem',
    fontWeight: 500,
  },
  historyTime: {
    color: '#64748b',
    fontSize: '0.75rem',
  },
  historyMainInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
  },
  historyInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  historyOperator: {
    color: '#8b5cf6',
    fontWeight: 500,
  },
  historyArrow: {
    color: '#64748b',
  },
  historyStation: {
    color: '#22c55e',
  },
  historyBorrower: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  historyBorrowerName: {
    color: '#e2e8f0',
    fontSize: '0.85rem',
  },
  historyBorrowerPhone: {
    color: '#60a5fa',
    fontSize: '0.85rem',
    direction: 'ltr',
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
    maxWidth: '400px',
    padding: '20px',
  },
  modalTitle: {
    color: '#8b5cf6',
    fontSize: '1.1rem',
    fontWeight: 700,
    margin: '0 0 20px 0',
  },
  formGroup: {
    marginBottom: '15px',
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
  modalFooter: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
  },
  btnCancel: {
    flex: 1,
    padding: '12px',
    background: '#334155',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 500,
  },
  btnSubmit: {
    flex: 1,
    padding: '12px',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 500,
  },
  confirmDialog: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '350px',
    padding: '20px',
    textAlign: 'center',
  },
  confirmTitle: {
    color: '#ef4444',
    fontSize: '1.1rem',
    fontWeight: 700,
    margin: '0 0 10px 0',
  },
  confirmMessage: {
    color: '#94a3b8',
    margin: '0 0 20px 0',
  },
  btnDelete: {
    flex: 1,
    padding: '12px',
    background: '#ef4444',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 500,
  },
}
