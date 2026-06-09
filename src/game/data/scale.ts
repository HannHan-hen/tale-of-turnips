// The one knob that sets the game's resolution. Art is authored at a small base grid
// (BASE_TILE) and everything — tiles, sprites, world distances, UI — is multiplied by SCALE
// so the whole game renders crisp and chunky at a higher fidelity without re-authoring art.
//
// To re-scale the entire game, change SCALE here and re-export the raster assets
// (tools/process_*.py) at the matching footprints. Nothing else needs editing.
export const BASE_TILE = 32; // authoring grid: one logical tile, as the pixel art is drawn
export const SCALE = 3; // render multiplier (TILE 32 -> 96, player 24x32 -> 72x96, etc.)
export const TILE = BASE_TILE * SCALE; // actual world tile size in pixels

/** Scale a base pixel measurement (UI offsets, panel sizes) to render size. */
export const px = (n: number): number => n * SCALE;
/** Scale a base font size to a render-size CSS string, e.g. fs(12) -> "36px". */
export const fs = (n: number): string => `${n * SCALE}px`;
