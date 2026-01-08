const fs = require('fs');
const path = require('path');

// Read the big SQL file
const sqlFile = path.join(__dirname, 'upsert_vehicle_models.sql');
const content = fs.readFileSync(sqlFile, 'utf8');

// Split by INSERT statements
const lines = content.split('\n');
const header = [];
const inserts = [];

let currentInsert = [];
let inInsert = false;

for (const line of lines) {
  if (line.startsWith('-- First') || line.startsWith('-- Run this') || line.startsWith('-- CREATE') || line.startsWith('BEGIN;')) {
    header.push(line);
  } else if (line.startsWith('-- ') && line.includes('(') && !inInsert) {
    // Comment before INSERT (like "-- byd atto 3 (2021)")
    currentInsert = [line];
    inInsert = true;
  } else if (line.startsWith('INSERT INTO')) {
    currentInsert.push(line);
  } else if (line.startsWith('VALUES')) {
    currentInsert.push(line);
  } else if (line.startsWith('ON CONFLICT')) {
    currentInsert.push(line);
  } else if (line.startsWith('DO UPDATE')) {
    currentInsert.push(line);
  } else if (line.includes('updated_at = NOW();')) {
    currentInsert.push(line);
    inserts.push(currentInsert.join('\n'));
    currentInsert = [];
    inInsert = false;
  } else if (inInsert && line.trim()) {
    currentInsert.push(line);
  }
}

console.log(`Found ${inserts.length} INSERT statements`);

// Split into chunks of 200
const chunkSize = 200;
const chunks = [];
for (let i = 0; i < inserts.length; i += chunkSize) {
  chunks.push(inserts.slice(i, i + chunkSize));
}

console.log(`Creating ${chunks.length} files...`);

// Write each chunk to a separate file
for (let i = 0; i < chunks.length; i++) {
  const filename = path.join(__dirname, `upsert_part_${i + 1}.sql`);
  const content = `-- Part ${i + 1} of ${chunks.length}\n-- Records: ${chunks[i].length}\n\nBEGIN;\n\n${chunks[i].join('\n\n')}\n\nCOMMIT;\n`;
  fs.writeFileSync(filename, content);
  console.log(`Created: upsert_part_${i + 1}.sql (${chunks[i].length} records)`);
}

console.log('\nDone! Run each file in Supabase SQL Editor in order.');
