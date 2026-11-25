#!/usr/bin/env python3
"""Generate the PWA icons (any + maskable) with Pillow. Run from the repo root."""
from pathlib import Path

from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parents[1] / "public/icons"
PURPLE = (109, 39, 216)
ORANGE = (193, 64, 9)
WHITE = (255, 255, 255)
SS = 4  # supersampling factor


def draw_icon(size: int, maskable: bool) -> Image.Image:
    s = size * SS
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if maskable:
        d.rectangle([0, 0, s, s], fill=PURPLE)
        scale = 0.56  # keep content inside the maskable safe zone
    else:
        d.rounded_rectangle([0, 0, s - 1, s - 1], radius=int(s * 0.22), fill=PURPLE)
        scale = 0.64
    board = int(s * scale)
    x0 = (s - board) // 2
    y0 = (s - board) // 2
    d.rounded_rectangle([x0, y0, x0 + board, y0 + board], radius=int(board * 0.14), fill=WHITE)
    # grid lines
    for i in (1, 2):
        p = x0 + board * i // 3
        d.line([p, y0 + board * 0.04, p, y0 + board * 0.96], fill=(233, 224, 250), width=max(2, board // 60))
        q = y0 + board * i // 3
        d.line([x0 + board * 0.04, q, x0 + board * 0.96, q], fill=(233, 224, 250), width=max(2, board // 60))
    # ball path (down, then right) and mirror
    cx = x0 + board // 6
    cy = y0 + board * 5 // 6
    w = max(3, board // 36)
    d.line([cx, y0 + board * 0.06, cx, cy], fill=PURPLE, width=w)
    d.line([cx, cy, x0 + board * 0.94, cy], fill=PURPLE, width=w)
    m = board // 8
    d.line([cx - m, cy - m, cx + m, cy + m], fill=(17, 17, 17), width=max(4, board // 20))
    r = board // 11
    ex = x0 + board * 5 // 6
    d.ellipse([ex - r, cy - r, ex + r, cy + r], fill=ORANGE)
    return img.resize((size, size), Image.LANCZOS)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    draw_icon(192, False).save(OUT / "icon-192.png")
    draw_icon(512, False).save(OUT / "icon-512.png")
    draw_icon(512, True).save(OUT / "icon-maskable-512.png")
    print("icons written to", OUT)


if __name__ == "__main__":
    main()
