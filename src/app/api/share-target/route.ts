import { NextRequest, NextResponse } from 'next/server'
import { runGeminiOcr } from '@/lib/ocr-gemini'

// Stay on the default Node.js runtime — `edge` was tried and reverted (bug-455):
// it didn't dodge Vercel's ~4.5MB body limit (still 413s) and didn't change the
// empty-formData outcome below.
//
// Known unresolved issue (bug-441/453/462/466/467/469/472): on at least one real
// device, formData() here comes back completely empty (no "image" field, no keys
// at all) for every share attempt, regardless of file size, source app (WhatsApp/
// Gallery), manifest.json's accept list, icon correctness, or a fresh reinstall.
// Confirmed via a temporary SW probe that the Service Worker never even gets a
// chance to intercept the request either, so this isn't fixable by moving share
// handling back into a SW. This looks like Chrome/Android not attaching the
// shared file's bytes to the share_target POST at all on that device — outside
// what this app's code can work around. The manual upload button (/api/ocr)
// works correctly and is the fallback.

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
// Always mark the redirect as coming from a share (regardless of outcome) so the
// client can reliably show a "processing..." state immediately on landing instead
// of silently doing nothing when something unexpected happens (bug-448 follow-up:
// a bare-file-missing redirect used to carry no marker at all).
function withResult(searchUrl: URL, cookieValue: string, marker: string) {
  searchUrl.searchParams.set('share', '1')
  searchUrl.searchParams.set(marker, marker === 'ocr' ? cookieValue : '1')
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
    let file = formData.get('image') as File | null

    // Fallback: the OS share sheet is expected to send the file under the field
    // name declared in manifest.json's share_target.params.files ("image"), but if
    // that's ever missing, grab the first File-typed value from anywhere in the
    // form instead of giving up silently.
    if (!file) {
      for (const value of formData.values()) {
        if (value instanceof File && value.size > 0) { file = value; break }
      }
    }

    if (!file) {
      console.error(
        '[share-target] no file in formData. keys:', [...formData.keys()],
        '| content-type:', request.headers.get('content-type'),
        '| content-length:', request.headers.get('content-length')
      )
      return withResult(searchUrl, 'no_file', 'ocr_error')
    }

    const result = await runGeminiOcr(file)
    const hasAnything = result.plate || result.manufacturer || result.model || result.tireSizes.length > 0
    if (!hasAnything) {
      return withResult(searchUrl, 'ocr_empty', 'ocr_empty')
    }

    return withResult(searchUrl, JSON.stringify(result), 'ocr')
  } catch (err) {
    console.error('[share-target]', err instanceof Error ? err.message : err)
    return withResult(searchUrl, 'ocr_error', 'ocr_error')
  }
}
