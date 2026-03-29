import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')
  if (!q || q.trim().length < 2) return NextResponse.json([])

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&countrycodes=il&limit=8&addressdetails=1&accept-language=he,en`

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'WheelsApp/1.0', 'Accept-Language': 'he,en' },
      next: { revalidate: 60 },
    })
    const data = await res.json()
    return NextResponse.json(
      data.map((r: { lat: string; lon: string; display_name: string }) => ({
        lat: parseFloat(r.lat),
        lng: parseFloat(r.lon),
        label: r.display_name,
      }))
    )
  } catch {
    return NextResponse.json([])
  }
}
