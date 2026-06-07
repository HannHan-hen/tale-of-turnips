// Map registry. Layouts are data: tile dimensions, spawn point, plot grid, and the
// shipping box location. Coordinates are in tiles. Replace freely without touching systems.

import { MapId } from '../types/ids';

export const TILE = 32; // pixel size of one tile

export interface TilePos {
  x: number;
  y: number;
}

export interface MapDef {
  mapId: MapId;
  widthTiles: number;
  heightTiles: number;
  spawnTile: TilePos;
  plots: TilePos[]; // tillable plots
  shippingBoxTile: TilePos;
}

// A small 3x3 plot patch on the left, shipping box on the upper right.
function plotGrid(x0: number, y0: number, cols: number, rows: number): TilePos[] {
  const plots: TilePos[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      plots.push({ x: x0 + c, y: y0 + r });
    }
  }
  return plots;
}

export const MAPS: Record<MapId, MapDef> = {
  [MapId.Farm]: {
    mapId: MapId.Farm,
    widthTiles: 16,
    heightTiles: 12,
    spawnTile: { x: 8, y: 6 },
    plots: plotGrid(3, 4, 3, 3),
    shippingBoxTile: { x: 13, y: 2 },
  },
};

// Pixel center of a tile.
export function tileCenter(tile: TilePos): { x: number; y: number } {
  return { x: (tile.x + 0.5) * TILE, y: (tile.y + 0.5) * TILE };
}
