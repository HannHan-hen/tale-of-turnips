import { beforeEach, describe, expect, it } from 'vitest';
import { createNewGameState } from '../src/game/state/newGameState';
import { clearSave, loadGame, migrate, saveGame, SAVE_VERSION } from '../src/game/save/SaveSystem';

// Minimal in-memory localStorage so the save system can be exercised in Node.
function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k) => (map.has(k) ? map.get(k)! : null),
    key: (i) => Array.from(map.keys())[i] ?? null,
    removeItem: (k) => map.delete(k),
    setItem: (k, v) => void map.set(k, v),
  };
}

beforeEach(() => {
  (globalThis as { localStorage: Storage }).localStorage = memoryStorage();
});

describe('SaveSystem', () => {
  it('round-trips a saved game through localStorage', () => {
    const state = createNewGameState();
    state.player.gold = 777;
    saveGame(state);

    const loaded = loadGame();
    expect(loaded.player.gold).toBe(777);
  });

  it('returns a fresh game when no save exists', () => {
    clearSave();
    const loaded = loadGame();
    expect(loaded.player.gold).toBeGreaterThanOrEqual(0);
    expect(loaded.maps.farm).toBeDefined();
  });

  it('migrate rejects clearly invalid data', () => {
    expect(migrate(null)).toBeNull();
    expect(migrate({})).toBeNull();
    expect(migrate({ version: 1 })).toBeNull();
    expect(migrate({ version: 1, state: { player: {} } })).toBeNull();
  });

  it('migrate fills missing optional fields and stamps the current version', () => {
    const base = createNewGameState();
    const partial = {
      version: 0,
      state: { player: { ...base.player, inventory: undefined }, maps: base.maps, time: base.time },
    };
    const result = migrate(partial)!;
    expect(result).not.toBeNull();
    expect(result.version).toBe(SAVE_VERSION);
    expect(result.state.stats).toBeDefined();
    expect(result.state.player.inventory.slots).toEqual([]);
  });

  it('backfills cropsHarvested when an older partial stats object is missing it', () => {
    const base = createNewGameState();
    const partial = {
      version: 0,
      // A save from before cropsHarvested existed: stats present but partial.
      state: {
        player: base.player,
        maps: base.maps,
        time: base.time,
        stats: { chickensPetted: 2, monstersDefeated: 1 },
      },
    };
    const result = migrate(partial)!;
    expect(result.state.stats.cropsHarvested).toBe(0);
    expect(result.state.stats.chickensPetted).toBe(2);
    expect(result.state.stats.monstersDefeated).toBe(1);
  });
});
