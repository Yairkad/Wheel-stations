/**
 * Signed Forms View/Download API
 * GET /api/signed-forms/[formId] - Get form metadata and image
 *
 * Query params:
 * - action=view - View the form (increments view count)
 * - action=download - Download the form (increments download count)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface RouteParams {
  params: Promise<{ formId: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { formId } = await params
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'view'

    // Get form metadata
    const { data: form, error: formError } = await supabase
      .from('signed_forms')
      .select(`
        *,
        wheel_borrows (
          borrower_name,
          borrower_phone,
          vehicle_model,
          borrow_date,
          wheels (
            wheel_number,
            rim_size,
            bolt_count,
            bolt_spacing
          )
        ),
        wheel_stations (
          name
        )
      `)
      .eq('id', formId)
      .single()

    if (formError || !form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    // Check if form is expired
    const now = new Date()
    const expiresAt = new Date(form.expires_at)
    if (now > expiresAt) {
      return NextResponse.json({
        error: 'Form has expired',
        expired: true,
        expired_at: form.expires_at
      }, { status: 410 }) // 410 Gone
    }

    // Update view/download count
    if (action === 'view') {
      await supabase
        .from('signed_forms')
        .update({
          view_count: (form.view_count || 0) + 1,
          last_viewed_at: new Date().toISOString()
        })
        .eq('id', formId)
    } else if (action === 'download') {
      await supabase
        .from('signed_forms')
        .update({
          download_count: (form.download_count || 0) + 1,
          last_downloaded_at: new Date().toISOString()
        })
        .eq('id', formId)
    }

    // Get signed URL for the image (valid for 1 hour)
    const { data: signedUrl, error: urlError } = await supabase
      .storage
      .from('signed-forms')
      .createSignedUrl(form.storage_path, 3600)

    if (urlError || !signedUrl) {
      console.error('Signed URL error:', urlError)
      return NextResponse.json({ error: 'Failed to get form image' }, { status: 500 })
    }

    // Calculate days remaining
    const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    return NextResponse.json({
      id: form.id,
      image_url: signedUrl.signedUrl,
      expires_at: form.expires_at,
      days_remaining: daysRemaining,
      view_count: form.view_count + (action === 'view' ? 1 : 0),
      download_count: form.download_count + (action === 'download' ? 1 : 0),
      created_at: form.created_at,
      borrow: form.wheel_borrows,
      station: form.wheel_stations
    })

  } catch (error) {
    console.error('Error in signed-forms GET:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
