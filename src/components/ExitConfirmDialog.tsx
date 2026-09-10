'use client'

import type { RoleResult } from '@/lib/types'

function getRoleDisplay(role: string, label?: string): string {
  if (label) return label
  switch (role) {
    case 'admin': return 'מנהל מערכת'
    case 'station_manager': return 'מנהל תחנה'
    case 'district_manager': return 'מנהל מחוז'
    case 'editor': return 'עורך'
    case 'operator': return 'מוקדן'
    default: return 'משתמש'
  }
}

interface ExitConfirmDialogProps {
  open: boolean
  onCancel: () => void
  onExit: () => void
  previousRoleEntry?: RoleResult
  onSwitchBack: () => void
}

// Shown either when a bare back press hits a role's home screen, or when the user
// deliberately clicks "התנתק" — gives explicit options instead of silently logging out.
export default function ExitConfirmDialog({ open, onCancel, onExit, previousRoleEntry, onSwitchBack }: ExitConfirmDialogProps) {
  if (!open) return null

  return (
    <div
      role="presentation"
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{ background: '#fff', borderRadius: '16px', padding: '24px', maxWidth: '340px', width: '100%', direction: 'rtl', boxShadow: '0 12px 40px rgba(0,0,0,0.2)' }}
        onClick={e => e.stopPropagation()}
      >
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>מה ברצונך לעשות?</h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px' }}>
          {previousRoleEntry
            ? 'תוכל לצאת מהאפליקציה, לחזור לתפקיד הקודם שהיית בו, או להישאר כאן.'
            : 'תוכל לצאת מהאפליקציה או להישאר כאן.'}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {previousRoleEntry && (
            <button
              onClick={onSwitchBack}
              style={{ padding: '11px', borderRadius: '10px', border: 'none', background: '#eff6ff', color: '#2563eb', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
            >
              חזור לתפקיד הקודם ({getRoleDisplay(previousRoleEntry.role, previousRoleEntry.label)})
            </button>
          )}
          <button
            onClick={onExit}
            style={{ padding: '11px', borderRadius: '10px', border: 'none', background: '#fef2f2', color: '#ef4444', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
          >
            צא מהאפליקציה
          </button>
          <button
            onClick={onCancel}
            style={{ padding: '11px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}
          >
            ביטול — הישאר כאן
          </button>
        </div>
      </div>
    </div>
  )
}
