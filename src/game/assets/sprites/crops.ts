import { palette } from '../../data/palette';
import type { PixelSprite } from './spriteGrid';

// Crop growth as hand-authored pixel art. The three early stages (mound, sprout, leafy) are
// shared by every crop; each crop then has its own ripe look. TextureFactory paints these
// bottom-centered into a tile-sized texture so the plant sits on the soil.
//
// Shared plant legend: l/L/H leaf base/shadow/highlight   o soil mound
const leafLegend = {
  l: palette.leaf,
  L: palette.leafDark,
  H: palette.leafLight,
  o: palette.soilDark,
};

// Stage 0 — a freshly tilled mound with a seed-leaf tip. No outline (it is soil on soil).
export const CROP_MOUND: PixelSprite = {
  width: 12,
  height: 5,
  legend: leafLegend,
  rows: [
    '.....ll.....',
    '...oooooo...',
    '..oooooooo..',
    '.oooooooooo.',
    '.oooooooooo.',
  ],
};

// Stage 1 — a two-leaf sprout.
export const CROP_SPROUT: PixelSprite = {
  width: 10,
  height: 8,
  outline: palette.outline,
  legend: leafLegend,
  rows: [
    '..HH..HH..',
    '..ll..ll..',
    '..lL..Ll..',
    '...l..l...',
    '...LllL...',
    '....ll....',
    '....lL....',
    '....lL....',
  ],
};

// Stage 2 — a fuller leafy clump, not yet ripe.
export const CROP_LEAFY: PixelSprite = {
  width: 14,
  height: 12,
  outline: palette.outline,
  legend: leafLegend,
  rows: [
    '....ll..ll....',
    '...lHHllHHl...',
    '..llllllllll..',
    '..lLllllllLl..',
    '.llllllllllll.',
    '.lLllllllllLl.',
    '.lLLllllllLLl.',
    '..lLLllllLLl..',
    '...lLLllLLl...',
    '....lLLLLl....',
    '......ll......',
    '......lL......',
  ],
};

// Stage 3 — ripe turnip: leafy top over a cream bulb with a pink-purple crown.
export const TURNIP: PixelSprite = {
  width: 16,
  height: 20,
  outline: palette.outline,
  legend: {
    ...leafLegend,
    b: palette.bulb,
    B: palette.bulbDark,
    p: palette.bulbTop,
  },
  rows: [
    '.....ll..ll.....',
    '....lHllllHl....',
    '....llllllll....',
    '...llLllllLll...',
    '....lLLllLLl....',
    '.....lLllLl.....',
    '......lLLl......',
    '.....pppppp.....',
    '...pppppppppp...',
    '..pppppppppppp..',
    '..bbbbbbbbbbbb..',
    '.bbbbbbbbbbbbbb.',
    '.bBbbbbbbbbbbBb.',
    '.bbbbbbbbbbbbbb.',
    '..bbbbbbbbbbbb..',
    '..bBbbbbbbbbBb..',
    '...bbbbbbbbbb...',
    '....bbbbbbbb....',
    '.....bbbbbb.....',
    '......bBBb......',
  ],
};

// Stage 3 — ripe carrot: feathery greens over a ridged orange root.
export const CARROT: PixelSprite = {
  width: 14,
  height: 20,
  outline: palette.outline,
  legend: {
    ...leafLegend,
    c: palette.carrot,
    C: palette.carrotDark,
  },
  rows: [
    '.....lHHl.....',
    '....llllll....',
    '...lLllllLl...',
    '...llLllLll...',
    '....lLllLl....',
    '.....lLLl.....',
    '.....lLLl.....',
    '....cccccc....',
    '...cccccccc...',
    '...cccccccc...',
    '...cccccccc...',
    '...cCCCCCCc...',
    '....cccccc....',
    '....cccccc....',
    '....cCCCCc....',
    '.....cccc.....',
    '.....cccc.....',
    '......cc......',
    '......cc......',
    '......Cc......',
  ],
};

// Stage 3 — ripe pumpkin: a round ribbed gourd with a stem and a leaf.
export const PUMPKIN: PixelSprite = {
  width: 18,
  height: 16,
  outline: palette.outline,
  legend: {
    ...leafLegend,
    k: palette.pumpkin,
    K: palette.pumpkinDark,
    R: palette.pumpkinRib,
  },
  rows: [
    '........LL........',
    '........LLl.......',
    '....kkkkkkkkkk....',
    '..kkKkkkkkkkkKkk..',
    '.kkkKkkkRRkkkKkkk.',
    '.kkkKkkkRRkkkKkkk.',
    '.kkkKkkkRRkkkKkkk.',
    '.kkkKkkkRRkkkKkkk.',
    '.kkkKkkkRRkkkKkkk.',
    '.kkkKkkkRRkkkKkkk.',
    '.kkkKkkkRRkkkKkkk.',
    '.kkkKkkkRRkkkKkkk.',
    '..kkKkkkkkkkkKkk..',
    '...kkkkkkkkkkkk...',
    '....kkkkkkkkkk....',
    '......kkkkkk......',
  ],
};
