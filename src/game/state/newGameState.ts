// Factory for a fresh game. Single place that defines starting conditions.
// Map, chest, chicken, and bush state are derived from the map registry so adding entries
// there is enough — no edits needed here.

import { Balance } from '../data/balance';
import { MAPS, tileCenter } from '../data/maps';
import { CropId, ItemId, MapId } from '../types/ids';
import type { BushState, ChestState, ChickenState, GameState, MapState } from '../types/models';
import { add, createInventory } from '../systems/InventorySystem';

export function createNewGameState(): GameState {
  const farm = MAPS[MapId.Farm];
  const spawn = tileCenter(farm.spawnTile);

  const inventory = createInventory(Balance.inventoryCapacity);
  add(inventory, ItemId.TurnipSeed, Balance.startingSeeds);

  const maps: Record<string, MapState> = {};
  const chests: Record<string, ChestState> = {};
  const chickens: Record<string, ChickenState> = {};
  const bushes: Record<string, BushState> = {};
  for (const def of Object.values(MAPS)) {
    maps[def.mapId] = { mapId: def.mapId, crops: [] };
    for (const placement of def.chests) {
      chests[placement.chestId] = {
        id: placement.chestId,
        inventory: createInventory(Balance.chestCapacity),
      };
    }
    for (const hen of def.chickens) chickens[hen.id] = { id: hen.id, lastPettedDay: 0 };
    for (const bush of def.bushes) bushes[bush.id] = { id: bush.id, readyTick: 0 };
  }

  return {
    player: {
      mapId: MapId.Farm,
      x: spawn.x,
      y: spawn.y,
      facing: 'down',
      gold: Balance.startingGold,
      hp: Balance.playerMaxHp,
      maxHp: Balance.playerMaxHp,
      inventory,
      selectedCropId: CropId.Turnip,
    },
    maps,
    chests,
    chickens,
    bushes,
    time: { tick: 0, day: 1 },
    stats: { cropsHarvested: 0, chickensPetted: 0, monstersDefeated: 0 },
  };
}
