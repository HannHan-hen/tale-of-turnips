// Crop registry. Growth is deterministic: a crop advances one visual stage every
// `ticksPerStage` ticks, capping at the final (mature) stage. Tweak times/yields freely.

import { CropId, ItemId } from '../types/ids';

export interface CropDef {
  cropId: CropId;
  seedItem: ItemId;
  harvestItem: ItemId;
  growthStages: number; // total stages including the final mature stage
  ticksPerStage: number; // ticks to advance one stage
  harvestYield: number; // harvest items produced when collected
  displayName: string;
}

export const CROPS: Record<CropId, CropDef> = {
  [CropId.Turnip]: {
    cropId: CropId.Turnip,
    seedItem: ItemId.TurnipSeed,
    harvestItem: ItemId.Turnip,
    growthStages: 4,
    ticksPerStage: 3,
    harvestYield: 2,
    displayName: 'Turnip',
  },
};
