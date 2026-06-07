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
  [CropId.Carrot]: {
    cropId: CropId.Carrot,
    seedItem: ItemId.CarrotSeed,
    harvestItem: ItemId.Carrot,
    growthStages: 4,
    ticksPerStage: 4,
    harvestYield: 2,
    displayName: 'Carrot',
  },
  [CropId.Pumpkin]: {
    cropId: CropId.Pumpkin,
    seedItem: ItemId.PumpkinSeed,
    harvestItem: ItemId.Pumpkin,
    growthStages: 4,
    ticksPerStage: 6,
    harvestYield: 1,
    displayName: 'Pumpkin',
  },
};

// Display/selection order for the seed selector. New crops appear here.
export const CROP_ORDER: CropId[] = [CropId.Turnip, CropId.Carrot, CropId.Pumpkin];
