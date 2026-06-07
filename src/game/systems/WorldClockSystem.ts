// Advances game time. Accumulated real milliseconds are converted into discrete growth ticks;
// each tick may roll the day over (which accrues farm threat). Pure logic — the scene owns the
// accumulator and reacts to the flags (refresh crop/bush art, run the new-day hooks).

import type { GameState } from '../types/models';
import { accrueDailyThreat } from './ThreatSystem';
import { advanceTick } from './TimeSystem';

export interface ClockResult {
  tickAccum: number; // leftover milliseconds to carry into the next frame
  grew: boolean; // at least one tick elapsed (crops/bushes may have advanced)
  newDay: boolean; // the day rolled over during this update
}

export function advanceWorldClock(
  state: GameState,
  tickAccum: number,
  deltaMs: number,
  tickMs: number,
  dayLengthTicks: number,
): ClockResult {
  let acc = tickAccum + deltaMs;
  let grew = false;
  let newDay = false;
  while (acc >= tickMs) {
    acc -= tickMs;
    if (advanceTick(state.time, dayLengthTicks)) {
      accrueDailyThreat(state.threat, state.time.day);
      newDay = true;
    }
    grew = true;
  }
  return { tickAccum: acc, grew, newDay };
}
