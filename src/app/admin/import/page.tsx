'use client'

import { useState } from 'react'

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [adminKey, setAdminKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleImport = async () => {
    if (!file || !adminKey) {
      setError('יש להזין קובץ וסיסמת אדמין')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/api/admin/import-wheel-fitment?key=${adminKey}`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'שגיאה בייבוא')
      } else {
        setResult(data)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f172a',
      color: 'white',
      padding: '40px',
      direction: 'rtl'
    }}>
      <h1 style={{ marginBottom: '30px' }}>ייבוא נתוני Wheel Fitment</h1>

      <div style={{ maxWidth: '500px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px' }}>סיסמת אדמין:</label>
          <input
            type="password"
            value={adminKey}
            onChange={e => setAdminKey(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #475569',
              background: '#1e293b',
              color: 'white'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px' }}>קובץ CSV:</label>
          <input
            type="file"
            accept=".csv"
            onChange={e => setFile(e.target.files?.[0] || null)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #475569',
              background: '#1e293b',
              color: 'white'
            }}
          />
          {file && <p style={{ marginTop: '8px', color: '#94a3b8' }}>{file.name}</p>}
        </div>

        <button
          onClick={handleImport}
          disabled={loading || !file || !adminKey}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            background: loading ? '#475569' : '#3b82f6',
            color: 'white',
            fontSize: '1rem',
            cursor: loading ? 'wait' : 'pointer',
            width: '100%'
          }}
        >
          {loading ? 'מייבא...' : 'התחל ייבוא'}
        </button>

        {error && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            borderRadius: '8px',
            background: '#7f1d1d',
            color: '#fecaca'
          }}>
            {error}
          </div>
        )}

        {result && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            borderRadius: '8px',
            background: '#14532d',
            color: '#bbf7d0'
          }}>
            <h3 style={{ marginBottom: '10px' }}>✅ ייבוא הושלם</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li>סה״כ שורות: {result.totalLines}</li>
              <li>נוספו: {result.inserted}</li>
              <li>עודכנו: {result.updated}</li>
              <li>דולגו: {result.skipped}</li>
              <li>שגיאות: {result.errorCount}</li>
            </ul>
            {result.errors?.length > 0 && (
              <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#fecaca' }}>
                <strong>שגיאות ראשונות:</strong>
                <ul style={{ margin: '5px 0', paddingRight: '20px' }}>
                  {result.errors.map((err: string, i: number) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
