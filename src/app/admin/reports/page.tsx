'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { VERSION } from '@/lib/version'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { AdminHeader } from '@/components/admin/AdminHeader'

interface ErrorReport {
  id: string
  vehicle_model_id: string | null
  make: string | null
  model: string | null
  year_from: number | null
  image_url: string | null
  correct_bolt_count: number | null
  correct_bolt_spacing: number | null
  correct_center_bore: number | null
  correct_rim_size: string | null
  correct_tire_size: string | null
  notes: string | null
  status: 'pending' | 'reviewed' | 'fixed' | 'rejected'
  admin_notes: string | null
  created_at: string
}

interface MissingVehicleReport {
  id: string
  plate_number: string
  notes: string | null
  status: 'pending' | 'reviewed' | 'added' | 'rejected'
  created_at: string
  updated_at: string | null
}

export default function ErrorReportsPage() {
  const { isAuthenticated, password, isLoading: authLoading, logout } = useAdminAuth()

  const [reports, setReports] = useState<ErrorReport[]>([])
  const [missingReports, setMissingReports] = useState<MissingVehicleReport[]>([])
  const [loading, setLoading] = useState(true)
  const [missingLoading, setMissingLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // Filter
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [missingStatusFilter, setMissingStatusFilter] = useState<string>('all')

  // Selected report for viewing
  const [selectedReport, setSelectedReport] = useState<ErrorReport | null>(null)
  const [selectedMissingReport, setSelectedMissingReport] = useState<MissingVehicleReport | null>(null)
  const [adminNotes, setAdminNotes] = useState('')

  // Confirm dialog
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmDialogData, setConfirmDialogData] = useState<{
    title: string
    message: string
    onConfirm: () => void
  } | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      fetchReports()
      fetchMissingReports()
    }
  }, [isAuthenticated])

  // Close modals on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedReport) setSelectedReport(null)
        if (selectedMissingReport) setSelectedMissingReport(null)
        if (showConfirmDialog) setShowConfirmDialog(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [selectedReport, selectedMissingReport, showConfirmDialog])

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/error-reports')
      if (response.ok) {
        const data = await response.json()
        setReports(data.reports || [])
      }
    } catch (err) {
      console.error('Error fetching reports:', err)
      toast.error('שגיאה בטעינת דיווחי שגיאות')
    } finally {
      setLoading(false)
    }
  }

  const fetchMissingReports = async () => {
    try {
      const response = await fetch('/api/missing-vehicle-reports')
      if (response.ok) {
        const data = await response.json()
        setMissingReports(data.reports || [])
      }
    } catch (err) {
      console.error('Error fetching missing reports:', err)
      toast.error('שגיאה בטעינת דיווחי רכבים חסרים')
    } finally {
      setMissingLoading(false)
    }
  }

  const updateReportStatus = async (reportId: string, status: string) => {
    if (actionLoading) return
    setActionLoading(true)
    try {
      const response = await fetch(`/api/error-reports/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, admin_notes: adminNotes })
      })
      const result = await response.json()
      if (response.ok && result.success) {
        await fetchReports()
        setSelectedReport(null)
        toast.success('הסטטוס עודכן בהצלחה')
      } else {
        toast.error(result.error || 'שגיאה בעדכון סטטוס')
      }
    } catch (err) {
      toast.error('שגיאה בעדכון סטטוס')
    } finally {
      setActionLoading(false)
    }
  }

  const deleteReport = async (reportId: string) => {
    setConfirmDialogData({
      title: 'מחיקת דיווח',
      message: 'האם למחוק את הדיווח? פעולה זו לא ניתנת לביטול.',
      onConfirm: async () => {
        setShowConfirmDialog(false)
        setConfirmDialogData(null)
        setActionLoading(true)
        try {
          const response = await fetch(`/api/error-reports/${reportId}`, {
            method: 'DELETE'
          })
          if (response.ok) {
            await fetchReports()
            setSelectedReport(null)
            toast.success('הדיווח נמחק')
          } else {
            throw new Error('Failed to delete')
          }
        } catch (err) {
          toast.error('שגיאה במחיקת דיווח')
        } finally {
          setActionLoading(false)
        }
      }
    })
    setShowConfirmDialog(true)
  }

  const openReportModal = (report: ErrorReport) => {
    setSelectedReport(report)
    setAdminNotes(report.admin_notes || '')
  }

  // Missing Vehicle Report functions
  const updateMissingReportStatus = async (reportId: string, status: string) => {
    if (actionLoading) return
    setActionLoading(true)
    try {
      const response = await fetch(`/api/missing-vehicle-reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      const result = await response.json()
      if (response.ok && result.success) {
        await fetchMissingReports()
        setSelectedMissingReport(null)
        toast.success('הסטטוס עודכן בהצלחה')
      } else {
        toast.error(result.error || 'שגיאה בעדכון סטטוס')
      }
    } catch (err) {
      toast.error('שגיאה בעדכון סטטוס')
    } finally {
      setActionLoading(false)
    }
  }

  const deleteMissingReport = async (reportId: string) => {
    setConfirmDialogData({
      title: 'מחיקת דיווח',
      message: 'האם למחוק את הדיווח? פעולה זו לא ניתנת לביטול.',
      onConfirm: async () => {
        setShowConfirmDialog(false)
        setConfirmDialogData(null)
        setActionLoading(true)
        try {
          const response = await fetch(`/api/missing-vehicle-reports/${reportId}`, {
            method: 'DELETE'
          })
          if (response.ok) {
            await fetchMissingReports()
            setSelectedMissingReport(null)
            toast.success('הדיווח נמחק')
          } else {
            throw new Error('Failed to delete')
          }
        } catch (err) {
          toast.error('שגיאה במחיקת דיווח')
        } finally {
          setActionLoading(false)
        }
      }
    })
    setShowConfirmDialog(true)
  }

  const openMissingReportModal = (report: MissingVehicleReport) => {
    setSelectedMissingReport(report)
  }

  const getMissingStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'ממתין לטיפול'
      case 'reviewed': return 'נבדק'
      case 'added': return 'נוסף למאגר'
      case 'rejected': return 'נדחה'
      default: return status
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'ממתין לטיפול'
      case 'reviewed': return 'נבדק'
      case 'fixed': return 'תוקן'
      case 'rejected': return 'נדחה'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b'
      case 'reviewed': return '#3b82f6'
      case 'fixed': return '#22c55e'
      case 'rejected': return '#ef4444'
      default: return '#64748b'
    }
  }

  // Filter reports
  const filteredReports = statusFilter === 'all'
    ? reports
    : reports.filter(r => r.status === statusFilter)

  const filteredMissingReports = missingStatusFilter === 'all'
    ? missingReports
    : missingReports.filter(r => r.status === missingStatusFilter)

  // Stats - Error Reports
  const pendingCount = reports.filter(r => r.status === 'pending').length
  const reviewedCount = reports.filter(r => r.status === 'reviewed').length
  const fixedCount = reports.filter(r => r.status === 'fixed').length

  // Stats - Missing Vehicle Reports
  const missingPendingCount = missingReports.filter(r => r.status === 'pending').length
  const missingAddedCount = missingReports.filter(r => r.status === 'added').length

  // Show loading while checking auth
  if (authLoading || !isAuthenticated) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}>📋</div>
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
            gap: 10px !important;
            margin-top: -30px !important;
          }
          .stat-value-responsive {
            font-size: 1.2rem !important;
          }
          .section-header-responsive {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
          }
          .modal-responsive {
            max-width: 100% !important;
            margin: 10px !important;
            max-height: calc(100vh - 20px) !important;
          }
          .info-grid-responsive {
            grid-template-columns: 1fr !important;
          }
          .status-buttons-responsive {
            flex-direction: column !important;
          }
          .status-buttons-responsive button {
            width: 100% !important;
          }
          .modal-footer-responsive {
            flex-direction: column-reverse !important;
          }
          .modal-footer-responsive button {
            width: 100% !important;
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
            gap: 8px !important;
          }
          .stat-card-responsive {
            padding: 10px !important;
          }
          .stat-icon-responsive {
            width: 30px !important;
            height: 30px !important;
            font-size: 0.9rem !important;
          }
        }
      `}</style>

      <AdminHeader
        title="דיווחי שגיאות"
        subtitle="ניהול דיווחים על טעויות במאגר"
        icon="📋"
        iconBg="linear-gradient(135deg, #f59e0b, #d97706)"
        onLogout={logout}
      />

      {/* Stats Row */}
      <div style={styles.statsRow} className="stats-row-responsive">
        <div style={styles.statCard} className="stat-card-responsive">
          <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}} className="stat-icon-responsive">⏳</div>
          <div>
            <div style={styles.statLabel}>ממתינים</div>
            <div style={{...styles.statValue, color: '#f59e0b'}} className="stat-value-responsive">{pendingCount + missingPendingCount}</div>
          </div>
        </div>
        <div style={styles.statCard} className="stat-card-responsive">
          <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'}} className="stat-icon-responsive">👁️</div>
          <div>
            <div style={styles.statLabel}>נבדקו</div>
            <div style={{...styles.statValue, color: '#3b82f6'}} className="stat-value-responsive">{reviewedCount + missingReports.filter(r => r.status === 'reviewed').length}</div>
          </div>
        </div>
        <div style={styles.statCard} className="stat-card-responsive">
          <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'}} className="stat-icon-responsive">✅</div>
          <div>
            <div style={styles.statLabel}>תוקנו</div>
            <div style={{...styles.statValue, color: '#22c55e'}} className="stat-value-responsive">{fixedCount + missingAddedCount}</div>
          </div>
        </div>
        <div style={styles.statCard} className="stat-card-responsive">
          <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'}} className="stat-icon-responsive">📊</div>
          <div>
            <div style={styles.statLabel}>סה״כ</div>
            <div style={{...styles.statValue, color: '#8b5cf6'}} className="stat-value-responsive">{reports.length + missingReports.length}</div>
          </div>
        </div>
      </div>

      <div style={styles.container}>
        {/* Reports Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader} className="section-header-responsive">
            <div style={styles.sectionTitle}>
              <div style={styles.sectionTitleIcon}>📋</div>
              דיווחים
            </div>
            <div style={styles.filterContainer}>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="all">הכל ({reports.length})</option>
                <option value="pending">ממתינים ({pendingCount})</option>
                <option value="reviewed">נבדקו ({reviewedCount})</option>
                <option value="fixed">תוקנו ({fixedCount})</option>
                <option value="rejected">נדחו ({reports.filter(r => r.status === 'rejected').length})</option>
              </select>
            </div>
          </div>

          <div style={styles.sectionContent}>
            {loading ? (
              <div style={styles.loading}>טוען...</div>
            ) : filteredReports.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📭</div>
                <div style={styles.emptyText}>אין דיווחים {statusFilter !== 'all' ? 'בסטטוס זה' : ''}</div>
              </div>
            ) : (
              <div style={styles.reportsList}>
                {filteredReports.map(report => (
                  <div
                    key={report.id}
                    style={styles.reportCard}
                    onClick={() => openReportModal(report)}
                  >
                    <div style={styles.reportCardHeader}>
                      <div style={styles.reportVehicle}>
                        {report.make || 'לא צוין'} {report.model || ''} {report.year_from ? `(${report.year_from})` : ''}
                      </div>
                      <div style={{
                        ...styles.statusBadge,
                        background: `${getStatusColor(report.status)}20`,
                        color: getStatusColor(report.status),
                        borderColor: getStatusColor(report.status)
                      }}>
                        {getStatusLabel(report.status)}
                      </div>
                    </div>
                    <div style={styles.reportMeta}>
                      <span>📅 {new Date(report.created_at).toLocaleDateString('he-IL')}</span>
                      {report.image_url && <span>📷 יש תמונה</span>}
                      {report.notes && <span>💬 יש הערות</span>}
                    </div>
                    {report.notes && (
                      <div style={styles.reportNotes}>
                        {report.notes.length > 100 ? report.notes.substring(0, 100) + '...' : report.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Missing Vehicle Reports Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader} className="section-header-responsive">
            <div style={styles.sectionTitle}>
              <div style={{...styles.sectionTitleIcon, background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'}}>🚗</div>
              דיווחי רכבים חסרים
              {missingPendingCount > 0 && (
                <span style={{
                  background: '#ef4444',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '0.75rem',
                  marginRight: '8px'
                }}>
                  {missingPendingCount} חדשים
                </span>
              )}
            </div>
            <div style={styles.filterContainer}>
              <select
                value={missingStatusFilter}
                onChange={e => setMissingStatusFilter(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="all">הכל ({missingReports.length})</option>
                <option value="pending">ממתינים ({missingPendingCount})</option>
                <option value="reviewed">נבדקו ({missingReports.filter(r => r.status === 'reviewed').length})</option>
                <option value="added">נוספו ({missingAddedCount})</option>
                <option value="rejected">נדחו ({missingReports.filter(r => r.status === 'rejected').length})</option>
              </select>
            </div>
          </div>

          <div style={styles.sectionContent}>
            {missingLoading ? (
              <div style={styles.loading}>טוען...</div>
            ) : filteredMissingReports.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>🚗</div>
                <div style={styles.emptyText}>אין דיווחי רכבים חסרים {missingStatusFilter !== 'all' ? 'בסטטוס זה' : ''}</div>
              </div>
            ) : (
              <div style={styles.reportsList}>
                {filteredMissingReports.map(report => (
                  <div
                    key={report.id}
                    style={styles.reportCard}
                    onClick={() => openMissingReportModal(report)}
                  >
                    <div style={styles.reportCardHeader}>
                      <div style={styles.reportVehicle}>
                        🔢 {report.plate_number}
                      </div>
                      <div style={{
                        ...styles.statusBadge,
                        background: `${getStatusColor(report.status === 'added' ? 'fixed' : report.status)}20`,
                        color: getStatusColor(report.status === 'added' ? 'fixed' : report.status),
                        borderColor: getStatusColor(report.status === 'added' ? 'fixed' : report.status)
                      }}>
                        {getMissingStatusLabel(report.status)}
                      </div>
                    </div>
                    <div style={styles.reportMeta}>
                      <span>📅 {new Date(report.created_at).toLocaleDateString('he-IL')}</span>
                      {report.notes && <span>💬 יש הערות</span>}
                    </div>
                    {report.notes && (
                      <div style={styles.reportNotes}>
                        {report.notes.length > 100 ? report.notes.substring(0, 100) + '...' : report.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div style={styles.modalOverlay} onClick={() => setSelectedReport(null)}>
          <div style={styles.modal} className="modal-responsive" onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>📋 פרטי דיווח</h3>
              <button style={styles.closeBtn} onClick={() => setSelectedReport(null)}>✕</button>
            </div>

            <div style={styles.modalBody}>
              {/* Vehicle Info */}
              <div style={styles.infoSection}>
                <div style={styles.infoSectionTitle}>🚗 פרטי הרכב המדווח</div>
                <div style={styles.infoGrid} className="info-grid-responsive">
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>יצרן:</span>
                    <span style={styles.infoValue}>{selectedReport.make || 'לא צוין'}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>דגם:</span>
                    <span style={styles.infoValue}>{selectedReport.model || 'לא צוין'}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>שנה:</span>
                    <span style={styles.infoValue}>{selectedReport.year_from || 'לא צוין'}</span>
                  </div>
                </div>
              </div>

              {/* Correct Values */}
              <div style={styles.infoSection}>
                <div style={styles.infoSectionTitle}>✅ הערכים הנכונים (לפי המדווח)</div>
                <div style={styles.infoGrid} className="info-grid-responsive">
                  {selectedReport.correct_bolt_count && (
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>כמות ברגים:</span>
                      <span style={styles.infoValue}>{selectedReport.correct_bolt_count}</span>
                    </div>
                  )}
                  {selectedReport.correct_bolt_spacing && (
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>מרווח ברגים:</span>
                      <span style={styles.infoValue}>{selectedReport.correct_bolt_spacing}</span>
                    </div>
                  )}
                  {selectedReport.correct_center_bore && (
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>קוטר מרכזי:</span>
                      <span style={styles.infoValue}>{selectedReport.correct_center_bore}</span>
                    </div>
                  )}
                  {selectedReport.correct_rim_size && (
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>מידת חישוק:</span>
                      <span style={styles.infoValue}>{selectedReport.correct_rim_size}</span>
                    </div>
                  )}
                  {selectedReport.correct_tire_size && (
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>מידת צמיג:</span>
                      <span style={styles.infoValue}>{selectedReport.correct_tire_size}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedReport.notes && (
                <div style={styles.infoSection}>
                  <div style={styles.infoSectionTitle}>💬 הערות המדווח</div>
                  <div style={styles.notesBox}>{selectedReport.notes}</div>
                </div>
              )}

              {/* Image */}
              {selectedReport.image_url && (
                <div style={styles.infoSection}>
                  <div style={styles.infoSectionTitle}>📷 תמונה מצורפת</div>
                  <a
                    href={selectedReport.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.imageLink}
                  >
                    צפה בתמונה
                  </a>
                </div>
              )}

              {/* Admin Notes */}
              <div style={styles.infoSection}>
                <div style={styles.infoSectionTitle}>📝 הערות מנהל</div>
                <textarea
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  placeholder="הוסף הערות..."
                  style={styles.adminNotesInput}
                />
              </div>

              {/* Status Actions */}
              <div style={styles.statusActions}>
                <div style={styles.statusActionsTitle}>עדכן סטטוס:</div>
                <div style={styles.statusButtons} className="status-buttons-responsive">
                  <button
                    style={{...styles.statusBtn, ...styles.statusBtnPending}}
                    onClick={() => updateReportStatus(selectedReport.id, 'pending')}
                    disabled={actionLoading}
                  >
                    ⏳ ממתין
                  </button>
                  <button
                    style={{...styles.statusBtn, ...styles.statusBtnReviewed}}
                    onClick={() => updateReportStatus(selectedReport.id, 'reviewed')}
                    disabled={actionLoading}
                  >
                    👁️ נבדק
                  </button>
                  <button
                    style={{...styles.statusBtn, ...styles.statusBtnFixed}}
                    onClick={() => updateReportStatus(selectedReport.id, 'fixed')}
                    disabled={actionLoading}
                  >
                    ✅ תוקן
                  </button>
                  <button
                    style={{...styles.statusBtn, ...styles.statusBtnRejected}}
                    onClick={() => updateReportStatus(selectedReport.id, 'rejected')}
                    disabled={actionLoading}
                  >
                    ❌ נדחה
                  </button>
                </div>
              </div>
            </div>

            <div style={styles.modalFooter} className="modal-footer-responsive">
              <button
                style={styles.btnDelete}
                onClick={() => deleteReport(selectedReport.id)}
                disabled={actionLoading}
              >
                🗑️ מחק
              </button>
              <Link
                href={`/admin/vehicles?make=${encodeURIComponent(selectedReport.make || '')}&model=${encodeURIComponent(selectedReport.model || '')}&year=${selectedReport.year_from || ''}&report=${selectedReport.id}&bolt_count=${selectedReport.correct_bolt_count || ''}&bolt_spacing=${selectedReport.correct_bolt_spacing || ''}&center_bore=${selectedReport.correct_center_bore || ''}&rim_size=${encodeURIComponent(selectedReport.correct_rim_size || '')}&tire_size=${encodeURIComponent(selectedReport.correct_tire_size || '')}`}
                style={styles.btnUpdate}
              >
                ✏️ עדכן במאגר
              </Link>
              <button style={styles.btnCancel} onClick={() => setSelectedReport(null)}>
                סגור
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Missing Vehicle Report Detail Modal */}
      {selectedMissingReport && (
        <div style={styles.modalOverlay} onClick={() => setSelectedMissingReport(null)}>
          <div style={styles.modal} className="modal-responsive" onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{...styles.modalTitle, color: '#3b82f6'}}>🚗 דיווח רכב חסר</h3>
              <button style={styles.closeBtn} onClick={() => setSelectedMissingReport(null)}>✕</button>
            </div>

            <div style={styles.modalBody}>
              {/* Plate Number */}
              <div style={styles.infoSection}>
                <div style={styles.infoSectionTitle}>🔢 מספר רכב</div>
                <div style={{
                  background: '#0f172a',
                  padding: '16px',
                  borderRadius: '12px',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#3b82f6',
                  textAlign: 'center',
                  letterSpacing: '2px'
                }}>
                  {selectedMissingReport.plate_number}
                </div>
              </div>

              {/* Report Info */}
              <div style={styles.infoSection}>
                <div style={styles.infoSectionTitle}>📋 פרטי הדיווח</div>
                <div style={styles.infoGrid} className="info-grid-responsive">
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>תאריך דיווח:</span>
                    <span style={styles.infoValue}>
                      {new Date(selectedMissingReport.created_at).toLocaleDateString('he-IL')}
                    </span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>סטטוס:</span>
                    <span style={{
                      ...styles.infoValue,
                      color: getStatusColor(selectedMissingReport.status === 'added' ? 'fixed' : selectedMissingReport.status)
                    }}>
                      {getMissingStatusLabel(selectedMissingReport.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedMissingReport.notes && (
                <div style={styles.infoSection}>
                  <div style={styles.infoSectionTitle}>💬 הערות</div>
                  <div style={styles.notesBox}>{selectedMissingReport.notes}</div>
                </div>
              )}

              {/* Quick Actions Section */}
              <div style={styles.infoSection}>
                <Link
                  href={`/admin/vehicles?plate=${selectedMissingReport.plate_number}`}
                  style={{
                    display: 'block',
                    padding: '12px 20px',
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    color: 'white',
                    textAlign: 'center',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '1rem'
                  }}
                >
                  ➕ הוסף למאגר הרכבים
                </Link>
              </div>

              {/* Status Actions */}
              <div style={styles.statusActions}>
                <div style={styles.statusActionsTitle}>עדכן סטטוס:</div>
                <div style={styles.statusButtons} className="status-buttons-responsive">
                  <button
                    style={{...styles.statusBtn, ...styles.statusBtnPending}}
                    onClick={() => updateMissingReportStatus(selectedMissingReport.id, 'pending')}
                    disabled={actionLoading}
                  >
                    ⏳ ממתין
                  </button>
                  <button
                    style={{...styles.statusBtn, ...styles.statusBtnReviewed}}
                    onClick={() => updateMissingReportStatus(selectedMissingReport.id, 'reviewed')}
                    disabled={actionLoading}
                  >
                    👁️ נבדק
                  </button>
                  <button
                    style={{...styles.statusBtn, ...styles.statusBtnFixed}}
                    onClick={() => updateMissingReportStatus(selectedMissingReport.id, 'added')}
                    disabled={actionLoading}
                  >
                    ✅ נוסף למאגר
                  </button>
                  <button
                    style={{...styles.statusBtn, ...styles.statusBtnRejected}}
                    onClick={() => updateMissingReportStatus(selectedMissingReport.id, 'rejected')}
                    disabled={actionLoading}
                  >
                    ❌ נדחה
                  </button>
                </div>
              </div>
            </div>

            <div style={styles.modalFooter} className="modal-footer-responsive">
              <button
                style={styles.btnDelete}
                onClick={() => deleteMissingReport(selectedMissingReport.id)}
                disabled={actionLoading}
              >
                🗑️ מחק
              </button>
              <button style={styles.btnCancel} onClick={() => setSelectedMissingReport(null)}>
                סגור
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

      {/* Footer */}
      <footer style={styles.footer}>
        <span style={styles.footerVersion}>גרסה {VERSION}</span>
      </footer>
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
    overflowX: 'hidden',
  },

  // Header
  header: {
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)',
    borderBottom: '1px solid #f59e0b',
    padding: '30px 30px 60px',
  },
  headerContent: {
    maxWidth: '1300px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '15px',
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
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.6rem',
    boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3)',
    flexShrink: 0,
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
    flexWrap: 'wrap',
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
    background: 'transparent',
    color: '#f87171',
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
    background: 'transparent',
    color: '#94a3b8',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
    boxSizing: 'border-box',
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
    lineHeight: 1,
  },

  // Container
  container: {
    maxWidth: '1300px',
    margin: '0 auto',
    padding: '30px 20px',
    boxSizing: 'border-box',
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
    background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.05) 0%, transparent 100%)',
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
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    flexShrink: 0,
  },
  sectionContent: {
    padding: '20px 24px',
  },

  // Filter
  filterContainer: {
    display: 'flex',
    gap: '10px',
  },
  filterSelect: {
    padding: '10px 16px',
    borderRadius: '10px',
    border: '1px solid #334155',
    background: '#0f172a',
    color: 'white',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },

  // Reports List
  reportsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  reportCard: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '14px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  reportCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    flexWrap: 'wrap',
    gap: '8px',
  },
  reportVehicle: {
    fontWeight: 700,
    color: 'white',
    fontSize: '1rem',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: 600,
    border: '1px solid',
  },
  reportMeta: {
    display: 'flex',
    gap: '15px',
    fontSize: '0.8rem',
    color: '#64748b',
    marginBottom: '8px',
  },
  reportNotes: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    background: 'rgba(255,255,255,0.03)',
    padding: '10px',
    borderRadius: '8px',
    lineHeight: 1.5,
  },

  // Empty State
  emptyState: {
    textAlign: 'center',
    padding: '24px 20px',
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '15px',
    opacity: 0.5,
  },
  emptyText: {
    color: '#64748b',
    fontSize: '1rem',
  },

  // Loading
  loading: {
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
    maxWidth: '600px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
  },
  modalHeader: {
    padding: '20px 24px 16px',
    borderBottom: '1px solid #334155',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: '1.2rem',
    fontWeight: 800,
    color: '#f59e0b',
    margin: 0,
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#64748b',
    fontSize: '1.2rem',
    cursor: 'pointer',
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

  // Info Sections
  infoSection: {
    marginBottom: '20px',
  },
  infoSectionTitle: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: '#94a3b8',
    marginBottom: '10px',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '10px',
  },
  infoItem: {
    background: '#0f172a',
    padding: '10px 12px',
    borderRadius: '8px',
  },
  infoLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    display: 'block',
    marginBottom: '4px',
  },
  infoValue: {
    fontSize: '0.95rem',
    color: 'white',
    fontWeight: 600,
  },
  notesBox: {
    background: '#0f172a',
    padding: '12px',
    borderRadius: '10px',
    fontSize: '0.9rem',
    color: '#e2e8f0',
    lineHeight: 1.6,
  },
  imageLink: {
    display: 'inline-block',
    padding: '10px 20px',
    background: 'rgba(59, 130, 246, 0.2)',
    color: '#60a5fa',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '0.9rem',
  },

  // Admin Notes
  adminNotesInput: {
    width: '100%',
    padding: '12px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '10px',
    color: 'white',
    fontSize: '0.9rem',
    minHeight: '80px',
    resize: 'vertical',
    boxSizing: 'border-box',
  },

  // Status Actions
  statusActions: {
    background: '#0f172a',
    padding: '15px',
    borderRadius: '12px',
    marginTop: '20px',
  },
  statusActionsTitle: {
    fontSize: '0.85rem',
    color: '#64748b',
    marginBottom: '12px',
  },
  statusButtons: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  statusBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 600,
    transition: 'all 0.2s',
  },
  statusBtnPending: {
    background: 'rgba(245, 158, 11, 0.2)',
    color: '#f59e0b',
  },
  statusBtnReviewed: {
    background: 'rgba(59, 130, 246, 0.2)',
    color: '#3b82f6',
  },
  statusBtnFixed: {
    background: 'rgba(34, 197, 94, 0.2)',
    color: '#22c55e',
  },
  statusBtnRejected: {
    background: 'rgba(239, 68, 68, 0.2)',
    color: '#ef4444',
  },

  // Footer Buttons
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
  btnDelete: {
    background: 'rgba(239, 68, 68, 0.2)',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    padding: '12px 16px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.85rem',
  },
  btnUpdate: {
    flex: 1,
    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    color: 'white',
    border: 'none',
    padding: '12px 16px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.85rem',
    textDecoration: 'none',
    textAlign: 'center',
    display: 'inline-block',
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
  },

  // Footer
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
