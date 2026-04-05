'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

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

  const [type, setType] = useState<FeedbackType>('bug')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [senderName, setSenderName] = useState('')
  const [senderEmail, setSenderEmail] = useState('')
  const [senderPhone, setSenderPhone] = useState('')
  const [stationName, setStationName] = useState('')
  const [attachments, setAttachments] = useState<AttachedFile[]>([])

  const typeOptions: Array<{ value: string; label: string; icon: React.ReactNode; color: string; selected: string }> = [
    { value: 'bug', label: 'דיווח על באג', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2l1.88 1.88"/><path d="M14.12 3.88L16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6z"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/></svg>, color: 'border-red-300 bg-red-50 text-red-800', selected: 'border-red-500 bg-red-100 ring-2 ring-red-500' },
    { value: 'suggestion', label: 'הצעת שיפור', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>, color: 'border-blue-300 bg-blue-50 text-blue-800', selected: 'border-blue-500 bg-blue-100 ring-2 ring-blue-500' },
    { value: 'other', label: 'אחר', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>, color: 'border-gray-300 bg-gray-50 text-gray-800', selected: 'border-gray-500 bg-gray-100 ring-2 ring-gray-500' },
  ]

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const maxSize = 25 * 1024 * 1024 // 25MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']

    for (const file of Array.from(files)) {
      if (file.size > maxSize) {
        toast.error(`הקובץ ${file.name} גדול מדי. מקסימום 25MB`)
        continue
      }

      if (!allowedTypes.includes(file.type)) {
        toast.error(`סוג הקובץ ${file.name} לא נתמך`)
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

    if (!subject.trim()) {
      toast.error('נא להזין נושא')
      return
    }

    if (!description.trim()) {
      toast.error('נא להזין תיאור')
      return
    }

    if (description.trim().length < 10) {
      toast.error('התיאור קצר מדי. נא לפרט יותר')
      return
    }

    if (!senderEmail.trim()) {
      toast.error('נא להזין כתובת מייל')
      return
    }

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
    if (!emailRegex.test(senderEmail.trim())) {
      toast.error('כתובת מייל לא תקינה')
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
        toast.success('הפידבק נשלח בהצלחה!')
      } else {
        toast.error(`שליחת הפידבק נכשלה: ${data.error || 'שגיאה לא ידועה'}`)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'בעיה בחיבור לשרת'
      toast.error(`שליחת הפידבק נכשלה: ${errorMessage}`)
    } finally {
      setSending(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-4 flex justify-center"><svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="20 6 9 17 4 12"/></svg></div>
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> שליחת פידבק</h1>
              <p className="text-sm sm:text-base text-gray-600">דווח על באג או שלח הצעה לשיפור מערכת הגלגלים</p>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium text-sm sm:text-base"
            >
              <span>סגור</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                סוג הפידבק *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {typeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setType(option.value as FeedbackType)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      type === option.value ? option.selected : option.color
                    } hover:scale-105`}
                  >
                    <div className="mb-1 flex justify-center">{option.icon}</div>
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
                <div className="mb-2 flex justify-center"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg></div>
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
                        <span>
                          {file.type.startsWith('video/')
                            ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                            : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                          }
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
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
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
                    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                    שולח...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> שלח פידבק</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="bg-gray-100 rounded-xl p-4">
          <p className="text-sm text-gray-700 text-center">
            <strong className="inline-flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg> טיפ:</strong> ככל שתפרט יותר, נוכל לטפל בבעיה טוב יותר
          </p>
        </div>
      </div>
    </div>
  )
}
