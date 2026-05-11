'use client'

import { useState, useEffect, use, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import * as XLSX from 'xlsx'
import { isPushSupported, requestNotificationPermission, registerServiceWorker, getPushNotSupportedReason } from '@/lib/push'
import { getDistricts, getDistrictColor, getDistrictName, District } from '@/lib/districts'
import AppHeader from '@/components/AppHeader'

interface Wheel {
  id: string
  wheel_number: string
  rim_size: string
  bolt_count: number
  bolt_spacing: number
  center_bore?: number | null
  tire_size?: string | null
  offset?: number | null
  category: string | null
  is_donut: boolean
  notes: string | null
  is_available: boolean
  custom_deposit?: number | null
  temporarily_unavailable?: boolean
  unavailable_reason?: string | null
  unavailable_notes?: string | null
  unavailable_since?: string | null
  current_borrow?: {
    id: string
    borrower_name: string
    borrower_phone: string
    borrower_id_number?: string
    borrower_address?: string
    vehicle_model?: string
    borrow_date: string
    expected_return_date?: string
    deposit_type?: string
    deposit_details?: string
    is_signed?: boolean
    signed_at?: string
    form_id?: string
  }
}

interface BorrowRecord {
  id: string
  wheel_id: string
  borrower_name: string
  borrower_phone: string
  borrower_id_number?: string
  borrower_address?: string
  vehicle_model?: string
  borrow_date: string
  expected_return_date?: string
  actual_return_date?: string
  deposit_type?: string
  deposit_details?: string
  notes?: string
  status: string
  is_signed: boolean
  signed_at?: string
  created_at: string
  form_id?: string
  referred_by?: string
  referred_by_name?: string
  wheels?: {
    wheel_number: string
    rim_size: string
    bolt_count: number
    bolt_spacing: number
    custom_deposit?: number | null
  }
}

interface Manager {
  id: string
  full_name: string
  phone: string
  role: string
  is_primary: boolean
  password?: string | null
}

interface PaymentMethods {
  cash?: boolean
  bit?: { enabled: boolean; phone: string }
  paybox?: { enabled: boolean; phone: string }
  bank_transfer?: { enabled: boolean; details: string }
  id_deposit?: boolean
  license_deposit?: boolean
}

interface Station {
  id: string
  name: string
  address: string
  district?: string | null
  wheels: Wheel[]
  wheel_station_managers: Manager[]
  totalWheels: number
  availableWheels: number
  deposit_amount?: number
  payment_methods?: PaymentMethods
  notification_emails?: string[]
  max_managers?: number
}

interface WheelForm {
  wheel_number: string
  rim_size: string
  bolt_count: string
  bolt_spacing: string
  center_bore: string
  tire_size: string
  category: string
  is_donut: boolean
  notes: string
  custom_deposit: string
}

type ViewMode = 'cards' | 'table'
type PageTab = 'wheels' | 'tracking' | 'alerts' | 'reports'

export default function StationPage({ params }: { params: Promise<{ stationId: string }> }) {
  const { stationId } = use(params)
  const searchParams = useSearchParams()
  const router = useRouter()
  const [station, setStation] = useState<Station | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [districts, setDistricts] = useState<District[]>([])

  // Manager mode
  const [isManager, setIsManager] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginPhone, setLoginPhone] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [currentManager, setCurrentManager] = useState<Manager | null>(null)
  const [sessionPassword, setSessionPassword] = useState('')
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' })

  // Recovery certificate state
  const [showRecoveryCertModal, setShowRecoveryCertModal] = useState(false)
  const [recoveryData, setRecoveryData] = useState<{ recovery_key: string; manager_name: string; station_name: string; role: string } | null>(null)
  const [recoveryLoading, setRecoveryLoading] = useState(false)

  // Forgot password state
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false)
  const [forgotPhone, setForgotPhone] = useState('')
  const [forgotNewPassword, setForgotNewPassword] = useState('')
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('')
  const [forgotError, setForgotError] = useState('')
  const [forgotSuccess, setForgotSuccess] = useState(false)

  // Password visibility toggles
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Confirm dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmDialogData, setConfirmDialogData] = useState<{
    title: string
    message: string
    onConfirm: () => void
    confirmText?: string
    cancelText?: string
    variant?: 'danger' | 'warning' | 'info'
  } | null>(null)

  // Modals
  const [showAddWheelModal, setShowAddWheelModal] = useState(false)
  const [showEditWheelModal, setShowEditWheelModal] = useState(false)
  const [selectedWheel, setSelectedWheel] = useState<Wheel | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Forms
  const [wheelForm, setWheelForm] = useState<WheelForm>({
    wheel_number: '',
    rim_size: '',
    bolt_count: '4',
    bolt_spacing: '',
    center_bore: '',
    tire_size: '',
    category: '',
    is_donut: false,
    notes: '',
    custom_deposit: ''
  })

  // Form validation errors (highlight missing fields)
  const [wheelFormErrors, setWheelFormErrors] = useState<string[]>([])
  const [showCustomCategory, setShowCustomCategory] = useState(false)

  // Mobile tracking cards - track which cards are expanded (collapsed by default)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())

  // Deleted wheels (for restore banner)
  const [deletedWheels, setDeletedWheels] = useState<{
    id: string
    wheel_number: number
    rim_size: number
    bolt_count: number
    bolt_spacing: number
    deleted_at: string
    deleted_by_name: string
    deleted_by_type: string
  }[]>([])
  const [restoringWheel, setRestoringWheel] = useState<string | null>(null)
  const [dismissedDeletedIds, setDismissedDeletedIds] = useState<Set<string>>(new Set())
  const [dismissedLoanIds, setDismissedLoanIds] = useState<Set<string>>(new Set())

  // WhatsApp share modal
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
  const [whatsAppPhone, setWhatsAppPhone] = useState('')
  const [whatsAppWheel, setWhatsAppWheel] = useState<Wheel | null>(null)

  // Options menu for wheel cards
  const [openOptionsMenu, setOpenOptionsMenu] = useState<string | null>(null)

  // Manager hamburger menu
  const [showManagerMenu, setShowManagerMenu] = useState(false)

  // Link share menu
  const [showLinkMenu, setShowLinkMenu] = useState(false)

  // Manual borrow modal
  const [showManualBorrowModal, setShowManualBorrowModal] = useState(false)
  const [manualBorrowWheel, setManualBorrowWheel] = useState<Wheel | null>(null)
  const [manualBorrowForm, setManualBorrowForm] = useState({
    borrower_name: '',
    borrower_phone: '',
    borrower_id_number: '',
    borrower_address: '',
    vehicle_model: '',
    vehicle_plate: '',
    deposit_type: 'cash',
    notes: ''
  })
  const [manualBorrowFormErrors, setManualBorrowFormErrors] = useState<string[]>([])

  // Predefined categories
  const predefinedCategories = ['גרמניות', 'צרפתיות', 'יפניות וקוריאניות']

  // Filters
  const [rimSizeFilter, setRimSizeFilter] = useState('')
  const [boltCountFilter, setBoltCountFilter] = useState('')
  const [boltSpacingFilter, setBoltSpacingFilter] = useState('')
  const [centerBoreFilter, setCenterBoreFilter] = useState('')
  const [offsetFilter, setOffsetFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [availabilityFilter, setAvailabilityFilter] = useState('')
  const [tireSizeWidth, setTireSizeWidth] = useState('')
  const [tireSizeRatio, setTireSizeRatio] = useState('')

  const clearAllFilters = () => {
    setRimSizeFilter('')
    setBoltCountFilter('')
    setBoltSpacingFilter('')
    setCenterBoreFilter('')
    setOffsetFilter('')
    setCategoryFilter('')
    setTypeFilter('')
    setAvailabilityFilter('')
    setTireSizeWidth('')
    setTireSizeRatio('')
  }

  const hasActiveFilters = rimSizeFilter || boltCountFilter || boltSpacingFilter || centerBoreFilter || offsetFilter || categoryFilter || typeFilter || availabilityFilter || tireSizeWidth || tireSizeRatio

  useEffect(() => {
    fetchStation()
    fetchDistrictsData()
    // Check if already logged in and validate session with server
    const validateSession = async () => {
      const SESSION_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

      // Check session for THIS specific station first
      const newSession = localStorage.getItem(`station_session_${stationId}`)
      const oldSession = localStorage.getItem(`wheel_manager_${stationId}`)

      // New session format from /login page - trust it directly
      if (newSession) {
        try {
          const session = JSON.parse(newSession)
          if (session.timestamp && Date.now() - session.timestamp < SESSION_EXPIRY_MS && session.manager) {
            setIsManager(true)
            setCurrentManager({
              id: session.manager.id,
              full_name: session.manager.full_name,
              phone: session.manager.phone,
              role: session.manager.role || 'manager',
              is_primary: session.manager.is_primary || false
            })
            setSessionPassword(session.password || '')
            return
          } else {
            localStorage.removeItem(`station_session_${stationId}`)
          }
        } catch (e) {
          console.warn('Station session data corrupted, clearing:', e)
          localStorage.removeItem(`station_session_${stationId}`)
        }
      }

      // Old session format - validate with server
      if (oldSession) {
        try {
          const session = JSON.parse(oldSession)
          const manager = session.manager
          const phone = manager?.phone || ''
          const token = session.token || ''

          if (token) {
            const response = await fetch(
              `/api/wheel-stations/${stationId}/auth?token=${encodeURIComponent(token)}&phone=${encodeURIComponent(phone)}`
            )
            const data = await response.json()

            if (data.valid) {
              setIsManager(true)
              setCurrentManager(data.manager)
              setSessionPassword(session.password || token)
              return
            }
          }
          localStorage.removeItem(`wheel_manager_${stationId}`)
        } catch (e) {
          console.warn('Old session data corrupted, clearing:', e)
          localStorage.removeItem(`wheel_manager_${stationId}`)
        }
      }

      // Not manager of THIS station - check if logged in elsewhere (allow viewing as guest)
      const hasAnyStationSession = Object.keys(localStorage).some(key => {
        if (key.startsWith('station_session_')) {
          try {
            const session = JSON.parse(localStorage.getItem(key) || '{}')
            return session.timestamp && Date.now() - session.timestamp < SESSION_EXPIRY_MS
          } catch { return false }
        }
        return false
      })
      const hasOperatorSession = localStorage.getItem('operator_session')
      const hasOldStationSession = Object.keys(localStorage).some(key => key.startsWith('wheel_manager_'))
      const hasSuperManagerSession = localStorage.getItem('super_manager_session')

      const hasAdminSession = (() => {
        try {
          const a = localStorage.getItem('wheels_admin_auth')
          if (!a) return false
          const { expiry } = JSON.parse(a)
          return expiry && Date.now() < expiry
        } catch { return false }
      })()

      if (hasAnyStationSession || hasOperatorSession || hasOldStationSession || hasSuperManagerSession || hasAdminSession) {
        // User is logged in elsewhere - allow viewing this station as guest (not manager)
        return
      }

      // Not logged in at all - redirect to login
      window.location.href = '/login'
    }
    validateSession()
  }, [stationId])

  // Fetch deleted wheels when manager is logged in + load dismissed IDs from localStorage
  useEffect(() => {
    if (isManager) {
      fetchDeletedWheels()
      // Load dismissed IDs from localStorage
      const dismissedDeleted = new Set<string>()
      const dismissedLoans = new Set<string>()
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(`dismissed_deleted_${stationId}_`)) {
          dismissedDeleted.add(key.replace(`dismissed_deleted_${stationId}_`, ''))
        }
        if (key.startsWith(`dismissed_loan_${stationId}_`)) {
          dismissedLoans.add(key.replace(`dismissed_loan_${stationId}_`, ''))
        }
      })
      setDismissedDeletedIds(dismissedDeleted)
      setDismissedLoanIds(dismissedLoans)
    }
  }, [isManager, stationId])

  // Scroll to wheel when hash is in URL (from search results)
  useEffect(() => {
    if (!loading && station && typeof window !== 'undefined') {
      const hash = window.location.hash
      if (hash && hash.startsWith('#wheel-')) {
        setTimeout(() => {
          const element = document.getElementById(hash.slice(1))
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
            // Highlight the wheel briefly
            element.style.boxShadow = '0 0 0 4px #f59e0b'
            setTimeout(() => {
              element.style.boxShadow = ''
            }, 2000)
          }
        }, 300)
      }
    }
  }, [loading, station])

  // Contacts management
  const [showContactsModal, setShowContactsModal] = useState(false) // For viewing contacts (public)
  const [contacts, setContacts] = useState<Manager[]>([])

  // Edit station details
  const [showEditDetailsModal, setShowEditDetailsModal] = useState(false)
  const [editAddress, setEditAddress] = useState('')
  const [editDepositAmount, setEditDepositAmount] = useState('')
  const [editPaymentMethods, setEditPaymentMethods] = useState<PaymentMethods>({
    cash: true,
    id_deposit: true,
    license_deposit: true
  })

  // Email notification settings
  const [notificationEmails, setNotificationEmails] = useState<string[]>([''])

  // Excel import/export
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [showExcelModal, setShowExcelModal] = useState(false)
  const [sheetsUrl, setSheetsUrl] = useState('')
  const [importMode, setImportMode] = useState<'file' | 'sheets'>('file')

  // Temporary unavailable modal
  const [showUnavailableModal, setShowUnavailableModal] = useState(false)
  const [selectedWheelForUnavailable, setSelectedWheelForUnavailable] = useState<Wheel | null>(null)
  const [unavailableReason, setUnavailableReason] = useState('maintenance')
  const [unavailableNotes, setUnavailableNotes] = useState('')

  // Onboarding tour
  const [onboardingStep, setOnboardingStep] = useState<number | null>(null)
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null)

  // Reports tab
  const [reportChecks, setReportChecks] = useState({ inventory: true, history: true, unavailable: false })
  const [reportDateFrom, setReportDateFrom] = useState('')
  const [reportDateTo, setReportDateTo] = useState('')

  // Tracking tab
  const [activeTab, setActiveTab] = useState<PageTab>('wheels')
  const [borrows, setBorrows] = useState<BorrowRecord[]>([])
  const [borrowStats, setBorrowStats] = useState({ pending: 0, totalBorrowed: 0, totalReturned: 0, waitingSignature: 0, signed: 0 })
  const [borrowsLoading, setBorrowsLoading] = useState(false)
  const [borrowFilter, setBorrowFilter] = useState<'all' | 'pending' | 'borrowed' | 'returned'>('all')
  const [approvalLoading, setApprovalLoading] = useState<string | null>(null)

  // Push notifications
  const [pushSupported, setPushSupported] = useState(false)
  const [pushEnabled, setPushEnabled] = useState(false)
  const [enablingPush, setEnablingPush] = useState(false)

  // Close modals on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showManagerMenu) setShowManagerMenu(false)
        else if (showLinkMenu) setShowLinkMenu(false)
        else if (openOptionsMenu) setOpenOptionsMenu(null)
        else if (showManualBorrowModal) setShowManualBorrowModal(false)
        else if (showEditWheelModal) setShowEditWheelModal(false)
        else if (showAddWheelModal) setShowAddWheelModal(false)
        else if (showEditDetailsModal) setShowEditDetailsModal(false)
        else if (showExcelModal) setShowExcelModal(false)
        else if (showUnavailableModal) setShowUnavailableModal(false)
        else if (showChangePasswordModal) setShowChangePasswordModal(false)
        else if (showLoginModal) setShowLoginModal(false)
        else if (showContactsModal) setShowContactsModal(false)
        else if (showWhatsAppModal) setShowWhatsAppModal(false)
        else if (showConfirmDialog) setShowConfirmDialog(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [showLoginModal, showAddWheelModal, showEditWheelModal, showEditDetailsModal, showExcelModal, showUnavailableModal, showChangePasswordModal, showContactsModal, showWhatsAppModal, showConfirmDialog, openOptionsMenu, showManualBorrowModal, showManagerMenu, showLinkMenu])

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openOptionsMenu) setOpenOptionsMenu(null)
      if (showManagerMenu) setShowManagerMenu(false)
      if (showLinkMenu) setShowLinkMenu(false)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [openOptionsMenu, showManagerMenu, showLinkMenu])

  const fetchBorrows = async () => {
    setBorrowsLoading(true)
    try {
      const status = borrowFilter === 'all' ? '' : borrowFilter
      const response = await fetch(`/api/wheel-stations/${stationId}/borrows${status ? `?status=${status}` : ''}`)
      if (!response.ok) throw new Error('Failed to fetch borrows')
      const data = await response.json()
      setBorrows(data.borrows || [])
      setBorrowStats(data.stats || { pending: 0, totalBorrowed: 0, totalReturned: 0, waitingSignature: 0, signed: 0 })
    } catch (err) {
      console.error('Error fetching borrows:', err)
    } finally {
      setBorrowsLoading(false)
    }
  }

  // Trigger onboarding on first visit
  useEffect(() => {
    if (!isManager || !station) return
    const key = `tour_v1_${stationId}`
    if (!localStorage.getItem(key)) {
      setTimeout(() => setOnboardingStep(0), 900)
    }
  }, [isManager, station, stationId])

  // Update spotlight rect when step changes
  useEffect(() => {
    if (onboardingStep === null) { setHighlightRect(null); return }
    const ids = ['onboarding-tab-nav', 'onboarding-reports-btn', 'onboarding-wheels-area']
    const el = document.getElementById(ids[onboardingStep])
    if (!el) { setHighlightRect(null); return }
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setTimeout(() => setHighlightRect(el.getBoundingClientRect()), 350)
  }, [onboardingStep])

  const dismissOnboarding = () => {
    localStorage.setItem(`tour_v1_${stationId}`, '1')
    setOnboardingStep(null)
  }

  const nextOnboardingStep = () => {
    if (onboardingStep === null) return
    if (onboardingStep >= 2) { dismissOnboarding(); return }
    setOnboardingStep(onboardingStep + 1)
  }

  // Fetch borrows when tab changes or filter changes
  useEffect(() => {
    if ((activeTab === 'tracking' || activeTab === 'alerts' || activeTab === 'reports') && isManager) {
      fetchBorrows()
    }
  }, [activeTab, borrowFilter, isManager])

  // Handle URL action parameter to open modals from header menu
  useEffect(() => {
    if (!isManager) return

    // Handle tab parameter (e.g., ?tab=alerts from bell icon)
    const tab = searchParams.get('tab')
    if (tab === 'alerts') {
      setActiveTab('alerts')
      router.replace(`/${stationId}`, { scroll: false })
    }

    const action = searchParams.get('action')
    if (action) {
      // Clear the action parameter from URL
      router.replace(`/${stationId}`, { scroll: false })

      // Open the appropriate modal
      switch (action) {
        case 'add':
          setShowAddWheelModal(true)
          break
        case 'excel':
          setShowExcelModal(true)
          break
        case 'settings':
          setEditAddress(station?.address || '')
          setEditDepositAmount(String(station?.deposit_amount || 200))
          setEditPaymentMethods(station?.payment_methods || { cash: true, id_deposit: true, license_deposit: true })
          setNotificationEmails(station?.notification_emails?.length ? station.notification_emails : [''])
          setShowEditDetailsModal(true)
          break
        case 'password':
          setPasswordForm({ current: '', new: '', confirm: '' })
          setShowChangePasswordModal(true)
          break
        case 'recovery':
          handleShowRecoveryCert()
          break
        case 'notifications':
          // Trigger push notification toggle
          handleTogglePush()
          break
      }
    }
  }, [searchParams, isManager, stationId, station, router])

  // Check push notification support and status
  useEffect(() => {
    if (isManager && currentManager) {
      const checkPush = async () => {
        const supported = isPushSupported()
        setPushSupported(supported)

        if (supported) {
          // Check if already subscribed
          try {
            const response = await fetch(`/api/wheel-stations/${stationId}/push/subscribe?manager_phone=${encodeURIComponent(currentManager.phone)}`)
            const data = await response.json()
            setPushEnabled(data.subscribed)
          } catch (err) {
            console.error('Error checking push status:', err)
          }
        }
      }
      checkPush()
    }
  }, [isManager, currentManager, stationId])

  // Toggle push notifications
  const handleTogglePush = async () => {
    if (!currentManager) return
    setEnablingPush(true)

    try {
      if (pushEnabled) {
        // Unsubscribe
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()

        if (subscription) {
          await fetch(`/api/wheel-stations/${stationId}/push/subscribe`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              endpoint: subscription.endpoint,
              manager_phone: currentManager.phone,
              manager_password: sessionPassword
            })
          })
          await subscription.unsubscribe()
        }

        setPushEnabled(false)
        toast.success('התראות כובו')
      } else {
        // Subscribe
        const notSupported = getPushNotSupportedReason()
        if (notSupported) {
          toast.error(notSupported, { duration: 5000 })
          setEnablingPush(false)
          return
        }

        const granted = await requestNotificationPermission()
        if (!granted) {
          if (Notification?.permission === 'denied') {
            toast.error('התראות חסומות בדפדפן - יש לאפשר בהגדרות', { duration: 5000 })
          } else {
            toast.error('נדרשת הרשאה כדי להפעיל התראות', { duration: 5000 })
          }
          setEnablingPush(false)
          return
        }

        const registration = await registerServiceWorker()
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

        if (!vapidPublicKey) {
          toast.error('התראות לא מוגדרות במערכת')
          setEnablingPush(false)
          return
        }

        // Convert VAPID key
        const urlBase64ToUint8Array = (base64String: string) => {
          const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
          const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
          const rawData = window.atob(base64)
          const outputArray = new Uint8Array(rawData.length)
          for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i)
          }
          return outputArray
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        })

        // Save to server
        const response = await fetch(`/api/wheel-stations/${stationId}/push/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription: subscription.toJSON(),
            manager_phone: currentManager.phone,
            manager_password: sessionPassword,
            userAgent: navigator.userAgent
          })
        })

        if (!response.ok) {
          throw new Error('Failed to save subscription')
        }

        setPushEnabled(true)
        toast.success('התראות הופעלו! תקבל התראה בכל בקשה חדשה')
      }
    } catch (error) {
      console.error('Error toggling push:', error)
      toast.error('שגיאה בהפעלת התראות')
    } finally {
      setEnablingPush(false)
    }
  }

  // Approve or reject pending borrow request
  const handleBorrowAction = async (borrowId: string, action: 'approve' | 'reject') => {
    if (!currentManager) {
      toast.error('לא מחובר כמנהל')
      return
    }
    if (!sessionPassword) {
      toast.error('סיסמה לא נמצאה. נא להתנתק ולהתחבר מחדש')
      return
    }
    setApprovalLoading(borrowId)
    try {
      const response = await fetch(`/api/wheel-stations/${stationId}/borrows/${borrowId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manager_phone: currentManager.phone,
          manager_password: sessionPassword,
          action
        })
      })
      const data = await response.json()
      if (!response.ok) {
        console.error('Borrow action failed:', { status: response.status, error: data.error, phone: currentManager.phone, passwordLen: sessionPassword?.length })
        // If password is wrong, force re-login
        if (data.error === 'סיסמא שגויה') {
          toast.error('הסיסמה שגויה. נא להתנתק ולהתחבר מחדש')
          localStorage.removeItem(`wheel_manager_${stationId}`)
          setIsManager(false)
          setCurrentManager(null)
          setSessionPassword('')
        } else {
          toast.error(data.error || 'שגיאה בביצוע הפעולה')
        }
        return
      }
      toast.success(action === 'approve' ? 'הבקשה אושרה!' : 'הבקשה נדחתה')
      fetchBorrows()
      fetchStation() // Refresh wheel availability
    } catch {
      toast.error('שגיאה בביצוע הפעולה')
    } finally {
      setApprovalLoading(null)
    }
  }

  // Generate WhatsApp link for sign form
  const generateWhatsAppLink = (borrowerName: string, borrowerPhone: string) => {
    const signFormUrl = `${window.location.origin}/sign/${stationId}`
    const message = `שלום ${borrowerName}! 👋

קיבלת גלגל חילוף מתחנת ${station?.name || 'ידידים'}.

📝 נא למלא ולחתום על טופס ההתחייבות:
${signFormUrl}

🔄 יש להחזיר את הגלגל תוך 72 שעות לתחנה.

תודה רבה! 🙏
ידידים - סיוע בדרכים`

    const cleanPhone = borrowerPhone.replace(/\D/g, '')
    const israelPhone = cleanPhone.startsWith('0') ? '972' + cleanPhone.slice(1) : cleanPhone
    return `https://wa.me/${israelPhone}?text=${encodeURIComponent(message)}`
  }

  const fetchDistrictsData = async () => {
    try {
      const districtsData = await getDistricts()
      setDistricts(districtsData)
    } catch (err) {
      console.error('Error fetching districts:', err)
    }
  }

  const fetchStation = async () => {
    try {
      const response = await fetch(`/api/wheel-stations/${stationId}`)
      if (!response.ok) throw new Error('Failed to fetch station')
      const data = await response.json()
      setStation(data.station)
      setContacts(data.station.wheel_station_managers || [])
    } catch (err) {
      setError('שגיאה בטעינת התחנה')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch managers with passwords when primary manager opens edit modal
  useEffect(() => {
    if (showEditDetailsModal && currentManager?.is_primary) {
      fetch(`/api/wheel-stations/${stationId}/managers`)
        .then(r => r.json())
        .then(data => { if (data.managers) setContacts(data.managers) })
        .catch(() => {})
    }
  }, [showEditDetailsModal])

  // Fetch deleted wheels for restore banner (only for managers)
  const fetchDeletedWheels = async () => {
    try {
      const res = await fetch(`/api/wheel-stations/${stationId}/deleted-wheels`)
      if (res.ok) {
        const data = await res.json()
        setDeletedWheels(data.deletedWheels || [])
      }
    } catch {
      // Silently fail - banner just won't show
    }
  }

  const handleRestoreWheel = async (wheelId: string) => {
    if (!currentManager || !sessionPassword) return
    setRestoringWheel(wheelId)
    try {
      const res = await fetch(`/api/wheel-stations/${stationId}/wheels/${wheelId}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manager_phone: currentManager.phone, manager_password: sessionPassword })
      })
      if (res.ok) {
        toast.success('הגלגל שוחזר בהצלחה!')
        setDeletedWheels(prev => prev.filter(w => w.id !== wheelId))
        await fetchStation()
      } else {
        const data = await res.json()
        toast.error(data.error || 'שגיאה בשחזור')
      }
    } catch {
      toast.error('שגיאה בשחזור')
    } finally {
      setRestoringWheel(null)
    }
  }

  // Alert count computation
  const overdueBorrows = borrows.filter(b => {
    if (b.status !== 'borrowed') return false
    const borrowDate = new Date(b.borrow_date || b.created_at)
    const daysSince = Math.floor((Date.now() - borrowDate.getTime()) / (1000 * 60 * 60 * 24))
    return daysSince >= 7
  })

  const undismissedDeletedCount = deletedWheels.filter(w => !dismissedDeletedIds.has(w.id)).length
  const undismissedLoanCount = overdueBorrows.filter(b => !dismissedLoanIds.has(b.id)).length
  const alertCount = undismissedDeletedCount + undismissedLoanCount

  const handleDismissDeleted = (wheelId: string) => {
    localStorage.setItem(`dismissed_deleted_${stationId}_${wheelId}`, '1')
    setDismissedDeletedIds(prev => new Set(prev).add(wheelId))
  }

  const handleDismissLoan = (borrowId: string) => {
    localStorage.setItem(`dismissed_loan_${stationId}_${borrowId}`, '1')
    setDismissedLoanIds(prev => new Set(prev).add(borrowId))
  }

  // Manager login - verify phone + password via API
  const handleLogin = async () => {
    if (!loginPhone || !loginPassword) {
      setLoginError('נא להזין טלפון וסיסמא')
      return
    }
    setActionLoading(true)
    try {
      const response = await fetch(`/api/wheel-stations/${stationId}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: loginPhone.trim(), password: loginPassword.trim() })
      })
      const data = await response.json()
      if (!response.ok) {
        setLoginError(data.error || 'שגיאה בכניסה')
        return
      }
      setIsManager(true)
      setCurrentManager(data.manager)
      setSessionPassword(loginPassword)
      localStorage.setItem(`wheel_manager_${stationId}`, JSON.stringify({
        manager: data.manager,
        password: loginPassword,
        token: data.token
      }))
      setShowLoginModal(false)
      setLoginError('')
      setLoginPhone('')
      setLoginPassword('')
    } catch {
      setLoginError('שגיאה בכניסה')
    } finally {
      setActionLoading(false)
    }
  }

  const handleLogout = () => {
    setIsManager(false)
    setCurrentManager(null)
    setSessionPassword('')
    localStorage.removeItem(`wheel_manager_${stationId}`)
    localStorage.removeItem(`station_session_${stationId}`)
    window.location.href = '/login'
  }

  // Change password
  const handleChangePassword = async () => {
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      toast.error('נא למלא את כל השדות')
      return
    }
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error('הסיסמאות החדשות לא תואמות')
      return
    }
    if (passwordForm.new.length < 4) {
      toast.error('הסיסמא חייבת להכיל לפחות 4 תווים')
      return
    }
    setActionLoading(true)
    try {
      const response = await fetch(`/api/wheel-stations/${stationId}/auth`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: currentManager?.phone,
          current_password: passwordForm.current,
          new_password: passwordForm.new
        })
      })
      const data = await response.json()
      if (!response.ok) {
        toast.error(data.error || 'שגיאה בשינוי סיסמא')
        return
      }
      toast.success('הסיסמא שונתה בהצלחה!')
      // Update session password and localStorage with new password
      setSessionPassword(passwordForm.new)
      const savedSession = localStorage.getItem(`wheel_manager_${stationId}`)
      if (savedSession) {
        const session = JSON.parse(savedSession)
        session.password = passwordForm.new
        localStorage.setItem(`wheel_manager_${stationId}`, JSON.stringify(session))
      }
      setShowChangePasswordModal(false)
      setPasswordForm({ current: '', new: '', confirm: '' })
    } catch {
      toast.error('שגיאה בשינוי סיסמא')
    } finally {
      setActionLoading(false)
    }
  }

  // Show recovery certificate
  const handleShowRecoveryCert = async () => {
    setRecoveryLoading(true)
    setShowRecoveryCertModal(true)
    try {
      const response = await fetch(`/api/wheel-stations/${stationId}/recovery?phone=${encodeURIComponent(currentManager?.phone || '')}&password=${encodeURIComponent(sessionPassword)}`)
      const data = await response.json()
      if (!response.ok) {
        toast.error(data.error || 'שגיאה בטעינת תעודת שחזור')
        setShowRecoveryCertModal(false)
        return
      }
      setRecoveryData(data)
    } catch {
      toast.error('שגיאה בטעינת תעודת שחזור')
      setShowRecoveryCertModal(false)
    } finally {
      setRecoveryLoading(false)
    }
  }

  // Download recovery certificate as image - draw directly on canvas
  const handleDownloadCertificate = async () => {
    if (!recoveryData) return
    try {
      const QRCode = await import('qrcode')
      const qrDataUrl = await QRCode.toDataURL(recoveryData.recovery_key, {
        width: 440,
        margin: 2,
        color: { dark: '#1a1a2e', light: '#ffffff' }
      })

      const canvas = document.createElement('canvas')
      const scale = 2
      const w = 400 * scale
      const h = 520 * scale
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.scale(scale, scale)

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, 400, 520)
      grad.addColorStop(0, '#1a1a2e')
      grad.addColorStop(0.5, '#16213e')
      grad.addColorStop(1, '#0f3460')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.roundRect(0, 0, 400, 520, 16)
      ctx.fill()

      // Gold border
      ctx.strokeStyle = '#f59e0b'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.roundRect(0, 0, 400, 520, 16)
      ctx.stroke()

      // Top gold bar
      ctx.fillStyle = '#f59e0b'
      ctx.fillRect(0, 0, 400, 4)

      // Title
      ctx.textAlign = 'center'
      ctx.fillStyle = '#f59e0b'
      ctx.font = 'bold 24px Arial'
      ctx.fillText('תעודת שחזור', 200, 42)

      ctx.fillStyle = '#9ca3af'
      ctx.font = '12px Arial'
      ctx.fillText('Recovery Certificate', 200, 60)

      // Manager info
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 18px Arial'
      ctx.fillText(recoveryData.manager_name, 200, 90)

      ctx.fillStyle = '#60a5fa'
      ctx.font = '14px Arial'
      ctx.fillText(recoveryData.role, 200, 110)

      ctx.fillStyle = '#9ca3af'
      ctx.font = '14px Arial'
      ctx.fillText(recoveryData.station_name, 200, 130)

      // QR code
      const qrImg = new Image()
      qrImg.onload = () => {
        const qrSize = 240
        const qrX = (400 - qrSize) / 2
        const qrY = 150

        // White background for QR
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.roundRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32, 12)
        ctx.fill()

        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)

        // Footer text
        ctx.fillStyle = '#6b7280'
        ctx.font = '11px Arial'
        ctx.fillText('Wheels App - אין לשתף תעודה זו', 200, 465)

        // Download
        const link = document.createElement('a')
        link.download = `תעודת-שחזור-${recoveryData.manager_name}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
        toast.success('התעודה הורדה בהצלחה! שמור אותה במקום בטוח')
      }
      qrImg.src = qrDataUrl
    } catch {
      toast.error('שגיאה בהורדת התעודה')
    }
  }

  // Handle forgot password with QR image upload
  const handleForgotPasswordUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setForgotError('')
    setActionLoading(true)

    try {
      const jsQR = (await import('jsqr')).default
      const img = new Image()
      const reader = new FileReader()

      reader.onload = () => {
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const maxSize = 1024
          let w = img.width
          let h = img.height
          if (w > maxSize || h > maxSize) {
            const ratio = Math.min(maxSize / w, maxSize / h)
            w = Math.round(w * ratio)
            h = Math.round(h * ratio)
          }
          canvas.width = w
          canvas.height = h
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            setForgotError('שגיאה בעיבוד התמונה')
            setActionLoading(false)
            return
          }
          ctx.drawImage(img, 0, 0, w, h)
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const qrCode = jsQR(imageData.data, imageData.width, imageData.height)

          if (!qrCode) {
            setForgotError('לא נמצא קוד QR בתמונה. נסה תמונה ברורה יותר.')
            setActionLoading(false)
            return
          }

          // We have the recovery key from QR
          handleResetWithKey(qrCode.data)
        }
        img.src = reader.result as string
      }
      reader.readAsDataURL(file)
    } catch {
      setForgotError('שגיאה בקריאת הקובץ')
      setActionLoading(false)
    }
  }

  const handleResetWithKey = async (recoveryKey: string) => {
    if (!forgotPhone) {
      setForgotError('נא להזין מספר טלפון')
      setActionLoading(false)
      return
    }
    if (!forgotNewPassword || !forgotConfirmPassword) {
      setForgotError('נא למלא סיסמא חדשה ואימות')
      setActionLoading(false)
      return
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('הסיסמאות לא תואמות')
      setActionLoading(false)
      return
    }
    if (forgotNewPassword.length < 4) {
      setForgotError('הסיסמא חייבת להכיל לפחות 4 תווים')
      setActionLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/wheel-stations/${stationId}/recovery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: forgotPhone,
          recovery_key: recoveryKey,
          new_password: forgotNewPassword
        })
      })
      const data = await response.json()
      if (!response.ok) {
        setForgotError(data.error || 'שגיאה באיפוס הסיסמא')
        return
      }
      setForgotSuccess(true)
      toast.success('הסיסמא אופסה בהצלחה!')
    } catch {
      setForgotError('שגיאה באיפוס הסיסמא')
    } finally {
      setActionLoading(false)
    }
  }

  // Return wheel
  const handleReturn = async (wheel: Wheel) => {
    const borrowInfo = wheel.current_borrow
    const depositInfo = borrowInfo?.deposit_type && borrowInfo.deposit_type !== 'none'
      ? `\n\nתזכורת: יש להחזיר פיקדון!\nסוג: ${borrowInfo.deposit_type === 'cash' ? 'מזומן' : borrowInfo.deposit_type === 'credit_card' ? 'כרטיס אשראי' : borrowInfo.deposit_type === 'id' ? 'תעודת זהות' : borrowInfo.deposit_type}${borrowInfo.deposit_details ? `\nפרטים: ${borrowInfo.deposit_details}` : ''}`
      : ''

    showConfirm({
      title: 'החזרת גלגל',
      message: `להחזיר את גלגל #${wheel.wheel_number}?${depositInfo}`,
      confirmText: 'החזר',
      variant: 'info',
      onConfirm: async () => {
        closeConfirmDialog()
        setActionLoading(true)
        try {
          const response = await fetch(`/api/wheel-stations/${stationId}/wheels/${wheel.id}/borrow`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              manager_phone: currentManager?.phone,
              manager_password: sessionPassword
            })
          })
          if (!response.ok) {
            const errData = await response.json().catch(parseErr => {
              console.error('[StationPage] failed to parse error response:', parseErr)
              return {}
            })
            throw new Error(errData.error || 'Failed to return')
          }
          await fetchStation()
          toast.success('הגלגל הוחזר בהצלחה!')
        } catch (err: any) {
          toast.error(err.message || 'שגיאה בהחזרה')
        } finally {
          setActionLoading(false)
        }
      }
    })
  }

  // Manual borrow - submit form
  const handleManualBorrow = async () => {
    if (!manualBorrowWheel) return

    // Validate required fields and highlight missing ones
    const errors: string[] = []
    if (!manualBorrowForm.borrower_name.trim()) errors.push('borrower_name')
    if (!manualBorrowForm.borrower_phone.trim()) errors.push('borrower_phone')

    if (errors.length > 0) {
      setManualBorrowFormErrors(errors)
      toast.error('נא למלא את כל שדות החובה')
      return
    }

    setManualBorrowFormErrors([])
    setActionLoading(true)
    try {
      const response = await fetch(`/api/wheel-stations/${stationId}/wheels/${manualBorrowWheel.id}/borrow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          borrower_name: manualBorrowForm.borrower_name,
          borrower_phone: manualBorrowForm.borrower_phone,
          borrower_id_number: manualBorrowForm.borrower_id_number || undefined,
          borrower_address: manualBorrowForm.borrower_address || undefined,
          vehicle_model: manualBorrowForm.vehicle_model || undefined,
          vehicle_plate: manualBorrowForm.vehicle_plate || undefined,
          deposit_type: manualBorrowForm.deposit_type,
          notes: manualBorrowForm.notes || undefined,
          manager_phone: currentManager?.phone,
          manager_password: sessionPassword
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'שגיאה בהשאלה')
      }

      await fetchStation()
      setShowManualBorrowModal(false)
      setManualBorrowWheel(null)
      setManualBorrowForm({
        borrower_name: '',
        borrower_phone: '',
        borrower_id_number: '',
        borrower_address: '',
        vehicle_model: '',
        vehicle_plate: '',
        deposit_type: 'cash',
        notes: ''
      })
      setManualBorrowFormErrors([])
      toast.success('ההשאלה נרשמה בהצלחה!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'שגיאה בהשאלה')
    } finally {
      setActionLoading(false)
    }
  }

  // Add wheel
  const handleAddWheel = async () => {
    // Validate required fields and highlight missing ones
    const errors: string[] = []
    if (!wheelForm.wheel_number) errors.push('wheel_number')
    if (!wheelForm.rim_size) errors.push('rim_size')
    if (!wheelForm.bolt_spacing) errors.push('bolt_spacing')

    if (errors.length > 0) {
      setWheelFormErrors(errors)
      return
    }
    setWheelFormErrors([])
    setActionLoading(true)
    try {
      const response = await fetch(`/api/wheel-stations/${stationId}/wheels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wheel_number: wheelForm.wheel_number,
          rim_size: wheelForm.rim_size,
          bolt_count: parseInt(wheelForm.bolt_count),
          bolt_spacing: parseFloat(wheelForm.bolt_spacing),
          center_bore: wheelForm.center_bore ? parseFloat(wheelForm.center_bore) : null,
          tire_size: wheelForm.tire_size || null,
          category: wheelForm.category || null,
          is_donut: wheelForm.is_donut,
          notes: wheelForm.notes || null,
          custom_deposit: wheelForm.custom_deposit ? parseInt(wheelForm.custom_deposit) : null,
          manager_phone: currentManager?.phone,
          manager_password: sessionPassword
        })
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add')
      }
      await fetchStation()
      setShowAddWheelModal(false)
      setShowCustomCategory(false)
      setWheelForm({
        wheel_number: '',
        rim_size: '',
        bolt_count: '4',
        bolt_spacing: '',
        center_bore: '',
        tire_size: '',
        category: '',
        is_donut: false,
        notes: '',
        custom_deposit: ''
      })
      toast.success('הגלגל נוסף בהצלחה!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'שגיאה בהוספה')
    } finally {
      setActionLoading(false)
    }
  }

  // Edit wheel
  const handleEditWheel = async () => {
    if (!selectedWheel) return

    // Validate required fields
    const errors: string[] = []
    if (!wheelForm.wheel_number) errors.push('wheel_number')
    if (!wheelForm.rim_size) errors.push('rim_size')
    if (!wheelForm.bolt_spacing) errors.push('bolt_spacing')

    if (errors.length > 0) {
      setWheelFormErrors(errors)
      return
    }
    setWheelFormErrors([])
    setActionLoading(true)
    try {
      const response = await fetch(`/api/wheel-stations/${stationId}/wheels/${selectedWheel.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wheel_number: wheelForm.wheel_number,
          rim_size: wheelForm.rim_size,
          bolt_count: parseInt(wheelForm.bolt_count),
          bolt_spacing: parseFloat(wheelForm.bolt_spacing),
          center_bore: wheelForm.center_bore ? parseFloat(wheelForm.center_bore) : null,
          tire_size: wheelForm.tire_size || null,
          category: wheelForm.category || null,
          is_donut: wheelForm.is_donut,
          notes: wheelForm.notes || null,
          custom_deposit: wheelForm.custom_deposit ? parseInt(wheelForm.custom_deposit) : null,
          manager_phone: currentManager?.phone,
          manager_password: sessionPassword
        })
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update')
      }
      await fetchStation()
      setShowEditWheelModal(false)
      setSelectedWheel(null)
      setShowCustomCategory(false)
      setWheelForm({
        wheel_number: '',
        rim_size: '',
        bolt_count: '4',
        bolt_spacing: '',
        center_bore: '',
        tire_size: '',
        category: '',
        is_donut: false,
        notes: '',
        custom_deposit: ''
      })
      toast.success('הגלגל עודכן בהצלחה!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'שגיאה בעדכון')
    } finally {
      setActionLoading(false)
    }
  }

  // Delete wheel
  const handleDeleteWheel = async (wheel: Wheel) => {
    showConfirm({
      title: 'מחיקת גלגל',
      message: `למחוק את גלגל #${wheel.wheel_number}? פעולה זו אינה ניתנת לביטול`,
      confirmText: 'מחק',
      variant: 'danger',
      onConfirm: async () => {
        closeConfirmDialog()
        setActionLoading(true)
        try {
          const response = await fetch(`/api/wheel-stations/${stationId}/wheels/${wheel.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              manager_phone: currentManager?.phone,
              manager_password: sessionPassword
            })
          })
          if (!response.ok) throw new Error('Failed to delete')
          await fetchStation()
          toast.success('הגלגל נמחק!')
        } catch {
          toast.error('שגיאה במחיקה')
        } finally {
          setActionLoading(false)
        }
      }
    })
  }

  // Open WhatsApp share modal
  const openWhatsAppModal = (wheel: Wheel) => {
    setWhatsAppWheel(wheel)
    setWhatsAppPhone('')
    setShowWhatsAppModal(true)
  }

  // Send WhatsApp message with pre-filled form link
  const sendWhatsAppLink = () => {
    if (!whatsAppPhone.trim() || !whatsAppWheel) {
      toast.error('נא להזין מספר טלפון')
      return
    }

    // Clean the phone number
    const cleanPhone = whatsAppPhone.replace(/\D/g, '')
    const internationalPhone = cleanPhone.startsWith('0') ? '972' + cleanPhone.slice(1) : cleanPhone

    // Build the form URL with pre-filled wheel and phone
    const formUrl = `${window.location.origin}/sign/${stationId}?wheel=${whatsAppWheel.wheel_number}&phone=${encodeURIComponent(whatsAppPhone)}`

    // WhatsApp message
    const message = `שלום רב 👋
מצורף כאן קישור לחתימה על טופס השאלת גלגל.
הגלגל המתאים ביותר עבורך כבר נבחר ורק נשאר להשלים פרטים.

${formUrl}`

    // Open WhatsApp
    const whatsappUrl = `https://wa.me/${internationalPhone}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')

    setShowWhatsAppModal(false)
    toast.success('נפתח בוואטסאפ!')
  }

  const copyWhatsAppText = () => {
    if (!whatsAppPhone.trim() || !whatsAppWheel) {
      toast.error('נא להזין מספר טלפון')
      return
    }

    const formUrl = `${window.location.origin}/sign/${stationId}?wheel=${whatsAppWheel.wheel_number}&phone=${encodeURIComponent(whatsAppPhone)}`

    const message = `שלום רב 👋
מצורף כאן קישור לחתימה על טופס השאלת גלגל.
הגלגל המתאים ביותר עבורך כבר נבחר ורק נשאר להשלים פרטים.

${formUrl}`

    navigator.clipboard.writeText(message)
    setShowWhatsAppModal(false)
    toast.success('הטקסט הועתק!')
  }

  // Save contacts
  const handleSaveContacts = async () => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/wheel-stations/${stationId}/managers`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          managers: contacts,
          manager_phone: currentManager?.phone,
          manager_password: sessionPassword
        })
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save')
      }
      if (data.managers) setContacts(data.managers)
      await fetchStation()
      setShowContactsModal(false)
      toast.success('אנשי הקשר עודכנו!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'שגיאה בשמירה')
    } finally {
      setActionLoading(false)
    }
  }

  // Excel upload handler
  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Clear the input so the same file can be selected again
    event.target.value = ''

    setUploadLoading(true)
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const data = e.target?.result
          const workbook = XLSX.read(data, { type: 'binary' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet)

          if (jsonData.length === 0) {
            toast.error('הקובץ ריק או לא תקין')
            setUploadLoading(false)
            return
          }

          // Send to import API
          const response = await fetch(`/api/wheel-stations/${stationId}/import`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-station-auth': JSON.stringify({
                phone: currentManager?.phone,
                password: sessionPassword
              })
            },
            body: JSON.stringify({
              wheels: jsonData
            })
          })

          const result = await response.json()

          if (!response.ok) {
            toast.error(result.error || 'שגיאה בייבוא')
            return
          }

          await fetchStation()
          toast.success(`נוספו ${result.imported} גלגלים בהצלחה!`)
          if (result.errors && result.errors.length > 0) {
            toast.error(`${result.errors.length} שורות נכשלו`)
          }
        } catch (err) {
          console.error('Excel parse error:', err)
          toast.error('שגיאה בקריאת הקובץ')
        } finally {
          setUploadLoading(false)
        }
      }
      reader.readAsBinaryString(file)
    } catch {
      toast.error('שגיאה בטעינת הקובץ')
      setUploadLoading(false)
    }
  }

  // Google Sheets import handler
  const handleSheetsImport = async () => {
    if (!sheetsUrl.trim()) {
      toast.error('נא להזין קישור לגיליון Google Sheets')
      return
    }

    setUploadLoading(true)
    try {
      const response = await fetch(`/api/wheel-stations/${stationId}/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-station-auth': JSON.stringify({
            phone: currentManager?.phone,
            password: sessionPassword
          })
        },
        body: JSON.stringify({
          sheetsUrl: sheetsUrl.trim(),
          replace_existing: false
        })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Import error:', result)
        const errorMsg = result.details ? `${result.error}: ${result.details.join(', ')}` : result.error
        toast.error(errorMsg || 'שגיאה בייבוא מ-Google Sheets')
        return
      }

      await fetchStation()
      toast.success(`נוספו ${result.imported} גלגלים בהצלחה מ-Google Sheets!`)
      setShowExcelModal(false)
      setSheetsUrl('')
    } catch (err) {
      console.error('Sheets import error:', err)
      toast.error('שגיאה בייבוא מ-Google Sheets')
    } finally {
      setUploadLoading(false)
    }
  }

  // Mark wheel as temporarily unavailable
  const handleMarkUnavailable = async () => {
    if (!selectedWheelForUnavailable) return

    setActionLoading(true)
    try {
      const response = await fetch(`/api/wheels/${selectedWheelForUnavailable.id}/unavailable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: unavailableReason,
          notes: unavailableNotes,
          manager_id: currentManager?.id
        })
      })

      if (!response.ok) {
        throw new Error('Failed to mark unavailable')
      }

      await fetchStation()
      toast.success('הגלגל סומן כלא זמין זמנית')
      setShowUnavailableModal(false)
      setSelectedWheelForUnavailable(null)
      setUnavailableReason('maintenance')
      setUnavailableNotes('')
    } catch (err) {
      console.error('Error marking unavailable:', err)
      toast.error('שגיאה בסימון הגלגל')
    } finally {
      setActionLoading(false)
    }
  }

  // Mark wheel as available again
  const handleMarkAvailable = async (wheel: Wheel) => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/wheels/${wheel.id}/unavailable`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to mark available')
      }

      await fetchStation()
      toast.success('הגלגל חזר להיות זמין')
    } catch (err) {
      console.error('Error marking available:', err)
      toast.error('שגיאה בעדכון הגלגל')
    } finally {
      setActionLoading(false)
    }
  }

  // Excel export handler (used by reports tab)
  const handleExportWithOptions = () => {
    if (!reportChecks.inventory && !reportChecks.history && !reportChecks.unavailable) {
      toast.error('יש לבחור לפחות נתון אחד לייצוא')
      return
    }

    const wb = XLSX.utils.book_new()
    const date = new Date().toISOString().split('T')[0]
    const dateFrom = reportDateFrom ? new Date(reportDateFrom) : null
    const dateTo = reportDateTo ? new Date(reportDateTo + 'T23:59:59') : null

    if (reportChecks.inventory && station?.wheels.length) {
      const inventoryData = station.wheels
        .filter(w => !w.temporarily_unavailable)
        .map(wheel => ({
          'מספר גלגל': wheel.wheel_number,
          'גודל ג\'אנט': wheel.rim_size,
          'כמות ברגים': wheel.bolt_count,
          'מרווח ברגים': wheel.bolt_spacing,
          'CB': wheel.center_bore || '',
          'מידות צמיג': wheel.tire_size || '',
          'קטגוריה': wheel.category || '',
          'דונאט': wheel.is_donut ? 'כן' : 'לא',
          'הערות': wheel.notes || '',
          'זמין': wheel.is_available ? 'כן' : 'לא',
          'שם שואל': wheel.current_borrow?.borrower_name || '',
          'טלפון שואל': wheel.current_borrow?.borrower_phone || '',
        }))
      const wsInventory = XLSX.utils.json_to_sheet(inventoryData)
      wsInventory['!cols'] = [
        { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 14 },
        { wch: 10 }, { wch: 14 }, { wch: 8 }, { wch: 25 }, { wch: 8 }, { wch: 20 }, { wch: 15 },
      ]
      XLSX.utils.book_append_sheet(wb, wsInventory, 'מלאי גלגלים')
    }

    if (reportChecks.unavailable && station?.wheels.length) {
      const unavailableData = station.wheels
        .filter(w => w.temporarily_unavailable)
        .map(wheel => ({
          'מספר גלגל': wheel.wheel_number,
          'גודל ג\'אנט': wheel.rim_size,
          'סיבת אי-זמינות': wheel.unavailable_reason || '',
          'הערות': wheel.unavailable_notes || '',
          'מתאריך': wheel.unavailable_since ? new Date(wheel.unavailable_since).toLocaleDateString('he-IL') : '',
        }))
      if (unavailableData.length) {
        const wsUnavailable = XLSX.utils.json_to_sheet(unavailableData)
        wsUnavailable['!cols'] = [{ wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 25 }, { wch: 14 }]
        XLSX.utils.book_append_sheet(wb, wsUnavailable, 'גלגלים לא זמינים')
      }
    }

    if (reportChecks.history) {
      let filteredBorrowsForExport = [...borrows]
      if (dateFrom) filteredBorrowsForExport = filteredBorrowsForExport.filter(b => new Date(b.borrow_date) >= dateFrom)
      if (dateTo) filteredBorrowsForExport = filteredBorrowsForExport.filter(b => new Date(b.borrow_date) <= dateTo)

      if (filteredBorrowsForExport.length) {
        const historyData = filteredBorrowsForExport.map(borrow => ({
          'שם פונה': borrow.borrower_name,
          'טלפון': borrow.borrower_phone,
          'ת.ז.': borrow.borrower_id_number || '',
          'כתובת': borrow.borrower_address || '',
          'דגם רכב': borrow.vehicle_model || '',
          'מספר גלגל': borrow.wheels?.wheel_number || '',
          'תאריך השאלה': borrow.borrow_date ? new Date(borrow.borrow_date).toLocaleDateString('he-IL') : '',
          'תאריך החזרה': borrow.actual_return_date ? new Date(borrow.actual_return_date).toLocaleDateString('he-IL') : '',
          'סוג פיקדון': (() => {
            const depositAmount = borrow.wheels?.custom_deposit || station?.deposit_amount || 200
            return borrow.deposit_type === 'cash' ? `₪${depositAmount} מזומן` :
                   borrow.deposit_type === 'bit' ? `₪${depositAmount} ביט` :
                   borrow.deposit_type === 'paybox' ? `₪${depositAmount} פייבוקס` :
                   borrow.deposit_type === 'bank_transfer' ? `₪${depositAmount} העברה` :
                   borrow.deposit_type === 'id' ? 'ת.ז.' :
                   borrow.deposit_type === 'license' ? 'רישיון' : ''
          })(),
          'סטטוס': borrow.status === 'pending' ? 'ממתין' :
                   borrow.status === 'borrowed' ? 'מושאל' :
                   borrow.status === 'returned' ? 'הוחזר' :
                   borrow.status === 'rejected' ? 'נדחה' : borrow.status,
          'חתום': borrow.is_signed ? 'כן' : 'לא',
          'הערות': borrow.notes || '',
        }))
        const wsHistory = XLSX.utils.json_to_sheet(historyData)
        wsHistory['!cols'] = [
          { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 25 }, { wch: 20 },
          { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 15 }, { wch: 10 }, { wch: 8 }, { wch: 25 },
        ]
        XLSX.utils.book_append_sheet(wb, wsHistory, 'היסטוריית השאלות')
      }
    }

    if (wb.SheetNames.length === 0) {
      toast.error('אין נתונים לייצוא בהגדרות הנוכחיות')
      return
    }

    const filename = `wheels_${station?.name.replace(/\s/g, '_') || 'station'}_${date}.xlsx`
    XLSX.writeFile(wb, filename)
    toast.success('הקובץ הורד בהצלחה!')
  }

  const addContact = () => {
    const maxAllowed = station?.max_managers ?? 4
    if (contacts.length >= maxAllowed) {
      toast.error(`ניתן להוסיף עד ${maxAllowed} אנשי קשר`)
      return
    }
    setContacts([...contacts, { id: '', full_name: '', phone: '', role: 'מנהל תחנה', is_primary: false }])
  }

  const removeContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index))
  }

  const updateContact = (index: number, field: string, value: string | boolean) => {
    const updated = [...contacts]
    updated[index] = { ...updated[index], [field]: value }
    setContacts(updated)
  }

  // Custom confirm dialog helper
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

  const filteredWheels = station?.wheels.filter(wheel => {
    if (rimSizeFilter && wheel.rim_size !== rimSizeFilter) return false
    if (boltCountFilter && wheel.bolt_count.toString() !== boltCountFilter) return false
    if (boltSpacingFilter && wheel.bolt_spacing.toString() !== boltSpacingFilter) return false
    if (centerBoreFilter && wheel.center_bore?.toString() !== centerBoreFilter) return false
    if (offsetFilter && wheel.offset?.toString() !== offsetFilter) return false
    if (categoryFilter && wheel.category !== categoryFilter) return false
    if (typeFilter === 'donut' && !wheel.is_donut) return false
    if (typeFilter === 'full' && wheel.is_donut) return false
    if (availabilityFilter === 'available' && !wheel.is_available) return false
    if (availabilityFilter === 'taken' && wheel.is_available) return false
    // Tire size search - only for non-donut wheels
    if ((tireSizeWidth || tireSizeRatio) && !wheel.is_donut) {
      const searchText = `${wheel.wheel_number} ${wheel.notes || ''}`.toLowerCase()
      if (tireSizeWidth && !searchText.includes(tireSizeWidth)) return false
      if (tireSizeRatio && !searchText.includes(tireSizeRatio)) return false
    }
    return true
  }) || []

  // Get unique values for filters
  const rimSizes = [...new Set(station?.wheels.map(w => w.rim_size))].sort()
  const boltCounts = [...new Set(station?.wheels.map(w => w.bolt_count.toString()))].sort()
  const boltSpacings = [...new Set(station?.wheels.map(w => w.bolt_spacing.toString()))].sort()
  const centerBores = [...new Set(station?.wheels.map(w => w.center_bore).filter(Boolean))].sort((a, b) => a! - b!)
  const offsets = [...new Set(station?.wheels.map(w => w.offset).filter(Boolean))].sort((a, b) => a! - b!)
  const categories = [...new Set(station?.wheels.map(w => w.category).filter(Boolean))]

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>טוען מלאי גלגלים...</p>
        </div>
      </div>
    )
  }

  if (error || !station) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <p><span style={{display:'inline-flex',alignItems:'center',gap:'5px'}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>{error || 'תחנה לא נמצאה'}</span></p>
          <Link href="/" style={styles.backLink}>← חזרה לרשימת התחנות</Link>
        </div>
      </div>
    )
  }

  return (
    <>
    {/* Hidden file input for Excel import */}
    <input
      type="file"
      ref={fileInputRef}
      accept=".xlsx,.xls,.csv"
      style={{display: 'none'}}
      onChange={handleExcelUpload}
    />
    <AppHeader currentStationId={stationId} notificationCount={alertCount} pushEnabled={pushEnabled} />
    <div style={styles.container}>
      <style>{`
        /* Desktop styles for Add Wheel Modal */
        .add-wheel-modal {
          max-width: 520px !important;
        }
        .add-wheel-form-row {
          display: grid !important;
          gap: 16px !important;
        }
        .add-wheel-form-row:has(.form-group-item:nth-child(3)) {
          grid-template-columns: 80px 1fr 1fr !important;
        }
        .add-wheel-form-row:not(:has(.form-group-item:nth-child(3))) {
          grid-template-columns: 1fr 1fr !important;
        }
        .form-group-item {
          min-width: 0 !important;
        }
        .form-group-item input,
        .form-group-item select {
          width: 100% !important;
          box-sizing: border-box !important;
        }
        .add-wheel-modal-buttons {
          display: flex !important;
          gap: 12px !important;
          margin-top: 20px !important;
        }
        .add-wheel-modal-buttons button {
          flex: 1 !important;
          padding: 12px 20px !important;
        }

        /* Tablet breakpoint (768px) */
        @media (max-width: 768px) {
          .station-header-title {
            font-size: 1.4rem !important;
          }
          .station-header-top {
            flex-wrap: wrap;
            gap: 8px;
          }
          .station-manager-actions {
            flex-wrap: wrap;
            gap: 6px !important;
            justify-content: flex-end;
          }
          .station-manager-btn {
            padding: 7px 12px !important;
            font-size: 0.8rem !important;
          }
          .station-login-btn {
            padding: 8px 14px !important;
            font-size: 0.85rem !important;
          }
          .station-filter-row {
            flex-direction: column;
            gap: 8px !important;
          }
          .station-filter-group {
            min-width: 100% !important;
          }
          .station-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important;
            gap: 10px !important;
          }
          .station-stats {
            flex-wrap: wrap;
            justify-content: center;
          }
          .station-stat {
            min-width: 85px !important;
            padding: 12px 15px !important;
          }
          .tracking-filter-tabs {
            flex-wrap: wrap !important;
            gap: 6px !important;
          }
          .tracking-stats {
            flex-wrap: wrap !important;
            gap: 10px !important;
          }
          .tracking-stat {
            flex: 1 !important;
            min-width: 100px !important;
          }
        }

        /* Mobile breakpoint (480px) */
        @media (max-width: 480px) {
          .station-header-title {
            font-size: 1.2rem !important;
          }
          .station-manager-btn {
            padding: 6px 10px !important;
            font-size: 0.75rem !important;
          }
          .station-manager-btn .btn-text {
            display: none;
          }
          .station-card-actions {
            flex-direction: column;
            gap: 6px !important;
          }
          .station-card-actions button {
            width: 100% !important;
          }
          .station-grid {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)) !important;
            gap: 8px !important;
          }
          .station-stat {
            min-width: 70px !important;
            padding: 10px 12px !important;
          }
          .station-contact-buttons {
            flex-direction: column;
            gap: 8px !important;
          }
          .station-contact-btn {
            width: 100% !important;
            justify-content: center !important;
          }
          /* Responsive table - convert to cards on mobile */
          .tracking-table-container table {
            display: none !important;
          }
          .tracking-table-container .mobile-cards {
            display: flex !important;
          }
          .tracking-filter-btn {
            padding: 8px 12px !important;
            font-size: 0.8rem !important;
          }
          .tracking-stat {
            min-width: 80px !important;
            padding: 10px !important;
          }
          .tracking-stat-value {
            font-size: 1.3rem !important;
          }
          .floating-contact-btn {
            bottom: 15px !important;
            left: 15px !important;
            width: 50px !important;
            height: 50px !important;
            font-size: 20px !important;
          }
        }

        @media (min-width: 481px) {
          .tracking-table-container .mobile-cards {
            display: none !important;
          }
        }

        /* Add Wheel Modal responsive styles */
        @media (max-width: 480px) {
          .add-wheel-form-row {
            display: grid !important;
            grid-template-columns: 1fr !important;
            gap: 0 !important;
          }
          .add-wheel-form-row .form-group-item {
            width: 100% !important;
            margin-bottom: 12px !important;
          }
          .add-wheel-modal {
            padding: 20px !important;
            max-height: 90vh !important;
          }
          .add-wheel-modal-title {
            font-size: 1.1rem !important;
          }
          .add-wheel-modal input,
          .add-wheel-modal select {
            padding: 12px !important;
            font-size: 16px !important; /* Prevents iOS zoom */
          }
          .add-wheel-modal-buttons {
            flex-direction: column-reverse !important;
            gap: 10px !important;
          }
          .add-wheel-modal-buttons button {
            width: 100% !important;
            padding: 14px !important;
          }
        }
      `}</style>
      {/* Station Info Section */}
      <div style={styles.stationInfoSection}>
        <div style={styles.stationInfoHeader}>
          <h1 style={styles.stationTitle} className="station-header-title">
            {station.name}
          </h1>
          {station.district && (
            <div style={{
              padding: '3px 10px',
              border: `1.5px solid ${getDistrictColor(station.district, districts)}`,
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: '600',
              color: getDistrictColor(station.district, districts),
              backgroundColor: `${getDistrictColor(station.district, districts)}15`,
              whiteSpace: 'nowrap',
            }}>
              {getDistrictName(station.district, districts)}
            </div>
          )}
        </div>
        {station.address && <p style={{...styles.stationAddress,display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>{station.address}</p>}

        {/* Mini alert bar - replaces the old full banner */}
        {isManager && alertCount > 0 && activeTab !== 'alerts' && (
          <button
            onClick={() => setActiveTab('alerts')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'linear-gradient(135deg, #fef2f2, #fff7ed)',
              border: '1px solid #f87171', borderRadius: '10px',
              padding: '10px 16px', marginBottom: '12px', cursor: 'pointer',
              width: '100%', fontSize: '0.9rem', color: '#dc2626', fontWeight: 600
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span>{alertCount} התראות חדשות</span>
            <span style={{ marginRight: 'auto', color: '#9ca3af', fontSize: '0.8rem' }}>עבור להתראות ←</span>
          </button>
        )}

        {/* Tab Navigation - only show tracking tab for managers */}
        {isManager && (
          <div id="onboarding-tab-nav" style={styles.tabNav}>
            <button
              style={{...styles.tabBtn, ...(activeTab === 'wheels' ? styles.tabBtnActive : {})}}
              onClick={() => setActiveTab('wheels')}
            >
              <span style={{display:'inline-flex',alignItems:'center',gap:'5px'}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>מלאי גלגלים</span>
            </button>
            <button
              style={{...styles.tabBtn, ...(activeTab === 'tracking' ? styles.tabBtnActive : {}), position: 'relative'}}
              onClick={() => setActiveTab('tracking')}
            >
              <span style={{display:'inline-flex',alignItems:'center',gap:'5px'}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>מעקב השאלות</span>
              {borrowStats.pending > 0 && (
                <span style={styles.pendingIndicator}>{borrowStats.pending}</span>
              )}
            </button>
            <button
              style={{...styles.tabBtn, ...(activeTab === 'alerts' ? styles.tabBtnActive : {}), position: 'relative'}}
              onClick={() => setActiveTab('alerts')}
            >
              <span style={{display:'inline-flex',alignItems:'center',gap:'5px'}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>התראות</span>
              {alertCount > 0 && (
                <span style={styles.pendingIndicator}>{alertCount}</span>
              )}
            </button>
            <button
              id="onboarding-reports-btn"
              style={{...styles.tabBtn, ...(activeTab === 'reports' ? styles.tabBtnActive : {})}}
              onClick={() => setActiveTab('reports')}
            >
              <span style={{display:'inline-flex',alignItems:'center',gap:'5px'}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>דוחות</span>
            </button>
          </div>
        )}
      </div>

      {/* Stats - Only show on wheels tab */}
      {activeTab === 'wheels' && (
        <div style={styles.stats} className="station-stats">
          <div style={styles.stat} className="station-stat">
            <div style={styles.statValue}>{station.totalWheels}</div>
            <div style={styles.statLabel}>סה"כ גלגלים</div>
          </div>
          <div style={{...styles.stat, ...styles.statAvailable}} className="station-stat">
            <div style={{...styles.statValue, color: '#10b981'}}>{station.availableWheels}</div>
            <div style={styles.statLabel}>זמינים</div>
          </div>
          <div style={{...styles.stat, ...styles.statTaken}} className="station-stat">
            <div style={{...styles.statValue, color: '#ef4444'}}>{station.totalWheels - station.availableWheels}</div>
            <div style={styles.statLabel}>מושאלים</div>
          </div>
        </div>
      )}

      {/* Tracking Tab Content */}
      {activeTab === 'tracking' && isManager && (
        <div style={styles.trackingSection}>
          {/* Tracking Stats */}
          <div style={styles.trackingStats} className="tracking-stats">
            <div style={styles.trackingStat} className="tracking-stat">
              <div style={{...styles.trackingStatValue, color: '#ec4899'}} className="tracking-stat-value">{borrowStats.pending}</div>
              <div style={styles.trackingStatLabel}>ממתינים לאישור</div>
            </div>
            <div style={styles.trackingStat} className="tracking-stat">
              <div style={{...styles.trackingStatValue, color: '#10b981'}} className="tracking-stat-value">{borrowStats.totalBorrowed}</div>
              <div style={styles.trackingStatLabel}>מושאלים</div>
            </div>
            <div style={styles.trackingStat} className="tracking-stat">
              <div style={{...styles.trackingStatValue, color: '#8b5cf6'}} className="tracking-stat-value">{borrowStats.totalReturned}</div>
              <div style={styles.trackingStatLabel}>הוחזרו</div>
            </div>
          </div>

          {/* Filter tabs */}
          <div style={styles.trackingFilterTabs} className="tracking-filter-tabs">
            <button
              style={{...styles.trackingFilterBtn, ...(borrowFilter === 'all' ? styles.trackingFilterBtnActive : {})}}
              className="tracking-filter-btn"
              onClick={() => setBorrowFilter('all')}
            >
              הכל
            </button>
            <button
              style={{...styles.trackingFilterBtn, ...(borrowFilter === 'pending' ? styles.trackingFilterBtnActive : {}), ...(borrowStats.pending > 0 ? styles.trackingFilterBtnPending : {})}}
              className="tracking-filter-btn"
              onClick={() => setBorrowFilter('pending')}
            >
              ממתינים ({borrowStats.pending})
            </button>
            <button
              style={{...styles.trackingFilterBtn, ...(borrowFilter === 'borrowed' ? styles.trackingFilterBtnActive : {})}}
              className="tracking-filter-btn"
              onClick={() => setBorrowFilter('borrowed')}
            >
              מושאלים
            </button>
            <button
              style={{...styles.trackingFilterBtn, ...(borrowFilter === 'returned' ? styles.trackingFilterBtnActive : {})}}
              className="tracking-filter-btn"
              onClick={() => setBorrowFilter('returned')}
            >
              הוחזרו
            </button>
          </div>

          {/* Borrows Table */}
          {borrowsLoading ? (
            <div style={styles.loading}>טוען...</div>
          ) : (
            <div style={styles.trackingTableWrapper} className="tracking-table-container">
              {/* Desktop Table */}
              <table style={styles.trackingTable}>
                <thead>
                  <tr>
                    <th style={{...styles.trackingTh, width: '25%'}}>פונה</th>
                    <th style={{...styles.trackingTh, width: '20%'}}>גלגל</th>
                    <th style={{...styles.trackingTh, width: '15%'}}>פיקדון</th>
                    <th style={{...styles.trackingTh, width: '20%'}}>סטטוס</th>
                    <th style={{...styles.trackingTh, width: '20%'}}>פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {borrows.map(borrow => {
                    const isOverdue = borrow.status === 'borrowed' && !borrow.is_signed &&
                      borrow.created_at && (Date.now() - new Date(borrow.created_at).getTime() > 24 * 60 * 60 * 1000)
                    return (
                      <tr key={borrow.id}>
                        <td style={styles.trackingTd}>
                          <div style={styles.borrowerNameCell}>{borrow.borrower_name}</div>
                          <div style={styles.borrowerInfoCell}>{borrow.borrower_phone}</div>
                          <div style={styles.borrowerInfoCell}>
                            {new Date(borrow.borrow_date || borrow.created_at).toLocaleDateString('he-IL')}
                          </div>
                          {borrow.referred_by_name && (
                            <div style={{...styles.borrowerInfoCell, color: '#a855f7', fontSize: '0.7rem', display:'inline-flex',alignItems:'center',gap:'3px'}}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.72 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.63 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.91 5.91l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>הופנה ע&quot;י: {borrow.referred_by_name}
                            </div>
                          )}
                        </td>
                        <td style={styles.trackingTd}>
                          <div>{borrow.wheels?.wheel_number || '-'}</div>
                          {borrow.vehicle_model && (
                            <div style={styles.borrowerInfoCell}>{borrow.vehicle_model}</div>
                          )}
                        </td>
                        <td style={styles.trackingTd}>
                          <span style={{
                            ...styles.depositBadge,
                            ...(borrow.deposit_type === 'cash' || borrow.deposit_type === 'bit' ? styles.depositBadgeMoney :
                                borrow.deposit_type === 'id' || borrow.deposit_type === 'license' ? styles.depositBadgeDoc : {})
                          }}>
                            {(() => {
                              const depositAmount = borrow.wheels?.custom_deposit || station.deposit_amount || 200
                              return borrow.deposit_type === 'cash' ? `₪${depositAmount} מזומן` :
                                     borrow.deposit_type === 'bit' ? `₪${depositAmount} ביט` :
                                     borrow.deposit_type === 'paybox' ? `₪${depositAmount} פייבוקס` :
                                     borrow.deposit_type === 'bank_transfer' ? `₪${depositAmount} העברה` :
                                     borrow.deposit_type === 'id' ? 'ת.ז.' :
                                     borrow.deposit_type === 'license' ? 'רישיון' : '-'
                            })()}
                          </span>
                        </td>
                        <td style={styles.trackingTd}>
                          {borrow.status === 'pending' ? (
                            <span style={{...styles.statusPending,display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>ממתין לאישור</span>
                          ) : borrow.status === 'returned' ? (
                            <span style={{...styles.statusReturned,display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/></svg>הוחזר</span>
                          ) : borrow.status === 'rejected' ? (
                            <span style={{...styles.statusOverdue,display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>נדחה</span>
                          ) : borrow.is_signed ? (
                            <span style={{...styles.statusSigned,display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>מושאל (חתום)</span>
                          ) : isOverdue ? (
                            <span style={{...styles.statusOverdue,display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>מושאל (לא חתום)</span>
                          ) : (
                            <span style={{...styles.statusWaiting,display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>מושאל</span>
                          )}
                        </td>
                        <td style={styles.trackingTd}>
                          <div style={styles.actionButtons}>
                            {borrow.status === 'pending' && (
                              <>
                                <button
                                  style={styles.approveBtn}
                                  onClick={() => handleBorrowAction(borrow.id, 'approve')}
                                  disabled={approvalLoading === borrow.id}
                                >
                                  {approvalLoading === borrow.id ? '...' : <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>אשר</span>}
                                </button>
                                <button
                                  style={styles.rejectBtn}
                                  onClick={() => handleBorrowAction(borrow.id, 'reject')}
                                  disabled={approvalLoading === borrow.id}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                                </button>
                              </>
                            )}
                            {borrow.status === 'borrowed' && !borrow.is_signed && (
                              <a
                                href={generateWhatsAppLink(borrow.borrower_name, borrow.borrower_phone)}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={styles.whatsappBtn}
                              >
                                <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>שלח טופס</span>
                              </a>
                            )}
                            {borrow.status === 'borrowed' && (
                              <button
                                style={styles.returnBtnSmall}
                                onClick={() => {
                                  const wheel = station?.wheels.find(w => w.id === borrow.wheel_id)
                                  if (wheel) handleReturn(wheel)
                                }}
                              >
                                <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/></svg>החזר</span>
                              </button>
                            )}
                            {borrow.form_id && (
                              <a
                                href={`/forms/${borrow.form_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={styles.viewFormBtn}
                              >
                                <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>צפה בטופס</span>
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {borrows.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{padding: '40px'}}>
                        <div style={styles.emptyState}>
                          <div style={styles.emptyIcon}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg></div>
                          <div style={styles.emptyTitle}>אין רשומות להצגה</div>
                          <div style={styles.emptyText}>כשתהיינה השאלות או החזרות, הן יופיעו כאן</div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Mobile Cards */}
              <div className="mobile-cards" style={{display: 'none', flexDirection: 'column', gap: '12px'}}>
                {borrows.length === 0 ? (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg></div>
                    <div style={styles.emptyTitle}>אין רשומות להצגה</div>
                    <div style={styles.emptyText}>כשתהיינה השאלות או החזרות, הן יופיעו כאן</div>
                  </div>
                ) : borrows.map(borrow => {
                  const isOverdue = borrow.status === 'borrowed' && !borrow.is_signed &&
                    borrow.created_at && (Date.now() - new Date(borrow.created_at).getTime() > 24 * 60 * 60 * 1000)
                  const isExpanded = expandedCards.has(borrow.id)
                  const toggleCard = () => {
                    setExpandedCards(prev => {
                      const next = new Set(prev)
                      if (next.has(borrow.id)) {
                        next.delete(borrow.id)
                      } else {
                        next.add(borrow.id)
                      }
                      return next
                    })
                  }
                  return (
                    <div key={borrow.id} style={styles.mobileCard}>
                      <div
                        style={{...styles.mobileCardHeader, cursor: 'pointer'}}
                        onClick={toggleCard}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '12px', color: '#6b7280' }}>{isExpanded ? '▼' : '◀'}</span>
                          <div>
                            <div style={styles.borrowerNameCell}>{borrow.borrower_name}</div>
                            {isExpanded && <div style={styles.borrowerInfoCell}>{borrow.borrower_phone}</div>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {!isExpanded && <span style={{color: '#9ca3af', fontSize: '12px'}}>{borrow.wheels?.wheel_number || '-'}</span>}
                          {borrow.status === 'pending' ? (
                            <span style={{...styles.statusPending,display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>ממתין</span>
                          ) : borrow.status === 'returned' ? (
                            <span style={{...styles.statusReturned,display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/></svg>הוחזר</span>
                          ) : borrow.status === 'rejected' ? (
                            <span style={{...styles.statusOverdue,display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>נדחה</span>
                          ) : borrow.is_signed ? (
                            <span style={{...styles.statusSigned,display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>חתום</span>
                          ) : isOverdue ? (
                            <span style={{...styles.statusOverdue,display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>לא חתום</span>
                          ) : (
                            <span style={{...styles.statusWaiting,display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>מושאל</span>
                          )}
                        </div>
                      </div>
                      {isExpanded && (
                        <>
                          <div style={styles.mobileCardBody}>
                            <div style={styles.mobileCardRow}>
                              <span style={{color: '#9ca3af'}}>גלגל:</span>
                              <span>{borrow.wheels?.wheel_number || '-'}</span>
                            </div>
                            <div style={styles.mobileCardRow}>
                              <span style={{color: '#9ca3af'}}>תאריך:</span>
                              <span>{new Date(borrow.borrow_date || borrow.created_at).toLocaleDateString('he-IL')}</span>
                            </div>
                            <div style={styles.mobileCardRow}>
                              <span style={{color: '#9ca3af'}}>פיקדון:</span>
                              <span style={{
                                ...styles.depositBadge,
                                ...(borrow.deposit_type === 'cash' || borrow.deposit_type === 'bit' ? styles.depositBadgeMoney :
                                    borrow.deposit_type === 'id' || borrow.deposit_type === 'license' ? styles.depositBadgeDoc : {})
                              }}>
                                {(() => {
                                  const depositAmount = borrow.wheels?.custom_deposit || station.deposit_amount || 200
                                  return borrow.deposit_type === 'cash' ? `₪${depositAmount} מזומן` :
                                         borrow.deposit_type === 'bit' ? `₪${depositAmount} ביט` :
                                         borrow.deposit_type === 'paybox' ? `₪${depositAmount} פייבוקס` :
                                         borrow.deposit_type === 'bank_transfer' ? `₪${depositAmount} העברה` :
                                         borrow.deposit_type === 'id' ? 'ת.ז.' :
                                         borrow.deposit_type === 'license' ? 'רישיון' : '-'
                                })()}
                              </span>
                            </div>
                            {borrow.vehicle_model && (
                              <div style={styles.mobileCardRow}>
                                <span style={{color: '#9ca3af'}}>רכב:</span>
                                <span>{borrow.vehicle_model}</span>
                              </div>
                            )}
                            {borrow.referred_by_name && (
                              <div style={styles.mobileCardRow}>
                                <span style={{color: '#9ca3af'}}>הופנה ע&quot;י:</span>
                                <span style={{color: '#a855f7'}}>{borrow.referred_by_name}</span>
                              </div>
                            )}
                          </div>
                          <div style={styles.mobileCardActions}>
                            {borrow.status === 'pending' && (
                              <>
                                <button
                                  style={{...styles.approveBtn, flex: 1}}
                                  onClick={(e) => { e.stopPropagation(); handleBorrowAction(borrow.id, 'approve') }}
                                  disabled={approvalLoading === borrow.id}
                                >
                                  {approvalLoading === borrow.id ? '...' : <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>אשר</span>}
                                </button>
                                <button
                                  style={styles.rejectBtn}
                                  onClick={(e) => { e.stopPropagation(); handleBorrowAction(borrow.id, 'reject') }}
                                  disabled={approvalLoading === borrow.id}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                                </button>
                              </>
                            )}
                            {borrow.status === 'borrowed' && !borrow.is_signed && (
                              <a
                                href={generateWhatsAppLink(borrow.borrower_name, borrow.borrower_phone)}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{...styles.whatsappBtn, flex: 1, textAlign: 'center'}}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>שלח טופס</span>
                              </a>
                            )}
                            {borrow.status === 'borrowed' && (
                              <button
                                style={{...styles.returnBtnSmall, flex: 1}}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  const wheel = station?.wheels.find(w => w.id === borrow.wheel_id)
                                  if (wheel) handleReturn(wheel)
                                }}
                              >
                                <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/></svg>החזר</span>
                              </button>
                            )}
                            {borrow.form_id && (
                              <a
                                href={`/forms/${borrow.form_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{...styles.viewFormBtn, flex: 1, textAlign: 'center'}}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>צפה בטופס</span>
                              </a>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Alerts Tab Content */}
      {activeTab === 'alerts' && isManager && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Deleted Wheels Section */}
          {deletedWheels.length > 0 && (
            <div style={{
              background: '#fef2f2',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid #fecaca'
            }}>
              <h3 style={{ color: '#f87171', margin: '0 0 12px 0', fontSize: '1rem' }}>
                <span style={{display:'inline-flex',alignItems:'center',gap:'5px'}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>גלגלים שנמחקו ({deletedWheels.length})</span>
              </h3>
              {[...deletedWheels]
                .sort((a, b) => {
                  const aDismissed = dismissedDeletedIds.has(a.id) ? 1 : 0
                  const bDismissed = dismissedDeletedIds.has(b.id) ? 1 : 0
                  return aDismissed - bDismissed
                })
                .map(wheel => {
                const isDismissed = dismissedDeletedIds.has(wheel.id)
                const deletedDate = new Date(wheel.deleted_at)
                const restoreDeadline = new Date(deletedDate)
                restoreDeadline.setDate(restoreDeadline.getDate() + 14)
                const daysLeft = Math.ceil((restoreDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

                return (
                  <div key={wheel.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: isDismissed ? '#f8fafc' : '#ffffff',
                    borderRadius: '8px', padding: '10px 14px', marginBottom: '6px',
                    border: isDismissed ? '1px solid #e2e8f0' : '1px solid #fecaca',
                    opacity: isDismissed ? 0.5 : 1
                  }}>
                    <div>
                      <span style={{ fontWeight: 600, color: '#e2e8f0' }}>
                        גלגל #{wheel.wheel_number}
                      </span>
                      <span style={{ color: '#94a3b8', marginRight: '8px', fontSize: '0.85rem' }}>
                        {wheel.bolt_count}x{wheel.bolt_spacing} R{wheel.rim_size}
                      </span>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                        נמחק ע&quot;י {wheel.deleted_by_name} · {deletedDate.toLocaleDateString('he-IL')} · נותרו {daysLeft} ימים לשחזור
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button
                        onClick={() => handleRestoreWheel(wheel.id)}
                        disabled={restoringWheel === wheel.id}
                        style={{
                          background: '#10b981', color: 'white', border: 'none',
                          padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                          fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap',
                          opacity: restoringWheel === wheel.id ? 0.6 : 1
                        }}
                      >
                        {restoringWheel === wheel.id ? '...' : <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/></svg>שחזר</span>}
                      </button>
                      {!isDismissed && (
                        <button
                          onClick={() => handleDismissDeleted(wheel.id)}
                          style={{
                            background: 'rgba(255,255,255,0.1)', color: '#94a3b8', border: 'none',
                            padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                            fontSize: '0.8rem', whiteSpace: 'nowrap'
                          }}
                        >
                          <span style={{display:'inline-flex',alignItems:'center',gap:'3px'}}>ראיתי <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Overdue Loans Section */}
          {overdueBorrows.length > 0 && (
            <div style={{
              background: '#fefce8',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid #fde68a'
            }}>
              <h3 style={{ color: '#92400e', margin: '0 0 12px 0', fontSize: '1rem' }}>
                <span style={{display:'inline-flex',alignItems:'center',gap:'6px'}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>השאלות ארוכות ({overdueBorrows.length})</span>
              </h3>
              {[...overdueBorrows]
                .sort((a, b) => {
                  const aDismissed = dismissedLoanIds.has(a.id) ? 1 : 0
                  const bDismissed = dismissedLoanIds.has(b.id) ? 1 : 0
                  return aDismissed - bDismissed
                })
                .map(borrow => {
                const isDismissed = dismissedLoanIds.has(borrow.id)
                const borrowDate = new Date(borrow.borrow_date || borrow.created_at)
                const daysSince = Math.floor((Date.now() - borrowDate.getTime()) / (1000 * 60 * 60 * 24))

                return (
                  <div key={borrow.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: isDismissed ? '#f8fafc' : '#ffffff',
                    borderRadius: '8px', padding: '10px 14px', marginBottom: '6px',
                    border: isDismissed ? '1px solid #e2e8f0' : '1px solid #fde68a',
                    opacity: isDismissed ? 0.5 : 1
                  }}>
                    <div>
                      <span style={{ fontWeight: 600, color: '#e2e8f0' }}>
                        גלגל #{borrow.wheels?.wheel_number || '?'}
                      </span>
                      <span style={{ color: '#94a3b8', marginRight: '8px', fontSize: '0.85rem' }}>
                        {borrow.wheels ? `${borrow.wheels.bolt_count}x${borrow.wheels.bolt_spacing} R${borrow.wheels.rim_size}` : ''}
                      </span>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                        מושאל ל{borrow.borrower_name} · {borrow.borrower_phone} · {daysSince} ימים
                      </div>
                    </div>
                    {!isDismissed && (
                      <button
                        onClick={() => handleDismissLoan(borrow.id)}
                        style={{
                          background: 'rgba(255,255,255,0.1)', color: '#94a3b8', border: 'none',
                          padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                          fontSize: '0.8rem', whiteSpace: 'nowrap', flexShrink: 0
                        }}
                      >
                        <span style={{display:'inline-flex',alignItems:'center',gap:'3px'}}>ראיתי <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Empty state */}
          {deletedWheels.length === 0 && overdueBorrows.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              <span style={{ display: 'block', marginBottom: '10px' }}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>
              <p>אין התראות כרגע</p>
            </div>
          )}
        </div>
      )}

      {/* Reports Tab Content */}
      {activeTab === 'reports' && isManager && (() => {
        // Readiness metrics
        const readyWheels = station ? station.wheels.filter(w => w.is_available && !w.temporarily_unavailable).length : 0

        // Last borrow time
        const sortedBorrows = [...borrows].sort((a, b) => new Date(b.borrow_date).getTime() - new Date(a.borrow_date).getTime())
        const lastBorrow = sortedBorrows[0]
        let lastBorrowLabel = 'טרם בוצעו השאלות'
        if (lastBorrow) {
          const diffMs = Date.now() - new Date(lastBorrow.borrow_date).getTime()
          const diffHours = Math.floor(diffMs / 3600000)
          const diffDays = Math.floor(diffMs / 86400000)
          if (diffDays >= 1) lastBorrowLabel = `לפני ${diffDays} ימים`
          else if (diffHours >= 1) lastBorrowLabel = `לפני ${diffHours} שעות`
          else lastBorrowLabel = 'לפני פחות משעה'
        }

        // Bar chart: last 5 active days
        const dayCountMap: Record<string, number> = {}
        borrows.forEach(b => {
          const day = new Date(b.borrow_date).toLocaleDateString('he-IL')
          dayCountMap[day] = (dayCountMap[day] || 0) + 1
        })
        const activeDays = Object.entries(dayCountMap)
          .sort((a, b) => {
            const [da, ma, ya] = a[0].split('.').map(Number)
            const [db, mb, yb] = b[0].split('.').map(Number)
            return new Date(ya, ma - 1, da).getTime() - new Date(yb, mb - 1, db).getTime()
          })
          .slice(-5)
        const maxCount = activeDays.length ? Math.max(...activeDays.map(d => d[1])) : 1

        // Gold insight: most borrowed wheel
        const wheelBorrowCount: Record<string, number> = {}
        borrows.forEach(b => {
          if (b.wheel_id) wheelBorrowCount[b.wheel_id] = (wheelBorrowCount[b.wheel_id] || 0) + 1
        })
        const topWheelId = Object.entries(wheelBorrowCount).sort((a, b) => b[1] - a[1])[0]
        const topWheel = topWheelId ? station?.wheels.find(w => w.id === topWheelId[0]) : null
        const topWheelCount = topWheelId?.[1] ?? 0

        return (
          <div style={{padding: '20px 0'}}>
            {/* Readiness Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3" style={{gap: '12px', marginBottom: '24px'}}>
              <div style={{background: '#1e293b', borderRadius: '12px', padding: '18px', textAlign: 'center'}}>
                <div style={{fontSize: '2rem', fontWeight: 700, color: '#10b981'}}>{readyWheels}</div>
                <div style={{fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px'}}>גלגלים מוכנים לשימוש</div>
              </div>
              <div style={{background: '#1e293b', borderRadius: '12px', padding: '18px', textAlign: 'center'}}>
                <div style={{fontSize: '1.2rem', fontWeight: 700, color: '#f59e0b', lineHeight: 1.3}}>{lastBorrowLabel}</div>
                <div style={{fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px'}}>השאלה אחרונה</div>
              </div>
              <div style={{background: '#1e293b', borderRadius: '12px', padding: '18px', textAlign: 'center'}}>
                <div style={{fontSize: '2rem', fontWeight: 700, color: '#3b82f6'}}>{borrows.length}</div>
                <div style={{fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px'}}>סה&quot;כ השאלות מאז הקמה</div>
              </div>
            </div>

            {/* Activity Bar Chart */}
            <div style={{background: '#1e293b', borderRadius: '14px', padding: '20px', marginBottom: '16px'}}>
              <h4 style={{margin: '0 0 16px', color: '#fff', fontSize: '0.95rem', fontWeight: 700}}>פעילות אחרונה (5 ימים פעילים)</h4>
              {activeDays.length === 0 ? (
                <div style={{textAlign: 'center', color: '#64748b', fontSize: '0.9rem', padding: '24px 0'}}>טרם בוצעו השאלות בתחנה זו</div>
              ) : (
                <div style={{display: 'flex', alignItems: 'flex-end', gap: '10px', height: '100px', width: '100%'}}>
                  {activeDays.map(([day, count]) => (
                    <div key={day} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'}}>
                      <div style={{fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600}}>{count}</div>
                      <div style={{
                        width: '100%',
                        minHeight: '12px',
                        height: `${Math.max(12, Math.round((count / maxCount) * 72))}px`,
                        background: 'linear-gradient(180deg, #3b82f6, #1d4ed8)',
                        borderRadius: '4px 4px 0 0',
                      }} />
                      <div style={{fontSize: '0.68rem', color: '#64748b', textAlign: 'center', whiteSpace: 'nowrap'}}>{day}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Gold Insight */}
            <div style={{background: 'linear-gradient(135deg, #1e293b, #0f172a)', border: '1px solid #f59e0b44', borderRadius: '14px', padding: '18px', display: 'flex', alignItems: 'center', gap: '14px'}}>
              <div style={{fontSize: '1.8rem'}}>🏆</div>
              {topWheel ? (
                <div>
                  <div style={{color: '#f59e0b', fontWeight: 700, fontSize: '0.95rem'}}>הגלגל המבוקש ביותר</div>
                  <div style={{color: '#e2e8f0', fontSize: '0.9rem', marginTop: '2px'}}>
                    גלגל #{topWheel.wheel_number} — הושאל <strong>{topWheelCount}</strong> פעמים
                  </div>
                </div>
              ) : (
                <div style={{color: '#64748b', fontSize: '0.9rem'}}>טרם בוצעו השאלות בתחנה זו</div>
              )}
            </div>
          </div>
        )
      })()}

      {/* Wheels Tab Content */}
      {activeTab === 'wheels' && (
        <>
      <div id="onboarding-wheels-area" style={{position:'absolute',pointerEvents:'none',opacity:0,height:0}} />
      {/* Filters */}
      <div style={styles.filters}>
        <div style={styles.filtersHeader}>
          <h3 style={{...styles.filtersTitle,display:'inline-flex',alignItems:'center',gap:'5px'}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>סינון</h3>
          <div style={{display: 'flex', gap: '8px'}}>
            {hasActiveFilters && (
              <button
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
                onClick={clearAllFilters}
              >
                <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>נקה הכל</span>
              </button>
            )}
            <button
              style={{...styles.filtersToggle, ...(showAdvancedFilters ? styles.filtersToggleActive : {})}}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              {showAdvancedFilters ? '- פחות אפשרויות' : '+ עוד אפשרויות'}
            </button>
          </div>
        </div>
        <div style={styles.filterRow} className="station-filter-row">
          <div style={styles.filterGroup} className="station-filter-group">
            <label style={styles.filterLabel}>גודל ג'אנט</label>
            <select
              style={styles.filterSelect}
              value={rimSizeFilter}
              onChange={e => setRimSizeFilter(e.target.value)}
            >
              <option value="">הכל</option>
              {rimSizes.map(size => (
                <option key={size} value={size}>{size}"</option>
              ))}
            </select>
          </div>
          <div style={styles.filterGroup} className="station-filter-group">
            <label style={styles.filterLabel}>כמות ברגים</label>
            <select
              style={styles.filterSelect}
              value={boltCountFilter}
              onChange={e => setBoltCountFilter(e.target.value)}
            >
              <option value="">הכל</option>
              {boltCounts.map(count => (
                <option key={count} value={count}>{count}</option>
              ))}
            </select>
          </div>
          <div style={styles.filterGroup} className="station-filter-group">
            <label style={styles.filterLabel}>מרווח ברגים</label>
            <select
              style={styles.filterSelect}
              value={boltSpacingFilter}
              onChange={e => setBoltSpacingFilter(e.target.value)}
            >
              <option value="">הכל</option>
              {boltSpacings.map(spacing => (
                <option key={spacing} value={spacing}>{spacing}</option>
              ))}
            </select>
          </div>
        </div>
        {showAdvancedFilters && (
          <>
            <div style={styles.filterRow} className="station-filter-row">
              <div style={styles.filterGroup} className="station-filter-group">
                <label style={styles.filterLabel}>CB (קוטר מרכז)</label>
                <select
                  style={styles.filterSelect}
                  value={centerBoreFilter}
                  onChange={e => setCenterBoreFilter(e.target.value)}
                >
                  <option value="">הכל</option>
                  {centerBores.map(cb => (
                    <option key={cb} value={cb?.toString()}>{cb}</option>
                  ))}
                </select>
              </div>
              <div style={styles.filterGroup} className="station-filter-group">
                <label style={styles.filterLabel}>קור (ET)</label>
                <select
                  style={styles.filterSelect}
                  value={offsetFilter}
                  onChange={e => setOffsetFilter(e.target.value)}
                >
                  <option value="">הכל</option>
                  {offsets.map(off => (
                    <option key={off} value={off?.toString()}>{off}</option>
                  ))}
                </select>
              </div>
              <div style={styles.filterGroup} className="station-filter-group">
                <label style={styles.filterLabel}>קטגוריה</label>
                <select
                  style={styles.filterSelect}
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                >
                  <option value="">הכל</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat || ''}>{cat}</option>
                  ))}
                </select>
              </div>
              <div style={styles.filterGroup} className="station-filter-group">
                <label style={styles.filterLabel}>סוג</label>
                <select
                  style={styles.filterSelect}
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                >
                  <option value="">הכל</option>
                  <option value="full">מלא</option>
                  <option value="donut">דונאט</option>
                </select>
              </div>
              <div style={styles.filterGroup} className="station-filter-group">
                <label style={styles.filterLabel}>זמינות</label>
                <select
                  style={styles.filterSelect}
                  value={availabilityFilter}
                  onChange={e => setAvailabilityFilter(e.target.value)}
                >
                  <option value="">הכל</option>
                  <option value="available">זמין בלבד</option>
                  <option value="taken">מושאל</option>
                </select>
              </div>
            </div>
            {/* Tire Size Filter */}
            <div style={{marginTop: '12px', padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px dashed #3b82f6'}}>
              <label style={{...styles.filterLabel, marginBottom: '8px', display: 'block', color: '#3b82f6'}}>
                <span style={{display:'inline-flex',alignItems:'center',gap:'5px'}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>חיפוש לפי מידת גלגל (מחפש במספר גלגל והערות)</span>
              </label>
              <div style={{display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap'}}>
                <input
                  type="text"
                  placeholder="רוחב (205)"
                  value={tireSizeWidth}
                  onChange={e => setTireSizeWidth(e.target.value.replace(/\D/g, ''))}
                  style={{...styles.filterSelect, width: '80px', textAlign: 'center'}}
                />
                <span style={{color: '#9ca3af'}}>/</span>
                <input
                  type="text"
                  placeholder="אחוז (55)"
                  value={tireSizeRatio}
                  onChange={e => setTireSizeRatio(e.target.value.replace(/\D/g, ''))}
                  style={{...styles.filterSelect, width: '80px', textAlign: 'center'}}
                />
                <span style={{color: '#6b7280', fontSize: '0.85rem'}}>למשל: 205/55</span>
              </div>
              <p style={{fontSize: '0.75rem', color: '#9ca3af', marginTop: '6px'}}>
                מחפש גלגלים שמספר הגלגל או ההערות שלהם מכילים את המידה
              </p>
            </div>
          </>
        )}
      </div>

      {/* View Toggle */}
      <div style={styles.toolbar}>
        <div style={styles.viewToggle} role="group" aria-label="בחירת תצוגה">
          <button
            style={{...styles.viewBtn, ...(viewMode === 'cards' ? styles.viewBtnActive : {})}}
            onClick={() => setViewMode('cards')}
            aria-label="תצוגת כרטיסים"
            aria-pressed={viewMode === 'cards'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="9" height="9"/><rect x="13" y="3" width="9" height="9"/><rect x="13" y="13" width="9" height="9"/><rect x="2" y="13" width="9" height="9"/></svg>
          </button>
          <button
            style={{...styles.viewBtn, ...(viewMode === 'table' ? styles.viewBtnActive : {})}}
            onClick={() => setViewMode('table')}
            aria-label="תצוגת טבלה"
            aria-pressed={viewMode === 'table'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>
        <div style={styles.resultsCount}>
          מציג {filteredWheels.length} מתוך {station.totalWheels} גלגלים
        </div>
      </div>

      {/* Wheels Grid (Cards View) */}
      {viewMode === 'cards' && (
        <div style={styles.grid} className="station-grid">
          {filteredWheels.length === 0 && (
            <div style={styles.emptyStateCard}>
              <div style={styles.emptyIcon}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg></div>
              <div style={styles.emptyTitle}>לא נמצאו גלגלים</div>
              <div style={styles.emptyText}>נסה לשנות את הסינון או להוסיף גלגלים חדשים</div>
            </div>
          )}
          {filteredWheels.map(wheel => (
            <div
              key={wheel.id}
              id={`wheel-${wheel.wheel_number}`}
              style={{
                ...styles.card,
                ...(wheel.is_available ? {} : styles.cardTaken),
                transition: 'box-shadow 0.3s ease'
              }}
            >
              <div style={styles.cardImage}>
                <img
                  src={wheel.is_donut ? '/wheel-donut.png' : '/wheel-normal.png'}
                  alt={wheel.is_donut ? 'דונאט' : 'גלגל'}
                  style={styles.wheelImg}
                />
                <span style={styles.cardNumber}>#{wheel.wheel_number}</span>
                {wheel.is_donut && <span style={styles.donutBadge}>דונאט</span>}
                {wheel.temporarily_unavailable && (
                  <span style={{
                    position: 'absolute',
                    top: '45px',
                    right: '10px',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: '#fff',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  }}>
                    <span style={{display:'inline-flex',alignItems:'center',gap:'3px'}}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>לא זמין</span>
                  </span>
                )}
                <span style={{
                  ...styles.cardStatus,
                  ...(wheel.is_available ? styles.statusAvailable : styles.statusTaken)
                }}>
                  {wheel.is_available ? 'זמין' : 'מושאל'}
                </span>
              </div>
              <div style={styles.cardInfo}>
                <div style={styles.cardSpecs}>
                  <span style={styles.spec}>{wheel.rim_size}"</span>
                  <span style={styles.spec}>{wheel.bolt_count}×{wheel.bolt_spacing}</span>
                  {wheel.center_bore && <span style={styles.spec}>CB {wheel.center_bore}</span>}
                </div>
                {wheel.category && <div style={styles.cardCategory}>{wheel.category}</div>}
                {wheel.notes && <div style={styles.cardNotes}>{wheel.notes}</div>}

                {/* Temporarily unavailable info - for managers */}
                {isManager && wheel.temporarily_unavailable && (
                  <div style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '8px',
                    padding: '8px',
                    marginTop: '8px',
                    fontSize: '0.85rem',
                  }}>
                    <div style={{ color: '#f59e0b', fontWeight: 'bold', marginBottom: '4px' }}>
                      <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>לא זמין זמנית</span>
                    </div>
                    <div style={{ color: '#a0aec0', fontSize: '0.8rem' }}>
                      סיבה: {wheel.unavailable_reason === 'maintenance' ? 'תחזוקה' :
                             wheel.unavailable_reason === 'repair' ? 'תיקון' :
                             wheel.unavailable_reason === 'damaged' ? 'פגום' : 'אחר'}
                    </div>
                    {wheel.unavailable_notes && (
                      <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '2px' }}>
                        {wheel.unavailable_notes}
                      </div>
                    )}
                  </div>
                )}

                {/* Borrower info when wheel is taken - only for managers */}
                {isManager && !wheel.is_available && wheel.current_borrow && (
                  <div style={styles.borrowerInfo}>
                    <div style={{...styles.borrowerName,display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>{wheel.current_borrow.borrower_name}</div>
                    <div style={{...styles.borrowerPhone,display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>{wheel.current_borrow.borrower_phone}</div>
                    {wheel.current_borrow.borrow_date && (
                      <div style={{...styles.borrowDate,display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>{new Date(wheel.current_borrow.borrow_date).toLocaleDateString('he-IL')}</div>
                    )}
                  </div>
                )}

                {/* Manager action buttons with options menu */}
                {isManager && (
                  <div style={styles.cardActions} className="station-card-actions">
                    {/* Return to available for temporarily unavailable */}
                    {wheel.temporarily_unavailable && (
                      <button
                        style={{
                          ...styles.returnBtn,
                          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        }}
                        onClick={() => handleMarkAvailable(wheel)}
                        disabled={actionLoading}
                      >
                        <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>החזר לזמין</span>
                      </button>
                    )}

                    {/* Options button with dropdown */}
                    <div style={{ position: 'relative' }}>
                      <button
                        style={{
                          ...styles.optionsBtn,
                          ...(openOptionsMenu === wheel.id && { background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }),
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenOptionsMenu(openOptionsMenu === wheel.id ? null : wheel.id)
                        }}
                      >
                        <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>אפשרויות</span>
                      </button>

                      {/* Dropdown menu */}
                      {openOptionsMenu === wheel.id && (
                        <div style={styles.optionsDropdown} onClick={e => e.stopPropagation()}>
                          {/* Return wheel - only for borrowed wheels */}
                          {!wheel.is_available && !wheel.temporarily_unavailable && (
                            <button
                              style={styles.optionItem}
                              onClick={() => {
                                handleReturn(wheel)
                                setOpenOptionsMenu(null)
                              }}
                            >
                              <span style={{display:'inline-flex',alignItems:'center',gap:'5px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="8 17 12 21 16 17"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"/></svg>החזר גלגל</span>
                            </button>
                          )}

                          {/* View form - only for borrowed wheels with form */}
                          {!wheel.is_available && wheel.current_borrow?.form_id && (
                            <a
                              href={`/forms/${wheel.current_borrow.form_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{...styles.optionItem, textDecoration: 'none', display: 'block'}}
                              onClick={() => setOpenOptionsMenu(null)}
                            >
                              <span style={{display:'inline-flex',alignItems:'center',gap:'5px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>צפייה בטופס</span>
                            </a>
                          )}

                          {/* WhatsApp share - only for available wheels */}
                          {wheel.is_available && !wheel.temporarily_unavailable && (
                            <button
                              style={styles.optionItem}
                              onClick={() => {
                                openWhatsAppModal(wheel)
                                setOpenOptionsMenu(null)
                              }}
                            >
                              <span style={{display:'inline-flex',alignItems:'center',gap:'5px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>שלח קישור בוואטסאפ</span>
                            </button>
                          )}

                          {/* Manual borrow - only for available wheels */}
                          {wheel.is_available && !wheel.temporarily_unavailable && (
                            <button
                              style={styles.optionItem}
                              onClick={() => {
                                setManualBorrowWheel(wheel)
                                setShowManualBorrowModal(true)
                                setOpenOptionsMenu(null)
                              }}
                            >
                              <span style={{display:'inline-flex',alignItems:'center',gap:'5px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>הזן השאלה ידנית</span>
                            </button>
                          )}

                          {/* Mark unavailable - only for available wheels */}
                          {wheel.is_available && !wheel.temporarily_unavailable && (
                            <button
                              style={styles.optionItem}
                              onClick={() => {
                                setSelectedWheelForUnavailable(wheel)
                                setShowUnavailableModal(true)
                                setOpenOptionsMenu(null)
                              }}
                            >
                              <span style={{display:'inline-flex',alignItems:'center',gap:'5px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>סמן כלא זמין</span>
                            </button>
                          )}

                          {/* Edit wheel - disabled for borrowed wheels */}
                          <button
                            style={{
                              ...styles.optionItem,
                              ...(!wheel.is_available && !wheel.temporarily_unavailable ? styles.optionItemDisabled : {})
                            }}
                            disabled={!wheel.is_available && !wheel.temporarily_unavailable}
                            onClick={() => {
                              if (!wheel.is_available && !wheel.temporarily_unavailable) return
                              setSelectedWheel(wheel)
                              setWheelForm({
                                wheel_number: wheel.wheel_number,
                                rim_size: wheel.rim_size,
                                bolt_count: String(wheel.bolt_count),
                                bolt_spacing: String(wheel.bolt_spacing),
                                center_bore: wheel.center_bore ? String(wheel.center_bore) : '',
                                tire_size: wheel.tire_size || '',
                                category: wheel.category || '',
                                is_donut: wheel.is_donut,
                                notes: wheel.notes || '',
                                custom_deposit: wheel.custom_deposit ? String(wheel.custom_deposit) : ''
                              })
                              setShowEditWheelModal(true)
                              setOpenOptionsMenu(null)
                            }}
                          >
                            <span style={{display:'inline-flex',alignItems:'center',gap:'5px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>ערוך גלגל {!wheel.is_available && !wheel.temporarily_unavailable && '(מושאל)'}</span>
                          </button>

                          {/* Delete wheel - disabled for borrowed wheels */}
                          <button
                            style={{
                              ...styles.optionItem,
                              color: wheel.is_available || wheel.temporarily_unavailable ? '#ef4444' : '#9ca3af',
                              ...(!wheel.is_available && !wheel.temporarily_unavailable ? styles.optionItemDisabled : {})
                            }}
                            disabled={!wheel.is_available && !wheel.temporarily_unavailable}
                            onClick={() => {
                              if (!wheel.is_available && !wheel.temporarily_unavailable) return
                              handleDeleteWheel(wheel)
                              setOpenOptionsMenu(null)
                            }}
                          >
                            <span style={{display:'inline-flex',alignItems:'center',gap:'5px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>מחק גלגל {!wheel.is_available && !wheel.temporarily_unavailable && '(מושאל)'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Wheels Table View */}
      {viewMode === 'table' && (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>ג'אנט</th>
                <th style={styles.th}>ברגים</th>
                <th style={styles.th}>CB</th>
                <th style={styles.th}>קטגוריה</th>
                <th style={styles.th}>סוג</th>
                <th style={styles.th}>הערות</th>
                <th style={styles.th}>סטטוס</th>
              </tr>
            </thead>
            <tbody>
              {filteredWheels.length === 0 && (
                <tr>
                  <td colSpan={8} style={{padding: '40px'}}>
                    <div style={styles.emptyState}>
                      <div style={styles.emptyIcon}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg></div>
                      <div style={styles.emptyTitle}>לא נמצאו גלגלים</div>
                      <div style={styles.emptyText}>נסה לשנות את הסינון או להוסיף גלגלים חדשים</div>
                    </div>
                  </td>
                </tr>
              )}
              {filteredWheels.map(wheel => (
                <tr key={wheel.id} id={`wheel-${wheel.wheel_number}`} style={{...(wheel.is_available ? {} : styles.rowTaken), transition: 'box-shadow 0.3s ease'}}>
                  <td style={styles.td}><strong>{wheel.wheel_number}</strong></td>
                  <td style={styles.td}>{wheel.rim_size}"</td>
                  <td style={styles.td}>{wheel.bolt_count}×{wheel.bolt_spacing}</td>
                  <td style={styles.td}>{wheel.center_bore || '-'}</td>
                  <td style={styles.td}>{wheel.category || '-'}</td>
                  <td style={styles.td}>
                    {wheel.is_donut ? (
                      <span style={styles.donutTag}>דונאט</span>
                    ) : 'מלא'}
                  </td>
                  <td style={{...styles.td, color: '#a0aec0'}}>{wheel.notes || ''}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.tableStatus,
                      ...(wheel.is_available ? styles.tableStatusAvailable : styles.tableStatusTaken)
                    }}>
                      {wheel.is_available ? 'זמין' : 'מושאל'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </>
      )}

      {/* Floating Contact Button - only show when not logged in as manager */}
      {!currentManager && station.wheel_station_managers.length > 0 && (
        <button
          onClick={() => setShowContactsModal(true)}
          className="floating-contact-btn"
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff',
            border: 'none',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            zIndex: 100,
          }}
          aria-label="צור קשר עם מנהל"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.72 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.63 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.91 5.91l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </button>
      )}

      {/* Contacts Modal */}
      {showContactsModal && (
        <div role="presentation" style={styles.modalOverlay} onClick={() => setShowContactsModal(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby="contacts-modal-title" style={{...styles.modal, maxWidth: '350px'}} onClick={e => e.stopPropagation()}>
            <h3 id="contacts-modal-title" style={{...styles.modalTitle,display:'inline-flex',alignItems:'center',gap:'6px'}}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.72 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.63 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.91 5.91l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>צור קשר עם מנהל</h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px'}}>
              {station.wheel_station_managers.map(manager => {
                const cleanPhone = manager.phone.replace(/\D/g, '')
                const internationalPhone = cleanPhone.startsWith('0') ? '972' + cleanPhone.slice(1) : cleanPhone
                return (
                  <div
                    key={manager.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                      <span style={{fontWeight: '500', color: '#1e293b'}}>{manager.full_name}</span>
                      {manager.is_primary && (
                        <span title="מנהל ראשי" style={{
                          fontSize: '16px',
                          lineHeight: 1,
                          filter: 'drop-shadow(0 0 4px #f59e0b)',
                        }}><svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></span>
                      )}
                    </div>
                    <div style={{display: 'flex', gap: '8px'}}>
                      <a
                        href={`tel:${cleanPhone}`}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: '#3b82f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textDecoration: 'none',
                          fontSize: '16px',
                        }}
                        aria-label={`התקשר ל${manager.full_name}`}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.72 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.63 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.91 5.91l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                      </a>
                      <a
                        href={`https://wa.me/${internationalPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: '#22c55e',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textDecoration: 'none',
                          fontSize: '16px',
                        }}
                        aria-label={`שלח וואטסאפ ל${manager.full_name}`}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
            <button style={{...styles.cancelBtn, width: '100%', marginTop: '16px'}} onClick={() => setShowContactsModal(false)}>
              סגור
            </button>
          </div>
        </div>
      )}

      {/* Manual Borrow Modal */}
      {showManualBorrowModal && manualBorrowWheel && (
        <div role="presentation" style={styles.modalOverlay} onClick={() => !actionLoading && setShowManualBorrowModal(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby="manual-borrow-modal-title" style={{...styles.modal, maxWidth: '450px', position: 'relative'}} onClick={e => e.stopPropagation()}>
            {/* Submitting Overlay */}
            {actionLoading && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(15, 23, 42, 0.85)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
              }}>
                <style>{`
                  @keyframes spinManual { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                `}</style>
                <div style={{textAlign: 'center'}}>
                  <div style={{marginBottom: '16px'}}>
                    <svg width="50" height="50" viewBox="0 0 50 50">
                      <circle cx="25" cy="25" r="20" fill="none" stroke="#334155" strokeWidth="4" />
                      <circle
                        cx="25" cy="25" r="20" fill="none" stroke="#10b981" strokeWidth="4"
                        strokeDasharray="125.66" strokeDashoffset="94"
                        style={{ animation: 'spinManual 1s linear infinite', transformOrigin: 'center' }}
                      />
                    </svg>
                  </div>
                  <p style={{color: '#fff', fontSize: '1rem', fontWeight: 'bold', marginBottom: '4px'}}>שומר את ההשאלה...</p>
                  <p style={{color: '#94a3b8', fontSize: '0.85rem'}}>אנא המתן</p>
                </div>
              </div>
            )}
            <h3 id="manual-borrow-modal-title" style={{...styles.modalTitle,display:'inline-flex',alignItems:'center',gap:'6px'}}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>הזנת השאלה ידנית</h3>
            <p style={{color: '#a0aec0', marginBottom: '16px', fontSize: '0.9rem'}}>
              רישום השאלה ללא טופס דיגיטלי (לשימוש כשהפונה לא יכול למלא טופס)
            </p>

            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '10px',
              padding: '12px',
              marginBottom: '16px',
            }}>
              <div style={{display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap'}}>
                <span style={{background: '#3b82f6', color: 'white', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.85rem'}}>
                  גלגל {manualBorrowWheel.wheel_number}
                </span>
                <span style={{color: '#64748b', fontSize: '0.85rem'}}>
                  {manualBorrowWheel.rim_size}" | {manualBorrowWheel.bolt_count}×{manualBorrowWheel.bolt_spacing}
                </span>
                {manualBorrowWheel.is_donut && (
                  <span style={{background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem'}}>דונאט</span>
                )}
              </div>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              <div>
                <label style={{color: '#a0aec0', fontSize: '0.85rem', display: 'block', marginBottom: '4px'}}>
                  שם מלא *
                </label>
                <input
                  type="text"
                  value={manualBorrowForm.borrower_name}
                  onChange={e => { setManualBorrowForm({...manualBorrowForm, borrower_name: e.target.value}); setManualBorrowFormErrors(manualBorrowFormErrors.filter(err => err !== 'borrower_name')) }}
                  placeholder="ישראל ישראלי"
                  style={{...styles.input, ...(manualBorrowFormErrors.includes('borrower_name') ? styles.inputError : {})}}
                  disabled={actionLoading}
                />
              </div>

              <div>
                <label style={{color: '#a0aec0', fontSize: '0.85rem', display: 'block', marginBottom: '4px'}}>
                  טלפון *
                </label>
                <input
                  type="tel"
                  value={manualBorrowForm.borrower_phone}
                  onChange={e => { setManualBorrowForm({...manualBorrowForm, borrower_phone: e.target.value}); setManualBorrowFormErrors(manualBorrowFormErrors.filter(err => err !== 'borrower_phone')) }}
                  placeholder="050-1234567"
                  style={{...styles.input, ...(manualBorrowFormErrors.includes('borrower_phone') ? styles.inputError : {})}}
                  dir="ltr"
                  disabled={actionLoading}
                />
              </div>

              <div>
                <label style={{color: '#a0aec0', fontSize: '0.85rem', display: 'block', marginBottom: '4px'}}>
                  תעודת זהות
                </label>
                <input
                  type="text"
                  value={manualBorrowForm.borrower_id_number}
                  onChange={e => setManualBorrowForm({...manualBorrowForm, borrower_id_number: e.target.value})}
                  placeholder="123456789"
                  maxLength={9}
                  style={styles.input}
                  dir="ltr"
                  disabled={actionLoading}
                />
              </div>

              <div>
                <label style={{color: '#a0aec0', fontSize: '0.85rem', display: 'block', marginBottom: '4px'}}>
                  דגם רכב
                </label>
                <input
                  type="text"
                  value={manualBorrowForm.vehicle_model}
                  onChange={e => setManualBorrowForm({...manualBorrowForm, vehicle_model: e.target.value})}
                  placeholder="יונדאי i25"
                  style={styles.input}
                  disabled={actionLoading}
                />
              </div>

              <div>
                <label style={{color: '#a0aec0', fontSize: '0.85rem', display: 'block', marginBottom: '4px'}}>
                  מספר רכב (אופציונלי)
                </label>
                <input
                  type="text"
                  value={manualBorrowForm.vehicle_plate}
                  onChange={e => setManualBorrowForm({...manualBorrowForm, vehicle_plate: e.target.value})}
                  placeholder="12-345-67"
                  maxLength={10}
                  style={styles.input}
                  dir="ltr"
                  disabled={actionLoading}
                />
              </div>

              <div>
                <label style={{color: '#a0aec0', fontSize: '0.85rem', display: 'block', marginBottom: '4px'}}>
                  סוג פיקדון
                </label>
                <select
                  value={manualBorrowForm.deposit_type}
                  onChange={e => setManualBorrowForm({...manualBorrowForm, deposit_type: e.target.value})}
                  style={styles.input}
                  disabled={actionLoading}
                >
                  <option value="cash">מזומן</option>
                  <option value="bit">ביט</option>
                  <option value="paybox">פייבוקס</option>
                  <option value="bank_transfer">העברה בנקאית</option>
                  <option value="id">תעודת זהות</option>
                  <option value="license">רישיון נהיגה</option>
                </select>
              </div>

              <div>
                <label style={{color: '#a0aec0', fontSize: '0.85rem', display: 'block', marginBottom: '4px'}}>
                  הערות
                </label>
                <textarea
                  value={manualBorrowForm.notes}
                  onChange={e => setManualBorrowForm({...manualBorrowForm, notes: e.target.value})}
                  placeholder="הערות נוספות..."
                  rows={2}
                  style={{...styles.input, resize: 'vertical'}}
                  disabled={actionLoading}
                />
              </div>
            </div>

            <div style={{display: 'flex', gap: '12px', marginTop: '20px'}}>
              <button
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#4b5563',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
                onClick={() => setShowManualBorrowModal(false)}
              >
                ביטול
              </button>
              <button
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
                onClick={handleManualBorrow}
                disabled={actionLoading}
              >
                {actionLoading ? 'שומר...' : <span style={{display:'inline-flex',alignItems:'center',gap:'5px'}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>רשום השאלה</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Share Modal */}
      {showWhatsAppModal && whatsAppWheel && (
        <div role="presentation" style={styles.modalOverlay} onClick={() => setShowWhatsAppModal(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby="whatsapp-modal-title" style={{...styles.modal, maxWidth: '400px'}} onClick={e => e.stopPropagation()}>
            <h3 id="whatsapp-modal-title" style={{...styles.modalTitle,display:'inline-flex',alignItems:'center',gap:'6px'}}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>שליחת קישור לטופס בוואטסאפ</h3>
            <p style={{color: '#a0aec0', marginBottom: '16px', fontSize: '0.9rem'}}>
              שלח הודעת וואטסאפ עם קישור לטופס השאלה. הגלגל ומספר הטלפון יהיו מוגדרים מראש.
            </p>

            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '10px',
              padding: '12px',
              marginBottom: '16px',
            }}>
              <div style={{display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap'}}>
                <span style={{background: '#3b82f6', color: 'white', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.85rem'}}>
                  גלגל {whatsAppWheel.wheel_number}
                </span>
                <span style={{color: '#64748b', fontSize: '0.85rem'}}>
                  {whatsAppWheel.rim_size}" | {whatsAppWheel.bolt_count}×{whatsAppWheel.bolt_spacing}
                </span>
                {whatsAppWheel.is_donut && (
                  <span style={{background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem'}}>דונאט</span>
                )}
              </div>
            </div>

            <div style={{marginBottom: '16px'}}>
              <label style={{color: '#475569', fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '8px'}}>
                מספר טלפון של הפונה
              </label>
              <input
                type="tel"
                inputMode="numeric"
                value={whatsAppPhone}
                onChange={e => setWhatsAppPhone(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && sendWhatsAppLink()}
                placeholder="050-1234567"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  color: '#1e293b',
                  fontSize: '1.1rem',
                  textAlign: 'center',
                  letterSpacing: '1px',
                }}
                dir="ltr"
                autoFocus
              />
            </div>

            <div style={{display: 'flex', gap: '12px', marginBottom: '10px'}}>
              <button
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#4b5563',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
                onClick={() => setShowWhatsAppModal(false)}
              >
                ביטול
              </button>
              <button
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
                onClick={copyWhatsAppText}
              >
                <span style={{display:'inline-flex',alignItems:'center',gap:'5px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>העתק טקסט</span>
              </button>
            </div>
            <button
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
              onClick={sendWhatsAppLink}
            >
              <span style={{display:'inline-flex',alignItems:'center',gap:'5px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>שלח בוואטסאפ</span>
            </button>
          </div>
        </div>
      )}

      {/* Mark Wheel as Unavailable Modal */}
      {showUnavailableModal && selectedWheelForUnavailable && (
        <div role="presentation" style={styles.modalOverlay} onClick={() => setShowUnavailableModal(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby="unavailable-modal-title" style={{...styles.modal, maxWidth: '450px'}} onClick={e => e.stopPropagation()}>
            <h3 id="unavailable-modal-title" style={{...styles.modalTitle,display:'inline-flex',alignItems:'center',gap:'6px'}}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>סימון גלגל כלא זמין זמנית</h3>
            <p style={{color: '#a0aec0', marginBottom: '16px', fontSize: '0.9rem'}}>
              הגלגל יסומן כלא זמין להשאלה עד שתחזיר אותו לזמין
            </p>

            <div style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '10px',
              padding: '12px',
              marginBottom: '16px',
            }}>
              <div style={{display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap'}}>
                <span style={{background: '#2563eb', color: 'white', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.85rem'}}>
                  גלגל {selectedWheelForUnavailable.wheel_number}
                </span>
                <span style={{color: '#64748b', fontSize: '0.85rem'}}>
                  {selectedWheelForUnavailable.rim_size}" | {selectedWheelForUnavailable.bolt_count}×{selectedWheelForUnavailable.bolt_spacing}
                </span>
                {selectedWheelForUnavailable.is_donut && (
                  <span style={{background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem'}}>דונאט</span>
                )}
              </div>
            </div>

            <div style={{marginBottom: '16px'}}>
              <label style={{color: '#475569', fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '8px'}}>
                סיבה *
              </label>
              <select
                value={unavailableReason}
                onChange={e => setUnavailableReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  color: '#1e293b',
                  fontSize: '1rem',
                }}
              >
                <option value="maintenance">תחזוקה</option>
                <option value="repair">תיקון</option>
                <option value="damaged">פגום</option>
                <option value="other">אחר</option>
              </select>
            </div>

            <div style={{marginBottom: '16px'}}>
              <label style={{color: '#475569', fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '8px'}}>
                הערות (אופציונלי)
              </label>
              <textarea
                value={unavailableNotes}
                onChange={e => setUnavailableNotes(e.target.value)}
                placeholder="פרטים נוספים על הבעיה..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  color: '#1e293b',
                  fontSize: '0.95rem',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div style={{display: 'flex', gap: '12px'}}>
              <button
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#4b5563',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
                onClick={() => {
                  setShowUnavailableModal(false)
                  setSelectedWheelForUnavailable(null)
                  setUnavailableReason('maintenance')
                  setUnavailableNotes('')
                }}
              >
                ביטול
              </button>
              <button
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
                onClick={handleMarkUnavailable}
                disabled={actionLoading}
              >
                {actionLoading ? 'שומר...' : <span style={{display:'inline-flex',alignItems:'center',gap:'5px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>סמן כלא זמין</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div role="presentation" style={styles.modalOverlay} onClick={() => setShowLoginModal(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby="login-modal-title" style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 id="login-modal-title" style={{...styles.modalTitle,display:'inline-flex',alignItems:'center',gap:'6px'}}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>כניסת מנהל</h3>
            <p style={styles.modalSubtitle}>הזן את פרטי ההתחברות שלך</p>
            <div style={styles.formGroup}>
              <label style={styles.label}>שם משתמש</label>
              <input
                type="text"
                placeholder="הזן שם משתמש"
                value={loginPhone}
                onChange={e => setLoginPhone(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>סיסמא אישית</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  placeholder="הזן סיסמא אישית"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  style={{...styles.input, paddingLeft: '40px'}}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  aria-label={showLoginPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    fontSize: '16px',
                    opacity: 0.7,
                  }}
                >
                  {showLoginPassword ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                </button>
              </div>
            </div>
            {loginError && <div style={styles.errorText}>{loginError}</div>}
            <div style={styles.modalButtons}>
              <button style={styles.cancelBtn} onClick={() => setShowLoginModal(false)}>ביטול</button>
              <button style={styles.submitBtn} onClick={handleLogin} disabled={actionLoading}>
                {actionLoading ? 'מתחבר...' : 'כניסה'}
              </button>
            </div>
            <button
              onClick={() => {
                setShowLoginModal(false)
                setForgotPhone(loginPhone)
                setForgotNewPassword('')
                setForgotConfirmPassword('')
                setForgotError('')
                setForgotSuccess(false)
                setShowForgotPasswordModal(true)
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#60a5fa',
                cursor: 'pointer',
                fontSize: '0.85rem',
                marginTop: '10px',
                textDecoration: 'underline',
                width: '100%',
                textAlign: 'center'
              }}
            >
              שכחתי סיסמא
            </button>
          </div>
        </div>
      )}

      {/* Add Wheel Modal */}
      {showAddWheelModal && (
        <div role="presentation" style={styles.modalOverlay} onClick={() => { setShowAddWheelModal(false); setShowCustomCategory(false) }}>
          <div role="dialog" aria-modal="true" aria-labelledby="add-wheel-modal-title" style={styles.modal} onClick={e => e.stopPropagation()} className="add-wheel-modal">
            <h3 id="add-wheel-modal-title" style={{...styles.modalTitle,display:'inline-flex',alignItems:'center',gap:'6px'}} className="add-wheel-modal-title"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>הוספת גלגל חדש</h3>
            <div style={styles.formRow} className="add-wheel-form-row">
              <div style={styles.formGroup} className="form-group-item">
                <label style={styles.label}>מספר גלגל *</label>
                <input
                  type="text"
                  placeholder="A23, 15, וכו'"
                  value={wheelForm.wheel_number}
                  onChange={e => { setWheelForm({...wheelForm, wheel_number: e.target.value}); setWheelFormErrors(wheelFormErrors.filter(e => e !== 'wheel_number')) }}
                  style={{...styles.input, ...(wheelFormErrors.includes('wheel_number') ? styles.inputError : {})}}
                />
              </div>
              <div style={styles.formGroup} className="form-group-item">
                <label style={styles.label}>גודל ג'אנט *</label>
                <input
                  type="text"
                  placeholder='14", 15", 16"'
                  value={wheelForm.rim_size}
                  onChange={e => { setWheelForm({...wheelForm, rim_size: e.target.value}); setWheelFormErrors(wheelFormErrors.filter(e => e !== 'rim_size')) }}
                  style={{...styles.input, ...(wheelFormErrors.includes('rim_size') ? styles.inputError : {})}}
                />
              </div>
            </div>
            <div style={styles.formRow} className="add-wheel-form-row">
              <div style={styles.formGroup} className="form-group-item">
                <label style={styles.label}>כמות ברגים</label>
                <select
                  value={wheelForm.bolt_count}
                  onChange={e => setWheelForm({...wheelForm, bolt_count: e.target.value})}
                  style={styles.input}
                >
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                </select>
              </div>
              <div style={styles.formGroup} className="form-group-item">
                <label style={styles.label}>מרווח ברגים *</label>
                <input
                  type="text"
                  placeholder="100, 108, 114.3"
                  value={wheelForm.bolt_spacing}
                  onChange={e => { setWheelForm({...wheelForm, bolt_spacing: e.target.value}); setWheelFormErrors(wheelFormErrors.filter(e => e !== 'bolt_spacing')) }}
                  style={{...styles.input, ...(wheelFormErrors.includes('bolt_spacing') ? styles.inputError : {})}}
                />
              </div>
              <div style={styles.formGroup} className="form-group-item">
                <label style={styles.label}>CB (קוטר מרכז)</label>
                <input
                  type="text"
                  placeholder="54.1, 60.1, 66.6"
                  value={wheelForm.center_bore}
                  onChange={e => setWheelForm({...wheelForm, center_bore: e.target.value})}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup} className="form-group-item">
                <label style={styles.label}>מידות צמיג</label>
                <input
                  type="text"
                  placeholder="205/55R16"
                  value={wheelForm.tire_size}
                  onChange={e => setWheelForm({...wheelForm, tire_size: e.target.value})}
                  style={styles.input}
                />
              </div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>קטגוריה</label>
              {!showCustomCategory ? (
                <select
                  value={predefinedCategories.includes(wheelForm.category) ? wheelForm.category : ''}
                  onChange={e => {
                    if (e.target.value === '__custom__') {
                      setShowCustomCategory(true)
                      setWheelForm({...wheelForm, category: ''})
                    } else {
                      setWheelForm({...wheelForm, category: e.target.value})
                    }
                  }}
                  style={styles.input}
                >
                  <option value="">ללא קטגוריה</option>
                  {predefinedCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="__custom__">+ קטגוריה אחרת...</option>
                </select>
              ) : (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="הזן קטגוריה..."
                    value={wheelForm.category}
                    onChange={e => setWheelForm({...wheelForm, category: e.target.value})}
                    style={{ ...styles.input, flex: 1 }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => { setShowCustomCategory(false); setWheelForm({...wheelForm, category: ''}) }}
                    style={{ ...styles.smallBtn, background: '#4a5568' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              )}
            </div>
            <div style={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="is_donut"
                checked={wheelForm.is_donut}
                onChange={e => setWheelForm({...wheelForm, is_donut: e.target.checked})}
              />
              <label htmlFor="is_donut" style={styles.checkboxLabel}>גלגל דונאט (חילוף)</label>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>הערות</label>
              <input
                type="text"
                value={wheelForm.notes}
                onChange={e => setWheelForm({...wheelForm, notes: e.target.value})}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>פיקדון חריג (ריק = ברירת מחדל ₪{station?.deposit_amount || 200})</label>
              <input
                type="number"
                placeholder={`ברירת מחדל: ₪${station?.deposit_amount || 200}`}
                value={wheelForm.custom_deposit}
                onChange={e => setWheelForm({...wheelForm, custom_deposit: e.target.value})}
                style={styles.input}
              />
            </div>
            <div style={styles.modalButtons} className="add-wheel-modal-buttons">
              <button style={styles.cancelBtn} onClick={() => setShowAddWheelModal(false)}>ביטול</button>
              <button style={styles.submitBtn} onClick={handleAddWheel} disabled={actionLoading}>
                {actionLoading ? 'שומר...' : 'הוסף'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Wheel Modal */}
      {showEditWheelModal && selectedWheel && (
        <div role="presentation" style={styles.modalOverlay} onClick={() => { setShowEditWheelModal(false); setShowCustomCategory(false); setSelectedWheel(null) }}>
          <div role="dialog" aria-modal="true" aria-label={`עריכת גלגל ${selectedWheel.wheel_number}`} style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={{...styles.modalTitle,display:'inline-flex',alignItems:'center',gap:'6px'}}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>עריכת גלגל #{selectedWheel.wheel_number}</h3>
            <div className="add-wheel-form-row" style={styles.formRow}>
              <div className="form-group-item" style={styles.formGroup}>
                <label style={styles.label}>מספר גלגל *</label>
                <input
                  type="text"
                  placeholder="A23, 15, וכו'"
                  value={wheelForm.wheel_number}
                  onChange={e => { setWheelForm({...wheelForm, wheel_number: e.target.value}); setWheelFormErrors(wheelFormErrors.filter(err => err !== 'wheel_number')) }}
                  style={{...styles.input, ...(wheelFormErrors.includes('wheel_number') ? styles.inputError : {})}}
                />
              </div>
              <div className="form-group-item" style={styles.formGroup}>
                <label style={styles.label}>גודל ג'אנט *</label>
                <input
                  type="text"
                  placeholder='14", 15", 16"'
                  value={wheelForm.rim_size}
                  onChange={e => { setWheelForm({...wheelForm, rim_size: e.target.value}); setWheelFormErrors(wheelFormErrors.filter(err => err !== 'rim_size')) }}
                  style={{...styles.input, ...(wheelFormErrors.includes('rim_size') ? styles.inputError : {})}}
                />
              </div>
            </div>
            <div className="add-wheel-form-row" style={styles.formRow}>
              <div className="form-group-item" style={styles.formGroup}>
                <label style={styles.label}>כמות ברגים</label>
                <select
                  value={wheelForm.bolt_count}
                  onChange={e => setWheelForm({...wheelForm, bolt_count: e.target.value})}
                  style={styles.input}
                >
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                </select>
              </div>
              <div className="form-group-item" style={styles.formGroup}>
                <label style={styles.label}>מרווח ברגים *</label>
                <input
                  type="text"
                  placeholder="100, 108, 114.3"
                  value={wheelForm.bolt_spacing}
                  onChange={e => { setWheelForm({...wheelForm, bolt_spacing: e.target.value}); setWheelFormErrors(wheelFormErrors.filter(err => err !== 'bolt_spacing')) }}
                  style={{...styles.input, ...(wheelFormErrors.includes('bolt_spacing') ? styles.inputError : {})}}
                />
              </div>
              <div className="form-group-item" style={styles.formGroup}>
                <label style={styles.label}>CB (קוטר מרכז)</label>
                <input
                  type="text"
                  placeholder="54.1, 60.1, 66.6"
                  value={wheelForm.center_bore}
                  onChange={e => setWheelForm({...wheelForm, center_bore: e.target.value})}
                  style={styles.input}
                />
              </div>
              <div className="form-group-item" style={styles.formGroup}>
                <label style={styles.label}>מידות צמיג</label>
                <input
                  type="text"
                  placeholder="205/55R16"
                  value={wheelForm.tire_size}
                  onChange={e => setWheelForm({...wheelForm, tire_size: e.target.value})}
                  style={styles.input}
                />
              </div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>קטגוריה {wheelForm.category && !predefinedCategories.includes(wheelForm.category) && <span style={{fontSize: '0.75rem', color: '#a0aec0'}}>({wheelForm.category})</span>}</label>
              {!showCustomCategory && (!wheelForm.category || predefinedCategories.includes(wheelForm.category)) ? (
                <select
                  value={predefinedCategories.includes(wheelForm.category) ? wheelForm.category : ''}
                  onChange={e => {
                    if (e.target.value === '__custom__') {
                      setShowCustomCategory(true)
                      setWheelForm({...wheelForm, category: ''})
                    } else {
                      setWheelForm({...wheelForm, category: e.target.value})
                    }
                  }}
                  style={styles.input}
                >
                  <option value="">ללא קטגוריה</option>
                  {predefinedCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="__custom__">+ קטגוריה אחרת...</option>
                </select>
              ) : (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="הזן קטגוריה..."
                    value={wheelForm.category}
                    onChange={e => setWheelForm({...wheelForm, category: e.target.value})}
                    style={{ ...styles.input, flex: 1 }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => { setShowCustomCategory(false); setWheelForm({...wheelForm, category: ''}) }}
                    style={{ ...styles.smallBtn, background: '#4a5568' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              )}
            </div>
            <div style={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="is_donut_edit"
                checked={wheelForm.is_donut}
                onChange={e => setWheelForm({...wheelForm, is_donut: e.target.checked})}
              />
              <label htmlFor="is_donut_edit" style={styles.checkboxLabel}>גלגל דונאט (חילוף)</label>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>הערות</label>
              <input
                type="text"
                value={wheelForm.notes}
                onChange={e => setWheelForm({...wheelForm, notes: e.target.value})}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>פיקדון חריג (ריק = ברירת מחדל ₪{station?.deposit_amount || 200})</label>
              <input
                type="number"
                placeholder={`ברירת מחדל: ₪${station?.deposit_amount || 200}`}
                value={wheelForm.custom_deposit}
                onChange={e => setWheelForm({...wheelForm, custom_deposit: e.target.value})}
                style={styles.input}
              />
            </div>
            <div style={styles.modalButtons}>
              <button style={styles.cancelBtn} onClick={() => { setShowEditWheelModal(false); setSelectedWheel(null) }}>ביטול</button>
              <button style={styles.submitBtn} onClick={handleEditWheel} disabled={actionLoading}>
                {actionLoading ? 'שומר...' : 'עדכן'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Details Modal */}
      {showEditDetailsModal && (
        <div role="presentation" style={styles.modalOverlay} onClick={() => setShowEditDetailsModal(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby="edit-details-modal-title" style={{...styles.modal, maxWidth: '550px'}} onClick={e => e.stopPropagation()}>
            <h3 id="edit-details-modal-title" style={{...styles.modalTitle,display:'inline-flex',alignItems:'center',gap:'6px'}}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>עריכת פרטי תחנה</h3>

            {/* Section: Address */}
            <div style={{marginBottom: '20px', padding: '15px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px'}}>
              <h4 style={{margin: '0 0 12px', color: '#f59e0b', fontSize: '1rem', display:'inline-flex',alignItems:'center',gap:'5px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>כתובת התחנה</h4>
              <div style={styles.formGroup}>
                <input
                  type="text"
                  value={editAddress}
                  onChange={e => setEditAddress(e.target.value)}
                  style={styles.input}
                  placeholder="רחוב, מספר, עיר"
                />
              </div>
              <button
                style={{...styles.smallBtn, background: '#10b981'}}
                onClick={async () => {
                  setActionLoading(true)
                  try {
                    const response = await fetch(`/api/wheel-stations/${stationId}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        address: editAddress,
                        manager_phone: currentManager?.phone,
                        current_password: sessionPassword
                      })
                    })
                    if (!response.ok) {
                      const data = await response.json()
                      throw new Error(data.error || 'Failed to update')
                    }
                    await fetchStation()
                    toast.success('הכתובת עודכנה!')
                  } catch (err: unknown) {
                    toast.error(err instanceof Error ? err.message : 'שגיאה בעדכון')
                  } finally {
                    setActionLoading(false)
                  }
                }}
                disabled={actionLoading}
              >
                {actionLoading ? 'שומר...' : 'שמור כתובת'}
              </button>
            </div>

            {/* Section: Deposit Settings */}
            <div style={{marginBottom: '20px', padding: '15px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px'}}>
              <h4 style={{margin: '0 0 12px', color: '#f59e0b', fontSize: '1rem', display:'inline-flex',alignItems:'center',gap:'5px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>הגדרות פיקדון ואמצעי תשלום</h4>

              {/* Deposit Amount */}
              <div style={{marginBottom: '16px'}}>
                <label style={{fontSize: '0.85rem', color: '#9ca3af', marginBottom: '4px', display: 'block'}}>סכום פיקדון (₪)</label>
                <input
                  type="number"
                  value={editDepositAmount}
                  onChange={e => setEditDepositAmount(e.target.value)}
                  style={{...styles.input, width: '120px'}}
                  placeholder="200"
                />
              </div>

              {/* Payment Methods */}
              <div style={{fontSize: '0.85rem', color: '#9ca3af', marginBottom: '8px'}}>אמצעי תשלום זמינים:</div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                {/* Cash */}
                <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                  <input
                    type="checkbox"
                    checked={editPaymentMethods.cash || false}
                    onChange={e => setEditPaymentMethods({...editPaymentMethods, cash: e.target.checked})}
                  />
                  <span style={{color: '#fff', display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>מזומן</span>
                </label>

                {/* Bit */}
                <div style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
                  <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                    <input
                      type="checkbox"
                      checked={editPaymentMethods.bit?.enabled || false}
                      onChange={e => setEditPaymentMethods({
                        ...editPaymentMethods,
                        bit: { enabled: e.target.checked, phone: editPaymentMethods.bit?.phone || '' }
                      })}
                    />
                    <span style={{color: '#fff', display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>ביט</span>
                  </label>
                  {editPaymentMethods.bit?.enabled && (
                    <input
                      type="tel"
                      value={editPaymentMethods.bit?.phone || ''}
                      onChange={e => setEditPaymentMethods({
                        ...editPaymentMethods,
                        bit: { enabled: true, phone: e.target.value }
                      })}
                      style={{...styles.input, marginRight: '26px', width: 'calc(100% - 26px)'}}
                      placeholder="מספר טלפון לביט"
                    />
                  )}
                </div>

                {/* Paybox */}
                <div style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
                  <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                    <input
                      type="checkbox"
                      checked={editPaymentMethods.paybox?.enabled || false}
                      onChange={e => setEditPaymentMethods({
                        ...editPaymentMethods,
                        paybox: { enabled: e.target.checked, phone: editPaymentMethods.paybox?.phone || '' }
                      })}
                    />
                    <span style={{color: '#fff', display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>פייבוקס</span>
                  </label>
                  {editPaymentMethods.paybox?.enabled && (
                    <input
                      type="tel"
                      value={editPaymentMethods.paybox?.phone || ''}
                      onChange={e => setEditPaymentMethods({
                        ...editPaymentMethods,
                        paybox: { enabled: true, phone: e.target.value }
                      })}
                      style={{...styles.input, marginRight: '26px', width: 'calc(100% - 26px)'}}
                      placeholder="מספר טלפון לפייבוקס"
                    />
                  )}
                </div>

                {/* Bank Transfer */}
                <div style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
                  <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                    <input
                      type="checkbox"
                      checked={editPaymentMethods.bank_transfer?.enabled || false}
                      onChange={e => setEditPaymentMethods({
                        ...editPaymentMethods,
                        bank_transfer: { enabled: e.target.checked, details: editPaymentMethods.bank_transfer?.details || '' }
                      })}
                    />
                    <span style={{color: '#fff', display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>העברה בנקאית</span>
                  </label>
                  {editPaymentMethods.bank_transfer?.enabled && (
                    <textarea
                      value={editPaymentMethods.bank_transfer?.details || ''}
                      onChange={e => setEditPaymentMethods({
                        ...editPaymentMethods,
                        bank_transfer: { enabled: true, details: e.target.value }
                      })}
                      style={{...styles.input, marginRight: '26px', width: 'calc(100% - 26px)', minHeight: '60px'}}
                      placeholder="פרטי חשבון בנק..."
                    />
                  )}
                </div>

                {/* ID Deposit */}
                <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                  <input
                    type="checkbox"
                    checked={editPaymentMethods.id_deposit || false}
                    onChange={e => setEditPaymentMethods({...editPaymentMethods, id_deposit: e.target.checked})}
                  />
                  <span style={{color: '#fff', display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>פיקדון ת.ז. (באישור מנהל)</span>
                </label>

                {/* License Deposit */}
                <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                  <input
                    type="checkbox"
                    checked={editPaymentMethods.license_deposit || false}
                    onChange={e => setEditPaymentMethods({...editPaymentMethods, license_deposit: e.target.checked})}
                  />
                  <span style={{color: '#fff', display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>פיקדון רישיון נהיגה (באישור מנהל)</span>
                </label>
              </div>

              <button
                style={{...styles.smallBtn, background: '#10b981', marginTop: '16px'}}
                onClick={async () => {
                  setActionLoading(true)
                  try {
                    const response = await fetch(`/api/wheel-stations/${stationId}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        deposit_amount: editDepositAmount ? parseInt(editDepositAmount) : 200,
                        payment_methods: editPaymentMethods,
                        manager_phone: currentManager?.phone,
                        current_password: sessionPassword
                      })
                    })
                    if (!response.ok) {
                      const data = await response.json()
                      throw new Error(data.error || 'Failed to update')
                    }
                    await fetchStation()
                    toast.success('הגדרות התשלום עודכנו!')
                  } catch (err: unknown) {
                    toast.error(err instanceof Error ? err.message : 'שגיאה בעדכון')
                  } finally {
                    setActionLoading(false)
                  }
                }}
                disabled={actionLoading}
              >
                {actionLoading ? 'שומר...' : 'שמור הגדרות תשלום'}
              </button>
            </div>

            {/* Section: Email Notifications - Only for primary manager */}
            {currentManager?.is_primary ? (
              <div style={{marginBottom: '20px', padding: '15px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px'}}>
                <h4 style={{margin: '0 0 12px', color: '#f59e0b', fontSize: '1rem', display:'inline-flex',alignItems:'center',gap:'5px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>התראות מייל</h4>
                <p style={{fontSize: '0.85rem', color: '#9ca3af', marginBottom: '12px'}}>
                  התראה תישלח למיילים אלו על כל בקשת השאלה חדשה
                </p>
                {notificationEmails.map((email, index) => (
                  <div key={index} style={{marginBottom: '8px', display: 'flex', gap: '8px', alignItems: 'center'}}>
                    <input
                      type="email"
                      placeholder={`כתובת מייל ${index + 1}`}
                      value={email}
                      onChange={e => {
                        const newEmails = [...notificationEmails]
                        newEmails[index] = e.target.value
                        setNotificationEmails(newEmails)
                      }}
                      style={{...styles.input, flex: 1}}
                      dir="ltr"
                    />
                    {notificationEmails.length > 1 && (
                      <button
                        onClick={() => setNotificationEmails(notificationEmails.filter((_, i) => i !== index))}
                        style={{background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.1rem', padding: '4px'}}
                        title="הסר"
                      ><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setNotificationEmails([...notificationEmails, ''])}
                  style={{...styles.smallBtn, background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', marginBottom: '8px', fontSize: '0.8rem'}}
                >
                  + הוסף מייל
                </button>
                <button
                  style={{...styles.smallBtn, background: '#10b981', marginTop: '8px'}}
                  onClick={async () => {
                    setActionLoading(true)
                    try {
                      const validEmails = notificationEmails.filter(e => e.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim()))
                      if (validEmails.length === 0 && (station?.notification_emails?.length ?? 0) > 0) {
                        toast.error('נא להזין לפחות כתובת מייל אחת תקינה')
                        setActionLoading(false)
                        return
                      }
                      const response = await fetch(`/api/wheel-stations/${stationId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          notification_emails: validEmails,
                          manager_phone: currentManager?.phone,
                          current_password: sessionPassword
                        })
                      })
                      if (!response.ok) {
                        const data = await response.json()
                        throw new Error(data.error || 'Failed to update')
                      }
                      await fetchStation()
                      toast.success('הגדרות המייל עודכנו!')
                    } catch (err: unknown) {
                      toast.error(err instanceof Error ? err.message : 'שגיאה בעדכון')
                    } finally {
                      setActionLoading(false)
                    }
                  }}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'שומר...' : 'שמור הגדרות מייל'}
                </button>
              </div>
            ) : (
              <div style={{marginBottom: '20px', padding: '15px', background: '#f1f5f9', borderRadius: '10px', opacity: 0.6}}>
                <h4 style={{margin: '0 0 8px', color: '#9ca3af', fontSize: '1rem', display:'inline-flex',alignItems:'center',gap:'5px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>התראות מייל</h4>
                <p style={{fontSize: '0.85rem', color: '#6b7280', margin: 0, display:'inline-flex',alignItems:'center',gap:'4px'}}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>רק מנהל ראשי יכול לערוך כתובות מייל
                </p>
              </div>
            )}

            {/* Section: Contacts - Only for primary manager */}
            {currentManager?.is_primary ? (
              <div style={{marginBottom: '20px', padding: '15px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px'}}>
                <h4 style={{margin: '0 0 12px', color: '#f59e0b', fontSize: '1rem', display:'inline-flex',alignItems:'center',gap:'5px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>אנשי קשר ({contacts.length}/{station?.max_managers ?? 4})</h4>
                {contacts.map((contact, index) => (
                  <div key={index} style={{display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center'}} className="edit-details-contact-row">
                    <div style={{position: 'relative', flex: 1, minWidth: '120px'}}>
                      <input
                        type="text"
                        placeholder="שם מלא"
                        value={contact.full_name}
                        onChange={e => updateContact(index, 'full_name', e.target.value)}
                        style={{...styles.input, width: '100%', paddingLeft: contact.is_primary ? '26px' : undefined}}
                      />
                      {contact.is_primary && (
                        <span title="מנהל ראשי" style={{
                          position: 'absolute', left: '7px', top: '50%',
                          transform: 'translateY(-50%)',
                          fontSize: '12px', lineHeight: 1, pointerEvents: 'none',
                          filter: 'drop-shadow(0 0 3px #f59e0b)',
                        }}><svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></span>
                      )}
                    </div>
                    <input
                      type="tel"
                      placeholder="טלפון"
                      value={contact.phone}
                      onChange={e => updateContact(index, 'phone', e.target.value)}
                      style={{...styles.input, flex: 1, minWidth: '100px'}}
                    />
                    <span style={{
                      padding: '3px 7px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600, whiteSpace: 'nowrap',
                      background: !contact.password ? 'rgba(239,68,68,0.1)' : contact.password.startsWith('$2') ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.15)',
                      color: !contact.password ? '#ef4444' : contact.password.startsWith('$2') ? '#16a34a' : '#d97706',
                    }}>
                      {!contact.password ? 'ללא קוד' : contact.password.startsWith('$2') ? 'פעיל' : `קוד: ${contact.password}`}
                    </span>
                    <button style={styles.removeBtn} onClick={() => removeContact(index)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                  </div>
                ))}
                <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                  <button style={{...styles.smallBtn, background: '#3b82f6'}} onClick={addContact} disabled={contacts.length >= (station?.max_managers ?? 4)}>
                    <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>הוסף איש קשר</span>
                  </button>
                  <button style={{...styles.smallBtn, background: '#10b981'}} onClick={handleSaveContacts} disabled={actionLoading}>
                    {actionLoading ? 'שומר...' : 'שמור אנשי קשר'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{marginBottom: '20px', padding: '15px', background: '#f1f5f9', borderRadius: '10px', opacity: 0.6}}>
                <h4 style={{margin: '0 0 8px', color: '#9ca3af', fontSize: '1rem', display:'inline-flex',alignItems:'center',gap:'5px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>אנשי קשר</h4>
                <p style={{fontSize: '0.85rem', color: '#6b7280', margin: 0, display:'inline-flex',alignItems:'center',gap:'4px'}}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>רק מנהל ראשי יכול לערוך אנשי קשר
                </p>
              </div>
            )}

            <button style={{...styles.cancelBtn, width: '100%'}} onClick={() => setShowEditDetailsModal(false)}>סגור</button>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div role="presentation" style={styles.modalOverlay} onClick={() => setShowChangePasswordModal(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby="change-password-modal-title" style={{...styles.modal, maxWidth: '400px'}} onClick={e => e.stopPropagation()}>
            <h3 id="change-password-modal-title" style={{...styles.modalTitle,display:'inline-flex',alignItems:'center',gap:'6px'}}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>שינוי סיסמא אישית</h3>
            <p style={{fontSize: '0.9rem', color: '#9ca3af', marginBottom: '20px', textAlign: 'center'}}>
              שנה את הסיסמא האישית שלך
            </p>

            <div style={styles.formGroup}>
              <label style={styles.label}>סיסמה נוכחית</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordForm.current}
                  onChange={e => setPasswordForm({...passwordForm, current: e.target.value})}
                  style={{...styles.input, paddingLeft: '40px'}}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  aria-label={showCurrentPassword ? 'הסתר סיסמה נוכחית' : 'הצג סיסמה נוכחית'}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    fontSize: '16px',
                    opacity: 0.7,
                  }}
                >
                  {showCurrentPassword ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                </button>
              </div>
            </div>

            <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
              <div style={{...styles.formGroup, flex: 1, minWidth: '120px'}}>
                <label style={styles.label}>סיסמה חדשה</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.new}
                    onChange={e => setPasswordForm({...passwordForm, new: e.target.value})}
                    style={{...styles.input, paddingLeft: '40px'}}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={showNewPassword ? 'הסתר סיסמה חדשה' : 'הצג סיסמה חדשה'}
                    style={{
                      position: 'absolute',
                      left: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      fontSize: '16px',
                      opacity: 0.7,
                    }}
                  >
                    {showNewPassword ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                  </button>
                </div>
              </div>
              <div style={{...styles.formGroup, flex: 1, minWidth: '120px'}}>
                <label style={styles.label}>אימות סיסמה</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordForm.confirm}
                    onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})}
                    style={{...styles.input, paddingLeft: '40px'}}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'הסתר אימות סיסמה' : 'הצג אימות סיסמה'}
                    style={{
                      position: 'absolute',
                      left: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      fontSize: '16px',
                      opacity: 0.7,
                    }}
                  >
                    {showConfirmPassword ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                  </button>
                </div>
              </div>
            </div>

            <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
              <button
                style={{...styles.submitBtn, flex: 1, background: 'linear-gradient(135deg, #f59e0b, #d97706)'}}
                onClick={handleChangePassword}
                disabled={actionLoading}
              >
                {actionLoading ? 'שומר...' : 'שנה סיסמה'}
              </button>
              <button
                style={{...styles.cancelBtn, flex: 1}}
                onClick={() => setShowChangePasswordModal(false)}
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recovery Certificate Modal */}
      {showRecoveryCertModal && (
        <div role="presentation" style={styles.modalOverlay} onClick={() => setShowRecoveryCertModal(false)}>
          <div role="dialog" aria-modal="true" style={{...styles.modal, maxWidth: '440px'}} onClick={e => e.stopPropagation()}>
            <h3 style={{...styles.modalTitle,display:'inline-flex',alignItems:'center',gap:'6px'}}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>תעודת שחזור</h3>
            {recoveryLoading ? (
              <p style={{textAlign: 'center', color: '#9ca3af'}}>טוען...</p>
            ) : recoveryData ? (
              <>
                <p style={{fontSize: '0.85rem', color: '#9ca3af', marginBottom: '16px', textAlign: 'center'}}>
                  שמור את התעודה הזו במקום בטוח. היא המפתח היחיד לאיפוס הסיסמא שלך.
                </p>
                <div
                  id="recovery-certificate"
                  style={{
                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%)',
                    borderRadius: '16px',
                    padding: '28px 24px',
                    border: '2px solid #2563eb',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #f59e0b, #d97706, #f59e0b)'
                  }} />
                  <div style={{fontSize: '1.4rem', fontWeight: 'bold', color: '#f59e0b', marginBottom: '4px'}}>
                    תעודת שחזור
                  </div>
                  <div style={{fontSize: '0.75rem', color: '#9ca3af', marginBottom: '16px'}}>
                    Recovery Certificate
                  </div>
                  <div style={{fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', marginBottom: '4px'}}>
                    {recoveryData.manager_name}
                  </div>
                  <div style={{fontSize: '0.85rem', color: '#60a5fa', marginBottom: '2px'}}>
                    {recoveryData.role}
                  </div>
                  <div style={{fontSize: '0.85rem', color: '#9ca3af', marginBottom: '20px'}}>
                    {recoveryData.station_name}
                  </div>
                  <div style={{
                    background: '#fff',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'inline-block',
                    marginBottom: '16px'
                  }}>
                    <img
                      id="recovery-qr-img"
                      alt="QR Code"
                      style={{width: 220, height: 220, display: 'block'}}
                      ref={(img) => {
                        if (img && recoveryData.recovery_key && !img.src.startsWith('data:')) {
                          import('qrcode').then(QRCode => {
                            QRCode.toDataURL(recoveryData.recovery_key, {
                              width: 220,
                              margin: 1,
                              color: { dark: '#1a1a2e', light: '#ffffff' }
                            }).then(url => { img.src = url })
                          })
                        }
                      }}
                    />
                  </div>
                  <div style={{
                    fontSize: '0.7rem',
                    color: '#6b7280',
                    marginTop: '8px',
                    direction: 'rtl'
                  }}>
                    Wheels App - אין לשתף תעודה זו
                  </div>
                </div>
                <div style={{display: 'flex', gap: '10px', marginTop: '16px'}}>
                  <button
                    style={{...styles.submitBtn, flex: 1, background: 'linear-gradient(135deg, #f59e0b, #d97706)'}}
                    onClick={handleDownloadCertificate}
                  >
                    <span style={{display:'inline-flex',alignItems:'center',gap:'5px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>הורד תעודה</span>
                  </button>
                  <button
                    style={{...styles.cancelBtn, flex: 1}}
                    onClick={() => setShowRecoveryCertModal(false)}
                  >
                    סגור
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div role="presentation" style={styles.modalOverlay} onClick={() => setShowForgotPasswordModal(false)}>
          <div role="dialog" aria-modal="true" style={{...styles.modal, maxWidth: '400px'}} onClick={e => e.stopPropagation()}>
            <h3 style={{...styles.modalTitle,display:'inline-flex',alignItems:'center',gap:'6px'}}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>איפוס סיסמא</h3>
            {forgotSuccess ? (
              <>
                <p style={{textAlign: 'center', color: '#10b981', fontSize: '1rem', marginBottom: '16px'}}>
                  הסיסמא אופסה בהצלחה!
                </p>
                <p style={{textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem', marginBottom: '20px'}}>
                  יש להתחבר עם הסיסמא החדשה ולהוריד תעודת שחזור חדשה.
                </p>
                <button
                  style={{...styles.submitBtn, width: '100%'}}
                  onClick={() => {
                    setShowForgotPasswordModal(false)
                    setShowLoginModal(true)
                  }}
                >
                  חזור להתחברות
                </button>
              </>
            ) : (
              <>
                <p style={{fontSize: '0.85rem', color: '#9ca3af', marginBottom: '16px', textAlign: 'center'}}>
                  העלה את תמונת תעודת השחזור שלך כדי לאפס את הסיסמא
                </p>
                <div style={styles.formGroup}>
                  <label style={styles.label}>מספר טלפון</label>
                  <input
                    type="text"
                    placeholder="הזן מספר טלפון"
                    value={forgotPhone}
                    onChange={e => setForgotPhone(e.target.value)}
                    style={styles.input}
                  />
                </div>
                <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                  <div style={{...styles.formGroup, flex: 1, minWidth: '120px'}}>
                    <label style={styles.label}>סיסמא חדשה</label>
                    <input
                      type="password"
                      value={forgotNewPassword}
                      onChange={e => setForgotNewPassword(e.target.value)}
                      style={styles.input}
                    />
                  </div>
                  <div style={{...styles.formGroup, flex: 1, minWidth: '120px'}}>
                    <label style={styles.label}>אימות סיסמא</label>
                    <input
                      type="password"
                      value={forgotConfirmPassword}
                      onChange={e => setForgotConfirmPassword(e.target.value)}
                      style={styles.input}
                    />
                  </div>
                </div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '14px',
                    borderRadius: '10px',
                    border: '2px dashed #4a5568',
                    background: '#f8fafc',
                    color: '#60a5fa',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    marginTop: '8px',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{display:'inline-flex',alignItems:'center',gap:'5px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>העלה תמונת תעודת שחזור</span>
                  <input
                    type="file"
                    accept="image/*"
                    style={{display: 'none'}}
                    onChange={handleForgotPasswordUpload}
                    disabled={actionLoading}
                  />
                </label>
                {actionLoading && (
                  <p style={{textAlign: 'center', color: '#f59e0b', fontSize: '0.85rem', marginTop: '10px'}}>
                    סורק קוד QR...
                  </p>
                )}
                {forgotError && <div style={{...styles.errorText, marginTop: '10px'}}>{forgotError}</div>}
                <button
                  style={{...styles.cancelBtn, width: '100%', marginTop: '16px'}}
                  onClick={() => setShowForgotPasswordModal(false)}
                >
                  ביטול
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Excel Import/Export Modal */}
      {showExcelModal && (
        <div role="presentation" style={styles.modalOverlay} onClick={() => setShowExcelModal(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby="excel-modal-title" style={{...styles.modal, maxWidth: '400px', textAlign: 'center'}} onClick={e => e.stopPropagation()}>
            <h3 id="excel-modal-title" style={{...styles.modalTitle,display:'inline-flex',alignItems:'center',gap:'6px'}}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>ייבוא / ייצוא נתונים</h3>
            <p style={styles.modalSubtitle}>בחר את הפעולה הרצויה</p>

            <div style={{display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px'}}>
              {/* Import section with tabs */}
              <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                <span style={{fontWeight: 'bold', color: '#fff', marginBottom: '4px', display:'inline-flex',alignItems:'center',gap:'5px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>ייבוא גלגלים:</span>

                {/* Import mode toggle */}
                <div style={{display: 'flex', gap: '10px', marginBottom: '10px'}}>
                  <button
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: importMode === 'file' ? 'none' : '1px solid #e2e8f0',
                      background: importMode === 'file' ? '#16a34a' : '#f1f5f9',
                      color: importMode === 'file' ? 'white' : '#475569',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                    onClick={() => setImportMode('file')}
                  >
                    <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>קובץ</span>
                  </button>
                  <button
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: importMode === 'sheets' ? 'none' : '1px solid #e2e8f0',
                      background: importMode === 'sheets' ? '#16a34a' : '#f1f5f9',
                      color: importMode === 'sheets' ? 'white' : '#475569',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                    onClick={() => setImportMode('sheets')}
                  >
                    <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>Google Sheets</span>
                  </button>
                </div>

                {/* File import */}
                {importMode === 'file' && (
                  <button
                    style={styles.excelImportBtn}
                    onClick={() => {
                      setShowExcelModal(false)
                      fileInputRef.current?.click()
                    }}
                    disabled={uploadLoading}
                  >
                    {uploadLoading ? 'מעלה...' : 'העלה קובץ Excel'}
                    <span style={{display: 'block', fontSize: '0.8rem', marginTop: '5px', opacity: 0.8}}>
                      בחר קובץ מהמחשב
                    </span>
                  </button>
                )}

                {/* Google Sheets import */}
                {importMode === 'sheets' && (
                  <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    <input
                      type="text"
                      placeholder="הדבק קישור לגיליון Google Sheets"
                      value={sheetsUrl}
                      onChange={(e) => setSheetsUrl(e.target.value)}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        background: '#f8fafc',
                        color: '#1e293b',
                        fontSize: '0.9rem',
                        direction: 'ltr'
                      }}
                    />
                    <button
                      style={styles.excelImportBtn}
                      onClick={handleSheetsImport}
                      disabled={uploadLoading || !sheetsUrl.trim()}
                    >
                      {uploadLoading ? 'מייבא...' : 'ייבא מ-Google Sheets'}
                      <span style={{display: 'block', fontSize: '0.8rem', marginTop: '5px', opacity: 0.8}}>
                        הגיליון חייב להיות ציבורי או משותף
                      </span>
                    </button>
                  </div>
                )}
              </div>

              <a
                href="/wheels-template.html"
                target="_blank"
                style={styles.excelTemplateBtn}
                onClick={() => setShowExcelModal(false)}
              >
                <span style={{display:'inline-flex',alignItems:'center',gap:'5px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>הורד תבנית ריקה</span>
                <span style={{display: 'block', fontSize: '0.8rem', marginTop: '5px', opacity: 0.8}}>
                  קובץ עם כותרות בלבד להעתקה
                </span>
              </a>
            </div>

            {/* Export Section */}
            <div style={{borderTop: '1px solid #334155', marginTop: '20px', paddingTop: '20px'}}>
              <span style={{fontWeight: 'bold', color: '#fff', marginBottom: '12px', display: 'inline-flex', alignItems: 'center', gap: '5px'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                ייצוא נתונים לאקסל:
              </span>
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px', marginBottom: '14px', textAlign: 'right'}}>
                {[
                  { key: 'inventory', label: 'מלאי גלגלים נוכחי' },
                  { key: 'history',   label: 'היסטוריית השאלות' },
                  { key: 'unavailable', label: 'גלגלים לא זמינים' },
                ].map(({ key, label }) => (
                  <label key={key} style={{display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#e2e8f0', fontSize: '0.9rem'}}>
                    <input
                      type="checkbox"
                      checked={reportChecks[key as keyof typeof reportChecks]}
                      onChange={e => setReportChecks(prev => ({ ...prev, [key]: e.target.checked }))}
                      style={{width: '16px', height: '16px', accentColor: '#3b82f6', cursor: 'pointer', flexShrink: 0}}
                    />
                    {label}
                  </label>
                ))}
              </div>
              {reportChecks.history && (
                <div style={{marginBottom: '14px'}}>
                  <div style={{color: '#94a3b8', fontSize: '0.8rem', marginBottom: '6px', textAlign: 'right'}}>טווח תאריכים להיסטוריה (אופציונלי)</div>
                  <div style={{display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap'}}>
                    <input
                      type="date"
                      value={reportDateFrom}
                      onChange={e => setReportDateFrom(e.target.value)}
                      style={{flex: 1, minWidth: 0, padding: '7px 8px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0', fontSize: '0.85rem'}}
                    />
                    <span style={{color: '#64748b', flexShrink: 0}}>עד</span>
                    <input
                      type="date"
                      value={reportDateTo}
                      onChange={e => setReportDateTo(e.target.value)}
                      style={{flex: 1, minWidth: 0, padding: '7px 8px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0', fontSize: '0.85rem'}}
                    />
                    {(reportDateFrom || reportDateTo) && (
                      <button
                        onClick={() => { setReportDateFrom(''); setReportDateTo('') }}
                        style={{background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.82rem', padding: '4px 6px', flexShrink: 0}}
                      >
                        נקה
                      </button>
                    )}
                  </div>
                </div>
              )}
              <button
                onClick={() => { handleExportWithOptions(); setShowExcelModal(false) }}
                style={{width: '100%', padding: '11px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                ייצא לאקסל
              </button>
            </div>

            <button style={{...styles.cancelBtn, width: '100%', marginTop: '20px'}} onClick={() => setShowExcelModal(false)}>
              סגור
            </button>
          </div>
        </div>
      )}

      {/* Onboarding Tour */}
      {onboardingStep !== null && (() => {
        const steps = [
          { title: 'ניווט בין מסכים', body: 'כאן עוברים בין מלאי הגלגלים, מעקב השאלות, התראות ודוחות.' },
          { title: 'טאב דוחות', body: 'סטטיסטיקות מהירות + ייצוא לאקסל עם בחירת נתונים וטווח תאריכים.' },
          { title: 'כרטיסי גלגל', body: 'לחץ על גלגל כדי להשאיל, לערוך, לסמן כלא זמין או למחוק.' },
        ]
        const step = steps[onboardingStep]
        const PAD = 10
        const r = highlightRect

        return (
          <>
            {/* Dark overlay with hole */}
            {r && (
              <svg style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 9000, pointerEvents: 'none' }}>
                <defs>
                  <mask id="tour-mask">
                    <rect width="100%" height="100%" fill="white" />
                    <rect x={r.left - PAD} y={r.top - PAD} width={r.width + PAD * 2} height={r.height + PAD * 2} rx="10" fill="black" />
                  </mask>
                </defs>
                <rect width="100%" height="100%" fill="rgba(0,0,0,0.65)" mask="url(#tour-mask)" />
              </svg>
            )}
            {r && (
              <div style={{ position: 'fixed', top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2, border: '2px solid #3b82f6', borderRadius: '10px', zIndex: 9001, pointerEvents: 'none', boxShadow: '0 0 0 3px rgba(59,130,246,0.3)' }} />
            )}
            {/* Tooltip card */}
            <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', width: 'min(340px, calc(100vw - 32px))', background: '#1e293b', borderRadius: '14px', padding: '18px 20px', zIndex: 9002, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', border: '1px solid #334155', direction: 'rtl' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ color: '#3b82f6', fontSize: '0.78rem', fontWeight: 600 }}>שלב {onboardingStep + 1} מתוך {steps.length}</span>
                <button onClick={dismissOnboarding} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.82rem', padding: '2px 6px' }}>דלג</button>
              </div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', marginBottom: '6px' }}>{step.title}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '16px' }}>{step.body}</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {onboardingStep > 0 && (
                  <button onClick={() => setOnboardingStep(onboardingStep - 1)} style={{ flex: 1, padding: '9px', background: '#334155', color: '#cbd5e1', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>הקודם</button>
                )}
                <button onClick={nextOnboardingStep} style={{ flex: 2, padding: '9px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem' }}>
                  {onboardingStep < steps.length - 1 ? 'הבא ←' : 'סיום ✓'}
                </button>
              </div>
            </div>
            {/* Block clicks on background */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 8999 }} onClick={e => e.stopPropagation()} />
          </>
        )
      })()}

      {/* Confirm Dialog Modal */}
      {showConfirmDialog && confirmDialogData && (
        <div role="presentation" style={styles.modalOverlay} onClick={closeConfirmDialog}>
          <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-dialog-title" aria-describedby="confirm-dialog-message" style={styles.confirmDialog} onClick={e => e.stopPropagation()}>
            <h3 id="confirm-dialog-title" style={{
              ...styles.confirmTitle,
              color: confirmDialogData.variant === 'danger' ? '#ef4444' :
                     confirmDialogData.variant === 'warning' ? '#f59e0b' : '#3b82f6'
            }}>
              {confirmDialogData.title}
            </h3>
            <p id="confirm-dialog-message" style={{...styles.confirmMessage, whiteSpace: 'pre-line'}}>{confirmDialogData.message}</p>
            <div style={styles.confirmButtons}>
              <button style={styles.cancelBtn} onClick={closeConfirmDialog}>
                {confirmDialogData.cancelText || 'ביטול'}
              </button>
              <button
                style={{
                  ...styles.confirmBtn,
                  background: confirmDialogData.variant === 'danger' ? '#ef4444' :
                             confirmDialogData.variant === 'warning' ? '#f59e0b' : '#3b82f6'
                }}
                onClick={confirmDialogData.onConfirm}
              >
                {confirmDialogData.confirmText || 'אישור'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
    </>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: '#f1f5f9',
    color: '#1e293b',
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    direction: 'rtl',
  },
  stationInfoSection: {
    background: '#ffffff',
    borderRadius: '12px',
    padding: '16px 20px',
    marginBottom: '20px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  stationInfoHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap' as const,
  },
  stationTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    margin: 0,
    color: '#1e293b',
  },
  stationAddress: {
    fontSize: '0.9rem',
    color: '#64748b',
    margin: '8px 0 0 0',
  },
  stickyHeader: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: '#f1f5f9',
    marginLeft: '-20px',
    marginRight: '-20px',
    marginTop: '-20px',
    padding: '20px 20px 0 20px',
    marginBottom: '15px',
  },
  header: {
    marginBottom: '10px',
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  backBtn: {
    color: '#64748b',
    textDecoration: 'none',
    fontSize: '0.9rem',
  },
  backBtnStyled: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: 500,
    color: '#475569',
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    transition: 'all 0.2s',
    padding: '8px 12px',
    height: '38px',
    borderRadius: '10px',
    whiteSpace: 'nowrap',
  },
  linkShareBtn: {
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '10px',
    width: '38px',
    height: '38px',
    fontSize: '1.2rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  linkShareDropdown: {
    position: 'absolute' as const,
    top: '48px',
    left: '0',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    minWidth: '200px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
    zIndex: 1000,
    overflow: 'hidden',
  },
  linkShareHeader: {
    padding: '12px 16px',
    borderBottom: '1px solid #e2e8f0',
    background: '#f0fdf4',
  },
  linkShareTitle: {
    color: '#16a34a',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  linkShareItem: {
    width: '100%',
    padding: '12px 16px',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid #f1f5f9',
    color: '#1e293b',
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textAlign: 'right' as const,
    transition: 'background 0.2s',
  },
  linkShareIcon: {
    fontSize: '1.1rem',
  },
  managerBtn: {
    background: '#fefce8',
    border: '1px solid #fde68a',
    color: '#92400e',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.9rem',
  },
  title: {
    fontSize: '1.8rem',
    margin: '10px 0',
    color: '#2563eb',
  },
  address: {
    color: '#64748b',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '50vh',
    gap: '20px',
    color: '#64748b',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e2e8f0',
    borderTopColor: '#2563eb',
    borderRadius: '50%',
  },
  error: {
    textAlign: 'center',
    padding: '40px',
    color: '#1e293b',
  },
  backLink: {
    color: '#2563eb',
    textDecoration: 'none',
    marginTop: '20px',
    display: 'inline-block',
  },
  stats: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  stat: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    padding: '15px 25px',
    borderRadius: '12px',
    textAlign: 'center',
    minWidth: '100px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  statAvailable: {},
  statTaken: {},
  statValue: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statLabel: {
    color: '#64748b',
    fontSize: '0.9rem',
  },
  filters: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '15px',
    marginBottom: '20px',
  },
  filtersHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  filtersTitle: {
    color: '#1e293b',
    fontSize: '1rem',
    margin: 0,
    fontWeight: 600,
  },
  filtersToggle: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    color: '#64748b',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  filtersToggleActive: {
    background: '#eff6ff',
    borderColor: '#bfdbfe',
    color: '#2563eb',
  },
  filterRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginTop: '12px',
  },
  filterGroup: {
    flex: 1,
    minWidth: '100px',
  },
  filterLabel: {
    display: 'block',
    marginBottom: '4px',
    color: '#64748b',
    fontSize: '0.8rem',
    fontWeight: 600,
  },
  filterSelect: {
    width: '100%',
    padding: '8px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    color: '#1e293b',
    fontSize: '0.9rem',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  viewToggle: {
    display: 'flex',
    gap: '5px',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    padding: '4px',
    borderRadius: '8px',
  },
  viewBtn: {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  viewBtnActive: {
    background: '#2563eb',
    color: 'white',
  },
  resultsCount: {
    color: '#64748b',
    fontSize: '0.9rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '15px',
    marginBottom: '30px',
  },
  card: {
    background: '#ffffff',
    borderRadius: '12px',
    overflow: 'visible',
    border: '1px solid #e2e8f0',
    position: 'relative',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
  },
  cardTaken: {
    opacity: 0.85,
    borderColor: '#fecaca',
  },
  cardImage: {
    width: '100%',
    height: '100px',
    background: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderRadius: '12px 12px 0 0',
    overflow: 'hidden',
    borderBottom: '1px solid #e2e8f0',
  },
  wheelImg: {
    width: '70px',
    height: '70px',
    objectFit: 'contain',
  },
  cardNumber: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    background: '#1e293b',
    color: '#f8fafc',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    padding: '4px 10px',
    borderRadius: '6px',
  },
  donutBadge: {
    position: 'absolute',
    top: '8px',
    left: '8px',
    background: '#7c3aed',
    color: 'white',
    fontSize: '0.75rem',
    padding: '3px 6px',
    borderRadius: '4px',
  },
  cardStatus: {
    position: 'absolute',
    bottom: '10px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
  },
  statusAvailable: {
    background: '#f0fdf4',
    color: '#16a34a',
    border: '1px solid #bbf7d0',
  },
  statusTaken: {
    background: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
  },
  cardInfo: {
    padding: '12px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  cardSpecs: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '8px',
  },
  spec: {
    background: '#f1f5f9',
    border: '1px solid #e2e8f0',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '0.85rem',
    color: '#475569',
  },
  cardCategory: {
    color: '#64748b',
    fontSize: '0.85rem',
  },
  cardNotes: {
    color: '#94a3b8',
    fontSize: '0.8rem',
    marginTop: '5px',
  },
  tableWrapper: {
    overflowX: 'auto',
    marginBottom: '30px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: '#ffffff',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
  },
  th: {
    background: '#f8fafc',
    padding: '12px 15px',
    textAlign: 'right',
    fontWeight: 600,
    color: '#475569',
    fontSize: '0.9rem',
    borderBottom: '1px solid #e2e8f0',
  },
  td: {
    padding: '12px 15px',
    borderBottom: '1px solid #f1f5f9',
    fontSize: '0.9rem',
    color: '#1e293b',
  },
  rowTaken: {
    opacity: 0.7,
  },
  donutTag: {
    background: '#f3e8ff',
    color: '#7c3aed',
    padding: '3px 8px',
    borderRadius: '8px',
    fontSize: '0.75rem',
    border: '1px solid #e9d5ff',
  },
  tableStatus: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
  },
  tableStatusAvailable: {
    background: '#f0fdf4',
    color: '#16a34a',
    border: '1px solid #bbf7d0',
  },
  tableStatusTaken: {
    background: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
  },
  contacts: {
    marginTop: '30px',
  },
  contactsTitle: {
    color: '#1e293b',
    marginBottom: '15px',
    fontSize: '1.1rem',
    fontWeight: 700,
  },
  contactsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  contactCard: {
    padding: '16px',
    background: 'linear-gradient(135deg, #eff6ff, #e0e7ff)',
    borderRadius: '12px',
    border: '2px solid #bfdbfe',
  },
  contactName: {
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: '12px',
    fontSize: '1rem',
    textAlign: 'center',
  },
  contactButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  contactBtnCall: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '12px',
    background: '#3b82f6',
    color: 'white',
    fontWeight: 600,
    fontSize: '0.9rem',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
  },
  contactBtnWhatsapp: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '12px',
    background: '#22c55e',
    color: 'white',
    fontWeight: 600,
    fontSize: '0.9rem',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
  },
  // Manager mode styles
  hamburgerBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9rem',
  },
  hamburgerIcon: {
    fontSize: '1.2rem',
  },
  managerName: {
    maxWidth: '120px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  managerDropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '8px',
    background: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
    border: '1px solid #e2e8f0',
    minWidth: '220px',
    maxWidth: 'calc(100vw - 40px)',
    zIndex: 1000,
    overflow: 'hidden',
  },
  menuUserInfo: {
    padding: '14px 16px',
    background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)',
    borderBottom: '1px solid #e2e8f0',
  },
  menuUserName: {
    fontWeight: 'bold',
    fontSize: '1rem',
    marginBottom: '4px',
    color: '#1e293b',
  },
  menuUserPhone: {
    fontSize: '0.85rem',
    color: '#64748b',
  },
  menuUserRole: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    marginTop: '4px',
  },
  menuStationNameSmall: {
    fontSize: '0.8rem',
    color: '#2563eb',
    marginTop: '6px',
    fontWeight: 600,
  },
  menuStationInfo: {
    padding: '12px 16px',
    background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  menuStationName: {
    fontWeight: 'bold',
    fontSize: '0.9rem',
    color: '#2563eb',
    marginBottom: '4px',
  },
  menuStationAddress: {
    fontSize: '0.8rem',
    color: '#64748b',
  },
  menuDivider: {
    height: '1px',
    background: '#e2e8f0',
  },
  menuItem: {
    display: 'block',
    width: '100%',
    padding: '12px 16px',
    background: 'transparent',
    border: 'none',
    color: '#1e293b',
    fontSize: '0.9rem',
    textAlign: 'right',
    cursor: 'pointer',
    borderBottom: '1px solid #f1f5f9',
  },
  managerActions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  addBtn: {
    background: '#16a34a',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.85rem',
  },
  templateBtn: {
    background: '#7c3aed',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.85rem',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  editContactsBtn: {
    background: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.85rem',
  },
  changePasswordBtn: {
    background: '#7c3aed',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.85rem',
  },
  logoutBtn: {
    background: '#f8fafc',
    color: '#64748b',
    border: '1px solid #e2e8f0',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.85rem',
  },
  managerBadge: {
    display: 'inline-block',
    background: '#f0fdf4',
    color: '#16a34a',
    border: '1px solid #bbf7d0',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '0.85rem',
    marginTop: '10px',
  },
  // Card action buttons
  borrowerInfo: {
    marginTop: '10px',
    padding: '10px',
    background: '#fef2f2',
    borderRadius: '8px',
    border: '1px solid #fecaca',
  },
  borrowerName: {
    fontWeight: 'bold',
    color: '#dc2626',
    fontSize: '0.85rem',
  },
  borrowerPhone: {
    color: '#ef4444',
    fontSize: '0.8rem',
  },
  borrowDate: {
    color: '#94a3b8',
    fontSize: '0.75rem',
    marginTop: '4px',
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
    marginTop: 'auto',
    paddingTop: '12px',
    borderTop: '1px solid #e2e8f0',
  },
  borrowBtn: {
    flex: 1,
    background: '#16a34a',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.85rem',
  },
  returnBtn: {
    flex: 1,
    background: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.85rem',
  },
  deleteBtn: {
    background: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  whatsappShareBtn: {
    background: '#16a34a',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  optionsBtn: {
    background: 'linear-gradient(135deg, #6b7280, #4b5563)',
    border: '1px solid #e2e8f0',
    color: '#fff',
    padding: '8px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  optionsDropdown: {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginBottom: '8px',
    background: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 -8px 32px rgba(0,0,0,0.10)',
    border: '1px solid #e2e8f0',
    minWidth: '180px',
    zIndex: 999,
    overflow: 'hidden',
  },
  optionItem: {
    display: 'block',
    width: '100%',
    padding: '12px 16px',
    background: 'transparent',
    border: 'none',
    color: '#1e293b',
    fontSize: '0.9rem',
    textAlign: 'right',
    cursor: 'pointer',
    transition: 'background 0.2s',
    borderBottom: '1px solid #f1f5f9',
  },
  optionItemDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(15,23,42,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '10px',
    overflow: 'auto',
  },
  modal: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '20px',
    width: '100%',
    maxWidth: '400px',
    maxHeight: 'calc(100vh - 20px)',
    overflowY: 'auto',
    margin: 'auto',
    border: '1px solid #e2e8f0',
    boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
  },
  modalTitle: {
    color: '#1e293b',
    marginBottom: '10px',
    fontSize: '1.3rem',
    fontWeight: 700,
  },
  modalSubtitle: {
    color: '#64748b',
    fontSize: '0.9rem',
    marginBottom: '20px',
  },
  formGroup: {
    marginBottom: '15px',
  },
  formRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    color: '#475569',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    color: '#1e293b',
    fontSize: '0.95rem',
  },
  inputError: {
    border: '2px solid #ef4444',
    background: '#fef2f2',
  },
  inputSmall: {
    flex: 1,
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    color: '#1e293b',
    fontSize: '0.85rem',
    minWidth: '80px',
  },
  checkboxGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '15px',
  },
  checkboxLabel: {
    color: '#475569',
    fontSize: '0.9rem',
  },
  modalButtons: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
  },
  cancelBtn: {
    flex: 1,
    background: '#f8fafc',
    color: '#64748b',
    border: '1px solid #e2e8f0',
    padding: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  submitBtn: {
    flex: 1,
    background: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  smallBtn: {
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.85rem',
  },
  removeBtn: {
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#ef4444',
    fontSize: '0.85rem',
    marginTop: '8px',
  },
  // Contact edit styles
  contactEditRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    marginBottom: '12px',
    padding: '10px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
  },
  contactEditFields: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  removeContactBtn: {
    background: '#ef4444',
    color: 'white',
    border: 'none',
    width: '30px',
    height: '30px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  addContactBtn: {
    width: '100%',
    background: 'transparent',
    border: '2px dashed #e2e8f0',
    color: '#64748b',
    padding: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '10px',
  },
  // Confirm dialog styles
  confirmDialog: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '25px',
    width: '100%',
    maxWidth: '360px',
    textAlign: 'center',
    boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
    border: '1px solid #e2e8f0',
  },
  confirmTitle: {
    fontSize: '1.3rem',
    marginBottom: '12px',
    fontWeight: 'bold',
    color: '#1e293b',
  },
  confirmMessage: {
    color: '#64748b',
    fontSize: '1rem',
    marginBottom: '25px',
    lineHeight: 1.5,
  },
  confirmButtons: {
    display: 'flex',
    gap: '12px',
  },
  confirmBtn: {
    flex: 1,
    color: 'white',
    border: 'none',
    padding: '14px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  // Excel button styles
  excelBtn: {
    background: '#16a34a',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.85rem',
  },
  excelImportBtn: {
    background: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '20px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    textAlign: 'center' as const,
  },
  excelExportBtn: {
    background: '#16a34a',
    color: 'white',
    border: 'none',
    padding: '20px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    textAlign: 'center' as const,
  },
  excelTemplateBtn: {
    background: '#7c3aed',
    color: 'white',
    border: 'none',
    padding: '20px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    textAlign: 'center' as const,
    textDecoration: 'none',
    display: 'block',
  },
  // Tab navigation
  tabNav: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    marginBottom: '20px',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    padding: '8px',
    borderRadius: '12px',
  },
  tabBtn: {
    padding: '10px 8px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.85rem',
    background: 'transparent',
    color: '#64748b',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnActive: {
    background: '#2563eb',
    color: 'white',
  },
  pendingIndicator: {
    position: 'absolute',
    top: '-6px',
    right: '-6px',
    background: '#ec4899',
    color: 'white',
    fontSize: '0.7rem',
    fontWeight: 700,
    minWidth: '18px',
    height: '18px',
    borderRadius: '9px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  // Tracking section
  trackingSection: {
    marginBottom: '20px',
  },
  trackingStats: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  trackingStat: {
    flex: 1,
    minWidth: '100px',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    padding: '15px',
    borderRadius: '12px',
    textAlign: 'center',
  },
  trackingStatValue: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#1e293b',
  },
  trackingStatLabel: {
    color: '#64748b',
    fontSize: '0.8rem',
    marginTop: '5px',
  },
  trackingFilterTabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '15px',
    flexWrap: 'wrap',
  },
  trackingFilterBtn: {
    padding: '8px 16px',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    fontSize: '0.9rem',
    cursor: 'pointer',
    background: '#f8fafc',
    color: '#64748b',
  },
  trackingFilterBtnActive: {
    background: '#2563eb',
    color: 'white',
    border: '1px solid #2563eb',
  },
  trackingFilterBtnPending: {
    background: '#ec4899',
    color: 'white',
    border: '1px solid #ec4899',
  },
  trackingTableWrapper: {
    overflowX: 'auto',
    marginBottom: '20px',
  },
  trackingTable: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '500px',
    tableLayout: 'fixed' as const,
  },
  trackingTh: {
    background: '#f8fafc',
    color: '#475569',
    padding: '12px 8px',
    textAlign: 'right',
    fontSize: '0.85rem',
    borderBottom: '1px solid #e2e8f0',
    fontWeight: 600,
  },
  trackingTd: {
    padding: '12px 8px',
    borderBottom: '1px solid #f1f5f9',
    color: '#1e293b',
    fontSize: '0.9rem',
  },
  borrowerNameCell: {
    fontWeight: 'bold',
    color: '#1e293b',
  },
  borrowerInfoCell: {
    color: '#64748b',
    fontSize: '0.8rem',
  },
  depositBadge: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: 600,
    background: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0',
  },
  depositBadgeMoney: {
    background: '#d1fae5',
    color: '#065f46',
  },
  depositBadgeDoc: {
    background: '#fef3c7',
    color: '#92400e',
  },
  statusWaiting: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: 600,
    background: '#fef3c7',
    color: '#92400e',
  },
  statusPending: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: 600,
    background: '#fce7f3',
    color: '#be185d',
  },
  statusSigned: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: 600,
    background: '#d1fae5',
    color: '#065f46',
  },
  statusReturned: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: 600,
    background: '#e0e7ff',
    color: '#3730a3',
  },
  statusOverdue: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: 600,
    background: '#fee2e2',
    color: '#991b1b',
  },
  whatsappBtn: {
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: 600,
    background: '#25d366',
    color: 'white',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
  },
  returnBtnSmall: {
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: 600,
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
  },
  viewFormBtn: {
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: 600,
    background: '#8b5cf6',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
  },
  whatsappLinkBox: {
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '10px',
    padding: '12px 16px',
    marginTop: '16px',
  },
  whatsappLinkTitle: {
    color: '#16a34a',
    fontSize: '0.9rem',
    margin: '0',
    fontWeight: 600,
  },
  whatsappLinkDesc: {
    color: '#64748b',
    fontSize: '0.9rem',
    marginBottom: '12px',
  },
  whatsappLinkInput: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  linkInput: {
    flex: 1,
    minWidth: '200px',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    color: '#1e293b',
    fontSize: '0.9rem',
  },
  copyBtn: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: 'none',
    background: '#25d366',
    color: 'white',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '0.85rem',
  },
  actionButtons: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap' as const,
  },
  approveBtn: {
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: 600,
    background: '#10b981',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
  },
  rejectBtn: {
    padding: '6px 10px',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: 600,
    background: '#ef4444',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
  },
  // Empty state styles
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    textAlign: 'center',
  },
  emptyStateCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    textAlign: 'center',
    background: '#ffffff',
    borderRadius: '16px',
    border: '2px dashed #e2e8f0',
    gridColumn: '1 / -1',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px',
    opacity: 0.7,
  },
  emptyTitle: {
    fontSize: '1.2rem',
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '0.95rem',
    color: '#64748b',
  },
  // Mobile card styles for tracking
  mobileCard: {
    background: '#ffffff',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid #e2e8f0',
  },
  mobileCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
    paddingBottom: '12px',
    borderBottom: '1px solid #e2e8f0',
  },
  mobileCardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '12px',
  },
  mobileCardRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.9rem',
  },
  mobileCardActions: {
    display: 'flex',
    gap: '8px',
    paddingTop: '12px',
    borderTop: '1px solid #e2e8f0',
  },
}
