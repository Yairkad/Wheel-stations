/**
 * Parses the punctures KML file and outputs a complete SQL seed file
 * with INSERT statements for `punctures` and `puncture_contacts`.
 *
 * Usage: node scripts/kml-to-sql.mjs > supabase/seed_punctures.sql
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { randomUUID } from 'crypto'

const __dirname = dirname(fileURLToPath(import.meta.url))
const kmlPath = resolve(__dirname, '../supabase/punctures_raw.kml')
const kml = readFileSync(kmlPath, 'utf-8')

// ─── helpers ─────────────────────────────────────────────────────────────────

const esc = (s) => s.replace(/'/g, "''")
const sql = (val) => val?.trim() ? `'${esc(val.trim())}'` : 'NULL'

function stripMarks(s) {
  return s.replace(/[\u200f\u200e\u202a\u202c\u200b\u200d]/g, '').trim()
}

function stripHtml(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
}

function parsePlacemarks(xml) {
  const out = []
  const re = /<Placemark>([\s\S]*?)<\/Placemark>/g
  let m
  while ((m = re.exec(xml)) !== null) out.push(m[1])
  return out
}

function getText(block, tag) {
  const re = new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}>([^<]*)<\\/${tag}>`)
  const m = re.exec(block)
  return stripMarks((m?.[1] ?? m?.[2] ?? '').trim())
}

function getCoords(block) {
  const m = /<coordinates>\s*([\d.\-]+),([\d.\-]+)/.exec(block)
  return m ? { lng: parseFloat(m[1]), lat: parseFloat(m[2]) } : null
}

// Remove hour-label prefixes like "שעות פתיחה:", "שעות פעילות ערב ולילה:", etc.
function cleanHours(s) {
  if (!s) return null
  return s
    .replace(/^שעות פעילות (ערב\s+ו?לילה|ערב\/לילה|ערב|לילה)\s*[:：]\s*/i, '')
    .replace(/^שעות פתיחה\s*[:：]\s*/i, '')
    .replace(/^שעות פעילות (סופ["'ש]+\s*)?[:：]\s*/i, '')
    .replace(/^שעות\s*[:：]\s*/i, '')
    .replace(/^פתוח (בערב|בלילה)\s*[:：]\s*/i, '')
    .replace(/^סופ["']ש\s*[:：]\s*/i, '')
    .replace(/^מוצ["'ש]+\s*[:：]?\s*/i, '')
    .replace(/^שבת\s*[:：]\s*/i, '')
    .replace(/^\s*ש\s*[:：]\s*/i, '')
    .replace(/[.،،]+$/, '')
    .trim() || null
}

// ─── Parse contacts ───────────────────────────────────────────────────────────

const PHONE_RE = /0\d[\d\-]{7,9}/g

function parseContacts(lines) {
  const contacts = []
  const seen = new Set()

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line || /^https?:\/\/|שליחת|WhatsApp\s*:/i.test(line)) continue

    const phones = [...line.matchAll(PHONE_RE)].map(m => m[0].replace(/\D/g, ''))
    if (!phones.length) continue

    // Extract name: everything before the phone on the same line
    let name = line.replace(PHONE_RE, '').replace(/[:–\-]\s*$/, '').replace(/^\s*[:–\-]/, '').trim()

    // If empty name, look backward for a standalone name line
    if (!name) {
      for (let j = i - 1; j >= Math.max(0, i - 3); j--) {
        const prev = lines[j]
        if (!prev) continue
        if (/^https?:\/\/|שליחת|WhatsApp|שעות|כתובת/i.test(prev)) break
        if (!prev.match(PHONE_RE) && prev.length < 40) {
          name = prev.replace(/[:–\-]\s*$/, '').trim()
          break
        }
      }
    }

    for (const phone of phones) {
      if (seen.has(phone)) continue
      seen.add(phone)
      // Clean "טלפון - שם" or "טלפון:" patterns → keep only the actual name
      const cleanName = (name || 'טלפון')
        .replace(/^טלפון\s*[-–]\s*/i, '')
        .replace(/^טלפון\s*[:：]\s*/i, '')
        .trim() || 'טלפון'

      contacts.push({
        name: cleanName,
        phone,
        has_whatsapp: true,
      })
    }
  }

  return contacts
}

// ─── Parse hours ──────────────────────────────────────────────────────────────

function parseHours(lines) {
  let regular = null, evening = null, friday = null, saturday = null

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line || line.startsWith('http')) continue

    const isFriday   = /שישי/.test(line) && !/שישי.*שבת|מוצ/.test(line)
    const isSaturday = /מוצ['"ש]|שבת|מוצאי שבת/.test(line) && !/שישי.*שבת/.test(line)
    const isEvening  = /ערב|לילה|24\/7|24\/6|פתוח רצוף/.test(line)
    const timeRe     = /\d+:\d+/

    if (isFriday && !friday) {
      friday = cleanHours(line.replace(/שישי\s*[:：]?\s*/i, '').trim())
    } else if (isSaturday && !saturday) {
      saturday = cleanHours(
        line.replace(/מוצ['"ש]\s*[:：]?\s*/i, '')
            .replace(/שבת\s*[:：]?\s*/i, '')
            .replace(/מוצאי שבת\s*[:：]?\s*/i, '')
            .trim()
      )
    } else if (isEvening && !evening) {
      evening = cleanHours(line)
    } else if (timeRe.test(line) && !isFriday && !isSaturday && !isEvening && !regular) {
      const m = /(\d+:\d+[-–]\d+:\d+)/.exec(line)
      if (m) regular = m[0]
    }
  }

  return { regular, evening, friday, saturday }
}

// ─── Parse city + address ─────────────────────────────────────────────────────

function parseCityAddress(rawName, lines) {
  // Name pattern: "עיר - שם" → extract city from before dash
  const nameCity = /^([^-–]+)[-–]/.exec(rawName)?.[1]?.trim() ?? null

  let city = nameCity
  let address = null

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line || line.startsWith('http')) continue

    if (/^כתובת[:：]/.test(line)) {
      const content = line.replace(/^כתובת[:：]\s*/, '')
      // "עיר, רחוב" or just "רחוב, עיר"
      const parts = content.split(/,\s*/)
      if (parts.length >= 2) {
        // If first part matches the city from the name, treat rest as address
        if (city && parts[0].trim() === city) {
          address = parts.slice(1).join(', ').trim()
        } else {
          city = city || parts[0].trim()
          address = parts.slice(1).join(', ').trim()
        }
      } else {
        address = content.trim()
      }
      break
    }
  }

  // Fallback: first line with a number that looks like a street address
  if (!address) {
    for (const line of lines) {
      const l = line.trim()
      if (!l || l.startsWith('http') || /שעות|טלפון|WhatsApp|שליחת|\d{10}/.test(l)) continue
      if (/\d/.test(l) && l.length < 60 && !/^0\d{9}$/.test(l.replace(/\D/g,''))) {
        // Remove city prefix if present
        address = city ? l.replace(new RegExp(`^${city}[,،،\\s]*`, 'i'), '').trim() : l
        if (!address) address = l
        break
      }
    }
  }

  // Clean up address trailing periods
  if (address) address = address.replace(/\.\s*$/, '').trim()

  return { city: city || null, address: address || rawName }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const placemarks = parsePlacemarks(kml)

const shops = placemarks.map((block) => {
  const rawName = getText(block, 'name')
  const descRaw = getText(block, 'description')
  const descClean = stripHtml(descRaw)
  const lines = descClean.split('\n').map(l => stripMarks(l).trim()).filter(Boolean)
  const coords = getCoords(block)

  const { city, address } = parseCityAddress(rawName, lines)
  const hours = parseHours(lines)
  const contacts = parseContacts(lines)

  const googleMapsMatch = descRaw.match(/https?:\/\/maps\.app\.goo\.gl\/[^\s"<\]]+/)
  const googleMapsUrl = googleMapsMatch ? googleMapsMatch[0] : null

  return {
    id: randomUUID(),
    rawName,
    city,
    address,
    hours,
    contacts,
    coords,
    googleMapsUrl,
  }
})

// ─── Output SQL ───────────────────────────────────────────────────────────────

const lines = [
  '-- Auto-generated from KML export — punctures + contacts seed',
  '-- Run in Supabase SQL Editor',
  '',
  'BEGIN;',
  '',
]

// Shops
lines.push('-- ── Puncture shops ─────────────────────────────────────────────────────')
lines.push('')
for (const s of shops) {
  if (!s.coords) {
    lines.push(`-- SKIPPED (no coords): ${s.rawName}`)
    continue
  }
  const h = s.hours
  lines.push(
    `INSERT INTO punctures (id, name, city, address, hours_regular, hours_evening, hours_friday, hours_saturday, google_maps_url, lat, lng)`,
    `VALUES (`,
    `  '${s.id}',`,
    `  ${sql(s.rawName)},`,
    `  ${sql(s.city)},`,
    `  ${sql(s.address)},`,
    `  ${sql(h.regular)},`,
    `  ${sql(h.evening)},`,
    `  ${sql(h.friday)},`,
    `  ${sql(h.saturday)},`,
    `  ${sql(s.googleMapsUrl)},`,
    `  ${s.coords.lat},`,
    `  ${s.coords.lng}`,
    `);`,
    '',
  )
}

// Contacts
lines.push('-- ── Contacts ────────────────────────────────────────────────────────────')
lines.push('')
for (const s of shops) {
  if (!s.coords || s.contacts.length === 0) continue
  for (let i = 0; i < s.contacts.length; i++) {
    const c = s.contacts[i]
    lines.push(
      `INSERT INTO puncture_contacts (puncture_id, name, phone, has_whatsapp, sort_order)`,
      `VALUES ('${s.id}', ${sql(c.name)}, ${sql(c.phone)}, ${c.has_whatsapp}, ${i});`,
    )
  }
  lines.push('')
}

lines.push('COMMIT;')

process.stdout.write(lines.join('\n') + '\n')
