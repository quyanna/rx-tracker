// Server-only utility. Never import this from client components.
import webpush from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

/**
 * Sends a push notification to every registered device for a given user.
 *
 * @param {object} supabaseClient - Service-role Supabase client (bypasses RLS)
 * @param {string} userId         - auth.users UUID of the recipient
 * @param {string} title          - Notification title
 * @param {string} body           - Notification body
 * @returns {Promise<{ sent: number, failed: number }>}
 */
export async function sendPushToUser(supabaseClient, userId, title, body) {
  const { data: rows, error } = await supabaseClient
    .from('push_subscriptions')
    .select('id, subscription')
    .eq('user_id', userId)

  if (error || !rows || rows.length === 0) return { sent: 0, failed: 0 }

  const payload = JSON.stringify({ title, body })
  let sent = 0
  let failed = 0

  for (const row of rows) {
    try {
      await webpush.sendNotification(row.subscription, payload)
      sent++
    } catch (err) {
      failed++
      // 410 Gone = browser unsubscribed; clean up the stale row
      if (err.statusCode === 410) {
        await supabaseClient.from('push_subscriptions').delete().eq('id', row.id)
      }
      console.error(`Push failed for subscription ${row.id}:`, err.message)
    }
  }

  return { sent, failed }
}
