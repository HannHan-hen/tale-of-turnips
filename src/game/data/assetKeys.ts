// Central asset manifest. Every texture is referenced through these keys, never by ad-hoc
// strings, so procedural art can later be swapped for hand-made art without touching logic.

export const TextureKey = {
  GrassTile: 'tile_grass',
  SoilTile: 'tile_soil',
  WoodFloor: 'tile_wood_floor',
  Wall: 'tile_wall',
  Player: 'player',
  ShippingBox: 'shipping_box',
  Cottage: 'cottage',
  Door: 'door',
  Chest: 'chest',
  IconTurnipSeed: 'icon_turnip_seed',
  IconTurnip: 'icon_turnip',
} as const;
export type TextureKey = (typeof TextureKey)[keyof typeof TextureKey];

// Crop textures are generated per growth stage: crop_<cropId>_<stage>.
export function cropTextureKey(cropId: string, stage: number): string {
  return `crop_${cropId}_${stage}`;
}
