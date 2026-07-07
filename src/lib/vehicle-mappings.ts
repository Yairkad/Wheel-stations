/**
 * Hebrew-English vehicle brand and model mappings
 * Used by both main page and search page for vehicle lookups
 */

// Common Hebrew to English car brand mappings
export const hebrewToEnglishMakes: Record<string, string> = {
  'טויוטה': 'Toyota', 'יונדאי': 'Hyundai', 'קיא': 'Kia', 'מזדה': 'Mazda',
  'הונדה': 'Honda', 'ניסאן': 'Nissan', 'סוזוקי': 'Suzuki', 'מיצובישי': 'Mitsubishi',
  'סובארו': 'Subaru', 'פולקסווגן': 'Volkswagen', 'סקודה': 'Skoda', 'סיאט': 'Seat',
  'אאודי': 'Audi', 'במוו': 'BMW', 'מרצדס': 'Mercedes-Benz', 'פיג\'ו': 'Peugeot',
  'סיטרואן': 'Citroen', 'רנו': 'Renault', 'פיאט': 'Fiat', 'אלפא רומאו': 'Alfa Romeo',
  'שברולט': 'Chevrolet', 'פורד': 'Ford', 'ג\'יפ': 'Jeep', 'דאצ\'יה': 'Dacia',
  'אופל': 'Opel', 'וולוו': 'Volvo', 'לקסוס': 'Lexus', 'אינפיניטי': 'Infiniti',
  'טסלה': 'Tesla', 'BYD': 'BYD', 'ביי די': 'BYD', 'בי ווי די': 'BYD', 'ביי וואי די': 'BYD',
  'ג\'ילי': 'Geely', 'גילי': 'Geely', 'MG': 'MG', 'מיני': 'Mini',
  'איסוזו': 'Isuzu', 'מיצובישי פוסו': 'Mitsubishi Fuso', 'לאדה': 'Lada'
}

// Common Hebrew to English car model mappings
export const hebrewToEnglishModels: Record<string, string> = {
  // Toyota
  'קורולה': 'Corolla', 'קאמרי': 'Camry', 'יאריס': 'Yaris', 'אוריס': 'Auris',
  'ראב 4': 'RAV4', 'לנד קרוזר': 'Land Cruiser', 'היילקס': 'Hilux', 'פריוס': 'Prius',
  'אייגו': 'Aygo', 'סי-אייץ\'ר': 'C-HR', 'היילנדר': 'Highlander',
  // Hyundai
  'איי 10': 'i10', 'איי 20': 'i20', 'איי 30': 'i30', 'איי 40': 'i40',
  'טוסון': 'Tucson', 'סנטה פה': 'Santa Fe', 'קונה': 'Kona', 'יוניק': 'Ioniq',
  'אלנטרה': 'Elantra', 'סונטה': 'Sonata', 'אקסנט': 'Accent',
  // Kia
  'פיקנטו': 'Picanto', 'ריו': 'Rio', 'סיד': 'Ceed', 'ספורטאז\'': 'Sportage',
  'סורנטו': 'Sorento', 'נירו': 'Niro', 'סטוניק': 'Stonic', 'סול': 'Soul',
  // Mazda
  'מזדה 2': 'Mazda2', 'מזדה 3': 'Mazda3', 'מזדה 6': 'Mazda6',
  'סי-איקס 3': 'CX-3', 'סי-איקס 5': 'CX-5', 'סי-איקס 30': 'CX-30',
  // Honda
  'סיוויק': 'Civic', 'אקורד': 'Accord', 'ג\'אז': 'Jazz', 'סי-אר-וי': 'CR-V', 'האר-וי': 'HR-V',
  // Nissan
  'מיקרה': 'Micra', 'ג\'וק': 'Juke', 'קשקאי': 'Qashqai', 'איקס-טרייל': 'X-Trail',
  'ליף': 'Leaf', 'נוט': 'Note', 'סנטרה': 'Sentra',
  // Volkswagen
  'גולף': 'Golf', 'פולו': 'Polo', 'פאסאט': 'Passat', 'טיגואן': 'Tiguan',
  'טי-רוק': 'T-Roc', 'אפ': 'Up', 'ארטיאון': 'Arteon', 'טוארג': 'Touareg',
  // Skoda
  'פאביה': 'Fabia', 'אוקטביה': 'Octavia', 'סופרב': 'Superb', 'קארוק': 'Karoq', 'קודיאק': 'Kodiaq',
  // Other common
  'פוקוס': 'Focus', 'פיאסטה': 'Fiesta', 'אסטרה': 'Astra', 'קורסה': 'Corsa',
  'קליאו': 'Clio', 'מגאן': 'Megane', 'סי 3': 'C3', 'סי 4': 'C4', '208': '208', '308': '308',
  // Suzuki
  'סוויפט': 'Swift', 'ויטרה': 'Vitara', 'בלנו': 'Baleno',
  // Subaru
  'אימפרזה': 'Impreza', 'פורסטר': 'Forester', 'אאוטבק': 'Outback', 'לגאסי': 'Legacy',
  // Mercedes
  'סי קלאס': 'C-Class', 'אי קלאס': 'E-Class', 'איי קלאס': 'A-Class', 'גי קלאס': 'G-Class',
  // BMW
  'סדרה 3': '3 Series', 'סדרה 5': '5 Series', 'סדרה 1': '1 Series',
  // Geely
  'ג\'יאומטרי': 'Geometry C', 'ג\'יקו': 'Geely',
  // Dacia
  'סנדרו': 'Sandero', 'דאסטר': 'Duster', 'לוגן': 'Logan'
}

