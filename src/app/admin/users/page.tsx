'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { AdminShell } from '@/components/admin/AdminShell'

// ── Types ─────────────────────────────────────────────────────────────────────

interface UserRole {
  id: string
  role: 'super_manager' | 'station_manager' | 'call_center_manager' | 'operator' | 'puncture_manager' | 'admin'
  station_id:        string | null
  call_center_id:    string | null
  is_primary:        boolean
  title:             string | null
  operator_code:     string | null
  allowed_districts: string[] | null
  is_active:         boolean
  station_name?:     string | null
  call_center_name?: string | null
}

interface User {
  id:         string
  full_name:  string
  phone:      string
  password?:  string | null
  is_active:  boolean
  created_at: string
  roles:      UserRole[]
}

interface Station {
  id:   string
  name: string
}

interface CallCenter {
  id:   string
  name: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<UserRole['role'], string> = {
  admin:               'אדמין',
  super_manager:       'מנהל-על',
  station_manager:     'מנהל תחנה',
  call_center_manager: 'מנהל מוקד',
  operator:            'מוקדן',
  puncture_manager:    'מנהל פנצ׳ריות',
}

const ROLE_COLORS: Record<UserRole['role'], string> = {
  admin:               '#0f172a',
  super_manager:       '#7c3aed',
  station_manager:     '#16a34a',
  call_center_manager: '#2563eb',
  operator:            '#0891b2',
  puncture_manager:    '#d97706',
}

// ── Dots Menu ─────────────────────────────────────────────────────────────────

interface MenuItem {
  label:   string
  color?:  string
  onClick: () => void
}

function DotsMenu({ items }: { items: MenuItem[] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(v => !v) }}
        style={{
          width: 30, height: 30, borderRadius: 8,
          background: 'transparent', border: '1px solid #e2e8f0',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#64748b', fontSize: '1rem', lineHeight: 1,
        }}
      >
        ⋯
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '110%', left: 0, zIndex: 100,
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 160,
          padding: '4px 0', direction: 'rtl',
        }}>
          {items.map((item, i) => (
            <button
              key={i}
              onClick={e => { e.stopPropagation(); setOpen(false); item.onClick() }}
              style={{
                display: 'block', width: '100%', textAlign: 'right',
                padding: '9px 14px', background: 'none', border: 'none',
                fontSize: '0.85rem', cursor: 'pointer',
                color: item.color || '#1e293b',
                fontWeight: 500,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Modals ────────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff', borderRadius: 14, padding: '24px',
          width: '100%', maxWidth: 440, direction: 'rtl',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 20 }}>{title}</div>
        {children}
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

function UsersPageInner() {
  const { isAuthenticated, isLoading: authLoading, logout } = useAdminAuth()
  const searchParams = useSearchParams()

  const [users,      setUsers]      = useState<User[]>([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState(searchParams.get('phone') || '')
  const [roleFilter, setRoleFilter] = useState<UserRole['role'] | 'all'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [busy,       setBusy]       = useState(false)

  // Edit modal
  const [editUser,    setEditUser]    = useState<User | null>(null)
  const [editName,    setEditName]    = useState('')
  const [editPhone,   setEditPhone]   = useState('')
  const [editPass,    setEditPass]    = useState('')

  // Delete confirm modal
  const [deleteUser, setDeleteUser] = useState<User | null>(null)

  // Merge modal
  const [mergeSource, setMergeSource] = useState<User | null>(null)
  const [mergeTarget, setMergeTarget] = useState<string>('')

  // Add user modal
  const [showAdd,       setShowAdd]       = useState(false)
  const [addName,       setAddName]       = useState('')
  const [addPhone,      setAddPhone]      = useState('')
  const [addPass,       setAddPass]       = useState('')
  const [addRole,       setAddRole]       = useState<UserRole['role']>('station_manager')
  const [addStationId,  setAddStationId]  = useState('')
  const [addCcId,       setAddCcId]       = useState('')
  const [addOpCode,     setAddOpCode]     = useState('')
  const [addTitle,      setAddTitle]      = useState('')

  // Add role modal
  const [addRoleUser,    setAddRoleUser]    = useState<User | null>(null)
  const [addRoleType,    setAddRoleType]    = useState<UserRole['role']>('station_manager')
  const [addRoleStation, setAddRoleStation] = useState('')
  const [addRoleCc,      setAddRoleCc]      = useState('')
  const [addRoleOpCode,  setAddRoleOpCode]  = useState('')
  const [addRoleTitle,   setAddRoleTitle]   = useState('')

  // Inline-create modes (add-user modal)
  const [addCcMode,        setAddCcMode]        = useState<'select' | 'new'>('select')
  const [addCcNewName,     setAddCcNewName]     = useState('')
  const [addStMode,        setAddStMode]        = useState<'select' | 'new'>('select')
  const [addStNewName,     setAddStNewName]     = useState('')

  // Inline-create modes (add-role modal)
  const [addRoleCcMode,    setAddRoleCcMode]    = useState<'select' | 'new'>('select')
  const [addRoleCcNewName, setAddRoleCcNewName] = useState('')
  const [addRoleStMode,    setAddRoleStMode]    = useState<'select' | 'new'>('select')
  const [addRoleStNewName, setAddRoleStNewName] = useState('')

  // Reference data for add-user dropdowns
  const [stations,     setStations]     = useState<Station[]>([])
  const [callCenters,  setCallCenters]  = useState<CallCenter[]>([])

  useEffect(() => {
    if (!isAuthenticated) return
    fetchUsers()
    fetchRefData()
  }, [isAuthenticated])

  async function fetchRefData() {
    const [stRes, ccRes] = await Promise.all([
      fetch('/api/wheel-stations'),
      fetch('/api/admin/call-centers'),
    ])
    if (stRes.ok) { const d = await stRes.json(); setStations(d.stations || []) }
    if (ccRes.ok) { const d = await ccRes.json(); setCallCenters(d.callCenters || []) }
  }

  async function fetchUsers() {
    setLoading(true)
    try {
      const res  = await fetch('/api/admin/users')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setUsers(data.users || [])
    } catch {
      toast.error('שגיאה בטעינת משתמשים')
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleActive(user: User) {
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !user.is_active }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      await fetchUsers()
      toast.success(user.is_active ? 'משתמש הושבת' : 'משתמש הופעל')
    } catch { toast.error('שגיאה בעדכון') }
    finally { setBusy(false) }
  }

  async function handleSaveEdit() {
    if (!editUser) return
    if (!editName.trim()) { toast.error('שם לא יכול להיות ריק'); return }
    if (!editPhone.trim()) { toast.error('טלפון לא יכול להיות ריק'); return }
    if (editPass && editPass.length < 4) { toast.error('סיסמה חייבת להיות לפחות 4 תווים'); return }
    setBusy(true)
    try {
      const body: Record<string, string> = {
        full_name: editName.trim(),
        phone: editPhone.trim(),
      }
      if (editPass) body.password = editPass
      const res = await fetch(`/api/admin/users/${editUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setEditUser(null)
      await fetchUsers()
      toast.success('פרטים עודכנו')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'שגיאה בעדכון')
    } finally { setBusy(false) }
  }

  async function handleDelete() {
    if (!deleteUser) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/users/${deleteUser.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDeleteUser(null)
      if (expandedId === deleteUser.id) setExpandedId(null)
      await fetchUsers()
      toast.success('משתמש נמחק')
    } catch { toast.error('שגיאה במחיקה') }
    finally { setBusy(false) }
  }

  async function handleMerge() {
    if (!mergeSource || !mergeTarget) return
    setBusy(true)
    try {
      const res = await fetch('/api/admin/users/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keep_id: mergeTarget, delete_id: mergeSource.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMergeSource(null)
      setMergeTarget('')
      await fetchUsers()
      toast.success('משתמשים אוחדו')
    } catch { toast.error('שגיאה במיזוג') }
    finally { setBusy(false) }
  }

  async function createCallCenter(name: string): Promise<string | null> {
    const res = await fetch('/api/admin/call-centers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error || 'שגיאה ביצירת מוקד'); return null }
    await fetchRefData()
    return data.callCenter.id as string
  }

  async function createStation(name: string): Promise<string | null> {
    const res = await fetch('/api/wheel-stations/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error || 'שגיאה ביצירת תחנה'); return null }
    await fetchRefData()
    return data.station.id as string
  }

  function resetAddRoleForm() {
    setAddRoleType('station_manager'); setAddRoleStation(''); setAddRoleCc(''); setAddRoleOpCode(''); setAddRoleTitle('')
    setAddRoleCcMode('select'); setAddRoleCcNewName(''); setAddRoleStMode('select'); setAddRoleStNewName('')
  }

  async function handleAddRole() {
    if (!addRoleUser) return
    if (addRoleType === 'station_manager' && !addRoleStation && !(addRoleStMode === 'new' && addRoleStNewName.trim())) { toast.error('יש לבחור תחנה'); return }
    if ((addRoleType === 'call_center_manager' || addRoleType === 'operator') && !addRoleCc && !(addRoleCcMode === 'new' && addRoleCcNewName.trim())) { toast.error('יש לבחור מוקד'); return }
    setBusy(true)
    try {
      let resolvedCc = addRoleCc === '__all__' ? null : addRoleCc
      let resolvedStation = addRoleStation

      if (addRoleCcMode === 'new' && addRoleCcNewName.trim()) {
        const id = await createCallCenter(addRoleCcNewName.trim())
        if (!id) { setBusy(false); return }
        resolvedCc = id
      }
      if (addRoleStMode === 'new' && addRoleStNewName.trim()) {
        const id = await createStation(addRoleStNewName.trim())
        if (!id) { setBusy(false); return }
        resolvedStation = id
      }

      const body: Record<string, unknown> = { role: addRoleType }
      if (resolvedStation) body.station_id     = resolvedStation
      if (resolvedCc)      body.call_center_id = resolvedCc
      if (addRoleOpCode)   body.operator_code  = addRoleOpCode
      if (addRoleTitle)    body.title          = addRoleTitle
      const res  = await fetch(`/api/admin/users/${addRoleUser.id}/roles`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAddRoleUser(null)
      resetAddRoleForm()
      await fetchUsers()
      toast.success('תפקיד נוסף בהצלחה')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'שגיאה בהוספת תפקיד')
    } finally { setBusy(false) }
  }

  function resetAddForm() {
    setAddName(''); setAddPhone(''); setAddPass(''); setAddRole('station_manager')
    setAddStationId(''); setAddCcId(''); setAddOpCode(''); setAddTitle('')
    setAddCcMode('select'); setAddCcNewName(''); setAddStMode('select'); setAddStNewName('')
  }

  async function handleAddUser() {
    if (!addName.trim())  { toast.error('שם חובה'); return }
    if (!addPhone.trim()) { toast.error('טלפון חובה'); return }
    if (!addPass.trim())  { toast.error('סיסמה חובה'); return }
    if (addRole === 'station_manager' && !addStationId && !(addStMode === 'new' && addStNewName.trim())) { toast.error('יש לבחור תחנה'); return }
    if ((addRole === 'call_center_manager' || addRole === 'operator') && !addCcId && !(addCcMode === 'new' && addCcNewName.trim())) { toast.error('יש לבחור מוקד'); return }
    setBusy(true)
    try {
      let resolvedCc = addCcId === '__all__' ? null : addCcId
      let resolvedStation = addStationId

      if (addCcMode === 'new' && addCcNewName.trim()) {
        const id = await createCallCenter(addCcNewName.trim())
        if (!id) { setBusy(false); return }
        resolvedCc = id
      }
      if (addStMode === 'new' && addStNewName.trim()) {
        const id = await createStation(addStNewName.trim())
        if (!id) { setBusy(false); return }
        resolvedStation = id
      }

      const body: Record<string, unknown> = {
        full_name: addName.trim(),
        phone: addPhone.trim(),
        password: addPass,
        role: addRole,
      }
      if (resolvedStation) body.station_id    = resolvedStation
      if (resolvedCc)      body.call_center_id = resolvedCc
      if (addOpCode)       body.operator_code  = addOpCode
      if (addTitle)        body.title          = addTitle
      const res  = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setShowAdd(false)
      resetAddForm()
      await fetchUsers()
      toast.success('משתמש נוסף בהצלחה')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'שגיאה בהוספה')
    } finally { setBusy(false) }
  }

  async function handleToggleRole(userId: string, roleId: string, current: boolean) {
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}/roles/${roleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !current }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      await fetchUsers()
      toast.success(current ? 'תפקיד הושבת' : 'תפקיד הופעל')
    } catch { toast.error('שגיאה בעדכון תפקיד') }
    finally { setBusy(false) }
  }

  async function handleTogglePrimary(userId: string, roleId: string, current: boolean) {
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}/roles/${roleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_primary: !current }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      await fetchUsers()
      toast.success(!current ? 'הוגדר כמנהל ראשי' : 'הוגדר כמנהל משני')
    } catch { toast.error('שגיאה בעדכון') }
    finally { setBusy(false) }
  }

  // ── Filter ─────────────────────────────────────────────────────────────────

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    const matchesSearch = !q || u.full_name.toLowerCase().includes(q) || u.phone.includes(q)
    const matchesRole   = roleFilter === 'all' || u.roles.some(r => r.role === roleFilter)
    return matchesSearch && matchesRole
  })

  // ── Loading / auth ──────────────────────────────────────────────────────────

  if (authLoading || !isAuthenticated) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc' }}>
        <div style={{ color: '#64748b' }}>טוען...</div>
      </div>
    )
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <AdminShell onLogout={logout}>
      <div dir="rtl" style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: "'Segoe UI', sans-serif", color: '#1e293b' }}>
      <style>{`
        @media (max-width: 520px) {
          .user-badges-row { display: none !important; }
          .user-badges-inline { display: flex !important; }
        }
        @media (min-width: 521px) {
          .user-badges-inline { display: none !important; }
        }
      `}</style>

        {/* Page header */}
        <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '20px 24px' }}>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>ניהול משתמשים</h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>{users.length} משתמשים במערכת</p>
        </div>

        {/* Toolbar */}
        <div style={{ padding: '16px 24px', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            placeholder="חיפוש לפי שם או טלפון..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1, minWidth: 200, padding: '8px 14px', borderRadius: 8,
              border: '1px solid #e2e8f0', fontSize: '0.875rem', background: '#fff',
              outline: 'none', color: '#1e293b',
            }}
          />
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value as UserRole['role'] | 'all')}
            style={{
              padding: '8px 14px', borderRadius: 8, border: '1px solid #e2e8f0',
              fontSize: '0.875rem', background: '#fff', color: '#1e293b', cursor: 'pointer',
            }}
          >
            <option value="all">כל התפקידים</option>
            {(Object.keys(ROLE_LABELS) as UserRole['role'][]).map(r => (
              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </select>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            {filtered.length} תוצאות
          </div>
          <button
            onClick={() => { resetAddForm(); setShowAdd(true) }}
            style={{
              padding: '8px 16px', borderRadius: 8, background: '#16a34a', color: '#fff',
              border: 'none', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>+</span> הוסף משתמש
          </button>
        </div>

        {/* Users list */}
        <div style={{ padding: '0 24px 32px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>טוען...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>לא נמצאו משתמשים</div>
          ) : (
            filtered.map(user => (
              <UserCard
                key={user.id}
                user={user}
                expanded={expandedId === user.id}
                busy={busy}
                onToggleExpand={() => setExpandedId(expandedId === user.id ? null : user.id)}
                onEdit={() => { setEditUser(user); setEditName(user.full_name); setEditPhone(user.phone); setEditPass('') }}
                onToggleActive={() => handleToggleActive(user)}
                onAddRole={() => { setAddRoleUser(user); resetAddRoleForm() }}
                onMerge={() => { setMergeSource(user); setMergeTarget('') }}
                onDelete={() => setDeleteUser(user)}
                onToggleRole={handleToggleRole}
                onTogglePrimary={handleTogglePrimary}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Edit modal ── */}
      {editUser && (
        <Modal title={`עריכת משתמש — ${editUser.full_name}`} onClose={() => setEditUser(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={labelStyle}>שם מלא</label>
            <input value={editName} onChange={e => setEditName(e.target.value)} style={inputStyle} />
            <label style={labelStyle}>טלפון</label>
            <input value={editPhone} onChange={e => setEditPhone(e.target.value)} style={inputStyle} dir="ltr" />
            <label style={labelStyle}>סיסמה חדשה <span style={{ color: '#94a3b8', fontWeight: 400 }}>(השאר ריק לשמור קיימת)</span></label>
            <input type="password" value={editPass} onChange={e => setEditPass(e.target.value)} style={inputStyle} placeholder="לפחות 4 תווים" />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button onClick={handleSaveEdit} disabled={busy} style={btnPrimary}>שמור</button>
              <button onClick={() => setEditUser(null)} style={btnSecondary}>ביטול</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Delete confirm modal ── */}
      {deleteUser && (
        <Modal title="מחיקת משתמש" onClose={() => setDeleteUser(null)}>
          <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: '0.9rem' }}>
            בטוח למחוק את <strong>{deleteUser.full_name}</strong>? הפעולה תמחק גם את כל התפקידים שלו.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleDelete} disabled={busy} style={{ ...btnPrimary, background: '#ef4444' }}>מחק</button>
            <button onClick={() => setDeleteUser(null)} style={btnSecondary}>ביטול</button>
          </div>
        </Modal>
      )}

      {/* ── Merge modal ── */}
      {mergeSource && (
        <Modal title={`מיזוג — ${mergeSource.full_name}`} onClose={() => setMergeSource(null)}>
          <p style={{ margin: '0 0 12px', color: '#64748b', fontSize: '0.85rem' }}>
            בחר את המשתמש שישמר. תפקידי <strong>{mergeSource.full_name}</strong> יעברו אליו והרשומה הכפולה תימחק.
          </p>
          <select
            value={mergeTarget}
            onChange={e => setMergeTarget(e.target.value)}
            style={{ ...inputStyle, marginBottom: 16 }}
          >
            <option value="">— בחר משתמש לשמירה —</option>
            {users
              .filter(u => u.id !== mergeSource.id)
              .sort((a, b) => a.full_name.localeCompare(b.full_name, 'he'))
              .map(u => (
                <option key={u.id} value={u.id}>{u.full_name} ({u.phone})</option>
              ))}
          </select>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleMerge} disabled={busy || !mergeTarget} style={btnPrimary}>מזג</button>
            <button onClick={() => setMergeSource(null)} style={btnSecondary}>ביטול</button>
          </div>
        </Modal>
      )}

      {/* ── Add role modal ── */}
      {addRoleUser && (
        <Modal title={`הוספת תפקיד — ${addRoleUser.full_name}`} onClose={() => { setAddRoleUser(null); resetAddRoleForm() }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={labelStyle}>תפקיד *</label>
            <select value={addRoleType} onChange={e => setAddRoleType(e.target.value as UserRole['role'])} style={inputStyle}>
              {(Object.keys(ROLE_LABELS) as UserRole['role'][]).map(r => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>

            {addRoleType === 'station_manager' && (
              <>
                <label style={labelStyle}>תחנה *</label>
                <select
                  value={addRoleStMode === 'new' ? '__new__' : addRoleStation}
                  onChange={e => {
                    if (e.target.value === '__new__') { setAddRoleStMode('new'); setAddRoleStation('') }
                    else { setAddRoleStMode('select'); setAddRoleStation(e.target.value) }
                  }}
                  style={inputStyle}
                >
                  <option value="">— בחר תחנה —</option>
                  {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  <option value="__new__">+ צור תחנה חדשה</option>
                </select>
                {addRoleStMode === 'new' && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input value={addRoleStNewName} onChange={e => setAddRoleStNewName(e.target.value)} style={{ ...inputStyle, flex: 1 }} placeholder="שם התחנה החדשה" />
                    <button
                      type="button"
                      onClick={async () => {
                        if (!addRoleStNewName.trim()) { toast.error('נא להזין שם תחנה'); return }
                        setBusy(true)
                        const id = await createStation(addRoleStNewName.trim())
                        if (id) { setAddRoleStation(id); setAddRoleStMode('select'); setAddRoleStNewName('') }
                        setBusy(false)
                      }}
                      disabled={busy}
                      style={{ ...btnPrimary, flex: 'none', padding: '9px 14px', background: '#16a34a', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                    >צור</button>
                  </div>
                )}
              </>
            )}

            {(addRoleType === 'call_center_manager' || addRoleType === 'operator') && (
              <>
                <label style={labelStyle}>מוקד *</label>
                <select
                  value={addRoleCcMode === 'new' ? '__new__' : addRoleCc}
                  onChange={e => {
                    if (e.target.value === '__new__') { setAddRoleCcMode('new'); setAddRoleCc('') }
                    else { setAddRoleCcMode('select'); setAddRoleCc(e.target.value) }
                  }}
                  style={inputStyle}
                >
                  <option value="">— בחר מוקד —</option>
                  {addRoleType === 'call_center_manager' && <option value="__all__">⭐ כל המוקדים (מנהל-על)</option>}
                  {callCenters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  <option value="__new__">+ צור מוקד חדש</option>
                </select>
                {addRoleCcMode === 'new' && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input value={addRoleCcNewName} onChange={e => setAddRoleCcNewName(e.target.value)} style={{ ...inputStyle, flex: 1 }} placeholder="שם המוקד החדש" />
                    <button
                      type="button"
                      onClick={async () => {
                        if (!addRoleCcNewName.trim()) { toast.error('נא להזין שם מוקד'); return }
                        setBusy(true)
                        const id = await createCallCenter(addRoleCcNewName.trim())
                        if (id) { setAddRoleCc(id); setAddRoleCcMode('select'); setAddRoleCcNewName('') }
                        setBusy(false)
                      }}
                      disabled={busy}
                      style={{ ...btnPrimary, flex: 'none', padding: '9px 14px', background: '#7c3aed', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                    >צור</button>
                  </div>
                )}
              </>
            )}

            {addRoleType === 'operator' && (
              <>
                <label style={labelStyle}>קוד מוקדן <span style={{ color: '#94a3b8', fontWeight: 400 }}>(אופציונלי)</span></label>
                <input value={addRoleOpCode} onChange={e => setAddRoleOpCode(e.target.value)} style={inputStyle} placeholder="קוד כניסה" dir="ltr" />
              </>
            )}

            {(addRoleType === 'call_center_manager' || addRoleType === 'station_manager') && (
              <>
                <label style={labelStyle}>תואר <span style={{ color: '#94a3b8', fontWeight: 400 }}>(אופציונלי)</span></label>
                <input value={addRoleTitle} onChange={e => setAddRoleTitle(e.target.value)} style={inputStyle} placeholder="למשל: אחראי משמרת" />
              </>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <button onClick={handleAddRole} disabled={busy} style={{ ...btnPrimary, background: '#2563eb' }}>הוסף תפקיד</button>
              <button onClick={() => { setAddRoleUser(null); resetAddRoleForm() }} style={btnSecondary}>ביטול</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Add user modal ── */}
      {showAdd && (
        <Modal title="הוספת משתמש חדש" onClose={() => { setShowAdd(false); resetAddForm() }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={labelStyle}>שם מלא *</label>
            <input value={addName} onChange={e => setAddName(e.target.value)} style={inputStyle} placeholder="ישראל ישראלי" />

            <label style={labelStyle}>טלפון *</label>
            <input value={addPhone} onChange={e => setAddPhone(e.target.value)} style={inputStyle} dir="ltr" placeholder="0501234567" />

            <label style={labelStyle}>סיסמה *</label>
            <input type="password" value={addPass} onChange={e => setAddPass(e.target.value)} style={inputStyle} placeholder="לפחות 4 תווים" />

            <label style={labelStyle}>תפקיד *</label>
            <select value={addRole} onChange={e => setAddRole(e.target.value as UserRole['role'])} style={inputStyle}>
              {(Object.keys(ROLE_LABELS) as UserRole['role'][]).map(r => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>

            {/* Station picker */}
            {addRole === 'station_manager' && (
              <>
                <label style={labelStyle}>תחנה *</label>
                <select
                  value={addStMode === 'new' ? '__new__' : addStationId}
                  onChange={e => {
                    if (e.target.value === '__new__') { setAddStMode('new'); setAddStationId('') }
                    else { setAddStMode('select'); setAddStationId(e.target.value) }
                  }}
                  style={inputStyle}
                >
                  <option value="">— בחר תחנה —</option>
                  {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  <option value="__new__">+ צור תחנה חדשה</option>
                </select>
                {addStMode === 'new' && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input value={addStNewName} onChange={e => setAddStNewName(e.target.value)} style={{ ...inputStyle, flex: 1 }} placeholder="שם התחנה החדשה" />
                    <button
                      type="button"
                      onClick={async () => {
                        if (!addStNewName.trim()) { toast.error('נא להזין שם תחנה'); return }
                        setBusy(true)
                        const id = await createStation(addStNewName.trim())
                        if (id) { setAddStationId(id); setAddStMode('select'); setAddStNewName('') }
                        setBusy(false)
                      }}
                      disabled={busy}
                      style={{ ...btnPrimary, flex: 'none', padding: '9px 14px', background: '#16a34a', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                    >צור</button>
                  </div>
                )}
              </>
            )}

            {/* Call center picker */}
            {(addRole === 'call_center_manager' || addRole === 'operator') && (
              <>
                <label style={labelStyle}>מוקד *</label>
                <select
                  value={addCcMode === 'new' ? '__new__' : addCcId}
                  onChange={e => {
                    if (e.target.value === '__new__') { setAddCcMode('new'); setAddCcId('') }
                    else { setAddCcMode('select'); setAddCcId(e.target.value) }
                  }}
                  style={inputStyle}
                >
                  <option value="">— בחר מוקד —</option>
                  {addRole === 'call_center_manager' && <option value="__all__">⭐ כל המוקדים (מנהל-על)</option>}
                  {callCenters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  <option value="__new__">+ צור מוקד חדש</option>
                </select>
                {addCcMode === 'new' && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input value={addCcNewName} onChange={e => setAddCcNewName(e.target.value)} style={{ ...inputStyle, flex: 1 }} placeholder="שם המוקד החדש" />
                    <button
                      type="button"
                      onClick={async () => {
                        if (!addCcNewName.trim()) { toast.error('נא להזין שם מוקד'); return }
                        setBusy(true)
                        const id = await createCallCenter(addCcNewName.trim())
                        if (id) { setAddCcId(id); setAddCcMode('select'); setAddCcNewName('') }
                        setBusy(false)
                      }}
                      disabled={busy}
                      style={{ ...btnPrimary, flex: 'none', padding: '9px 14px', background: '#7c3aed', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                    >צור</button>
                  </div>
                )}
              </>
            )}

            {/* Operator code */}
            {addRole === 'operator' && (
              <>
                <label style={labelStyle}>קוד מוקדן <span style={{ color: '#94a3b8', fontWeight: 400 }}>(אופציונלי)</span></label>
                <input value={addOpCode} onChange={e => setAddOpCode(e.target.value)} style={inputStyle} placeholder="קוד כניסה" dir="ltr" />
              </>
            )}

            {/* Title */}
            {(addRole === 'call_center_manager' || addRole === 'station_manager') && (
              <>
                <label style={labelStyle}>תואר <span style={{ color: '#94a3b8', fontWeight: 400 }}>(אופציונלי)</span></label>
                <input value={addTitle} onChange={e => setAddTitle(e.target.value)} style={inputStyle} placeholder="למשל: אחראי משמרת" />
              </>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <button onClick={handleAddUser} disabled={busy} style={{ ...btnPrimary, background: '#16a34a' }}>הוסף</button>
              <button onClick={() => { setShowAdd(false); resetAddForm() }} style={btnSecondary}>ביטול</button>
            </div>
          </div>
        </Modal>
      )}
    </AdminShell>
  )
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0',
  fontSize: '0.875rem', color: '#1e293b', outline: 'none', boxSizing: 'border-box',
}
const labelStyle: React.CSSProperties = {
  fontSize: '0.78rem', fontWeight: 700, color: '#475569',
}
const btnPrimary: React.CSSProperties = {
  flex: 1, padding: '9px 0', borderRadius: 8, background: '#2563eb', color: '#fff',
  border: 'none', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer',
}
const btnSecondary: React.CSSProperties = {
  flex: 1, padding: '9px 0', borderRadius: 8, background: 'transparent', color: '#64748b',
  border: '1px solid #e2e8f0', fontSize: '0.875rem', cursor: 'pointer',
}

// ── UserCard ──────────────────────────────────────────────────────────────────

interface UserCardProps {
  user:             User
  expanded:         boolean
  busy:             boolean
  onToggleExpand:   () => void
  onEdit:           () => void
  onToggleActive:   () => void
  onAddRole:        () => void
  onMerge:          () => void
  onDelete:         () => void
  onToggleRole:     (userId: string, roleId: string, current: boolean) => void
  onTogglePrimary:  (userId: string, roleId: string, current: boolean) => void
}

function UserCard({ user, expanded, busy, onToggleExpand, onEdit, onToggleActive, onAddRole, onMerge, onDelete, onToggleRole, onTogglePrimary }: UserCardProps) {
  const [showPass, setShowPass] = useState(false)
  const menuItems: MenuItem[] = [
    { label: 'עריכת פרטים', onClick: onEdit },
    { label: 'הוספת תפקיד', onClick: onAddRole },
    { label: user.is_active ? 'השבת משתמש' : 'הפעל משתמש', onClick: onToggleActive },
    { label: 'מיזוג עם משתמש אחר', onClick: onMerge },
    { label: 'מחיקת משתמש', color: '#ef4444', onClick: onDelete },
  ]

  return (
    <div style={{
      background: '#fff', borderRadius: 12, marginBottom: 8,
      border: '1px solid #e2e8f0',
      opacity: user.is_active ? 1 : 0.6,
    }}>
      {/* Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
        {/* Avatar — clickable to expand */}
        <div
          style={{
            width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
            background: user.is_active ? 'linear-gradient(135deg,#22c55e,#16a34a)' : '#e2e8f0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer',
          }}
          onClick={onToggleExpand}
        >
          {user.full_name.charAt(0)}
        </div>

        {/* Name + phone — clickable to expand */}
        <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={onToggleExpand}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>{user.full_name}</div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{user.phone}</div>
          {/* Mobile: badges under the name */}
          <div className="user-badges-inline" style={{ display: 'none', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
            {user.roles.filter(r => r.is_active).map(r => (
              <span key={r.id} style={{
                padding: '2px 8px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 700,
                background: ROLE_COLORS[r.role] + '18', color: ROLE_COLORS[r.role],
                border: `1px solid ${ROLE_COLORS[r.role]}40`,
              }}>
                {ROLE_LABELS[r.role]}
              </span>
            ))}
            {!user.is_active && (
              <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 700, background: '#f1f5f9', color: '#94a3b8' }}>
                מושבת
              </span>
            )}
          </div>
        </div>

        {/* Role badges — desktop only */}
        <div className="user-badges-row" style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {user.roles.filter(r => r.is_active).map(r => (
            <span key={r.id} style={{
              padding: '2px 8px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 700,
              background: ROLE_COLORS[r.role] + '18', color: ROLE_COLORS[r.role],
              border: `1px solid ${ROLE_COLORS[r.role]}40`,
            }}>
              {ROLE_LABELS[r.role]}
            </span>
          ))}
          {!user.is_active && (
            <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 700, background: '#f1f5f9', color: '#94a3b8' }}>
              מושבת
            </span>
          )}
        </div>

        {/* Chevron */}
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"
          style={{ flexShrink: 0, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', cursor: 'pointer' }}
          onClick={onToggleExpand}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>

        {/* Dots menu */}
        <DotsMenu items={menuItems} />
      </div>

      {/* Expanded — roles */}
      {expanded && (
        <div style={{ borderTop: '1px solid #f1f5f9', padding: '16px' }}>
          {user.roles.length === 0 ? (
            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>אין תפקידים</div>
          ) : (
            <>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                תפקידים
              </div>
              {user.roles.map(role => (
                <div key={role.id} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                  background: '#f8fafc', borderRadius: 8, marginBottom: 4,
                }}>
                  <span style={{
                    width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                    background: role.is_active ? ROLE_COLORS[role.role] : '#cbd5e1',
                  }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, flex: 1 }}>
                    {ROLE_LABELS[role.role]}
                    {role.station_name     && <span style={{ color: '#64748b', fontWeight: 400 }}> — {role.station_name}</span>}
                    {role.call_center_name && <span style={{ color: '#64748b', fontWeight: 400 }}> — {role.call_center_name}</span>}
                    {role.is_primary       && <span style={{ color: '#f59e0b', fontSize: '0.7rem', marginRight: 4 }}> ★ ראשי</span>}
                  </span>
                  {role.operator_code && (
                    <span style={{ fontSize: '0.72rem', color: '#64748b', background: '#e2e8f0', padding: '1px 6px', borderRadius: 6 }}>
                      קוד: {role.operator_code}
                    </span>
                  )}
                  <DotsMenu items={[
                    {
                      label: role.is_primary ? 'הגדר כמשני' : 'הגדר כראשי',
                      color: role.is_primary ? '#64748b' : '#f59e0b',
                      onClick: () => onTogglePrimary(user.id, role.id, role.is_primary),
                    },
                    {
                      label: role.is_active ? 'השבת תפקיד' : 'הפעל תפקיד',
                      color: role.is_active ? '#ef4444' : '#16a34a',
                      onClick: () => onToggleRole(user.id, role.id, role.is_active),
                    },
                  ]} />
                </div>
              ))}
            </>
          )}

          {/* Password display */}
          <div style={{ marginTop: 12, padding: '8px 10px', background: '#f8fafc', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>סיסמה:</span>
            <span style={{ fontSize: '0.82rem', color: '#1e293b', flex: 1, fontFamily: 'monospace', direction: 'ltr' }}>
              {showPass ? user.password || '—' : '••••••••'}
            </span>
            <button
              onClick={() => setShowPass(v => !v)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}
            >
              {showPass ? 'הסתר' : 'הצג'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function UsersPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>טוען...</div>}>
      <UsersPageInner />
    </Suspense>
  )
}
