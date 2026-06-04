#!/usr/bin/env bash
set -e
ROOT=$(pwd)
# create.venv
python3 -m.venv .venv
. .venv/bin/activate
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt

echo "Installation complete. Use ./.venv/bin/python extract_car_info_improved.py ..."
