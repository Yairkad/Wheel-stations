import { NextRequest, NextResponse } from 'next/server'

const PROMPT = `This is an Israeli vehicle registration document (רישיון רכב).
Extract the following fields and return ONLY a JSON object (no markdown, no explanation):
{
  "plate": "7-8 digit plate number only (מספר רכב)",
  "manufacturer": "manufacturer name in English, brand name only without country (e.g. Honda not Honda Turkey, MAN not MAN Austria)",
  "model": "commercial model name in English (e.g. Civic, Golf, Corolla) — NOT engine code or technical code",
  "year": "4-digit manufacturing year (מועד עליה לכביש or שנת ייצור)",
  "tireSizes": ["tire sizes in format 205/55R16 — passenger car tires only, skip truck tires (R17.5, R19.5, R22.5)"]
}
Use null for any field not found. Return valid JSON only.`

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

    const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_VISION_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'Missing API key' }, { status: 500 })

    const formData = await request.formData()
    const file = formData.get('image') as File | null
    if (!file) return NextResponse.json({ error: 'No image provided' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const mimeType = file.type || 'image/jpeg'

    const body = {
      contents: [{
        parts: [
          { text: PROMPT },
          { inline_data: { mime_type: mimeType, data: base64 } }
        ]
      }],
      generationConfig: { temperature: 0, maxOutputTokens: 4096 }
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    )

    if (!res.ok) {
      const err = await res.text()
      console.error('[OCR route]', res.status, err)
      return NextResponse.json({ error: 'OCR service error' }, { status: 500 })
    }

    const json = await res.json()
    const parts: Array<{ text?: string; thought?: boolean }> = json.candidates?.[0]?.content?.parts ?? []
    const fullText = parts.filter(p => !p.thought).map(p => p.text ?? '').join('')
    const start = fullText.indexOf('{')
    const end = fullText.lastIndexOf('}')
    if (start === -1) return NextResponse.json({ error: 'no JSON in response', raw: fullText.slice(0, 500) }, { status: 500 })

    let parsed: Record<string, unknown>
    if (end !== -1) {
      parsed = JSON.parse(fullText.slice(start, end + 1))
    } else {
      // Truncated response — extract fields with regex
      const partial = fullText.slice(start)
      const get = (key: string) => partial.match(new RegExp(`"${key}"\\s*:\\s*"([^"]*)"`))?.[1] ?? null
      const getTires = () => { const m = partial.match(/"tireSizes"\s*:\s*\[([^\]]*)/); return m ? m[1].match(/"([^"]+)"/g)?.map(s => s.replace(/"/g, '')) ?? [] : [] }
      parsed = { plate: get('plate'), manufacturer: get('manufacturer'), model: get('model'), year: get('year'), tireSizes: getTires() }
    }

    // Normalise manufacturer: strip country suffix
    if (parsed.manufacturer && typeof parsed.manufacturer === 'string') {
      const known: Record<string, string> = {
        TOYOTA: 'Toyota', HYUNDAI: 'Hyundai', KIA: 'Kia', MAZDA: 'Mazda',
        HONDA: 'Honda', NISSAN: 'Nissan', SUZUKI: 'Suzuki', MITSUBISHI: 'Mitsubishi',
        SUBARU: 'Subaru', VOLKSWAGEN: 'Volkswagen', SKODA: 'Skoda', SEAT: 'Seat',
        AUDI: 'Audi', BMW: 'BMW', MERCEDES: 'Mercedes-Benz', PEUGEOT: 'Peugeot',
        CITROEN: 'Citroen', RENAULT: 'Renault', FIAT: 'Fiat', FORD: 'Ford',
        JEEP: 'Jeep', DACIA: 'Dacia', OPEL: 'Opel', VOLVO: 'Volvo',
        LEXUS: 'Lexus', TESLA: 'Tesla', GEELY: 'Geely', MG: 'MG', MINI: 'Mini',
        ISUZU: 'Isuzu', BYD: 'BYD', MAN: 'MAN', IVECO: 'Iveco',
      }
      const firstWord = parsed.manufacturer.split(' ')[0].toUpperCase()
      parsed.manufacturer = known[firstWord] ?? parsed.manufacturer.split(' ')[0]
    }

    return NextResponse.json(parsed)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[OCR route]', msg)
    return NextResponse.json({ error: 'OCR failed' }, { status: 500 })
  }
}
