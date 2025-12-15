'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type FeedbackType = 'bug' | 'suggestion' | 'other'

interface AttachedFile {
  name: string
  type: string
  size: number
  base64: string
}

export default function FeedbackPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [type, setType] = useState<FeedbackType>('bug')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [senderName, setSenderName] = useState('')
  const [senderEmail, setSenderEmail] = useState('')
  const [senderPhone, setSenderPhone] = useState('')
  const [stationName, setStationName] = useState('')
  const [attachments, setAttachments] = useState<AttachedFile[]>([])

  const typeOptions = [
    { value: 'bug', label: 'דיווח על באג', emoji: '🐛', color: 'border-red-300 bg-red-50 text-red-800', selected: 'border-red-500 bg-red-100 ring-2 ring-red-500' },
    { value: 'suggestion', label: 'הצעת שיפור', emoji: '💡', color: 'border-blue-300 bg-blue-50 text-blue-800', selected: 'border-blue-500 bg-blue-100 ring-2 ring-blue-500' },
    { value: 'other', label: 'אחר', emoji: '📝', color: 'border-gray-300 bg-gray-50 text-gray-800', selected: 'border-gray-500 bg-gray-100 ring-2 ring-gray-500' },
  ]

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const maxSize = 25 * 1024 * 1024 // 25MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']

    for (const file of Array.from(files)) {
      if (file.size > maxSize) {
        setError(`הקובץ ${file.name} גדול מדי. מקסימום 25MB`)
        continue
      }

      if (!allowedTypes.includes(file.type)) {
        setError(`סוג הקובץ ${file.name} לא נתמך`)
        continue
      }

      const base64 = await fileToBase64(file)
      setAttachments(prev => [...prev, {
        name: file.name,
        type: file.type,
        size: file.size,
        base64
      }])
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!subject.trim()) {
      setError('נא להזין נושא')
      return
    }

    if (!description.trim()) {
      setError('נא להזין תיאור')
      return
    }

    if (description.trim().length < 10) {
      setError('התיאור קצר מדי. נא לפרט יותר')
      return
    }

    if (!senderEmail.trim()) {
      setError('נא להזין כתובת מייל')
      return
    }

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
    if (!emailRegex.test(senderEmail.trim())) {
      setError('כתובת מייל לא תקינה')
      return
    }

    setSending(true)

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          subject: subject.trim(),
          description: description.trim(),
          senderName: senderName.trim() || undefined,
          senderEmail: senderEmail.trim() || undefined,
          senderPhone: senderPhone.trim() || undefined,
          stationName: stationName.trim() || undefined,
          attachments: attachments.length > 0 ? attachments : undefined,
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess(true)
      } else {
        setError(data.error || 'שגיאה בשליחת הפידבק')
      }
    } catch {
      setError('שגיאה בתקשורת עם השרת')
    } finally {
      setSending(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">תודה על המשוב!</h1>
          <p className="text-gray-600 mb-6">
            הפידבק שלך נשלח בהצלחה. נבדוק אותו בהקדם.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setSuccess(false)
                setSubject('')
                setDescription('')
                setAttachments([])
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              שלח עוד פידבק
            </button>
            <Link
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              חזרה לדף הראשי
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4" dir="rtl">
      <div className="max-w-2xl mx-auto py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📣 שליחת פידבק</h1>
              <p className="text-gray-600">דווח על באג או שלח הצעה לשיפור מערכת הגלגלים</p>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
            >
              <span>סגור</span>
              <span>✕</span>
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-600 text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                סוג הפידבק *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {typeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setType(option.value as FeedbackType)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      type === option.value ? option.selected : option.color
                    } hover:scale-105`}
                  >
                    <div className="text-2xl mb-1">{option.emoji}</div>
                    <div className="text-sm font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                נושא *
              </label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={type === 'bug' ? 'למשל: שגיאה בחיפוש גלגלים' : 'למשל: הוספת סינון לפי אזור'}
                required
                disabled={sending}
                className="w-full h-12 text-lg px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                תיאור מפורט *
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={type === 'bug'
                  ? 'תאר את הבעיה בפירוט:\n- מה ניסית לעשות?\n- מה קרה בפועל?\n- מה ציפית שיקרה?'
                  : 'תאר את ההצעה שלך בפירוט:\n- מה היית רוצה שיתווסף?\n- איך זה יעזור?'}
                required
                disabled={sending}
                rows={6}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">מינימום 10 תווים</p>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                צילום/הקלטת מסך (אופציונלי)
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={sending}
                />
                <div className="text-4xl mb-2">📎</div>
                <p className="text-gray-600 font-medium">לחץ להעלאת קובץ</p>
                <p className="text-xs text-gray-500 mt-1">
                  תמונות או סרטונים - עד 25MB
                </p>
              </div>

              {attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {file.type.startsWith('video/') ? '🎬' : '🖼️'}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                        disabled={sending}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Contact Details */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">פרטי יצירת קשר</h2>
              <p className="text-sm text-gray-600 mb-4">
                השאר פרטים כדי שנוכל לחזור אליך עם עדכונים
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="senderName" className="block text-sm font-medium text-gray-700 mb-2">
                    שם
                  </label>
                  <input
                    id="senderName"
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="השם שלך"
                    disabled={sending}
                    className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="stationName" className="block text-sm font-medium text-gray-700 mb-2">
                    שם התחנה
                  </label>
                  <input
                    id="stationName"
                    type="text"
                    value={stationName}
                    onChange={(e) => setStationName(e.target.value)}
                    placeholder="שם התחנה שלך"
                    disabled={sending}
                    className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="senderEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    מייל <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="senderEmail"
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="your@email.com"
                    disabled={sending}
                    className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    dir="ltr"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="senderPhone" className="block text-sm font-medium text-gray-700 mb-2">
                    טלפון
                  </label>
                  <input
                    id="senderPhone"
                    type="tel"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder="0501234567"
                    disabled={sending}
                    className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={sending}
                className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white h-14 text-lg rounded-lg font-medium disabled:opacity-50"
              >
                {sending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    שולח...
                  </span>
                ) : (
                  '📤 שלח פידבק'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="bg-gray-100 rounded-xl p-4">
          <p className="text-sm text-gray-700 text-center">
            <strong>💡 טיפ:</strong> ככל שתפרט יותר, נוכל לטפל בבעיה טוב יותר
          </p>
        </div>
      </div>
    </div>
  )
}
