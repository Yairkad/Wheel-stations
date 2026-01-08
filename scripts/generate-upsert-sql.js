/**
 * Generate SQL UPSERT statements for vehicle_models
 * Run: node scripts/generate-upsert-sql.js
 * Then copy the output SQL file content to Supabase SQL Editor
 */

const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'vehicle_models_import.csv');
const outputFile = path.join(__dirname, 'upsert_vehicle_models.sql');

const csvContent = fs.readFileSync(inputFile, 'utf-8');
const lines = csvContent.split('\n').filter(line => line.trim());

// Skip header
const dataLines = lines.slice(1);

// SQL escape function
function escapeSql(value) {
  if (value === null || value === undefined || value === '') return 'NULL';
  return "'" + String(value).replace(/'/g, "''") + "'";
}

let sql = `-- UPSERT vehicle_models from wheelfitment.eu data
-- Generated: ${new Date().toISOString()}
-- Records: ${dataLines.length}

-- First, create a unique constraint if not exists (needed for upsert)
-- Run this only once:
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_vehicle_models_make_model_year
-- ON vehicle_models (make, model, year_from) WHERE year_from IS NOT NULL;

BEGIN;

`;

let count = 0;
for (const line of dataLines) {
  // Parse CSV line properly (handle quoted fields)
  const parts = [];
  let current = '';
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  parts.push(current.trim());

  const [make, makeHe, model, yearFrom, yearTo, boltCount, boltSpacing, centerBore, rimSizesRaw, sourceUrl, source] = parts;

  if (!make || !model) continue;

  // Parse rim_sizes_allowed - remove quotes and convert to array format
  let rimSizes = 'NULL';
  if (rimSizesRaw && rimSizesRaw !== '') {
    // rimSizesRaw is like "{15,16,17}" - keep as is for PostgreSQL array
    rimSizes = "'" + rimSizesRaw.replace(/"/g, '') + "'";
  }

  const yearFromVal = yearFrom ? yearFrom : 'NULL';
  const yearToVal = yearTo ? yearTo : 'NULL';
  const centerBoreVal = centerBore ? centerBore : 'NULL';

  sql += `
-- ${make} ${model} (${yearFrom || 'unknown'})
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES (${escapeSql(make)}, ${escapeSql(makeHe)}, ${escapeSql(model)}, ${yearFromVal}, ${yearToVal}, ${boltCount}, ${boltSpacing}, ${centerBoreVal}, ${rimSizes}, ${escapeSql(sourceUrl)}, ${escapeSql(source)})
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();
`;

  count++;
}

sql += `
COMMIT;

-- Summary: ${count} records processed
`;

fs.writeFileSync(outputFile, sql, 'utf-8');

console.log(`Generated SQL with ${count} UPSERT statements`);
console.log(`Output file: ${outputFile}`);
console.log('\nלהרצה ב-Supabase:');
console.log('1. פתח SQL Editor ב-Supabase');
console.log('2. העתק את תוכן הקובץ upsert_vehicle_models.sql');
console.log('3. הרץ את ה-SQL');
