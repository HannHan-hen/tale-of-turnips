// Re-exports the Phaser-free sprite data + helpers so the offline preview renderer
// (tools/preview.mjs) can bundle and render exactly what the game ships. Add a sprite
// here to include it in the review sheets. Not part of the app or the tsconfig build.
export { resolvePixels } from '../src/game/assets/sprites/spriteGrid';
export { palette } from '../src/game/data/palette';
import { FARMER } from '../src/game/assets/sprites/farmer';

export const SPRITES = {
  farmer: FARMER,
};
