/**
 * Verified Wheel Matches API
 * POST /api/wheel-stations/verified-matches - Given a vehicle and a list of "maybe" wheel
 * specs, returns which specs should be upgraded to "certain" — either because 2+ distinct
 * real returns already proved that exact vehicle+spec combo in the field
 * (verified_wheel_matches), or because an admin manually whitelisted it
 * (trusted_vehicle_wheel_matches). Never called for specs already excluded as unsafe.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface Spec {
  rim_size: string
  bolt_count: number
  bolt_spacing: number
  center_bore?: number | null
}

// CB is part of the spec identity for the automatic (verified_wheel_matches) side —
// those rows are real, specific wheels that were actually borrowed and returned, so a
// different CB is genuinely a different wheel. Nullable CB matches only other nullable CB.
const specKey = (s: { rim_size: string | number; bolt_count: number; bolt_spacing: number; center_bore?: number | null }) =>
  `${s.rim_size}|${s.bolt_count}|${s.bolt_spacing}|${s.center_bore ?? 'null'}`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { vehicle_make, vehicle_model, vehicle_year, specs } = body as {
      vehicle_make?: string
      vehicle_model?: string
      vehicle_year?: number
      specs?: Spec[]
    }

    if (!vehicle_make || !vehicle_model || !Array.isArray(specs) || specs.length === 0) {
      return NextResponse.json({ trusted: [] })
    }

    const trusted = new Set<string>()

    // 1. Automatic: 2+ distinct real returns already proved this exact combo (CB included —
    // these are real specific wheels, a different CB is a genuinely different wheel)
    const { data: verified } = await supabase
      .from('verified_wheel_matches')
      .select('license_plate, wheel_rim_size, wheel_bolt_count, wheel_bolt_spacing, wheel_center_bore')
      .eq('vehicle_make', vehicle_make)
      .eq('vehicle_model', vehicle_model)

    const plateCountBySpec: Record<string, Set<string>> = {}
    for (const row of (verified || [])) {
      const key = specKey({ rim_size: row.wheel_rim_size, bolt_count: row.wheel_bolt_count, bolt_spacing: row.wheel_bolt_spacing, center_bore: row.wheel_center_bore })
      if (!plateCountBySpec[key]) plateCountBySpec[key] = new Set()
      if (row.license_plate) plateCountBySpec[key].add(row.license_plate)
    }
    for (const [key, plates] of Object.entries(plateCountBySpec)) {
      if (plates.size >= 2) trusted.add(key)
    }

    // 2. Manual whitelist: admin-confirmed, no history required, year range applies if known.
    // Unlike the automatic side, a whitelist row with no CB set is a deliberate "applies
    // regardless of CB" claim by the admin (see migration 20260824_add_trusted_matches_center_bore),
    // so it's matched directly against the requested specs rather than through the exact specKey set.
    const { data: whitelisted } = await supabase
      .from('trusted_vehicle_wheel_matches')
      .select('year_from, year_to, wheel_rim_size, wheel_bolt_count, wheel_bolt_spacing, wheel_center_bore')
      .eq('vehicle_make', vehicle_make)
      .eq('vehicle_model', vehicle_model)

    for (const row of (whitelisted || [])) {
      if (vehicle_year) {
        if (row.year_from && vehicle_year < row.year_from) continue
        if (row.year_to && vehicle_year > row.year_to) continue
      }
      for (const s of specs) {
        if (String(row.wheel_rim_size) !== String(s.rim_size)) continue
        if (row.wheel_bolt_count !== s.bolt_count) continue
        if (row.wheel_bolt_spacing !== s.bolt_spacing) continue
        if (row.wheel_center_bore != null && row.wheel_center_bore !== s.center_bore) continue
        trusted.add(specKey(s))
      }
    }

    // Only return specs actually asked about
    const requestedKeys = new Set(specs.map(specKey))
    const result = specs.filter(s => trusted.has(specKey(s)) && requestedKeys.has(specKey(s)))

    return NextResponse.json({ trusted: result })
  } catch (error) {
    console.error('Error in POST verified-matches:', error)
    return NextResponse.json({ trusted: [] })
  }
}
