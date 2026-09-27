import { NextRequest, NextResponse } from 'next/server'
import { runGeminiOcr } from '@/lib/ocr-gemini'

// Web Share Target endpoint (public/manifest.json's share_target.action).
// The OS share sheet POSTs the shared image directly here — a real server route,
// not a Service Worker — so the feature doesn't depend on a SW registration still
// being alive on the device. Runs OCR immediately and redirects back to /search
// with the result in the query string.
export async function POST(request: NextRequest) {
  const searchUrl = new URL('/search', request.url)

  try {
    const formData = await request.formData()
    const file = formData.get('image') as File | null
    if (!file) return NextResponse.redirect(searchUrl, 303)

    const result = await runGeminiOcr(file)
    const hasAnything = result.plate || result.manufacturer || result.model || result.tireSizes.length > 0
    if (!hasAnything) {
      searchUrl.searchParams.set('ocr_empty', '1')
      return NextResponse.redirect(searchUrl, 303)
    }

    searchUrl.searchParams.set('ocr', JSON.stringify(result))
    return NextResponse.redirect(searchUrl, 303)
  } catch (err) {
    console.error('[share-target]', err instanceof Error ? err.message : err)
    searchUrl.searchParams.set('ocr_error', '1')
    return NextResponse.redirect(searchUrl, 303)
  }
}
