import { NextRequest, NextResponse } from 'next/server'
import { runGeminiOcr } from '@/lib/ocr-gemini'

// Web Share Target endpoint (public/manifest.json's share_target.action).
// The OS share sheet POSTs the shared image directly here — a real server route,
// not a Service Worker — so the feature doesn't depend on a SW registration still
// being alive on the device. Runs OCR immediately and redirects back to /search.
//
// The result travels TWO ways: as a ?ocr=... query param on the redirect (works in
// a plain browser), AND as a short-lived cookie (bug-441 follow-up: on the actual
// Android/Chrome share flow the query string was observed to not survive — landed
// on a bare /search with no params — while a cookie, being part of the HTTP
// response itself rather than a URL the OS re-derives, isn't at the mercy of that).
// search/page.tsx checks the query param first and falls back to the cookie.
function withResult(searchUrl: URL, cookieValue: string) {
  const response = NextResponse.redirect(searchUrl, 303)
  response.cookies.set('share_ocr_result', cookieValue, {
    maxAge: 60,
    path: '/',
    sameSite: 'lax',
  })
  return response
}

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
      return withResult(searchUrl, 'ocr_empty')
    }

    const payload = JSON.stringify(result)
    searchUrl.searchParams.set('ocr', payload)
    return withResult(searchUrl, payload)
  } catch (err) {
    console.error('[share-target]', err instanceof Error ? err.message : err)
    searchUrl.searchParams.set('ocr_error', '1')
    return withResult(searchUrl, 'ocr_error')
  }
}
