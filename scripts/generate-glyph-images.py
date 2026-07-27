#!/usr/bin/env python3
"""批量生成甲骨文字形图。

用法：
  python scripts/generate-glyph-images.py --start 0 --limit 5 --out-dir public/assets/glyphs

默认会读取 src/games/jiaguwen/content/glyphs.ts，按 id 输出命名文件：
  {out_dir}/{id}.png
"""
from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import time
from pathlib import Path
from typing import Any

CLIENT = Path(
    "C:/Users/Administrator/AppData/Local/hermes/skills/rexai-image-generation/scripts/rexai-image-client.py"
)


def parse_glyphs(ts_path: str) -> list[dict[str, Any]]:
    with open(ts_path, "r", encoding="utf-8") as f:
        text = f.read()
    array_match = re.search(r"const GLYPH_META:.*?\[(.*?)\];", text, re.S)
    if not array_match:
        raise SystemExit("无法从 glyphs.ts 解析 GLYPH_META 数组")
    array_text = array_match.group(1)
    ids = re.findall(r"id:\s*'([^']+)'", array_text)
    moderns = re.findall(r"modern:\s*'([^']+)'", array_text)
    hints = re.findall(r"shapeHint:\s*'([^']+)'", array_text)
    if not (len(ids) == len(moderns) == len(hints)):
        raise SystemExit(f"解析字段长度不一致: {len(ids)} {len(moderns)} {len(hints)}")
    return [
        {"id": ids[i], "modern": moderns[i], "hint": hints[i]}
        for i in range(len(ids))
    ]


def build_prompt(entry: dict[str, Any]) -> str:
    return (
        f"A single ancient Chinese oracle bone script (甲骨文) character for \"{entry['modern']}\" "
        f"on a fragment of weathered ox scapula. The character is carved as a simple, bold incised line: "
        f"{entry['hint']}. "
        f"The carved line is dark brown against the pale, warm-toned bone surface. "
        f"The bone shows subtle natural cracks and age texture. "
        f"Minimalist, scholarly, archaeological illustration style. "
        f"No extra text, no border, no watermark, no labels. Centered, high contrast, clean."
    )


def generate_one(entry: dict[str, Any], out_dir: Path, size: str = "1024x1024") -> Path | None:
    prompt = build_prompt(entry)
    out_dir.mkdir(parents=True, exist_ok=True)
    proc = subprocess.run(
        [
            sys.executable,
            str(CLIENT),
            "--prompt",
            prompt,
            "--size",
            size,
            "--output-dir",
            str(out_dir),
        ],
        capture_output=True,
        text=True,
        timeout=300,
    )
    if proc.returncode != 0:
        print(f"[FAIL] {entry['id']}: {proc.stderr.strip()}", file=sys.stderr)
        return None
    generated = Path(proc.stdout.strip().splitlines()[-1])
    if not generated.exists():
        print(f"[WARN] {entry['id']}: output path not found: {generated}", file=sys.stderr)
        return None
    target = out_dir / f"{entry['id']}.png"
    generated.replace(target)
    print(f"[OK] {entry['id']} -> {target}")
    return target


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--start", type=int, default=0, help="起始索引")
    parser.add_argument("--limit", type=int, default=0, help="0 表示全部")
    parser.add_argument("--out-dir", default="public/glyphs", help="输出目录")
    parser.add_argument("--size", default="1024x1024", help="图片尺寸")
    parser.add_argument("--retries", type=int, default=1, help="失败重试次数")
    args = parser.parse_args()

    ts_path = "src/games/jiaguwen/content/glyphs.ts"
    entries = parse_glyphs(ts_path)
    end = args.start + args.limit if args.limit else len(entries)
    batch = entries[args.start : end]
    print(f"batch: {len(batch)} entries ({args.start}..{end})")

    out_dir = Path(args.out_dir)
    for e in batch:
        for attempt in range(args.retries + 1):
            path = generate_one(e, out_dir, args.size)
            if path:
                break
            if attempt < args.retries:
                time.sleep(5)
    return 0


if __name__ == "__main__":
    sys.exit(main())
