import { palette } from '../../data/palette';
import type { PixelSprite } from './spriteGrid';

// The farmer — a pretty blonde girl in cute beige overalls. Long hair frames the face and
// falls past the shoulders; big lashed eyes, rosy cheeks, a soft smile. 24x32 to match the
// original texture size. Drawn as deliberate pixel art with a rounded silhouette and soft
// 3-tone shading on the hair, overalls, and skin.
//
// Legend:
//   .  transparent (a 1px outline is auto-added around the shape)
//   s/k/S  skin: base / shadow / light
//   h/g/H  hair: base / shadow / light
//   w/e    eye white / iris+lash
//   r      cheek blush
//   c/v    shirt: base / shadow
//   d/b/D  beige overalls: base / shadow / light
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
    d: palette.beige,
    b: palette.beigeDark,
    D: palette.beigeLight,
    y: palette.overallButton,
    t: palette.shoe,
    u: palette.shoeDark,
    O: palette.outline,
  },
  rows: [
    '........................', // 0
    '........hhHHHHhh........', // 1  hair crown
    '......hHHHhhhhhhhh......', // 2
    '.....hHHhhhhhhhhhhh.....', // 3
    '....hhhhhhhhhhhhhhhh....', // 4  full hair
    '....hhhhhhhhhhhhhhhh....', // 5  bangs
    '....HhgswwwsswwwsghH....', // 6  side hair + big eyes
    '....HhgswewsswewsghH....', // 7  pupils
    '....HhgsrssssssrsghH....', // 8  rosy cheeks
    '....HhgsssOssOsssghH....', // 9  smile
    '....HhgssssOOssssghH....', // 10 smile base + chin
    '....HhgcccsssscccghH....', // 11 collar + hair on shoulders
    '....HhgcddccccddcghH....', // 12 overall straps
    '....HhgcddddddddcghH....', // 13 bib top
    '.....hgcyDddddDycgh.....', // 14 buttons + bib (hair tapers)
    '.....hgsddddddddsgh.....', // 15 hands + bib
    '.....hgkddddddddkgh.....', // 16 hands shade
    '.....hgddbbbbbbddgh.....', // 17 bib pocket
    '......gddddddddddg......', // 18 hair tips + lower bib
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
