'use client'

import { useEffect, useRef } from 'react'
import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet'

export interface PunctureShop {
  id: string
  name: string
  address: string
  phone?: string | null
  hours?: string | null
  lat: number
  lng: number
  notes?: string | null
  distance_km?: number
}

interface MapViewProps {
  shops: PunctureShop[]
  selectedId: string | null
  onSelectShop: (id: string) => void
}

// Default center: Israel
const DEFAULT_CENTER: [number, number] = [31.5, 34.9]
const DEFAULT_ZOOM = 8

export default function MapView({ shops, selectedId, onSelectShop }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const markersRef = useRef<Map<string, LeafletMarker>>(new Map())

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    // Leaflet CSS — loaded once
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    import('leaflet').then((L) => {
      if (!containerRef.current || mapRef.current) return

      // Fix default marker icon paths broken by webpack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(containerRef.current!).setView(DEFAULT_CENTER, DEFAULT_ZOOM)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      mapRef.current = map
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
      markersRef.current.clear()
    }
  }, [])

  // Sync markers when shops change
  useEffect(() => {
    if (!mapRef.current) return

    import('leaflet').then((L) => {
      const map = mapRef.current
      if (!map) return

      const currentIds = new Set(shops.map((s) => s.id))

      // Remove markers no longer in shops
      markersRef.current.forEach((marker, id) => {
        if (!currentIds.has(id)) {
          marker.remove()
          markersRef.current.delete(id)
        }
      })

      // Add new markers
      shops.forEach((shop) => {
        if (markersRef.current.has(shop.id)) return

        const marker = L.marker([shop.lat, shop.lng])
          .addTo(map)
          .bindPopup(buildPopupHtml(shop))

        marker.on('click', () => onSelectShop(shop.id))
        markersRef.current.set(shop.id, marker)
      })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shops])

  // Pan & open popup when selected shop changes
  useEffect(() => {
    if (!selectedId || !mapRef.current) return

    const marker = markersRef.current.get(selectedId)
    const shop = shops.find((s) => s.id === selectedId)
    if (!marker || !shop) return

    mapRef.current.flyTo([shop.lat, shop.lng], 15, { duration: 0.8 })
    marker.openPopup()
  }, [selectedId, shops])

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-lg"
      style={{ minHeight: '400px' }}
    />
  )
}

function buildPopupHtml(shop: PunctureShop): string {
  return `
    <div dir="rtl" style="min-width:180px;font-family:inherit">
      <strong style="font-size:14px">${shop.name}</strong>
      <div style="margin-top:4px;color:#555;font-size:13px">${shop.address}</div>
      ${shop.phone ? `<div style="margin-top:4px;font-size:13px">📞 <a href="tel:${shop.phone}">${shop.phone}</a></div>` : ''}
      ${shop.hours ? `<div style="margin-top:4px;font-size:13px">🕐 ${shop.hours}</div>` : ''}
      ${shop.notes ? `<div style="margin-top:4px;font-size:12px;color:#777">${shop.notes}</div>` : ''}
    </div>
  `
}
