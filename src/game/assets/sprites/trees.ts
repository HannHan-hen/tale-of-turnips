import { palette } from '../../data/palette';
import { build } from './compose';
import type { PixelSprite } from './spriteGrid';

const treeLegend = {
  l: palette.leaf,
  L: palette.leafDark,
  H: palette.leafLight,
  w: palette.wood,
  W: palette.woodDark,
};

// An ambient forest tree: a round leafy crown (built from three stacked bands so it reads as
// rounded, shaded underneath, sunlit on top) sitting on a simple trunk. 26x40, planted by its
// trunk base so it sits naturally on the ground tile like the bushes and props around it.
export const TREE: PixelSprite = build(26, 40, treeLegend, (r) => {
  // crown
  r('l', 8, 2, 10, 4);
  r('l', 3, 6, 20, 14);
  r('l', 8, 20, 10, 4);
  r('L', 8, 21, 10, 3); // shadow along the lower curve
  r('H', 6, 7, 8, 3); // sunlit cap
  // trunk
  r('w', 11, 24, 4, 14);
  r('W', 14, 24, 1, 14);
});
