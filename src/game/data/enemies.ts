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
  isBoss?: boolean; // defeating it wins the game
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
  // The ruins' heart. Slow but tanky — beatable once the Starless Set's edge and hearts
  // are in hand (the sealed door only opens with the full set anyway).
  [EnemyId.RuinHeart]: {
    enemyId: EnemyId.RuinHeart,
    displayName: 'The Ruin Heart',
    maxHp: 16,
    contactDamage: 1,
    speed: 46,
    textureKey: TextureKey.EnemyRuinHeart,
    loot: [],
    isBoss: true,
  },
};
