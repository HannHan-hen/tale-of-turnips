// Crop registry. Growth is deterministic and measured in in-game days: a crop is fully
// grown `growthDays` days after planting (one day is `Balance.dayLengthTicks` ticks). Its
// `growthStages` visual stages are spread evenly across that span. Tweak times/yields freely.

import { CropId, ItemId } from '../types/ids';

export interface CropDef {
  cropId: CropId;
  seedItem: ItemId;
  harvestItem: ItemId;
  growthStages: number; // total stages including the final mature stage
  growthDays: number; // in-game days from planting to fully grown
  harvestYield: number; // harvest items produced when collected
  displayName: string;
}

export const CROPS: Record<CropId, CropDef> = {
  [CropId.Turnip]: {
    cropId: CropId.Turnip,
    seedItem: ItemId.TurnipSeed,
    harvestItem: ItemId.Turnip,
    growthStages: 4,
    growthDays: 3,
    harvestYield: 2,
    displayName: 'Turnip',
  },
  [CropId.Carrot]: {
    cropId: CropId.Carrot,
    seedItem: ItemId.CarrotSeed,
    harvestItem: ItemId.Carrot,
    growthStages: 4,
    growthDays: 4,
    harvestYield: 2,
    displayName: 'Carrot',
  },
  [CropId.Radish]: {
    cropId: CropId.Radish,
    seedItem: ItemId.RadishSeed,
    harvestItem: ItemId.Radish,
    growthStages: 4,
    growthDays: 2,
    harvestYield: 2,
    displayName: 'Radish',
  },
};

// Display/selection order for the seed selector. New crops appear here.
// Basic starter (turnip) first, then the shop seeds (radish, carrot).
export const CROP_ORDER: CropId[] = [CropId.Turnip, CropId.Radish, CropId.Carrot];
