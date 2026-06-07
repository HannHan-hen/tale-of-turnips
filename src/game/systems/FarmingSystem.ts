// Farming logic. Deterministic crop growth based on the tick counter. No Phaser here —
// scenes read these results to choose which crop texture to show.

import { CROPS } from '../data/crops';
import type { CropId, MapId } from '../types/ids';
import type { CropInstance, MapState } from '../types/models';

// Current visual stage (0-based) of a crop at the given tick.
export function growthStage(crop: CropInstance, currentTick: number): number {
  const def = CROPS[crop.cropId];
  const elapsed = Math.max(0, currentTick - crop.plantedTick);
  const stage = Math.floor(elapsed / def.ticksPerStage);
  return Math.min(stage, def.growthStages - 1);
}

export function isMature(crop: CropInstance, currentTick: number): boolean {
  return growthStage(crop, currentTick) >= CROPS[crop.cropId].growthStages - 1;
}

export function cropAt(map: MapState, tileX: number, tileY: number): CropInstance | undefined {
  return map.crops.find((c) => c.tileX === tileX && c.tileY === tileY);
}

// Plants a crop on an empty plot. Returns the new instance, or undefined if occupied.
export function plant(
  map: MapState,
  cropId: CropId,
  mapId: MapId,
  tileX: number,
  tileY: number,
  currentTick: number,
): CropInstance | undefined {
  if (cropAt(map, tileX, tileY)) return undefined;
  const crop: CropInstance = { cropId, mapId, tileX, tileY, plantedTick: currentTick };
  map.crops.push(crop);
  return crop;
}

export function removeCrop(map: MapState, crop: CropInstance): void {
  map.crops = map.crops.filter((c) => c !== crop);
}
