import { describe, expect, it } from 'vitest';
import { createNewGameState } from '../src/game/state/newGameState';
import { petChicken } from '../src/game/systems/ChickenSystem';
import { harvestBush, isBushReady } from '../src/game/systems/ForagingSystem';
import { advanceTick } from '../src/game/systems/TimeSystem';
import { CropId } from '../src/game/types/ids';

describe('ForagingSystem', () => {
  it('starts ready, becomes bare after harvest, and regrows after the timer', () => {
    const bush = { id: 'x', readyTick: 0 };
    expect(isBushReady(bush, 0)).toBe(true);
    harvestBush(bush, 5, 16);
    expect(bush.readyTick).toBe(21);
    expect(isBushReady(bush, 20)).toBe(false);
    expect(isBushReady(bush, 21)).toBe(true);
  });
});

describe('ChickenSystem', () => {
  it('allows one pet per day', () => {
    const chicken = { id: 'a', lastPettedDay: 0 };
    expect(petChicken(chicken, 1)).toBe(true);
    expect(petChicken(chicken, 1)).toBe(false);
    expect(petChicken(chicken, 2)).toBe(true);
  });
});

describe('TimeSystem day rollover', () => {
  it('advances days as ticks accumulate', () => {
    const time = { tick: 0, day: 1 };
    let newDays = 0;
    for (let i = 0; i < 80; i++) {
      if (advanceTick(time, 40)) newDays++;
    }
    expect(time.tick).toBe(80);
    expect(time.day).toBe(3);
    expect(newDays).toBe(2);
  });
});

describe('new game has animals, bushes, and a selected crop', () => {
  it('initializes chickens, bushes, and the default seed', () => {
    const state = createNewGameState();
    expect(Object.keys(state.chickens).length).toBeGreaterThan(0);
    expect(Object.keys(state.bushes).length).toBeGreaterThan(0);
    expect(state.player.selectedCropId).toBe(CropId.Turnip);
  });
});
