import requests
import csv
import time
from datetime import datetime
from bs4 import BeautifulSoup

BASE_URL = "https://www.wheelfitment.eu/car/"


def get_all_makes():
    """Scrape the main car index page and return a sorted list of all make slugs."""
    index_url = BASE_URL
    try:
        resp = requests.get(index_url, timeout=30)
    except Exception as e:
        print(f"❌ Failed to fetch main makes page: {e}")
        return []

    if resp.status_code != 200:
        print(f"❌ Failed to fetch {index_url} (status {resp.status_code})")
        return []

    soup = BeautifulSoup(resp.text, 'html.parser')
    makes = set()

    # Find anchor tags that link to make pages like '/car/toyota.html' or 'https://.../car/toyota.html'
    for a in soup.find_all('a', href=True):
        href = a['href']
        if href.endswith('.html'):
            # normalize both absolute and relative URLs
            if '/car/' in href:
                # Extract the slug between '/car/' and '.html'
                try:
                    part = href.split('/car/', 1)[1]
                    slug = part.split('.html', 1)[0]
                    # Filter out non-make pages (e.g., might contain extra path segments)
                    if '/' not in slug and slug:
                        makes.add(slug.strip().lower())
                except Exception:
                    continue

    makes_list = sorted(makes)
    print(f"Discovered {len(makes_list)} makes from index page.")
    if makes_list:
        preview = ', '.join(makes_list[:10])
        print(f"Sample: {preview}{' ...' if len(makes_list) > 10 else ''}")
    return makes_list

# Dynamically discover makes instead of hardcoding
car_makes = get_all_makes()

def get_models_for_make(make):
    """Fetch all model-year pages for a given make"""
    url = f"{BASE_URL}{make}.html"
    response = requests.get(url)
    if response.status_code != 200:
        print(f"❌ Failed to fetch {url}")
        return []

    soup = BeautifulSoup(response.text, 'html.parser')
    model_years = []

    for row in soup.find_all("tr"):
        link = row.find('a')
        if link:
            model_name = link.text.strip()
            year_range = row.find_all('td')[1].text.strip("()")
            model_url = link['href']

            # Collect models and add make to each entry
            model_years.append({
                'model': model_name,
                'year_range': year_range,
                'url': model_url,
                'make': make  # Add the make to each model entry
            })

    return model_years

def get_wheel_data(url):
    """Extract PCD, center bore, and tire sizes from the model-year page"""
    response = requests.get(url)
    if response.status_code != 200:
        print(f"❌ Failed to fetch {url}")
        return None

    soup = BeautifulSoup(response.text, 'html.parser')
    table = soup.find("table", id="zoek-op-merk")
    if not table:
        return None

    wheel_data = {}
    for row in table.find_all("tr"):
        columns = row.find_all("td")
        if len(columns) == 2:
            key = columns[0].text.strip().replace(":", "")
            value = columns[1].text.strip()
            if key == "Possible tire sizes":
                value = value.replace("<br/>", ", ")
            wheel_data[key] = value

    return wheel_data

def extract_tire_sizes(tire_sizes_str):
    """Extract tire diameters (e.g., R12, R13, ..., R20) and return a dictionary"""
    tire_sizes = tire_sizes_str.split(", ")
    diameters = {"R12": "", "R13": "", "R14": "", "R15": "", "R16": "", "R17": "", "R18": "", "R19": "", "R20": ""}
    for size in tire_sizes:
        for diameter in diameters:
            if diameter in size:
                diameters[diameter] = "1"  # Mark with "1" if it fits
    return diameters

def save_to_csv(data, filename="wheel_fitment_data.csv"):
    """Saves data to a CSV file"""
    fieldnames = ["Make", "Model", "Year Range", "PCD", "Center Bore", "R12", "R13", "R14", "R15", "R16", "R17", "R18", "R19", "R20", "URL"]

    with open(filename, mode='w', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        for row in data:
            writer.writerow(row)

# Step 1: Get models for each discovered car make
all_data = []

if not car_makes:
    print("No car makes discovered. Exiting.")

# Print all discovered makes before starting collection
print("\nAll discovered makes (" + str(len(car_makes)) + "):")
print("\n".join(car_makes))

start_time_overall = time.time()
processed_rows_total = 0

for make in car_makes:
    make_start = time.time()
    print(f"\n=== Processing make: {make} | start: {datetime.now().strftime('%H:%M:%S')} ===")

    models = get_models_for_make(make)
    total_models = len(models)
    if total_models == 0:
        print(f"No models found for {make}. Skipping.")
        continue

    print(f"Found {total_models} model-year entries for {make}.")

    processed_rows_make = 0

    # Step 2: Extract wheel data for each model-year range
    for idx, model in enumerate(models, start=1):
        t0 = time.time()
        wheel_info = get_wheel_data(model['url'])
        dt = time.time() - t0

        if wheel_info:
            tire_sizes = wheel_info.get('Possible tire sizes', '')
            tire_diameters = extract_tire_sizes(tire_sizes)

            data = {
                "Make": model['make'],  # Add the make to the row
                "Model": model['model'],
                "Year Range": model['year_range'],
                "PCD": wheel_info.get('PCD', 'N/A'),
                "Center Bore": wheel_info.get('Center bore', 'N/A'),
                "URL": model['url']  # Add the URL to the row
            }

            # Add tire diameters columns (R12, R13, R14, ..., R20)
            data.update(tire_diameters)
            all_data.append(data)
            processed_rows_make += 1
            processed_rows_total += 1
            print(f"[{make}] {idx}/{total_models} processed in {dt:.2f}s: {model['model']} ({model['year_range']})")
        else:
            print(f"[{make}] {idx}/{total_models} failed in {dt:.2f}s: {model['model']} ({model['year_range']})")

    make_dt = time.time() - make_start
    print(f"=== Done {make}: {processed_rows_make}/{total_models} with data | took {make_dt/60:.1f} min ({make_dt:.1f}s). Cumulative rows: {processed_rows_total} ===")

# Step 3: Save all data to CSV
pipeline_dt = time.time() - start_time_overall
save_to_csv(all_data)

print(f"\n✅ Data saved to 'wheel_fitment_data.csv'. Total rows: {len(all_data)}. Total time: {pipeline_dt/60:.1f} min ({pipeline_dt:.1f}s)")
