import requests
import csv
from bs4 import BeautifulSoup

BASE_URL = "https://www.wheelfitment.eu/car/"

# List of car makes to collect data for
car_makes = [
    "byd", "alfaromeo", "audi", "bmw", "chevrolet", "chrysler", "citroen", "dodge", "fiat",
    "ford", "honda", "hyundai", "infiniti", "jaguar", "jeep", "kia", "lexus", "lincoln", "mazda",
    "mitsubishi", "nissan", "peugeot", "porsche", "ram", "renault", "saab", "seat", "subaru", "suzuki",
    "toyota", "volkswagen", "volvo"
]

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

# Step 1: Get models for each car make (e.g., Mazda, Kia, etc.)
all_data = []

for make in car_makes:
    print(f"Fetching data for {make}...")
    models = get_models_for_make(make)

    # Step 2: Extract wheel data for each model-year range
    for model in models:
        wheel_info = get_wheel_data(model['url'])

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

# Step 3: Save all data to CSV
save_to_csv(all_data)

print(f"✅ Data saved to 'wheel_fitment_data.csv'.")
