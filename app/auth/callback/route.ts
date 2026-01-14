import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')

  // For password recovery, redirect to reset password page
  let next = searchParams.get('next') ?? '/search'
  if (type === 'recovery' || type === 'magiclink') {
    next = '/auth/reset-password'
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return error page
  return NextResponse.redirect(`${origin}/auth/error`)
}
