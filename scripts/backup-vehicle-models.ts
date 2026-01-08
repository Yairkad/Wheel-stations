/**
 * Backup vehicle_models table to JSON file
 *
 * Usage:
 * Set environment variables first, then run:
 * npx ts-node scripts/backup-vehicle-models.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Read .env.local manually
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim()
    }
  })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables!')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function backup() {
  console.log('Starting backup of vehicle_models table...')

  // Fetch all records
  const { data, error, count } = await supabase
    .from('vehicle_models')
    .select('*', { count: 'exact' })

  if (error) {
    console.error('Error fetching data:', error.message)
    process.exit(1)
  }

  if (!data || data.length === 0) {
    console.log('No data found in vehicle_models table')
    return
  }

  // Create backup filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupFileName = `vehicle_models_backup_${timestamp}.json`
  const backupPath = path.join(__dirname, backupFileName)

  // Write to file
  fs.writeFileSync(backupPath, JSON.stringify(data, null, 2), 'utf-8')

  console.log('\n=== Backup Complete ===')
  console.log(`Records backed up: ${data.length}`)
  console.log(`Backup file: ${backupPath}`)

  // Show summary of data
  const makes = [...new Set(data.map(d => d.make))].length
  const withCenterBore = data.filter(d => d.center_bore).length
  const withRimSizes = data.filter(d => d.rim_sizes_allowed?.length > 0).length

  console.log('\n=== Data Summary ===')
  console.log(`Total records: ${data.length}`)
  console.log(`Unique makes: ${makes}`)
  console.log(`With center_bore: ${withCenterBore}`)
  console.log(`With rim_sizes_allowed: ${withRimSizes}`)
}

backup().catch(console.error)
