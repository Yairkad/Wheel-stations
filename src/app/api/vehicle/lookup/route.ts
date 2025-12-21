/**
 * Vehicle Lookup API
 * GET /api/vehicle/lookup?plate=1234567 - Get vehicle details by license plate from data.gov.il
 * Returns vehicle info + PCD (bolt pattern) for wheel matching
 *
 * Searches in two databases:
 * 1. Regular vehicles database (053cea08-09bc-40ec-8f7a-156f0677aff3)
 * 2. Personal import vehicles database (03adc637-b6fe-402b-9937-7c3d3afc9140) - fallback
 */

import { NextRequest, NextResponse } from 'next/server'
import { extractMakeFromHebrew } from '@/lib/pcd-database'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// data.gov.il resource IDs for vehicle databases
const RESOURCE_ID_REGULAR = '053cea08-09bc-40ec-8f7a-156f0677aff3'
const RESOURCE_ID_PERSONAL_IMPORT = '03adc637-b6fe-402b-9937-7c3d3afc9140'

// Regular vehicle record (has tire info)
interface VehicleRecord {
  mispar_rechev: number
  tozeret_nm: string        // Manufacturer (Hebrew) - e.g. "פיאט תורכיה"
  tozeret_cd: number        // Manufacturer code
  kinuy_mishari: string     // Commercial name (Hebrew) - e.g. "QUBO"
  degem_nm: string          // Model name - e.g. "225AXF1A-07B"
  degem_cd: number          // Model code
  ramat_gimur: string       // Trim level - e.g. "ACTIVE"
  shnat_yitzur: number      // Year of manufacture
  sug_degem: string         // Model type
  baalut: string            // Ownership type
  misgeret: string          // Chassis number
  tzeva_cd: number          // Color code
  tzeva_rechev: string      // Vehicle color
  zmig_kidmi: string        // Front tire - e.g. "185/65R15"
  zmig_ahori: string        // Rear tire
  sug_delek_nm: string      // Fuel type
  horaat_rishum: number     // Registration instruction
  moed_aliya_lakvish: string // Road entry date
  tokef_dt: string          // License expiry date
  mivchan_acharon_dt: string // Last test date
}

// Personal import vehicle record (no tire info)
interface PersonalImportRecord {
  mispar_rechev: number
  shilda: string            // VIN/chassis number
  tozeret_cd: number        // Manufacturer code
  tozeret_nm: string        // Manufacturer name - e.g. "TOYOTA USA"
  sug_rechev_cd: number     // Vehicle type code
  sug_rechev_nm: string     // Vehicle type
  degem_nm: string          // Model name - e.g. "HYBRID AHV40L-CEXGBA"
  mishkal_kolel: number     // Total weight
  shnat_yitzur: number      // Year of manufacture
  nefach_manoa: number      // Engine displacement
  tozeret_eretz_nm: string  // Country of origin
  degem_manoa: string       // Engine model
  mivchan_acharon_dt: string // Last inspection date
  tokef_dt: string          // License expiry date
  sug_yevu: string          // Import type - e.g. "יבוא אישי-משומש"
  moed_aliya_lakvish: string // Road entry date
  sug_delek_nm: string      // Fuel type
}

interface DataGovResponse<T> {
  success: boolean
  result: {
    records: T[]
    total: number
  }
}

