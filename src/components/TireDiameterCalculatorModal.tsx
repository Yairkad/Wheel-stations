'use client'

import { useState } from 'react'
import { getTireDiameterMm, DIAMETER_MISMATCH_THRESHOLD } from '@/lib/vehicle-mappings'

interface TireDiameterCalculatorModalProps {
  vehicleTire: string | null | undefined
  wheelTireSize: string | null | undefined
  wheelRimSize: number | null
  wheelNumber?: string
  onClose: () => void
}

export default function TireDiameterCalculatorModal({
  vehicleTire, wheelTireSize, wheelRimSize, wheelNumber, onClose
}: TireDiameterCalculatorModalProps) {
  const [vehicleInput, setVehicleInput] = useState(vehicleTire || '')
  const [wheelInput, setWheelInput] = useState(
    wheelTireSize && wheelRimSize != null ? `${wheelTireSize}R${wheelRimSize}` : ''
  )

  const vehicleDiameter = getTireDiameterMm(vehicleInput)
  const wheelDiameter = getTireDiameterMm(wheelInput)
  const diffPct = vehicleDiameter != null && wheelDiameter != null
    ? (Math.abs(wheelDiameter - vehicleDiameter) / vehicleDiameter) * 100
    : null
  const withinThreshold = diffPct != null && diffPct <= DIAMETER_MISMATCH_THRESHOLD * 100

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>
            מחשבון הפרש קוטר{wheelNumber ? <> — גלגל <span dir="ltr" style={{ whiteSpace: 'nowrap' }}>#{wheelNumber}</span></> : ''}
          </h3>
          <button style={styles.closeBtn} onClick={onClose} aria-label="סגור">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div style={styles.body}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>צמיג הרכב</label>
            <input
              type="text"
              value={vehicleInput}
              onChange={e => setVehicleInput(e.target.value)}
              placeholder="205/60R16"
              style={styles.input}
              dir="ltr"
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>צמיג הגלגל המוצע</label>
            <input
              type="text"
              value={wheelInput}
              onChange={e => setWheelInput(e.target.value)}
              placeholder="215/50R17"
              style={styles.input}
              dir="ltr"
            />
          </div>

          <div style={styles.resultBox}>
            <div style={styles.resultRow}>
              <span>קוטר גלגול - רכב</span>
              <span>{vehicleDiameter != null ? `${vehicleDiameter.toFixed(1)} מ"מ` : '—'}</span>
            </div>
            <div style={styles.resultRow}>
              <span>קוטר גלגול - גלגל מוצע</span>
              <span>{wheelDiameter != null ? `${wheelDiameter.toFixed(1)} מ"מ` : '—'}</span>
            </div>
            <div style={styles.diffRow}>
              <span>הפרש</span>
              <span style={{ color: diffPct == null ? '#64748b' : withinThreshold ? '#15803d' : '#dc2626' }}>
                {diffPct != null ? `${diffPct.toFixed(1)}%` : 'הזן שתי מידות תקינות'}
              </span>
            </div>
          </div>

          {diffPct != null && (
            <div style={{
              ...styles.verdict,
              background: withinThreshold ? '#f0fdf4' : '#fef2f2',
              border: withinThreshold ? '1px solid #bbf7d0' : '1px solid #fecaca',
              color: withinThreshold ? '#15803d' : '#dc2626'
            }}>
              {withinThreshold
                ? `בטווח הסביר (עד ${(DIAMETER_MISMATCH_THRESHOLD * 100).toFixed(0)}% הפרש) - זה הסף שהאפליקציה בודקת לפיו`
                : `מעל הסף (${(DIAMETER_MISMATCH_THRESHOLD * 100).toFixed(0)}% הפרש) שהאפליקציה בודקת לפיו`}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(15,23,42,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1200,
    padding: '12px',
  },
  modal: {
    background: '#ffffff',
    borderRadius: '14px',
    padding: '16px',
    width: '100%',
    maxWidth: '380px',
    maxHeight: '90vh',
    overflowY: 'auto',
    border: '1px solid #e2e8f0',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '10px',
    marginBottom: '14px',
  },
  title: {
    color: '#1e293b',
    margin: 0,
    fontSize: '1.05rem',
    fontWeight: 700,
  },
  closeBtn: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    color: '#64748b',
    cursor: 'pointer',
    borderRadius: '8px',
    padding: '6px',
    display: 'flex',
    flexShrink: 0,
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '0.85rem',
    color: '#64748b',
    fontWeight: 600,
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    background: '#f8fafc',
    color: '#1e293b',
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  resultBox: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontSize: '0.9rem',
    color: '#475569',
  },
  resultRow: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  diffRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontWeight: 700,
    borderTop: '1px solid #e2e8f0',
    paddingTop: '8px',
    marginTop: '2px',
  },
  verdict: {
    borderRadius: '8px',
    padding: '10px 12px',
    fontSize: '0.85rem',
    fontWeight: 600,
    textAlign: 'center',
  },
}
