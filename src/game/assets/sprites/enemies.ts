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

// A stout stone guardian, generated so it stays symmetric at any size. A blocky helmeted
// body with two arms, two legs, glowing eyes, and a pulsing core gem in the chest. Used for
// the two dungeon mini bosses (the Warden and the larger Colossus).
function makeGolem(spec: {
  W: number;
  H: number;
  head: [number, number, number, number]; // x0,y0,x1,y1
  body: [number, number, number, number];
  arm: [number, number, number]; // inset, y0, y1 — mirrored on both sides
  leg: [number, number]; // y0, y1 (legs sit under the body, mirrored about center)
  eyeY: [number, number]; // y0, y1
  core: [number, number, number, number];
}): string[] {
  const { W, H } = spec;
  const g: string[][] = Array.from({ length: H }, () => Array<string>(W).fill('.'));
  const fill = (x0: number, y0: number, x1: number, y1: number, ch: string): void => {
    for (let y = Math.max(0, y0); y <= Math.min(H - 1, y1); y++) {
      for (let x = Math.max(0, x0); x <= Math.min(W - 1, x1); x++) g[y][x] = ch;
    }
  };

  const [hx0, hy0, hx1, hy1] = spec.head;
  const [bx0, by0, bx1, by1] = spec.body;
  // Arms hang off the body sides; legs split the body's lower edge into two stumps.
  fill(0, spec.arm[1], spec.arm[0], spec.arm[2], 's');
  fill(W - 1 - spec.arm[0], spec.arm[1], W - 1, spec.arm[2], 's');
  fill(hx0, hy0, hx1, hy1, 's'); // head
  fill(bx0, by0, bx1, by1, 's'); // body
  const legW = Math.floor((bx1 - bx0 - 2) / 3);
  fill(bx0 + 1, spec.leg[0], bx0 + 1 + legW, spec.leg[1], 's');
  fill(bx1 - 1 - legW, spec.leg[0], bx1 - 1, spec.leg[1], 's');

  // Shading: a lit top-left edge and a darker bottom.
  fill(hx0, hy0, hx1, hy0, 'H');
  fill(hx0, hy0, hx0, hy1, 'H');
  fill(bx0, by1, bx1, by1, 'S');
  fill(bx0, spec.leg[1], bx1, spec.leg[1], 'S');

  // Glowing eyes, set symmetrically on the head.
  const eyeIn = Math.round((hx1 - hx0) * 0.28);
  fill(hx0 + eyeIn, spec.eyeY[0], hx0 + eyeIn + 1, spec.eyeY[1], 'g');
  fill(hx1 - eyeIn - 1, spec.eyeY[0], hx1 - eyeIn, spec.eyeY[1], 'g');

  // Core gem in the chest.
  fill(spec.core[0], spec.core[1], spec.core[2], spec.core[3], 'c');

  return g.map((r) => r.join(''));
}

const GOLEM_LEGEND = {
  s: palette.stone,
  S: palette.stoneDark,
  H: palette.stoneLight,
  g: palette.glow,
  c: palette.bossCore,
};

// Ruin Warden — first dungeon boss. A compact armored golem. 24x24.
export const RUIN_WARDEN: PixelSprite = {
  width: 24,
  height: 24,
  outline: palette.outline,
  legend: GOLEM_LEGEND,
  rows: makeGolem({
    W: 24,
    H: 24,
    head: [7, 2, 16, 8],
    body: [5, 9, 18, 18],
    arm: [4, 10, 16],
    leg: [19, 23],
    eyeY: [5, 6],
    core: [10, 12, 13, 15],
  }),
};

// Ruin Colossus — second dungeon boss. A bigger, broader, meaner golem. 34x32.
export const RUIN_COLOSSUS: PixelSprite = {
  width: 34,
  height: 32,
  outline: palette.outline,
  legend: { ...GOLEM_LEGEND, c: palette.bossGlow },
  rows: makeGolem({
    W: 34,
    H: 32,
    head: [11, 2, 22, 9],
    body: [7, 10, 26, 22],
    arm: [6, 11, 21],
    leg: [23, 31],
    eyeY: [6, 7],
    core: [14, 14, 19, 18],
  }),
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
