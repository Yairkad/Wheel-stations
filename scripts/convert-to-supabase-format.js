/**
 * Convert wheel_fitment_real.csv to Supabase-compatible format
 * Run: node scripts/convert-to-supabase-format.js
 */

const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'wheel_fitment_real.csv');
const outputFile = path.join(__dirname, 'vehicle_models_import.csv');

// Hebrew translations for makes
const makeHebrewMap = {
  'alfa romeo': 'אלפא רומיאו',
  'audi': 'אאודי',
  'bentley': 'בנטלי',
  'bmw': 'ב.מ.וו',
  'byd': 'בי.ווי.די',
  'cadillac': 'קדילאק',
  'chery': 'צ\'רי',
  'chevrolet': 'שברולט',
  'chrysler': 'קרייזלר',
  'citroen': 'סיטרואן',
  'cupra': 'קופרה',
  'dacia': 'דאצ\'יה',
  'daihatsu': 'דייהטסו',
  'dodge': 'דודג\'',
  'dongfeng': 'דונגפנג',
  'ds': 'די.אס',
  'ferrari': 'פרארי',
  'fiat': 'פיאט',
  'ford': 'פורד',
  'geely': 'ג\'ילי',
  'genesis': 'ג\'נסיס',
  'gmc': 'ג\'י.אם.סי',
  'honda': 'הונדה',
  'hummer': 'האמר',
  'hyundai': 'יונדאי',
  'infiniti': 'אינפיניטי',
  'isuzu': 'איסוזו',
  'jaguar': 'יגואר',
  'jeep': 'ג\'יפ',
  'kia': 'קיה',
  'lamborghini': 'למבורגיני',
  'lancia': 'לאנצ\'יה',
  'land rover': 'לנד רובר',
  'lexus': 'לקסוס',
  'lincoln': 'לינקולן',
  'lotus': 'לוטוס',
  'maserati': 'מזראטי',
  'mazda': 'מזדה',
  'mercedes': 'מרצדס',
  'mercedes-benz': 'מרצדס',
  'mg': 'אם.ג\'י',
  'mini': 'מיני',
  'mitsubishi': 'מיצובישי',
  'nissan': 'ניסאן',
  'opel': 'אופל',
  'peugeot': 'פיג\'ו',
  'polestar': 'פולסטאר',
  'porsche': 'פורשה',
  'ram': 'ראם',
  'renault': 'רנו',
  'rolls-royce': 'רולס רויס',
  'rover': 'רובר',
  'saab': 'סאאב',
  'seat': 'סיאט',
  'skoda': 'סקודה',
  'smart': 'סמארט',
  'ssangyong': 'סאנגיונג',
  'subaru': 'סובארו',
  'suzuki': 'סוזוקי',
  'tesla': 'טסלה',
  'toyota': 'טויוטה',
  'volkswagen': 'פולקסווגן',
  'volvo': 'וולוו',
  'xpeng': 'אקספנג',
  'zeekr': 'זיקר'
};

const csvContent = fs.readFileSync(inputFile, 'utf-8');
const lines = csvContent.split('\n').filter(line => line.trim());

// Skip header
const dataLines = lines.slice(1);

// Output header matching vehicle_models table (added make_he)
const outputHeader = 'make,make_he,model,year_from,year_to,bolt_count,bolt_spacing,center_bore,rim_sizes_allowed,source_url,source';
const outputRows = [outputHeader];

function parseYearRange(yearRange) {
  const match = yearRange.match(/(\d{4})\s*-\s*(\d{4})?/);
  if (!match) return { yearFrom: null, yearTo: null };
  return {
    yearFrom: parseInt(match[1]),
    yearTo: match[2] ? parseInt(match[2]) : null
  };
}

function parsePcd(pcd) {
  const match = pcd.match(/(\d+)x([\d.]+)/);
  if (!match) return null;
  return {
    boltCount: parseInt(match[1]),
    boltSpacing: parseFloat(match[2])
  };
}

function parseRimSizes(row) {
  const sizes = [];
  const rimColumns = [
    { index: 5, size: 12 },
    { index: 6, size: 13 },
    { index: 7, size: 14 },
    { index: 8, size: 15 },
    { index: 9, size: 16 },
    { index: 10, size: 17 },
    { index: 11, size: 18 },
    { index: 12, size: 19 },
    { index: 13, size: 20 },
  ];

  for (const { index, size } of rimColumns) {
    if (row[index] === '1') {
      sizes.push(size);
    }
  }

  return sizes;
}

function escapeCSV(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

// Track makes without Hebrew translation
const missingTranslations = new Set();

for (const line of dataLines) {
  const row = line.split(',');

  if (row.length < 15) continue;

  const make = row[0]?.toLowerCase().trim();
  const model = row[1]?.toLowerCase().trim();
  const yearRange = row[2]?.trim() || '';
  const pcd = row[3]?.trim() || '';
  const centerBore = row[4]?.trim() || '';
  const url = row[14]?.trim() || '';

  if (!make || !model) continue;

  const { yearFrom, yearTo } = parseYearRange(yearRange);
  const pcdParsed = parsePcd(pcd);
  const rimSizes = parseRimSizes(row);

  if (!pcdParsed) continue;

  const centerBoreNum = centerBore ? parseFloat(centerBore) : '';

  // Get Hebrew name
  const makeHe = makeHebrewMap[make] || '';
  if (!makeHe) {
    missingTranslations.add(make);
  }

  // Format rim_sizes_allowed as PostgreSQL array: {12,14,15,16}
  const rimSizesFormatted = rimSizes.length > 0 ? `"{${rimSizes.join(',')}}"` : '';

  const outputRow = [
    escapeCSV(make),
    escapeCSV(makeHe),
    escapeCSV(model),
    yearFrom || '',
    yearTo || '',
    pcdParsed.boltCount,
    pcdParsed.boltSpacing,
    centerBoreNum,
    rimSizesFormatted,
    escapeCSV(url),
    'wheelfitment.eu'
  ].join(',');

  outputRows.push(outputRow);
}

fs.writeFileSync(outputFile, outputRows.join('\n'), 'utf-8');

console.log(`Converted ${outputRows.length - 1} records`);
console.log(`Output file: ${outputFile}`);

if (missingTranslations.size > 0) {
  console.log(`\nיצרנים ללא תרגום לעברית (${missingTranslations.size}):`);
  [...missingTranslations].sort().forEach(m => console.log(`  - ${m}`));
}
