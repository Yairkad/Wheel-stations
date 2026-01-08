/**
 * Compare current vehicle_models with new import data
 * Run: node scripts/compare-tables.js
 */

const fs = require('fs');
const path = require('path');

const currentFile = path.join(__dirname, 'current_vehicle_models.csv');
const newFile = path.join(__dirname, 'vehicle_models_import.csv');

// Parse CSV
function parseCSV(content) {
  const lines = content.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',');
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = values[idx]?.trim() || '';
    });
    rows.push(row);
  }
  return rows;
}

// Create key for matching
function makeKey(row) {
  const make = (row.make || '').toLowerCase();
  const model = (row.model || '').toLowerCase();
  const yearFrom = row.year_from || '';
  return `${make}|${model}|${yearFrom}`;
}

const currentContent = fs.readFileSync(currentFile, 'utf-8');
const newContent = fs.readFileSync(newFile, 'utf-8');

const currentRows = parseCSV(currentContent);
const newRows = parseCSV(newContent);

// Build maps
const currentMap = new Map();
currentRows.forEach(row => {
  const key = makeKey(row);
  currentMap.set(key, row);
});

const newMap = new Map();
newRows.forEach(row => {
  const key = makeKey(row);
  newMap.set(key, row);
});

// Find matches and differences
let exactMatches = 0;
let toUpdate = [];
let onlyInCurrent = [];
let onlyInNew = [];

// Check what's in new that matches current
for (const [key, newRow] of newMap) {
  if (currentMap.has(key)) {
    const currentRow = currentMap.get(key);
    // Check if we need to update (new has rim_sizes_allowed or source_url that current doesn't)
    const needsUpdate =
      (newRow.rim_sizes_allowed && !currentRow.rim_sizes_allowed) ||
      (newRow.source_url && !currentRow.source_url);

    if (needsUpdate) {
      toUpdate.push({ key, current: currentRow, new: newRow });
    } else {
      exactMatches++;
    }
  } else {
    onlyInNew.push(newRow);
  }
}

// Check what's only in current
for (const [key, currentRow] of currentMap) {
  if (!newMap.has(key)) {
    onlyInCurrent.push(currentRow);
  }
}

// Report
console.log('=== השוואת טבלאות ===\n');
console.log(`רשומות קיימות ב-Supabase: ${currentRows.length}`);
console.log(`רשומות חדשות לייבוא: ${newRows.length}`);
console.log('');
console.log('--- תוצאות ---');
console.log(`התאמות מלאות (לא צריך לעשות כלום): ${exactMatches}`);
console.log(`רשומות קיימות שצריך לעדכן (להוסיף rim_sizes/source_url): ${toUpdate.length}`);
console.log(`רשומות חדשות להוספה: ${onlyInNew.length}`);
console.log(`רשומות קיימות שאין בקובץ החדש (יישארו): ${onlyInCurrent.length}`);

console.log('\n--- המלצה ---');
if (toUpdate.length > 0 || onlyInNew.length > 0) {
  console.log(`מומלץ להריץ UPSERT שיעדכן ${toUpdate.length} רשומות ויוסיף ${onlyInNew.length} חדשות.`);
  console.log('הרשומות הקיימות שאין בקובץ החדש יישארו ללא שינוי.');
}

// Show sample of each category
if (toUpdate.length > 0) {
  console.log('\n--- דוגמאות לרשומות שיתעדכנו (5 ראשונות) ---');
  toUpdate.slice(0, 5).forEach(item => {
    console.log(`  ${item.key} => יתווסף rim_sizes: ${item.new.rim_sizes_allowed}`);
  });
}

if (onlyInNew.length > 0) {
  console.log('\n--- דוגמאות לרשומות חדשות (5 ראשונות) ---');
  onlyInNew.slice(0, 5).forEach(row => {
    console.log(`  ${row.make} ${row.model} (${row.year_from})`);
  });
}

if (onlyInCurrent.length > 0) {
  console.log('\n--- דוגמאות לרשומות שיישארו (5 ראשונות) ---');
  onlyInCurrent.slice(0, 5).forEach(row => {
    console.log(`  ${row.make} ${row.model} (${row.year_from}) - ${row.make_he || ''}`);
  });
}
