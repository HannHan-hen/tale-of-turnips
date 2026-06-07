import { describe, expect, it } from 'vitest';
import { MAPS, TILE } from '../src/game/data/maps';
import { createNewGameState } from '../src/game/state/newGameState';
import { transitionTo } from '../src/game/systems/MapTransitionSystem';
import { add, count, transfer } from '../src/game/systems/InventorySystem';
import { ChestId, ItemId, MapId } from '../src/game/types/ids';

describe('new game world setup', () => {
  it('creates a map state and chest for every registered map/chest', () => {
    const state = createNewGameState();
    for (const def of Object.values(MAPS)) {
      expect(state.maps[def.mapId]).toBeDefined();
      for (const placement of def.chests) {
        expect(state.chests[placement.chestId]).toBeDefined();
      }
    }
    expect(state.chests[ChestId.House]).toBeDefined();
  });
});

describe('MapTransitionSystem', () => {
  it('moves the player to the target map and spawn tile', () => {
    const state = createNewGameState();
    transitionTo(state, MapId.House, { x: 5, y: 7 });
    expect(state.player.mapId).toBe(MapId.House);
    expect(state.player.x).toBe((5 + 0.5) * TILE);
    expect(state.player.y).toBe((7 + 0.5) * TILE);
  });
});

describe('chest storage (shared inventory model)', () => {
  it('moves stacks between the backpack and a chest', () => {
    const state = createNewGameState();
    const chest = state.chests[ChestId.House];
    add(state.player.inventory, ItemId.Turnip, 4);

    expect(transfer(state.player.inventory, chest.inventory, ItemId.Turnip, 3)).toBe(true);
    expect(count(chest.inventory, ItemId.Turnip)).toBe(3);
    expect(count(state.player.inventory, ItemId.Turnip)).toBe(1);

    expect(transfer(chest.inventory, state.player.inventory, ItemId.Turnip, 3)).toBe(true);
    expect(count(chest.inventory, ItemId.Turnip)).toBe(0);
    expect(count(state.player.inventory, ItemId.Turnip)).toBe(4);
  });
});
