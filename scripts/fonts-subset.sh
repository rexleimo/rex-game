#!/usr/bin/env bash
# 思源宋体/黑体(可变字重)→ 按 scripts/font-charset.txt 子集化为 woff2
set -euo pipefail
cd "$(dirname "$0")/.."

SRC=resources/fonts-src
OUT=public/fonts
mkdir -p "$SRC" "$OUT"

SERIF="$SRC/NotoSerifSC-VF.ttf"
SANS="$SRC/NotoSansSC-VF.ttf"
[ -f "$SERIF" ] || curl -fL --http1.1 "https://raw.githubusercontent.com/google/fonts/main/ofl/notoserifsc/NotoSerifSC%5Bwght%5D.ttf" -o "$SERIF"
[ -f "$SANS" ] || curl -fL --http1.1 "https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf" -o "$SANS"

node scripts/extract-charset.mjs

python3 -m fontTools.subset "$SERIF" \
  --text-file=scripts/font-charset.txt \
  --flavor=woff2 \
  --output-file="$OUT/NotoSerifSC-subset.woff2" \
  --layout-features='*' --no-hinting --desubroutinize

python3 -m fontTools.subset "$SANS" \
  --text-file=scripts/font-charset.txt \
  --flavor=woff2 \
  --output-file="$OUT/NotoSansSC-subset.woff2" \
  --layout-features='*' --no-hinting --desubroutinize

ls -lh "$OUT"
