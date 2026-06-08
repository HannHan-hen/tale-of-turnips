import { palette } from '../../data/palette';
import type { PixelSprite } from './spriteGrid';

// The ruin creatures. The three small foes are hand-authored grids; the boss is a large
// symmetric crystal generated in code (cleaner than hand-counting a 44x44 gem).
//
// Eyes use w (white) + e (dark pupil); glow is the creature's lit accent.

// Ruin Mite — a round mossy blob with big eyes and little feet. 20x18.
export const RUIN_MITE: PixelSprite = {
  width: 20,
  height: 18,
  outline: palette.outline,
  legend: {
    m: palette.mite,
    M: palette.miteDark,
    H: palette.miteLight,
    w: palette.uiInk,
    e: palette.outline,
  },
  rows: [
    '....................',
    '......mmmmmmmm......',
    '....mmmmmmmmmmmm....',
    '...mmmmmmmmmmmmmm...',
    '..mmmmmmmmmmmmmmmm..',
    '..mHmmmmmmmmmmmmMm..',
    '..mmmwwwmmmmwwwmmm..',
    '..mmmwewmmmmwewmmm..',
    '..mmmmmmmmmmmmmmmm..',
    '..mMmmmmmmmmmmmmMm..',
    '..mmmmmmmmmmmmmmmm..',
    '...mmmmmmmmmmmmmm...',
    '...mMmmmmmmmmmmMm...',
    '....mmmmmmmmmmmm....',
    '....mMMMMMMMMMMm....',
    '.....mmmmmmmmmm.....',
    '.....MM......MM.....',
    '....................',
  ],
};

// Shade Pup — a dark four-legged critter with glowing eyes and pointy ears. 24x20.
export const SHADE_PUP: PixelSprite = {
  width: 24,
  height: 20,
  outline: palette.outline,
  legend: {
    s: palette.shade,
    S: palette.shadeDark,
    H: palette.shadeLight,
    g: palette.glow,
  },
  rows: [
    '........................',
    '.......SS......SS.......',
    '......ssssssssssss......',
    '...sHHsssssssssssssss...',
    '..ssssssssssssssssssss..',
    '..sssssggssssssggsssss..',
    '..sssssggssssssggsssss..',
    '..ssssssssssssssssssss..',
    '..ssssssssssssssssssss..',
    '..ssssssssssssssssssss..',
    '...ssssssssssssssssss...',
    '...ssssssssssssssssss...',
    '....ssssssssssssssss....',
    '.....ssssssssssssss.....',
    '.....SSSSSSSSSSSSSS.....',
    '......SS.SS..SS.SS......',
    '......SS.SS..SS.SS......',
    '........................',
    '........................',
    '........................',
  ],
};

// Crop Nibbler — a round pink pest with big ears and buck teeth. 18x16.
export const CROP_NIBBLER: PixelSprite = {
  width: 18,
  height: 16,
  outline: palette.outline,
  legend: {
    n: palette.nibbler,
    N: palette.nibblerDark,
    w: palette.uiInk,
    e: palette.outline,
  },
  rows: [
    '..................',
    '...nn........nn...',
    '...nnn......nnn...',
    '..nnnnnnnnnnnnnn..',
    '.nnnnnnnnnnnnnnnn.',
    '.nnnwwwnnnnwwwnnn.',
    '.nnnwewnnnnwewnnn.',
    '.nnnnnnnnnnnnnnnn.',
    '.nnnnnnnnnnnnnnnn.',
    '..nnnnnwwwwnnnnn..',
    '...nnnnwwwwnnnn...',
    '....nnnnnnnnnn....',
    '....nNNNNNNNNn....',
    '.....NN....NN.....',
    '..................',
    '..................',
  ],
};

// Ruin Heart — the boss: a looming faceted crystal with a pulsing core and glowing eyes.
// Generated so the 44x44 gem stays perfectly symmetric.
function makeRuinHeart(): string[] {
  const W = 44;
  const H = 44;
  const cx = (W - 1) / 2; // 21.5
  const g: string[][] = Array.from({ length: H }, () => Array<string>(W).fill('.'));

  // Outer crystal: a tall diamond, widest at row 22.
  const top = 2;
  const widest = 22;
  const bottom = 42;
  const maxHalf = 18;
  const half = (y: number): number => {
    if (y < top || y > bottom) return -1;
    return y <= widest
      ? (maxHalf * (y - top)) / (widest - top)
      : (maxHalf * (bottom - y)) / (bottom - widest);
  };
  for (let y = 0; y < H; y++) {
    const hw = half(y);
    if (hw < 0) continue;
    const x0 = Math.ceil(cx - hw);
    const x1 = Math.floor(cx + hw);
    for (let x = x0; x <= x1; x++) {
      let ch = 'b';
      if (y > widest) ch = 'B'; // lower half in shadow
      if (x === 21 || x === 22) ch = 'B'; // center facet seam
      if (y <= widest && x <= x0 + 1) ch = 'H'; // lit upper-left edge
      g[y][x] = ch;
    }
  }

  // Inner glowing core (a small diamond), brightest at its center.
  const cTop = 14;
  const cWide = 22;
  const cBottom = 30;
  const cMaxHalf = 7;
  for (let y = cTop; y <= cBottom; y++) {
    const hw =
      y <= cWide ? (cMaxHalf * (y - cTop)) / (cWide - cTop) : (cMaxHalf * (cBottom - y)) / (cBottom - cWide);
    const x0 = Math.ceil(cx - hw);
    const x1 = Math.floor(cx + hw);
    for (let x = x0; x <= x1; x++) g[y][x] = x >= 19 && x <= 24 && y >= 19 && y <= 24 ? 'C' : 'c';
  }

  // Two glowing eyes on the upper crystal.
  for (const ex of [14, 27]) {
    for (let y = 11; y <= 13; y++) {
      for (let x = ex; x <= ex + 2; x++) {
        if (g[y][x] === 'b' || g[y][x] === 'H') g[y][x] = 'C';
      }
    }
  }

  return g.map((r) => r.join(''));
}

export const RUIN_HEART: PixelSprite = {
  width: 44,
  height: 44,
  outline: palette.outline,
  legend: {
    b: palette.boss,
    B: palette.bossDark,
    H: palette.bossLight,
    c: palette.bossCore,
    C: palette.bossGlow,
  },
  rows: makeRuinHeart(),
};
