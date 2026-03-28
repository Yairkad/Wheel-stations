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
  const mapsUrl =
    shop.google_maps_url ?? `https://www.google.com/maps/search/?api=1&query=${shop.lat},${shop.lng}`

  const contactsHtml = contacts
    .map(
      (c) => `
      <div style="display:flex;align-items:center;gap:6px;margin-top:4px">
        <span style="font-size:12px;color:#333">${c.name}: ${c.phone}</span>
        <a href="tel:${c.phone}" title="התקשר" style="font-size:14px;text-decoration:none">📞</a>
        ${c.has_whatsapp ? `<a href="https://wa.me/${toWhatsApp(c.phone)}" target="_blank" title="WhatsApp" style="font-size:14px;text-decoration:none">💬</a>` : ''}
      </div>`
    )
    .join('')

  const hoursRows = [
    shop.hours_regular && `<div>א'–ה': ${shop.hours_regular}</div>`,
    shop.hours_evening && `<div>ערב/לילה: ${shop.hours_evening}</div>`,
    shop.hours_friday && `<div>שישי: ${shop.hours_friday}</div>`,
    shop.hours_saturday && `<div>מוצש: ${shop.hours_saturday}</div>`,
  ]
    .filter(Boolean)
    .join('')

  return `
    <div dir="rtl" style="min-width:200px;font-family:inherit;font-size:13px">
      <strong style="font-size:14px">${shop.name}</strong>
      ${shop.google_rating ? `<span style="color:#f59e0b;margin-right:6px">★ ${shop.google_rating}</span>` : ''}
      <div style="color:#555;margin-top:3px">${shop.city ? shop.city + ', ' : ''}${shop.address}</div>
      ${hoursRows ? `<div style="margin-top:6px;color:#444;line-height:1.6">${hoursRows}</div>` : ''}
      ${contactsHtml ? `<div style="margin-top:6px;border-top:1px solid #eee;padding-top:6px">${contactsHtml}</div>` : ''}
      <div style="margin-top:8px">
        <a href="${mapsUrl}" target="_blank" style="font-size:12px;color:#1d4ed8;text-decoration:none">📍 פתח במפות Google</a>
      </div>
    </div>
  `
}
