'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { VERSION } from '@/lib/version'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { AdminShell } from '@/components/admin/AdminShell'

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
  const { isAuthenticated, isLoading: authLoading, logout } = useAdminAuth()

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
        <div style={styles.loadingSpinner}><svg className="spinning-wheel" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg></div>
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
            gap: 10px !important;
            margin-top: 16px !important;
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


      {/* Stats Row */}
      <div style={styles.statsRow} className="stats-row-responsive">
        <div style={styles.statCard} className="stat-card-responsive">
          <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}} className="stat-icon-responsive"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
          <div>
            <div style={styles.statLabel}>ממתינים</div>
            <div style={{...styles.statValue, color: '#f59e0b'}} className="stat-value-responsive">{pendingCount + missingPendingCount}</div>
          </div>
        </div>
        <div style={styles.statCard} className="stat-card-responsive">
          <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'}} className="stat-icon-responsive"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></div>
          <div>
            <div style={styles.statLabel}>נבדקו</div>
            <div style={{...styles.statValue, color: '#3b82f6'}} className="stat-value-responsive">{reviewedCount + missingReports.filter(r => r.status === 'reviewed').length}</div>
          </div>
        </div>
        <div style={styles.statCard} className="stat-card-responsive">
          <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'}} className="stat-icon-responsive"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
          <div>
            <div style={styles.statLabel}>תוקנו</div>
            <div style={{...styles.statValue, color: '#22c55e'}} className="stat-value-responsive">{fixedCount + missingAddedCount}</div>
          </div>
        </div>
        <div style={styles.statCard} className="stat-card-responsive">
          <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'}} className="stat-icon-responsive"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></div>
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
              <div style={styles.sectionTitleIcon}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div>
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
                <div style={styles.emptyIcon}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></div>
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
                      <span style={{display:'inline-flex',alignItems:'center',gap:'3px'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>{new Date(report.created_at).toLocaleDateString('he-IL')}</span>
                      {report.image_url && <span style={{display:'inline-flex',alignItems:'center',gap:'3px'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>יש תמונה</span>}
                      {report.notes && <span style={{display:'inline-flex',alignItems:'center',gap:'3px'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>יש הערות</span>}
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
              <div style={{...styles.sectionTitleIcon, background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="15" cy="17" r="2"/></svg></div>
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
                <div style={styles.emptyIcon}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="15" cy="17" r="2"/></svg></div>
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
                        <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>{report.plate_number}</span>
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
                      <span style={{display:'inline-flex',alignItems:'center',gap:'3px'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>{new Date(report.created_at).toLocaleDateString('he-IL')}</span>
                      {report.notes && <span style={{display:'inline-flex',alignItems:'center',gap:'3px'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>יש הערות</span>}
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
              <h3 style={styles.modalTitle}><span style={{display:'inline-flex',alignItems:'center',gap:'6px'}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>פרטי דיווח</span></h3>
              <button style={styles.closeBtn} onClick={() => setSelectedReport(null)}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>

            <div style={styles.modalBody}>
              {/* Vehicle Info */}
              <div style={styles.infoSection}>
                <div style={styles.infoSectionTitle}><span style={{display:'inline-flex',alignItems:'center',gap:'5px'}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="15" cy="17" r="2"/></svg>פרטי הרכב המדווח</span></div>
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
                <div style={styles.infoSectionTitle}><span style={{display:'inline-flex',alignItems:'center',gap:'5px'}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>הערכים הנכונים (לפי המדווח)</span></div>
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
                  <div style={styles.infoSectionTitle}><span style={{display:'inline-flex',alignItems:'center',gap:'5px'}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>הערות המדווח</span></div>
                  <div style={styles.notesBox}>{selectedReport.notes}</div>
                </div>
              )}

              {/* Image */}
              {selectedReport.image_url && (
                <div style={styles.infoSection}>
                  <div style={styles.infoSectionTitle}><span style={{display:'inline-flex',alignItems:'center',gap:'5px'}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>תמונה מצורפת</span></div>
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
                <div style={styles.infoSectionTitle}><span style={{display:'inline-flex',alignItems:'center',gap:'5px'}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>הערות מנהל</span></div>
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
                    <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>ממתין</span>
                  </button>
                  <button
                    style={{...styles.statusBtn, ...styles.statusBtnReviewed}}
                    onClick={() => updateReportStatus(selectedReport.id, 'reviewed')}
                    disabled={actionLoading}
                  >
                    <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>נבדק</span>
                  </button>
                  <button
                    style={{...styles.statusBtn, ...styles.statusBtnFixed}}
                    onClick={() => updateReportStatus(selectedReport.id, 'fixed')}
                    disabled={actionLoading}
                  >
                    <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>תוקן</span>
                  </button>
                  <button
                    style={{...styles.statusBtn, ...styles.statusBtnRejected}}
                    onClick={() => updateReportStatus(selectedReport.id, 'rejected')}
                    disabled={actionLoading}
                  >
                    <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>נדחה</span>
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
                <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>מחק</span>
              </button>
              <Link
                href={`/admin/vehicles?make=${encodeURIComponent(selectedReport.make || '')}&model=${encodeURIComponent(selectedReport.model || '')}&year=${selectedReport.year_from || ''}&report=${selectedReport.id}&bolt_count=${selectedReport.correct_bolt_count || ''}&bolt_spacing=${selectedReport.correct_bolt_spacing || ''}&center_bore=${selectedReport.correct_center_bore || ''}&rim_size=${encodeURIComponent(selectedReport.correct_rim_size || '')}&tire_size=${encodeURIComponent(selectedReport.correct_tire_size || '')}`}
                style={styles.btnUpdate}
              >
                <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>עדכן במאגר</span>
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
              <h3 style={{...styles.modalTitle, color: '#3b82f6'}}><span style={{display:'inline-flex',alignItems:'center',gap:'6px'}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="15" cy="17" r="2"/></svg>דיווח רכב חסר</span></h3>
              <button style={styles.closeBtn} onClick={() => setSelectedMissingReport(null)}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>

            <div style={styles.modalBody}>
              {/* Plate Number */}
              <div style={styles.infoSection}>
                <div style={styles.infoSectionTitle}><span style={{display:'inline-flex',alignItems:'center',gap:'5px'}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>מספר רכב</span></div>
                <div style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  padding: '16px',
                  borderRadius: '12px',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#2563eb',
                  textAlign: 'center',
                  letterSpacing: '2px'
                }}>
                  {selectedMissingReport.plate_number}
                </div>
              </div>

              {/* Report Info */}
              <div style={styles.infoSection}>
                <div style={styles.infoSectionTitle}><span style={{display:'inline-flex',alignItems:'center',gap:'5px'}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>פרטי הדיווח</span></div>
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
                  <div style={styles.infoSectionTitle}><span style={{display:'inline-flex',alignItems:'center',gap:'5px'}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>הערות</span></div>
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
                  <span style={{display:'inline-flex',alignItems:'center',gap:'6px'}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>הוסף למאגר הרכבים</span>
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
                    <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>ממתין</span>
                  </button>
                  <button
                    style={{...styles.statusBtn, ...styles.statusBtnReviewed}}
                    onClick={() => updateMissingReportStatus(selectedMissingReport.id, 'reviewed')}
                    disabled={actionLoading}
                  >
                    <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>נבדק</span>
                  </button>
                  <button
                    style={{...styles.statusBtn, ...styles.statusBtnFixed}}
                    onClick={() => updateMissingReportStatus(selectedMissingReport.id, 'added')}
                    disabled={actionLoading}
                  >
                    <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>נוסף למאגר</span>
                  </button>
                  <button
                    style={{...styles.statusBtn, ...styles.statusBtnRejected}}
                    onClick={() => updateMissingReportStatus(selectedMissingReport.id, 'rejected')}
                    disabled={actionLoading}
                  >
                    <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>נדחה</span>
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
                <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>מחק</span>
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
            <h3 style={styles.confirmTitle}><span style={{display:'inline-flex',alignItems:'center',gap:'6px'}}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>{confirmDialogData.title}</span></h3>
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

const styles: { [key: string]: React.CSSProperties } = {
  // Page wrapper
  pageWrapper: {
    background: '#f1f5f9',
    minHeight: '100vh',
    color: '#1e293b',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    direction: 'rtl',
    overflowX: 'hidden',
    paddingTop: 16,
  },

  // Header
  header: {
    background: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
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
    background: '#f59e0b',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.6rem',
    boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3)',
    flexShrink: 0,
  },
  headerTitle: {
    color: '#1e293b',
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
    color: '#dc2626',
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
    background: 'transparent',
    color: '#64748b',
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
    margin: '24px auto 20px',
    position: 'relative',
    zIndex: 10,
    maxWidth: '1300px',
    padding: '0 20px',
    boxSizing: 'border-box',
  },
  statCard: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    padding: '12px 14px',
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
    background: '#f59e0b',
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
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    color: '#1e293b',
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
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
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
    color: '#1e293b',
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
    color: '#64748b',
    background: '#f8fafc',
    padding: '10px',
    borderRadius: '8px',
    lineHeight: 1.5,
    border: '1px solid #e2e8f0',
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
    maxWidth: '600px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
  },
  modalHeader: {
    padding: '20px 24px 16px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: '1.2rem',
    fontWeight: 800,
    color: '#1e293b',
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
    borderTop: '1px solid #e2e8f0',
  },

  // Info Sections
  infoSection: {
    marginBottom: '20px',
  },
  infoSectionTitle: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: '#64748b',
    marginBottom: '10px',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '10px',
  },
  infoItem: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
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
    color: '#1e293b',
    fontWeight: 600,
  },
  notesBox: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    padding: '12px',
    borderRadius: '10px',
    fontSize: '0.9rem',
    color: '#1e293b',
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
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    color: '#1e293b',
    fontSize: '0.9rem',
    minHeight: '80px',
    resize: 'vertical',
    boxSizing: 'border-box',
  },

  // Status Actions
  statusActions: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    padding: '15px',
    borderRadius: '12px',
    marginTop: '20px',
  },
  statusActionsTitle: {
    fontSize: '0.85rem',
    color: '#64748b',
    fontWeight: 600,
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
    background: '#f1f5f9',
    color: '#64748b',
    border: '1px solid #e2e8f0',
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
    background: '#16a34a',
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
    margin: '0 0 15px 0',
  },
  confirmMessage: {
    color: '#64748b',
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
  },

  // Footer
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
