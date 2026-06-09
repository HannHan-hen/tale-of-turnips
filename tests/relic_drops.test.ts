import { describe, expect, it } from 'vitest';
import { RELIC_DROPS } from '../src/game/data/armor';
import { Balance } from '../src/game/data/balance';
import { relicsEligible, rollRelicDrop } from '../src/game/systems/RelicDropSystem';
import { collectPiece } from '../src/game/systems/EquipmentSystem';
import { createNewGameState } from '../src/game/state/newGameState';
import { ArmorPieceId } from '../src/game/types/ids';
import type { GameState } from '../src/game/types/models';

// A state that has cleared the gate: first boss down and gold over the threshold.
function unlockedState(): GameState {
  const state = createNewGameState();
  state.firstBossDefeated = true;
  state.player.gold = Balance.relicGoldThreshold;
  return state;
}

const always = () => 0; // rng that always passes the chance check
const never = () => 1; // rng that always fails it

describe('RelicDropSystem eligibility gate', () => {
  it('stays locked until both the first boss and the gold threshold are met', () => {
    const state = createNewGameState();
    state.player.gold = Balance.relicGoldThreshold;
    expect(relicsEligible(state)).toBe(false); // boss not yet beaten

    state.firstBossDefeated = true;
    state.player.gold = Balance.relicGoldThreshold - 1;
    expect(relicsEligible(state)).toBe(false); // not enough gold

    state.player.gold = Balance.relicGoldThreshold;
    expect(relicsEligible(state)).toBe(true);
  });

  it('never drops a relic before the gate is cleared, even on a guaranteed roll', () => {
    const state = createNewGameState();
    expect(rollRelicDrop(state, 'bush', always)).toBeUndefined();
  });
});

describe('RelicDropSystem rolls', () => {
  it('awards the relic mapped to each chore on a passing roll', () => {
    expect(rollRelicDrop(unlockedState(), 'bush', always)).toBe(ArmorPieceId.Helm);
    expect(rollRelicDrop(unlockedState(), 'turnip', always)).toBe(ArmorPieceId.Plate);
    expect(rollRelicDrop(unlockedState(), 'chicken', always)).toBe(ArmorPieceId.Blade);
  });

  it('drops nothing when the roll exceeds the chance', () => {
    expect(rollRelicDrop(unlockedState(), 'bush', never)).toBeUndefined();
  });

  it('does not re-award a piece already collected', () => {
    const state = unlockedState();
    collectPiece(state.armor, ArmorPieceId.Helm);
    expect(rollRelicDrop(state, 'bush', always)).toBeUndefined();
  });

  it('covers exactly the three pieces not held in dungeon chests', () => {
    const relicPieces = RELIC_DROPS.map((d) => d.pieceId).sort();
    expect(relicPieces).toEqual(
      [ArmorPieceId.Helm, ArmorPieceId.Plate, ArmorPieceId.Blade].sort(),
    );
    expect(relicPieces).not.toContain(ArmorPieceId.Gauntlets);
    expect(relicPieces).not.toContain(ArmorPieceId.Greaves);
  });
});
