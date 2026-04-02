import { createClient } from '@supabase/supabase-js'
import { sendPushToUser } from '@/lib/sendPushNotification'
import { sendReminderEmail } from '@/lib/sendReminderEmail'

function createServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

function getDaysUntilRefill(lastFillDate, intervalDays) {
  const [year, month, day] = lastFillDate.split('-').map(Number)
  const lastFill = Date.UTC(year, month - 1, day)
  const nextFill = lastFill + intervalDays * 24 * 60 * 60 * 1000

  const now = new Date()
  const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())

  return Math.round((nextFill - todayUTC) / (24 * 60 * 60 * 1000))
}

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createServiceRoleClient()

  // 1. Fetch all medications
  const { data: medications, error: medError } = await supabase
    .from('medications')
    .select('id, user_id, name, interval_days, last_fill_date, notify_days_before')

  if (medError) {
    console.error('Failed to fetch medications:', medError.message)
    return new Response('Internal error', { status: 500 })
  }

  if (!medications || medications.length === 0) {
    return new Response(JSON.stringify({ processed: 0 }), { status: 200 })
  }

  // 2. Filter to medications due within their notify window
  const due = medications.filter((med) => {
    const days = getDaysUntilRefill(med.last_fill_date, med.interval_days)
    return days >= 0 && days <= med.notify_days_before
  })

  if (due.length === 0) {
    return new Response(JSON.stringify({ processed: 0, notified: 0 }), { status: 200 })
  }

  // 3. Fetch users to get email addresses
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()

  if (usersError) {
    console.error('Failed to fetch users:', usersError.message)
    return new Response('Internal error', { status: 500 })
  }

  const emailMap = new Map(users.map((u) => [u.id, u.email]))

  // 4. Send notifications
  let pushSent = 0, emailSent = 0, errors = 0

  for (const med of due) {
    const userEmail = emailMap.get(med.user_id)
    const daysUntilRefill = getDaysUntilRefill(med.last_fill_date, med.interval_days)
    const title = 'Refill Reminder'
    const dayLabel = daysUntilRefill === 1 ? '1 day' : `${daysUntilRefill} days`
    const body = `${med.name} is due for a refill in ${dayLabel}.`

    try {
      const result = await sendPushToUser(supabase, med.user_id, title, body)
      pushSent += result.sent
    } catch (err) {
      console.error(`Push error for user ${med.user_id}, med ${med.id}:`, err.message)
      errors++
    }

    if (userEmail) {
      try {
        const result = await sendReminderEmail(userEmail, med.name, daysUntilRefill)
        emailSent += result.sent
      } catch (err) {
        console.error(`Email error for user ${med.user_id}, med ${med.id}:`, err.message)
        errors++
      }
    }
  }

  console.log(`Cron complete. Push: ${pushSent}, Email: ${emailSent}, Errors: ${errors}`)
  return new Response(
    JSON.stringify({ processed: due.length, pushSent, emailSent, errors }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}
