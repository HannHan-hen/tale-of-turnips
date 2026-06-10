#!/usr/bin/env python3
"""Process the team-generated prop sheet into individual world-ready PNGs.

Input : one magenta-background 4x3 grid of top-down props (ChatGPT / GPT Image).
Output: src/assets/props/<assetKey>.png — magenta keyed out, trimmed, and resized
        to fit each prop's exact in-world footprint (props render at native size on
        the 48px tile grid, so the bitmap size IS the on-screen size).

Uses the icon-style key thresholds (not the tighter portrait ones) so the purple
glows on the sealed door and reliquary caches survive.

Run: python3 tools/process_props.py /path/to/props.png
"""
import os
import sys
from PIL import Image, ImageFilter
from process_icons import key_magenta  # shared chroma keyer

OUT = os.path.join(os.path.dirname(__file__), "..", "src", "assets", "props")
os.makedirs(OUT, exist_ok=True)

COLS, ROWS = 4, 3
SCALE = 3  # must match src/game/data/scale.ts — props render at native size on the TILE grid
# key value -> base (footprint width, height) in px, matching the procedural sprites in props.ts.
# Multiplied by SCALE below so the raster prop fills the same world space as the scaled tiles.
PROPS = [
    ("cottage", 60, 56), ("stall", 56, 44), ("shipping_box", 30, 26), ("chest", 28, 22),
    ("door", 22, 28), ("signpost", 24, 30), ("anvil", 30, 26), ("rubble", 30, 22),
    ("tree", 26, 40), ("sealed_door", 26, 32), ("cache_closed", 28, 24), ("cache_open", 28, 24),
]


def keep_largest(img):
    """Drop detached fragments (neighbor-cell bleed, stray shadow specks), keeping only
    the largest connected blob of opaque-ish pixels — the actual prop."""
    w, h = img.size
    alpha = img.getchannel("A").load()
    seen = bytearray(w * h)
    best, best_size = None, 0
    for sy in range(h):
        for sx in range(w):
            if seen[sy * w + sx] or alpha[sx, sy] <= 30:
                continue
            stack, comp = [(sx, sy)], []
            seen[sy * w + sx] = 1
            while stack:
                x, y = stack.pop()
                comp.append((x, y))
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx] and alpha[nx, ny] > 30:
                        seen[ny * w + nx] = 1
                        stack.append((nx, ny))
            if len(comp) > best_size:
                best, best_size = comp, len(comp)
    if not best:
        return img
    keep = set(best)
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    src, dst = img.load(), out.load()
    for x, y in keep:
        dst[x, y] = src[x, y]
    return out


def fit(prop, w, h):
    """Trim to content, then scale to fit within the wxh footprint (preserve aspect)."""
    prop = keep_largest(prop)
    bbox = prop.getbbox()
    if bbox:
        prop = prop.crop(bbox)
    scale = min(w / prop.width, h / prop.height)
    out = prop.resize((max(1, round(prop.width * scale)), max(1, round(prop.height * scale))),
                      Image.LANCZOS)
    rgb = out.convert("RGB").filter(ImageFilter.UnsharpMask(radius=1.2, percent=130, threshold=1))
    return Image.merge("RGBA", (*rgb.split(), out.split()[3]))


def main():
    sheet = Image.open(sys.argv[1]).convert("RGB")
    W, H = sheet.size
    for i, (key, w, h) in enumerate(PROPS):
        c, r = i % COLS, i // COLS
        box = (round(c * W / COLS), round(r * H / ROWS),
               round((c + 1) * W / COLS), round((r + 1) * H / ROWS))
        fit(key_magenta(sheet.crop(box)), w * SCALE, h * SCALE).save(os.path.join(OUT, key + ".png"))

    # contact sheet on grass green (#8bbf5a) — the real backdrop — to expose any halo/shadow
    out = os.path.join(os.path.dirname(__file__), "out")
    os.makedirs(out, exist_ok=True)
    pad, cell = 10, 72
    cs = Image.new("RGBA", (COLS * cell, ROWS * cell), (139, 191, 90, 255))
    for i, (key, _, _) in enumerate(PROPS):
        img = Image.open(os.path.join(OUT, key + ".png"))
        cx = (i % COLS) * cell + (cell - img.width) // 2
        cy = (i // COLS) * cell + (cell - img.height) // 2
        cs.alpha_composite(img, (cx, cy))
    cs.resize((cs.width * 2, cs.height * 2), Image.NEAREST).save(
        os.path.join(out, "props_contact.png"))
    print("wrote", len(PROPS), "props to", os.path.relpath(OUT))


if __name__ == "__main__":
    main()
