import { describe, expect, it } from 'vitest';
import { CROPS } from '../src/game/data/crops';
import { ITEMS } from '../src/game/data/items';
import { ENEMIES } from '../src/game/data/enemies';
import { NPCS } from '../src/game/data/npcs';
import { SHOPS } from '../src/game/data/shops';
import { MAPS, tileCenter, type MapDef, type TilePos } from '../src/game/data/maps';
import { buildSolidGrid, isSolidAt } from '../src/game/systems/CollisionSystem';
import { MapId } from '../src/game/types/ids';

const ALL_MAPS = Object.values(MAPS);

function inBounds(def: MapDef, tile: TilePos): boolean {
  return tile.x >= 0 && tile.y >= 0 && tile.x < def.widthTiles && tile.y < def.heightTiles;
}

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

describe('every map is well-formed', () => {
  it('keeps all placements within map bounds', () => {
    for (const def of ALL_MAPS) {
      const tiles: TilePos[] = [
        def.spawnTile,
        ...def.plots,
        ...(def.shippingBox ? [def.shippingBox] : []),
        ...def.chests.map((c) => c.tile),
        ...def.npcs.map((n) => n.tile),
        ...def.props.map((p) => p.tile),
        ...def.chickens.map((c) => c.tile),
        ...def.bushes.map((b) => b.tile),
        ...def.caches.map((c) => c.tile),
        ...def.enemySpawns.map((e) => e.tile),
        ...def.exits.map((e) => e.tile),
      ];
      for (const tile of tiles) {
        expect(inBounds(def, tile), `${def.mapId} placement (${tile.x},${tile.y})`).toBe(true);
      }
    }
  });

  it('points every exit at a real map with an in-bounds destination spawn', () => {
    for (const def of ALL_MAPS) {
      for (const exit of def.exits) {
        const dest = MAPS[exit.toMap];
        expect(dest, `${def.mapId} exit to ${exit.toMap}`).toBeDefined();
        expect(inBounds(dest, exit.toSpawn)).toBe(true);
      }
    }
  });

  it('references only registered npcs, shops, and enemies', () => {
    for (const def of ALL_MAPS) {
      for (const npc of def.npcs) {
        const npcDef = NPCS[npc.npcId];
        expect(npcDef, `npc ${npc.npcId}`).toBeDefined();
        if (npcDef.shopId) expect(SHOPS[npcDef.shopId], `shop ${npcDef.shopId}`).toBeDefined();
      }
      for (const spawn of def.enemySpawns) {
        expect(ENEMIES[spawn.enemyId], `enemy ${spawn.enemyId}`).toBeDefined();
      }
    }
  });

  it('keeps chest, cache, chicken, and bush ids globally unique', () => {
    const ids: string[] = [];
    for (const def of ALL_MAPS) {
      for (const c of def.chests) ids.push(c.chestId);
      for (const c of def.caches) ids.push(c.id);
      for (const c of def.chickens) ids.push(c.id);
      for (const b of def.bushes) ids.push(b.id);
    }
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps forest berry bushes separated by at least one empty tile', () => {
    const forest = MAPS[MapId.Forest];
    for (let i = 0; i < forest.bushes.length; i++) {
      for (let j = i + 1; j < forest.bushes.length; j++) {
        const a = forest.bushes[i].tile;
        const b = forest.bushes[j].tile;
        expect(
          Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y)),
          `${forest.bushes[i].id} and ${forest.bushes[j].id} are too close`,
        ).toBeGreaterThan(1);
      }
    }
  });

  it('sends the farm-to-village transition to the village left edge', () => {
    const farmToVillage = MAPS[MapId.Farm].exits.find((exit) => exit.toMap === MapId.Village);
    expect(farmToVillage).toBeDefined();
    expect(farmToVillage!.toSpawn.x).toBe(1);
  });

  it('never spawns the player or an exit tile on a solid object', () => {
    for (const def of ALL_MAPS) {
      const solids = buildSolidGrid(def);
      const spawn = tileCenter(def.spawnTile);
      expect(isSolidAt(solids, spawn.x, spawn.y), `${def.mapId} spawn is solid`).toBe(false);
      for (const exit of def.exits) {
        const c = tileCenter(exit.tile);
        expect(isSolidAt(solids, c.x, c.y), `${def.mapId} exit tile is solid`).toBe(false);
      }
    }
  });
});
