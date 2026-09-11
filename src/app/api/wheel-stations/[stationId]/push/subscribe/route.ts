/**
 * API Route: Subscribe to Push Notifications for Wheel Station
 * POST /api/wheel-stations/[stationId]/push/subscribe
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyStationManagerSession } from '@/lib/station-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ stationId: string }> }
) {
  try {
    const { stationId } = await params
    const body = await request.json()
    const { subscription } = body

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: 'נתוני subscription חסרים' },
        { status: 400 }
      )
    }

    const auth = await verifyStationManagerSession(request, stationId)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }
    const manager_phone = auth.managerPhone!

    // Check if subscription already exists
    const { data: existingSub } = await supabase
      .from('wheel_station_push_subscriptions')
      .select('id')
      .eq('endpoint', subscription.endpoint)
      .single()

    if (existingSub) {
      // Update existing subscription
      const { error: updateError } = await supabase
        .from('wheel_station_push_subscriptions')
        .update({
          station_id: stationId,
          manager_phone,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          user_agent: body.userAgent,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingSub.id)

      if (updateError) {
        console.error('Error updating subscription:', updateError)
        return NextResponse.json(
          { error: 'שגיאה בעדכון subscription' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Subscription עודכן בהצלחה',
      })
    }

    // Insert new subscription
    const { error: insertError } = await supabase
      .from('wheel_station_push_subscriptions')
      .insert({
        station_id: stationId,
        manager_phone,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        user_agent: body.userAgent,
      })

    if (insertError) {
      console.error('Error inserting subscription:', insertError)
      return NextResponse.json(
        { error: 'שגיאה בשמירת subscription' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription נשמר בהצלחה',
    })
  } catch (error) {
    console.error('Push subscribe error:', error)
    return NextResponse.json(
      { error: 'שגיאת שרת פנימית' },
      { status: 500 }
    )
  }
}

// DELETE - Unsubscribe
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ stationId: string }> }
) {
  try {
    const { stationId } = await params
    const body = await request.json()
    const { endpoint } = body

    if (!endpoint) {
      return NextResponse.json({ error: 'חסר endpoint' }, { status: 400 })
    }

    const auth = await verifyStationManagerSession(request, stationId)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }
    const manager_phone = auth.managerPhone!

    // Remove subscription
    const { error } = await supabase
      .from('wheel_station_push_subscriptions')
      .delete()
      .eq('endpoint', endpoint)
      .eq('manager_phone', manager_phone)

    if (error) {
      console.error('Error deleting subscription:', error)
      return NextResponse.json(
        { error: 'שגיאה במחיקת subscription' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'בוטל בהצלחה',
    })
  } catch (error) {
    console.error('Push unsubscribe error:', error)
    return NextResponse.json(
      { error: 'שגיאת שרת פנימית' },
      { status: 500 }
    )
  }
}

// GET - Check if subscribed
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ stationId: string }> }
) {
  try {
    const { stationId } = await params

    const auth = await verifyStationManagerSession(request, stationId)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }
    const manager_phone = auth.managerPhone!

    const { data: subs } = await supabase
      .from('wheel_station_push_subscriptions')
      .select('id, is_active')
      .eq('station_id', stationId)
      .eq('manager_phone', manager_phone)
      .eq('is_active', true)

    return NextResponse.json({
      subscribed: subs && subs.length > 0,
      count: subs?.length || 0,
    })
  } catch (error) {
    console.error('Check subscription error:', error)
    return NextResponse.json(
      { error: 'שגיאת שרת' },
      { status: 500 }
    )
  }
}
