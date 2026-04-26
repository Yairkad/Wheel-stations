/**
 * API Route: Send Feedback for Wheels App
 * POST /api/feedback
 */

import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const FEEDBACK_EMAIL = 'aronyedidim@gmail.com'

interface AttachedFile {
  name: string
  type: string
  size: number
  base64: string
}

interface FeedbackBody {
  type: 'bug' | 'suggestion' | 'other'
  subject: string
  description: string
  senderName?: string
  senderEmail?: string
  senderPhone?: string
  stationName?: string
  attachments?: AttachedFile[]
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5MB per file
const MAX_TOTAL_SIZE_BYTES = 15 * 1024 * 1024 // 15MB total
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic',
  'video/mp4', 'video/quicktime', 'video/webm',
])

export async function POST(request: NextRequest) {
  try {
    const body: FeedbackBody = await request.json()

    if (!body.type || !body.subject || !body.description) {
      return NextResponse.json(
        { success: false, error: 'חסרים שדות חובה (סוג, נושא, תיאור)' },
        { status: 400 }
      )
    }

    if (body.senderEmail && !EMAIL_REGEX.test(body.senderEmail)) {
      return NextResponse.json({ success: false, error: 'כתובת המייל אינה תקינה' }, { status: 400 })
    }

    if (body.attachments?.length) {
      const totalSize = body.attachments.reduce((sum, f) => sum + f.size, 0)
      if (totalSize > MAX_TOTAL_SIZE_BYTES) {
        return NextResponse.json({ success: false, error: 'גודל כולל של הקבצים חורג מ-15MB' }, { status: 400 })
      }
      for (const file of body.attachments) {
        if (file.size > MAX_FILE_SIZE_BYTES) {
          return NextResponse.json({ success: false, error: `הקובץ "${file.name}" גדול מ-5MB` }, { status: 400 })
        }
        if (!ALLOWED_MIME_TYPES.has(file.type)) {
          return NextResponse.json({ success: false, error: `סוג הקובץ "${file.name}" אינו נתמך` }, { status: 400 })
        }
      }
    }

    const typeLabels = {
      bug: 'דיווח על באג',
      suggestion: 'הצעת שיפור',
      other: 'אחר'
    }

    const typeEmojis = {
      bug: '🐛',
      suggestion: '💡',
      other: '📝'
    }

    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0; direction: rtl; text-align: right;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); direction: rtl; text-align: right;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="font-size: 32px; font-weight: bold; color: #374151;">🛞 תחנות גלגלים ידידים</div>
          </div>

          <!-- Source Badge -->
          <div style="background: #f3f4f6; border: 2px solid #6b7280; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
            <span style="color: #374151; font-weight: bold; font-size: 14px;">
              🛞 מערכת תחנות גלגלים${body.stationName ? ` - ${body.stationName}` : ''}
            </span>
          </div>

          <div style="background: ${body.type === 'bug' ? '#fee2e2' : body.type === 'suggestion' ? '#dbeafe' : '#f3f4f6'}; border-right: 4px solid ${body.type === 'bug' ? '#ef4444' : body.type === 'suggestion' ? '#3b82f6' : '#6b7280'}; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h2 style="margin-top: 0; color: ${body.type === 'bug' ? '#991b1b' : body.type === 'suggestion' ? '#1e40af' : '#374151'};">
              ${typeEmojis[body.type]} ${typeLabels[body.type]}
            </h2>
            <p style="margin-bottom: 0; font-size: 18px; font-weight: bold;">${body.subject}</p>
          </div>

          <h3 style="text-align: right; direction: rtl;">תיאור:</h3>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; white-space: pre-wrap; line-height: 1.8;">
${body.description}
          </div>

          <h3 style="text-align: right; direction: rtl; margin-top: 25px;">פרטי השולח:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 100px;">שם:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${body.senderName || 'לא צוין'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">מייל:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${body.senderEmail ? `<a href="mailto:${body.senderEmail}">${body.senderEmail}</a>` : 'לא צוין'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">טלפון:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${body.senderPhone ? `<a href="tel:${body.senderPhone}">${body.senderPhone}</a>` : 'לא צוין'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">תחנה:</td>
              <td style="padding: 8px;">${body.stationName || 'לא צוין'}</td>
            </tr>
          </table>

          ${body.attachments && body.attachments.length > 0 ? `
          <h3 style="text-align: right; direction: rtl; margin-top: 25px;">📎 קבצים מצורפים:</h3>
          <div style="background: #f0f9ff; border: 2px dashed #3b82f6; padding: 15px; border-radius: 8px;">
            ${body.attachments.map(file => `
              <p style="margin: 5px 0; color: #1e40af;">
                ${file.type.startsWith('video/') ? '🎬' : '🖼️'} ${file.name}
                <span style="color: #666; font-size: 12px;">(${formatFileSize(file.size)})</span>
              </p>
            `).join('')}
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #666; text-align: center;">(הקבצים מצורפים למייל)</p>
          </div>
          ` : ''}

          <div style="text-align: center; color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
            <p>נשלח מתוך מערכת תחנות גלגלים ידידים</p>
            <p>${new Date().toLocaleString('he-IL')}</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Prepare attachments for nodemailer
    const emailAttachments = body.attachments?.map(file => {
      const base64Content = file.base64.split(',')[1] || file.base64
      return {
        filename: file.name,
        content: base64Content,
        encoding: 'base64' as const,
        contentType: file.type
      }
    })

    // Send email
    const emailResult = await sendFeedbackEmail(
      `🛞 ${typeEmojis[body.type]} ${typeLabels[body.type]}: ${body.subject}`,
      html,
      body.senderEmail,
      emailAttachments
    )

    if (!emailResult.success) {
      console.error('Error sending feedback email:', emailResult.error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בשליחת הפידבק. נסה שוב מאוחר יותר.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'הפידבק נשלח בהצלחה! תודה על המשוב.'
    })

  } catch (error) {
    console.error('Error in feedback API:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאת שרת פנימית' },
      { status: 500 }
    )
  }
}

interface EmailAttachment {
  filename: string
  content: string
  encoding: 'base64'
  contentType: string
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

async function sendFeedbackEmail(
  subject: string,
  html: string,
  replyTo?: string,
  attachments?: EmailAttachment[]
): Promise<{ success: boolean; error?: string }> {
  try {
    // Development mode - log to console
    if (process.env.NODE_ENV === 'development' && !process.env.SMTP_PASSWORD) {
      console.log('\n📧 ====== FEEDBACK EMAIL (Development Mode) ======')
      console.log('To:', FEEDBACK_EMAIL)
      console.log('Subject:', subject)
      console.log('==========================================\n')
      return { success: true }
    }

    // Check SMTP configuration
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.error('❌ SMTP not configured. Need: SMTP_HOST, SMTP_USER, SMTP_PASSWORD')
      return { success: false, error: 'Email service not configured' }
    }

    // Create transporter for SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    // Send email
    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: FEEDBACK_EMAIL,
      replyTo: replyTo || undefined,
      subject,
      html,
      attachments: attachments || [],
    })

    console.log('✅ Feedback email sent successfully:', result.messageId)
    return { success: true }

  } catch (error) {
    console.error('Feedback email sending error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
