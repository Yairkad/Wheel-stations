"""
Wheel Fitment Scraper - Supabase Integration
=============================================
This script:
1. Fetches vehicle models from Supabase that are missing wheel fitment data
2. Searches wheelfitment.eu for matching data
3. Updates Supabase with the found data (center_bore, rim_sizes_allowed, source_url)

Usage:
    python scxxxxxwheelfitment_to_supabase.py [--make MAKE] [--limit N] [--dry-run]

Requirements:
    pip install requests beautifulsoup4 supabase python-dotenv
"""

import os
import re
import time
import argparse
from urllib.parse import quote
from dotenv import load_dotenv

import requests
from bs4 import BeautifulSoup
from supabase import create_client, Client

# Load environment variables from .env.local
load_dotenv('.env.local')

# Supabase credentials
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Base URL for wheelfitment.eu
BASE_URL = "https://www.wheelfitment.eu"

# Map Hebrew make names to English for wheelfitment.eu search
MAKE_TRANSLATIONS = {
    'טויוטה': 'toyota',
    'יונדאי': 'hyundai',
    'קיה': 'kia',
    'מאזדה': 'mazda',
    'הונדה': 'honda',
    'ניסאן': 'nissan',
    'מיצובישי': 'mitsubishi',
    'סוזוקי': 'suzuki',
    'סובארו': 'subaru',
    'פולקסווגן': 'volkswagen',
    'אאודי': 'audi',
    'ב.מ.וו': 'bmw',
    'מרצדס': 'mercedes-benz',
    'פורד': 'ford',
    'שברולט': 'chevrolet',
    'פיאט': 'fiat',
    'פיג\'ו': 'peugeot',
    'סיטרואן': 'citroen',
    'רנו': 'renault',
    'וולוו': 'volvo',
    'ג\'יפ': 'jeep',
    'קרייזלר': 'chrysler',
    'דודג\'': 'dodge',
    'לקסוס': 'lexus',
    'אינפיניטי': 'infiniti',
    'סאאב': 'saab',
    'סיאט': 'seat',
    'אלפא רומיאו': 'alfaromeo',
    'פורשה': 'porsche',
    'ג\'גואר': 'jaguar',
    'בי.ווי.די': 'byd',
    'סקודה': 'skoda',
    'אופל': 'opel',
    'ג\'נסיס': 'genesis',
    'דאצ\'יה': 'dacia',
    'לינקולן': 'lincoln',
    'ראם': 'ram',
    'מיני': 'mini',
    'לנד רובר': 'landrover',
    'ריינג\' רובר': 'rangerover',
}


def normalize_make(make: str) -> str:
    """Convert make name to wheelfitment.eu format"""
    make_lower = make.lower().strip()

    # Check Hebrew translations
    if make_lower in MAKE_TRANSLATIONS:
        return MAKE_TRANSLATIONS[make_lower]

    # Check if it's already in the values
    if make_lower in MAKE_TRANSLATIONS.values():
        return make_lower

    # Handle special cases
    make_clean = make_lower.replace(' ', '').replace('-', '').replace('.', '')

    special_cases = {
        'bmw': 'bmw',
        'mercedes': 'mercedes-benz',
        'mercedesbenz': 'mercedes-benz',
        'vw': 'volkswagen',
        'alfa': 'alfaromeo',
        'alfaromeo': 'alfaromeo',
        'landrover': 'landrover',
        'rangerover': 'rangerover',
    }

    if make_clean in special_cases:
        return special_cases[make_clean]

    return make_lower


def get_models_for_make(make: str) -> list:
    """Fetch all model pages for a given make from wheelfitment.eu"""
    url = f"{BASE_URL}/car/{make}.html"

    try:
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            print(f"  ❌ Could not fetch make page: {url}")
            return []

        soup = BeautifulSoup(response.text, 'html.parser')
        models = []

        for row in soup.find_all("tr"):
            link = row.find('a')
            if link:
                model_name = link.text.strip().lower()
                cells = row.find_all('td')
                year_range = cells[1].text.strip("()") if len(cells) > 1 else ""
                model_url = link['href']

                # Parse year range
                year_match = re.match(r'(\d{4})\s*-\s*(\d{4})?', year_range)
                year_from = int(year_match.group(1)) if year_match else None
                year_to = int(year_match.group(2)) if year_match and year_match.group(2) else None

                models.append({
                    'model': model_name,
                    'year_from': year_from,
                    'year_to': year_to,
                    'url': model_url,
                })

        return models
    except Exception as e:
        print(f"  ❌ Error fetching make {make}: {e}")
        return []


