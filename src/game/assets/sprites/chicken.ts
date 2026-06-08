import { palette } from '../../data/palette';
import type { PixelSprite } from './spriteGrid';

// A plump, round little chick in the cozy moonlit style: an egg-shaped white body, big
// beady oval eyes with a sparkle, rosy cheeks, a tiny orange beak, a messy orange-red comb
// tuft, a soft folded wing with cool blue-white shading, and stubby red feet. 22x22.
//
// Legend: . transparent  b body  B cool wing/belly shade  m comb red  n comb gold
//         e eye  h eye sparkle  o beak  c cheek  x wing crease  f feet
export const CHICKEN: PixelSprite = {
  width: 22,
  height: 22,
  outline: palette.outline,
  legend: {
    b: palette.chickenBody,
    B: palette.chickenWing,
    m: palette.chickenComb,
    n: palette.beak,
    e: palette.outline,
    h: palette.eyeWhite,
    o: palette.beak,
    c: palette.chickenCheek,
    x: palette.outline,
    f: palette.chickenComb,
  },
  rows: [
    '........nmnmn.........', // 0  messy comb tips
    '........nmmmn.........', // 1  comb base
    '........bbbbbb........', // 2  head top
    '.......bbbbbbbb.......', // 3
    '......bbbbbbbbbb......', // 4
    '.....bbbbbbbbbbbb.....', // 5
    '....bbbbbbbbbbbbbb....', // 6
    '....bbbhebbbbhebbb....', // 7  eyes (with sparkle)
    '....bbbeebbbbeebbb....', // 8
    '...bbbbeebbbbeebbbb...', // 9
    '...bbbceeboobeecbbb...', // 10 cheeks + beak
    '...bbbccbboobbccbbb...', // 11
    '...bbbbbbbbbbxBBBBB...', // 12 folded wing on the side
    '...bbbbbbbbbxBBBBBB...', // 13
    '....bbbbbbbbxBBBBB....', // 14
    '....bbbbbbbbbxBBBb....', // 15 wing tapers to a tail
    '.....bbbbbbbBBBBb.....', // 16
    '......bbBBBBBBbb......', // 17 soft under-shadow
    '.......bBBBBBBb.......', // 18
    '........bBBBBb........', // 19
    '.........f..f.........', // 20 legs
    '........ff..ff........', // 21 feet
  ],
};
