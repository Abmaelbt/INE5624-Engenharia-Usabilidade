#!/usr/bin/env python3
"""Extract the Nunito woff2 font and OFL notice from the Figma HTML export.

Usage: python3 prototype/scripts/extract-assets.py [--dump-svgs PATH]
"""
import argparse
import base64
import gzip
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "Lumosity Redesign (T2 e T3).html"
FONT_OUT = ROOT / "prototype/src/assets/fonts"


def tag_json(html: str, name: str):
    m = re.search(rf'<script type="{re.escape(name)}">(.*?)</script>', html, re.S)
    if not m:
        sys.exit(f"missing script tag: {name}")
    return json.loads(m.group(1))


def decode(entry: dict) -> bytes:
    raw = base64.b64decode(entry["data"])
    return gzip.decompress(raw) if entry.get("compressed") else raw


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dump-svgs", help="write SVG inner markup per screen to this JSON file")
    args = ap.parse_args()

    html = SRC.read_text(encoding="utf-8")
    manifest = tag_json(html, "__bundler/manifest")
    order = tag_json(html, "__bundler/page_order")

    # OFL notice lives in the first HTML comment of the outer page.
    lic = re.search(r"<!--(.*?)-->", html, re.S)
    FONT_OUT.mkdir(parents=True, exist_ok=True)
    if lic:
        (FONT_OUT / "OFL-Nunito.txt").write_text(lic.group(1).strip() + "\n", encoding="utf-8")

    inner = decode(manifest[order[0]]).decode("utf-8")
    sub = tag_json(inner, "__bundler/manifest")
    fonts = [(k, v) for k, v in sub.items() if v["mime"].startswith("font/")]
    if not fonts:
        sys.exit("no font asset found")
    data = decode(fonts[0][1])
    (FONT_OUT / "nunito-latin.woff2").write_bytes(data)
    print(f"font: {len(data)} bytes -> nunito-latin.woff2")

    if args.dump_svgs:
        out = {}
        for idx, uid in enumerate(order, 1):
            page = decode(manifest[uid]).decode("utf-8")
            tpl = tag_json(page, "__bundler/template")
            title = re.search(r"<title>(.*?)</title>", page).group(1)
            svgs = re.findall(r"<svg[^>]*>.*?</svg>", tpl, re.S)
            out[f"{idx}:{title}"] = [re.sub(r"\s+", " ", s) for s in svgs]
        Path(args.dump_svgs).write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
        print(f"svgs dumped -> {args.dump_svgs}")


if __name__ == "__main__":
    main()
