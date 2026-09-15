/**
 * Scrape vehicle PCD data from wheelfitment.eu (primary) and wheel-size.com (fallback)
 * POST /api/vehicle-models/scrape
 *
 * Body: { make, model, year, source?: 'wheelfitment' | 'wheelsize' | 'auto' }
 */

import { NextRequest, NextResponse } from 'next/server'
import { scrapeWheelfitment, scrapeWheelSize, ScrapeResult } from '@/lib/vehicle-scrape'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { make, model, year, source = 'auto' } = body

    if (!make || !model || !year) {
      return NextResponse.json({
        error: 'Missing required fields: make, model, year'
      }, { status: 400 })
    }

    const yearNum = parseInt(year)
    let result: ScrapeResult | null = null

    if (source === 'wheelfitment' || source === 'auto') {
      // Try wheelfitment.eu first
      result = await scrapeWheelfitment(make, model, yearNum)
    }

    if (!result && (source === 'wheelsize' || source === 'auto')) {
      // Try wheel-size.com as fallback
      result = await scrapeWheelSize(make, model, yearNum)
    }

    if (!result) {
      return NextResponse.json({
        error: 'לא נמצא מידע באף אחד מהאתרים',
        tried: source === 'auto' ? ['wheelfitment.eu', 'wheel-size.com'] : [source]
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error: unknown) {
    console.error('Scrape error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to scrape vehicle data'
    }, { status: 500 })
  }
}
