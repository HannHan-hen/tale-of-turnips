#!/usr/bin/env python3
"""Process the chicken + berry-bush grid into game-ready PNGs.

Input : a 2x2 magenta grid — chicken (standing), chicken (tucked), bush full, bush empty.
Output: src/assets/forage/{chicken,chicken_b,bush_full,bush_empty}.png, each keyed, kept-
largest, sharpened, and fit to its in-world footprint (chicken 66x66, bush 90x78 = base*SCALE).
The two chicken frames share a box (bottom-aligned) so they bob cleanly; the two bush states
share a box so full<->empty swap in place.

Run: python3 tools/process_forage.py grid.png
"""
import os
import sys
from PIL import Image, ImageFilter
from process_icons import key_magenta
from process_props import keep_largest

OUT = os.path.join(os.path.dirname(__file__), "..", "src", "assets", "forage")
os.makedirs(OUT, exist_ok=True)

COLS, ROWS = 2, 2
# row-major: (key, footprint w, h). base sizes (chicken 22x22, bush 30x26) * SCALE 3.
CELLS = [
    ("chicken", 66, 66), ("chicken_b", 66, 66),
    ("bush_full", 90, 78), ("bush_empty", 90, 78),
]


def sharpen(img):
    rgb = img.convert("RGB").filter(ImageFilter.UnsharpMask(radius=1.2, percent=130, threshold=1))
    return Image.merge("RGBA", (*rgb.split(), img.split()[3]))


def fit(cell, w, h):
    cell = keep_largest(key_magenta(cell))
    bbox = cell.getbbox()
    if bbox:
        cell = cell.crop(bbox)
    factor = min(w / cell.width, h / cell.height)
    nw, nh = max(1, round(cell.width * factor)), max(1, round(cell.height * factor))
    r = sharpen(cell.resize((nw, nh), Image.LANCZOS))
    canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    canvas.alpha_composite(r, ((w - nw) // 2, h - nh))  # bottom-center
    return canvas


def main():
    sheet = Image.open(sys.argv[1]).convert("RGB")
    W, H = sheet.size
    for i, (key, w, h) in enumerate(CELLS):
        c, r = i % COLS, i // COLS
        box = (round(c * W / COLS), round(r * H / ROWS),
               round((c + 1) * W / COLS), round((r + 1) * H / ROWS))
        fit(sheet.crop(box), w, h).save(os.path.join(OUT, key + ".png"))

    # preview on grass
    out = os.path.join(os.path.dirname(__file__), "out")
    os.makedirs(out, exist_ok=True)
    cs = Image.new("RGBA", (4 * 96, 96), (139, 191, 90, 255))
    for i, (key, _, _) in enumerate(CELLS):
        im = Image.open(os.path.join(OUT, key + ".png"))
        cs.alpha_composite(im, (i * 96 + (96 - im.width) // 2, 96 - im.height))
    cs.resize((cs.width * 2, cs.height * 2), Image.NEAREST).save(os.path.join(out, "forage_contact.png"))
    print("wrote", len(CELLS), "forage sprites to", os.path.relpath(OUT))


if __name__ == "__main__":
    main()
