// Plant/harvest rules for a single plot. The scene supplies which plot was used and renders
// the outcome (sprites, toasts); the decision — seeds available? mature? room in the bag? —
// lives here as pure logic so it can be unit-tested without Phaser.

import { CROPS, type CropDef } from '../data/crops';
import type { MapDef } from '../data/maps';
import type { GameState, CropInstance } from '../types/models';
import { cropAt, isMature, plant, removeCrop } from './FarmingSystem';
import { add, remove } from './InventorySystem';

export type PlotResult =
  | { kind: 'planted'; crop: CropInstance; cropDef: CropDef }
  | { kind: 'no_seeds'; cropDef: CropDef }
  | { kind: 'growing' }
  | { kind: 'harvested'; crop: CropInstance; cropDef: CropDef; amount: number }
  | { kind: 'inventory_full' };

// Resolves a plot interaction, mutating inventory/crops/stats. Returns what happened so the
// caller can update the matching sprite and show a message.
export function usePlot(
  state: GameState,
  mapDef: MapDef,
  plotIndex: number,
  tick: number,
  bonusYield: number,
): PlotResult {
  const map = state.maps[mapDef.mapId];
  const inv = state.player.inventory;
  const plot = mapDef.plots[plotIndex];
  const crop = cropAt(map, plot.x, plot.y);

  if (!crop) {
    const cropDef = CROPS[state.player.selectedCropId];
    if (!remove(inv, cropDef.seedItem, 1)) return { kind: 'no_seeds', cropDef };
    const planted = plant(map, cropDef.cropId, mapDef.mapId, plot.x, plot.y, tick);
    // plant() only fails on an occupied tile, which we've already ruled out.
    return { kind: 'planted', crop: planted!, cropDef };
  }

  if (!isMature(crop, tick)) return { kind: 'growing' };

  const cropDef = CROPS[crop.cropId];
  const amount = cropDef.harvestYield + bonusYield;
  if (!add(inv, cropDef.harvestItem, amount)) return { kind: 'inventory_full' };
  removeCrop(map, crop);
  state.stats.cropsHarvested += amount;
  return { kind: 'harvested', crop, cropDef, amount };
}
