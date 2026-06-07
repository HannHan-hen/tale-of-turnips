// Legendary equipment registry: the Starless Set. Pieces are found in ruin caches (not
// bought), auto-equipped on pickup, and each grants a simple effect. Effect numbers are
// data here; EquipmentSystem sums them into a loadout. The full set opens the boss door
// (consumed by the boss slice).

import { ArmorPieceId } from '../types/ids';
import { TextureKey } from './assetKeys';

export const SET_NAME = 'Starless Set';

export type ArmorSlot = 'helmet' | 'armor' | 'gloves' | 'boots' | 'weapon';

export interface ArmorEffect {
  bonusDamage?: number;
  bonusHearts?: number;
  bonusSpeed?: number; // px/sec
  bonusYield?: number; // extra harvest per crop
  opensBoss?: boolean; // gates the boss door (used by the boss slice)
}

export interface ArmorPieceDef {
  pieceId: ArmorPieceId;
  slot: ArmorSlot;
  displayName: string;
  blurb: string; // short effect description for the UI
  iconKey: string;
  effect: ArmorEffect;
}

export const ARMOR_PIECES: Record<ArmorPieceId, ArmorPieceDef> = {
  [ArmorPieceId.Helm]: {
    pieceId: ArmorPieceId.Helm,
    slot: 'helmet',
    displayName: 'Starless Helm',
    blurb: 'Reveals the sealed door',
    iconKey: TextureKey.IconStarlessHelm,
    effect: { opensBoss: true },
  },
  [ArmorPieceId.Plate]: {
    pieceId: ArmorPieceId.Plate,
    slot: 'armor',
    displayName: 'Starless Plate',
    blurb: '+2 hearts',
    iconKey: TextureKey.IconStarlessPlate,
    effect: { bonusHearts: 2 },
  },
  [ArmorPieceId.Gauntlets]: {
    pieceId: ArmorPieceId.Gauntlets,
    slot: 'gloves',
    displayName: 'Starless Gauntlets',
    blurb: '+1 harvest',
    iconKey: TextureKey.IconStarlessGauntlets,
    effect: { bonusYield: 1 },
  },
  [ArmorPieceId.Greaves]: {
    pieceId: ArmorPieceId.Greaves,
    slot: 'boots',
    displayName: 'Starless Greaves',
    blurb: 'Swifter steps',
    iconKey: TextureKey.IconStarlessGreaves,
    effect: { bonusSpeed: 45 },
  },
  [ArmorPieceId.Blade]: {
    pieceId: ArmorPieceId.Blade,
    slot: 'weapon',
    displayName: 'Starless Blade',
    blurb: '+1 attack',
    iconKey: TextureKey.IconStarlessBlade,
    effect: { bonusDamage: 1 },
  },
};

// Display order (helmet, armor, gloves, boots, weapon).
export const ARMOR_ORDER: ArmorPieceId[] = [
  ArmorPieceId.Helm,
  ArmorPieceId.Plate,
  ArmorPieceId.Gauntlets,
  ArmorPieceId.Greaves,
  ArmorPieceId.Blade,
];
