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
          <div className="text-4xl mb-4 animate-spin">📄</div>
          <p className="text-gray-600">טוען טופס...</p>
        </div>
      </div>
    )
  }

  if (expired) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⏰</div>
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
          <div className="text-6xl mb-4">❌</div>
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
              <span className="text-2xl">{isUrgent ? '⚠️' : '⏳'}</span>
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
              <span>⬇️</span>
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
              <span>⬇️</span>
              הורד טופס
            </button>
            <button
              onClick={() => window.print()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2"
            >
              <span>🖨️</span>
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
