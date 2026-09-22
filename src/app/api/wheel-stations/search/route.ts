/**
 * Global Wheel Search API
 * GET /api/wheel-stations/search - Search wheels across all stations
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const rim_size = searchParams.get('rim_size')
    const bolt_count = searchParams.get('bolt_count')
    const bolt_spacing = searchParams.get('bolt_spacing')
    const center_bore = searchParams.get('center_bore')
    const district = searchParams.get('district')
    const available_only = searchParams.get('available_only') === 'true'

    // First get active stations (optionally filtered by district)
    let stationsQuery = supabase
      .from('wheel_stations')
      .select('id, name, address, district, city_id, cities (name)')
      .eq('is_active', true)

    if (district) {
      stationsQuery = stationsQuery.eq('district', district)
    }

    const { data: activeStations, error: stationsError } = await stationsQuery

    if (stationsError) {
      console.error('Error fetching stations:', stationsError)
      return NextResponse.json({ error: 'Failed to search wheels' }, { status: 500 })
    }

    const activeStationIds = activeStations?.map(s => s.id) || []

    if (activeStationIds.length === 0) {
      return NextResponse.json({
        results: [],
        totalWheels: 0,
        totalAvailable: 0,
        filterOptions: { rim_sizes: [], bolt_counts: [], bolt_spacings: [], center_bores: [] }
      })
    }

    // Build query for wheels
    // Using select('*') to handle case where center_bore column might not exist yet
    let query = supabase
      .from('wheels')
      .select('*')
      .in('station_id', activeStationIds)
      .is('deleted_at', null)
      .eq('pending_donation', false)

    // Apply filters
    if (rim_size) {
      query = query.eq('rim_size', rim_size)
    }
    if (bolt_count) {
      query = query.eq('bolt_count', parseInt(bolt_count))
    }
    if (bolt_spacing) {
      // Match primary PCD OR any of the extra PCDs (for universal wheels)
      const spacingVal = parseFloat(bolt_spacing)
      query = query.or(`bolt_spacing.eq.${spacingVal},extra_bolt_spacings.cs.{${spacingVal}}`)
    }
    if (center_bore) {
      query = query.eq('center_bore', parseFloat(center_bore))
    }
    if (available_only) {
      query = query.eq('is_available', true)
    }

    const { data: wheels, error } = await query.order('rim_size')

    if (error) {
      console.error('Error searching wheels:', error)
      return NextResponse.json({ error: 'Failed to search wheels' }, { status: 500 })
    }

    // Create station lookup map
    const stationsById = new Map(activeStations?.map(s => [s.id, s]) || [])

    // Group results by station for better display
    const stationMap = new Map<string, {
      station: {
        id: string
        name: string
        address: string
        city: string | null
        district: string | null
      }
      wheels: typeof wheels
      availableCount: number
      totalCount: number
    }>()

    wheels?.forEach(wheel => {
      const stationData = stationsById.get(wheel.station_id)
      if (!stationData) return

      if (!stationMap.has(wheel.station_id)) {
        stationMap.set(wheel.station_id, {
          station: {
            id: stationData.id,
            name: stationData.name,
            address: stationData.address,
            city: (stationData.cities as any)?.name || null,
            district: stationData.district || null
          },
          wheels: [],
          availableCount: 0,
          totalCount: 0
        })
      }

      const entry = stationMap.get(wheel.station_id)!
      entry.wheels.push(wheel)
      entry.totalCount++
      if (wheel.is_available) {
        entry.availableCount++
      }
    })

    const results = Array.from(stationMap.values())

    // Demand logging for operator / station-manager searches (see src/lib/search-log.ts).
    // Never blocks or fails the search itself.
    const logSource = searchParams.get('log_source')
    if ((logSource === 'operator' || logSource === 'manager') && !district) {
      await logSearch(searchParams, logSource, results.map(r => ({
        stationId: r.station.id,
        hasAvailable: r.wheels.some(w => w.is_available && !w.temporarily_unavailable)
      })))
    }

    // Get unique filter options from all wheels in active stations
    // Using select('*') to handle case where center_bore column might not exist yet
    const { data: allWheels, error: filterError } = await supabase
      .from('wheels')
      .select('*')
      .in('station_id', activeStationIds)
      .is('deleted_at', null)
      .eq('pending_donation', false)

    if (filterError) {
      console.error('Error fetching filter options:', filterError)
    }

    const filterOptions = {
      rim_sizes: [...new Set(allWheels?.map(w => w.rim_size).filter(Boolean))].sort(),
      bolt_counts: [...new Set(allWheels?.map(w => w.bolt_count).filter(Boolean))].sort((a, b) => a - b),
      bolt_spacings: [...new Set(allWheels?.map(w => w.bolt_spacing).filter(Boolean))].sort((a, b) => a - b),
      center_bores: [...new Set(allWheels?.map(w => w.center_bore).filter(Boolean))].sort((a, b) => a - b)
    }

    return NextResponse.json({
      results,
      totalWheels: wheels?.length || 0,
      totalAvailable: wheels?.filter(w => w.is_available).length || 0,
      filterOptions
    })
  } catch (error) {
    console.error('Error in GET /api/wheel-stations/search:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Records one search in wheel_search_log. Skips a repeat of the same vehicle/spec by the
// same person within 10 minutes, so re-running a search doesn't inflate the counts.
async function logSearch(
  sp: URLSearchParams,
  source: 'operator' | 'manager',
  stations: { stationId: string; hasAvailable: boolean }[]
) {
  try {
    const type = sp.get('log_type')
    const toNum = (v: string | null) => (v && !isNaN(parseFloat(v)) ? parseFloat(v) : null)
    const row = {
      source,
      search_type: type === 'plate' || type === 'model' ? type : 'spec',
      searched_by: sp.get('log_by')?.slice(0, 100) || null,
      plate: sp.get('log_plate')?.slice(0, 20) || null,
      manufacturer: sp.get('log_make')?.slice(0, 60) || null,
      model: sp.get('log_model')?.slice(0, 60) || null,
      year: toNum(sp.get('log_year')),
      bolt_count: toNum(sp.get('bolt_count')),
      bolt_spacing: toNum(sp.get('bolt_spacing')),
      center_bore: toNum(sp.get('log_cb') || sp.get('center_bore')),
      rim_size: sp.get('log_rim') || sp.get('rim_size') || null,
      stations_with_match: stations.map(s => s.stationId),
      stations_with_available: stations.filter(s => s.hasAvailable).map(s => s.stationId),
    }

    let dupQuery = supabase
      .from('wheel_search_log')
      .select('id')
      .gte('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString())
      .limit(1)
    dupQuery = row.searched_by ? dupQuery.eq('searched_by', row.searched_by) : dupQuery.is('searched_by', null)
    dupQuery = row.plate ? dupQuery.eq('plate', row.plate) : dupQuery.is('plate', null)
    dupQuery = row.model ? dupQuery.eq('model', row.model) : dupQuery.is('model', null)
    dupQuery = row.bolt_count != null ? dupQuery.eq('bolt_count', row.bolt_count) : dupQuery.is('bolt_count', null)
    dupQuery = row.bolt_spacing != null ? dupQuery.eq('bolt_spacing', row.bolt_spacing) : dupQuery.is('bolt_spacing', null)
    const { data: dup } = await dupQuery
    if (dup && dup.length > 0) return

    const { error } = await supabase.from('wheel_search_log').insert(row)
    if (error) console.error('wheel_search_log insert failed:', error.message)
  } catch (err) {
    console.error('wheel_search_log error:', err)
  }
}
