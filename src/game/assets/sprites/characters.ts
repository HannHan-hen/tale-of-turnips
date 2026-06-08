import { palette } from '../../data/palette';
import type { PixelSprite } from './spriteGrid';

// The villager cast as hand-authored pixel grids (24x32, matching the farmer). Each shares
// the same body/leg/boot structure for a coherent cast, and varies hair, face, and outfit.
// Colors come from a per-character ramp via charLegend(), so a designer can re-skin a
// villager by editing only the colors below.
//
// Shared legend (same char meaning across every character):
//   .  transparent (1px outline auto-added)
//   s/k/S skin: base/shadow/light    h/g/H hair: base/shadow/light
//   w/e   eye white / iris (+ blacksmith's mustache uses g)
//   r     cheek blush                c/v   shirt: base/shadow
//   d/b/D legs (pants): base/shadow/light
//   a/A   apron: base/shadow         y     button (gold)
//   t/u   boot: base/sole            O     internal detail (mouth)
interface CharColors {
  hair: number;
  hairDark: number;
  hairLight: number;
  shirt: number;
  shirtDark: number;
  bottom: number;
  bottomDark: number;
  bottomLight: number;
  eye?: number;
  apron?: number;
  apronDark?: number;
  boot?: number;
  bootDark?: number;
}

function charLegend(c: CharColors): Record<string, number> {
  return {
    s: palette.skin,
    k: palette.skinDark,
    S: palette.skinLight,
    h: c.hair,
    g: c.hairDark,
    H: c.hairLight,
    w: palette.eyeWhite,
    e: c.eye ?? palette.eyeDark,
    r: palette.cheek,
    c: c.shirt,
    v: c.shirtDark,
    d: c.bottom,
    b: c.bottomDark,
    D: c.bottomLight,
    a: c.apron ?? c.shirt,
    A: c.apronDark ?? c.shirtDark,
    y: palette.overallButton,
    t: c.boot ?? palette.shoe,
    u: c.bootDark ?? palette.shoeDark,
    O: palette.outline,
  };
}

// Shared lower body (rows 21-31): two legs and boots. Colors resolve per character.
const LEGS_AND_BOOTS = [
  '.......dddd..dddd.......', // 21 legs
  '.......dddb..bddd.......', // 22
  '.......Dddb..bddD.......', // 23 sheen
  '.......dddb..bddd.......', // 24
  '.......dddb..bddd.......', // 25
  '.......bbbb..bbbb.......', // 26 cuffs
  '.......tttt..tttt.......', // 27 boots
  '......ttttu..utttt......', // 28 toes
  '......ttttu..utttt......', // 29
  '......uuuuu..uuuuu......', // 30 soles
  '........................', // 31
];

// Jay — the cute village boy: tidy black hair with a soft fringe, gray eyes, a shy blush,
// a clean white shirt and black trousers.
export const JAY: PixelSprite = {
  width: 24,
  height: 32,
  outline: palette.outline,
  legend: charLegend({
    hair: palette.jayBlackHair,
    hairDark: palette.jayBlackHairDark,
    hairLight: palette.jayBlackHairLight,
    eye: palette.eyeGray,
    shirt: palette.jayWhite,
    shirtDark: palette.jayWhiteDark,
    bottom: palette.jayBlackPants,
    bottomDark: palette.jayBlackPantsDark,
    bottomLight: palette.jayBlackPantsLight,
  }),
  rows: [
    '........................', // 0
    '........hhhhhhhh........', // 1  hair (centered on face)
    '.......hhHhhhhhhh.......', // 2  sheen streak
    '.......hHhhhhhhgh.......', // 3
    '.......hhhhhhhhhh.......', // 4  hairline
    '.......hhhhhhsshh.......', // 5  side-swept fringe
    '.......swwwsswwws.......', // 6  big gray eyes
    '.......swewsswews.......', // 7  pupils
    '.......srssssssrs.......', // 8  shy blush
    '.......sssOssOsss.......', // 9  smile
    '.......ssssOOssss.......', // 10
    '..........kssk..........', // 11 neck
    '......cccccssccccc......', // 12 collar
    '......cccccvvccccc......', // 13 shirt
    '.....ccccccvvcccccc.....', // 14
    '.....ssccccccccccss.....', // 15 hands
    '.....kkcccccccccckk.....', // 16
    '......cccccccccccc......', // 17 shirt hem
    '......dddddddddddd......', // 18 trousers
    '......Dddddddddddb......', // 19
    '......bbbbbbbbbbbb......', // 20
    ...LEGS_AND_BOOTS,
  ],
};

