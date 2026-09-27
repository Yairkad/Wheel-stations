import { NextRequest, NextResponse } from 'next/server'
import { runGeminiOcr } from '@/lib/ocr-gemini'

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get('origin') ?? ''
    const host = request.headers.get('host') ?? ''
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1')
    const allowedOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? ''

    if (!isLocal && origin) {
      let allowed = false
      try {
        const originHost = new URL(origin).hostname
        const hostName = host.split(':')[0]
        if (originHost === hostName) allowed = true
        else if (allowedOrigin) {
          const allowedHost = new URL(allowedOrigin).hostname
          if (originHost === allowedHost) allowed = true
        }
      } catch { /* invalid origin URL */ }
      if (!allowed) {
        console.error('[OCR] blocked origin:', origin, '| host:', host, '| allowed:', allowedOrigin)
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const formData = await request.formData()
    const file = formData.get('image') as File | null
    if (!file) return NextResponse.json({ error: 'No image provided' }, { status: 400 })

    const result = await runGeminiOcr(file)
    return NextResponse.json(result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[OCR route]', msg)
    return NextResponse.json({ error: msg || 'OCR failed' }, { status: 500 })
  }
}
