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
          .bindPopup(buildPopupHtml(shop), { maxWidth: 260 })

        marker.on('click', () => onSelectShop(shop.id))
        markersRef.current.set(shop.id, marker)
      })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shops])

  useEffect(() => {
    if (!selectedId || !mapRef.current) return
    const marker = markersRef.current.get(selectedId)
    const shop = shops.find((s) => s.id === selectedId)
    if (!marker || !shop) return
    mapRef.current.flyTo([shop.lat, shop.lng], 15, { duration: 0.8 })
    marker.openPopup()
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

function buildPopupHtml(shop: PunctureShop): string {
  const contacts = shop.puncture_contacts ?? []
  const mapsUrl  = shop.google_maps_url ?? `https://www.google.com/maps/search/?api=1&query=${shop.lat},${shop.lng}`
  const address  = [shop.city, shop.address].filter(Boolean).join(', ')

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
          ${c.has_whatsapp ? `<a href="https://wa.me/${toWhatsApp(c.phone)}" target="_blank" style="text-decoration:none;font-size:15px" title="WhatsApp">💬</a>` : ''}
        </div>`).join('')}
    </div>` : (shop.phone ? `
    <div style="margin-top:8px;padding-top:6px;border-top:1px solid #e5e7eb;display:flex;align-items:center;gap:4px">
      <span style="font-size:12px;color:#1f2937;flex:1">${shop.phone}</span>
      <a href="tel:${shop.phone}" style="text-decoration:none;font-size:15px">📞</a>
      <a href="https://wa.me/${toWhatsApp(shop.phone)}" target="_blank" style="text-decoration:none;font-size:15px">💬</a>
    </div>` : '')

  return `<div style="direction:rtl;text-align:right;font-family:system-ui,sans-serif;min-width:210px;max-width:260px">
    <div style="font-weight:700;font-size:14px;color:#111;line-height:1.3">${shop.name}</div>
    ${shop.google_rating ? `<div style="font-size:12px;color:#d97706;margin-top:2px">★ ${shop.google_rating}</div>` : ''}
    ${address ? `<div style="font-size:12px;color:#6b7280;margin-top:3px">${address}</div>` : ''}
    ${hoursHtml}
    ${contactsHtml}
    <div style="margin-top:8px">
      <a href="${mapsUrl}" target="_blank" style="font-size:12px;color:#2563eb;text-decoration:none;font-weight:500">📍 פתח במפות Google</a>
    </div>
  </div>`
}
