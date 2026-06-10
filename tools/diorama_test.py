#!/usr/bin/env python3
"""Build a farm-diorama GIF so we can judge the raster player in context.

Places the already-approved raster props (cottage, tree, chest, shipping box,
signpost) at their true in-world footprints on a tiled grass/soil field, then
animates the farmer walking down through the scene with depth sorting — all at
the game's 48px tile scale, upscaled with nearest-neighbor for viewing.

NOTE: grass/soil tiles here are drawn just for this mock; the real game uses its
own procedural pixel-art tiles (and also has pixel-art crops/NPCs/enemies). This
shows the raster *player vs raster props* scale + coherence, which is the call.

Run: python3 tools/diorama_test.py /path/to/player_strip.png
"""
import os
import sys
from PIL import Image, ImageDraw
from process_player_test import frames, place

TILE = 96
COLS, ROWS = 11, 8
SCALE = 1
OUT = os.path.join(os.path.dirname(__file__), "out")
PROPS = os.path.join(os.path.dirname(__file__), "..", "src", "assets", "props")


def field():
    img = Image.new("RGBA", (COLS * TILE, ROWS * TILE), (139, 191, 90, 255))
    d = ImageDraw.Draw(img)
    for r in range(ROWS):
        for c in range(COLS):
            x, y = c * TILE, r * TILE
            # subtle grass speckle (deterministic) so it reads as tiled, not flat
            h = (c * 73 + r * 131) % 7
            if h == 0:
                d.rectangle([x + 8, y + 30, x + 12, y + 34], fill=(111, 162, 71, 255))
            if h == 3:
                d.rectangle([x + 30, y + 12, x + 34, y + 16], fill=(166, 214, 114, 255))
    # a little soil plot, columns 4-6 rows 4-5
    for r in range(4, 6):
        for c in range(4, 7):
            x, y = c * TILE, r * TILE
            d.rectangle([x, y, x + TILE - 1, y + TILE - 1], fill=(154, 100, 64, 255))
            for fy in range(y + 6, y + TILE, 10):
                d.line([(x + 4, fy), (x + TILE - 4, fy)], fill=(116, 74, 48, 255))
    return img


def prop(name):
    return Image.open(os.path.join(PROPS, name + ".png")).convert("RGBA")


def main():
    # Use the real exported player frames (front walk) straight from src/assets/player.
    PLAYER = os.path.join(os.path.dirname(__file__), "..", "src", "assets", "player")
    load = lambda n: Image.open(os.path.join(PLAYER, n + ".png")).convert("RGBA")
    cycle = [load("player_down_a"), load("player"), load("player_down_b"), load("player")]

    # static props: (image, anchor x, baseline y) — origin bottom-center like the engine
    statics = [
        (prop("cottage"), 2 * TILE, 2 * TILE + 20),
        (prop("tree"), 8 * TILE + 10, 2 * TILE + 16),
        (prop("signpost"), 9 * TILE, 5 * TILE),
        (prop("shipping_box"), 2 * TILE, 6 * TILE + 10),
        (prop("chest"), 8 * TILE + 20, 6 * TILE + 30),
    ]

    base = field()
    gif_frames = []
    py = int(1.6 * TILE)
    for step in range(16):
        scene = base.copy()
        fr = cycle[step % 4]
        px = int(5.0 * TILE)
        py += 7
        drawables = [(img, ax, by) for img, ax, by in statics]
        drawables.append((fr, px, py))
        for img, ax, by in sorted(drawables, key=lambda t: t[2]):
            scene.alpha_composite(img, (ax - img.width // 2, by - img.height))
        big = scene.resize((scene.width * SCALE, scene.height * SCALE), Image.NEAREST)
        gif_frames.append(big.convert("P", palette=Image.ADAPTIVE))

    os.makedirs(OUT, exist_ok=True)
    gif_frames[0].save(os.path.join(OUT, "diorama.gif"), save_all=True,
                       append_images=gif_frames[1:], duration=125, loop=0, disposal=2)
    print("wrote diorama.gif")


if __name__ == "__main__":
    main()
