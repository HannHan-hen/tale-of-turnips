import { palette } from '../../data/palette';
import type { PixelSprite } from './spriteGrid';

// Structures and props. These are mostly rectangular, so each is composed from filled rects
// into a character grid (guaranteeing valid rows) and then gets the shared 1px auto-outline,
// so they read as deliberate pixel art alongside the cast and creatures.

type Draw = (rect: (ch: string, x: number, y: number, w: number, h: number) => void) => void;

function build(
  width: number,
  height: number,
  legend: Record<string, number>,
  draw: Draw,
): PixelSprite {
  const g: string[][] = Array.from({ length: height }, () => Array<string>(width).fill('.'));
  const rect = (ch: string, x: number, y: number, w: number, h: number): void => {
    for (let yy = y; yy < y + h; yy++) {
      for (let xx = x; xx < x + w; xx++) {
        if (yy >= 0 && yy < height && xx >= 0 && xx < width) g[yy][xx] = ch;
      }
    }
  };
  draw(rect);
  return { width, height, outline: palette.outline, legend, rows: g.map((r) => r.join('')) };
}

const woodLegend = { w: palette.wood, W: palette.woodDark, L: palette.woodLight, m: palette.metal };

// The shipping box: an open wooden crate you drop crops into.
export const SHIPPING_BOX = build(30, 26, woodLegend, (r) => {
  r('w', 3, 1, 24, 1); // back rim
  r('W', 3, 2, 24, 3); // open interior (dark)
  r('w', 2, 4, 26, 21); // front face
  r('W', 2, 8, 26, 1); // plank seams
  r('W', 2, 13, 26, 1);
  r('W', 2, 18, 26, 1);
  r('W', 2, 24, 26, 1); // bottom edge
  r('L', 3, 5, 1, 18); // left highlight
  r('W', 26, 5, 1, 19); // right shadow
});

// A wooden door (house entrance).
export const DOOR = build(22, 28, woodLegend, (r) => {
  r('w', 2, 1, 18, 25); // slab
  r('W', 2, 7, 18, 1); // plank seams
  r('W', 2, 13, 18, 1);
  r('W', 2, 19, 18, 1);
  r('W', 2, 25, 18, 1); // bottom edge
  r('L', 3, 2, 1, 23); // left highlight
  r('W', 19, 2, 1, 23); // right shadow
  r('m', 16, 13, 2, 2); // knob
});

// A treasure chest: rounded wooden lid, gold band and lock.
export const CHEST = build(28, 22, woodLegend, (r) => {
  // domed lid
  r('w', 6, 1, 16, 1);
  r('w', 4, 2, 20, 1);
  r('w', 3, 3, 22, 1);
  r('w', 2, 4, 24, 3);
  r('W', 2, 6, 24, 1); // lid lip
  // body
  r('w', 2, 7, 24, 12);
  r('W', 2, 18, 24, 1); // bottom edge
  r('L', 4, 4, 2, 1); // lid highlight
  r('L', 3, 8, 1, 9); // body highlight
  r('W', 24, 8, 1, 10); // body shadow
  // gold band + lock
  r('m', 13, 1, 2, 18);
  r('m', 11, 8, 6, 5);
  r('W', 13, 9, 2, 3); // keyhole
});

// A signpost: a planked board on a post.
export const SIGNPOST = build(24, 30, woodLegend, (r) => {
  r('w', 10, 11, 4, 18); // post
  r('L', 10, 11, 1, 18);
  r('W', 13, 11, 1, 18);
  r('w', 2, 1, 20, 10); // board
  r('L', 3, 2, 16, 1); // top highlight
  r('W', 3, 4, 16, 1); // text lines
  r('W', 3, 7, 16, 1);
  r('W', 2, 10, 20, 1); // bottom edge
});

// A blacksmith's anvil: horned steel top, narrow waist, flared base.
export const ANVIL = build(30, 26, { s: palette.steel, S: palette.steelDark, L: palette.stoneLight }, (r) => {
  r('s', 6, 5, 18, 4); // top working surface
  r('s', 2, 6, 5, 2); // horn
  r('L', 7, 5, 10, 1); // top highlight
  r('S', 6, 8, 18, 1); // under-top shadow
  r('s', 11, 9, 8, 6); // waist
  r('S', 17, 9, 1, 6); // waist shadow
  r('s', 8, 15, 14, 2); // base flare
  r('s', 6, 17, 18, 3); // base
  r('S', 6, 19, 18, 1); // base shadow
});

// A pile of ruin rubble: broken stone blocks.
export const RUBBLE = build(30, 22, { s: palette.stone, S: palette.stoneDark, L: palette.stoneLight }, (r) => {
  r('s', 3, 9, 24, 8); // main heap
  r('S', 3, 15, 24, 2); // base shadow
  r('s', 5, 5, 9, 6); // left block
  r('L', 6, 5, 4, 1);
  r('S', 5, 10, 9, 1);
  r('s', 17, 7, 8, 5); // right block
  r('L', 18, 7, 3, 1);
  r('s', 11, 3, 7, 5); // top block
  r('L', 12, 3, 3, 1);
  r('S', 11, 7, 7, 1);
});

