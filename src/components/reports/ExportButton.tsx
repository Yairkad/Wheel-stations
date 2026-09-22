'use client'

/** Small "ייצוא לאקסל" button placed at the end of each report block. */
export default function ExportButton({ onClick, disabled, label = 'ייצוא לאקסל' }: { onClick: () => void; disabled?: boolean; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '7px 14px', borderRadius: 8, border: '1px solid #16a34a',
        background: disabled ? '#f1f5f9' : '#f0fdf4', color: disabled ? '#94a3b8' : '#15803d',
        fontSize: '0.82rem', fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
        borderColor: disabled ? '#e2e8f0' : '#16a34a',
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      {label}
    </button>
  )
}
