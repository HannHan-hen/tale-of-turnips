// Re-exports the Phaser-free sprite data + helpers so the offline preview renderer
// (tools/preview.mjs) can bundle and render exactly what the game ships. Add a sprite
// here to include it in the review sheets. Not part of the app or the tsconfig build.
export { resolvePixels } from '../src/game/assets/sprites/spriteGrid';
export { palette } from '../src/game/data/palette';
import { FARMER } from '../src/game/assets/sprites/farmer';
import { JAY, SEED_SELLER, BLACKSMITH, VILLAGER } from '../src/game/assets/sprites/characters';
import { CHICKEN } from '../src/game/assets/sprites/chicken';

export const SPRITES = {
  farmer: FARMER,
  jay: JAY,
  seedSeller: SEED_SELLER,
  blacksmith: BLACKSMITH,
  villager: VILLAGER,
  chicken: CHICKEN,
};
