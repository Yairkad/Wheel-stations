/**
 * Puncture Shop Suggestions API
 * POST /api/puncture-suggestions — submit a new shop suggestion for admin review
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { name, city, address, phone, hours, notes, submitter_name, submitter_phone } =
    body as Record<string, string>

  if (!name?.trim() || !city?.trim() || !address?.trim()) {
    return NextResponse.json(
      { error: 'שם, עיר וכתובת הם שדות חובה' },
      { status: 400 }
    )
  }

  const { error } = await supabase.from('puncture_suggestions').insert({
    name: name.trim(),
    city: city.trim(),
    address: address.trim(),
    phone: phone?.trim() || null,
    hours: hours?.trim() || null,
    notes: notes?.trim() || null,
    submitter_name: submitter_name?.trim() || null,
    submitter_phone: submitter_phone?.trim() || null,
  })

  if (error) {
    console.error('Error inserting suggestion:', error)
    return NextResponse.json({ error: 'Failed to save suggestion' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
