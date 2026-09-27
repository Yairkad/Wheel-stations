'use client'

/**
 * The single "ייצוא לאקסל" entry point for a reports screen: a toolbar button that
 * opens a dialog with checkboxes (one per dataset). All checked datasets are written
 * as sheets of one styled workbook, using the screen's current filters.
 */

import { useState } from 'react'
import toast from 'react-hot-toast'
import { ExcelSheet, exportStyledExcel, formatDateForFile } from '@/lib/excel-export'

export interface ExportOption {
  key: string
  label: string
  hint?: string
  /** Builds the sheet(s) for this dataset; null while its data is still loading */
  build: (() => ExcelSheet[]) | null
}

export default function ExportDialog({ options, filePrefix, scopeText }: {
  options: ExportOption[]
  filePrefix: string
  /** e.g. "תחנת ירושלים · 30 ימים אחרונים" — shown in the dialog so it's clear what gets exported */
  scopeText: string
}) {
  const [open, setOpen] = useState(false)
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  const isChecked = (k: string) => checked[k] ?? true
  const selected = options.filter(o => o.build && isChecked(o.key))

  const run = () => {
    const sheets = selected.flatMap(o => o.build!())
    if (exportStyledExcel(`${filePrefix}_${formatDateForFile()}`, sheets)) {
      toast.success('הקובץ הורד בהצלחה')
      setOpen(false)
    } else {
      toast.error('אין נתונים לייצוא בבחירה הנוכחית')
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} style={ui.trigger}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        ייצוא לאקסל
      </button>

      {open && (
        <div style={ui.scrim} onClick={() => setOpen(false)}>
          <div role="dialog" aria-modal="true" aria-label="ייצוא לאקסל" style={ui.dialog} onClick={e => e.stopPropagation()}>
            <div style={ui.head}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>ייצוא לאקסל</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>{scopeText}</div>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="סגור" style={ui.close}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', margin: '4px 0 8px' }}>בחר אילו נתונים לייצא:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto' }}>
              {options.map(o => (
                <label key={o.key} style={{ ...ui.row, opacity: o.build ? 1 : 0.5, cursor: o.build ? 'pointer' : 'default' }}>
                  <input
                    type="checkbox"
                    disabled={!o.build}
                    checked={!!o.build && isChecked(o.key)}
                    onChange={e => setChecked(prev => ({ ...prev, [o.key]: e.target.checked }))}
                    style={{ width: 18, height: 18, accentColor: '#16a34a', flexShrink: 0, marginTop: 1 }}
                  />
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}>{o.label}</span>
                    {o.hint && <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>{o.hint}</span>}
                  </span>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button type="button" onClick={run} disabled={!selected.length} style={{ ...ui.primary, opacity: selected.length ? 1 : 0.5 }}>
                ייצא {selected.length ? `(${selected.length})` : ''}
              </button>
              <button type="button" onClick={() => setOpen(false)} style={ui.secondary}>ביטול</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const ui: Record<string, React.CSSProperties> = {
  trigger: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '9px 16px', borderRadius: 10, border: 'none', background: '#16a34a', color: '#ffffff',
    fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
    boxShadow: '0 1px 2px rgba(22,163,74,0.3)',
  },
  scrim: {
    position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, direction: 'rtl',
  },
  dialog: {
    background: '#ffffff', borderRadius: 16, padding: 20, width: '100%', maxWidth: 420,
    maxHeight: 'calc(100dvh - 32px)', display: 'flex', flexDirection: 'column',
    boxShadow: '0 20px 50px rgba(15,23,42,0.25)', boxSizing: 'border-box',
  },
  head: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  close: { background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569', flexShrink: 0 },
  row: { display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc' },
  primary: { flex: 1, padding: '11px', borderRadius: 10, border: 'none', background: '#16a34a', color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' },
  secondary: { padding: '11px 18px', borderRadius: 10, border: '1px solid #cbd5e1', background: '#fff', color: '#334155', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' },
}
