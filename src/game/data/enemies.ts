// Enemy registry. Stats, behavior numbers, sprites, and loot tables are all data here —
// the combat system reads these and never hardcodes a monster. (Loot is embedded for now;
// it can graduate to its own loot.ts when tables get richer.)

import { EnemyId, ItemId } from '../types/ids';
import { TextureKey } from './assetKeys';

export interface LootDrop {
  itemId: ItemId;
  chance: number; // 0..1 probability the drop happens
  min: number; // inclusive
  max: number; // inclusive
}

export interface EnemyDef {
  enemyId: EnemyId;
  displayName: string;
  maxHp: number;
  contactDamage: number; // hearts removed on contact
  speed: number; // px/sec when chasing
  textureKey: string;
  loot: LootDrop[];
  isBoss?: boolean; // a dungeon boss: clears its room, opens its chest, eases threat once/day
  endsGame?: boolean; // the final boss — defeating it ends the game
}

export const ENEMIES: Record<EnemyId, EnemyDef> = {
  [EnemyId.RuinMite]: {
    enemyId: EnemyId.RuinMite,
    displayName: 'Ruin Mite',
    maxHp: 2,
    contactDamage: 1,
    speed: 42,
    textureKey: TextureKey.EnemyRuinMite,
    loot: [{ itemId: ItemId.RuinShard, chance: 0.7, min: 1, max: 1 }],
  },
  [EnemyId.ShadePup]: {
    enemyId: EnemyId.ShadePup,
    displayName: 'Shade Pup',
    maxHp: 3,
    contactDamage: 1,
    speed: 58,
    textureKey: TextureKey.EnemyShadePup,
    loot: [
      { itemId: ItemId.RuinShard, chance: 0.5, min: 1, max: 2 },
      { itemId: ItemId.ShadowWisp, chance: 0.15, min: 1, max: 1 },
    ],
  },
  // Wanders onto the farm during raids and makes for the crops. Weak and slow so the
  // player can intercept; drops nothing — the reward is a saved harvest and lower threat.
  [EnemyId.CropNibbler]: {
    enemyId: EnemyId.CropNibbler,
    displayName: 'Crop Nibbler',
    maxHp: 2,
    contactDamage: 1,
    speed: 34,
    textureKey: TextureKey.EnemyCropNibbler,
    loot: [],
  },
  // First dungeon boss (room 2). A stout guardian — a real wall after the opening mites,
  // but fair once you've farmed a little gear. Drops a few shards on the way down.
  [EnemyId.RuinWarden]: {
    enemyId: EnemyId.RuinWarden,
    displayName: 'The Ruin Warden',
    maxHp: 7,
    contactDamage: 1,
    speed: 40,
    textureKey: TextureKey.EnemyRuinWarden,
    loot: [{ itemId: ItemId.RuinShard, chance: 1, min: 2, max: 3 }],
    isBoss: true,
  },
  // Second dungeon boss (room 4). Tankier and hits harder; rewards a richer drop.
  [EnemyId.RuinColossus]: {
    enemyId: EnemyId.RuinColossus,
    displayName: 'The Ruin Colossus',
    maxHp: 12,
    contactDamage: 2,
    speed: 38,
    textureKey: TextureKey.EnemyRuinColossus,
    loot: [
      { itemId: ItemId.RuinShard, chance: 1, min: 3, max: 4 },
      { itemId: ItemId.ShadowWisp, chance: 0.5, min: 1, max: 1 },
    ],
    isBoss: true,
  },
  // The ruins' heart (room 6): the final boss. Slow but tanky — beatable once you've pushed
  // through the dungeon and gathered some gear. Defeating it ends the game.
  [EnemyId.RuinHeart]: {
    enemyId: EnemyId.RuinHeart,
    displayName: 'The Ruin Heart',
    maxHp: 18,
    contactDamage: 1,
    speed: 46,
    textureKey: TextureKey.EnemyRuinHeart,
    loot: [],
    isBoss: true,
    endsGame: true,
  },
};
