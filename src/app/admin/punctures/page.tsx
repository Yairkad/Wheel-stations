'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePunctureAdminAuth } from '@/hooks/usePunctureAdminAuth'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Suggestion {
  id: string; name: string; city: string; address: string
  phone: string | null; hours: string | null; notes: string | null
  submitter_name: string | null; submitter_phone: string | null
  status: string; created_at: string
}

interface Shop {
  id: string; name: string; city: string | null; address: string
  lat: number; lng: number; is_active: boolean
  phone: string | null; hours: string | null
  hours_regular: string | null; hours_evening: string | null
  hours_friday: string | null; hours_saturday: string | null
  notes: string | null; website: string | null
  google_maps_url: string | null; google_rating: number | null
}

interface PunctureManager {
  id: string; full_name: string; phone: string
  is_active: boolean; created_at: string
}

type Tab = 'suggestions' | 'shops' | 'managers'

// ─── Approve modal ────────────────────────────────────────────────────────────

function ApproveModal({ suggestion, authPayload, onDone, onClose }: {
  suggestion: Suggestion
  authPayload: () => Record<string, string>
  onDone: () => void
  onClose: () => void
}) {
  const [form, setForm] = useState({
    name: suggestion.name, city: suggestion.city, address: suggestion.address,
    phone: suggestion.phone ?? '', hours: suggestion.hours ?? '',
    hours_regular: '', hours_evening: '', hours_friday: '', hours_saturday: '',
    notes: suggestion.notes ?? '', website: '', google_maps_url: '',
    lat: '', lng: '',
  })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState<string | null>(null)
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const submit = async () => {
    if (!form.lat || !form.lng) { setError('נדרש קו רוחב וקו אורך'); return }
    setSaving(true); setError(null)
    const res = await fetch(`/api/admin/punctures/suggestions/${suggestion.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...authPayload(), action: 'approve', shopData: form }),
    })
    if (res.ok) onDone()
    else { const d = await res.json(); setError(d.error ?? 'שגיאה') }
    setSaving(false)
  }

  const inp = 'w-full border border-gray-600 bg-gray-900 text-gray-100 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" dir="rtl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">אישור הצעה</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-400">שם *</label><input value={form.name} onChange={e => set('name',e.target.value)} className={inp}/></div>
            <div><label className="text-xs text-gray-400">עיר</label><input value={form.city} onChange={e => set('city',e.target.value)} className={inp}/></div>
          </div>
          <div><label className="text-xs text-gray-400">כתובת *</label><input value={form.address} onChange={e => set('address',e.target.value)} className={inp}/></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-400">קו רוחב (lat) *</label><input value={form.lat} onChange={e => set('lat',e.target.value)} className={inp} dir="ltr" placeholder="31.7683"/></div>
            <div><label className="text-xs text-gray-400">קו אורך (lng) *</label><input value={form.lng} onChange={e => set('lng',e.target.value)} className={inp} dir="ltr" placeholder="35.2137"/></div>
          </div>
          <div><label className="text-xs text-gray-400">טלפון</label><input value={form.phone} onChange={e => set('phone',e.target.value)} className={inp} dir="ltr"/></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-400">שעות א׳–ה׳</label><input value={form.hours_regular} onChange={e => set('hours_regular',e.target.value)} className={inp}/></div>
            <div><label className="text-xs text-gray-400">ערב/לילה</label><input value={form.hours_evening} onChange={e => set('hours_evening',e.target.value)} className={inp}/></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-400">שישי</label><input value={form.hours_friday} onChange={e => set('hours_friday',e.target.value)} className={inp}/></div>
            <div><label className="text-xs text-gray-400">מוצ״ש</label><input value={form.hours_saturday} onChange={e => set('hours_saturday',e.target.value)} className={inp}/></div>
          </div>
          <div><label className="text-xs text-gray-400">שעות (שדה חופשי)</label><input value={form.hours} onChange={e => set('hours',e.target.value)} className={inp}/></div>
          <div><label className="text-xs text-gray-400">קישור Google Maps</label><input value={form.google_maps_url} onChange={e => set('google_maps_url',e.target.value)} className={inp} dir="ltr"/></div>
          <div><label className="text-xs text-gray-400">הערות</label><textarea value={form.notes} onChange={e => set('notes',e.target.value)} rows={2} className={inp + ' resize-none'}/></div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button onClick={submit} disabled={saving}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl disabled:opacity-50">
            {saving ? 'שומר...' : 'אשר והוסף לרשימה'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Edit shop modal ───────────────────────────────────────────────────────────

function EditShopModal({ shop, authPayload, onDone, onClose }: {
  shop: Shop
  authPayload: () => Record<string, string>
  onDone: () => void
  onClose: () => void
}) {
  const [form, setForm] = useState({
    name: shop.name, city: shop.city ?? '', address: shop.address,
    lat: String(shop.lat), lng: String(shop.lng),
    phone: shop.phone ?? '', hours: shop.hours ?? '',
    hours_regular: shop.hours_regular ?? '', hours_evening: shop.hours_evening ?? '',
    hours_friday: shop.hours_friday ?? '', hours_saturday: shop.hours_saturday ?? '',
    notes: shop.notes ?? '', website: shop.website ?? '',
    google_maps_url: shop.google_maps_url ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState<string | null>(null)
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const submit = async () => {
    setSaving(true); setError(null)
    const res = await fetch(`/api/admin/punctures/shops/${shop.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...authPayload(), ...form, lat: parseFloat(form.lat), lng: parseFloat(form.lng) }),
    })
    if (res.ok) onDone()
    else { const d = await res.json(); setError(d.error ?? 'שגיאה') }
    setSaving(false)
  }

  const inp = 'w-full border border-gray-600 bg-gray-900 text-gray-100 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" dir="rtl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">עריכת חנות</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-400">שם</label><input value={form.name} onChange={e => set('name',e.target.value)} className={inp}/></div>
            <div><label className="text-xs text-gray-400">עיר</label><input value={form.city} onChange={e => set('city',e.target.value)} className={inp}/></div>
          </div>
          <div><label className="text-xs text-gray-400">כתובת</label><input value={form.address} onChange={e => set('address',e.target.value)} className={inp}/></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-400">lat</label><input value={form.lat} onChange={e => set('lat',e.target.value)} className={inp} dir="ltr"/></div>
            <div><label className="text-xs text-gray-400">lng</label><input value={form.lng} onChange={e => set('lng',e.target.value)} className={inp} dir="ltr"/></div>
          </div>
          <div><label className="text-xs text-gray-400">טלפון</label><input value={form.phone} onChange={e => set('phone',e.target.value)} className={inp} dir="ltr"/></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-400">א׳–ה׳</label><input value={form.hours_regular} onChange={e => set('hours_regular',e.target.value)} className={inp}/></div>
            <div><label className="text-xs text-gray-400">ערב/לילה</label><input value={form.hours_evening} onChange={e => set('hours_evening',e.target.value)} className={inp}/></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-400">שישי</label><input value={form.hours_friday} onChange={e => set('hours_friday',e.target.value)} className={inp}/></div>
            <div><label className="text-xs text-gray-400">מוצ״ש</label><input value={form.hours_saturday} onChange={e => set('hours_saturday',e.target.value)} className={inp}/></div>
          </div>
          <div><label className="text-xs text-gray-400">שעות (חופשי)</label><input value={form.hours} onChange={e => set('hours',e.target.value)} className={inp}/></div>
          <div><label className="text-xs text-gray-400">Google Maps URL</label><input value={form.google_maps_url} onChange={e => set('google_maps_url',e.target.value)} className={inp} dir="ltr"/></div>
          <div><label className="text-xs text-gray-400">הערות</label><textarea value={form.notes} onChange={e => set('notes',e.target.value)} rows={2} className={inp + ' resize-none'}/></div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button onClick={submit} disabled={saving}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl disabled:opacity-50">
            {saving ? 'שומר...' : 'שמור שינויים'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PuncturesAdminPage() {
  const { isAuthenticated, role, isLoading, authPayload, logout } = usePunctureAdminAuth()
  const [tab, setTab] = useState<Tab>('suggestions')

  // Suggestions
  const [suggestions,     setSuggestions]     = useState<Suggestion[]>([])
  const [suggStatus,      setSuggStatus]      = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [suggLoading,     setSuggLoading]     = useState(false)
  const [approvingSugg,   setApprovingSugg]   = useState<Suggestion | null>(null)

  // Shops
  const [shops,       setShops]       = useState<Shop[]>([])
  const [shopsLoading,setShopsLoading]= useState(false)
  const [editingShop, setEditingShop] = useState<Shop | null>(null)
  const [shopSearch,  setShopSearch]  = useState('')

  // Managers (admin only)
  const [managers,    setManagers]    = useState<PunctureManager[]>([])
  const [mgrLoading,  setMgrLoading]  = useState(false)
  const [mgrForm,     setMgrForm]     = useState({ full_name: '', phone: '', password: '' })
  const [mgrSaving,   setMgrSaving]   = useState(false)
  const [mgrError,    setMgrError]    = useState<string | null>(null)

  const payload = authPayload()

  // ── fetch suggestions ──
  const fetchSuggestions = useCallback(async (status: string) => {
    setSuggLoading(true)
    const p = new URLSearchParams({ ...payload, status })
    const res = await fetch(`/api/admin/punctures/suggestions?${p}`)
    if (res.ok) setSuggestions(await res.json())
    setSuggLoading(false)
  }, [payload])  // eslint-disable-line react-hooks/exhaustive-deps

  // ── fetch shops ──
  const fetchShops = useCallback(async () => {
    setShopsLoading(true)
    const p = new URLSearchParams(payload)
    const res = await fetch(`/api/admin/punctures/shops?${p}`)
    if (res.ok) setShops(await res.json())
    setShopsLoading(false)
  }, [payload])  // eslint-disable-line react-hooks/exhaustive-deps

  // ── fetch managers ──
  const fetchManagers = useCallback(async () => {
    if (role !== 'admin') return
    setMgrLoading(true)
    const p = new URLSearchParams(payload)
    const res = await fetch(`/api/admin/punctures/managers?${p}`)
    if (res.ok) setManagers(await res.json())
    setMgrLoading(false)
  }, [role, payload])  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isAuthenticated) return
    if (tab === 'suggestions') fetchSuggestions(suggStatus)
    if (tab === 'shops')       fetchShops()
    if (tab === 'managers')    fetchManagers()
  }, [isAuthenticated, tab, suggStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── reject suggestion ──
  const reject = async (id: string) => {
    await fetch(`/api/admin/punctures/suggestions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, action: 'reject' }),
    })
    fetchSuggestions(suggStatus)
  }

  // ── toggle shop active ──
  const toggleShop = async (shop: Shop) => {
    await fetch(`/api/admin/punctures/shops/${shop.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, is_active: !shop.is_active }),
    })
    fetchShops()
  }

  // ── add manager ──
  const addManager = async () => {
    setMgrSaving(true); setMgrError(null)
    const res = await fetch('/api/admin/punctures/managers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, ...mgrForm }),
    })
    if (res.ok) { setMgrForm({ full_name: '', phone: '', password: '' }); fetchManagers() }
    else { const d = await res.json(); setMgrError(d.error ?? 'שגיאה') }
    setMgrSaving(false)
  }

  // ── toggle manager active ──
  const toggleManager = async (mgr: PunctureManager) => {
    await fetch('/api/admin/punctures/managers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, id: mgr.id, is_active: !mgr.is_active }),
    })
    fetchManagers()
  }

  // ── delete manager ──
  const deleteManager = async (id: string) => {
    if (!confirm('למחוק את המנהל?')) return
    await fetch('/api/admin/punctures/managers', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, id }),
    })
    fetchManagers()
  }

  if (isLoading || !isAuthenticated) return null

  const filteredShops = shops.filter(s =>
    !shopSearch || s.name.includes(shopSearch) || (s.city ?? '').includes(shopSearch)
  )

  const statusLabel = { pending: 'ממתינות', approved: 'מאושרות', rejected: 'נדחו' }

  return (
    <div dir="rtl" style={{ minHeight: '100vh', background: '#0f172a', fontFamily: "'Segoe UI', sans-serif", color: '#f8fafc' }}>

      {/* Header */}
      <div style={{ background: '#1e293b', borderBottom: '1px solid #334155', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg,#f59e0b,#d97706)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>🔧</div>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>ניהול פנצ׳ריות לילה</h1>
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
            {role === 'admin' ? 'מנהל ראשי' : 'מנהל פנצ׳ריות'}
          </p>
        </div>
        <a href="/punctures" target="_blank" style={{ fontSize: '0.78rem', color: '#64748b', textDecoration: 'none' }}>← לדף הציבורי</a>
        {role === 'admin' && <a href="/admin" style={{ fontSize: '0.78rem', color: '#64748b', textDecoration: 'none' }}>← ניהול ראשי</a>}
        <button onClick={logout} style={{ padding: '6px 14px', background: '#334155', border: 'none', borderRadius: 8, color: '#94a3b8', fontSize: '0.82rem', cursor: 'pointer' }}>יציאה</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1e293b', padding: '0 24px', background: '#0f172a' }}>
        {(['suggestions', 'shops', ...(role === 'admin' ? ['managers'] : [])] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '12px 18px', background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '0.88rem', fontWeight: 700,
            color: tab === t ? '#f59e0b' : '#64748b',
            borderBottom: tab === t ? '2px solid #f59e0b' : '2px solid transparent',
            transition: 'all 0.15s',
          }}>
            {t === 'suggestions' ? `הצעות (${suggestions.filter(s => s.status === 'pending').length || ''})` : t === 'shops' ? `חנויות (${shops.length || ''})` : 'מנהלים'}
          </button>
        ))}
      </div>

      <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>

        {/* ── SUGGESTIONS TAB ── */}
        {tab === 'suggestions' && (
          <div>
            {/* Status filter */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {(['pending', 'approved', 'rejected'] as const).map(s => (
                <button key={s} onClick={() => setSuggStatus(s)} style={{
                  padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                  fontWeight: 700, fontSize: '0.8rem',
                  background: suggStatus === s ? '#f59e0b' : '#1e293b',
                  color: suggStatus === s ? '#fff' : '#64748b',
                }}>{statusLabel[s]}</button>
              ))}
            </div>

            {suggLoading ? (
              <div style={{ textAlign: 'center', color: '#64748b', padding: 40 }}>טוען...</div>
            ) : suggestions.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#64748b', padding: 40 }}>אין הצעות {statusLabel[suggStatus]}</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {suggestions.map(s => (
                  <div key={s.id} style={{ background: '#1e293b', borderRadius: 14, padding: '16px 18px', border: '1px solid #334155' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#f8fafc' }}>{s.name}</div>
                        <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 2 }}>{s.city}, {s.address}</div>
                        {s.phone && <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }} dir="ltr">{s.phone}</div>}
                        {s.hours && <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>שעות: {s.hours}</div>}
                        {s.notes && <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>הערות: {s.notes}</div>}
                        {(s.submitter_name || s.submitter_phone) && (
                          <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: 4 }}>
                            הציע: {s.submitter_name} {s.submitter_phone}
                          </div>
                        )}
                        <div style={{ fontSize: '0.72rem', color: '#334155', marginTop: 4 }}>
                          {new Date(s.created_at).toLocaleDateString('he-IL')}
                        </div>
                      </div>
                      {s.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                          <button onClick={() => setApprovingSugg(s)} style={{
                            padding: '7px 14px', background: '#f59e0b', border: 'none',
                            borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                          }}>אשר</button>
                          <button onClick={() => reject(s.id)} style={{
                            padding: '7px 14px', background: '#1e293b', border: '1px solid #475569',
                            borderRadius: 8, color: '#94a3b8', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                          }}>דחה</button>
                        </div>
                      )}
                      {s.status !== 'pending' && (
                        <span style={{
                          padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700,
                          background: s.status === 'approved' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                          color: s.status === 'approved' ? '#4ade80' : '#f87171',
                        }}>{s.status === 'approved' ? 'אושרה' : 'נדחתה'}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SHOPS TAB ── */}
        {tab === 'shops' && (
          <div>
            <input
              value={shopSearch} onChange={e => setShopSearch(e.target.value)}
              placeholder="חיפוש לפי שם או עיר..."
              style={{ width: '100%', padding: '10px 14px', background: '#1e293b', border: '1px solid #334155', borderRadius: 10, color: '#f8fafc', fontSize: '0.9rem', marginBottom: 16, boxSizing: 'border-box' }}
            />
            {shopsLoading ? (
              <div style={{ textAlign: 'center', color: '#64748b', padding: 40 }}>טוען...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filteredShops.map(shop => (
                  <div key={shop.id} style={{
                    background: '#1e293b', borderRadius: 12, padding: '12px 16px',
                    border: `1px solid ${shop.is_active ? '#334155' : '#1e293b'}`,
                    opacity: shop.is_active ? 1 : 0.55,
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#f8fafc' }}>{shop.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 1 }}>{shop.city}{shop.city && shop.address ? ', ' : ''}{shop.address}</div>
                      {shop.hours_regular && <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: 1 }}>א׳–ה׳: {shop.hours_regular}</div>}
                    </div>
                    {/* Toggle active */}
                    <button onClick={() => toggleShop(shop)} title={shop.is_active ? 'השבת' : 'הפעל'}
                      style={{
                        position: 'relative', width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer',
                        background: shop.is_active ? '#22c55e' : '#475569', transition: 'background 0.2s', flexShrink: 0,
                      }}>
                      <span style={{
                        position: 'absolute', top: 2, width: 16, height: 16, borderRadius: '50%', background: '#fff',
                        transition: 'transform 0.2s',
                        transform: shop.is_active ? 'translateX(18px)' : 'translateX(2px)',
                      }}/>
                    </button>
                    <button onClick={() => setEditingShop(shop)} style={{
                      padding: '5px 12px', background: '#334155', border: 'none',
                      borderRadius: 8, color: '#94a3b8', fontSize: '0.78rem', cursor: 'pointer',
                    }}>עריכה</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── MANAGERS TAB (admin only) ── */}
        {tab === 'managers' && role === 'admin' && (
          <div>
            {/* Add form */}
            <div style={{ background: '#1e293b', borderRadius: 14, padding: '16px 18px', border: '1px solid #334155', marginBottom: 20 }}>
              <h3 style={{ margin: '0 0 14px', fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc' }}>הוסף מנהל חדש</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <input value={mgrForm.full_name} onChange={e => setMgrForm(p => ({ ...p, full_name: e.target.value }))}
                  placeholder="שם מלא" style={mgrInp}/>
                <input value={mgrForm.phone} onChange={e => setMgrForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="טלפון" style={{ ...mgrInp, direction: 'ltr' as const }} dir="ltr"/>
                <input value={mgrForm.password} onChange={e => setMgrForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="סיסמה" type="password" style={mgrInp}/>
              </div>
              {mgrError && <div style={{ color: '#f87171', fontSize: '0.8rem', marginTop: 8 }}>{mgrError}</div>}
              <button onClick={addManager} disabled={mgrSaving} style={{
                marginTop: 10, padding: '8px 20px', background: '#f59e0b', border: 'none',
                borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
              }}>{mgrSaving ? 'שומר...' : 'הוסף'}</button>
            </div>

            {mgrLoading ? (
              <div style={{ textAlign: 'center', color: '#64748b', padding: 40 }}>טוען...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {managers.map(mgr => (
                  <div key={mgr.id} style={{
                    background: '#1e293b', borderRadius: 12, padding: '12px 16px',
                    border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: 12,
                    opacity: mgr.is_active ? 1 : 0.55,
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc' }}>{mgr.full_name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }} dir="ltr">{mgr.phone}</div>
                    </div>
                    <button onClick={() => toggleManager(mgr)} title={mgr.is_active ? 'השבת' : 'הפעל'}
                      style={{
                        position: 'relative', width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer',
                        background: mgr.is_active ? '#22c55e' : '#475569', flexShrink: 0,
                      }}>
                      <span style={{
                        position: 'absolute', top: 2, width: 16, height: 16, borderRadius: '50%', background: '#fff',
                        transform: mgr.is_active ? 'translateX(18px)' : 'translateX(2px)', transition: 'transform 0.2s',
                      }}/>
                    </button>
                    <button onClick={() => deleteManager(mgr.id)} style={{
                      padding: '5px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                      borderRadius: 8, color: '#f87171', fontSize: '0.78rem', cursor: 'pointer',
                    }}>מחק</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {approvingSugg && (
        <ApproveModal
          suggestion={approvingSugg}
          authPayload={authPayload}
          onDone={() => { setApprovingSugg(null); fetchSuggestions(suggStatus) }}
          onClose={() => setApprovingSugg(null)}
        />
      )}
      {editingShop && (
        <EditShopModal
          shop={editingShop}
          authPayload={authPayload}
          onDone={() => { setEditingShop(null); fetchShops() }}
          onClose={() => setEditingShop(null)}
        />
      )}
    </div>
  )
}

const mgrInp: React.CSSProperties = {
  width: '100%', padding: '8px 12px', background: '#0f172a',
  border: '1px solid #334155', borderRadius: 8, color: '#f8fafc', fontSize: '0.85rem',
  boxSizing: 'border-box',
}
