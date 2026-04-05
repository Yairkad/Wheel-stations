'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { AdminShell } from '@/components/admin/AdminShell'

// ── Types ─────────────────────────────────────────────────────────────────────

interface UserRole {
  id: string
  role: 'super_manager' | 'station_manager' | 'call_center_manager' | 'operator' | 'puncture_manager'
  station_id:      string | null
  call_center_id:  string | null
  is_primary:      boolean
  title:           string | null
  operator_code:   string | null
  allowed_districts: string[] | null
  is_active:       boolean
  station_name?:   string | null
  call_center_name?: string | null
}

interface User {
  id:         string
  full_name:  string
  phone:      string
  is_active:  boolean
  created_at: string
  roles:      UserRole[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<UserRole['role'], string> = {
  super_manager:        'מנהל-על',
  station_manager:      'מנהל תחנה',
  call_center_manager:  'מנהל מוקד',
  operator:             'מוקדן',
  puncture_manager:     'מנהל פנצ׳ריות',
}

const ROLE_COLORS: Record<UserRole['role'], string> = {
  super_manager:        '#7c3aed',
  station_manager:      '#16a34a',
  call_center_manager:  '#2563eb',
  operator:             '#0891b2',
  puncture_manager:     '#d97706',
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const { isAuthenticated, password, isLoading: authLoading, logout } = useAdminAuth()

  const [users,   setUsers]   = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole['role'] | 'all'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [actionLoading, setActionLoading] = useState(false)
  const [resetPasswordId, setResetPasswordId] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')

  useEffect(() => {
    if (isAuthenticated) fetchUsers()
  }, [isAuthenticated])

  async function fetchUsers() {
    setLoading(true)
    try {
      const res  = await fetch('/api/admin/users')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setUsers(data.users || [])
    } catch (e: unknown) {
      toast.error('שגיאה בטעינת משתמשים')
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleActive(userId: string, current: boolean) {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !current, admin_password: password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      await fetchUsers()
      toast.success(current ? 'משתמש הושבת' : 'משתמש הופעל')
    } catch {
      toast.error('שגיאה בעדכון')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleResetPassword(userId: string) {
    if (!newPassword || newPassword.length < 4) {
      toast.error('סיסמה חייבת להיות לפחות 4 תווים')
      return
    }
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword, admin_password: password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResetPasswordId(null)
      setNewPassword('')
      toast.success('סיסמה עודכנה')
    } catch {
      toast.error('שגיאה בעדכון סיסמה')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleToggleRole(userId: string, roleId: string, current: boolean) {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}/roles/${roleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !current, admin_password: password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      await fetchUsers()
      toast.success(current ? 'תפקיד הושבת' : 'תפקיד הופעל')
    } catch {
      toast.error('שגיאה בעדכון תפקיד')
    } finally {
      setActionLoading(false)
    }
  }

  // ── Filter ──────────────────────────────────────────────────────────────────

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    const matchesSearch = !q ||
      u.full_name.toLowerCase().includes(q) ||
      u.phone.includes(q)
    const matchesRole = roleFilter === 'all' ||
      u.roles.some(r => r.role === roleFilter)
    return matchesSearch && matchesRole
  })

  // ── Loading / auth ───────────────────────────────────────────────────────────

  if (authLoading || !isAuthenticated) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#f8fafc' }}>
        <div style={{ color:'#64748b' }}>טוען...</div>
      </div>
    )
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <AdminShell onLogout={logout}>
      <div dir="rtl" style={{ minHeight:'100vh', background:'#f1f5f9', fontFamily:"'Segoe UI', sans-serif", color:'#1e293b' }}>

        {/* Page header */}
        <div style={{ background:'#fff', borderBottom:'1px solid #e2e8f0', padding:'20px 24px' }}>
          <h1 style={{ margin:0, fontSize:'1.25rem', fontWeight:800 }}>ניהול משתמשים</h1>
          <p style={{ margin:'4px 0 0', fontSize:'0.8rem', color:'#64748b' }}>
            {users.length} משתמשים במערכת
          </p>
        </div>

        {/* Toolbar */}
        <div style={{ padding:'16px 24px', display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
          <input
            placeholder="חיפוש לפי שם או טלפון..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex:1, minWidth:200, padding:'8px 14px', borderRadius:8,
              border:'1px solid #e2e8f0', fontSize:'0.875rem', background:'#fff',
              outline:'none', color:'#1e293b',
            }}
          />
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value as UserRole['role'] | 'all')}
            style={{
              padding:'8px 14px', borderRadius:8, border:'1px solid #e2e8f0',
              fontSize:'0.875rem', background:'#fff', color:'#1e293b', cursor:'pointer',
            }}
          >
            <option value="all">כל התפקידים</option>
            {(Object.keys(ROLE_LABELS) as UserRole['role'][]).map(r => (
              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </select>
          <div style={{ marginRight:'auto', fontSize:'0.8rem', color:'#64748b' }}>
            {filtered.length} תוצאות
          </div>
        </div>

        {/* Users list */}
        <div style={{ padding:'0 24px 32px' }}>
          {loading ? (
            <div style={{ textAlign:'center', padding:48, color:'#94a3b8' }}>טוען...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:48, color:'#94a3b8' }}>לא נמצאו משתמשים</div>
          ) : (
            filtered.map(user => (
              <UserCard
                key={user.id}
                user={user}
                expanded={expandedId === user.id}
                onToggleExpand={() => setExpandedId(expandedId === user.id ? null : user.id)}
                onToggleActive={() => handleToggleActive(user.id, user.is_active)}
                onResetPassword={() => { setResetPasswordId(user.id); setNewPassword('') }}
                onToggleRole={handleToggleRole}
                actionLoading={actionLoading}
                resetPasswordId={resetPasswordId}
                newPassword={newPassword}
                setNewPassword={setNewPassword}
                onConfirmReset={() => handleResetPassword(user.id)}
                onCancelReset={() => { setResetPasswordId(null); setNewPassword('') }}
              />
            ))
          )}
        </div>
      </div>
    </AdminShell>
  )
}

