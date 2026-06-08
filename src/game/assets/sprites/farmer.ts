import { palette } from '../../data/palette';
import type { PixelSprite } from './spriteGrid';

// The farmer — a pretty blonde girl in cute beige overalls — drawn for four-way movement:
// facing down (front), up (back), and to the side (right; the scene flips it for left). Each
// direction has a standing pose plus two walk frames. The whole cast shares one 24x32 size.
//
// The head/torso differs per direction (rows 0-20); all directions share the same animated
// legs (rows 21-31): LEGS_STAND, then LEGS_STEP_A / LEGS_STEP_B lift alternate feet.
//
// Legend:
//   .  transparent (a 1px outline is auto-added around the shape)
//   s/k/S  skin: base / shadow / light          h/g/H  hair: base / shadow / light
//   w/e    eye white / iris                      r      cheek blush
//   c/v    shirt: base / shadow                  d/b/D  beige overalls: base / shadow / light
//   y      overall button (gold)                 t/u    boot: base / sole
//   O      internal detail line (mouth)
const legend = {
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
};

// --- front (down): face, lashless big eyes, beige bib overalls ---
const DOWN_TOP = [
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
  '.....hgcyDddddDycgh.....', // 14 buttons + bib
  '.....hgsddddddddsgh.....', // 15 hands
  '.....hgkddddddddkgh.....', // 16
  '.....hgddbbbbbbddgh.....', // 17 bib pocket
  '......gddddddddddg......', // 18 hair tips + lower bib
  '......Dddddddddddb......', // 19 waist
  '......bbbbbbbbbbbb......', // 20 waistband
];

// --- back (up): the back of her head, long hair flowing down, plain overall back ---
const UP_TOP = [
  '........................', // 0
  '........hhHHHHhh........', // 1
  '......hHHHhhhhhhhh......', // 2
  '.....hHHhhhhhhhhhhh.....', // 3
  '....hhhhhhhhhhhhhhhh....', // 4
  '....hhhhhhhhhhhhhhhh....', // 5
  '....HhghhghhhhghhghH....', // 6  back of head + hair strands
  '....HhghhghhhhghhghH....', // 7
  '....HhghhghhhhghhghH....', // 8
  '....HhghhghhhhghhghH....', // 9
  '....HhghhghhhhghhghH....', // 10
  '....HhghhghhhhghhghH....', // 11 hair down the back
  '....HhghhghhhhghhghH....', // 12
  '....HhghhghhhhghhghH....', // 13
  '.....hghhghhhhghhgh.....', // 14 hair narrows
  '.....hgddddddddddgh.....', // 15 overall back below the hair
  '.....hgsddddddddsgh.....', // 16 hands
  '.....hgkddddddddkgh.....', // 17
  '......gddddddddddg......', // 18 hair tips
  '......Dddddddddddb......', // 19
  '......bbbbbbbbbbbb......', // 20
];

// --- side (facing right): profile face, hair swept down the back, near arm forward ---
const SIDE_TOP = [
  '........................', // 0
  '.......hhhhhh...........', // 1  hair crown (back-weighted)
  '......hhhhhhhh..........', // 2
  '.....hhhhhhhhhh.........', // 3
  '.....hhhhhhhhhSs........', // 4  hair + forehead
  '.....hhhhhhhssss........', // 5  bangs + forehead
  '.....hhhhhhsswess.......', // 6  eye + nose
  '.....hhhhhhssssss.......', // 7  nose tip
  '.....hhhhhhsrssss.......', // 8  cheek
  '.....hhhhhhsssOs........', // 9  mouth
  '.....hghhhsssss.........', // 10 chin + hair back
  '.....hghhhkss...........', // 11 neck + hair back
  '.....hghcccccccc........', // 12 shoulder + hair tail
  '.....hggdddddddd........', // 13 overall bib
  '.....hggddddddds........', // 14 bib + forward hand
  '.....hggdddddddk........', // 15 hand shadow
  '......gddddddddd........', // 16 hair tail tip
  '......dddddddddd........', // 17 overalls
  '......gddddddddddg......', // 18 widen toward the legs
  '......Dddddddddddb......', // 19 waist
  '......bbbbbbbbbbbb......', // 20 waistband
];

// --- shared animated legs (rows 21-31) ---
const LEGS_STAND = [
  '.......dddd..dddd.......', // 21
  '.......dddb..bddd.......', // 22
  '.......Dddb..bddD.......', // 23
  '.......dddb..bddd.......', // 24
  '.......dddb..bddd.......', // 25
  '.......bbbb..bbbb.......', // 26
  '.......tttt..tttt.......', // 27
  '......ttttu..utttt......', // 28
  '......ttttu..utttt......', // 29
  '......uuuuu..uuuuu......', // 30
  '........................', // 31
];

// Step A — right foot lifted (planted left foot reaches the floor).
const LEGS_STEP_A = [
  '.......dddd..dddd.......', // 21
  '.......dddb..bddd.......', // 22
  '.......Dddb..bddD.......', // 23
  '.......dddb..bbbb.......', // 24
  '.......dddb..tttt.......', // 25
  '.......bbbb.utttt.......', // 26
  '.......tttt.utttt.......', // 27
  '......ttttu.uuuuu.......', // 28
  '......ttttu.............', // 29
  '......uuuuu.............', // 30
  '........................', // 31
];

// Step B — left foot lifted (mirror of A).
const LEGS_STEP_B = [
  '.......dddd..dddd.......', // 21
  '.......dddb..bddd.......', // 22
  '.......Dddb..bddD.......', // 23
  '.......bbbb..bddd.......', // 24
  '.......tttt..bddd.......', // 25
  '......ttttu..bbbb.......', // 26
  '......ttttu..tttt.......', // 27
  '......uuuuu.utttt.......', // 28
  '............utttt.......', // 29
  '............uuuuu.......', // 30
  '........................', // 31
];

function frame(top: string[], legs: string[]): PixelSprite {
  return { width: 24, height: 32, outline: palette.outline, legend, rows: [...top, ...legs] };
}

export const FARMER_DOWN = frame(DOWN_TOP, LEGS_STAND);
export const FARMER_DOWN_WALK_A = frame(DOWN_TOP, LEGS_STEP_A);
export const FARMER_DOWN_WALK_B = frame(DOWN_TOP, LEGS_STEP_B);

export const FARMER_UP = frame(UP_TOP, LEGS_STAND);
export const FARMER_UP_WALK_A = frame(UP_TOP, LEGS_STEP_A);
export const FARMER_UP_WALK_B = frame(UP_TOP, LEGS_STEP_B);

export const FARMER_SIDE = frame(SIDE_TOP, LEGS_STAND);
export const FARMER_SIDE_WALK_A = frame(SIDE_TOP, LEGS_STEP_A);
export const FARMER_SIDE_WALK_B = frame(SIDE_TOP, LEGS_STEP_B);
