import nodemailer from 'nodemailer'

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })
}

export async function sendWheelDeletedEmail({
  to,
  stationName,
  wheelNumber,
  wheelDetails,
  deletedBy,
  restoreDeadline
}: {
  to: string
  stationName: string
  wheelNumber: number
  wheelDetails: string
  deletedBy: string
  restoreDeadline: string
}) {
  const transporter = createTransporter()

  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #fef2f2; border: 2px solid #f87171; border-radius: 12px; padding: 20px;">
        <h2 style="color: #dc2626; margin: 0 0 16px 0;">⚠️ גלגל נמחק מתחנה ${stationName}</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">מספר גלגל:</td>
            <td style="padding: 8px 0;">#${wheelNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">פרטים:</td>
            <td style="padding: 8px 0;">${wheelDetails}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">נמחק על ידי:</td>
            <td style="padding: 8px 0;">${deletedBy}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">אפשרות שחזור עד:</td>
            <td style="padding: 8px 0; color: #dc2626; font-weight: bold;">${restoreDeadline}</td>
          </tr>
        </table>
        <div style="margin-top: 20px; padding: 12px; background: #fff7ed; border-radius: 8px; border: 1px solid #fed7aa;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            💡 ניתן לשחזר את הגלגל מתוך דף ניהול התחנה תוך 14 יום.
          </p>
        </div>
      </div>
    </div>
  `

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject: `⚠️ גלגל #${wheelNumber} נמחק מתחנה ${stationName}`,
    html,
  })
}
