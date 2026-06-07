// Typed IDs and constants. Gameplay code references these — never raw string literals.
// Each is a `const` object plus a matching union type so IDs are autocompleted and checked.

export const ItemId = {
  TurnipSeed: 'turnip_seed',
  Turnip: 'turnip',
  CarrotSeed: 'carrot_seed',
  Carrot: 'carrot',
  PumpkinSeed: 'pumpkin_seed',
  Pumpkin: 'pumpkin',
  Egg: 'egg',
  Berry: 'berry',
  WornSword: 'worn_sword',
  PaddedVest: 'padded_vest',
} as const;
export type ItemId = (typeof ItemId)[keyof typeof ItemId];

export const CropId = {
  Turnip: 'turnip',
  Carrot: 'carrot',
  Pumpkin: 'pumpkin',
} as const;
export type CropId = (typeof CropId)[keyof typeof CropId];

export const MapId = {
  Farm: 'farm',
  House: 'house',
  Village: 'village',
} as const;
export type MapId = (typeof MapId)[keyof typeof MapId];

export const NpcId = {
  SeedSeller: 'seed_seller',
  Blacksmith: 'blacksmith',
  Hint: 'old_pip',
} as const;
export type NpcId = (typeof NpcId)[keyof typeof NpcId];

export const ShopId = {
  Seeds: 'seed_shop',
  Blacksmith: 'blacksmith_shop',
} as const;
export type ShopId = (typeof ShopId)[keyof typeof ShopId];

export const ChestId = {
  House: 'house_chest',
} as const;
export type ChestId = (typeof ChestId)[keyof typeof ChestId];

export const SceneKey = {
  Boot: 'boot',
  World: 'world',
  UI: 'ui',
  Chest: 'chest',
  Shop: 'shop',
} as const;
export type SceneKey = (typeof SceneKey)[keyof typeof SceneKey];

// What the single interact key can act upon.
export const InteractionKind = {
  Plot: 'plot',
  ShippingBox: 'shipping_box',
  Chest: 'chest',
  Door: 'door',
  Npc: 'npc',
  Chicken: 'chicken',
  Bush: 'bush',
} as const;
export type InteractionKind = (typeof InteractionKind)[keyof typeof InteractionKind];
