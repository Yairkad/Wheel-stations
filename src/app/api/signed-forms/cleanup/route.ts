/**
 * Signed Forms Cleanup API
 * POST /api/signed-forms/cleanup - Delete expired forms (older than 30 days)
 *
 * This endpoint should be called periodically (e.g., via cron job)
 * to clean up expired forms from storage and database.
 *
 * Security: Requires CRON_SECRET header for authorization
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret (for Vercel cron jobs or manual triggers)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    // Allow if CRON_SECRET is set and matches, or if no CRON_SECRET is configured (dev mode)
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find expired forms
    const { data: expiredForms, error: fetchError } = await supabase
      .from('signed_forms')
      .select('id, storage_path')
      .lt('expires_at', new Date().toISOString())

    if (fetchError) {
      console.error('Error fetching expired forms:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch expired forms' }, { status: 500 })
    }

    if (!expiredForms || expiredForms.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No expired forms to clean up',
        deleted: 0
      })
    }

    // Delete files from storage
    const storagePaths = expiredForms.map(f => f.storage_path)
    const { error: storageError } = await supabase
      .storage
      .from('signed-forms')
      .remove(storagePaths)

    if (storageError) {
      console.error('Error deleting files from storage:', storageError)
      // Continue anyway to delete database records
    }

    // Delete database records
    const formIds = expiredForms.map(f => f.id)
    const { error: deleteError } = await supabase
      .from('signed_forms')
      .delete()
      .in('id', formIds)

    if (deleteError) {
      console.error('Error deleting form records:', deleteError)
      return NextResponse.json({ error: 'Failed to delete form records' }, { status: 500 })
    }

    console.log(`Cleaned up ${expiredForms.length} expired forms`)

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${expiredForms.length} expired forms`,
      deleted: expiredForms.length
    })

  } catch (error) {
    console.error('Error in signed-forms cleanup:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// Also support GET for easy testing in browser (with auth)
export async function GET(request: NextRequest) {
  return POST(request)
}
