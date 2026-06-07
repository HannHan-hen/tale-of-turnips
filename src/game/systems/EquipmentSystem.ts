// Equipment logic. Sums the effects of collected Starless pieces into a loadout and keeps
// the player's max hearts in sync. Pure — no Phaser. Pieces are auto-equipped when found,
// so "collected" and "equipped" are the same here.

import { ARMOR_PIECES, ARMOR_ORDER, BASIC_GEAR } from '../data/armor';
import { Balance } from '../data/balance';
import type { ArmorPieceId, ItemId } from '../types/ids';
import type { ArmorState, Inventory, PlayerState } from '../types/models';
import { count } from './InventorySystem';

export interface Loadout {
  bonusDamage: number;
  bonusHearts: number;
  bonusSpeed: number;
  bonusYield: number;
  opensBoss: boolean;
  setComplete: boolean;
}

// Sums legendary pieces and (optionally) carried basic gear into one loadout.
export function computeLoadout(armor: ArmorState, inventory?: Inventory): Loadout {
  const loadout: Loadout = {
    bonusDamage: 0,
    bonusHearts: 0,
    bonusSpeed: 0,
    bonusYield: 0,
    opensBoss: false,
    setComplete: armor.collectedPieces.length >= ARMOR_ORDER.length,
  };
  const apply = (e: {
    bonusDamage?: number;
    bonusHearts?: number;
    bonusSpeed?: number;
    bonusYield?: number;
    opensBoss?: boolean;
  }) => {
    loadout.bonusDamage += e.bonusDamage ?? 0;
    loadout.bonusHearts += e.bonusHearts ?? 0;
    loadout.bonusSpeed += e.bonusSpeed ?? 0;
    loadout.bonusYield += e.bonusYield ?? 0;
    if (e.opensBoss) loadout.opensBoss = true;
  };

  for (const pieceId of armor.collectedPieces) apply(ARMOR_PIECES[pieceId].effect);
  if (inventory) {
    for (const [itemId, effect] of Object.entries(BASIC_GEAR)) {
      if (effect && count(inventory, itemId as ItemId) > 0) apply(effect);
    }
  }
  return loadout;
}

export function hasPiece(armor: ArmorState, pieceId: ArmorPieceId): boolean {
  return armor.collectedPieces.includes(pieceId);
}

// Adds a piece (auto-equipped). Returns false if already owned.
export function collectPiece(armor: ArmorState, pieceId: ArmorPieceId): boolean {
  if (hasPiece(armor, pieceId)) return false;
  armor.collectedPieces.push(pieceId);
  return true;
}

// Recomputes max hearts from base + armor + carried gear, clamping current hearts.
export function recalcMaxHp(player: PlayerState, armor: ArmorState): void {
  player.maxHp = Balance.playerMaxHp + computeLoadout(armor, player.inventory).bonusHearts;
  if (player.hp > player.maxHp) player.hp = player.maxHp;
}
