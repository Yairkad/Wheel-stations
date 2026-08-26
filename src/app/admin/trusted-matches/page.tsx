'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { AdminShell } from '@/components/admin/AdminShell'
import LoadingSpin from '@/components/LoadingSpin'

interface TrustedMatch {
  id: string
  vehicle_make: string
  vehicle_model: string
  year_from: number | null
  year_to: number | null
  wheel_rim_size: string
  wheel_bolt_count: number
  wheel_bolt_spacing: number
  wheel_center_bore: number | null
  notes: string | null
  created_at: string
}

const emptyForm = {
  vehicle_make: '',
  vehicle_model: '',
  year_from: '',
  year_to: '',
  wheel_rim_size: '',
  wheel_bolt_count: '',
  wheel_bolt_spacing: '',
  wheel_center_bore: '',
  notes: '',
}

export default function TrustedMatchesPage() {
  const { isAuthenticated, isLoading: authLoading, logout } = useAdminAuth()
  const [matches, setMatches] = useState<TrustedMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isAuthenticated) fetchMatches()
  }, [isAuthenticated])

  const fetchMatches = async () => {
    try {
      const res = await fetch('/api/admin/trusted-matches')
      const data = await res.json()
      if (res.ok) setMatches(data.matches || [])
    } catch (err) {
      console.error('Failed to fetch trusted matches:', err)
      toast.error('שגיאה בטעינת הרשימה')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.vehicle_make.trim() || !form.vehicle_model.trim() || !form.wheel_rim_size.trim() || !form.wheel_bolt_count || !form.wheel_bolt_spacing) {
      toast.error('נא למלא יצרן, דגם וכל שדות מפרט הגלגל')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/trusted-matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'שגיאה בהוספה')
      toast.success('הצירוף נוסף לרשימה המהימנה')
      setForm(emptyForm)
      fetchMatches()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'שגיאה בהוספה')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/trusted-matches/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('שגיאה במחיקה')
      setMatches(matches.filter(m => m.id !== id))
      toast.success('נמחק')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'שגיאה במחיקה')
    }
  }

  if (authLoading || !isAuthenticated) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>טוען...</div>
  }

  return (
    <AdminShell onLogout={logout}>
      <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto', direction: 'rtl' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>התאמות מהימנות</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
          צירופי רכב+מפרט גלגל שמסומנים ידנית כ&quot;ודאי מתאים&quot; למוקדנים, גם בלי היסטוריית שדה מצטברת. משלים את המנגנון האוטומטי (2+ החזרות מאומתות באותו צירוף).
        </p>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '14px' }}>הוספת צירוף חדש</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '12px' }}>
            <input placeholder="יצרן (למשל טויוטה)" value={form.vehicle_make} onChange={e => setForm({ ...form, vehicle_make: e.target.value })} style={inputStyle} />
            <input placeholder="דגם (למשל קורולה)" value={form.vehicle_model} onChange={e => setForm({ ...form, vehicle_model: e.target.value })} style={inputStyle} />
            <input placeholder="משנה (אופציונלי)" type="number" value={form.year_from} onChange={e => setForm({ ...form, year_from: e.target.value })} style={inputStyle} />
            <input placeholder="עד שנה (אופציונלי)" type="number" value={form.year_to} onChange={e => setForm({ ...form, year_to: e.target.value })} style={inputStyle} />
            <input placeholder='גודל ג׳אנט (למשל 16)' value={form.wheel_rim_size} onChange={e => setForm({ ...form, wheel_rim_size: e.target.value })} style={inputStyle} />
            <input placeholder="כמות ברגים" type="number" value={form.wheel_bolt_count} onChange={e => setForm({ ...form, wheel_bolt_count: e.target.value })} style={inputStyle} />
            <input placeholder="מרווח ברגים" type="number" value={form.wheel_bolt_spacing} onChange={e => setForm({ ...form, wheel_bolt_spacing: e.target.value })} style={inputStyle} />
            <input placeholder="CB - קוטר מרכז (אופציונלי)" type="number" value={form.wheel_center_bore} onChange={e => setForm({ ...form, wheel_center_bore: e.target.value })} style={inputStyle} />
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '-6px', marginBottom: '12px' }}>
            אם ה-CB לא ידוע או לא רלוונטי — אפשר להשאיר ריק, הצירוף יחול על כל הגלגלים בגודל/ברגים האלה בלי קשר ל-CB.
          </p>
          <input placeholder="הערות (אופציונלי)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ ...inputStyle, width: '100%', marginBottom: '12px' }} />
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 18px', fontWeight: 600, cursor: 'pointer', opacity: submitting ? 0.6 : 1 }}
          >
            {submitting ? <LoadingSpin text="מוסיף..." /> : 'הוסף'}
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>טוען...</div>
        ) : matches.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>אין עדיין צירופים ברשימה</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {matches.map(m => (
              <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>
                    {m.vehicle_make} {m.vehicle_model} {m.year_from || m.year_to ? `(${m.year_from || ''}${m.year_from && m.year_to ? '-' : ''}${m.year_to || '+'})` : ''}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    {m.wheel_bolt_count}×{m.wheel_bolt_spacing} | {m.wheel_rim_size}&quot;{m.wheel_center_bore ? ` | CB ${m.wheel_center_bore}` : ' | CB לא צוין (חל על כל CB)'}
                    {m.notes && <span> — {m.notes}</span>}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(m.id)}
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  מחק
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  background: '#f8fafc',
  color: '#1e293b',
  fontSize: '0.9rem',
}
