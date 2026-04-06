'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { usePunctureAdminAuth } from '@/hooks/usePunctureAdminAuth'
import { HoursFields, HoursState, emptyHours, parseHoursState, hoursToString } from '@/components/punctures/HoursFields'
import { AdminShell } from '@/components/admin/AdminShell'

// ─── Utils ────────────────────────────────────────────────────────────────────

function parseLatLngFromUrl(url: string): { lat: string; lng: string } | null {
  let m = /@(-?\d+\.\d+),(-?\d+\.\d+)/.exec(url)
  if (m) return { lat: m[1], lng: m[2] }
  m = /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/.exec(url)
  if (m) return { lat: m[1], lng: m[2] }
  m = /[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/.exec(url)
  if (m) return { lat: m[1], lng: m[2] }
  return null
}

async function resolveMapsUrl(url: string): Promise<{ lat: string; lng: string } | null> {
  // Try direct extraction first (full URLs)
  const direct = parseLatLngFromUrl(url)
  if (direct) return direct
  // Short URL or indirect — ask server to follow redirects
  try {
    const res = await fetch(`/api/resolve-maps?url=${encodeURIComponent(url)}`)
    if (res.ok) {
      const data = await res.json()
      if (data.lat && data.lng) return { lat: String(data.lat), lng: String(data.lng) }
    }
  } catch (e) { console.warn('Failed to resolve maps URL:', e) }
  return null
}

// ─── GeoSearch ────────────────────────────────────────────────────────────────

interface GeoResult { lat: number; lng: number; label: string }

function GeoSearch({ onSelect, dark }: {
  onSelect: (lat: string, lng: string) => void
  dark?: boolean
}) {
  const [q,       setQ]       = useState('')
  const [results, setResults] = useState<GeoResult[]>([])
  const [open,    setOpen]    = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const bg     = dark ? '#0f172a' : '#fff'
  const border = dark ? '1px solid #334155' : '1px solid #d1d5db'
  const color  = dark ? '#f8fafc' : '#1e293b'
  const ddBg   = dark ? '#1e293b' : '#fff'

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    if (q.length < 2) { setResults([]); return }
    timer.current = setTimeout(async () => {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`)
      if (res.ok) { setResults(await res.json()); setOpen(true) }
    }, 400)
  }, [q])

  const pick = (r: GeoResult) => {
    onSelect(String(r.lat), String(r.lng))
    setQ(r.label.split(',').slice(0, 2).join(', '))
    setOpen(false)
  }

  return (
    <div style={{ position: 'relative' }}>
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder="חפש כתובת לחילוץ קואורדינטות..."
        style={{ width: '100%', padding: '8px 12px', background: bg, border, borderRadius: 8, color, fontSize: '0.85rem', boxSizing: 'border-box' as const }}
      />
      {open && results.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, left: 0, zIndex: 100,
          background: ddBg, border, borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          marginTop: 4, maxHeight: 200, overflowY: 'auto' as const,
        }}>
          {results.map((r, i) => (
            <div key={i} onClick={() => pick(r)} style={{
              padding: '8px 12px', cursor: 'pointer', fontSize: '0.8rem', color,
              borderBottom: i < results.length - 1 ? border : 'none',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = dark ? '#334155' : '#f1f5f9')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {r.label.split(',').slice(0, 3).join(', ')}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

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

type Tab = 'suggestions' | 'shops'

// ─── Approve modal ────────────────────────────────────────────────────────────

function ApproveModal({ suggestion, authPayload, onDone, onClose }: {
  suggestion: Suggestion
  authPayload: () => Record<string, string>
  onDone: () => void
  onClose: () => void
}) {
  const [name,    setName]    = useState(suggestion.name)
  const [city,    setCity]    = useState(suggestion.city)
  const [address, setAddress] = useState(suggestion.address)
  const [phone,   setPhone]   = useState(suggestion.phone ?? '')
  const [notes,   setNotes]   = useState(suggestion.notes ?? '')
  const [mapsUrl,    setMapsUrl]    = useState('')
  const [lat,        setLat]        = useState('')
  const [lng,        setLng]        = useState('')
  const [hours,      setHours]      = useState<HoursState>(emptyHours())
  const [saving,     setSaving]     = useState(false)
  const [resolving,  setResolving]  = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  const handleMapsUrl = async (url: string) => {
    setMapsUrl(url)
    if (!url.trim()) return
    setResolving(true)
    const coords = await resolveMapsUrl(url)
    setResolving(false)
    if (coords) { setLat(coords.lat); setLng(coords.lng) }
  }

  const submit = async () => {
    if (!lat || !lng) { setError('נדרש מיקום — הדבק קישור גוגל מפס או חפש כתובת'); return }
    setSaving(true); setError(null)
    const shopData = {
      name, city, address, phone, notes, google_maps_url: mapsUrl,
      lat, lng,
      hours_regular:  hoursToString(hours.regular),
      hours_evening:  hoursToString(hours.evening),
      hours_friday:   hoursToString(hours.friday),
      hours_saturday: hoursToString(hours.saturday),
    }
    const res = await fetch(`/api/admin/punctures/suggestions/${suggestion.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...authPayload(), action: 'approve', shopData }),
    })
    if (res.ok) onDone()
    else { const d = await res.json(); setError(d.error ?? 'שגיאה') }
    setSaving(false)
  }

  const inp: React.CSSProperties = { width: '100%', padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, color: '#1e293b', fontSize: '0.85rem', boxSizing: 'border-box' }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.5)', padding: 16 }} onClick={onClose}>
      <div style={{ background: '#ffffff', borderRadius: 20, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', padding: 24, direction: 'rtl', boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1e293b' }}>אישור הצעה</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display:'flex', alignItems:'center' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><div style={lbl}>שם *</div><input value={name} onChange={e => setName(e.target.value)} style={inp}/></div>
            <div><div style={lbl}>עיר</div><input value={city} onChange={e => setCity(e.target.value)} style={inp}/></div>
          </div>
          <div><div style={lbl}>כתובת</div><input value={address} onChange={e => setAddress(e.target.value)} style={inp}/></div>
          <div><div style={lbl}>טלפון</div><input value={phone} onChange={e => setPhone(e.target.value)} style={{ ...inp, direction: 'ltr' }}/></div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
            <div style={{ ...lbl, marginBottom: 8 }}>שעות פעילות</div>
            <HoursFields value={hours} onChange={setHours} dark />
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
            <div style={lbl}>מיקום — הדבק קישור Google Maps</div>
            <input value={mapsUrl} onChange={e => handleMapsUrl(e.target.value)} style={{ ...inp, direction: 'ltr', marginBottom: 6 }} placeholder="https://maps.google.com/... או maps.app.goo.gl/..."/>
            <div style={lbl}>או חפש כתובת:</div>
            <GeoSearch onSelect={(la, ln) => { setLat(la); setLng(ln) }} dark />
            {resolving && <div style={{ marginTop: 6, fontSize: '0.75rem', color: '#94a3b8' }}>מחלץ מיקום...</div>}
            {!resolving && lat && lng && (
              <div style={{ marginTop: 6, fontSize: '0.75rem', color: '#4ade80' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline',marginLeft:'3px'}}><polyline points="20 6 9 17 4 12"/></svg> lat: {lat}, lng: {lng}
              </div>
            )}
          </div>

          <div><div style={lbl}>הערות</div><textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} style={{ ...inp, resize: 'none' as const }}/></div>
          {error && <div style={{ color: '#f87171', fontSize: '0.82rem' }}>{error}</div>}
          <button onClick={submit} disabled={saving || resolving} style={{
            width: '100%', padding: '11px', background: '#f59e0b', border: 'none',
            borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
          }}>{saving ? 'שומר...' : 'אשר והוסף לרשימה'}</button>
        </div>
      </div>
    </div>
  )
}

