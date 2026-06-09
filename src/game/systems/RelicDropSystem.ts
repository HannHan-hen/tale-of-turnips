// Rare Starless-relic finds during everyday chores. The three pieces not guarded by a dungeon
// boss (helm, plate, blade) can surface while foraging a bush, harvesting a turnip, or petting
// a chicken — but only once the first ruin boss has fallen and the player holds enough gold,
// so they never drop in the opening minutes. Pure logic; the scene awards the piece and shows
// the toast. Source/chance live in data/armor.ts; the gate numbers live in data/balance.ts.

import { RELIC_DROPS, type RelicSource } from '../data/armor';
import { Balance } from '../data/balance';
import type { ArmorPieceId } from '../types/ids';
import type { GameState } from '../types/models';
import { hasPiece } from './EquipmentSystem';

export type { RelicSource };

// Relics only begin surfacing after the first boss falls and the player has earned some gold.
export function relicsEligible(state: GameState): boolean {
  return state.firstBossDefeated && state.player.gold >= Balance.relicGoldThreshold;
}

// Rolls for an uncollected relic tied to `source`. Returns the piece to award, or undefined.
// `rng` (0..1) is injectable for tests.
export function rollRelicDrop(
  state: GameState,
  source: RelicSource,
  rng: () => number = Math.random,
): ArmorPieceId | undefined {
  if (!relicsEligible(state)) return undefined;
  for (const drop of RELIC_DROPS) {
    if (drop.source !== source) continue;
    if (hasPiece(state.armor, drop.pieceId)) continue;
    if (rng() < drop.chance) return drop.pieceId;
  }
  return undefined;
}
