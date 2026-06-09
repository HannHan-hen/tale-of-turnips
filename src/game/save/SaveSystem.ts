// The ONLY place that touches localStorage. Versioned saves with graceful migration:
// invalid or unreadable saves fall back to a new game so the player is never stuck.

import { Balance } from '../data/balance';
import { MAPS } from '../data/maps';
import { NPCS } from '../data/npcs';
import { createInventory } from '../systems/InventorySystem';
import { createAffection } from '../systems/AffectionSystem';
import { createNewGameState } from '../state/newGameState';
import { CropId, MapId } from '../types/ids';
import type { GameState, SaveData } from '../types/models';

export const SAVE_KEY = 'tale-of-turnips/save';
const LEGACY_SAVE_KEY = 'story-of-turnips/save';
export const SAVE_VERSION = 1;

function storage(): Storage | undefined {
  return typeof globalThis !== 'undefined' ? globalThis.localStorage : undefined;
}

// Validates and upgrades raw parsed save data to the current version.
// Returns null if the data is too broken to trust (caller starts a new game).
export function migrate(data: unknown): SaveData | null {
  if (!data || typeof data !== 'object') return null;
  const candidate = data as Partial<SaveData>;
  if (typeof candidate.version !== 'number' || !candidate.state) return null;

  const state = candidate.state as Partial<GameState>;
  // Player and time are essential; maps/chests are reconstructed below if absent.
  if (!state.player || !state.time) return null;

  // Fill fields that may be missing in older saves rather than discarding the save.
  state.stats ??= { cropsHarvested: 0, chickensPetted: 0, monstersDefeated: 0 };
  state.stats.cropsHarvested ??= 0;
  state.stats.chickensPetted ??= 0;
  state.stats.monstersDefeated ??= 0;
  if (!state.player.inventory) {
    state.player.inventory = { slots: [], capacity: Balance.inventoryCapacity };
  }
  state.player.inventory.capacity ??= Balance.inventoryCapacity;
  state.player.inventory.slots ??= [];
  state.player.selectedCropId ??= CropId.Turnip;
  state.player.maxHp ??= Balance.playerMaxHp;
  state.player.hp ??= state.player.maxHp;
  state.threat ??= { ruinThreat: 0, bossThreatDays: {} };
  state.threat.ruinThreat ??= 0;
  state.threat.bossThreatDays ??= {};
  state.armor ??= { collectedPieces: [] };
  state.armor.collectedPieces ??= [];
  state.affection ??= {};
  for (const npc of Object.values(NPCS)) {
    if (npc.romance) state.affection[npc.npcId] ??= createAffection(npc.npcId);
  }
  state.firstBossDefeated ??= false;
  state.bossDefeated ??= false;

  // Ensure every registered map, chest, chicken, and bush exists, so saves from before an
  // entry was added still load (the new ones simply start empty/fresh).
  state.maps ??= {};
  state.chests ??= {};
  state.chickens ??= {};
  state.bushes ??= {};
  for (const def of Object.values(MAPS)) {
    state.maps[def.mapId] ??= { mapId: def.mapId, crops: [] };
    for (const placement of def.chests) {
      state.chests[placement.chestId] ??= {
        id: placement.chestId,
        inventory: createInventory(Balance.chestCapacity),
      };
    }
    for (const hen of def.chickens) state.chickens[hen.id] ??= { id: hen.id, lastPettedDay: 0 };
    for (const bush of def.bushes) state.bushes[bush.id] ??= { id: bush.id, readyTick: 0 };
  }

  // Recover gracefully if the player was saved on a map that no longer exists.
  if (!MAPS[state.player.mapId as MapId]) {
    const farm = MAPS[MapId.Farm];
    state.player.mapId = MapId.Farm;
    state.player.x = (farm.spawnTile.x + 0.5) * 32;
    state.player.y = (farm.spawnTile.y + 0.5) * 32;
  }

  // Future schema upgrades branch on candidate.version here.
  return { version: SAVE_VERSION, state: state as GameState };
}

export function loadGame(): GameState {
  const store = storage();
  if (!store) return createNewGameState();
  try {
    const raw = store.getItem(SAVE_KEY) ?? store.getItem(LEGACY_SAVE_KEY);
    if (!raw) return createNewGameState();
    const migrated = migrate(JSON.parse(raw));
    return migrated ? migrated.state : createNewGameState();
  } catch {
    return createNewGameState();
  }
}

export function saveGame(state: GameState): void {
  const store = storage();
  if (!store) return;
  const data: SaveData = { version: SAVE_VERSION, state };
  try {
    store.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or blocked — fail quietly; the game keeps running.
  }
}

export function clearSave(): void {
  const store = storage();
  store?.removeItem(SAVE_KEY);
  store?.removeItem(LEGACY_SAVE_KEY);
}

// Whether a resumable game exists, so the title screen can offer "Continue".
export function hasSave(): boolean {
  const store = storage();
  if (!store) return false;
  return Boolean(store.getItem(SAVE_KEY) ?? store.getItem(LEGACY_SAVE_KEY));
}

const HIGHSCORE_KEY = 'tale-of-turnips/highscore';
const LEGACY_HIGHSCORE_KEY = 'story-of-turnips/highscore';

export function loadHighScore(): number {
  const store = storage();
  const raw = store?.getItem(HIGHSCORE_KEY) ?? store?.getItem(LEGACY_HIGHSCORE_KEY);
  const n = raw ? Number(raw) : 0;
  return Number.isFinite(n) ? n : 0;
}

// Records `gold` if it beats the stored best. Returns the resulting high score.
export function recordHighScore(gold: number): number {
  const best = Math.max(loadHighScore(), gold);
  try {
    storage()?.setItem(HIGHSCORE_KEY, String(best));
  } catch {
    // ignore storage errors
  }
  return best;
}
