import { describe, expect, it } from 'vitest';
import { usePlot } from '../src/game/systems/CropInteractionSystem';
import { createNewGameState } from '../src/game/state/newGameState';
import { count } from '../src/game/systems/InventorySystem';
import { ticksToMature } from '../src/game/systems/FarmingSystem';
import { CROPS } from '../src/game/data/crops';
import { MAPS } from '../src/game/data/maps';
import { CropId, ItemId, MapId } from '../src/game/types/ids';

const farm = MAPS[MapId.Farm];

describe('CropInteractionSystem.usePlot', () => {
  it('plants on an empty plot, consuming one seed', () => {
    const state = createNewGameState();
    const seedsBefore = count(state.player.inventory, ItemId.TurnipSeed);

    const result = usePlot(state, farm, 0, 0, 0);

    expect(result.kind).toBe('planted');
    expect(count(state.player.inventory, ItemId.TurnipSeed)).toBe(seedsBefore - 1);
    expect(state.maps[MapId.Farm].crops).toHaveLength(1);
  });

  it('reports no_seeds when the selected crop has none left', () => {
    const state = createNewGameState();
    state.player.inventory.slots = []; // drop all seeds

    const result = usePlot(state, farm, 0, 0, 0);

    expect(result.kind).toBe('no_seeds');
    expect(state.maps[MapId.Farm].crops).toHaveLength(0);
  });

  it('reports growing while the planted crop is immature', () => {
    const state = createNewGameState();
    usePlot(state, farm, 0, 0, 0);

    const result = usePlot(state, farm, 0, 1, 0);

    expect(result.kind).toBe('growing');
  });

  it('harvests a mature crop, banking yield plus the bonus into stats and the bag', () => {
    const state = createNewGameState();
    usePlot(state, farm, 0, 0, 0);
    const def = CROPS[CropId.Turnip];
    const matureTick = ticksToMature(def); // exactly mature

    const result = usePlot(state, farm, 0, matureTick, 1);

    expect(result.kind).toBe('harvested');
    expect(state.maps[MapId.Farm].crops).toHaveLength(0);
    expect(count(state.player.inventory, ItemId.Turnip)).toBe(def.harvestYield + 1);
    expect(state.stats.cropsHarvested).toBe(def.harvestYield + 1);
  });

  it('reports inventory_full and leaves the crop standing when the harvest will not fit', () => {
    const state = createNewGameState();
    usePlot(state, farm, 0, 0, 0);
    state.player.inventory = { slots: [], capacity: 0 }; // no room for anything
    const def = CROPS[CropId.Turnip];

    const result = usePlot(state, farm, 0, ticksToMature(def), 0);

    expect(result.kind).toBe('inventory_full');
    expect(state.maps[MapId.Farm].crops).toHaveLength(1);
    expect(state.stats.cropsHarvested).toBe(0);
  });
});
