// Opening a ruin cache: collect the legendary piece, re-derive the loadout and max hearts,
// and reward the find with a full heal. Completing the set rewards the village boy too. Pure
// state logic; the scene renders the opened cache, the toasts, and the HUD refresh.

import { ARMOR_PIECES, type ArmorPieceDef } from '../data/armor';
import { Balance } from '../data/balance';
import { ArmorPieceId, NpcId } from '../types/ids';
import type { GameState } from '../types/models';
import { grantMilestone } from './AffectionSystem';
import { collectPiece, computeLoadout, recalcMaxHp, type Loadout } from './EquipmentSystem';

export type CacheResult =
  | { kind: 'empty' }
  | { kind: 'collected'; piece: ArmorPieceDef; loadout: Loadout; setComplete: boolean };

export function openCache(state: GameState, pieceId: ArmorPieceId): CacheResult {
  const armor = state.armor;
  if (!collectPiece(armor, pieceId)) return { kind: 'empty' };

  const loadout = computeLoadout(armor, state.player.inventory);
  recalcMaxHp(state.player, armor);
  state.player.hp = state.player.maxHp; // finding a piece restores you to full

  if (loadout.setComplete) {
    const jay = state.affection[NpcId.Jay];
    if (jay) grantMilestone(jay, 'set_complete', Balance.affectionStorySet);
  }

  return { kind: 'collected', piece: ARMOR_PIECES[pieceId], loadout, setComplete: loadout.setComplete };
}
