import { palette } from '../../data/palette';
import { build } from './compose';
import type { PixelSprite } from './spriteGrid';

// Inventory + HUD icons. Small (20x20) emblems composed from rects (see compose.build) so they
// stay crisp and get the shared 1px outline. Hearts and the attack slash round out the HUD.

// --- crops ---
export const ICON_TURNIP = build(
  20,
  20,
  {
    b: palette.bulb,
    B: palette.bulbDark,
    p: palette.bulbTop,
    l: palette.leaf,
    L: palette.leafDark,
    H: palette.leafLight,
  },
  (r) => {
    r('l', 6, 3, 2, 4); // leaves
    r('l', 12, 3, 2, 4);
    r('L', 9, 2, 2, 5);
    r('H', 6, 3, 1, 2);
    r('p', 5, 7, 10, 3); // purple crown
    r('b', 4, 10, 12, 5); // bulb
    r('b', 6, 15, 8, 2);
    r('b', 8, 17, 4, 1);
    r('B', 13, 11, 2, 4); // shadow
    r('H', 6, 11, 2, 1); // highlight
  },
);

export const ICON_CARROT = build(
  20,
  20,
  { c: palette.carrot, C: palette.carrotDark, l: palette.leaf, L: palette.leafDark, H: palette.leafLight },
  (r) => {
    r('l', 6, 2, 2, 4); // greens
    r('l', 12, 2, 2, 4);
    r('L', 9, 1, 2, 5);
    r('c', 6, 7, 8, 4); // root
    r('c', 8, 11, 4, 4);
    r('c', 9, 15, 2, 3);
    r('C', 11, 8, 1, 9); // shadow
    r('H', 7, 7, 2, 1); // highlight
  },
);

export const ICON_RADISH = build(
  20,
  20,
  { k: palette.radish, K: palette.radishDark, t: palette.radishTip, l: palette.leaf, L: palette.leafDark },
  (r) => {
    r('l', 6, 2, 2, 4); // greens
    r('l', 12, 2, 2, 4);
    r('L', 9, 1, 2, 5);
    r('k', 5, 7, 10, 7); // round root
    r('k', 6, 6, 8, 1);
    r('k', 7, 14, 6, 1);
    r('K', 12, 8, 1, 6); // shadow
    r('t', 8, 15, 4, 3); // pale tip
    r('t', 9, 18, 2, 1);
  },
);

// --- seeds (shared cream paper packet, tinted per crop) ---
function makeSeed(tint: number): PixelSprite {
  return build(
    20,
    20,
    { p: palette.egg, P: palette.chickenShade, t: tint, l: palette.leaf, W: palette.woodDark },
    (r) => {
      r('l', 9, 1, 2, 3); // sprout poking out the top
      r('p', 5, 3, 10, 14); // paper packet
      r('P', 13, 4, 1, 11); // shadow
      r('P', 6, 15, 8, 1);
      r('W', 6, 7, 8, 1); // fold seam
      r('t', 7, 9, 6, 5); // colored seed label
    },
  );
}
export const ICON_TURNIP_SEED = makeSeed(palette.bulbTop);
export const ICON_CARROT_SEED = makeSeed(palette.carrot);
export const ICON_RADISH_SEED = makeSeed(palette.radish);

// --- forage ---
export const ICON_EGG = build(20, 20, { e: palette.egg, E: palette.chickenShade, w: palette.uiInk }, (r) => {
  r('e', 7, 4, 6, 12); // body
  r('e', 8, 3, 4, 1);
  r('e', 8, 16, 4, 1);
  r('E', 11, 7, 2, 8); // shadow
  r('w', 8, 6, 2, 3); // shine
});

export const ICON_BERRY = build(
  20,
  20,
  { o: palette.berry, O: palette.cloth, l: palette.berryLeaf, L: palette.leafDark },
  (r) => {
    r('l', 8, 3, 2, 4); // stems
    r('l', 11, 4, 2, 3);
    r('o', 5, 9, 5, 5); // three berries
    r('o', 11, 8, 5, 5);
    r('o', 8, 13, 5, 5);
    r('O', 6, 10, 1, 1); // highlights
    r('O', 12, 9, 1, 1);
    r('O', 9, 14, 1, 1);
  },
);

// --- combat ---
export const ICON_SWORD = build(
  20,
  20,
  { s: palette.steel, S: palette.steelDark, L: palette.stoneLight, m: palette.metal, w: palette.woodDark },
  (r) => {
    r('s', 9, 2, 3, 11); // blade
    r('L', 9, 3, 1, 8); // edge highlight
    r('S', 11, 4, 1, 8); // back shadow
    r('m', 6, 13, 8, 2); // guard
    r('w', 9, 15, 2, 4); // grip
    r('m', 8, 18, 4, 1); // pommel
  },
);

