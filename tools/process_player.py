#!/usr/bin/env python3
"""Process the three player walk strips (front, back, side) into the 9 engine frames.

Each strip is a magenta 3-frame row: [step-left, stand, step-right]. For each strip we slice,
key the magenta, keep the largest blob, then scale all three frames by ONE factor (from the
stand frame) so the character stays the same size across the cycle, and bottom-center each on a
72x96 box (24x32 * SCALE 3) so feet sit on a shared ground line. Output filenames match the
engine's PlayerFrame texture keys; the side strip faces right (the engine flips it for left).

Run: python3 tools/process_player.py front.png back.png side.png
Out: src/assets/player/*.png  + tools/out/player_<dir>.gif previews
"""
import os
import sys
from PIL import Image, ImageFilter
from process_icons import key_magenta
from process_props import keep_largest

OUT = os.path.join(os.path.dirname(__file__), "..", "src", "assets", "player")
os.makedirs(OUT, exist_ok=True)
PREVIEW = os.path.join(os.path.dirname(__file__), "out")
os.makedirs(PREVIEW, exist_ok=True)

BOX_W, BOX_H = 72, 96  # 24x32 * SCALE(3)
MARGIN = 2

# strip -> the three engine frame keys, in [step-left, stand, step-right] order.
STRIPS = {
    "front": ["player_down_a", "player", "player_down_b"],
    "back": ["player_up_a", "player_up", "player_up_b"],
    "side": ["player_side_a", "player_side", "player_side_b"],
}


def sharpen(img):
    rgb = img.convert("RGB").filter(ImageFilter.UnsharpMask(radius=1.2, percent=140, threshold=1))
    return Image.merge("RGBA", (*rgb.split(), img.split()[3]))


def cut(strip_path):
    sheet = Image.open(strip_path).convert("RGB")
    W, H = sheet.size
    out = []
    for i in range(3):
        cell = keep_largest(key_magenta(sheet.crop((round(i * W / 3), 0, round((i + 1) * W / 3), H))))
        bbox = cell.getbbox()
        out.append(cell.crop(bbox) if bbox else cell)
    return out


def place(frames):
    """Scale all three frames by one stand-derived factor; bottom-center on the box."""
    stand_h = frames[1].height
    factor = (BOX_H - MARGIN) / stand_h
    widest = max(f.width for f in frames) * factor
    if widest > BOX_W:
        factor *= BOX_W / widest
    placed = []
    for f in frames:
        w, h = max(1, round(f.width * factor)), max(1, round(f.height * factor))
        r = sharpen(f.resize((w, h), Image.LANCZOS))
        canvas = Image.new("RGBA", (BOX_W, BOX_H), (0, 0, 0, 0))
        canvas.alpha_composite(r, ((BOX_W - w) // 2, BOX_H - MARGIN - h))
        placed.append(canvas)
    return placed


def gif(path, placed, bg):
    seq = [placed[0], placed[1], placed[2], placed[1]]  # A stand B stand
    big = [f.resize((f.width * 3, f.height * 3), Image.NEAREST) for f in seq]
    flat = []
    for f in big:
        c = Image.new("RGBA", f.size, bg)
        c.alpha_composite(f)
        flat.append(c.convert("P", palette=Image.ADAPTIVE))
    flat[0].save(path, save_all=True, append_images=flat[1:], duration=125, loop=0, disposal=2)


def main():
    args = dict(zip(["front", "back", "side"], sys.argv[1:4]))
    for direction, path in args.items():
        frames = cut(path)
        # The engine stores side art facing RIGHT and flips it for left (setFlipX). The supplied
        # side strip faces left, so mirror it here.
        if direction == "side":
            frames = [f.transpose(Image.FLIP_LEFT_RIGHT) for f in frames]
        placed = place(frames)
        for key, frame in zip(STRIPS[direction], placed):
            frame.save(os.path.join(OUT, key + ".png"))
        gif(os.path.join(PREVIEW, f"player_{direction}.gif"), placed, (139, 191, 90, 255))
    print("wrote", 3 * len(args), "player frames to", os.path.relpath(OUT))


if __name__ == "__main__":
    main()
