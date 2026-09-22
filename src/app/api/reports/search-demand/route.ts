/**
 * Wheel search demand report
 * GET /api/reports/search-demand?station_id=&from=YYYY-MM-DD&to=YYYY-MM-DD
 *
 * Two data sources:
 *  1. wheel_search_log — every operator/manager search, with which stations had a
 *     matching wheel (any status) and which had one available at that moment.
 *  2. vehicle_search_history — older plate searches (one row per plate, last search
 *     time only). Checked against TODAY's inventory, so it shows current gaps but not
 *     what was available at search time.
 *
 * Per search, status for a station: 'available' (had a lendable wheel), 'unavailable'
 * (had a matching wheel but it was borrowed / temporarily unavailable), 'none' (no
 * matching wheel at all — a real inventory gap). Without station_id, the network as
 * a whole is evaluated (any station).
 *
 * Auth: admin session, or a station-manager session for the requested station_id.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { validateAdminSession } from '@/lib/admin-auth'
import { verifyStationManagerSession } from '@/lib/station-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type Status = 'available' | 'unavailable' | 'none'

interface LogRow {
  id: string
  created_at: string
  source: 'operator' | 'manager'
  search_type: string
  searched_by: string | null
  plate: string | null
  manufacturer: string | null
  model: string | null
  year: number | null
  bolt_count: number | null
  bolt_spacing: number | null
  center_bore: number | null
  rim_size: string | null
  stations_with_match: string[] | null
  stations_with_available: string[] | null
}

interface HistoryRow {
  plate: string
  display_name: string
  year: number | null
  searched_at: string
  searched_by: string | null
  vehicle_result: {
    vehicle?: { manufacturer?: string; model?: string; front_tire?: string | null }
    wheel_fitment?: { bolt_count?: number; bolt_spacing?: number; center_bore?: number | null } | null
  } | null
}

interface WheelRow {
  station_id: string
  bolt_count: number
  bolt_spacing: number
  extra_bolt_spacings: number[] | null
  is_available: boolean
  temporarily_unavailable: boolean | null
}

const specLabel = (bc: number | null, bs: number | null) =>
  bc && bs ? `${bc}x${bs}` : bs ? `?x${bs}` : bc ? `${bc}x?` : 'לא ידוע'

const vehicleLabel = (make: string | null | undefined, model: string | null | undefined, year?: number | null) =>
  [make, model].filter(Boolean).join(' ').trim() + (year ? ` ${year}` : '') || 'לא צוין רכב'

function topCounts<T extends string>(items: T[], limit = 10) {
  const map = new Map<string, number>()
  items.forEach(i => map.set(i, (map.get(i) || 0) + 1))
  return [...map.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count).slice(0, limit)
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const stationId = searchParams.get('station_id') || null
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  const isAdmin = await validateAdminSession(request)
  if (!isAdmin) {
    if (!stationId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const auth = await verifyStationManagerSession(request, stationId)
    if (!auth.success) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 })
  }

  const fromISO = from ? new Date(`${from}T00:00:00`).toISOString() : null
  const toISO = to ? new Date(`${to}T23:59:59.999`).toISOString() : null

  // ---- 1. Live search log ----
  let logQuery = supabase
    .from('wheel_search_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5000)
  if (fromISO) logQuery = logQuery.gte('created_at', fromISO)
  if (toISO) logQuery = logQuery.lte('created_at', toISO)
  const { data: logData, error: logError } = await logQuery
  const logAvailable = !logError
  const logs = (logData || []) as LogRow[]

  const { data: stationsData } = await supabase.from('wheel_stations').select('id, name').eq('is_active', true)
  const stationNames = new Map((stationsData || []).map((s: { id: string; name: string }) => [s.id, s.name]))

  const statusFor = (r: LogRow, sid: string | null): Status => {
    const avail = r.stations_with_available || []
    const match = r.stations_with_match || []
    if (sid) return avail.includes(sid) ? 'available' : match.includes(sid) ? 'unavailable' : 'none'
    return avail.length ? 'available' : match.length ? 'unavailable' : 'none'
  }

  const evaluated = logs.map(r => ({ row: r, status: statusFor(r, stationId) }))
  const counts = { total: evaluated.length, available: 0, unavailable: 0, none: 0 }
  evaluated.forEach(e => { counts[e.status]++ })

  const noneRows = evaluated.filter(e => e.status === 'none').map(e => e.row)
  const unavailableRows = evaluated.filter(e => e.status === 'unavailable').map(e => e.row)

  const cases = evaluated
    .filter(e => e.status !== 'available')
    .slice(0, 1000)
    .map(({ row: r, status }) => ({
      id: r.id,
      created_at: r.created_at,
      status,
      source: r.source,
      search_type: r.search_type,
      searched_by: r.searched_by,
      plate: r.plate,
      vehicle: vehicleLabel(r.manufacturer, r.model, r.year),
      spec: specLabel(r.bolt_count, r.bolt_spacing),
      center_bore: r.center_bore,
      rim_size: r.rim_size,
      // Network view: which other stations could have served it
      available_at: (r.stations_with_available || []).filter(id => id !== stationId).map(id => stationNames.get(id) || '').filter(Boolean),
    }))

  // Admin network view: per-station breakdown (each search counts for every station)
  const perStation = !stationId
    ? [...stationNames.entries()].map(([id, name]) => {
        const c = { available: 0, unavailable: 0, none: 0 }
        logs.forEach(r => { c[statusFor(r, id)]++ })
        return { station_id: id, name, ...c }
      }).sort((a, b) => b.none - a.none)
    : []

  // ---- 2. Older plate-search history vs today's inventory ----
  let histQuery = supabase
    .from('vehicle_search_history')
    .select('plate, display_name, year, searched_at, searched_by, vehicle_result')
    .order('searched_at', { ascending: false })
    .limit(3000)
  if (fromISO) histQuery = histQuery.gte('searched_at', fromISO)
  if (toISO) histQuery = histQuery.lte('searched_at', toISO)
  const [{ data: histData }, { data: wheelsData }] = await Promise.all([
    histQuery,
    (() => {
      let q = supabase
        .from('wheels')
        .select('station_id, bolt_count, bolt_spacing, extra_bolt_spacings, is_available, temporarily_unavailable')
        .is('deleted_at', null)
        .eq('pending_donation', false)
      if (stationId) q = q.eq('station_id', stationId)
      else q = q.in('station_id', [...stationNames.keys()])
      return q
    })(),
  ])

  const wheels = (wheelsData || []) as WheelRow[]
  const inventoryStatus = (bc: number, bs: number): Status => {
    const matching = wheels.filter(w =>
      w.bolt_count === bc && (Number(w.bolt_spacing) === bs || (w.extra_bolt_spacings || []).map(Number).includes(bs))
    )
    if (!matching.length) return 'none'
    return matching.some(w => w.is_available && !w.temporarily_unavailable) ? 'available' : 'unavailable'
  }

  const history = ((histData || []) as HistoryRow[])
    .filter(h => h.vehicle_result?.wheel_fitment?.bolt_count && h.vehicle_result?.wheel_fitment?.bolt_spacing)
    .map(h => {
      const f = h.vehicle_result!.wheel_fitment!
      const bc = Number(f.bolt_count)
      const bs = Number(f.bolt_spacing)
      return {
        plate: h.plate,
        vehicle: h.display_name || vehicleLabel(h.vehicle_result?.vehicle?.manufacturer, h.vehicle_result?.vehicle?.model, h.year),
        spec: specLabel(bc, bs),
        center_bore: f.center_bore ?? null,
        searched_at: h.searched_at,
        searched_by: h.searched_by,
        status: inventoryStatus(bc, bs),
      }
    })

  const historyCounts = { total: history.length, available: 0, unavailable: 0, none: 0 }
  history.forEach(h => { historyCounts[h.status]++ })
  const historyMissing = history.filter(h => h.status === 'none')

  return NextResponse.json({
    logAvailable,
    counts,
    topMissingSpecs: topCounts(noneRows.map(r => specLabel(r.bolt_count, r.bolt_spacing))),
    topMissingVehicles: topCounts(noneRows.filter(r => r.manufacturer || r.model).map(r => vehicleLabel(r.manufacturer, r.model))),
    topUnavailableSpecs: topCounts(unavailableRows.map(r => specLabel(r.bolt_count, r.bolt_spacing))),
    cases,
    perStation,
    history: {
      counts: historyCounts,
      topMissingSpecs: topCounts(historyMissing.map(h => h.spec)),
      items: history.filter(h => h.status !== 'available'),
    },
  })
}
