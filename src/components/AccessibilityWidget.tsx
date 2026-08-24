'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Accessibility, X, Minus, Plus, RotateCcw } from 'lucide-react'
import { useClickOutside } from '@/hooks/useClickOutside'

type Contrast = 'normal' | 'high' | 'invert'

interface A11yPrefs {
  fontStep: 0 | 1 | 2 | 3
  contrast: Contrast
  grayscale: boolean
  links: boolean
  readable: boolean
  stopMotion: boolean
}

const DEFAULT_PREFS: A11yPrefs = {
  fontStep: 0,
  contrast: 'normal',
  grayscale: false,
  links: false,
  readable: false,
  stopMotion: false,
}

const STORAGE_KEY = 'wheels_a11y_prefs_v1'

function applyPrefs(prefs: A11yPrefs) {
  const html = document.documentElement
  html.setAttribute('data-a11y-fontsize', String(prefs.fontStep))
  html.setAttribute('data-a11y-contrast', prefs.contrast)
  html.setAttribute('data-a11y-grayscale', String(prefs.grayscale))
  html.setAttribute('data-a11y-links', String(prefs.links))
  html.setAttribute('data-a11y-readable', String(prefs.readable))
  html.setAttribute('data-a11y-motion', prefs.stopMotion ? 'stop' : 'normal')
}

function loadPrefs(): A11yPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_PREFS
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_PREFS
  }
}

const contrastOptions: { value: Contrast; label: string }[] = [
  { value: 'normal', label: 'רגיל' },
  { value: 'high', label: 'ניגודיות גבוהה' },
  { value: 'invert', label: 'היפוך צבעים' },
]

export default function AccessibilityWidget() {
  const [open, setOpen] = useState(false)
  const [prefs, setPrefs] = useState<A11yPrefs>(DEFAULT_PREFS)
  const [ready, setReady] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const loaded = loadPrefs()
    setPrefs(loaded)
    applyPrefs(loaded)
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    applyPrefs(prefs)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    } catch {
      // localStorage unavailable (private mode etc.) — prefs still apply for this session
    }
  }, [prefs, ready])

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  useClickOutside(panelRef, () => setOpen(false), open)

  const toggle = (key: keyof A11yPrefs) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }))
  }

  const setFontStep = (delta: number) => {
    setPrefs((p) => ({ ...p, fontStep: Math.min(3, Math.max(0, p.fontStep + delta)) as A11yPrefs['fontStep'] }))
  }

  const reset = () => setPrefs(DEFAULT_PREFS)

  const wrapperStyle: React.CSSProperties = {
    position: 'fixed',
    left: 'max(16px, env(safe-area-inset-left, 0px))',
    bottom: 'max(16px, env(safe-area-inset-bottom, 0px))',
    zIndex: 2100,
  }

  // Sizes below are pinned to px (not Tailwind's rem-based utilities) so the panel's
  // own layout stays constant when data-a11y-fontsize scales the root <html> font-size —
  // otherwise the widget would grow itself right off the screen.
  return (
    <div style={wrapperStyle} dir="rtl">
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="תפריט נגישות"
          className="absolute bottom-[64px] left-0 w-[288px] max-w-[calc(100vw-32px)] max-h-[calc(100dvh-96px)] overflow-y-auto bg-white rounded-[12px] shadow-2xl border border-gray-200 p-[16px] animate-fade-in"
        >
          <div className="flex items-center justify-between mb-[12px]">
            <h2 className="text-[16px] font-bold text-gray-800">נגישות</h2>
            <button
              onClick={() => setOpen(false)}
              aria-label="סגור תפריט נגישות"
              className="text-gray-500 hover:text-gray-800 p-[4px] rounded"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mb-[16px]">
            <p className="text-[14px] font-medium text-gray-700 mb-[8px]">גודל טקסט</p>
            <div className="flex items-center gap-[8px]">
              <button
                onClick={() => setFontStep(-1)}
                disabled={prefs.fontStep === 0}
                aria-label="הקטן טקסט"
                className="flex-1 flex items-center justify-center gap-[4px] py-[8px] text-[14px] rounded-[8px] border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <Minus size={16} /> א
              </button>
              <span className="text-[12px] text-gray-500 w-[48px] text-center">{100 + prefs.fontStep * 12.5}%</span>
              <button
                onClick={() => setFontStep(1)}
                disabled={prefs.fontStep === 3}
                aria-label="הגדל טקסט"
                className="flex-1 flex items-center justify-center gap-[4px] py-[8px] text-[14px] rounded-[8px] border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <Plus size={16} /> א
              </button>
            </div>
          </div>

          <div className="mb-[16px]">
            <p className="text-[14px] font-medium text-gray-700 mb-[8px]">ניגודיות</p>
            <div className="flex flex-col gap-[4px]">
              {contrastOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPrefs((p) => ({ ...p, contrast: opt.value }))}
                  aria-pressed={prefs.contrast === opt.value}
                  className={`text-[14px] text-right py-[8px] px-[12px] rounded-[8px] border ${
                    prefs.contrast === opt.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-[16px] flex flex-col gap-[4px]">
            {([
              ['grayscale', 'גווני אפור'],
              ['links', 'הדגשת קישורים'],
              ['readable', 'גופן קריא (ריווח שורות)'],
              ['stopMotion', 'עצירת אנימציות'],
            ] as [keyof A11yPrefs, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => toggle(key)}
                aria-pressed={Boolean(prefs[key])}
                className={`text-[14px] text-right py-[8px] px-[12px] rounded-[8px] border ${
                  prefs[key]
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between gap-[8px] pt-[8px] border-t border-gray-200">
            <button
              onClick={reset}
              className="flex items-center gap-[4px] text-[14px] text-gray-600 hover:text-gray-900"
            >
              <RotateCcw size={14} /> איפוס הכל
            </button>
            <Link href="/accessibility" className="text-[14px] text-blue-600 hover:underline">
              הצהרת נגישות
            </Link>
          </div>
        </div>
      )}

      <button
        ref={buttonRef}
        onClick={() => setOpen((o) => !o)}
        aria-label="פתח תפריט נגישות"
        aria-expanded={open}
        className="w-[48px] h-[48px] rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg transition-colors"
      >
        <Accessibility size={24} />
      </button>
    </div>
  )
}
