#!/usr/bin/env bash
set -e
if [ -z "$1" ]; then
  echo "Usage: $0 /path/to/images_dir"
  exit 1
fi
IMGDIR="$1"
OUTDIR="$(pwd)/outputs"
mkdir -p "$OUTDIR"
PY="$(pwd)/.venv/bin/python"
SCRIPT="$(pwd)/extract_car_info_improved.py"
for img in "$IMGDIR"/*.{jpg,jpeg,png,JPG,JPEG,PNG}; do
  [ -f "$img" ] || continue
  base=$(basename "$img")
  echo "Processing $base"
  "$PY" "$SCRIPT" "$img" --out "$OUTDIR/${base}.json" > "$OUTDIR/${base}.log" 2>&1 || true
done

echo "Results saved to $OUTDIR"
