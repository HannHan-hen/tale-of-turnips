// Plain-data game state structures. These are independent of Phaser — no sprites here.
// Phaser scenes read/render these and call systems that mutate them.

import type { ArmorPieceId, CropId, ItemId, MapId, NpcId } from './ids';
import { InteractionKind } from './ids';

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
  // The in-game day each dungeon boss last eased the threat, keyed by enemy id. A boss only
  // lowers threat once per day, so re-running the dungeon the same day can't grind it down.
  // Optional so older saves (and the pure threat helpers, which only read ruinThreat) stay
  // valid; new games and migration always populate it.
  bossThreatDays?: Record<string, number>;
}

// Legendary pieces collected (auto-equipped on pickup).
export interface ArmorState {
  collectedPieces: ArmorPieceId[];
}

// Per-NPC affection (the village boy). Talk once/day, gift once/day.
export interface NpcAffectionState {
  npcId: string;
  points: number;
  lastTalkedDay: number;
  lastGiftedDay: number;
  giftedItemIds: ItemId[];
  milestones: string[]; // story beats already rewarded (e.g. 'set_complete')
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
  armor: ArmorState;
  affection: Record<string, NpcAffectionState>;
  bossDefeated: boolean;
  stats: Stats;
}

// Versioned save envelope written to localStorage.
export interface SaveData {
  version: number;
  state: GameState;
}

// Resolved by the interaction system: the thing the player is standing next to.
// A discriminated union keyed by `kind`, so each variant carries exactly the fields it
// needs — the type checker (not a runtime crash) catches a missing or wrong field.
interface TargetBase {
  x: number; // pixel center, for proximity tests
  y: number;
}
export type InteractionTarget =
  | (TargetBase & { kind: typeof InteractionKind.Plot; plotIndex: number })
  | (TargetBase & { kind: typeof InteractionKind.ShippingBox })
  | (TargetBase & { kind: typeof InteractionKind.Chest; chestId: string })
  | (TargetBase & { kind: typeof InteractionKind.Door; exitIndex: number })
  | (TargetBase & { kind: typeof InteractionKind.Npc; npcId: NpcId })
  | (TargetBase & { kind: typeof InteractionKind.Chicken; chickenId: string })
  | (TargetBase & { kind: typeof InteractionKind.Bush; bushId: string })
  | (TargetBase & { kind: typeof InteractionKind.Cache; cacheId: string; pieceId: ArmorPieceId });
