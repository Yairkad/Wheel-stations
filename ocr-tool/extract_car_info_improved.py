#!/usr/bin/env python3
"""
Improved car-info extractor.
- Uses EasyOCR (preferred) with OpenCV preprocessing
- Finds: car number (7-8 digits next to Hebrew "מספר רכב"), VIN, model, year, engine (cc), tire sizes
- Outputs pretty console summary and JSON (stdout). Optionally saves JSON to --out file

Usage:
  ./.venv/bin/python extract_car_info_improved.py /path/to/image.jpg --out result.json
"""
import re
import json
import argparse
from pathlib import Path
import sys

try:
    import cv2
    import numpy as np
except Exception:
    cv2 = None
    np = None

try:
    import easyocr
except Exception:
    easyocr = None

# helper regexes
VIN_RE = re.compile(r'\b([A-HJ-NPR-Z0-9]{17})\b')
YEAR_RE = re.compile(r'\b(19|20)\d{2}\b')
MMYYYY_RE = re.compile(r'\b(0[1-9]|1[0-2])\s*[\-/]s?(19|20)\d{2}\b')
SEVENDIG_RE = re.compile(r'\b\d{7,8}\b')
ENGINE_RE = re.compile(r'\b(\d{3,4})\b')
TIRE_RE = re.compile(r'\b\d{2,3}/\d{2,3}\s*R\s*\d{1,2}\b', re.I)
TIRE_SHORT_RE = re.compile(r'\b\d{2,3}/\d{2,3}\b')

COMMON_MODELS = [
    'KAROQ','IONIQ','GOLF','OCTAVIA','SUPERB','KODIAQ','FABIA','RAPID','KAROQ','KAROQ FL',
    'TOYOTA','COROLLA','CIVIC','ELANTRA','NISSAN','QASHQAI','MEGANE','KIA','RIO','SPORTAGE'
]

# Preprocessing: enhance contrast, denoise

def preprocess_image(img_path):
    if cv2 is None:
        return None
    img = cv2.imread(str(img_path))
    if img is None:
        raise FileNotFoundError(str(img_path))
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # resize for better OCR if small
    h,w = gray.shape
    scale = 1.0
    if max(h,w) < 2000:
        scale = 1.5
        gray = cv2.resize(gray, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)
    # CLAHE
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    gray = clahe.apply(gray)
    # bilateral filter then adaptive threshold
    gray = cv2.bilateralFilter(gray, 9, 75, 75)
    th = cv2.adaptiveThreshold(gray,255,cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 31, 9)
    return img, gray, th


def run_easyocr(img_path, langs=['he','en']):
    if easyocr is None:
        raise RuntimeError('easyocr not installed in this environment')
    # try multiple language combos
    combos = [langs, ['en']]
    last_exc = None
    for c in combos:
        try:
            reader = easyocr.Reader(c, gpu=False)
            # get detailed results for spatial heuristics
            res = reader.readtext(str(img_path), detail=1)
            # res: list of (bbox, text, confidence)
            return res
        except Exception as e:
            last_exc = e
            continue
    raise last_exc


def join_text_lines(res):
    # res is list of (bbox, text, conf) -> produce full text and map index->text
    texts = [t for (_bbox,t,_conf) in res]
    full = '\n'.join(texts)
    return full


def find_vin(text, res_texts):
    m = VIN_RE.search(text.replace(' ','').upper())
    if m:
        return m.group(1)
    # fallback: look for 17-char token among res_texts
    for t in res_texts:
        s = re.sub(r'[^A-Z0-9]','',t.upper())
        if len(s)==17:
            return s
    return None


def find_year(text, res_texts):
    # prefer MM/YYYY patterns
    m = re.search(r'(0[1-9]|1[0-2])[-/](19|20)\d{2}', text)
    if m:
        return m.group(0).split('/')[-1].split('-')[-1]
    # find standalone year
    ys = YEAR_RE.findall(text)
    if ys:
        # return the first full match
        m2 = YEAR_RE.search(text)
        return m2.group(0)
    return None


