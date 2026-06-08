// Map registry. Layouts are data: tile dimensions, floor style, spawn point, plots,
// shipping box, chests, and exits. Coordinates are in tiles. Add maps here without
// touching the world scene (it renders whatever these definitions describe).

import { ArmorPieceId, ChestId, EnemyId, MapId, NpcId } from '../types/ids';

export const TILE = 32; // pixel size of one tile

export type FloorKind = 'grass' | 'wood' | 'stone';

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
  art: 'cottage' | 'door' | 'signpost' | 'sealed'; // how the exit is drawn
  requiresSet?: boolean; // only passable with the full legendary set
}

export interface ChestPlacement {
  chestId: ChestId;
  tile: TilePos;
}

export interface NpcPlacement {
  npcId: NpcId;
  tile: TilePos;
}

export interface EnemySpawn {
  enemyId: EnemyId;
  tile: TilePos;
}

// A one-time cache holding a legendary piece (considered opened once the piece is owned).
export interface CachePlacement {
  id: string;
  pieceId: ArmorPieceId;
  tile: TilePos;
}

// Purely decorative scenery (no interaction).
export type PropArt = 'stall' | 'anvil' | 'rubble' | 'tree';

export interface PropPlacement {
  art: PropArt;
  tile: TilePos;
}

export interface ChickenPlacement {
  id: string;
  tile: TilePos;
}

