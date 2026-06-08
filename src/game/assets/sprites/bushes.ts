import { palette } from '../../data/palette';
import type { PixelSprite } from './spriteGrid';

// Foraging bushes: a rounded leafy shrub, shaded light on top and dark underneath. The full
// version carries ripe berries; the empty one is the same shrub picked clean. 30x26.
//
// Legend: l/L/H leaf base/shadow/highlight   o berry
const bushLegend = {
  l: palette.leaf,
  L: palette.leafDark,
  H: palette.leafLight,
  o: palette.berry,
};

// The leafy body, shared by both states (full overlays berries on top of this shape).
const EMPTY_ROWS = [
  '..............................', // 0
  '..........HHHHHHHHHH..........', // 1
  '........HHHHHHHHHHHHHH........', // 2
  '......HHHHHHHHHHHHHHHHHH......', // 3
  '.....llllllllllllllllllll.....', // 4
  '....llllllllllllllllllllll....', // 5
  '...llllllllllllllllllllllll...', // 6
  '..llllllllllllllllllllllllll..', // 7
  '..llllllllllllllllllllllllll..', // 8
  '..llllllllllllllllllllllllll..', // 9
  '..llllllllllllllllllllllllll..', // 10
  '..llllllllllllllllllllllllll..', // 11
  '..llllllllllllllllllllllllll..', // 12
  '..llllllllllllllllllllllllll..', // 13
  '..llllllllllllllllllllllllll..', // 14
  '..llllllllllllllllllllllllll..', // 15
  '..llllllllllllllllllllllllll..', // 16
  '..llllllllllllllllllllllllll..', // 17
  '..llllllllllllllllllllllllll..', // 18
  '...llllllllllllllllllllllll...', // 19
  '....LLllllllllllllllllllLL....', // 20
  '.....LLLLllllllllllllLLLL.....', // 21
  '......LLLLLLLLLLLLLLLLLL......', // 22
  '........LLLLLLLLLLLLLL........', // 23
  '..........LLLLLLLLLL..........', // 24
  '..............................', // 25
];

// Overlay 2x2 berries onto leaf cells only, so row lengths stay valid by construction.
function withBerries(rows: string[], berries: Array<[number, number]>): string[] {
  const grid = rows.map((r) => r.split(''));
  for (const [y, x] of berries) {
    for (const dy of [0, 1]) {
      for (const dx of [0, 1]) {
        if (grid[y + dy]?.[x + dx] === 'l') grid[y + dy][x + dx] = 'o';
      }
    }
  }
  return grid.map((r) => r.join(''));
}

export const BUSH_EMPTY: PixelSprite = {
  width: 30,
  height: 26,
  outline: palette.outline,
  legend: bushLegend,
  rows: EMPTY_ROWS,
};

export const BUSH_FULL: PixelSprite = {
  width: 30,
  height: 26,
  outline: palette.outline,
  legend: bushLegend,
  rows: withBerries(EMPTY_ROWS, [
    [6, 7],
    [7, 19],
    [9, 23],
    [10, 11],
    [13, 16],
    [14, 6],
    [15, 21],
  ]),
};
