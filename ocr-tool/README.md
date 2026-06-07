Car OCR Tool

Small toolkit to extract car number, VIN, model, year, engine displacement and tires from photos of vehicle documents.

Quick install

1. Make executable and run install:
   chmod +x install.sh
   ./install.sh

2. Run on a single image:
   ./.venv/bin/python extract_car_info_improved.py /path/to/image.jpg --out result.json

3. Run on a folder (example uses attachments/):
   ./run_all.sh /path/to/images/

Notes
- Uses EasyOCR + OpenCV. torch install can be large; CPU-only works but slower.
- Privacy: by default the tool does NOT include the raw OCR text in saved JSON outputs (this raw text may contain personal data). To include raw OCR text for debugging, pass --include-raw explicitly.
- For best results, crop to the document region or install Tesseract with Hebrew data and try the tesseract script.
