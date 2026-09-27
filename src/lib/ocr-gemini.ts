// Server-only: calls Gemini to extract vehicle fields from a רישיון רכב photo.
// Shared by /api/ocr (manual upload button) and /api/share-target (OS share sheet).

const PROMPT = `This is an Israeli vehicle registration document (רישיון רכב).
Extract ONLY the following vehicle technical fields and return them as a JSON object (no markdown, no explanation).
Do NOT extract or return any personal data — ignore owner name, ID number (ת.ז), address, or any other personal information.
{
  "plate": "7-8 digit plate number only (מספר רכב)",
  "manufacturer": "manufacturer name in English, brand name only without country (e.g. Honda not Honda Turkey, MAN not MAN Austria)",
  "model": "commercial model name in English (e.g. Civic, Golf, Corolla) — NOT engine code or technical code",
  "year": "4-digit manufacturing year (מועד עליה לכביש or שנת ייצור)",
  "tireSizes": ["tire sizes in format 205/55R16 — passenger car tires only, skip truck tires (R17.5, R19.5, R22.5)"]
}
Use null for any field not found. Return valid JSON only.`

const KNOWN_MAKES: Record<string, string> = {
  TOYOTA: 'Toyota', HYUNDAI: 'Hyundai', KIA: 'Kia', MAZDA: 'Mazda',
  HONDA: 'Honda', NISSAN: 'Nissan', SUZUKI: 'Suzuki', MITSUBISHI: 'Mitsubishi',
  SUBARU: 'Subaru', VOLKSWAGEN: 'Volkswagen', SKODA: 'Skoda', SEAT: 'Seat',
  AUDI: 'Audi', BMW: 'BMW', MERCEDES: 'Mercedes-Benz', PEUGEOT: 'Peugeot',
  CITROEN: 'Citroen', RENAULT: 'Renault', FIAT: 'Fiat', FORD: 'Ford',
  JEEP: 'Jeep', DACIA: 'Dacia', OPEL: 'Opel', VOLVO: 'Volvo',
  LEXUS: 'Lexus', TESLA: 'Tesla', GEELY: 'Geely', MG: 'MG', MINI: 'Mini',
  ISUZU: 'Isuzu', BYD: 'BYD', MAN: 'MAN', IVECO: 'Iveco',
}

export interface GeminiOcrResult {
  plate: string | null
  manufacturer: string | null
  model: string | null
  year: string | null
  tireSizes: string[]
}

export async function runGeminiOcr(file: File): Promise<GeminiOcrResult> {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_VISION_API_KEY
  if (!apiKey) throw new Error('Missing API key')

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
    console.error('[OCR]', res.status, err)
    throw new Error('OCR service error')
  }

  const json = await res.json()
  const parts: Array<{ text?: string; thought?: boolean }> = json.candidates?.[0]?.content?.parts ?? []
  const fullText = parts.filter(p => !p.thought).map(p => p.text ?? '').join('')
  const start = fullText.indexOf('{')
  const end = fullText.lastIndexOf('}')
  if (start === -1) throw new Error('no JSON in response')

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
    const firstWord = parsed.manufacturer.split(' ')[0].toUpperCase()
    parsed.manufacturer = KNOWN_MAKES[firstWord] ?? parsed.manufacturer.split(' ')[0]
  }

  return {
    plate: (parsed.plate as string) ?? null,
    manufacturer: (parsed.manufacturer as string) ?? null,
    model: (parsed.model as string) ?? null,
    year: (parsed.year as string) ?? null,
    tireSizes: Array.isArray(parsed.tireSizes) ? parsed.tireSizes.filter(Boolean) : [],
  }
}
