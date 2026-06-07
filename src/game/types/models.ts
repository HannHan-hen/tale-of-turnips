// Plain-data game state structures. These are independent of Phaser — no sprites here.
// Phaser scenes read/render these and call systems that mutate them.

import type { CropId, InteractionKind, ItemId, MapId } from './ids';

// A petable chicken. Position comes from map data; this tracks the daily pet.
export interface ChickenState {
  id: string;
  lastPettedDay: number;
}

// A foragable bush. Ready to harvest when the current tick >= readyTick.
export interface BushState {
  id: string;
  readyTick: number;
}

export interface ItemStack {
  itemId: ItemId;
  count: number;
}

// Shared by the player's backpack and chests — one storage model everywhere.
export interface Inventory {
  slots: ItemStack[];
  capacity: number;
}

export type Facing = 'up' | 'down' | 'left' | 'right';

// A planted crop. Position is stored in tile coordinates (matches a map plot).
export interface CropInstance {
  cropId: CropId;
  mapId: MapId;
  tileX: number;
  tileY: number;
  plantedTick: number;
}

export interface PlayerState {
  mapId: MapId;
  x: number; // pixel position (center)
  y: number;
  facing: Facing;
  gold: number;
  hp: number; // current hearts
  maxHp: number; // maximum hearts
  inventory: Inventory;
  selectedCropId: CropId; // which seed planting uses
}

export interface MapState {
  mapId: MapId;
  crops: CropInstance[];
}

// A stored chest. Uses the same Inventory model as the backpack.
export interface ChestState {
  id: string;
  inventory: Inventory;
}

export interface TimeState {
  tick: number;
  day: number;
}

// Pressure from the ruins. Rises daily (after a grace period), falls as monsters are
// defeated; above a threshold, raiders appear on the farm.
export interface ThreatState {
  ruinThreat: number;
}

// Lightweight run stats, surfaced on the (future) ending screen.
export interface Stats {
  cropsHarvested: number;
  chickensPetted: number;
  monstersDefeated: number;
}

export interface GameState {
  player: PlayerState;
  maps: Record<string, MapState>;
  chests: Record<string, ChestState>;
  chickens: Record<string, ChickenState>;
  bushes: Record<string, BushState>;
  time: TimeState;
  threat: ThreatState;
  stats: Stats;
}

// Versioned save envelope written to localStorage.
export interface SaveData {
  version: number;
  state: GameState;
}

// Resolved by the interaction system: the thing the player is standing next to.
export interface InteractionTarget {
  kind: InteractionKind;
  x: number; // pixel center, for proximity tests
  y: number;
  plotIndex?: number; // set when kind === Plot
  chestId?: string; // set when kind === Chest
  exitIndex?: number; // set when kind === Door
  npcId?: string; // set when kind === Npc
  chickenId?: string; // set when kind === Chicken
  bushId?: string; // set when kind === Bush
}
