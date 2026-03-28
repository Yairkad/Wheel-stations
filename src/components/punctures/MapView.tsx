'use client'

import { useEffect, useRef } from 'react'
import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet'

export interface PunctureContact {
  id: string
  name: string
  phone: string
  has_whatsapp: boolean
  sort_order: number
}

export interface PunctureShop {
  id: string
  name: string
  address: string
  city?: string | null
  phone?: string | null          // legacy field (pre-v2 schema)
  hours?: string | null          // legacy field (pre-v2 schema)
  hours_regular?: string | null
  hours_evening?: string | null
  hours_friday?: string | null
  hours_saturday?: string | null
  lat: number
  lng: number
  notes?: string | null
  website?: string | null
  google_maps_url?: string | null
  google_rating?: number | null
  puncture_contacts?: PunctureContact[]
  distance_km?: number
}

interface MapViewProps {
  shops: PunctureShop[]
  selectedId: string | null
  onSelectShop: (id: string) => void
}

const DEFAULT_CENTER: [number, number] = [31.5, 34.9]
const DEFAULT_ZOOM = 8

export default function MapView({ shops, selectedId, onSelectShop }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const markersRef = useRef<Map<string, LeafletMarker>>(new Map())

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    import('leaflet').then((L) => {
      if (!containerRef.current || mapRef.current) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(containerRef.current!).setView(DEFAULT_CENTER, DEFAULT_ZOOM)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(map)

      mapRef.current = map
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
      markersRef.current.clear()
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current) return

    import('leaflet').then((L) => {
      const map = mapRef.current
      if (!map) return

      const currentIds = new Set(shops.map((s) => s.id))
      markersRef.current.forEach((marker, id) => {
        if (!currentIds.has(id)) {
          marker.remove()
          markersRef.current.delete(id)
        }
      })

      shops.forEach((shop) => {
        if (markersRef.current.has(shop.id)) {
          markersRef.current.get(shop.id)!.setPopupContent(buildPopupHtml(shop))
          return
        }
        const marker = L.marker([shop.lat, shop.lng])
          .addTo(map)
          .bindPopup(buildPopupHtml(shop), {
            maxWidth: 280,
            autoPanPadding: [60, 80],   // keep popup away from edges
            keepInView: true,
          })

        marker.on('click', () => onSelectShop(shop.id))
        markersRef.current.set(shop.id, marker)
      })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shops])

  useEffect(() => {
    if (!selectedId || !mapRef.current) return
    const marker = markersRef.current.get(selectedId)
    const shop   = shops.find((s) => s.id === selectedId)
    if (!marker || !shop) return

    const map = mapRef.current
    // Pan first, open popup after animation completes so the popup stays centered
    map.once('moveend', () => marker.openPopup())
    map.flyTo([shop.lat, shop.lng], Math.max(map.getZoom(), 14), { duration: 0.6 })
  }, [selectedId, shops])

  return (
    <div ref={containerRef} className="w-full h-full rounded-lg" style={{ minHeight: '400px' }} />
  )
}

function toWhatsApp(phone: string): string {
  const d = phone.replace(/\D/g, '')
  if (d.startsWith('972')) return d
  if (d.startsWith('0')) return '972' + d.slice(1)
  return '972' + d
}

const WA_SVG = `<svg viewBox="0 0 24 24" width="14" height="14" fill="#25D366" style="vertical-align:middle;flex-shrink:0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`

function buildShareText(shop: PunctureShop): string {
  const address = [shop.city, shop.address].filter(Boolean).join(', ')
  const lines: string[] = [`🔧 ${shop.name}`]
  if (address) lines.push(`📍 ${address}`)
  if (shop.hours_regular)  lines.push(`א׳–ה׳: ${shop.hours_regular}`)
  if (shop.hours_evening)  lines.push(`ערב/לילה: ${shop.hours_evening}`)
  if (shop.hours_friday)   lines.push(`שישי: ${shop.hours_friday}`)
  if (shop.hours_saturday) lines.push(`מוצש: ${shop.hours_saturday}`)
  if (!shop.hours_regular && shop.hours) lines.push(shop.hours)
  const contacts = shop.puncture_contacts ?? []
  if (contacts.length > 0) {
    lines.push('')
    contacts.forEach(c => lines.push(`${c.name}: ${c.phone}`))
  } else if (shop.phone) {
    lines.push(shop.phone)
  }
  return lines.join('\n')
}

function buildPopupHtml(shop: PunctureShop): string {
  const contacts  = shop.puncture_contacts ?? []
  const mapsUrl   = shop.google_maps_url ?? `https://www.google.com/maps/search/?api=1&query=${shop.lat},${shop.lng}`
  const wazeUrl   = `https://waze.com/ul?ll=${shop.lat},${shop.lng}&navigate=yes`
  const shareUrl  = `https://wa.me/?text=${encodeURIComponent(buildShareText(shop))}`
  const address   = [shop.city, shop.address].filter(Boolean).join(', ')

  const hasHours = shop.hours_regular || shop.hours_evening || shop.hours_friday || shop.hours_saturday || shop.hours
  const hoursHtml = hasHours ? `
    <div style="margin-top:6px;font-size:12px;color:#555;line-height:1.7">
      ${shop.hours_regular  ? `<div>א׳–ה׳: ${shop.hours_regular}</div>` : ''}
      ${shop.hours_evening  ? `<div>ערב/לילה: ${shop.hours_evening}</div>` : ''}
      ${shop.hours_friday   ? `<div>שישי: ${shop.hours_friday}</div>` : ''}
      ${shop.hours_saturday ? `<div>מוצש: ${shop.hours_saturday}</div>` : ''}
      ${(!shop.hours_regular && shop.hours) ? `<div>${shop.hours}</div>` : ''}
    </div>` : ''

  const contactsHtml = contacts.length > 0 ? `
    <div style="margin-top:8px;padding-top:6px;border-top:1px solid #e5e7eb">
      ${contacts.map(c => `
        <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px">
          <span style="font-size:12px;color:#1f2937;flex:1"><b>${c.name}</b>: ${c.phone}</span>
          <a href="tel:${c.phone}" style="text-decoration:none;font-size:15px" title="התקשר">📞</a>
          ${c.has_whatsapp ? `<a href="https://wa.me/${toWhatsApp(c.phone)}" target="_blank" style="text-decoration:none;display:inline-flex;align-items:center" title="WhatsApp">${WA_SVG}</a>` : ''}
        </div>`).join('')}
    </div>` : (shop.phone ? `
    <div style="margin-top:8px;padding-top:6px;border-top:1px solid #e5e7eb;display:flex;align-items:center;gap:4px">
      <span style="font-size:12px;color:#1f2937;flex:1">${shop.phone}</span>
      <a href="tel:${shop.phone}" style="text-decoration:none;font-size:15px">📞</a>
      <a href="https://wa.me/${toWhatsApp(shop.phone)}" target="_blank" style="text-decoration:none;display:inline-flex;align-items:center" title="WhatsApp">${WA_SVG}</a>
    </div>` : '')

  return `<div style="direction:rtl;text-align:right;font-family:system-ui,sans-serif;min-width:210px;max-width:260px">
    <div style="font-weight:700;font-size:14px;color:#111;line-height:1.3">${shop.name}</div>
    ${shop.google_rating ? `<div style="font-size:12px;color:#d97706;margin-top:2px">★ ${shop.google_rating}</div>` : ''}
    ${address ? `<div style="font-size:12px;color:#6b7280;margin-top:3px">${address}</div>` : ''}
    ${hoursHtml}
    ${contactsHtml}
    <div style="margin-top:8px;display:flex;gap:10px;flex-wrap:wrap;align-items:center">
      <a href="${mapsUrl}" target="_blank" style="font-size:12px;color:#2563eb;text-decoration:none;font-weight:500">📍 Google Maps</a>
      <a href="${wazeUrl}" target="_blank" style="font-size:12px;color:#05c8f0;text-decoration:none;font-weight:500">🗺 Waze</a>
      <a href="${shareUrl}" target="_blank" style="font-size:12px;color:#25D366;text-decoration:none;font-weight:500;display:inline-flex;align-items:center;gap:3px">${WA_SVG} שתף</a>
    </div>
  </div>`
}
