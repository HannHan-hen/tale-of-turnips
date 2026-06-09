#!/usr/bin/env python3
"""Process the team-generated portrait sheet into individual game-ready PNGs.

Input : one magenta-background 2x2 grid of character busts (ChatGPT / GPT Image).
Output: src/assets/portraits/<assetKey>.png — magenta + its soft drop shadow keyed
        out, trimmed, and centered on a uniform 256x256 transparent square.

Run: python3 tools/process_portraits.py /path/to/portraits.png
"""
import os
import sys
from PIL import Image
from process_icons import key_magenta  # shared chroma keyer

OUT = os.path.join(os.path.dirname(__file__), "..", "src", "assets", "portraits")
os.makedirs(OUT, exist_ok=True)

CANVAS = 256
MARGIN = 8
# Tighter ramp than the icons: the portraits sit on a darkened-magenta drop shadow we also
# want gone. All portrait content (skin, plum tunic, greys, browns) stays well below LO=70.
LO, HI = 70, 120

GRID = (2, 2, [
    "portrait_marigold", "portrait_bramble",
    "portrait_pip", "portrait_jay",
])


def normalize(p):
    bbox = p.getbbox()
    if bbox:
        p = p.crop(bbox)
    inner = CANVAS - 2 * MARGIN
    scale = min(inner / p.width, inner / p.height)
    p = p.resize((max(1, round(p.width * scale)), max(1, round(p.height * scale))), Image.LANCZOS)
    sq = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    sq.alpha_composite(p, ((CANVAS - p.width) // 2, (CANVAS - p.height) // 2))
    return sq


def main():
    sheet = Image.open(sys.argv[1]).convert("RGB")
    W, H = sheet.size
    cols, rows, keys = GRID
    for i, key in enumerate(keys):
        c, r = i % cols, i // cols
        box = (round(c * W / cols), round(r * H / rows),
               round((c + 1) * W / cols), round((r + 1) * H / rows))
        portrait = normalize(key_magenta(sheet.crop(box), LO, HI))
        portrait.save(os.path.join(OUT, key + ".png"))

    # contact sheet on a dark background to expose any leftover shadow/halo
    out = os.path.join(os.path.dirname(__file__), "out")
    os.makedirs(out, exist_ok=True)
    cs = Image.new("RGBA", (len(keys) * CANVAS, CANVAS), (40, 30, 60, 255))
    for i, key in enumerate(keys):
        cs.alpha_composite(Image.open(os.path.join(OUT, key + ".png")), (i * CANVAS, 0))
    cs.save(os.path.join(out, "portraits_contact.png"))
    print("wrote", len(keys), "portraits to", os.path.relpath(OUT))


if __name__ == "__main__":
    main()
