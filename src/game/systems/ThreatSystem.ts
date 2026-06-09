// Farm threat logic. Pure functions over ThreatState. Threat rises each day after a grace
// period, falls when monsters are defeated, and gates farm raids. Kept light on purpose —
// no spirals, no tower defense.

import { Balance } from '../data/balance';
import type { ThreatState } from '../types/models';

// Called once per new day. No threat accrues during the opening grace period.
export function accrueDailyThreat(threat: ThreatState, day: number): void {
  if (day <= Balance.threatGraceDays) return;
  threat.ruinThreat = Math.min(Balance.threatMax, threat.ruinThreat + Balance.threatPerDay);
}

export function reduceThreat(threat: ThreatState, amount: number = Balance.threatPerKill): void {
  threat.ruinThreat = Math.max(0, threat.ruinThreat - amount);
}

// Defeating a dungeon boss eases the threat — but only once per day per boss, so re-running
// the dungeon the same day can't grind threat to zero. Returns true if the relief applied.
export function claimBossThreatReduction(threat: ThreatState, enemyId: string, day: number): boolean {
  const days = (threat.bossThreatDays ??= {});
  if (days[enemyId] === day) return false;
  days[enemyId] = day;
  reduceThreat(threat, Balance.threatPerBoss);
  return true;
}

export function isFarmUnderThreat(threat: ThreatState): boolean {
  return threat.ruinThreat >= Balance.farmThreatThreshold;
}

export type ThreatBand = 'safe' | 'rustling' | 'raid';

export function threatBand(threat: ThreatState): ThreatBand {
  if (isFarmUnderThreat(threat)) return 'raid';
  if (threat.ruinThreat > 0) return 'rustling';
  return 'safe';
}

// How many raiders a raid should field, scaling gently with threat over the threshold.
export function raidSize(threat: ThreatState): number {
  const over = threat.ruinThreat - Balance.farmThreatThreshold;
  return Math.max(1, Math.min(Balance.farmRaidMax, 1 + Math.floor(over / 2)));
}
