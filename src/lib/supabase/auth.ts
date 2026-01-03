'use server'

import { createClient } from './server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export type UserRole = 'premed' | 'medical-student' | 'resident' | 'fellow' | 'attending' | 'institution'

export interface SignUpData {
  email: string
  password: string
  firstName: string
  lastName: string
  role: UserRole
  institution: string
  currentYear?: string
  specialty?: string
  pgyYear?: string
  jobTitle?: string
}

export async function signUp(data: SignUpData) {
  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        first_name: data.firstName,
        last_name: data.lastName,
        role: data.role,
        institution: data.institution,
        current_year: data.currentYear,
        specialty: data.specialty,
        pgy_year: data.pgyYear,
        job_title: data.jobTitle,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (authError) {
    return { error: authError.message }
  }

  return { success: true, user: authData.user }
}

export async function signIn(email: string, password: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true, user: data.user }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

export async function getSession() {
  const supabase = await createClient()
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error || !session) {
    return null
  }

  return session
}

export async function resendVerificationEmail(email: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?type=email_verification`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function isEmailVerified() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return { verified: false, user: null }
  }

  // Supabase sets email_confirmed_at when email is verified
  const verified = !!user.email_confirmed_at
  return { verified, user }
}

export async function resetPassword(email: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?type=password_reset`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