// ── UserCard ──────────────────────────────────────────────────────────────────

interface UserCardProps {
  user:            User
  expanded:        boolean
  onToggleExpand:  () => void
  onToggleActive:  () => void
  onResetPassword: () => void
  onToggleRole:    (userId: string, roleId: string, current: boolean) => void
  actionLoading:   boolean
  resetPasswordId: string | null
  newPassword:     string
  setNewPassword:  (v: string) => void
  onConfirmReset:  () => void
  onCancelReset:   () => void
}

function UserCard({
  user, expanded, onToggleExpand, onToggleActive, onResetPassword,
  onToggleRole, actionLoading, resetPasswordId, newPassword,
  setNewPassword, onConfirmReset, onCancelReset,
}: UserCardProps) {
  const isResetting = resetPasswordId === user.id

  return (
    <div style={{
      background:'#fff', borderRadius:12, marginBottom:8,
      border:'1px solid #e2e8f0', overflow:'hidden',
      opacity: user.is_active ? 1 : 0.6,
    }}>
      {/* Row */}
      <div
        style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', cursor:'pointer' }}
        onClick={onToggleExpand}
      >
        {/* Avatar */}
        <div style={{
          width:38, height:38, borderRadius:'50%', flexShrink:0,
          background: user.is_active ? 'linear-gradient(135deg,#22c55e,#16a34a)' : '#e2e8f0',
          display:'flex', alignItems:'center', justifyContent:'center',
          color:'#fff', fontWeight:800, fontSize:'0.95rem',
        }}>
          {user.full_name.charAt(0)}
        </div>

        {/* Name + phone */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:700, fontSize:'0.9rem', color:'#1e293b' }}>{user.full_name}</div>
          <div style={{ fontSize:'0.78rem', color:'#64748b' }}>{user.phone}</div>
        </div>

        {/* Role badges */}
        <div style={{ display:'flex', gap:4, flexWrap:'wrap', justifyContent:'flex-end' }}>
          {user.roles.filter(r => r.is_active).map(r => (
            <span key={r.id} style={{
              padding:'2px 8px', borderRadius:12, fontSize:'0.7rem', fontWeight:700,
              background: ROLE_COLORS[r.role] + '18',
              color: ROLE_COLORS[r.role],
              border: `1px solid ${ROLE_COLORS[r.role]}40`,
            }}>
              {ROLE_LABELS[r.role]}
            </span>
          ))}
          {!user.is_active && (
            <span style={{ padding:'2px 8px', borderRadius:12, fontSize:'0.7rem', fontWeight:700, background:'#f1f5f9', color:'#94a3b8' }}>
              מושבת
            </span>
          )}
        </div>

        {/* Chevron */}
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"
          style={{ flexShrink:0, transform: expanded ? 'rotate(180deg)' : 'none', transition:'transform 0.2s' }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      {/* Expanded */}
      {expanded && (
        <div style={{ borderTop:'1px solid #f1f5f9', padding:'16px' }}>

          {/* Roles table */}
          {user.roles.length > 0 && (
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:'0.75rem', fontWeight:700, color:'#64748b', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.05em' }}>
                תפקידים
              </div>
              {user.roles.map(role => (
                <div key={role.id} style={{
                  display:'flex', alignItems:'center', gap:8, padding:'8px 10px',
                  background:'#f8fafc', borderRadius:8, marginBottom:4,
                }}>
                  <span style={{
                    width:10, height:10, borderRadius:'50%', flexShrink:0,
                    background: role.is_active ? ROLE_COLORS[role.role] : '#cbd5e1',
                  }} />
                  <span style={{ fontSize:'0.85rem', fontWeight:600, flex:1 }}>
                    {ROLE_LABELS[role.role]}
                    {role.station_name     && <span style={{ color:'#64748b', fontWeight:400 }}> — {role.station_name}</span>}
                    {role.call_center_name && <span style={{ color:'#64748b', fontWeight:400 }}> — {role.call_center_name}</span>}
                    {role.is_primary       && <span style={{ color:'#f59e0b', fontSize:'0.7rem', marginRight:4 }}> ★ ראשי</span>}
                  </span>
                  {role.operator_code && (
                    <span style={{ fontSize:'0.72rem', color:'#64748b', background:'#e2e8f0', padding:'1px 6px', borderRadius:6 }}>
                      קוד: {role.operator_code}
                    </span>
                  )}
                  <button
                    onClick={() => onToggleRole(user.id, role.id, role.is_active)}
                    disabled={actionLoading}
                    style={{
                      padding:'3px 10px', borderRadius:6, fontSize:'0.72rem', fontWeight:600,
                      border:'1px solid', cursor:'pointer',
                      background: role.is_active ? 'transparent' : '#f0fdf4',
                      color: role.is_active ? '#ef4444' : '#16a34a',
                      borderColor: role.is_active ? '#fecaca' : '#bbf7d0',
                    }}
                  >
                    {role.is_active ? 'השבת תפקיד' : 'הפעל תפקיד'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Reset password */}
          {isResetting && (
            <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:12 }}>
              <input
                type="password"
                placeholder="סיסמה חדשה (מינ׳ 4 תווים)"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                autoFocus
                style={{
                  flex:1, padding:'7px 12px', borderRadius:8, border:'1px solid #e2e8f0',
                  fontSize:'0.85rem', color:'#1e293b', outline:'none',
                }}
              />
              <button
                onClick={onConfirmReset}
                disabled={actionLoading}
                style={{ padding:'7px 14px', borderRadius:8, background:'#2563eb', color:'#fff', border:'none', fontSize:'0.82rem', fontWeight:700, cursor:'pointer' }}
              >
                שמור
              </button>
              <button
                onClick={onCancelReset}
                style={{ padding:'7px 14px', borderRadius:8, background:'transparent', color:'#64748b', border:'1px solid #e2e8f0', fontSize:'0.82rem', cursor:'pointer' }}
              >
                ביטול
              </button>
            </div>
          )}

          {/* Actions */}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <button
              onClick={onResetPassword}
              disabled={actionLoading || isResetting}
              style={{
                padding:'7px 14px', borderRadius:8, fontSize:'0.82rem', fontWeight:600,
                background:'transparent', color:'#2563eb', border:'1px solid #bfdbfe', cursor:'pointer',
              }}
            >
              איפוס סיסמה
            </button>
            <button
              onClick={onToggleActive}
              disabled={actionLoading}
              style={{
                padding:'7px 14px', borderRadius:8, fontSize:'0.82rem', fontWeight:600,
                background:'transparent', cursor:'pointer',
                color:       user.is_active ? '#ef4444' : '#16a34a',
                border:      `1px solid ${user.is_active ? '#fecaca' : '#bbf7d0'}`,
              }}
            >
              {user.is_active ? 'השבת משתמש' : 'הפעל משתמש'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
