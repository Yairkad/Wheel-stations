/**
 * Client helper for wheel-search demand logging.
 * Appends log_* params to a /api/wheel-stations/search request so the server records
 * the search (and which stations had a match) in wheel_search_log. Only operator and
 * station-manager searches are logged — public/anonymous searches are not.
 */

export type SearchLogType = 'plate' | 'model' | 'spec'

export interface SearchLogVehicle {
  plate?: string | null
  manufacturer?: string | null
  model?: string | null
  year?: number | null
  rim_size?: string | null
  center_bore?: number | null
}

type SearchLogSource = { source: 'operator' | 'manager'; by: string }

function readSource(explicit?: 'operator' | 'manager'): SearchLogSource | null {
  if (typeof window === 'undefined') return null
  try {
    const op = localStorage.getItem('operator_session')
    if (explicit !== 'manager' && op) {
      const d = JSON.parse(op)
      return { source: 'operator', by: d.user?.full_name || d.operator?.full_name || '' }
    }
    if (explicit === 'operator') return null
    const key = Object.keys(localStorage).find(k => k.startsWith('station_session_'))
    if (key) {
      const d = JSON.parse(localStorage.getItem(key) || '{}')
      return { source: 'manager', by: d.manager?.full_name || '' }
    }
  } catch {}
  return null
}

export function appendSearchLogParams(
  params: URLSearchParams,
  type: SearchLogType,
  vehicle: SearchLogVehicle = {},
  source?: 'operator' | 'manager'
): URLSearchParams {
  const s = readSource(source)
  if (!s) return params
  params.set('log_source', s.source)
  params.set('log_type', type)
  if (s.by) params.set('log_by', s.by)
  if (vehicle.plate) params.set('log_plate', vehicle.plate)
  if (vehicle.manufacturer) params.set('log_make', vehicle.manufacturer)
  if (vehicle.model) params.set('log_model', vehicle.model)
  if (vehicle.year) params.set('log_year', String(vehicle.year))
  if (vehicle.rim_size) params.set('log_rim', vehicle.rim_size)
  if (vehicle.center_bore) params.set('log_cb', String(vehicle.center_bore))
  return params
}
