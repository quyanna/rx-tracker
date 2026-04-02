'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addMedication(formData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  await supabase.from('medications').insert({
    user_id: user.id,
    name: formData.get('name'),
    interval_days: parseInt(formData.get('interval_days')),
    last_fill_date: formData.get('last_fill_date'),
    notify_days_before: parseInt(formData.get('notify_days_before')),
    notes: formData.get('notes') || null,
  })

  revalidatePath('/dashboard')
}

export async function updateMedication(formData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  await supabase
    .from('medications')
    .update({
      name: formData.get('name'),
      interval_days: parseInt(formData.get('interval_days')),
      last_fill_date: formData.get('last_fill_date'),
      notify_days_before: parseInt(formData.get('notify_days_before')),
      notes: formData.get('notes') || null,
    })
    .eq('id', formData.get('id'))
    .eq('user_id', user.id) // safety: ensure user owns this row

  revalidatePath('/dashboard')
}

export async function deleteMedication(formData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  await supabase
    .from('medications')
    .delete()
    .eq('id', formData.get('id'))
    .eq('user_id', user.id) // safety: ensure user owns this row

  revalidatePath('/dashboard')
}
