#!/usr/bin/env python3
"""Process the 4 NPC world sprites from one 2x2 magenta grid into game-ready PNGs.

NPCs are static, front-facing, full-body sprites that stand in the world next to the player,
so they're fit to the same 72x96 footprint (24x32 * SCALE 3). Output filenames match the
NpcDef texture keys.

Run: python3 tools/process_npcs.py grid.png
Out: src/assets/npcs/*.png  + tools/out/npcs_contact.png
"""
import os
import sys
from PIL import Image, ImageFilter
from process_icons import key_magenta
from process_props import keep_largest

OUT = os.path.join(os.path.dirname(__file__), "..", "src", "assets", "npcs")
os.makedirs(OUT, exist_ok=True)

COLS, ROWS = 2, 2
BOX_W, BOX_H = 72, 96
MARGIN = 2
# row-major order, matching the grid we were given.
NPCS = ["npc_seed_seller", "npc_blacksmith", "npc_villager", "npc_jay"]


def sharpen(img):
    rgb = img.convert("RGB").filter(ImageFilter.UnsharpMask(radius=1.2, percent=140, threshold=1))
    return Image.merge("RGBA", (*rgb.split(), img.split()[3]))


def fit(cell):
    cell = keep_largest(key_magenta(cell))
    bbox = cell.getbbox()
    if bbox:
        cell = cell.crop(bbox)
    factor = min((BOX_W - MARGIN) / cell.width, (BOX_H - MARGIN) / cell.height)
    w, h = max(1, round(cell.width * factor)), max(1, round(cell.height * factor))
    r = sharpen(cell.resize((w, h), Image.LANCZOS))
    canvas = Image.new("RGBA", (BOX_W, BOX_H), (0, 0, 0, 0))
    canvas.alpha_composite(r, ((BOX_W - w) // 2, BOX_H - MARGIN - h))
    return canvas


def main():
    sheet = Image.open(sys.argv[1]).convert("RGB")
    W, H = sheet.size
    for i, key in enumerate(NPCS):
        c, r = i % COLS, i // COLS
        box = (round(c * W / COLS), round(r * H / ROWS),
               round((c + 1) * W / COLS), round((r + 1) * H / ROWS))
        fit(sheet.crop(box)).save(os.path.join(OUT, key + ".png"))

    preview = os.path.join(os.path.dirname(__file__), "out")
    os.makedirs(preview, exist_ok=True)
    cs = Image.new("RGBA", (len(NPCS) * BOX_W, BOX_H), (139, 191, 90, 255))
    for i, key in enumerate(NPCS):
        cs.alpha_composite(Image.open(os.path.join(OUT, key + ".png")), (i * BOX_W, 0))
    cs.resize((cs.width * 2, cs.height * 2), Image.NEAREST).save(os.path.join(preview, "npcs_contact.png"))
    print("wrote", len(NPCS), "npc sprites to", os.path.relpath(OUT))


if __name__ == "__main__":
    main()
