#!/usr/bin/env python3
"""Proof-of-concept: bake polished crop sprites to PNG entirely in code.

No external art, no image-gen API — just a software rasterizer (Pillow) drawing
shapes with the project palette, supersampled 4x for smooth, "drawn" edges.
This demonstrates the code-baked-raster route described in CLAUDE.md rule 7.

Run: python3 tools/bake_sprites_poc.py
Out: tools/out/*.png  (gitignored; regenerate any time)
"""
import math
import os
from PIL import Image, ImageDraw, ImageFilter

OUT = os.path.join(os.path.dirname(__file__), "out")
os.makedirs(OUT, exist_ok=True)

SS = 4          # supersample factor (render big, shrink for anti-aliasing)
SIZE = 64       # final sprite size in px

# Colors pulled straight from src/game/data/palette.ts so it stays coherent.
P = {
    "bulb": "#f3efe2", "bulbDark": "#d9cdba", "bulbTop": "#b5567f",
    "leaf": "#66b257", "leafDark": "#47924a", "leafLight": "#8fce5e",
    "soil": "#9a6440", "carrot": "#e8843f", "carrotDark": "#c66828",
    "radish": "#d9466a", "radishDark": "#b22f50", "white": "#fff4d6",
    "outline": "#3a2f3a",
}


def canvas():
    """A transparent supersampled canvas + draw handle."""
    img = Image.new("RGBA", (SIZE * SS, SIZE * SS), (0, 0, 0, 0))
    return img, ImageDraw.Draw(img)


def finish(img, name):
    """Down-sample (anti-alias) and save, plus a 2x preview."""
    out = img.resize((SIZE, SIZE), Image.LANCZOS)
    out.save(os.path.join(OUT, f"{name}.png"))
    return out


def ellipse(d, cx, cy, rx, ry, fill, outline=None, w=0):
    d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=fill, outline=outline, width=w)


def leaves(d, cx, topy, scale):
    """A little three-leaf crown drawn as rotated tapered blades."""
    for ang, length, col in [(-38, 1.0, P["leafDark"]), (0, 1.25, P["leaf"]),
                             (38, 1.0, P["leafLight"])]:
        a = math.radians(ang)
        bx, by = cx, topy
        tipx = bx + math.sin(a) * 46 * SS * scale * length
        tipy = by - math.cos(a) * 46 * SS * scale * length
        perp = a + math.pi / 2
        halfw = 11 * SS * scale
        p1 = (bx + math.cos(perp) * halfw, by + math.sin(perp) * halfw)
        p2 = (bx - math.cos(perp) * halfw, by - math.sin(perp) * halfw)
        d.polygon([p1, p2, (tipx, tipy)], fill=col)
        ellipse(d, (p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2, halfw, halfw * 0.7, col)


def specular(img, cx, cy, rx, ry):
    """Soft white highlight blob, blurred, comped on top."""
    hl = Image.new("RGBA", img.size, (0, 0, 0, 0))
    hd = ImageDraw.Draw(hl)
    ellipse(hd, cx, cy, rx, ry, (255, 255, 255, 150))
    hl = hl.filter(ImageFilter.GaussianBlur(6 * SS))
    img.alpha_composite(hl)


def bake_turnip():
    img, d = canvas()
    cx = SIZE * SS / 2
    leaves(d, cx, 26 * SS, 1.0)
    # bulb body
    ellipse(d, cx, 40 * SS, 19 * SS, 20 * SS, P["bulb"], outline=P["outline"], w=2 * SS)
    # lower shading crescent
    ellipse(d, cx, 46 * SS, 15 * SS, 14 * SS, P["bulbDark"])
    ellipse(d, cx, 40 * SS, 18 * SS, 19 * SS, P["bulb"])
    # pink crown band
    d.pieslice([cx - 19 * SS, 20 * SS, cx + 19 * SS, 44 * SS], 180, 360, fill=P["bulbTop"])
    ellipse(d, cx, 40 * SS, 18 * SS, 19 * SS, P["bulb"])  # re-cover bottom
    ellipse(d, cx, 30 * SS, 18 * SS, 9 * SS, P["bulbTop"])  # crown
    specular(img, cx - 7 * SS, 35 * SS, 5 * SS, 7 * SS)
    return finish(img, "turnip")


def bake_carrot():
    img, d = canvas()
    cx = SIZE * SS / 2
    leaves(d, cx, 22 * SS, 0.85)
    # tapered root
    top, bot, halfw = 24 * SS, 58 * SS, 14 * SS
    d.polygon([(cx - halfw, top), (cx + halfw, top), (cx, bot)],
              fill=P["carrot"], outline=P["outline"])
    d.polygon([(cx + 3 * SS, top + 2 * SS), (cx + halfw - 2 * SS, top + 2 * SS), (cx, bot - 4 * SS)],
              fill=P["carrotDark"])
    # ridges
    for i in range(1, 5):
        y = top + i * 7 * SS
        d.line([(cx - halfw + i * 2 * SS, y), (cx + halfw - i * 2 * SS, y)],
               fill=P["carrotDark"], width=SS)
    specular(img, cx - 4 * SS, 32 * SS, 3 * SS, 9 * SS)
    return finish(img, "carrot")


def bake_radish():
    img, d = canvas()
    cx = SIZE * SS / 2
    leaves(d, cx, 24 * SS, 0.9)
    ellipse(d, cx, 40 * SS, 16 * SS, 18 * SS, P["radish"], outline=P["outline"], w=2 * SS)
    ellipse(d, cx, 45 * SS, 12 * SS, 12 * SS, P["radishDark"])
    ellipse(d, cx, 38 * SS, 15 * SS, 16 * SS, P["radish"])
    # white tail tip
    ellipse(d, cx, 57 * SS, 5 * SS, 5 * SS, P["white"])
    specular(img, cx - 6 * SS, 34 * SS, 4 * SS, 6 * SS)
    return finish(img, "radish")


def main():
    sprites = [bake_turnip(), bake_carrot(), bake_radish()]
    # contact sheet for easy viewing
    sheet = Image.new("RGBA", (SIZE * 3 + 40, SIZE + 20), (36, 26, 58, 255))
    for i, s in enumerate(sprites):
        sheet.paste(s, (10 + i * (SIZE + 10), 10), s)
    sheet.resize((sheet.width * 3, sheet.height * 3), Image.NEAREST).save(
        os.path.join(OUT, "_contact_sheet.png"))
    print("baked:", os.listdir(OUT))


if __name__ == "__main__":
    main()