// Helper function to search for PCD data in our database
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function findPcdData(
  supabase: any,
  makeHebrew: string,
  modelName: string,
  year: number
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const makeEnglish = extractMakeFromHebrew(makeHebrew)
  if (!makeEnglish) return null

  const modelLower = modelName?.toLowerCase() || ''

  // First try: exact model match
  let { data: vehicleModels, error } = await supabase
    .from('vehicle_models')
    .select('*')
    .or(`make.ilike.%${makeEnglish}%,make_he.ilike.%${makeHebrew}%`)
    .ilike('model', `%${modelLower}%`)
    .lte('year_from', year)
    .or(`year_to.gte.${year},year_to.is.null`)
    .limit(1)

  if (!error && vehicleModels && vehicleModels.length > 0) {
    return vehicleModels[0]
  }

  // Second try: search in variants column
  const result2 = await supabase
    .from('vehicle_models')
    .select('*')
    .or(`make.ilike.%${makeEnglish}%,make_he.ilike.%${makeHebrew}%`)
    .ilike('variants', `%${modelLower}%`)
    .lte('year_from', year)
    .or(`year_to.gte.${year},year_to.is.null`)
    .limit(1)

  if (!result2.error && result2.data && result2.data.length > 0) {
    return result2.data[0]
  }

  // Third try: search for first word only (e.g., "CAMRY" from "CAMRY HYBRID")
  if (modelLower.includes(' ')) {
    const firstWord = modelLower.split(' ')[0]
    const result3 = await supabase
      .from('vehicle_models')
      .select('*')
      .or(`make.ilike.%${makeEnglish}%,make_he.ilike.%${makeHebrew}%`)
      .ilike('model', `%${firstWord}%`)
      .lte('year_from', year)
      .or(`year_to.gte.${year},year_to.is.null`)
      .limit(1)

    if (!result3.error && result3.data && result3.data.length > 0) {
      return result3.data[0]
    }
  }

  // Note: We intentionally don't search by make only, as different models
  // of the same make can have different PCDs (e.g., Toyota Prius 5x100 vs Camry 5x114.3)
  return null
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const plate = searchParams.get('plate')

    if (!plate) {
      return NextResponse.json(
        { error: 'Missing plate parameter' },
        { status: 400 }
      )
    }

    // Clean the plate number - remove dashes and spaces
    const cleanPlate = plate.replace(/[-\s]/g, '')

    // Validate plate format (7-8 digits)
    if (!/^\d{7,8}$/.test(cleanPlate)) {
      return NextResponse.json(
        { error: 'Invalid plate format. Expected 7-8 digits.' },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Step 1: Try regular vehicles database first
    const regularApiUrl = new URL('https://data.gov.il/api/3/action/datastore_search')
    regularApiUrl.searchParams.set('resource_id', RESOURCE_ID_REGULAR)
    regularApiUrl.searchParams.set('q', cleanPlate)
    regularApiUrl.searchParams.set('limit', '1')

    const regularResponse = await fetch(regularApiUrl.toString(), {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 }
    })

    if (regularResponse.ok) {
      const regularData: DataGovResponse<VehicleRecord> = await regularResponse.json()

      if (regularData.success && regularData.result.records.length > 0) {
        const vehicle = regularData.result.records[0]
        const pcdData = await findPcdData(
          supabase,
          vehicle.tozeret_nm,
          vehicle.kinuy_mishari,
          vehicle.shnat_yitzur
        )

        return NextResponse.json({
          success: true,
          source: 'regular',
          vehicle: {
            plate: vehicle.mispar_rechev,
            manufacturer: vehicle.tozeret_nm,
            manufacturer_code: vehicle.tozeret_cd,
            model: vehicle.kinuy_mishari,
            model_name: vehicle.degem_nm,
            model_code: vehicle.degem_cd,
            trim: vehicle.ramat_gimur,
            year: vehicle.shnat_yitzur,
            color: vehicle.tzeva_rechev,
            fuel_type: vehicle.sug_delek_nm,
            front_tire: vehicle.zmig_kidmi,
            rear_tire: vehicle.zmig_ahori,
            license_expiry: vehicle.tokef_dt,
            last_test: vehicle.mivchan_acharon_dt,
            road_entry_date: vehicle.moed_aliya_lakvish,
            ownership: vehicle.baalut,
            chassis: vehicle.misgeret,
          },
          wheel_fitment: pcdData ? {
            bolt_count: pcdData.bolt_count,
            bolt_spacing: pcdData.bolt_spacing,
            pcd: `${pcdData.bolt_count}x${pcdData.bolt_spacing}`,
            center_bore: pcdData.center_bore,
          } : null,
          pcd_found: !!pcdData
        })
      }
    }

    // Step 2: Vehicle not found in regular database, try personal import database
    const importApiUrl = new URL('https://data.gov.il/api/3/action/datastore_search')
    importApiUrl.searchParams.set('resource_id', RESOURCE_ID_PERSONAL_IMPORT)
    importApiUrl.searchParams.set('q', cleanPlate)
    importApiUrl.searchParams.set('limit', '1')

    const importResponse = await fetch(importApiUrl.toString(), {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 }
    })

    if (!importResponse.ok) {
      console.error('data.gov.il API error:', importResponse.status, importResponse.statusText)
      return NextResponse.json(
        { error: 'Failed to fetch vehicle data from government database' },
        { status: 502 }
      )
    }

    const importData: DataGovResponse<PersonalImportRecord> = await importResponse.json()

    if (!importData.success || !importData.result.records.length) {
      return NextResponse.json(
        { error: 'Vehicle not found', plate: cleanPlate },
        { status: 404 }
      )
    }

    // Found in personal import database
    const vehicle = importData.result.records[0]

    // Extract model name from degem_nm (e.g., "HYBRID AHV40L-CEXGBA" -> try to find "CAMRY" or similar)
    // For personal imports, we search by make and try to find matching PCD
    const pcdData = await findPcdData(
      supabase,
      vehicle.tozeret_nm,
      vehicle.degem_nm,
      vehicle.shnat_yitzur
    )

    return NextResponse.json({
      success: true,
      source: 'personal_import', // Indicate this is from personal import database
      is_personal_import: true,
      personal_import_warning: 'רכב זה מיובא בייבוא אישי. מידות הגלגלים עשויות להיות שונות מהדגם המקומי.',
      vehicle: {
        plate: vehicle.mispar_rechev,
        manufacturer: vehicle.tozeret_nm,
        manufacturer_code: vehicle.tozeret_cd,
        model: vehicle.degem_nm,           // Use degem_nm as model for personal imports
        model_name: vehicle.degem_nm,
        year: vehicle.shnat_yitzur,
        fuel_type: vehicle.sug_delek_nm,
        license_expiry: vehicle.tokef_dt,
        last_test: vehicle.mivchan_acharon_dt,
        road_entry_date: vehicle.moed_aliya_lakvish,
        chassis: vehicle.shilda,
        import_type: vehicle.sug_yevu,      // e.g., "יבוא אישי-משומש"
        origin_country: vehicle.tozeret_eretz_nm, // e.g., "USA"
        engine_displacement: vehicle.nefach_manoa,
        // Note: Personal import database doesn't have tire info
        front_tire: null,
        rear_tire: null,
      },
      wheel_fitment: pcdData ? {
        bolt_count: pcdData.bolt_count,
        bolt_spacing: pcdData.bolt_spacing,
        pcd: `${pcdData.bolt_count}x${pcdData.bolt_spacing}`,
        center_bore: pcdData.center_bore,
      } : null,
      pcd_found: !!pcdData
    })

  } catch (error) {
    console.error('Error in vehicle lookup:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
