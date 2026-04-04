// Server-only utility. Never import this from client components.
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Sends a digest reminder email listing all medications that need attention.
 *
 * @param {string} userEmail   - Recipient email address
 * @param {Array<{ name: string, daysUntilRefill: number }>} medications
 * @returns {Promise<{ sent: number, failed: number }>}
 */
export async function sendReminderEmail(userEmail, medications) {
  const fromAddress = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'

  const count = medications.length
  const subject =
    count === 1
      ? 'Rx Tracker: 1 medication needs attention'
      : `Rx Tracker: ${count} medications need attention`

  const itemsHtml = medications
    .map(({ name, daysUntilRefill }) => {
      const isOverdue = daysUntilRefill < 0
      const abs = Math.abs(daysUntilRefill)
      const status = isOverdue
        ? `<span style="color:#b91c1c;">overdue by ${abs} ${abs === 1 ? 'day' : 'days'}</span>`
        : `due in ${daysUntilRefill === 1 ? '1 day' : `${daysUntilRefill} days`}`
      return `<li style="margin-bottom:8px;"><strong>${name}</strong> — ${status}</li>`
    })
    .join('')

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head><meta charset="UTF-8" /></head>
      <body style="margin:0;padding:0;background:#f4f4f5;font-family:sans-serif;">
        <div style="max-width:480px;margin:40px auto;background:#ffffff;border-radius:8px;padding:32px;color:#111;">
          <p style="margin:0 0 8px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Rx Tracker</p>
          <h1 style="margin:0 0 24px;font-size:22px;font-weight:600;">Refill Reminder</h1>

          <p style="margin:0 0 16px;font-size:16px;line-height:1.5;">
            The following ${count === 1 ? 'prescription needs' : 'prescriptions need'} your attention:
          </p>

          <ul style="margin:0 0 24px;padding-left:20px;font-size:16px;line-height:1.5;">
            ${itemsHtml}
          </ul>

          <p style="margin:0 0 24px;font-size:16px;line-height:1.5;color:#374151;">
            Now is a good time to contact your pharmacy so you don't run out.
          </p>

          <div style="border-top:1px solid #e5e7eb;margin-top:24px;padding-top:16px;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              You're receiving this because you enabled email reminders in Rx Tracker.
            </p>
          </div>
        </div>
      </body>
    </html>
  `

  try {
    const { error } = await resend.emails.send({
      from: fromAddress,
      to: userEmail,
      subject,
      html,
    })

    if (error) {
      console.error(`Resend error for ${userEmail}:`, error)
      return { sent: 0, failed: 1 }
    }

    return { sent: 1, failed: 0 }
  } catch (err) {
    console.error(`sendReminderEmail threw for ${userEmail}:`, err.message)
    return { sent: 0, failed: 1 }
  }
}
