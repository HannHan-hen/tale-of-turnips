import { describe, expect, it } from 'vitest';
import { buildSolidGrid, isSolidAt } from '../src/game/systems/CollisionSystem';
import { movePlayer, type Bounds } from '../src/game/systems/PlayerController';
import { MAPS, TILE, tileCenter } from '../src/game/data/maps';
import { MapId } from '../src/game/types/ids';
import type { PlayerState } from '../src/game/types/models';

const wideBounds: Bounds = { minX: 0, minY: 0, maxX: 1000, maxY: 1000 };

function makePlayer(x: number, y: number): PlayerState {
  return {
    mapId: MapId.Farm,
    x,
    y,
    facing: 'down',
    gold: 0,
    hp: 5,
    maxHp: 5,
    inventory: { slots: [], capacity: 1 },
    selectedCropId: 'turnip',
  } as PlayerState;
}

describe('CollisionSystem', () => {
  it('marks object tiles solid but leaves plots, exits, and spawn walkable', () => {
    const farm = MAPS[MapId.Farm];
    const solids = buildSolidGrid(farm);
    const box = tileCenter(farm.shippingBox!);
    expect(isSolidAt(solids, box.x, box.y)).toBe(true);

    const plot = tileCenter(farm.plots[0]);
    expect(isSolidAt(solids, plot.x, plot.y)).toBe(false);

    const exit = tileCenter(farm.exits[0].tile);
    expect(isSolidAt(solids, exit.x, exit.y)).toBe(false);

    const spawn = tileCenter(farm.spawnTile);
    expect(isSolidAt(solids, spawn.x, spawn.y)).toBe(false);
  });

  it('includes bush tiles in the solid grid', () => {
    const farm = MAPS[MapId.Farm];
    const solids = buildSolidGrid(farm);
    const bush = tileCenter(farm.bushes[0].tile);
    expect(isSolidAt(solids, bush.x, bush.y)).toBe(true);
  });
});

describe('movePlayer with collision', () => {
  it('blocks movement into a solid tile on that axis', () => {
    const player = makePlayer(100, 100);
    movePlayer(player, { x: 1, y: 0 }, 100, 1, wideBounds, (x) => x >= 120);
    expect(player.x).toBe(100); // blocked
  });

  it('slides along a wall: blocked axis holds, free axis moves', () => {
    const player = makePlayer(100, 100);
    // A vertical wall to the right (solid when x >= 120). Move down-right.
    movePlayer(player, { x: 1, y: 1 }, 100, 1, wideBounds, (x) => x >= 120);
    expect(player.x).toBe(100); // horizontal blocked
    expect(player.y).toBe(200); // vertical slides through
  });

  it('moves freely when no collision predicate is supplied', () => {
    const player = makePlayer(100, 100);
    movePlayer(player, { x: 1, y: 0 }, 50, 1, wideBounds);
    expect(player.x).toBe(150);
  });

  it('keeps tiles within one map distinct (encoding does not collide)', () => {
    const solids = buildSolidGrid(MAPS[MapId.Ruins]);
    // Two different cache tiles must both register without aliasing.
    expect(isSolidAt(solids, 2 * TILE + 1, 2 * TILE + 1)).toBe(true);
    expect(isSolidAt(solids, 10 * TILE + 1, 8 * TILE + 1)).toBe(true);
    expect(isSolidAt(solids, 5 * TILE + 1, 5 * TILE + 1)).toBe(false); // open floor
  });
});
