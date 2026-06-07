// Equipment logic. Sums the effects of collected Starless pieces into a loadout and keeps
// the player's max hearts in sync. Pure — no Phaser. Pieces are auto-equipped when found,
// so "collected" and "equipped" are the same here.

import { ARMOR_PIECES, ARMOR_ORDER } from '../data/armor';
import { Balance } from '../data/balance';
import type { ArmorPieceId } from '../types/ids';
import type { ArmorState, PlayerState } from '../types/models';

export interface Loadout {
  bonusDamage: number;
  bonusHearts: number;
  bonusSpeed: number;
  bonusYield: number;
  opensBoss: boolean;
  setComplete: boolean;
}

export function computeLoadout(armor: ArmorState): Loadout {
  const loadout: Loadout = {
    bonusDamage: 0,
    bonusHearts: 0,
    bonusSpeed: 0,
    bonusYield: 0,
    opensBoss: false,
    setComplete: armor.collectedPieces.length >= ARMOR_ORDER.length,
  };
  for (const pieceId of armor.collectedPieces) {
    const e = ARMOR_PIECES[pieceId].effect;
    loadout.bonusDamage += e.bonusDamage ?? 0;
    loadout.bonusHearts += e.bonusHearts ?? 0;
    loadout.bonusSpeed += e.bonusSpeed ?? 0;
    loadout.bonusYield += e.bonusYield ?? 0;
    if (e.opensBoss) loadout.opensBoss = true;
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

// Recomputes max hearts from base + armor, clamping current hearts to the new maximum.
export function recalcMaxHp(player: PlayerState, armor: ArmorState): void {
  player.maxHp = Balance.playerMaxHp + computeLoadout(armor).bonusHearts;
  if (player.hp > player.maxHp) player.hp = player.maxHp;
}
