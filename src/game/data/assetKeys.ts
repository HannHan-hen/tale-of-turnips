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
  Signpost: 'signpost',
  Stall: 'stall',
  Anvil: 'anvil',
  NpcSeedSeller: 'npc_seed_seller',
  NpcBlacksmith: 'npc_blacksmith',
  NpcVillager: 'npc_villager',
  NpcJay: 'npc_jay',
  Chicken: 'chicken',
  BushFull: 'bush_full',
  BushEmpty: 'bush_empty',
  StoneFloor: 'tile_stone_floor',
  Rubble: 'rubble',
  Slash: 'slash',
  EnemyRuinMite: 'enemy_ruin_mite',
  EnemyShadePup: 'enemy_shade_pup',
  EnemyCropNibbler: 'enemy_crop_nibbler',
  EnemyRuinHeart: 'enemy_ruin_heart',
  SealedDoor: 'sealed_door',
  HeartFull: 'heart_full',
  HeartEmpty: 'heart_empty',
  CacheClosed: 'cache_closed',
  CacheOpen: 'cache_open',
  IconStarlessHelm: 'icon_starless_helm',
  IconStarlessPlate: 'icon_starless_plate',
  IconStarlessGauntlets: 'icon_starless_gauntlets',
  IconStarlessGreaves: 'icon_starless_greaves',
  IconStarlessBlade: 'icon_starless_blade',
  IconTurnipSeed: 'icon_turnip_seed',
  IconTurnip: 'icon_turnip',
  IconCarrotSeed: 'icon_carrot_seed',
  IconCarrot: 'icon_carrot',
  IconPumpkinSeed: 'icon_pumpkin_seed',
  IconPumpkin: 'icon_pumpkin',
  IconEgg: 'icon_egg',
  IconBerry: 'icon_berry',
  IconSword: 'icon_sword',
  IconArmor: 'icon_armor',
  IconRuinShard: 'icon_ruin_shard',
  IconShadowWisp: 'icon_shadow_wisp',
} as const;
export type TextureKey = (typeof TextureKey)[keyof typeof TextureKey];

// Crop textures are generated per growth stage: crop_<cropId>_<stage>.
export function cropTextureKey(cropId: string, stage: number): string {
  return `crop_${cropId}_${stage}`;
}
