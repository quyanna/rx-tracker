'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

export async function signInDemo() {
  const email = process.env.DEMO_EMAIL
  const password = process.env.DEMO_PASSWORD
  if (!email || !password) redirect('/login?error=Demo+account+not+configured')

  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`)

  // Reset demo data so every visitor sees a clean, realistic dashboard
  await supabase.from('medications').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('medications').insert([
    {
      name: 'Atorvastatin 20mg',
      interval_days: 90,
      last_fill_date: daysAgo(95),
      notify_days_before: 14,
      notes: 'Take at bedtime',
    },
    {
      name: 'Metformin 500mg',
      interval_days: 30,
      last_fill_date: daysAgo(26),
      notify_days_before: 7,
      notes: 'Take with meals',
    },
    {
      name: 'Lisinopril 10mg',
      interval_days: 30,
      last_fill_date: daysAgo(23),
      notify_days_before: 7,
      notes: null,
    },
    {
      name: 'Sertraline 50mg',
      interval_days: 30,
      last_fill_date: daysAgo(5),
      notify_days_before: 7,
      notes: 'Take in the morning',
    },
  ])

  redirect('/dashboard')
}

export async function signUp(formData) {
  const supabase = createClient()
  const { error } = await supabase.auth.signUp({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`)
  }
  // After sign-up, Supabase sends a confirmation email by default.
  // We redirect to login with a success message.
  redirect('/login?message=Check your email to confirm your account')
}

export async function signIn(formData) {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
