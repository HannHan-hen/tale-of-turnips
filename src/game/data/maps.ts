// Map registry. Layouts are data: tile dimensions, floor style, spawn point, plots,
// shipping box, chests, and exits. Coordinates are in tiles. Add maps here without
// touching the world scene (it renders whatever these definitions describe).

import { ChestId, MapId } from '../types/ids';

export const TILE = 32; // pixel size of one tile

export type FloorKind = 'grass' | 'wood';

export interface TilePos {
  x: number;
  y: number;
}

// A walkable tile that moves the player to another map when used.
export interface ExitDef {
  tile: TilePos; // the walkable tile the player interacts from
  toMap: MapId;
  toSpawn: TilePos; // spawn tile on the destination map
  label: string;
  art: 'cottage' | 'door'; // how the exit is drawn
}

export interface ChestPlacement {
  chestId: ChestId;
  tile: TilePos;
}

export interface MapDef {
  mapId: MapId;
  widthTiles: number;
  heightTiles: number;
  floor: FloorKind;
  wallThickness: number; // tiles of solid wall border (0 = open field)
  spawnTile: TilePos; // default spawn (new game / fallback)
  plots: TilePos[];
  shippingBox?: TilePos;
  chests: ChestPlacement[];
  exits: ExitDef[];
}

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
    floor: 'grass',
    wallThickness: 0,
    spawnTile: { x: 8, y: 6 },
    plots: plotGrid(3, 4, 3, 3),
    shippingBox: { x: 13, y: 2 },
    chests: [],
    exits: [
      { tile: { x: 3, y: 3 }, toMap: MapId.House, toSpawn: { x: 5, y: 7 }, label: 'Enter house', art: 'cottage' },
    ],
  },
  [MapId.House]: {
    mapId: MapId.House,
    widthTiles: 11,
    heightTiles: 9,
    floor: 'wood',
    wallThickness: 1,
    spawnTile: { x: 5, y: 7 },
    plots: [],
    chests: [{ chestId: ChestId.House, tile: { x: 3, y: 2 } }],
    exits: [
      { tile: { x: 5, y: 7 }, toMap: MapId.Farm, toSpawn: { x: 3, y: 3 }, label: 'Leave', art: 'door' },
    ],
  },
};

// Pixel center of a tile.
export function tileCenter(tile: TilePos): { x: number; y: number } {
  return { x: (tile.x + 0.5) * TILE, y: (tile.y + 0.5) * TILE };
}
