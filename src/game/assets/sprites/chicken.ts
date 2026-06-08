import { palette } from '../../data/palette';
import type { PixelSprite } from './spriteGrid';

// A plump, round little hen: white body, red comb, big beady eyes, a tiny orange beak,
// folded wings, and stubby orange feet. 20x22 to match the original texture size.
//
// Legend: . transparent  b body  B soft shade  m comb  e eye  o beak  f feet
export const CHICKEN: PixelSprite = {
  width: 20,
  height: 22,
  outline: palette.outline,
  legend: {
    b: palette.chickenBody,
    B: palette.chickenShade,
    m: palette.chickenComb,
    e: palette.outline,
    o: palette.beak,
    f: palette.beak,
  },
  rows: [
    '.......m.m.m........', // 0  comb points
    '.......mmmmm........', // 1  comb base
    '......bbbbbbbb......', // 2  head
    '.....bbbbbbbbbb.....', // 3
    '.....bbebbbbebb.....', // 4  eyes
    '.....bbebbbbebb.....', // 5
    '....bbbbboobbbbb....', // 6  beak
    '....bbbbbbbbbbbb....', // 7  body
    '...bbbbbbbbbbbbbb...', // 8
    '...bbBbbbbbbbbBbb...', // 9  folded wings
    '...bbBbbbbbbbbBbb...', // 10
    '...bbbBbbbbbbBbbb...', // 11
    '....bbbbbbbbbbbb....', // 12
    '....bbbbbbbbbbbb....', // 13
    '.....bbbbbbbbbb.....', // 14
    '.....bBBBBBBBBb.....', // 15 belly shade
    '......bbbbbbbb......', // 16
    '........f..f........', // 17 legs
    '........f..f........', // 18
    '.......fff.fff......', // 19 toes
    '....................', // 20
    '....................', // 21
  ],
};
