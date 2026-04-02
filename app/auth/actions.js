'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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
