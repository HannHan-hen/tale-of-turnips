import { palette } from '../../data/palette';
import type { PixelSprite } from './spriteGrid';

// The farmer — same identity as before (blonde tuft hair, cream shirt, blue denim
// overalls), redrawn as deliberate pixel art: a rounded silhouette, big shiny eyes,
// rosy cheeks, and soft 3-tone shading. 24x32 to match the original texture size.
//
// Legend:
//   .  transparent (a 1px outline is auto-added around the shape)
//   s/k/S  skin: base / shadow / light
//   h/g/H  hair: base / shadow / light
//   w/e    eye white / iris
//   r      cheek blush
//   c/v    shirt: base / shadow
//   d/b/D  denim: base / shadow / light
//   y      overall button (gold)
//   t/u    boot: base / sole
//   O      internal detail line (mouth)
export const FARMER: PixelSprite = {
  width: 24,
  height: 32,
  outline: palette.outline,
  legend: {
    s: palette.skin,
    k: palette.skinDark,
    S: palette.skinLight,
    h: palette.blonde,
    g: palette.blondeDark,
    H: palette.blondeLight,
    w: palette.eyeWhite,
    e: palette.eyeDark,
    r: palette.cheek,
    c: palette.farmerShirt,
    v: palette.farmerShirtDark,
    d: palette.denim,
    b: palette.denimDark,
    D: palette.denimLight,
    y: palette.overallButton,
    t: palette.shoe,
    u: palette.shoeDark,
    O: palette.outline,
  },
  rows: [
    '........................', // 0
    '.........hHHHHh.........', // 1  hair dome
    '........hHHHhhhh........', // 2
    '.......hHHhhhhhhh.......', // 3  hair + sheen
    '.......hhhhhhhhhh.......', // 4  cap
    '.......hhsssssshh.......', // 5  bowl-cut fringe + sidelocks
    '.......swwwsswwws.......', // 6  eye whites
    '.......swewsswews.......', // 7  pupils
    '.......srssssssrs.......', // 8  rosy cheeks
    '........ssOssOss........', // 9  smile (jaw narrows)
    '.........ssOOss.........', // 10 smile base + chin
    '..........kssk..........', // 11 neck
    '......cccccssccccc......', // 12 collar + shoulders
    '......ccddccccddcc......', // 13 overall straps
    '.....cccddddddddccc.....', // 14 chest + bib top
    '.....cccyDdddddyccc.....', // 15 buttons + bib sheen
    '.....ssddddddddddss.....', // 16 hands + bib
    '.....kkddddddddddkk.....', // 17 hands shade
    '......dddbbbbbbddd......', // 18 bib pocket
    '......Dddddddddddb......', // 19 waist
    '......bbbbbbbbbbbb......', // 20 waistband
    '.......dddd..dddd.......', // 21 legs
    '.......dddb..bddd.......', // 22
    '.......Dddb..bddD.......', // 23 leg sheen
    '.......dddb..bddd.......', // 24
    '.......dddb..bddd.......', // 25
    '.......bbbb..bbbb.......', // 26 cuffs
    '.......tttt..tttt.......', // 27 boots
    '......ttttu..utttt......', // 28 boot toes
    '......ttttu..utttt......', // 29
    '......uuuuu..uuuuu......', // 30 soles
    '........................', // 31
  ],
};
