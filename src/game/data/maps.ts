// Map registry. Layouts are data: tile dimensions, floor style, spawn point, plots,
// shipping box, chests, and exits. Coordinates are in tiles. Add maps here without
// touching the world scene (it renders whatever these definitions describe).

import { ArmorPieceId, ChestId, EnemyId, MapId, NpcId } from '../types/ids';

// The world tile size now derives from the global SCALE knob (see data/scale.ts). Imported for
// local use and re-exported so the many existing `import { TILE } from '../data/maps'` call
// sites keep working.
import { TILE } from './scale';
export { TILE };

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
  requiresClear?: boolean; // locked until every enemy in the room is defeated this visit
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
  requiresClear?: boolean; // a boss-reward chest: locked until the room's boss is defeated
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

// The ruins are a six-room dungeon, and every room reuses one stone-chamber layout: a 13x12
// walled room, entered from the south (the spawn / back door) and leading north through a
// forward door that stays locked until the room is cleared. Only the contents differ —
// enemies, an optional boss-reward chest, and where the doors lead. Designers tweak a room by
// editing one entry below, not the renderer.
const RUIN_PROPS: PropPlacement[] = [
  { art: 'rubble', tile: { x: 2, y: 3 } },
  { art: 'rubble', tile: { x: 10, y: 8 } },
];

function ruinRoom(spec: {
  mapId: MapId;
  enemySpawns: EnemySpawn[];
  caches?: CachePlacement[];
  back: { toMap: MapId; toSpawn: TilePos; label: string; art: 'door' | 'signpost' };
  forward?: MapId; // the next room (forward door, locked until this room is cleared)
}): MapDef {
  const exits: ExitDef[] = [
    {
      tile: { x: 6, y: 10 },
      toMap: spec.back.toMap,
      toSpawn: spec.back.toSpawn,
      label: spec.back.label,
      art: spec.back.art,
    },
  ];
  if (spec.forward) {
    exits.push({
      tile: { x: 6, y: 1 },
      toMap: spec.forward,
      toSpawn: { x: 6, y: 10 },
      label: 'Deeper into the ruins',
      art: 'door',
      requiresClear: true,
    });
  }
  return {
    mapId: spec.mapId,
    widthTiles: 13,
    heightTiles: 12,
    floor: 'stone',
    wallThickness: 1,
    spawnTile: { x: 6, y: 10 },
    plots: [],
    shippingBox: undefined,
    chests: [],
    npcs: [],
    props: RUIN_PROPS,
    chickens: [],
    bushes: [],
    enemySpawns: spec.enemySpawns,
    caches: spec.caches ?? [],
    exits,
  };
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
  // Room 1 — the entrance. Three mites bar the forward door.
  [MapId.Ruins]: ruinRoom({
    mapId: MapId.Ruins,
    back: { toMap: MapId.Farm, toSpawn: { x: 1, y: 8 }, label: 'Leave ruins', art: 'signpost' },
    forward: MapId.Ruins2,
    enemySpawns: [
      { enemyId: EnemyId.RuinMite, tile: { x: 4, y: 5 } },
      { enemyId: EnemyId.RuinMite, tile: { x: 8, y: 5 } },
      { enemyId: EnemyId.ShadePup, tile: { x: 6, y: 4 } },
    ],
  }),
  // Room 2 — the Ruin Warden guards a reward chest (the Starless Gauntlets).
  [MapId.Ruins2]: ruinRoom({
    mapId: MapId.Ruins2,
    back: { toMap: MapId.Ruins, toSpawn: { x: 6, y: 10 }, label: 'Back', art: 'door' },
    forward: MapId.Ruins3,
    enemySpawns: [{ enemyId: EnemyId.RuinWarden, tile: { x: 6, y: 5 } }],
    caches: [
      { id: 'cache_warden', pieceId: ArmorPieceId.Gauntlets, tile: { x: 3, y: 3 }, requiresClear: true },
    ],
  }),
  // Room 3 — six foes.
  [MapId.Ruins3]: ruinRoom({
    mapId: MapId.Ruins3,
    back: { toMap: MapId.Ruins2, toSpawn: { x: 6, y: 10 }, label: 'Back', art: 'door' },
    forward: MapId.Ruins4,
    enemySpawns: [
      { enemyId: EnemyId.RuinMite, tile: { x: 3, y: 5 } },
      { enemyId: EnemyId.RuinMite, tile: { x: 6, y: 5 } },
      { enemyId: EnemyId.RuinMite, tile: { x: 9, y: 5 } },
      { enemyId: EnemyId.ShadePup, tile: { x: 4, y: 7 } },
      { enemyId: EnemyId.ShadePup, tile: { x: 8, y: 7 } },
      { enemyId: EnemyId.ShadePup, tile: { x: 6, y: 3 } },
    ],
  }),
  // Room 4 — the Ruin Colossus guards a reward chest (the Starless Greaves).
  [MapId.Ruins4]: ruinRoom({
    mapId: MapId.Ruins4,
    back: { toMap: MapId.Ruins3, toSpawn: { x: 6, y: 10 }, label: 'Back', art: 'door' },
    forward: MapId.Ruins5,
    enemySpawns: [{ enemyId: EnemyId.RuinColossus, tile: { x: 6, y: 5 } }],
    caches: [
      { id: 'cache_colossus', pieceId: ArmorPieceId.Greaves, tile: { x: 9, y: 3 }, requiresClear: true },
    ],
  }),
  // Room 5 — nine foes, the last gauntlet before the heart.
  [MapId.Ruins5]: ruinRoom({
    mapId: MapId.Ruins5,
    back: { toMap: MapId.Ruins4, toSpawn: { x: 6, y: 10 }, label: 'Back', art: 'door' },
    forward: MapId.Ruins6,
    enemySpawns: [
      { enemyId: EnemyId.RuinMite, tile: { x: 3, y: 5 } },
      { enemyId: EnemyId.RuinMite, tile: { x: 6, y: 5 } },
      { enemyId: EnemyId.RuinMite, tile: { x: 9, y: 5 } },
      { enemyId: EnemyId.ShadePup, tile: { x: 3, y: 7 } },
      { enemyId: EnemyId.ShadePup, tile: { x: 6, y: 7 } },
      { enemyId: EnemyId.ShadePup, tile: { x: 9, y: 7 } },
      { enemyId: EnemyId.ShadePup, tile: { x: 4, y: 4 } },
      { enemyId: EnemyId.ShadePup, tile: { x: 6, y: 3 } },
      { enemyId: EnemyId.ShadePup, tile: { x: 8, y: 4 } },
    ],
  }),
  // Room 6 — the final chamber. No chest; defeating the Ruin Heart ends the game.
  [MapId.Ruins6]: ruinRoom({
    mapId: MapId.Ruins6,
    back: { toMap: MapId.Ruins5, toSpawn: { x: 6, y: 10 }, label: 'Retreat', art: 'door' },
    enemySpawns: [{ enemyId: EnemyId.RuinHeart, tile: { x: 6, y: 5 } }],
  }),
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
};

// Pixel center of a tile.
export function tileCenter(tile: TilePos): { x: number; y: number } {
  return { x: (tile.x + 0.5) * TILE, y: (tile.y + 0.5) * TILE };
}
