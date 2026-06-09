// Typed IDs and constants. Gameplay code references these — never raw string literals.
// Each is a `const` object plus a matching union type so IDs are autocompleted and checked.

export const ItemId = {
  TurnipSeed: 'turnip_seed',
  Turnip: 'turnip',
  CarrotSeed: 'carrot_seed',
  Carrot: 'carrot',
  RadishSeed: 'radish_seed',
  Radish: 'radish',
  Egg: 'egg',
  Berry: 'berry',
  WornSword: 'worn_sword',
  PaddedVest: 'padded_vest',
  RuinShard: 'ruin_shard',
  ShadowWisp: 'shadow_wisp',
} as const;
export type ItemId = (typeof ItemId)[keyof typeof ItemId];

export const CropId = {
  Turnip: 'turnip',
  Carrot: 'carrot',
  Radish: 'radish',
} as const;
export type CropId = (typeof CropId)[keyof typeof CropId];

export const MapId = {
  Farm: 'farm',
  House: 'house',
  Village: 'village',
  Forest: 'forest',
  // The ruins are a six-room dungeon. Ruins is the entrance (room 1); Ruins2..Ruins6 chain
  // deeper. Rooms 2 and 4 hold a mini boss + reward chest; room 6 holds the final boss.
  Ruins: 'ruins',
  Ruins2: 'ruins_2',
  Ruins3: 'ruins_3',
  Ruins4: 'ruins_4',
  Ruins5: 'ruins_5',
  Ruins6: 'ruins_6',
} as const;
export type MapId = (typeof MapId)[keyof typeof MapId];

export const EnemyId = {
  RuinMite: 'ruin_mite',
  ShadePup: 'shade_pup',
  CropNibbler: 'crop_nibbler',
  // The three dungeon bosses, in order of depth. The Ruin Heart ends the game.
  RuinWarden: 'ruin_warden',
  RuinColossus: 'ruin_colossus',
  RuinHeart: 'ruin_heart',
} as const;
export type EnemyId = (typeof EnemyId)[keyof typeof EnemyId];

// The Starless Set — five legendary pieces found in the ruins.
export const ArmorPieceId = {
  Helm: 'starless_helm',
  Plate: 'starless_plate',
  Gauntlets: 'starless_gauntlets',
  Greaves: 'starless_greaves',
  Blade: 'starless_blade',
} as const;
export type ArmorPieceId = (typeof ArmorPieceId)[keyof typeof ArmorPieceId];

export const NpcId = {
  SeedSeller: 'seed_seller',
  Blacksmith: 'blacksmith',
  Hint: 'old_pip',
  Jay: 'jay',
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
  Title: 'title',
  World: 'world',
  UI: 'ui',
  Chest: 'chest',
  Shop: 'shop',
  Talk: 'talk',
  End: 'end',
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
  Cache: 'cache',
} as const;
export type InteractionKind = (typeof InteractionKind)[keyof typeof InteractionKind];
