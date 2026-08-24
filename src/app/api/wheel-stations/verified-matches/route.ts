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
}

const specKey = (s: { rim_size: string | number; bolt_count: number; bolt_spacing: number }) =>
  `${s.rim_size}|${s.bolt_count}|${s.bolt_spacing}`

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

    // 1. Automatic: 2+ distinct real returns already proved this exact combo
    const { data: verified } = await supabase
      .from('verified_wheel_matches')
      .select('license_plate, wheel_rim_size, wheel_bolt_count, wheel_bolt_spacing')
      .eq('vehicle_make', vehicle_make)
      .eq('vehicle_model', vehicle_model)

    const plateCountBySpec: Record<string, Set<string>> = {}
    for (const row of (verified || [])) {
      const key = specKey({ rim_size: row.wheel_rim_size, bolt_count: row.wheel_bolt_count, bolt_spacing: row.wheel_bolt_spacing })
      if (!plateCountBySpec[key]) plateCountBySpec[key] = new Set()
      if (row.license_plate) plateCountBySpec[key].add(row.license_plate)
    }
    for (const [key, plates] of Object.entries(plateCountBySpec)) {
      if (plates.size >= 2) trusted.add(key)
    }

    // 2. Manual whitelist: admin-confirmed, no history required, year range applies if known
    const { data: whitelisted } = await supabase
      .from('trusted_vehicle_wheel_matches')
      .select('year_from, year_to, wheel_rim_size, wheel_bolt_count, wheel_bolt_spacing')
      .eq('vehicle_make', vehicle_make)
      .eq('vehicle_model', vehicle_model)

    for (const row of (whitelisted || [])) {
      if (vehicle_year) {
        if (row.year_from && vehicle_year < row.year_from) continue
        if (row.year_to && vehicle_year > row.year_to) continue
      }
      trusted.add(specKey({ rim_size: row.wheel_rim_size, bolt_count: row.wheel_bolt_count, bolt_spacing: row.wheel_bolt_spacing }))
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