// Seed seller — friendly gardener: medium brown hair framing the face, a green apron over
// a tan shirt.
export const SEED_SELLER: PixelSprite = {
  width: 24,
  height: 32,
  outline: palette.outline,
  legend: charLegend({
    hair: palette.hairBrown,
    hairDark: palette.hairBrownDark,
    hairLight: palette.hairBrownLight,
    shirt: palette.wood,
    shirtDark: palette.woodDark,
    bottom: palette.shoe,
    bottomDark: palette.shoeDark,
    bottomLight: palette.shoeLight,
    apron: palette.apronGreen,
    apronDark: palette.leafDark,
  }),
  rows: [
    '........................', // 0
    '........hhHHHHhh........', // 1  crown
    '......hHHHhhhhhhhh......', // 2
    '.....hHHhhhhhhhhhhh.....', // 3
    '....hhhhhhhhhhhhhhhh....', // 4
    '....hhhhhhhhhhhhhhhh....', // 5  bangs
    '....HhgswwwsswwwsghH....', // 6  side hair + eyes
    '....HhgswewsswewsghH....', // 7
    '....HhgsrssssssrsghH....', // 8  cheeks
    '....HhgsssOssOsssghH....', // 9  smile
    '....HhgssssOOssssghH....', // 10
    '....HhgcccsssscccghH....', // 11 collar + hair on shoulders
    '....HhgccccccccccghH....', // 12 shoulders
    '.....hgcaaaaaaaacgh.....', // 13 apron bib (hair tapers)
    '......gaaaaaaaaaag......', // 14 hair tips
    '......saaaaaaaaaas......', // 15 hands + apron
    '......aaaAAAAAAaaa......', // 16 apron pocket
    '......AAAAAAAAAAAA......', // 17 apron hem
    '......dddddddddddd......', // 18 skirt
    '......Dddddddddddb......', // 19
    '......bbbbbbbbbbbb......', // 20
    ...LEGS_AND_BOOTS,
  ],
};

// Blacksmith — kindly and burly: short gray hair, a big friendly mustache, a leather apron
// over a sturdy gray shirt.
export const BLACKSMITH: PixelSprite = {
  width: 24,
  height: 32,
  outline: palette.outline,
  legend: charLegend({
    hair: palette.hairGray,
    hairDark: palette.hairGrayDark,
    hairLight: palette.hairGrayLight,
    shirt: palette.blacksmithShirt,
    shirtDark: palette.blacksmithShirtDark,
    bottom: palette.stoneDark,
    bottomDark: palette.outline,
    bottomLight: palette.stone,
    apron: palette.leatherApron,
    apronDark: palette.leatherApronDark,
  }),
  rows: [
    '........................', // 0
    '.......hhhhhhhh.........', // 1  hair
    '......hhhhhhhhhh........', // 2
    '......hHhhhhhhhg........', // 3
    '......hhhhhhhhhh........', // 4
    '.......hhhhhhhh.........', // 5
    '.......hwwwsswwwh.......', // 6  eyes
    '.......hwewsswewh.......', // 7
    '.......srssssssrs.......', // 8
    '.......ssggggggss.......', // 9  mustache
    '.......ssssOOssss.......', // 10 mouth
    '..........kssk..........', // 11 neck
    '......cccccssccccc......', // 12 collar
    '......ccaaaaaaaacc......', // 13 leather apron
    '.....ccaaaaaaaaaacc.....', // 14
    '.....ssaaaaaaaaaass.....', // 15 hands
    '.....kkaaAAAAAAaakk.....', // 16 apron pocket
    '......AAAAAAAAAAAA......', // 17 apron hem
    '......dddddddddddd......', // 18 trousers
    '......Dddddddddddb......', // 19
    '......bbbbbbbbbbbb......', // 20
    ...LEGS_AND_BOOTS,
  ],
};

// Generic villager: short brown hair, a simple plum tunic.
export const VILLAGER: PixelSprite = {
  width: 24,
  height: 32,
  outline: palette.outline,
  legend: charLegend({
    hair: palette.hairBrown,
    hairDark: palette.hairBrownDark,
    hairLight: palette.hairBrownLight,
    shirt: palette.villagerShirt,
    shirtDark: palette.villagerShirtDark,
    bottom: palette.shoe,
    bottomDark: palette.shoeDark,
    bottomLight: palette.shoeLight,
  }),
  rows: [
    '........................', // 0
    '.......hhhhhhhh.........', // 1
    '......hhhhhhhhhh........', // 2
    '......hHhhhhhhhg........', // 3
    '......hhhhhhhhhh........', // 4
    '.......hhhhhhhh.........', // 5
    '.......hwwwsswwwh.......', // 6
    '.......hwewsswewh.......', // 7
    '.......srssssssrs.......', // 8
    '.......sssOssOsss.......', // 9
    '.......ssssOOssss.......', // 10
    '..........kssk..........', // 11
    '......cccccssccccc......', // 12 tunic collar
    '......cccccvvccccc......', // 13
    '.....ccccccvvcccccc.....', // 14
    '.....ssccccccccccss.....', // 15 hands
    '.....kkcccccccccckk.....', // 16
    '......cvvvvvvvvvvc......', // 17 tunic hem
    '......dddddddddddd......', // 18 trousers
    '......Dddddddddddb......', // 19
    '......bbbbbbbbbbbb......', // 20
    ...LEGS_AND_BOOTS,
  ],
};
