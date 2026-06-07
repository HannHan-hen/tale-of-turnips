import { describe, expect, it } from 'vitest';
import { advanceWorldClock } from '../src/game/systems/WorldClockSystem';
import { createNewGameState } from '../src/game/state/newGameState';

describe('advanceWorldClock', () => {
  it('carries leftover milliseconds and reports no growth below one tick', () => {
    const state = createNewGameState();
    const result = advanceWorldClock(state, 0, 100, 300, 40);
    expect(result.grew).toBe(false);
    expect(result.newDay).toBe(false);
    expect(result.tickAccum).toBe(100);
    expect(state.time.tick).toBe(0);
  });

  it('converts accumulated time into discrete ticks and keeps the remainder', () => {
    const state = createNewGameState();
    // 1000ms at 300ms/tick = 3 ticks, 100ms left over.
    const result = advanceWorldClock(state, 0, 1000, 300, 40);
    expect(state.time.tick).toBe(3);
    expect(result.grew).toBe(true);
    expect(result.tickAccum).toBe(100);
  });

  it('flags the day roll-over and advances the day counter', () => {
    const state = createNewGameState();
    // dayLength 2 ticks: the 2nd tick begins day 2.
    const result = advanceWorldClock(state, 0, 600, 300, 2);
    expect(state.time.tick).toBe(2);
    expect(state.time.day).toBe(2);
    expect(result.newDay).toBe(true);
  });
});