// Model to Make mapping - which models belong to which make
export const modelToMake: Record<string, string> = {
  // Toyota
  'Corolla': 'Toyota', 'Camry': 'Toyota', 'Yaris': 'Toyota', 'Auris': 'Toyota',
  'RAV4': 'Toyota', 'Land Cruiser': 'Toyota', 'Hilux': 'Toyota', 'Prius': 'Toyota',
  'Aygo': 'Toyota', 'C-HR': 'Toyota', 'Highlander': 'Toyota',
  // Hyundai
  'i10': 'Hyundai', 'i20': 'Hyundai', 'i30': 'Hyundai', 'i40': 'Hyundai',
  'Tucson': 'Hyundai', 'Santa Fe': 'Hyundai', 'Kona': 'Hyundai', 'Ioniq': 'Hyundai',
  'Elantra': 'Hyundai', 'Sonata': 'Hyundai', 'Accent': 'Hyundai',
  // Kia
  'Picanto': 'Kia', 'Rio': 'Kia', 'Ceed': 'Kia', 'Sportage': 'Kia',
  'Sorento': 'Kia', 'Niro': 'Kia', 'Stonic': 'Kia', 'Soul': 'Kia',
  // Mazda
  'Mazda2': 'Mazda', 'Mazda3': 'Mazda', 'Mazda6': 'Mazda',
  'CX-3': 'Mazda', 'CX-5': 'Mazda', 'CX-30': 'Mazda',
  // Honda
  'Civic': 'Honda', 'Accord': 'Honda', 'Jazz': 'Honda', 'CR-V': 'Honda', 'HR-V': 'Honda',
  // Nissan
  'Micra': 'Nissan', 'Juke': 'Nissan', 'Qashqai': 'Nissan', 'X-Trail': 'Nissan',
  'Leaf': 'Nissan', 'Note': 'Nissan', 'Sentra': 'Nissan',
  // Volkswagen
  'Golf': 'Volkswagen', 'Polo': 'Volkswagen', 'Passat': 'Volkswagen', 'Tiguan': 'Volkswagen',
  'T-Roc': 'Volkswagen', 'Up': 'Volkswagen', 'Arteon': 'Volkswagen', 'Touareg': 'Volkswagen',
  // Skoda
  'Fabia': 'Skoda', 'Octavia': 'Skoda', 'Superb': 'Skoda', 'Karoq': 'Skoda', 'Kodiaq': 'Skoda',
  // Ford
  'Focus': 'Ford', 'Fiesta': 'Ford',
  // Opel
  'Astra': 'Opel', 'Corsa': 'Opel',
  // Renault
  'Clio': 'Renault', 'Megane': 'Renault',
  // Citroen
  'C3': 'Citroen', 'C4': 'Citroen',
  // Peugeot
  '208': 'Peugeot', '308': 'Peugeot',
  // Suzuki
  'Swift': 'Suzuki', 'Vitara': 'Suzuki', 'Baleno': 'Suzuki',
  // Subaru
  'Impreza': 'Subaru', 'Forester': 'Subaru', 'Outback': 'Subaru', 'Legacy': 'Subaru',
  // Mercedes
  'C-Class': 'Mercedes-Benz', 'E-Class': 'Mercedes-Benz', 'A-Class': 'Mercedes-Benz', 'G-Class': 'Mercedes-Benz',
  // BMW
  '3 Series': 'BMW', '5 Series': 'BMW', '1 Series': 'BMW',
  // Geely
  'Geometry C': 'Geely',
  // Dacia
  'Sandero': 'Dacia', 'Duster': 'Dacia', 'Logan': 'Dacia',
  // Honda
  'ZR-V': 'Honda', 'Fit': 'Honda'
}

// Extract rim size from tire string (e.g., "205/55R16" -> 16)
export function extractRimSize(tire: string | null | undefined): number | null {
  if (!tire) return null
  const match = tire.match(/R(\d+)/i)
  return match ? parseInt(match[1]) : null
}

