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

describe('dungeon progression wiring', () => {
  // The six-room dungeon, in order. Each forward step is locked until the room is cleared.
  const ROOMS = [
    MapId.Ruins,
    MapId.Ruins2,
    MapId.Ruins3,
    MapId.Ruins4,
    MapId.Ruins5,
    MapId.Ruins6,
  ];

  it('the Ruin Heart is the final boss with health', () => {
    const boss = ENEMIES[EnemyId.RuinHeart];
    expect(boss.isBoss).toBe(true);
    expect(boss.endsGame).toBe(true);
    expect(boss.maxHp).toBeGreaterThan(0);
  });

  it('only the final boss ends the game', () => {
    const enders = Object.values(ENEMIES).filter((e) => e.endsGame);
    expect(enders.map((e) => e.enemyId)).toEqual([EnemyId.RuinHeart]);
  });

  it('chains the rooms forward, each forward door locked until cleared', () => {
    for (let i = 0; i < ROOMS.length - 1; i++) {
      const forward = MAPS[ROOMS[i]].exits.find((e) => e.requiresClear);
      expect(forward, `room ${ROOMS[i]} forward door`).toBeDefined();
      expect(forward!.toMap).toBe(ROOMS[i + 1]);
    }
  });

  it('gives the final room the game-ending boss and no chest', () => {
    const final = MAPS[MapId.Ruins6];
    expect(final.enemySpawns.some((s) => ENEMIES[s.enemyId].endsGame)).toBe(true);
    expect(final.caches.length).toBe(0);
    expect(final.exits.some((e) => e.requiresClear)).toBe(false);
  });

  it('guards each boss-reward chest behind its boss', () => {
    for (const roomId of [MapId.Ruins2, MapId.Ruins4]) {
      const room = MAPS[roomId];
      expect(room.enemySpawns.some((s) => ENEMIES[s.enemyId].isBoss)).toBe(true);
      expect(room.caches.length).toBe(1);
      expect(room.caches[0].requiresClear).toBe(true);
    }
  });

  it('a fresh game has not defeated the boss', () => {
    expect(createNewGameState().bossDefeated).toBe(false);
  });
});
