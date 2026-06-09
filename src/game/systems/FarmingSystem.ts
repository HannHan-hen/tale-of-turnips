// Farming logic. Deterministic crop growth based on the tick counter. No Phaser here —
// scenes read these results to choose which crop texture to show.

import { Balance } from '../data/balance';
import { CROPS, type CropDef } from '../data/crops';
import type { CropId, MapId } from '../types/ids';
import type { CropInstance, MapState } from '../types/models';

// Total ticks from planting to maturity, derived from the crop's day count and the day length.
export function ticksToMature(def: CropDef): number {
  return def.growthDays * Balance.dayLengthTicks;
}

// Current visual stage (0-based) of a crop at the given tick. The growth span is divided
// evenly into (growthStages - 1) steps; integer math keeps the maturity boundary exact.
export function growthStage(crop: CropInstance, currentTick: number): number {
  const def = CROPS[crop.cropId];
  const elapsed = Math.max(0, currentTick - crop.plantedTick);
  const steps = def.growthStages - 1;
  const stage = Math.floor((elapsed * steps) / ticksToMature(def));
  return Math.min(stage, def.growthStages - 1);
}

export function isMature(crop: CropInstance, currentTick: number): boolean {
  const def = CROPS[crop.cropId];
  return Math.max(0, currentTick - crop.plantedTick) >= ticksToMature(def);
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
