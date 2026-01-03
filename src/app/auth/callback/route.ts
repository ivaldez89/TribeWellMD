import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/calendar'
  const error_description = searchParams.get('error_description')

  // Handle errors from Supabase (e.g., expired links)
  if (error_description) {
    const errorMessage = encodeURIComponent(error_description)
    return NextResponse.redirect(`${origin}/auth/verify-email?error=${errorMessage}`)
  }

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session) {
      // Check what type of callback this is
      if (type === 'email_verification') {
        // Email was just verified - redirect to success page
        return NextResponse.redirect(`${origin}/auth/verify-email?verified=true`)
      }

      if (type === 'password_reset') {
        // Password reset flow - redirect to password update page
        return NextResponse.redirect(`${origin}/auth/update-password`)
      }

      // Default: normal sign in or sign up
      // Check if this is a new user who needs to complete onboarding
      const user = data.session.user
      const isNewUser = user.user_metadata?.onboarding_completed === false

      if (isNewUser) {
        return NextResponse.redirect(`${origin}/onboarding/village`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }

    // Handle specific error cases
    if (error) {
      console.error('Auth callback error:', error.message)

      if (error.message.includes('expired')) {
        return NextResponse.redirect(`${origin}/auth/verify-email?error=link_expired`)
      }

      if (error.message.includes('already')) {
        // Email already verified - redirect to login
        return NextResponse.redirect(`${origin}/login?message=Email already verified. Please sign in.`)
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/verify-email?error=verification_failed`)
}
