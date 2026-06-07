// Factory for a fresh game. Single place that defines starting conditions.
// Map and chest state are derived from the map registry so adding maps/chests there
// is enough — no edits needed here.

import { Balance } from '../data/balance';
import { MAPS, tileCenter } from '../data/maps';
import { ItemId, MapId } from '../types/ids';
import type { ChestState, GameState, MapState } from '../types/models';
import { add, createInventory } from '../systems/InventorySystem';

export function createNewGameState(): GameState {
  const farm = MAPS[MapId.Farm];
  const spawn = tileCenter(farm.spawnTile);

  const inventory = createInventory(Balance.inventoryCapacity);
  add(inventory, ItemId.TurnipSeed, Balance.startingSeeds);

  const maps: Record<string, MapState> = {};
  const chests: Record<string, ChestState> = {};
  for (const def of Object.values(MAPS)) {
    maps[def.mapId] = { mapId: def.mapId, crops: [] };
    for (const placement of def.chests) {
      chests[placement.chestId] = {
        id: placement.chestId,
        inventory: createInventory(Balance.chestCapacity),
      };
    }
  }

  return {
    player: {
      mapId: MapId.Farm,
      x: spawn.x,
      y: spawn.y,
      facing: 'down',
      gold: Balance.startingGold,
      inventory,
    },
    maps,
    chests,
    time: { tick: 0, day: 1 },
    stats: { cropsHarvested: 0 },
  };
}
