import { describe, expect, it } from 'vitest';
import { openCache } from '../src/game/systems/CacheInteractionSystem';
import { createNewGameState } from '../src/game/state/newGameState';
import { ARMOR_ORDER } from '../src/game/data/armor';
import { Balance } from '../src/game/data/balance';
import { ArmorPieceId, NpcId } from '../src/game/types/ids';

describe('CacheInteractionSystem.openCache', () => {
  it('collects a piece, refreshes the loadout, and heals to full', () => {
    const state = createNewGameState();
    state.player.hp = 1;

    const result = openCache(state, ArmorPieceId.Plate); // +2 hearts

    expect(result.kind).toBe('collected');
    expect(state.armor.collectedPieces).toContain(ArmorPieceId.Plate);
    expect(state.player.maxHp).toBe(Balance.playerMaxHp + 2);
    expect(state.player.hp).toBe(state.player.maxHp);
  });

  it('reports empty when the piece was already collected', () => {
    const state = createNewGameState();
    openCache(state, ArmorPieceId.Helm);

    const result = openCache(state, ArmorPieceId.Helm);

    expect(result.kind).toBe('empty');
  });

  it('marks the set complete and rewards the village boy on the final piece', () => {
    const state = createNewGameState();
    const before = state.affection[NpcId.Jay].points;

    let last = openCache(state, ARMOR_ORDER[0]);
    for (let i = 1; i < ARMOR_ORDER.length; i++) last = openCache(state, ARMOR_ORDER[i]);

    expect(last.kind === 'collected' && last.setComplete).toBe(true);
    expect(state.affection[NpcId.Jay].points).toBe(before + Balance.affectionStorySet);
  });
});
