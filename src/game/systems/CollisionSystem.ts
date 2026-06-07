// Collision model. Solid object tiles are derived from map data (not hand-maintained), so a
// designer who places a chest, NPC, prop, cache, or bush automatically gets a tile the player
// can't walk through. Walkable-by-design things — plots, exits, the spawn, chickens — are
// deliberately left out. Pure data: the scene builds a grid once and PlayerController probes it.

import { TILE, type MapDef, type TilePos } from '../data/maps';

// Encoded tile key. Maps are far smaller than 1000 tiles wide, so this never collides.
function tileKey(tx: number, ty: number): number {
  return ty * 1000 + tx;
}

export type SolidGrid = Set<number>;

// The set of tiles the player cannot enter on this map. Exits and plots stay walkable so the
// player can stand on them to interact; chickens are left soft so the farm never feels fenced.
export function buildSolidGrid(def: MapDef): SolidGrid {
  const solids: SolidGrid = new Set();
  const block = (t: TilePos): void => void solids.add(tileKey(t.x, t.y));
  if (def.shippingBox) block(def.shippingBox);
  for (const chest of def.chests) block(chest.tile);
  for (const npc of def.npcs) block(npc.tile);
  for (const prop of def.props) block(prop.tile);
  for (const cache of def.caches) block(cache.tile);
  for (const bush of def.bushes) block(bush.tile);
  return solids;
}

// True if the pixel point falls on a solid tile.
export function isSolidAt(solids: SolidGrid, px: number, py: number): boolean {
  return solids.has(tileKey(Math.floor(px / TILE), Math.floor(py / TILE)));
}