export interface BushPlacement {
  id: string;
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
  npcs: NpcPlacement[];
  props: PropPlacement[];
  chickens: ChickenPlacement[];
  bushes: BushPlacement[];
  enemySpawns: EnemySpawn[];
  caches: CachePlacement[];
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
    // 3x3 grid of fields, one grass tile south of the house so the farmhouse and the fields
    // don't crowd each other.
    plots: plotGrid(3, 4, 3, 3),
    shippingBox: { x: 13, y: 2 },
    chests: [],
    npcs: [],
    props: [],
    chickens: [{ id: 'hen_1', tile: { x: 6, y: 2 } }],
    bushes: [],
    enemySpawns: [],
    caches: [],
    exits: [
      {
        tile: { x: 3, y: 2 },
        toMap: MapId.House,
        toSpawn: { x: 5, y: 7 },
        label: 'Enter house',
        art: 'cottage',
      },
      {
        tile: { x: 14, y: 6 },
        toMap: MapId.Village,
        toSpawn: { x: 1, y: 5 },
        label: 'To village',
        art: 'signpost',
      },
      {
        tile: { x: 8, y: 11 },
        toMap: MapId.Forest,
        toSpawn: { x: 7, y: 1 },
        label: 'To forest',
        art: 'signpost',
      },
      {
        tile: { x: 1, y: 8 },
        toMap: MapId.Ruins,
        toSpawn: { x: 6, y: 10 },
        label: 'To ruins',
        art: 'signpost',
      },
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
    npcs: [],
    props: [],
    chickens: [],
    bushes: [],
    enemySpawns: [],
    caches: [],
    exits: [
      { tile: { x: 5, y: 7 }, toMap: MapId.Farm, toSpawn: { x: 3, y: 2 }, label: 'Leave', art: 'door' },
    ],
  },
  [MapId.Village]: {
    mapId: MapId.Village,
    widthTiles: 15,
    heightTiles: 10,
    floor: 'grass',
    wallThickness: 0,
    spawnTile: { x: 7, y: 8 },
    plots: [],
    chests: [],
    npcs: [
      { npcId: NpcId.SeedSeller, tile: { x: 4, y: 5 } },
      { npcId: NpcId.Blacksmith, tile: { x: 10, y: 5 } },
      { npcId: NpcId.Hint, tile: { x: 7, y: 3 } },
      { npcId: NpcId.Jay, tile: { x: 2, y: 6 } }, // by the gate to the farm
    ],
    props: [
      { art: 'stall', tile: { x: 4, y: 4 } },
      { art: 'anvil', tile: { x: 11, y: 5 } },
    ],
    chickens: [],
    bushes: [],
    enemySpawns: [],
    caches: [],
    exits: [
      {
        tile: { x: 1, y: 5 },
        toMap: MapId.Farm,
        toSpawn: { x: 13, y: 6 },
        label: 'To farm',
        art: 'signpost',
      },
    ],
  },
  [MapId.Ruins]: {
    mapId: MapId.Ruins,
    widthTiles: 13,
    heightTiles: 12,
    floor: 'stone',
    wallThickness: 1,
    spawnTile: { x: 6, y: 10 },
    plots: [],
    chests: [],
    npcs: [],
    props: [
      { art: 'rubble', tile: { x: 3, y: 4 } },
      { art: 'rubble', tile: { x: 9, y: 3 } },
      { art: 'rubble', tile: { x: 7, y: 6 } },
    ],
    chickens: [],
    bushes: [],
    enemySpawns: [
      { enemyId: EnemyId.RuinMite, tile: { x: 4, y: 5 } },
      { enemyId: EnemyId.RuinMite, tile: { x: 8, y: 6 } },
      { enemyId: EnemyId.ShadePup, tile: { x: 6, y: 3 } },
    ],
    caches: [
      { id: 'cache_helm', pieceId: ArmorPieceId.Helm, tile: { x: 2, y: 2 } },
      { id: 'cache_plate', pieceId: ArmorPieceId.Plate, tile: { x: 10, y: 2 } },
      { id: 'cache_gauntlets', pieceId: ArmorPieceId.Gauntlets, tile: { x: 2, y: 8 } },
      { id: 'cache_greaves', pieceId: ArmorPieceId.Greaves, tile: { x: 10, y: 8 } },
      { id: 'cache_blade', pieceId: ArmorPieceId.Blade, tile: { x: 6, y: 5 } },
    ],
    exits: [
      {
        tile: { x: 6, y: 10 },
        toMap: MapId.Farm,
        toSpawn: { x: 1, y: 8 },
        label: 'Leave ruins',
        art: 'signpost',
      },
      {
        tile: { x: 6, y: 1 },
        toMap: MapId.BossArena,
        toSpawn: { x: 5, y: 9 },
        label: 'Sealed door',
        art: 'sealed',
        requiresSet: true,
      },
    ],
  },
  [MapId.Forest]: {
    mapId: MapId.Forest,
    widthTiles: 14,
    heightTiles: 12,
    floor: 'grass',
    wallThickness: 0,
    spawnTile: { x: 7, y: 1 },
    plots: [],
    chests: [],
    npcs: [],
    props: [
      { art: 'tree', tile: { x: 1, y: 2 } },
      { art: 'tree', tile: { x: 3, y: 2 } },
      { art: 'tree', tile: { x: 11, y: 2 } },
      { art: 'tree', tile: { x: 12, y: 3 } },
      { art: 'tree', tile: { x: 1, y: 7 } },
      { art: 'tree', tile: { x: 2, y: 9 } },
      { art: 'tree', tile: { x: 12, y: 7 } },
      { art: 'tree', tile: { x: 11, y: 9 } },
    ],
    chickens: [],
    // Two clusters of three berry bushes, tucked among the trees on opposite sides of the map.
    // Each bush has at least one empty tile around it so the clusters feel roomier.
    bushes: [
      { id: 'forest_bush_1', tile: { x: 3, y: 4 } },
      { id: 'forest_bush_2', tile: { x: 5, y: 4 } },
      { id: 'forest_bush_3', tile: { x: 3, y: 6 } },
      { id: 'forest_bush_4', tile: { x: 9, y: 6 } },
      { id: 'forest_bush_5', tile: { x: 11, y: 6 } },
      { id: 'forest_bush_6', tile: { x: 9, y: 8 } },
    ],
    enemySpawns: [],
    caches: [],
    exits: [
      {
        tile: { x: 7, y: 1 },
        toMap: MapId.Farm,
        toSpawn: { x: 8, y: 11 },
        label: 'To farm',
        art: 'signpost',
      },
    ],
  },
  [MapId.BossArena]: {
    mapId: MapId.BossArena,
    widthTiles: 11,
    heightTiles: 11,
    floor: 'stone',
    wallThickness: 1,
    spawnTile: { x: 5, y: 9 },
    plots: [],
    chests: [],
    npcs: [],
    props: [
      { art: 'rubble', tile: { x: 2, y: 3 } },
      { art: 'rubble', tile: { x: 8, y: 3 } },
    ],
    chickens: [],
    bushes: [],
    enemySpawns: [{ enemyId: EnemyId.RuinHeart, tile: { x: 5, y: 3 } }],
    caches: [],
    exits: [
      { tile: { x: 5, y: 9 }, toMap: MapId.Ruins, toSpawn: { x: 6, y: 1 }, label: 'Retreat', art: 'door' },
    ],
  },
};

// Pixel center of a tile.
export function tileCenter(tile: TilePos): { x: number; y: number } {
  return { x: (tile.x + 0.5) * TILE, y: (tile.y + 0.5) * TILE };
}