export const ICON_ARMOR = build(20, 20, { c: palette.cloth, C: palette.clothDark, s: palette.skin }, (r) => {
  r('s', 8, 3, 4, 2); // collar gap
  r('c', 5, 5, 10, 11); // vest
  r('C', 9, 5, 2, 11); // center seam
  r('C', 5, 14, 10, 2); // hem
  r('c', 3, 6, 2, 5); // shoulders
  r('c', 15, 6, 2, 5);
});

export const ICON_RUIN_SHARD = build(20, 20, { s: palette.shard, w: palette.uiInk }, (r) => {
  r('s', 8, 3, 4, 13); // main crystal
  r('s', 5, 8, 3, 5); // left facet
  r('s', 12, 6, 3, 7); // right facet
  r('w', 9, 5, 1, 6); // shine
});

export const ICON_SHADOW_WISP = build(
  20,
  20,
  { p: palette.wisp, g: palette.glow, d: palette.shadeDark },
  (r) => {
    r('p', 8, 3, 4, 11); // flame body
    r('p', 6, 7, 2, 6); // licks
    r('p', 12, 8, 2, 5);
    r('g', 9, 6, 2, 4); // glowing core
    r('d', 7, 14, 6, 3); // shadow base
  },
);

// --- legendary Starless set ---
const starlessLegend = {
  d: palette.starless,
  D: palette.starlessDark,
  t: palette.starlessTrim,
  g: palette.starlight,
};

export const ICON_STARLESS_HELM = build(20, 20, starlessLegend, (r) => {
  r('t', 9, 2, 2, 3); // crest
  r('d', 5, 4, 10, 8); // dome
  r('D', 5, 11, 10, 4); // visor
  r('g', 7, 6, 2, 2); // shine
  r('g', 11, 6, 2, 2);
});

export const ICON_STARLESS_PLATE = build(20, 20, starlessLegend, (r) => {
  r('d', 4, 4, 12, 12); // breastplate
  r('t', 4, 4, 12, 1); // collar trim
  r('D', 9, 5, 2, 11); // center seam
  r('g', 7, 8, 2, 2); // studs
  r('g', 11, 8, 2, 2);
});

export const ICON_STARLESS_GAUNTLETS = build(20, 20, starlessLegend, (r) => {
  r('d', 4, 6, 5, 10); // left gauntlet
  r('d', 11, 6, 5, 10); // right gauntlet
  r('D', 4, 12, 5, 2);
  r('D', 11, 12, 5, 2);
  r('g', 5, 8, 2, 2);
  r('g', 12, 8, 2, 2);
});

export const ICON_STARLESS_GREAVES = build(20, 20, starlessLegend, (r) => {
  r('d', 5, 4, 4, 12); // left greave
  r('d', 11, 4, 4, 12); // right greave
  r('D', 4, 14, 6, 3); // boots
  r('D', 10, 14, 6, 3);
  r('g', 6, 7, 2, 2);
  r('g', 12, 7, 2, 2);
});

export const ICON_STARLESS_BLADE = build(20, 20, starlessLegend, (r) => {
  r('g', 9, 2, 2, 11); // glowing blade
  r('d', 11, 3, 1, 9); // back
  r('t', 6, 13, 8, 2); // guard
  r('D', 9, 15, 2, 4); // grip
});

// --- HUD ---
const heartShape = (r: (ch: string, x: number, y: number, w: number, h: number) => void, c: string) => {
  r(c, 2, 3, 4, 2); // lobe tops
  r(c, 8, 3, 4, 2);
  r(c, 2, 4, 10, 4); // lobes + body
  r(c, 3, 8, 8, 1); // taper to point
  r(c, 4, 9, 6, 1);
  r(c, 5, 10, 4, 1);
  r(c, 6, 11, 2, 1);
};
export const HEART_FULL = build(14, 14, { r: palette.heartRed, w: palette.uiInk }, (r) => {
  heartShape(r, 'r');
  r('w', 4, 5, 2, 2); // shine
});
export const HEART_EMPTY = build(14, 14, { r: palette.heartEmpty }, (r) => {
  heartShape(r, 'r');
});

export const SLASH = build(30, 30, { s: palette.slash, L: palette.uiInk }, (r) => {
  // a crescent swoosh from upper-right to lower-left
  r('s', 21, 3, 5, 4);
  r('s', 17, 6, 5, 4);
  r('s', 13, 10, 5, 4);
  r('s', 10, 14, 5, 4);
  r('s', 7, 18, 5, 4);
  r('s', 5, 22, 4, 4);
  r('L', 22, 4, 2, 1); // leading glint
  r('L', 18, 7, 2, 1);
});
