'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface FormData {
  id: string
  image_url: string
  expires_at: string
  days_remaining: number
  view_count: number
  download_count: number
  created_at: string
  borrow: {
    borrower_name: string
    borrower_phone: string
    vehicle_model: string
    borrow_date: string
    wheels: {
      wheel_number: string
      rim_size: string
      bolt_count: number
      bolt_spacing: number
    }
  }
  station: {
    name: string
  }
}

export default function FormViewerPage({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = use(params)
  const [form, setForm] = useState<FormData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    fetchForm()
  }, [formId])

  const fetchForm = async () => {
    try {
      const response = await fetch(`/api/signed-forms/${formId}?action=view`)

      if (response.status === 410) {
        setExpired(true)
        setError('הטופס פג תוקף ונמחק מהמערכת')
        return
      }

      if (!response.ok) {
        throw new Error('Failed to fetch form')
      }

      const data = await response.json()
      setForm(data)
    } catch (err) {
      setError('שגיאה בטעינת הטופס')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!form) return

    try {
      // Track download
      await fetch(`/api/signed-forms/${formId}?action=download`)

      // Download image
      const response = await fetch(form.image_url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = `טופס_השאלה_${form.borrow.borrower_name}_גלגל_${form.borrow.wheels.wheel_number}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast.success('הטופס הורד בהצלחה')
    } catch (err) {
      toast.error('שגיאה בהורדת הטופס')
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="mb-4 flex justify-center"><svg className="animate-spin" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
          <p className="text-gray-600">טוען טופס...</p>
        </div>
      </div>
    )
  }

  if (expired) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-4 flex justify-center"><svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">הטופס פג תוקף</h1>
          <p className="text-gray-600 mb-6">
            טפסים נשמרים במערכת למשך 30 יום בלבד.<br />
            הטופס הזה נמחק אוטומטית.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
          >
            חזרה לדף הראשי
          </Link>
        </div>
      </div>
    )
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-4 flex justify-center"><svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">שגיאה</h1>
          <p className="text-gray-600 mb-6">{error || 'הטופס לא נמצא'}</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
          >
            חזרה לדף הראשי
          </Link>
        </div>
      </div>
    )
  }

  const expiryDate = new Date(form.expires_at).toLocaleDateString('he-IL')
  const borrowDate = new Date(form.borrow.borrow_date).toLocaleDateString('he-IL')
  const isUrgent = form.days_remaining <= 7

  return (
    <div className="min-h-screen bg-gray-100 p-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Expiry Banner */}
        <div className={`rounded-xl p-4 mb-4 ${isUrgent ? 'bg-red-100 border-2 border-red-400' : 'bg-amber-100 border border-amber-400'}`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span>{isUrgent ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}</span>
              <div>
                <p className={`font-bold ${isUrgent ? 'text-red-800' : 'text-amber-800'}`}>
                  {isUrgent ? 'הטופס יפוג בקרוב!' : 'שימו לב'}
                </p>
                <p className={`text-sm ${isUrgent ? 'text-red-700' : 'text-amber-700'}`}>
                  הטופס יישמר עד {expiryDate} ({form.days_remaining} ימים נותרו)
                </p>
              </div>
            </div>
            <button
              onClick={handleDownload}
              className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 ${
                isUrgent
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              הורד עותק
            </button>
          </div>
          <p className={`text-xs mt-2 ${isUrgent ? 'text-red-600' : 'text-amber-600'}`}>
            מומלץ להוריד עותק אם נדרש תיעוד ארוך טווח
          </p>
        </div>

        {/* Form Details Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-4">
          <div className="bg-gray-700 text-white p-4">
            <h1 className="text-xl font-bold">טופס השאלת גלגל חתום</h1>
            <p className="text-gray-300 text-sm">תחנה: {form.station.name}</p>
          </div>

          {/* Details Grid */}
          <div className="p-4 border-b">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">שם השואל</p>
                <p className="font-semibold">{form.borrow.borrower_name}</p>
              </div>
              <div>
                <p className="text-gray-500">מספר גלגל</p>
                <p className="font-semibold">#{form.borrow.wheels.wheel_number}</p>
              </div>
              <div>
                <p className="text-gray-500">תאריך השאלה</p>
                <p className="font-semibold">{borrowDate}</p>
              </div>
              <div>
                <p className="text-gray-500">דגם רכב</p>
                <p className="font-semibold">{form.borrow.vehicle_model}</p>
              </div>
            </div>
          </div>

          {/* Form Image */}
          <div className="p-4">
            <img
              src={form.image_url}
              alt="טופס השאלה חתום"
              className="w-full rounded-lg border shadow-sm"
            />
          </div>

          {/* Actions */}
          <div className="p-4 bg-gray-50 flex flex-wrap gap-3 justify-center">
            <button
              onClick={handleDownload}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              הורד טופס
            </button>
            <button
              onClick={() => window.print()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              הדפס
            </button>
            <Link
              href="/"
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium"
            >
              חזרה
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-xl p-4 text-center text-sm text-gray-500">
          <p>
            צפיות: {form.view_count} | הורדות: {form.download_count}
          </p>
        </div>
      </div>
    </div>
  )
}
