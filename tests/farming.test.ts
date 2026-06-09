import { describe, expect, it } from 'vitest';
import { CROPS } from '../src/game/data/crops';
import { CropId, MapId } from '../src/game/types/ids';
import type { MapState } from '../src/game/types/models';
import {
  cropAt,
  growthStage,
  isMature,
  plant,
  removeCrop,
  ticksToMature,
} from '../src/game/systems/FarmingSystem';

function emptyMap(): MapState {
  return { mapId: MapId.Farm, crops: [] };
}

describe('FarmingSystem', () => {
  it('advances growth stage deterministically and caps at mature', () => {
    const map = emptyMap();
    const crop = plant(map, CropId.Turnip, MapId.Farm, 1, 1, 0)!;
    const def = CROPS[CropId.Turnip];
    const ticksPerStage = ticksToMature(def) / (def.growthStages - 1);

    expect(growthStage(crop, 0)).toBe(0);
    expect(growthStage(crop, ticksPerStage)).toBe(1);
    const matureTick = ticksToMature(def);
    expect(growthStage(crop, matureTick)).toBe(def.growthStages - 1);
    expect(growthStage(crop, matureTick + 999)).toBe(def.growthStages - 1);
  });

  it('reports maturity correctly', () => {
    const map = emptyMap();
    const crop = plant(map, CropId.Turnip, MapId.Farm, 2, 2, 0)!;
    expect(isMature(crop, 0)).toBe(false);
    const matureTick = ticksToMature(CROPS[CropId.Turnip]);
    expect(isMature(crop, matureTick)).toBe(true);
    expect(isMature(crop, matureTick - 1)).toBe(false);
  });

  it('does not plant on an occupied plot and finds/removes crops by tile', () => {
    const map = emptyMap();
    expect(plant(map, CropId.Turnip, MapId.Farm, 3, 3, 0)).toBeDefined();
    expect(plant(map, CropId.Turnip, MapId.Farm, 3, 3, 0)).toBeUndefined();

    const found = cropAt(map, 3, 3)!;
    expect(found).toBeDefined();
    removeCrop(map, found);
    expect(cropAt(map, 3, 3)).toBeUndefined();
  });
});
