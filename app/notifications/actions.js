'use server'

import { createClient } from '@/lib/supabase/server'

export async function saveSubscription(subscriptionJSON) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const subscription = JSON.parse(subscriptionJSON)

  const { error } = await supabase
    .from('push_subscriptions')
    .insert({ user_id: user.id, subscription })

  // Ignore duplicate — subscription already saved for this device
  if (error && error.code !== '23505') return { error: error.message }
  return { success: true }
}

export async function deleteSubscription(endpoint) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: rows } = await supabase
    .from('push_subscriptions')
    .select('id, subscription')
    .eq('user_id', user.id)

  const match = rows?.find((r) => r.subscription?.endpoint === endpoint)
  if (!match) return { success: true }

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('id', match.id)

  if (error) return { error: error.message }
  return { success: true }
}
