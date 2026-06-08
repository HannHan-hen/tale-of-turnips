// Re-exports the Phaser-free sprite data + helpers so the offline preview renderer
// (tools/preview.mjs) can bundle and render exactly what the game ships. Add a sprite
// here to include it in the review sheets. Not part of the app or the tsconfig build.
export { resolvePixels } from '../src/game/assets/sprites/spriteGrid';
export { palette } from '../src/game/data/palette';
import { FARMER } from '../src/game/assets/sprites/farmer';
import { JAY, SEED_SELLER, BLACKSMITH, VILLAGER } from '../src/game/assets/sprites/characters';
import { CHICKEN } from '../src/game/assets/sprites/chicken';
import {
  CROP_MOUND,
  CROP_SPROUT,
  CROP_LEAFY,
  TURNIP,
  CARROT,
  PUMPKIN,
} from '../src/game/assets/sprites/crops';
import { BUSH_FULL, BUSH_EMPTY } from '../src/game/assets/sprites/bushes';

export const SPRITES = {
  farmer: FARMER,
  jay: JAY,
  seedSeller: SEED_SELLER,
  blacksmith: BLACKSMITH,
  villager: VILLAGER,
  chicken: CHICKEN,
  cropMound: CROP_MOUND,
  cropSprout: CROP_SPROUT,
  cropLeafy: CROP_LEAFY,
  turnip: TURNIP,
  carrot: CARROT,
  pumpkin: PUMPKIN,
  bushFull: BUSH_FULL,
  bushEmpty: BUSH_EMPTY,
};
