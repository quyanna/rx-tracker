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

  // 2. Filter to medications due within their notify window or overdue
  const due = medications.filter((med) => {
    const days = getDaysUntilRefill(med.last_fill_date, med.interval_days)
    return days <= med.notify_days_before
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

  // 4. Send per-medication push notifications
  let pushSent = 0, emailSent = 0, errors = 0

  for (const med of due) {
    const daysUntilRefill = getDaysUntilRefill(med.last_fill_date, med.interval_days)
    const isOverdue = daysUntilRefill < 0
    const abs = Math.abs(daysUntilRefill)
    const title = isOverdue ? 'Refill Overdue' : 'Refill Reminder'
    const body = isOverdue
      ? `${med.name} is overdue for a refill by ${abs} ${abs === 1 ? 'day' : 'days'}.`
      : `${med.name} is due for a refill in ${daysUntilRefill === 1 ? '1 day' : `${daysUntilRefill} days`}.`

    try {
      const result = await sendPushToUser(supabase, med.user_id, title, body)
      pushSent += result.sent
    } catch (err) {
      console.error(`Push error for user ${med.user_id}, med ${med.id}:`, err.message)
      errors++
    }
  }

  // 5. Send one digest email per user
  const medsByUser = new Map()
  for (const med of due) {
    if (!medsByUser.has(med.user_id)) medsByUser.set(med.user_id, [])
    medsByUser.get(med.user_id).push({
      name: med.name,
      daysUntilRefill: getDaysUntilRefill(med.last_fill_date, med.interval_days),
    })
  }

  for (const [userId, meds] of medsByUser) {
    const userEmail = emailMap.get(userId)
    if (!userEmail) continue
    try {
      const result = await sendReminderEmail(userEmail, meds)
      emailSent += result.sent
    } catch (err) {
      console.error(`Email error for user ${userId}:`, err.message)
      errors++
    }
  }

  console.log(`Cron complete. Push: ${pushSent}, Email: ${emailSent}, Errors: ${errors}`)
  return new Response(
    JSON.stringify({ processed: due.length, pushSent, emailSent, errors }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}