// Overall rolled diameter in mm from a tire size string (e.g., "205/55R16", or "205/55" when
// the rim size is tracked separately — pass it via rimSizeOverride in that case).
// diameter = rim diameter + 2x sidewall height, sidewall height = width * aspect_ratio / 100
export function getTireDiameterMm(tire: string | null | undefined, rimSizeOverride?: number | null): number | null {
  if (!tire) return null
  const match = tire.match(/^(\d{3})\/(\d{2})/)
  if (!match) return null
  const rim = rimSizeOverride ?? extractRimSize(tire)
  if (rim == null) return null
  const width = parseInt(match[1])
  const aspect = parseInt(match[2])
  return rim * 25.4 + 2 * (width * aspect / 100)
}

// Exact rolled-diameter difference as a percentage of the vehicle's own diameter, for display
// (e.g. "קוטר לא תואם (הפרש 4.2%)") — null when either side's diameter can't be computed.
export function getDiameterDiffPct(
  vehicleTire: string | null | undefined,
  wheelTireSize: string | null | undefined,
  wheelRimSize: number | null
): number | null {
  const vehicleDiameter = getTireDiameterMm(vehicleTire)
  const wheelDiameter = getTireDiameterMm(wheelTireSize, wheelRimSize)
  if (vehicleDiameter == null || wheelDiameter == null) return null
  return (Math.abs(wheelDiameter - vehicleDiameter) / vehicleDiameter) * 100
}

// Max relative rolled-diameter difference (as a fraction) still considered a match.
// Shared with getDiameterDiffPct()'s consumers so the UI's calculator uses the same cutoff
// as the actual match/mismatch decision, instead of a second hardcoded copy of "3%".
export const DIAMETER_MISMATCH_THRESHOLD = 0.03

// 'match': rim within ±1" of the reference and (if checked) rolled diameter within DIAMETER_MISMATCH_THRESHOLD.
// 'needs_tire_data': rim is in the ±1" window but there's no tire size on record to confirm
// the rolled diameter actually compensates for the size change.
// 'mismatch': rim more than 1" away, or rolled diameter differs by more than the threshold.
export type RimFitStatus = 'match' | 'needs_tire_data' | 'mismatch'

function compareRimAndDiameter(
  ownRim: number | null,
  candidateRim: number | null,
  ownDiameter: number | null,
  candidateDiameter: number | null,
  skipDiameterCheck: boolean
): RimFitStatus {
  if (ownRim == null || candidateRim == null) return 'match' // no data to judge — don't block
  if (Math.abs(candidateRim - ownRim) > 1) return 'mismatch'
  if (skipDiameterCheck) return 'match'
  if (ownDiameter == null) return 'match' // can't compare, don't block
  if (candidateDiameter == null) return 'needs_tire_data'
  const relDiff = Math.abs(candidateDiameter - ownDiameter) / ownDiameter
  return relDiff <= DIAMETER_MISMATCH_THRESHOLD ? 'match' : 'mismatch'
}

// Whether a donor wheel is a size-compatible match for a vehicle: rim within one size up/down
// from the vehicle's own rim (derived from its own tire spec), with the rim-size change validated
// by comparing overall rolled diameter (not the vehicle's stored "allowed sizes" — that data has
// repeatedly proven unreliable, see .wolf/cerebrum.md). Donut/spare wheels still have to be within
// the ±1 window, but are exempt from the diameter check itself, same as before.
// `vehicleRimFallback` covers vehicles with no tire data on file at all (e.g. personal imports)
// where the station manager manually picked a rim size in the UI — that manual pick still anchors
// the ±1 window even though no tire profile exists to compute a diameter from.
export function checkRimFit(
  vehicleTire: string | null | undefined,
  wheelRimSize: number | null,
  wheelTireSize: string | null | undefined,
  isDonut: boolean,
  vehicleRimFallback?: number | null
): RimFitStatus {
  const vehicleRim = extractRimSize(vehicleTire) ?? vehicleRimFallback ?? null
  const vehicleDiameter = getTireDiameterMm(vehicleTire)
  const wheelDiameter = getTireDiameterMm(wheelTireSize, wheelRimSize)
  return compareRimAndDiameter(vehicleRim, wheelRimSize, vehicleDiameter, wheelDiameter, isDonut)
}

// Same idea for reverse search (vehicle vs. vehicle, no wheel inventory involved): does a
// candidate vehicle model's own stock rim/tire fall within one size of the source vehicle's?
// `candidateRimFallback` covers vehicle_models rows whose tire string lacks a rim suffix.
export function checkVehicleRimFit(
  sourceTire: string | null | undefined,
  candidateTire: string | null | undefined,
  candidateRimFallback?: number | null
): RimFitStatus {
  const sourceRim = extractRimSize(sourceTire)
  const candidateRim = extractRimSize(candidateTire) ?? candidateRimFallback ?? null
  const sourceDiameter = getTireDiameterMm(sourceTire)
  const candidateDiameter = getTireDiameterMm(candidateTire, candidateRim)
  return compareRimAndDiameter(sourceRim, candidateRim, sourceDiameter, candidateDiameter, false)
}
