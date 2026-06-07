// Time logic. A simple tick counter drives crop growth and bush regrowth; days advance
// when enough ticks elapse and gate once-per-day actions (petting, later: village chat,
// threat). Kept minimal on purpose — no calendar.

import type { TimeState } from '../types/models';

// Advances one tick. Returns true if a new day just began.
export function advanceTick(time: TimeState, dayLengthTicks: number): boolean {
  time.tick += 1;
  const day = Math.floor(time.tick / dayLengthTicks) + 1;
  if (day > time.day) {
    time.day = day;
    return true;
  }
  return false;
}
