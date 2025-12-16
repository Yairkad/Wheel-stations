/**
 * Signed Forms Upload API
 * POST /api/signed-forms/upload - Upload a signed form image
 *
 * This API:
 * 1. Receives the form image (PNG from canvas)
 * 2. Uploads to Supabase Storage
 * 3. Creates metadata record in signed_forms table
 * 4. Sends email notification to configured addresses
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

interface UploadRequest {
  borrow_id: string
  station_id: string
  form_image: string // Base64 PNG
  borrower_name: string
  wheel_number: string
  borrow_date: string
}

export async function POST(request: NextRequest) {
  try {
    const body: UploadRequest = await request.json()
    const { borrow_id, station_id, form_image, borrower_name, wheel_number, borrow_date } = body

    // Validate required fields
    if (!borrow_id || !station_id || !form_image) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get station details for notification emails
    const { data: station, error: stationError } = await supabase
      .from('wheel_stations')
      .select('id, name, notification_emails')
      .eq('id', station_id)
      .single()

    if (stationError || !station) {
      return NextResponse.json({ error: 'Station not found' }, { status: 404 })
    }

    // Convert base64 to buffer
    const base64Data = form_image.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${station_id}/${borrow_id}_${timestamp}.png`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase
      .storage
      .from('signed-forms')
      .upload(filename, buffer, {
        contentType: 'image/png',
        upsert: false
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload form' }, { status: 500 })
    }

    // Calculate expiration date (30 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    // Create metadata record
    const { data: formRecord, error: dbError } = await supabase
      .from('signed_forms')
      .insert({
        borrow_id,
        station_id,
        storage_path: filename,
        file_size: buffer.length,
        expires_at: expiresAt.toISOString(),
        email_sent_to: station.notification_emails || []
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Try to delete uploaded file on failure
      await supabase.storage.from('signed-forms').remove([filename])
      return NextResponse.json({ error: 'Failed to save form record' }, { status: 500 })
    }

    // Send email notification if configured
    const notificationEmails = station.notification_emails || []
    if (notificationEmails.length > 0 && process.env.GMAIL_USER) {
      try {
        const formViewUrl = `${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/forms/${formRecord.id}`
        const formattedDate = new Date(borrow_date).toLocaleDateString('he-IL')
        const expiryDate = expiresAt.toLocaleDateString('he-IL')

        await transporter.sendMail({
          from: `"תחנות גלגלים ידידים" <${process.env.GMAIL_USER}>`,
          to: notificationEmails.join(', '),
          subject: `טופס השאלה חדש - ${borrower_name} - גלגל #${wheel_number}`,
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #374151; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">טופס השאלה חדש</h1>
              </div>

              <div style="padding: 20px; background: #f9fafb;">
                <h2 style="color: #374151;">פרטי ההשאלה</h2>

                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>שם השואל:</strong></td>
                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${borrower_name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>מספר גלגל:</strong></td>
                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">#${wheel_number}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>תאריך השאלה:</strong></td>
                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${formattedDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>תחנה:</strong></td>
                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${station.name}</td>
                  </tr>
                </table>

                <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 8px; border: 1px solid #f59e0b;">
                  <strong style="color: #b45309;">שימו לב:</strong>
                  <p style="margin: 10px 0 0; color: #92400e;">
                    הטופס יישמר במערכת עד <strong>${expiryDate}</strong> (30 יום).<br>
                    מומלץ להוריד ולשמור עותק אם נדרש תיעוד ארוך טווח.
                  </p>
                </div>

                <div style="text-align: center; margin-top: 30px;">
                  <a href="${formViewUrl}"
                     style="display: inline-block; padding: 15px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    צפייה בטופס החתום
                  </a>
                </div>
              </div>

              <div style="padding: 15px; background: #e5e7eb; text-align: center; font-size: 12px; color: #6b7280;">
                הודעה זו נשלחה אוטומטית ממערכת תחנות גלגלים ידידים
              </div>
            </div>
          `,
          attachments: [
            {
              filename: `טופס_השאלה_${borrower_name}_${wheel_number}.png`,
              content: buffer,
              contentType: 'image/png'
            }
          ]
        })

        // Update email sent timestamp
        await supabase
          .from('signed_forms')
          .update({ email_sent_at: new Date().toISOString() })
          .eq('id', formRecord.id)

      } catch (emailError) {
        console.error('Email send error:', emailError)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      form_id: formRecord.id,
      expires_at: expiresAt.toISOString(),
      view_url: `/forms/${formRecord.id}`
    })

  } catch (error) {
    console.error('Error in signed-forms upload:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
