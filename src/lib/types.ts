/**
 * Shared TypeScript interfaces used across pages
 */

export interface Station {
  id: string
  name: string
  address: string
  city_id: string
  district: string | null
  cities: { name: string } | null
  wheel_station_managers: Manager[]
  totalWheels: number
  availableWheels: number
}

export interface Manager {
  id: string
  full_name: string
  phone: string
  role: string
  is_primary: boolean
}

export interface SearchResult {
  station: {
    id: string
    name: string
    address: string
    city: string | null
  }
  wheels: {
    id: string
    wheel_number: string
    rim_size: string
    bolt_count: number
    bolt_spacing: number
    center_bore?: number | null
    is_donut: boolean
    is_available: boolean
  }[]
  availableCount: number
  totalCount: number
}

export interface FilterOptions {
  rim_sizes: string[]
  bolt_counts: number[]
  bolt_spacings: number[]
  center_bores?: number[]
}

export interface VehicleModelRecord {
  id: string
  make: string
  make_he?: string | null
  model: string
  variants?: string | null
  year_from?: number | null
  year_to?: number | null
  bolt_count: number
  bolt_spacing: number
  center_bore?: number | null
  rim_size?: string | null
  rim_sizes_allowed?: number[] | null
  tire_size_front?: string | null
  source_url?: string | null
  source?: string | null
}