def find_engine(text, res_texts, year=None):
    # Prefer explicit unit mentions (cc, סמ"ק), or numbers with .00 which often follow displacement
    text_u = text
    # look for patterns like '1588.00' or '1588.00 70' etc
    m = re.search(r'\b(\d{3,4}(?:\.\d{1,2})?)\b\s*(?:cc|סמ\"ק|סמ״ק|cm3|CM3)?', text_u, re.I)
    if m:
        val = m.group(1)
        v = int(float(val))
        if 700 <= v <= 4000:
            # if this equals year, skip (likely year)
            if year and str(v) == str(year):
                pass
            else:
                return str(v)
    # look near Hebrew keywords
    keywords = ['נפח','מנוע','כוח','סמ"ק','סמ״ק']
    for kw in keywords:
        idx = text_u.find(kw)
        if idx!=-1:
            window = text_u[max(0,idx-40):idx+40]
            m2 = re.search(r'\b(\d{3,4})\b', window)
            if m2:
                v = int(m2.group(1))
                if 700 <= v <= 4000 and (not year or str(v)!=str(year)):
                    return str(v)
    # fallback: scan all numeric candidates and pick the one closest to 1500 (typical)
    nums = [int(x) for x in re.findall(r'\b(\d{3,4})\b', text_u)]
    nums = [n for n in nums if 700 <= n <= 4000]
    if not nums:
        return None
    if year:
        nums = [n for n in nums if str(n)!=str(year)] or nums
    # pick candidate closest to 1500
    best = min(nums, key=lambda n: abs(n-1500))
    return str(best)


def find_car_number(text, res_texts, res_boxes):
    # Try to find Hebrew label 'מספר רכב' or 'מספר' and find nearby 7-8 digit
    label_patterns = ['מספר רכב','מספר','מספר רכב:']
    text_upper = text
    # Spatial search: if res_boxes available, find box with label and search nearby boxes
    for i,(bbox,t,conf) in enumerate(res_boxes):
        ts = t.strip()
        for lp in label_patterns:
            if lp in ts:
                # look nearby boxes (within distance)
                # compute center of bbox
                box = np.array(bbox)
                cx = box[:,0].mean(); cy = box[:,1].mean()
                # find other texts within radius
                candidates = []
                for j,(bb,tt,cc) in enumerate(res_boxes):
                    if j==i: continue
                    bba = np.array(bb); cxx = bba[:,0].mean(); cyy = bba[:,1].mean()
                    dist = ((cxx-cx)**2 + (cyy-cy)**2)**0.5
                    if dist < 400: # heuristic
                        candidates.append(tt)
                # search for 7-8 digit in candidates
                for ctext in candidates:
                    m = SEVENDIG_RE.search(ctext)
                    if m:
                        return m.group(0)
    # fallback: search whole text for 7-8 digit and prefer one near the word 'מספר' occurrences
    all_sevens = SEVENDIG_RE.findall(text)
    if not all_sevens:
        return None
    # if 'מספר' present, choose 7-8 digit closest in character index
    idx_label = text.find('מספר')
    if idx_label!=-1:
        best=None; bestd=None
        for s in all_sevens:
            pos = text.find(s)
            d = abs(pos-idx_label)
            if best is None or d<bestd:
                best=s; bestd=d
        return best
    # otherwise return first 7-8 digit found
    return all_sevens[0]


MANUFACTURERS = {
    'SKODA': ['KAROQ','KAROQ FL','OCTAVIA','SUPERB','KODIAQ','FABIA','RAPID'],
    'HYUNDAI': ['IONIQ','ELANTRA','I40','TUCSON','KONA'],
    'KIA': ['RIO','SPORTAGE','CEED'],
    'VOLKSWAGEN': ['GOLF','PASSAT','TIGUAN'],
    'TOYOTA': ['COROLLA','PRIUS','RAV4'],
    'NISSAN': ['QASHQAI','X-TRAIL']
}


def find_manufacturer_and_model(text, res_texts):
    """Return (manufacturer, model) if found, otherwise (None, model_guess) or (manufacturer, None)."""
    txt_up = text.upper()
    # look for manufacturer first
    found_manuf = None
    for mf, models in MANUFACTURERS.items():
        if mf in txt_up or mf.replace('O','Ó') in txt_up:  # handle minor variants
            found_manuf = mf
            # look for models of this manufacturer near the name
            for m in models:
                if m in txt_up:
                    return found_manuf, m
    # if no pairing found, search all model tokens
    for m in COMMON_MODELS:
        if m.upper() in txt_up:
            # try to map to manufacturer if possible
            for mf, models in MANUFACTURERS.items():
                if m in [x.upper() for x in models]:
                    return mf, m
            return None, m
    # fallback: look for uppercase token of length 3..12
    tokens = re.findall(r'\b[A-Z][A-Z0-9\-]{2,12}\b', txt_up)
    for t in tokens:
        # avoid numeric-only tokens
        if any(c.isalpha() for c in t):
            return None, t
    # try Hebrew 'דגם' context
    m = re.search(r'דגם\W{0,20}([\w\- ]{2,20})', text)
    if m:
        return None, m.group(1).strip()
    return None, None


