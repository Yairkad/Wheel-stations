import { NextRequest, NextResponse } from 'next/server'
import { verifyPunctureAccess, supabase } from '../../_auth'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()

  if (!(await verifyPunctureAccess(body))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { action, shopData } = body

  if (action === 'reject') {
    const { error } = await supabase
      .from('puncture_suggestions')
      .update({ status: 'rejected' })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  if (action === 'approve' && shopData) {
    // Create the puncture shop
    const { data: newShop, error: createError } = await supabase
      .from('punctures')
      .insert({
        name:             shopData.name,
        address:          shopData.address,
        city:             shopData.city || null,
        lat:              parseFloat(shopData.lat),
        lng:              parseFloat(shopData.lng),
        phone:            shopData.phone || null,
        hours:            shopData.hours || null,
        hours_regular:    shopData.hours_regular || null,
        hours_evening:    shopData.hours_evening || null,
        hours_friday:     shopData.hours_friday || null,
        hours_saturday:   shopData.hours_saturday || null,
        notes:            shopData.notes || null,
        website:          shopData.website || null,
        google_maps_url:  shopData.google_maps_url || null,
        is_active:        true,
      })
      .select('id')
      .single()

    if (createError) return NextResponse.json({ error: createError.message }, { status: 500 })

    // Mark suggestion approved
    await supabase
      .from('puncture_suggestions')
      .update({ status: 'approved' })
      .eq('id', id)

    return NextResponse.json({ success: true, shopId: newShop.id })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
