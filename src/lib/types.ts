/**
 * Shared TypeScript interfaces used across pages
 */

export interface Station {
  id: string
  name: string
  address: string
  city_id: string
  district: string | null
  is_coming_soon?: boolean
  cities: { name: string } | null
  wheel_station_managers: Manager[]
  totalWheels: number
  availableWheels: number
  takenWheels: number
  inactiveWheels: number
}

export interface Manager {
  id: string
  full_name: string
  phone: string
  role: string
  is_primary: boolean
}

// Shared "shared vehicle search history" shapes — used by both /search and
// /operator, which both read/write the same vehicle_search_history table
// (api/vehicle-search-history) so a search saved from either page shows up
// for everyone regardless of which page they're on.
export interface VehicleSearchResult {
  vehicle: {
    manufacturer: string
    model: string
    model_name?: string
    year: number
    color?: string
    front_tire: string | null
    import_type?: string
    origin_country?: string
  }
  wheel_fitment: {
    pcd: string
    bolt_count: number
    bolt_spacing: number
    center_bore?: number | null
    source_url?: string | null
  } | null
  source?: string
  is_personal_import?: boolean
  personal_import_warning?: string
}

export interface VehicleHistoryItem {
  id: string
  plate: string
  displayName: string
  year: number
  pinned: boolean
  searchedBy: string | null
  searchedAt: string
  vehicleResult: VehicleSearchResult
}

export interface SearchResult {
  station: {
    id: string
    name: string
    address: string
    city: string | null
    district: string | null
  }
  wheels: {
    id: string
    wheel_number: string
    rim_size: string
    bolt_count: number
    bolt_spacing: number
    center_bore?: number | null
    tire_size?: string | null
    is_donut: boolean
    is_available: boolean
    temporarily_unavailable?: boolean
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

export interface RoleResult {
  role: 'station_manager' | 'operator' | 'district_manager' | 'editor' | 'admin'
  label: 'מנהל תחנה' | 'מוקדן' | 'מנהל מוקד' | 'מנהל מחוז' | 'עורך' | 'ניהול מערכת'
  data: Record<string, unknown>
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
