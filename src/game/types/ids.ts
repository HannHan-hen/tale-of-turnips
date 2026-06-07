// Typed IDs and constants. Gameplay code references these — never raw string literals.
// Each is a `const` object plus a matching union type so IDs are autocompleted and checked.

export const ItemId = {
  TurnipSeed: 'turnip_seed',
  Turnip: 'turnip',
} as const;
export type ItemId = (typeof ItemId)[keyof typeof ItemId];

export const CropId = {
  Turnip: 'turnip',
} as const;
export type CropId = (typeof CropId)[keyof typeof CropId];

export const MapId = {
  Farm: 'farm',
  House: 'house',
} as const;
export type MapId = (typeof MapId)[keyof typeof MapId];

export const ChestId = {
  House: 'house_chest',
} as const;
export type ChestId = (typeof ChestId)[keyof typeof ChestId];

export const SceneKey = {
  Boot: 'boot',
  World: 'world',
  UI: 'ui',
  Chest: 'chest',
} as const;
export type SceneKey = (typeof SceneKey)[keyof typeof SceneKey];

// What the single interact key can act upon.
export const InteractionKind = {
  Plot: 'plot',
  ShippingBox: 'shipping_box',
  Chest: 'chest',
  Door: 'door',
} as const;
export type InteractionKind = (typeof InteractionKind)[keyof typeof InteractionKind];
