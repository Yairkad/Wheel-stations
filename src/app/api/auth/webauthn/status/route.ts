import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUserCredentials } from '@/lib/webauthn'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// GET /api/auth/webauthn/status?phone=...
// Returns { hasPasskey: boolean }
export async function GET(request: NextRequest) {
  const phone = request.nextUrl.searchParams.get('phone')
  if (!phone) return NextResponse.json({ hasPasskey: false })

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const cleanPhone = phone.replace(/\D/g, '')

  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('phone', cleanPhone)
    .single() as { data: { id: string } | null }

  if (!user) return NextResponse.json({ hasPasskey: false })

  const credentials = await getUserCredentials(user.id)
  return NextResponse.json({ hasPasskey: credentials.length > 0 })
}
