#!/usr/bin/env python3
"""Test harness for a player walk strip: slice, key, align, and build preview GIFs.

Slices a 3-frame magenta strip (step-left / stand / step-right), keys the magenta,
keeps the largest blob, then aligns every frame to a shared foot pivot and common
height so the character neither bobs nor resizes between frames. Emits two GIFs:
  - tools/out/player_ingame.gif   true ~24x32 footprint, nearest-scaled up to view
  - tools/out/player_detail.gif   large, to judge the art + walk smoothness
The engine cycle is A -> stand -> B -> stand at 8fps; the GIF mirrors it.

Run: python3 tools/process_player_test.py /path/to/strip.png
"""
import os
import sys
from PIL import Image
from process_icons import key_magenta
from process_props import keep_largest

OUT = os.path.join(os.path.dirname(__file__), "out")
os.makedirs(OUT, exist_ok=True)

NATIVE_W, NATIVE_H = 24, 32   # procedural player footprint
FOOT_MARGIN = 1               # px below feet


def frames(path):
    sheet = Image.open(path).convert("RGB")
    W, H = sheet.size
    cut = []
    for i in range(3):
        cell = sheet.crop((round(i * W / 3), 0, round((i + 1) * W / 3), H))
        fr = keep_largest(key_magenta(cell))
        bbox = fr.getbbox()
        cut.append(fr.crop(bbox) if bbox else fr)
    return cut


def place(cut, box_w, box_h):
    """Scale each trimmed frame to the common height, then bottom-center on box_w x box_h."""
    target_h = box_h - FOOT_MARGIN
    out = []
    for fr in cut:
        s = target_h / fr.height
        w, h = max(1, round(fr.width * s)), max(1, round(fr.height * s))
        r = fr.resize((w, h), Image.LANCZOS)
        canvas = Image.new("RGBA", (box_w, box_h), (0, 0, 0, 0))
        canvas.alpha_composite(r, ((box_w - w) // 2, box_h - FOOT_MARGIN - h))
        out.append(canvas)
    return out


def gif(path, placed, scale, bg):
    seq = [placed[0], placed[1], placed[2], placed[1]]  # A stand B stand
    big = [f.resize((f.width * scale, f.height * scale), Image.NEAREST) for f in seq]
    flat = []
    for f in big:
        c = Image.new("RGBA", f.size, bg)
        c.alpha_composite(f)
        flat.append(c.convert("P", palette=Image.ADAPTIVE))
    flat[0].save(path, save_all=True, append_images=flat[1:], duration=125, loop=0, disposal=2)


def main():
    cut = frames(sys.argv[1])
    grass = (139, 191, 90, 255)
    gif(os.path.join(OUT, "player_ingame.gif"),
        place(cut, NATIVE_W, NATIVE_H), 7, grass)        # honest in-world size
    gif(os.path.join(OUT, "player_detail.gif"),
        place(cut, 120, 160), 1, grass)                  # quality + walk smoothness
    print("wrote player_ingame.gif and player_detail.gif")


if __name__ == "__main__":
    main()
