import { hebrewToEnglishMakes, hebrewToEnglishModels, modelToMake, extractRimSize } from './vehicle-mappings'

export interface OcrVehicleData {
  tireSizes: string[]
  rimSize: number | null
  manufacturer: string | null
  model: string | null
  year: string | null
  plate: string | null
}

export interface OcrProgress {
  status: string
  progress: number
  isDownloading: boolean
}

export async function extractVehicleDataFromImage(
  file: File,
  onProgress?: (p: OcrProgress) => void
): Promise<OcrVehicleData> {
  const Tesseract = (await import('tesseract.js')).default

  const { data } = await Tesseract.recognize(file, 'heb+eng', {
    logger: (m: { status: string; progress: number }) => {
      if (onProgress && typeof m.progress === 'number') {
        onProgress({
          status: m.status,
          progress: m.progress,
          isDownloading: m.status.includes('traineddata') || m.status.includes('loading tesseract core')
        })
      }
    }
  })

  const rawText = data.text ?? ''
  // Exclude renewal receipt section (חידוש רישיון) that appears below main registration
  // and can confuse plate/year extraction with unrelated dates and numbers
  const renewalIdx = rawText.search(/חידוש\s+רישיון/)
  const text        = renewalIdx > 0 ? rawText.slice(0, renewalIdx) : rawText
  const model       = extractModel(text)
  let manufacturer  = extractManufacturer(text)
  // If manufacturer not found directly, infer from the model name (e.g. Rio → Kia)
  if (!manufacturer && model) manufacturer = modelToMake[model] || null
  return {
    plate:        extractPlate(text),
    tireSizes:    extractTireSizes(text),
    rimSize:      extractRimSize(extractTireSizes(text)[0] ?? null),
    manufacturer,
    model,
    year:         extractYear(text),
  }
}

// ─── Plate ───────────────────────────────────────────────────────────────────
// Israeli registration: "מספר רכב ✓" label, then the 7-8 digit number
function extractPlate(text: string): string | null {
  // 1. After "רישיון רכב" header — plate is the first 7-8 digit number in the top section
  const headerIdx = text.search(/רישיון\s+רכב/)
  if (headerIdx !== -1) {
    const headerWindow = text.slice(headerIdx, headerIdx + 200)
    const hm = headerWindow.match(/(?<!\d)(\d{7,8})(?!\d)/)
    if (hm) return hm[1]
  }
  // 2. Look near "מספר רכב" label (within next 60 chars)
  const labelIdx = text.indexOf('מספר רכב')
  if (labelIdx !== -1) {
    const window = text.slice(labelIdx, labelIdx + 60)
    const m = window.match(/(\d{7,8})/)
    if (m) return m[1]
  }
  // 3. Dashed plate: 12-345-67 or 123-45-678
  const dashed = text.match(/\b(\d{2,3}-\d{2,3}-\d{2,3})\b/)
  if (dashed) {
    const cleaned = dashed[1].replace(/-/g, '')
    if (cleaned.length >= 7 && cleaned.length <= 8) return cleaned
  }
  // 4. Fallback: any standalone 7-8 digit number
  const m = text.match(/(?<!\d)(\d{7,8})(?!\d)/)
  return m ? m[1] : null
}

// ─── Tire sizes ───────────────────────────────────────────────────────────────
// Handles:
//   Standard:    215/55R17  or  215/55R17 91H
//   Israeli doc: R17 94 V 215/55  (rim first, then load/speed, then width/ratio)
//   Truck:       21575R175  (215/75R17.5) — detected but excluded (not usable for passenger wheel search)
function extractTireSizes(text: string): string[] {
  const results: string[] = []
  const seen = new Set<string>()

  const add = (w: string, ar: string, rim: string) => {
    // Skip truck tires (rim > 20" usually trucks, or half-inch rims like 17.5)
    const rimNum = parseFloat(rim)
    if (rimNum > 22 || rim.includes('.')) return
    const norm = `${w}/${ar}R${rim}`
    if (!seen.has(norm)) { seen.add(norm); results.push(norm) }
  }

  let m: RegExpExecArray | null

  // Standard: 215/55R17 (with optional load/speed like 91H)
  const std = /\b(\d{2,3})\/(\d{2,3})\s*[Rr]\s*(\d{1,2}(?:\.\d)?)\b/g
  while ((m = std.exec(text)) !== null) add(m[1], m[2], m[3])

  // Israeli doc reversed: R17 94 V 215/55
  const il = /[Rr](\d{1,2})\s+\d{1,3}\s*[A-Za-z]\s+(\d{2,3})\/(\d{2,3})\b/g
  while ((m = il.exec(text)) !== null) add(m[2], m[3], m[1])

  // Looser reversed: R17 ... 215/55
  const loose = /[Rr](\d{1,2})[^\d\/]{0,15}(\d{2,3})\/(\d{2,3})\b/g
  while ((m = loose.exec(text)) !== null) add(m[2], m[3], m[1])

  return results
}

// ─── Manufacturer ─────────────────────────────────────────────────────────────
function extractManufacturer(text: string): string | null {
  // Look near "יצרן" label first
  const labelIdx = text.indexOf('יצרן')
  if (labelIdx !== -1) {
    const window = text.slice(labelIdx, labelIdx + 30)
    for (const [heb, eng] of Object.entries(hebrewToEnglishMakes)) {
      if (window.includes(heb)) return eng
    }
  }
  for (const [heb, eng] of Object.entries(hebrewToEnglishMakes)) {
    if (text.includes(heb)) return eng
  }
  const upper = text.toUpperCase()
  for (const eng of Object.values(hebrewToEnglishMakes)) {
    if (upper.includes(eng.toUpperCase())) return eng
  }
  return null
}

// ─── Model ────────────────────────────────────────────────────────────────────
function extractModel(text: string): string | null {
  for (const [heb, eng] of Object.entries(hebrewToEnglishModels)) {
    if (text.includes(heb)) return eng
  }
  const upper = text.toUpperCase()
  // Sort longer model names first to avoid partial matches (e.g. "KAROQ FL" before "KAROQ")
  const models = Object.keys(modelToMake).sort((a, b) => b.length - a.length)
  for (const model of models) {
    if (upper.includes(model.toUpperCase())) return model
  }
  return null
}

// ─── Year ─────────────────────────────────────────────────────────────────────
function extractYear(text: string): string | null {
  // "מועד עליה לכביש 01/2013" — most reliable Israeli registration field
  const aliya = text.match(/(?:עליה\s+לכביש|הרשמה\s+ראשונה)[^\n]{0,15}\d{1,2}\/((19|20)\d{2})/)
  if (aliya) return aliya[1]
  // General label: allow any chars between label and year (not just non-digits)
  const nearLabel = text.match(/(?:שנת|כביש).{0,30}((?:19|20)\d{2})/)
  if (nearLabel) return nearLabel[1]
  // MM/YYYY format (common in Israeli docs)
  const mmyyyy = text.match(/\d{2}\/((19|20)\d{2})/)
  if (mmyyyy) return mmyyyy[1]
  const m = text.match(/\b((19|20)\d{2})\b/)
  return m ? m[1] : null
}
