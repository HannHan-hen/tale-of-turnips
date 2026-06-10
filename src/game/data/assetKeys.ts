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
  ChickenTucked: 'chicken_b', // second idle frame (loaded raster only; drives the bob anim)
  BushFull: 'bush_full',
  BushEmpty: 'bush_empty',
  StoneFloor: 'tile_stone_floor',
  Rubble: 'rubble',
  Tree: 'tree',
  Slash: 'slash',
  EnemyRuinMite: 'enemy_ruin_mite',
  EnemyShadePup: 'enemy_shade_pup',
  EnemyCropNibbler: 'enemy_crop_nibbler',
  EnemyRuinWarden: 'enemy_ruin_warden',
  EnemyRuinColossus: 'enemy_ruin_colossus',
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
  IconRadishSeed: 'icon_radish_seed',
  IconRadish: 'icon_radish',
  IconEgg: 'icon_egg',
  IconBerry: 'icon_berry',
  IconSword: 'icon_sword',
  IconArmor: 'icon_armor',
  IconRuinShard: 'icon_ruin_shard',
  IconShadowWisp: 'icon_shadow_wisp',
  // Generated raster art loaded from src/assets/ (see src/assets/SOURCES.md), not procedural.
  TitleBackdrop: 'title_backdrop',
  PortraitMarigold: 'portrait_marigold',
  PortraitBramble: 'portrait_bramble',
  PortraitPip: 'portrait_pip',
  PortraitJay: 'portrait_jay',
} as const;
export type TextureKey = (typeof TextureKey)[keyof typeof TextureKey];

// The farmer is an animated sprite: a standing pose plus two walk frames for each of three
// views (down/up/side; left reuses the side, flipped). One texture per frame; the down
// stand reuses the base Player key.
export const PlayerFrame = {
  DownStand: TextureKey.Player,
  DownWalkA: 'player_down_a',
  DownWalkB: 'player_down_b',
  UpStand: 'player_up',
  UpWalkA: 'player_up_a',
  UpWalkB: 'player_up_b',
  SideStand: 'player_side',
  SideWalkA: 'player_side_a',
  SideWalkB: 'player_side_b',
} as const;

// Player animation keys (registered once at boot).
export const PlayerAnim = {
  IdleDown: 'farmer_idle_down',
  WalkDown: 'farmer_walk_down',
  IdleUp: 'farmer_idle_up',
  WalkUp: 'farmer_walk_up',
  IdleSide: 'farmer_idle_side',
  WalkSide: 'farmer_walk_side',
} as const;

// Other looping animations registered at boot. The chicken bob only exists when both raster
// frames are loaded (the procedural chicken has a single frame and uses a tween instead).
export const ChickenAnim = { Idle: 'chicken_idle' } as const;
export type PlayerAnim = (typeof PlayerAnim)[keyof typeof PlayerAnim];

// Crop textures are generated per growth stage: crop_<cropId>_<stage>.
export function cropTextureKey(cropId: string, stage: number): string {
  return `crop_${cropId}_${stage}`;
}