const lbl: React.CSSProperties = { fontSize: '0.75rem', color: '#64748b', marginBottom: 4 }

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
    phone: shop.phone ?? '', notes: shop.notes ?? '',
    website: shop.website ?? '', google_maps_url: shop.google_maps_url ?? '',
  })
  const [hours,     setHours]     = useState<HoursState>(parseHoursState(shop.hours_regular, shop.hours_evening, shop.hours_friday, shop.hours_saturday))
  const [saving,    setSaving]    = useState(false)
  const [resolving, setResolving] = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleMapsUrl = async (url: string) => {
    set('google_maps_url', url)
    if (!url.trim()) return
    setResolving(true)
    const coords = await resolveMapsUrl(url)
    setResolving(false)
    if (coords) { set('lat', coords.lat); set('lng', coords.lng) }
  }

  const submit = async () => {
    setSaving(true); setError(null)
    const res = await fetch(`/api/admin/punctures/shops/${shop.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...authPayload(), ...form,
        lat: parseFloat(form.lat), lng: parseFloat(form.lng),
        hours_regular:  hoursToString(hours.regular),
        hours_evening:  hoursToString(hours.evening),
        hours_friday:   hoursToString(hours.friday),
        hours_saturday: hoursToString(hours.saturday),
      }),
    })
    if (res.ok) onDone()
    else { const d = await res.json(); setError(d.error ?? 'שגיאה') }
    setSaving(false)
  }

  const inp: React.CSSProperties = { width: '100%', padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, color: '#1e293b', fontSize: '0.85rem', boxSizing: 'border-box' }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.5)', padding: 16 }} onClick={onClose}>
      <div style={{ background: '#ffffff', borderRadius: 20, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', padding: 24, direction: 'rtl', boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1e293b' }}>עריכת חנות</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display:'flex', alignItems:'center' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><div style={lbl}>שם</div><input value={form.name} onChange={e => set('name',e.target.value)} style={inp}/></div>
            <div><div style={lbl}>עיר</div><input value={form.city} onChange={e => set('city',e.target.value)} style={inp}/></div>
          </div>
          <div><div style={lbl}>כתובת</div><input value={form.address} onChange={e => set('address',e.target.value)} style={inp}/></div>
          <div><div style={lbl}>טלפון</div><input value={form.phone} onChange={e => set('phone',e.target.value)} style={{ ...inp, direction: 'ltr' }}/></div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
            <div style={{ ...lbl, marginBottom: 8 }}>שעות פעילות</div>
            <HoursFields value={hours} onChange={setHours} dark />
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
            <div style={lbl}>מיקום — הדבק קישור Google Maps</div>
            <input value={form.google_maps_url} onChange={e => handleMapsUrl(e.target.value)} style={{ ...inp, direction: 'ltr', marginBottom: 6 }} placeholder="https://maps.google.com/... או maps.app.goo.gl/..."/>
            <div style={lbl}>או חפש כתובת:</div>
            <GeoSearch onSelect={(la, ln) => { set('lat', la); set('lng', ln) }} dark />
            {resolving && <div style={{ marginTop: 6, fontSize: '0.75rem', color: '#94a3b8' }}>מחלץ מיקום...</div>}
            {!resolving && form.lat && form.lng && (
              <div style={{ marginTop: 6, fontSize: '0.75rem', color: '#4ade80' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline',marginLeft:'3px'}}><polyline points="20 6 9 17 4 12"/></svg> lat: {form.lat}, lng: {form.lng}
              </div>
            )}
          </div>

          <div><div style={lbl}>הערות</div><textarea value={form.notes} onChange={e => set('notes',e.target.value)} rows={2} style={{ ...inp, resize: 'none' as const }}/></div>
          {error && <div style={{ color: '#f87171', fontSize: '0.82rem' }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{
              flex: 1, padding: '11px', background: '#f1f5f9', border: '1px solid #e2e8f0',
              borderRadius: 10, color: '#64748b', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
            }}>ביטול</button>
            <button onClick={submit} disabled={saving || resolving} style={{
              flex: 2, padding: '11px', background: '#3b82f6', border: 'none',
              borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
            }}>{saving ? 'שומר...' : 'שמור שינויים'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Add shop modal ───────────────────────────────────────────────────────────

function AddShopModal({ authPayload, onDone, onClose }: {
  authPayload: () => Record<string, string>
  onDone: () => void
  onClose: () => void
}) {
  const [form, setForm] = useState({
    name: '', city: '', address: '', lat: '', lng: '',
    phone: '', notes: '', website: '', google_maps_url: '',
  })
  const [hours,     setHours]     = useState<HoursState>(emptyHours())
  const [saving,    setSaving]    = useState(false)
  const [resolving, setResolving] = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleMapsUrl = async (url: string) => {
    set('google_maps_url', url)
    if (!url.trim()) return
    setResolving(true)
    const coords = await resolveMapsUrl(url)
    setResolving(false)
    if (coords) { set('lat', coords.lat); set('lng', coords.lng) }
  }

  const submit = async () => {
    if (!form.name || !form.lat || !form.lng) { setError('נדרש שם ומיקום'); return }
    setSaving(true); setError(null)
    const res = await fetch('/api/admin/punctures/shops', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...authPayload(), ...form,
        lat: parseFloat(form.lat), lng: parseFloat(form.lng),
        hours_regular:  hoursToString(hours.regular),
        hours_evening:  hoursToString(hours.evening),
        hours_friday:   hoursToString(hours.friday),
        hours_saturday: hoursToString(hours.saturday),
      }),
    })
    if (res.ok) onDone()
    else { const d = await res.json(); setError(d.error ?? 'שגיאה') }
    setSaving(false)
  }

  const inp: React.CSSProperties = { width: '100%', padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, color: '#1e293b', fontSize: '0.85rem', boxSizing: 'border-box' }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.5)', padding: 16 }} onClick={onClose}>
      <div style={{ background: '#ffffff', borderRadius: 20, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', padding: 24, direction: 'rtl', boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1e293b' }}>הוספת חנות חדשה</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display:'flex', alignItems:'center' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><div style={lbl}>שם *</div><input value={form.name} onChange={e => set('name',e.target.value)} style={inp}/></div>
            <div><div style={lbl}>עיר</div><input value={form.city} onChange={e => set('city',e.target.value)} style={inp}/></div>
          </div>
          <div><div style={lbl}>כתובת</div><input value={form.address} onChange={e => set('address',e.target.value)} style={inp}/></div>
          <div><div style={lbl}>טלפון</div><input value={form.phone} onChange={e => set('phone',e.target.value)} style={{ ...inp, direction: 'ltr' }}/></div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
            <div style={{ ...lbl, marginBottom: 8 }}>שעות פעילות</div>
            <HoursFields value={hours} onChange={setHours} dark />
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
            <div style={lbl}>מיקום — הדבק קישור Google Maps</div>
            <input value={form.google_maps_url} onChange={e => {
              set('google_maps_url', e.target.value)
              const coords = parseLatLngFromUrl(e.target.value)
              if (coords) { set('lat', coords.lat); set('lng', coords.lng) }
            }} style={{ ...inp, direction: 'ltr', marginBottom: 6 }} placeholder="https://maps.google.com/..."/>
            <div style={lbl}>או חפש כתובת:</div>
            <GeoSearch onSelect={(la, ln) => { set('lat', la); set('lng', ln) }} dark />
            {form.lat && form.lng && (
              <div style={{ marginTop: 6, fontSize: '0.75rem', color: '#4ade80' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline',marginLeft:'3px'}}><polyline points="20 6 9 17 4 12"/></svg> lat: {form.lat}, lng: {form.lng}
              </div>
            )}
          </div>

          <div><div style={lbl}>הערות</div><textarea value={form.notes} onChange={e => set('notes',e.target.value)} rows={2} style={{ ...inp, resize: 'none' as const }}/></div>
          {error && <div style={{ color: '#f87171', fontSize: '0.82rem' }}>{error}</div>}
          <button onClick={submit} disabled={saving} style={{
            width: '100%', padding: '11px', background: '#f59e0b', border: 'none',
            borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
          }}>{saving ? 'שומר...' : 'הוסף חנות'}</button>
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
  const [addingShop,  setAddingShop]  = useState(false)
  const [shopSearch,  setShopSearch]  = useState('')

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

  useEffect(() => {
    if (!isAuthenticated) return
    if (tab === 'suggestions') fetchSuggestions(suggStatus)
    if (tab === 'shops')       fetchShops()
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

  // ── delete shop ──
  const deleteShop = async (shop: Shop) => {
    if (!confirm(`למחוק את "${shop.name}"? פעולה זו לא ניתנת לביטול.`)) return
    await fetch(`/api/admin/punctures/shops/${shop.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    fetchShops()
  }


  if (isLoading || !isAuthenticated) return null

  const filteredShops = shops.filter(s =>
    !shopSearch || s.name.includes(shopSearch) || (s.city ?? '').includes(shopSearch)
  )

  const statusLabel = { pending: 'ממתינות', approved: 'מאושרות', rejected: 'נדחו' }

  return (
    <AdminShell onLogout={logout}>
    <div dir="rtl" style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: "'Segoe UI', sans-serif", color: '#1e293b' }}>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', padding: '0 24px', background: '#ffffff' }}>
        {(['suggestions', 'shops'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '12px 18px', background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '0.88rem', fontWeight: 700,
            color: tab === t ? '#2563eb' : '#64748b',
            borderBottom: tab === t ? '2px solid #2563eb' : '2px solid transparent',
            transition: 'all 0.15s',
          }}>
            {t === 'suggestions' ? `הצעות (${suggestions.filter(s => s.status === 'pending').length || ''})` : `פנצ'ריות (${shops.length || ''})`}
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
                  background: suggStatus === s ? '#2563eb' : '#f1f5f9',
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
                  <div key={s.id} style={{ background: '#ffffff', borderRadius: 14, padding: '16px 18px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1e293b' }}>{s.name}</div>
                        <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 2 }}>{s.city}, {s.address}</div>
                        {s.phone && <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }} dir="ltr">{s.phone}</div>}
                        {s.hours && <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>שעות: {s.hours}</div>}
                        {s.notes && <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>הערות: {s.notes}</div>}
                        {(s.submitter_name || s.submitter_phone) && (
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
                            הציע: {s.submitter_name} {s.submitter_phone}
                          </div>
                        )}
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 4 }}>
                          {new Date(s.created_at).toLocaleDateString('he-IL')}
                        </div>
                      </div>
                      {s.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                          <button onClick={() => setApprovingSugg(s)} style={{
                            padding: '7px 14px', background: '#16a34a', border: 'none',
                            borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                          }}>אשר</button>
                          <button onClick={() => reject(s.id)} style={{
                            padding: '7px 14px', background: '#f1f5f9', border: '1px solid #e2e8f0',
                            borderRadius: 8, color: '#64748b', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
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
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <input
                value={shopSearch} onChange={e => setShopSearch(e.target.value)}
                placeholder="חיפוש לפי שם או עיר..."
                style={{ flex: 1, padding: '9px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, color: '#1e293b', fontSize: '0.88rem', boxSizing: 'border-box' as const }}
              />
              <button onClick={() => setAddingShop(true)} style={{
                padding: '9px 16px', background: '#f59e0b', border: 'none',
                borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap' as const,
              }}>+ הוסף פנצ'ריה</button>
            </div>
            {shopsLoading ? (
              <div style={{ textAlign: 'center', color: '#64748b', padding: 40 }}>טוען...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filteredShops.map(shop => (
                  <div key={shop.id} style={{
                    background: '#ffffff', borderRadius: 12, padding: '12px 16px',
                    border: `1px solid ${shop.is_active ? '#e2e8f0' : '#f1f5f9'}`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    opacity: shop.is_active ? 1 : 0.55,
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1e293b' }}>{shop.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 1 }}>{shop.city}{shop.city && shop.address ? ', ' : ''}{shop.address}</div>
                      {shop.hours_regular && <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: 1 }}>א׳–ה׳: {shop.hours_regular}</div>}
                    </div>
                    {/* Toggle — as a label+checkbox for reliable rendering */}
                    <div
                      onClick={() => toggleShop(shop)}
                      title={shop.is_active ? 'השבת' : 'הפעל'}
                      style={{
                        width: 40, height: 22, borderRadius: 11, flexShrink: 0, cursor: 'pointer',
                        background: shop.is_active ? '#22c55e' : '#94a3b8',
                        transition: 'background 0.2s', position: 'relative',
                        display: 'inline-block',
                      }}
                    >
                      <div style={{
                        position: 'absolute', top: 3, left: shop.is_active ? 21 : 3,
                        width: 16, height: 16, borderRadius: '50%', background: '#fff',
                        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                      }}/>
                    </div>
                    <button onClick={() => setEditingShop(shop)} style={{
                      padding: '5px 12px', background: '#f1f5f9', border: '1px solid #e2e8f0',
                      borderRadius: 8, color: '#64748b', fontSize: '0.78rem', cursor: 'pointer',
                    }}>עריכה</button>
                    <button onClick={() => deleteShop(shop)} style={{
                      padding: '5px 10px', background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.2)',
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
      {addingShop && (
        <AddShopModal
          authPayload={authPayload}
          onDone={() => { setAddingShop(false); fetchShops() }}
          onClose={() => setAddingShop(false)}
        />
      )}
    </div>
    </AdminShell>
  )
}

