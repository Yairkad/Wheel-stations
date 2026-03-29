import { NextRequest, NextResponse } from 'next/server'

function extractCoords(url: string): { lat: string; lng: string } | null {
  let m = /@(-?\d+\.\d+),(-?\d+\.\d+)/.exec(url)
  if (m) return { lat: m[1], lng: m[2] }
  m = /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/.exec(url)
  if (m) return { lat: m[1], lng: m[2] }
  m = /[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/.exec(url)
  if (m) return { lat: m[1], lng: m[2] }
  m = /[?&]center=(-?\d+\.\d+)%2C(-?\d+\.\d+)/.exec(url)
  if (m) return { lat: m[1], lng: m[2] }
  return null
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'missing url' }, { status: 400 })

  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WheelsApp/1.0)',
      },
    })

    // The final URL after all redirects
    const finalUrl = res.url
    const coords = extractCoords(finalUrl)
    if (coords) return NextResponse.json(coords)

    // Fallback: scan the response body for coordinate patterns
    const text = await res.text()
    const bodyCoords = extractCoords(text)
    if (bodyCoords) return NextResponse.json(bodyCoords)

    return NextResponse.json({ error: 'coordinates not found' }, { status: 404 })
  } catch {
    return NextResponse.json({ error: 'failed to resolve url' }, { status: 500 })
  }
}