def find_tires(text):
    """Find and normalize tire size patterns.
    Handles forms like:
      - 195/65R15
      - 195/65 R15
      - 195/65R/15
      - 195/65/15
      - 215/55R17 94V (with load/speed)
    Returns list of normalized strings like '195/65R15' or '215/55R17 94V'.
    """
    results = []
    seen = set()
    # full pattern with optional load/speed (e.g., 215/55R17 94V)
    full_pat = re.compile(r"\b(\d{2,3})/(\d{2,3})\s*[Rr]\s*/?\s*(\d{1,2})(?:[\s,-]+([0-9]{2,3}[A-Za-z]?))?\b")
    for m in full_pat.finditer(text):
        w,ratio,rim,load = m.group(1),m.group(2),m.group(3),m.group(4)
        norm = f"{w}/{ratio}R{rim}"
        if load:
            norm = f"{norm} {load}"
        if norm not in seen:
            seen.add(norm)
            results.append(norm)
    # pattern with two slashes or without 'R' (e.g., 195/65/15 or 195/65 /15)
    alt_pat = re.compile(r"\b(\d{2,3})/(\d{2,3})\s*/\s*(\d{1,2})\b")
    for m in alt_pat.finditer(text):
        w,ratio,rim = m.group(1),m.group(2),m.group(3)
        norm = f"{w}/{ratio}R{rim}"
        if norm not in seen:
            seen.add(norm)
            results.append(norm)
    # fallback: just width/ratio occurrences (may be noisy)
    short_pat = re.compile(r"\b(\d{2,3})/(\d{2,3})\b")
    for m in short_pat.finditer(text):
        w,ratio = m.group(1),m.group(2)
        # don't repeat ones already covered
        candidate = f"{w}/{ratio}"
        # try to avoid false positives by checking reasonable ranges
        if 100 <= int(w) <= 355 and 30 <= int(ratio) <= 85:
            # only include if we haven't already added a full rim-based pattern for same width/ratio
            if not any(res.startswith(f"{w}/{ratio}") for res in results):
                norm = candidate
                if norm not in seen:
                    seen.add(norm)
                    results.append(norm)
    return results


def pretty_print(result):
    # print aligned key: value
    lines = []
    fields = [
        ('car_number','Car number (7-8 digits)'),
        ('vin','VIN'),
        ('manufacturer','Manufacturer'),
        ('model','Model'),
        ('year','Year'),
        ('engine_cc','Engine (cc)'),
        ('tire_sizes','Tire sizes'),
    ]
    maxk = max(len(label) for (_k,label) in fields)
    for key,label in fields:
        val = result.get(key,'')
        if isinstance(val,list):
            val = ', '.join(val)
        lines.append(f"{label.ljust(maxk)} : {val}")
    print('\n'.join(lines))


def main():
    p = argparse.ArgumentParser(description='Improved car info extractor')
    p.add_argument('image')
    p.add_argument('--out', help='save JSON to file', default=None)
    p.add_argument('--include-raw', action='store_true', help='Include raw OCR text in JSON output (contains PII). Disabled by default.')
    args = p.parse_args()
    imgp = Path(args.image)
    if not imgp.exists():
        print(json.dumps({'error':'image not found', 'path': str(imgp)}))
        sys.exit(1)

    # run OCR
    try:
        res = run_easyocr(imgp)
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(1)
    # res: list of (bbox, text, conf)
    fulltext = join_text_lines(res)
    texts = [t for (_bbox,t,_conf) in res]

    vin = find_vin(fulltext, texts)
    year = find_year(fulltext, texts)
    engine = find_engine(fulltext, texts, year=year)
    tires = find_tires(fulltext)
    car_number = None
    if np is not None:
        car_number = find_car_number(fulltext, texts, res)
    else:
        car_number = SEVENDIG_RE.search(fulltext)
        car_number = car_number.group(0) if car_number else None
    manufacturer, model = find_manufacturer_and_model(fulltext, texts)

    out = {
        'car_number': car_number or '',
        'vin': vin or '',
        'manufacturer': manufacturer or '',
        'model': model or '',
        'year': year or '',
        'engine_cc': engine or '',
        'tire_sizes': tires or []
    }
    # include raw OCR text only if explicitly requested
    if getattr(args, 'include_raw', False):
        out['raw_text'] = fulltext

    pretty_print(out)
    print('\nJSON output:\n')
    print(json.dumps(out, ensure_ascii=False, indent=2))
    if args.out:
        Path(args.out).write_text(json.dumps(out, ensure_ascii=False, indent=2))

if __name__=='__main__':
    main()
