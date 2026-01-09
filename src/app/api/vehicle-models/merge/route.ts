import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface VehicleModel {
  id: string
  make: string
  make_he: string | null
  model: string
  variants: string | null
  year_from: number | null
  year_to: number | null
  bolt_count: number | null
  bolt_spacing: number | null
  center_bore: number | null
  rim_size: string | null
  rim_sizes_allowed: number[] | null
  tire_size_front: string | null
  source_url: string | null
}

// Helper to pick the best value (non-null, longer string, or first defined)
function pickBestValue<T>(values: (T | null | undefined)[]): T | null {
  const defined = values.filter(v => v !== null && v !== undefined) as T[]
  if (defined.length === 0) return null

  // For strings, prefer longer ones (usually more complete)
  if (typeof defined[0] === 'string') {
    return defined.sort((a, b) => String(b).length - String(a).length)[0]
  }

  // For arrays, prefer longer ones
  if (Array.isArray(defined[0])) {
    return defined.sort((a, b) => (b as unknown[]).length - (a as unknown[]).length)[0]
  }

  // For numbers, return first defined
  return defined[0]
}

// POST - Merge duplicate vehicle models
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { ids } = await request.json()

    if (!ids || !Array.isArray(ids) || ids.length < 2) {
      return NextResponse.json({ error: 'נדרשים לפחות 2 מזהים למיזוג' }, { status: 400 })
    }

    // Fetch all records to merge
    const { data: records, error: fetchError } = await supabase
      .from('vehicle_models')
      .select('*')
      .in('id', ids)

    if (fetchError || !records || records.length < 2) {
      return NextResponse.json({ error: 'לא נמצאו רשומות למיזוג' }, { status: 404 })
    }

    // Merge records - pick best value for each field
    const merged: Partial<VehicleModel> = {
      make: pickBestValue(records.map(r => r.make)) || records[0].make,
      make_he: pickBestValue(records.map(r => r.make_he)),
      model: pickBestValue(records.map(r => r.model)) || records[0].model,
      variants: pickBestValue(records.map(r => r.variants)),
      year_from: pickBestValue(records.map(r => r.year_from)),
      year_to: pickBestValue(records.map(r => r.year_to)),
      bolt_count: pickBestValue(records.map(r => r.bolt_count)),
      bolt_spacing: pickBestValue(records.map(r => r.bolt_spacing)),
      center_bore: pickBestValue(records.map(r => r.center_bore)),
      rim_size: pickBestValue(records.map(r => r.rim_size)),
      rim_sizes_allowed: pickBestValue(records.map(r => r.rim_sizes_allowed)),
      tire_size_front: pickBestValue(records.map(r => r.tire_size_front)),
      source_url: pickBestValue(records.map(r => r.source_url)),
    }

    // Update the first record with merged data
    const primaryId = ids[0]
    const { error: updateError } = await supabase
      .from('vehicle_models')
      .update(merged)
      .eq('id', primaryId)

    if (updateError) {
      console.error('Merge update error:', updateError)
      return NextResponse.json({ error: 'שגיאה בעדכון הרשומה הממוזגת' }, { status: 500 })
    }

    // Delete the other records
    const idsToDelete = ids.slice(1)
    const { error: deleteError } = await supabase
      .from('vehicle_models')
      .delete()
      .in('id', idsToDelete)

    if (deleteError) {
      console.error('Merge delete error:', deleteError)
      return NextResponse.json({ error: 'שגיאה במחיקת הכפילויות' }, { status: 500 })
    }

    // Fetch the updated record
    const { data: mergedRecord } = await supabase
      .from('vehicle_models')
      .select('*')
      .eq('id', primaryId)
      .single()

    return NextResponse.json({
      success: true,
      merged: mergedRecord,
      deletedCount: idsToDelete.length,
      message: `מוזגו ${records.length} רשומות לרשומה אחת`
    })

  } catch (error: any) {
    console.error('Merge API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET - Find duplicate vehicle models
export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Find duplicates based on make + model + year_from + year_to
    const { data: allRecords, error } = await supabase
      .from('vehicle_models')
      .select('*')
      .order('make')
      .order('model')
      .order('year_from')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Helper to normalize model name for comparison
    const normalizeModel = (model: string): string => {
      return model?.toLowerCase()
        .replace(/\s+/g, '') // Remove spaces
        .replace(/[-_]/g, '') // Remove dashes and underscores
        .replace(/\d+[a-z]?$/i, '') // Remove trailing generation codes like "8l", "8p"
        .trim()
    }

    // Helper to check if models are similar (one contains the other or same normalized)
    const areModelsSimilar = (m1: string, m2: string): boolean => {
      const n1 = normalizeModel(m1)
      const n2 = normalizeModel(m2)

      // Exact match after normalization
      if (n1 === n2) return true

      // One is contained in the other (e.g., "a3" and "a3 8l")
      const l1 = m1?.toLowerCase().replace(/\s+/g, '')
      const l2 = m2?.toLowerCase().replace(/\s+/g, '')
      if (l1.startsWith(l2) || l2.startsWith(l1)) return true

      return false
    }

    // Group by make + model + overlapping years
    const duplicateGroups: VehicleModel[][] = []
    const processed = new Set<string>()

    for (const record of allRecords || []) {
      if (processed.has(record.id)) continue

      // Find potential duplicates
      const duplicates = (allRecords || []).filter(r => {
        if (r.id === record.id || processed.has(r.id)) return false

        // Same make
        if (r.make?.toLowerCase() !== record.make?.toLowerCase()) return false

        // Similar model (exact match or one contains the other)
        if (!areModelsSimilar(r.model, record.model)) return false

        // Overlapping year ranges or same years
        const r1Start = record.year_from || 1900
        const r1End = record.year_to || 2100
        const r2Start = r.year_from || 1900
        const r2End = r.year_to || 2100

        // Check if years truly overlap (not just touch at edges)
        // For example: 1982-1990 and 1990-1994 should NOT be considered duplicates
        // But 1996-2003 and 1996-2003 SHOULD be considered duplicates
        const overlapStart = Math.max(r1Start, r2Start)
        const overlapEnd = Math.min(r1End, r2End)
        const overlapYears = overlapEnd - overlapStart

        // Require at least 2 years of overlap to be considered duplicate
        const hasSignificantOverlap = overlapYears >= 2

        return hasSignificantOverlap
      })

      if (duplicates.length > 0) {
        const group = [record, ...duplicates]
        group.forEach(r => processed.add(r.id))
        duplicateGroups.push(group)
      }
    }

    return NextResponse.json({
      duplicateGroups,
      totalGroups: duplicateGroups.length,
      totalDuplicates: duplicateGroups.reduce((sum, g) => sum + g.length, 0)
    })

  } catch (error: any) {
    console.error('Find duplicates error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
