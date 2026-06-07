import { describe, expect, it } from 'vitest';
import { ARMOR_ORDER, ARMOR_PIECES } from '../src/game/data/armor';
import { Balance } from '../src/game/data/balance';
import { createNewGameState } from '../src/game/state/newGameState';
import {
  collectPiece,
  computeLoadout,
  hasPiece,
  recalcMaxHp,
} from '../src/game/systems/EquipmentSystem';
import { ArmorPieceId } from '../src/game/types/ids';

describe('EquipmentSystem', () => {
  it('starts with no pieces and an empty loadout', () => {
    const state = createNewGameState();
    const loadout = computeLoadout(state.armor);
    expect(loadout.bonusDamage).toBe(0);
    expect(loadout.bonusHearts).toBe(0);
    expect(loadout.opensBoss).toBe(false);
    expect(loadout.setComplete).toBe(false);
  });

  it('collects a piece once and reflects its effect', () => {
    const state = createNewGameState();
    expect(collectPiece(state.armor, ArmorPieceId.Plate)).toBe(true);
    expect(collectPiece(state.armor, ArmorPieceId.Plate)).toBe(false); // no duplicates
    expect(hasPiece(state.armor, ArmorPieceId.Plate)).toBe(true);
    expect(computeLoadout(state.armor).bonusHearts).toBe(2);
  });

  it('raises max hearts when the plate is equipped', () => {
    const state = createNewGameState();
    collectPiece(state.armor, ArmorPieceId.Plate);
    recalcMaxHp(state.player, state.armor);
    expect(state.player.maxHp).toBe(Balance.playerMaxHp + 2);
  });

  it('marks the set complete and opens the boss only with all pieces', () => {
    const state = createNewGameState();
    for (const pieceId of ARMOR_ORDER) collectPiece(state.armor, pieceId);
    const loadout = computeLoadout(state.armor);
    expect(loadout.setComplete).toBe(true);
    expect(loadout.opensBoss).toBe(true);
    // helmet is the piece that opens the boss door
    expect(ARMOR_PIECES[ArmorPieceId.Helm].effect.opensBoss).toBe(true);
  });
});
