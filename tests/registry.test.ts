import { describe, expect, it } from 'vitest';
import { CROPS } from '../src/game/data/crops';
import { ITEMS } from '../src/game/data/items';
import { MAPS } from '../src/game/data/maps';
import { MapId } from '../src/game/types/ids';

describe('data registries are internally consistent', () => {
  it('every item has a display name, positive max stack, and an icon key', () => {
    for (const item of Object.values(ITEMS)) {
      expect(item.displayName.length).toBeGreaterThan(0);
      expect(item.maxStack).toBeGreaterThan(0);
      expect(item.iconKey.length).toBeGreaterThan(0);
      if (item.sellPrice !== undefined) expect(item.sellPrice).toBeGreaterThan(0);
    }
  });

  it('every crop references real seed and harvest items and has valid growth', () => {
    for (const crop of Object.values(CROPS)) {
      expect(ITEMS[crop.seedItem]).toBeDefined();
      expect(ITEMS[crop.harvestItem]).toBeDefined();
      expect(crop.growthStages).toBeGreaterThanOrEqual(2);
      expect(crop.ticksPerStage).toBeGreaterThan(0);
      expect(crop.harvestYield).toBeGreaterThan(0);
    }
  });

  it('the farm map has plots and a spawn within bounds', () => {
    const farm = MAPS[MapId.Farm];
    expect(farm.plots.length).toBeGreaterThan(0);
    expect(farm.spawnTile.x).toBeGreaterThanOrEqual(0);
    expect(farm.spawnTile.x).toBeLessThan(farm.widthTiles);
    expect(farm.spawnTile.y).toBeLessThan(farm.heightTiles);
    for (const plot of farm.plots) {
      expect(plot.x).toBeLessThan(farm.widthTiles);
      expect(plot.y).toBeLessThan(farm.heightTiles);
    }
  });
});
