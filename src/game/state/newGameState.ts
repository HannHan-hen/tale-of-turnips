// Factory for a fresh game. Single place that defines starting conditions.

import { Balance } from '../data/balance';
import { MAPS, tileCenter } from '../data/maps';
import { ItemId, MapId } from '../types/ids';
import type { GameState } from '../types/models';
import { add, createInventory } from '../systems/InventorySystem';

export function createNewGameState(): GameState {
  const farm = MAPS[MapId.Farm];
  const spawn = tileCenter(farm.spawnTile);

  const inventory = createInventory(Balance.inventoryCapacity);
  add(inventory, ItemId.TurnipSeed, Balance.startingSeeds);

  return {
    player: {
      mapId: MapId.Farm,
      x: spawn.x,
      y: spawn.y,
      facing: 'down',
      gold: Balance.startingGold,
      inventory,
    },
    maps: {
      [MapId.Farm]: { mapId: MapId.Farm, crops: [] },
    },
    time: { tick: 0, day: 1 },
    stats: { cropsHarvested: 0 },
  };
}
