import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { validateAdminSession } from '@/lib/admin-auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// DELETE - Remove a manually-trusted vehicle/wheel match
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await validateAdminSession(request)) {
    return NextResponse.json({ error: 'לא מורשה' }, { status: 403 })
  }
  try {
    const { id } = await params
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { error } = await supabase
      .from('trusted_vehicle_wheel_matches')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting trusted match:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית בשרת' }, { status: 500 })
  }
}
