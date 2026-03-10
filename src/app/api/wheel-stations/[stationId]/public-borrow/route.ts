/**
 * Public Wheel Borrow API
 * POST /api/wheel-stations/[stationId]/public-borrow - Submit borrow request (public, no auth required)
 *
 * This API is for borrowers to submit a borrow request via sign form.
 * The request goes to 'pending' status and requires manager approval to become 'borrowed'.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY')
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

interface RouteParams {
  params: Promise<{ stationId: string }>
}

// POST - Submit borrow request (public endpoint for sign form)
// Creates a pending request that requires manager approval
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { stationId } = await params
    const body = await request.json()
    const {
      wheel_id,
      borrower_name,
      borrower_phone,
      borrower_id_number,
      borrower_address,
      vehicle_model,
      license_plate,
      borrow_date,
      deposit_type,
      notes,
      signature_data,
      form_image_data, // Full form image captured with html2canvas
      terms_accepted,
      referred_by // Track who referred this form (e.g., operator_123)
    } = body

    // Validate required fields
    if (!wheel_id) {
      return NextResponse.json({ error: 'נא לבחור צמיג' }, { status: 400 })
    }
    if (!borrower_name || !borrower_phone) {
      return NextResponse.json({ error: 'נא למלא שם וטלפון' }, { status: 400 })
    }
    if (!borrower_id_number || borrower_id_number.length < 9) {
      return NextResponse.json({ error: 'נא למלא תעודת זהות (9 ספרות)' }, { status: 400 })
    }
    if (!borrower_address) {
      return NextResponse.json({ error: 'נא למלא כתובת' }, { status: 400 })
    }
    if (!vehicle_model) {
      return NextResponse.json({ error: 'נא למלא דגם הרכב' }, { status: 400 })
    }
    if (!deposit_type) {
      return NextResponse.json({ error: 'נא לבחור אופן תשלום פיקדון' }, { status: 400 })
    }
    if (!signature_data) {
      return NextResponse.json({ error: 'נא לחתום על הטופס' }, { status: 400 })
    }
    if (!terms_accepted) {
      return NextResponse.json({ error: 'נא לאשר את תנאי ההשאלה' }, { status: 400 })
    }

    // Check station exists
    const { data: station, error: stationError } = await supabase
      .from('wheel_stations')
      .select('id, name, notification_emails')
      .eq('id', stationId)
      .single()

    if (stationError || !station) {
      return NextResponse.json({ error: 'תחנה לא נמצאה' }, { status: 404 })
    }

    // Check wheel exists, belongs to this station, and is available
    const { data: wheel, error: wheelError } = await supabase
      .from('wheels')
      .select('id, wheel_number, is_available')
      .eq('id', wheel_id)
      .eq('station_id', stationId)
      .single()

    if (wheelError || !wheel) {
      return NextResponse.json({ error: 'הצמיג לא נמצא' }, { status: 404 })
    }

    if (!wheel.is_available) {
      return NextResponse.json({ error: 'הצמיג כבר מושאל' }, { status: 400 })
    }

    // Calculate expected return date (72 hours from borrow date)
    const borrowDateTime = borrow_date ? new Date(borrow_date) : new Date()
    const expectedReturn = new Date(borrowDateTime.getTime() + 72 * 60 * 60 * 1000)

    // Create borrow request with 'pending' status - requires manager approval
    const { data: borrow, error: borrowError } = await supabase
      .from('wheel_borrows')
      .insert({
        wheel_id: wheel_id,
        station_id: stationId,
        borrower_name,
        borrower_phone,
        borrower_id_number,
        borrower_address,
        vehicle_model,
        license_plate: license_plate || null,
        borrow_date: borrowDateTime.toISOString(),
        expected_return_date: expectedReturn.toISOString(),
        deposit_type,
        notes,
        signature_data,
        signed_at: new Date().toISOString(),
        terms_accepted: true,
        status: 'pending' // Requires manager approval
      })
      .select()
      .single()

    if (borrowError) {
      console.error('Error creating borrow request:', borrowError)

      // Provide more specific error messages based on the error
      let errorMessage = 'שגיאה ביצירת בקשת השאלה'

      if (borrowError.code === '23505') {
        // Unique constraint violation - possibly duplicate borrow
        errorMessage = 'קיימת כבר בקשת השאלה פעילה עבור גלגל זה'
      } else if (borrowError.code === '23503') {
        // Foreign key violation
        errorMessage = 'הגלגל או התחנה לא נמצאו במערכת'
      } else if (borrowError.code === '23502') {
        // Not null violation
        errorMessage = 'חסרים שדות חובה בטופס'
      } else if (borrowError.message) {
        // Include the actual error message for debugging
        errorMessage = `שגיאה ביצירת בקשת השאלה: ${borrowError.message}`
      }

      return NextResponse.json({ error: errorMessage }, { status: 500 })
    }

    // Note: Wheel availability is NOT updated here
    // Manager must approve the request to mark wheel as borrowed

    // Upload signed form if form_image_data exists (full form capture)
    let formViewUrl = null
    if (form_image_data) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
        const formResponse = await fetch(`${baseUrl}/api/signed-forms/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            borrow_id: borrow.id,
            station_id: stationId,
            form_image: form_image_data, // Full form image
            borrower_name,
            wheel_number: wheel.wheel_number,
            borrow_date: borrowDateTime.toISOString(),
            referred_by // Track who referred this form (e.g., operator_123)
          })
        })
        const formData = await formResponse.json()
        if (formData.success) {
          formViewUrl = formData.view_url
        }
      } catch (formError) {
        // Don't fail the request if form upload fails
        console.error('Error uploading signed form:', formError)
      }
    }

    // Send push notification to station managers
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
      await fetch(`${baseUrl}/api/wheel-stations/${stationId}/push/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `🛞 בקשת השאלה חדשה - ${station.name}`,
          body: `${borrower_name} מבקש להשאיל גלגל #${wheel.wheel_number}`,
          url: `/${stationId}`
        })
      })
    } catch (pushError) {
      // Don't fail the request if push fails
      console.error('Error sending push notification:', pushError)
    }

    // Send email notification to managers (as fallback for push)
    const notificationEmails = (station as { notification_emails?: string[] }).notification_emails || []
    if (notificationEmails.length > 0 && process.env.GMAIL_USER) {
      try {
        const stationUrl = `${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/${stationId}`
        const formattedDate = new Date(borrow.borrow_date).toLocaleDateString('he-IL', {
          day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        })
        await emailTransporter.sendMail({
          from: `"תחנות גלגלים ידידים" <${process.env.GMAIL_USER}>`,
          to: notificationEmails.join(', '),
          subject: `🛞 בקשת השאלה חדשה - ${borrower_name} - גלגל #${wheel.wheel_number}`,
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: #f0fdf4; border: 2px solid #22c55e; border-radius: 12px; padding: 20px;">
                <h2 style="color: #15803d; margin: 0 0 16px 0;">🛞 בקשת השאלה חדשה ממתינה לאישור</h2>
                <p style="color: #374151; margin: 0 0 16px 0;"><strong>תחנה:</strong> ${station.name}</p>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 6px 0; color: #6b7280; font-weight: bold;">שם המבקש:</td><td style="padding: 6px 0;">${borrower_name}</td></tr>
                  <tr><td style="padding: 6px 0; color: #6b7280; font-weight: bold;">טלפון:</td><td style="padding: 6px 0;">${borrower_phone}</td></tr>
                  <tr><td style="padding: 6px 0; color: #6b7280; font-weight: bold;">גלגל:</td><td style="padding: 6px 0;">#${wheel.wheel_number}</td></tr>
                  <tr><td style="padding: 6px 0; color: #6b7280; font-weight: bold;">תאריך:</td><td style="padding: 6px 0;">${formattedDate}</td></tr>
                </table>
                <div style="margin-top: 20px;">
                  <a href="${stationUrl}" style="background: #22c55e; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                    ✅ עבור לאישור הבקשה
                  </a>
                </div>
              </div>
            </div>
          `
        })
      } catch (emailError) {
        console.error('Error sending approval email:', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      pending: true,
      message: 'הבקשה נשלחה בהצלחה וממתינה לאישור מנהל',
      borrow: {
        id: borrow.id,
        wheel_number: wheel.wheel_number,
        borrower_name,
        expected_return_date: expectedReturn.toISOString()
      },
      form_url: formViewUrl
    }, { status: 201 })

  } catch (error) {
    console.error('Error in POST public-borrow:', error)
    return NextResponse.json({ error: 'שגיאה בשרת' }, { status: 500 })
  }
}