def get_wheel_data(url: str) -> dict:
    """Extract wheel fitment data from a model page"""
    try:
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            return None

        soup = BeautifulSoup(response.text, 'html.parser')
        table = soup.find("table", id="zoek-op-merk")

        if not table:
            return None

        data = {}
        for row in table.find_all("tr"):
            columns = row.find_all("td")
            if len(columns) == 2:
                key = columns[0].text.strip().replace(":", "")
                value = columns[1].text.strip()
                data[key] = value

        return data
    except Exception as e:
        print(f"  ❌ Error fetching wheel data: {e}")
        return None


def parse_pcd(pcd_str: str) -> tuple:
    """Parse PCD string like '5x114.3' to (bolt_count, bolt_spacing)"""
    match = re.match(r'(\d+)x([\d.]+)', pcd_str)
    if match:
        return int(match.group(1)), float(match.group(2))
    return None, None


def parse_center_bore(cb_str: str) -> float:
    """Parse center bore string to float"""
    match = re.search(r'([\d.]+)', cb_str)
    if match:
        return float(match.group(1))
    return None


def parse_tire_sizes(sizes_str: str) -> list:
    """Extract rim sizes from tire sizes string"""
    # Find all R## patterns
    rim_sizes = set()
    matches = re.findall(r'R(\d{2})', sizes_str)
    for m in matches:
        size = int(m)
        if 12 <= size <= 24:  # Valid rim sizes
            rim_sizes.add(size)
    return sorted(list(rim_sizes))


def find_matching_model(make_models: list, target_model: str, target_year: int) -> dict:
    """Find the best matching model from wheelfitment data"""
    target_model_clean = target_model.lower().strip()

    # Try exact match first
    for m in make_models:
        if m['model'] == target_model_clean:
            if target_year is None or m['year_from'] is None:
                return m
            if m['year_from'] <= target_year <= (m['year_to'] or 2030):
                return m

    # Try partial match
    for m in make_models:
        if target_model_clean in m['model'] or m['model'] in target_model_clean:
            if target_year is None or m['year_from'] is None:
                return m
            if m['year_from'] <= target_year <= (m['year_to'] or 2030):
                return m

    # Try fuzzy match (remove spaces/dashes)
    target_clean = re.sub(r'[\s\-]', '', target_model_clean)
    for m in make_models:
        model_clean = re.sub(r'[\s\-]', '', m['model'])
        if target_clean in model_clean or model_clean in target_clean:
            if target_year is None or m['year_from'] is None:
                return m
            if m['year_from'] <= target_year <= (m['year_to'] or 2030):
                return m

    return None


def fetch_vehicles_missing_data(make_filter: str = None, limit: int = 100) -> list:
    """Fetch vehicles from Supabase that are missing wheel fitment data"""
    query = supabase.table('vehicle_models').select('*')

    # Filter for missing data (no center_bore OR no rim_sizes_allowed OR no source_url)
    query = query.or_('center_bore.is.null,rim_sizes_allowed.is.null,source_url.is.null')

    if make_filter:
        query = query.ilike('make', f'%{make_filter}%')

    query = query.limit(limit)

    result = query.execute()
    return result.data if result.data else []


def update_vehicle_model(vehicle_id: str, updates: dict) -> bool:
    """Update a vehicle model in Supabase"""
    try:
        result = supabase.table('vehicle_models').update(updates).eq('id', vehicle_id).execute()
        return True
    except Exception as e:
        print(f"  ❌ Error updating vehicle {vehicle_id}: {e}")
        return False