// The sealed ruin door: a stone slab with a glowing starlit seal.
export const SEALED_DOOR = build(
  26,
  32,
  { s: palette.stone, S: palette.stoneDark, L: palette.stoneLight, g: palette.starlight },
  (r) => {
    r('s', 2, 1, 22, 30); // slab
    r('L', 3, 2, 1, 27); // highlight
    r('S', 22, 2, 1, 27); // shadow
    r('S', 2, 30, 22, 1); // base edge
    r('g', 12, 4, 2, 16); // vertical seal connecting the glyphs
    // upper diamond
    r('g', 11, 5, 4, 1);
    r('g', 10, 6, 6, 1);
    r('g', 11, 7, 4, 1);
    // glowing mid-band
    r('g', 6, 11, 14, 2);
    // lower diamond
    r('g', 11, 16, 4, 1);
    r('g', 10, 17, 6, 1);
    r('g', 11, 18, 4, 1);
  },
);

const cacheLegend = {
  d: palette.starless,
  D: palette.starlessDark,
  t: palette.starlessTrim,
  g: palette.starlight,
  m: palette.cacheGold,
};

// A Starless reliquary cache — closed: dark with a glowing seam, gold clasp, and tiny stars.
export const CACHE_CLOSED = build(28, 24, cacheLegend, (r) => {
  r('d', 3, 2, 22, 12); // box body
  r('D', 3, 2, 22, 2); // top frame
  r('D', 3, 12, 22, 2); // bottom frame
  r('g', 4, 8, 20, 1); // glowing seam
  r('m', 13, 4, 2, 9); // clasp
  r('m', 10, 6, 8, 4); // clasp plate
  r('D', 12, 7, 4, 2); // keyhole
  r('t', 7, 5, 1, 1); // little stars
  r('t', 20, 10, 1, 1);
  r('t', 6, 11, 1, 1);
});

// A cute cottage: pink shingled roof over plaster walls, a window and a front door.
export const COTTAGE = build(
  60,
  56,
  {
    f: palette.floorWood,
    F: palette.floorWoodDark,
    r: palette.roof,
    R: palette.roofDark,
    O: palette.roofLight,
    g: palette.window,
    w: palette.wood,
    W: palette.woodDark,
    m: palette.metal,
  },
  (r) => {
    // roof (stepped trapezoid with a highlighted left slope and dark eaves)
    r('r', 20, 2, 20, 4);
    r('r', 14, 6, 32, 4);
    r('r', 9, 10, 42, 4);
    r('r', 5, 14, 50, 4);
    r('R', 2, 18, 56, 5); // overhanging eaves
    r('O', 21, 3, 9, 1);
    r('O', 15, 7, 13, 1);
    r('O', 10, 11, 17, 1);
    r('O', 6, 15, 21, 1);
    // walls
    r('f', 7, 22, 46, 31);
    r('F', 7, 49, 46, 4); // base shadow
    r('F', 49, 23, 4, 29); // right-wall shadow
    // window (left)
    r('W', 13, 28, 13, 13);
    r('g', 15, 30, 9, 9);
    r('W', 19, 30, 1, 9); // mullions
    r('W', 15, 34, 9, 1);
    // door (center)
    r('W', 25, 38, 11, 15);
    r('w', 26, 39, 9, 14);
    r('W', 30, 39, 1, 14); // plank seam
    r('m', 27, 46, 1, 2); // knob
  },
);

// A market stall: a striped awning on posts above a wooden counter.
export const STALL = build(
  56,
  44,
  {
    w: palette.wood,
    W: palette.woodDark,
    L: palette.woodLight,
    c: palette.cloth,
    k: palette.uiInk,
    C: palette.clothDark,
  },
  (r) => {
    // counter
    r('w', 5, 26, 46, 15);
    r('W', 5, 37, 46, 4); // base shadow
    r('w', 3, 23, 50, 4); // counter top
    r('L', 4, 23, 48, 1); // top highlight
    // posts
    r('w', 6, 12, 3, 14);
    r('W', 8, 12, 1, 14);
    r('w', 47, 12, 3, 14);
    r('W', 49, 12, 1, 14);
    // striped awning
    for (let i = 0; i < 6; i++) {
      r(i % 2 === 0 ? 'c' : 'k', 4 + i * 8, 4, 8, 9);
    }
    r('C', 4, 11, 48, 2); // awning shadow lip
    r('W', 3, 2, 50, 2); // awning ridge
  },
);

// A Starless reliquary cache — open and emptied, lid ajar above the dark interior.
export const CACHE_OPEN = build(28, 24, cacheLegend, (r) => {
  r('d', 3, 1, 22, 3); // raised lid
  r('D', 3, 3, 22, 1); // lid underside
  r('g', 6, 5, 16, 1); // residual glow
  r('d', 3, 7, 22, 1); // box top rim
  r('d', 3, 7, 1, 8); // box sides
  r('d', 24, 7, 1, 8);
  r('D', 4, 8, 20, 6); // empty dark interior
  r('d', 3, 14, 22, 1); // box bottom rim
  r('D', 3, 15, 22, 1);
});
