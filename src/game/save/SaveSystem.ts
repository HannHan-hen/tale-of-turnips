// The ONLY place that touches localStorage. Versioned saves with graceful migration:
// invalid or unreadable saves fall back to a new game so the player is never stuck.

import { Balance } from '../data/balance';
import { createNewGameState } from '../state/newGameState';
import type { GameState, SaveData } from '../types/models';

export const SAVE_KEY = 'story-of-turnips/save';
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
  if (!state.player || !state.maps || !state.time) return null;

  // Fill fields that may be missing in older saves rather than discarding the save.
  state.stats ??= { cropsHarvested: 0 };
  if (!state.player.inventory) {
    state.player.inventory = { slots: [], capacity: Balance.inventoryCapacity };
  }
  state.player.inventory.capacity ??= Balance.inventoryCapacity;
  state.player.inventory.slots ??= [];

  // Future schema upgrades branch on candidate.version here.
  return { version: SAVE_VERSION, state: state as GameState };
}

export function loadGame(): GameState {
  const store = storage();
  if (!store) return createNewGameState();
  try {
    const raw = store.getItem(SAVE_KEY);
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
  storage()?.removeItem(SAVE_KEY);
}
