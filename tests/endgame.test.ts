import { beforeEach, describe, expect, it } from 'vitest';
import { ENEMIES } from '../src/game/data/enemies';
import { MAPS } from '../src/game/data/maps';
import { createNewGameState } from '../src/game/state/newGameState';
import { loadHighScore, recordHighScore } from '../src/game/save/SaveSystem';
import { EnemyId, MapId } from '../src/game/types/ids';

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

describe('high score', () => {
  it('loads high scores written under the previous game name', () => {
    localStorage.setItem('story-of-turnips/highscore', '240');

    expect(loadHighScore()).toBe(240);
  });

  it('keeps the best gold across runs', () => {
    expect(loadHighScore()).toBe(0);
    expect(recordHighScore(120)).toBe(120);
    expect(recordHighScore(80)).toBe(120); // lower run does not lower the best
    expect(recordHighScore(300)).toBe(300);
    expect(loadHighScore()).toBe(300);
  });
});

describe('boss + sealed door wiring', () => {
  it('the Ruin Heart is a boss with health', () => {
    const boss = ENEMIES[EnemyId.RuinHeart];
    expect(boss.isBoss).toBe(true);
    expect(boss.maxHp).toBeGreaterThan(0);
  });

  it('the ruins have a set-gated sealed door to the boss arena', () => {
    const sealed = MAPS[MapId.Ruins].exits.find((e) => e.requiresSet);
    expect(sealed).toBeDefined();
    expect(sealed!.toMap).toBe(MapId.BossArena);
  });

  it('the boss arena spawns the boss', () => {
    const spawns = MAPS[MapId.BossArena].enemySpawns;
    expect(spawns.some((s) => ENEMIES[s.enemyId].isBoss)).toBe(true);
  });

  it('a fresh game has not defeated the boss', () => {
    expect(createNewGameState().bossDefeated).toBe(false);
  });
});