def process_vehicles(make_filter: str = None, limit: int = 100, dry_run: bool = False):
    """Main processing function"""
    print(f"\n{'='*60}")
    print("Wheel Fitment Scraper - Supabase Integration")
    print(f"{'='*60}\n")

    # Fetch vehicles missing data
    print(f"Fetching vehicles missing wheel fitment data...")
    if make_filter:
        print(f"  Filtering by make: {make_filter}")

    vehicles = fetch_vehicles_missing_data(make_filter, limit)
    print(f"  Found {len(vehicles)} vehicles to process\n")

    if not vehicles:
        print("No vehicles found!")
        return

    # Cache for wheelfitment data by make
    make_cache = {}

    stats = {
        'processed': 0,
        'updated': 0,
        'skipped': 0,
        'not_found': 0,
        'errors': 0,
    }

    for i, vehicle in enumerate(vehicles):
        make = vehicle.get('make', '')
        model = vehicle.get('model', '')
        year = vehicle.get('year_from')
        vehicle_id = vehicle.get('id')

        print(f"[{i+1}/{len(vehicles)}] Processing: {make} {model} ({year or 'N/A'})")

        # Normalize make name
        make_normalized = normalize_make(make)

        # Get wheelfitment data for this make (cached)
        if make_normalized not in make_cache:
            print(f"  Fetching models for {make_normalized}...")
            make_cache[make_normalized] = get_models_for_make(make_normalized)
            time.sleep(0.5)  # Be nice to the server

        make_models = make_cache[make_normalized]

        if not make_models:
            print(f"  ⚠️ No data found for make: {make_normalized}")
            stats['not_found'] += 1
            continue

        # Find matching model
        match = find_matching_model(make_models, model, year)

        if not match:
            print(f"  ⚠️ No matching model found")
            stats['not_found'] += 1
            continue

        # Fetch wheel data for this model
        wheel_data = get_wheel_data(match['url'])
        time.sleep(0.3)  # Be nice to the server

        if not wheel_data:
            print(f"  ⚠️ Could not fetch wheel data")
            stats['not_found'] += 1
            continue

        # Parse the data
        pcd = wheel_data.get('PCD', '')
        center_bore_str = wheel_data.get('Center bore', '')
        tire_sizes_str = wheel_data.get('Possible tire sizes', '')

        bolt_count, bolt_spacing = parse_pcd(pcd)
        center_bore = parse_center_bore(center_bore_str)
        rim_sizes = parse_tire_sizes(tire_sizes_str)

        # Prepare updates (only update null fields)
        updates = {}

        if center_bore and not vehicle.get('center_bore'):
            updates['center_bore'] = center_bore

        if rim_sizes and not vehicle.get('rim_sizes_allowed'):
            updates['rim_sizes_allowed'] = rim_sizes

        if match['url'] and not vehicle.get('source_url'):
            updates['source_url'] = match['url']

        # Update bolt pattern if missing
        if bolt_count and not vehicle.get('bolt_count'):
            updates['bolt_count'] = bolt_count
        if bolt_spacing and not vehicle.get('bolt_spacing'):
            updates['bolt_spacing'] = bolt_spacing

        if not updates:
            print(f"  ⏭️ No updates needed (already has data)")
            stats['skipped'] += 1
            continue

        print(f"  📋 Found: PCD={pcd}, Center={center_bore}, Rims={rim_sizes}")
        print(f"  📝 Updating: {list(updates.keys())}")

        if dry_run:
            print(f"  🔍 DRY RUN - Would update with: {updates}")
            stats['updated'] += 1
        else:
            if update_vehicle_model(vehicle_id, updates):
                print(f"  ✅ Updated successfully")
                stats['updated'] += 1
            else:
                stats['errors'] += 1

        stats['processed'] += 1

    # Print summary
    print(f"\n{'='*60}")
    print("Summary")
    print(f"{'='*60}")
    print(f"  Processed: {stats['processed']}")
    print(f"  Updated:   {stats['updated']}")
    print(f"  Skipped:   {stats['skipped']}")
    print(f"  Not Found: {stats['not_found']}")
    print(f"  Errors:    {stats['errors']}")
    print()


def main():
    parser = argparse.ArgumentParser(description='Scxxxxxxxeel fitment data and update Supabase')
    parser.add_argument('--make', type=str, help='Filter by make name')
    parser.add_argument('--limit', type=int, default=100, help='Maximum number of vehicles to process')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be updated without making changes')

    args = parser.parse_args()

    process_vehicles(
        make_filter=args.make,
        limit=args.limit,
        dry_run=args.dry_run
    )


if __name__ == '__main__':
    main()
