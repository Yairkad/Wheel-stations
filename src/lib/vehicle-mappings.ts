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
  'טסלה': 'Tesla', 'ביואיק': 'BYD', 'ג\'ילי': 'Geely', 'MG': 'MG'
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
  'סוויפט': 'Swift', 'ויטרה': 'Vitara', 'בלנו': 'Baleno'
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
  'Swift': 'Suzuki', 'Vitara': 'Suzuki', 'Baleno': 'Suzuki'
}

// Extract rim size from tire string (e.g., "205/55R16" -> 16)
export function extractRimSize(tire: string | null | undefined): number | null {
  if (!tire) return null
  const match = tire.match(/R(\d+)/i)
  return match ? parseInt(match[1]) : null
}
