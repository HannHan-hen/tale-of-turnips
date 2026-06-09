import { describe, expect, it } from 'vitest';
import { Balance } from '../src/game/data/balance';
import {
  accrueDailyThreat,
  claimBossThreatReduction,
  isFarmUnderThreat,
  raidSize,
  reduceThreat,
  threatBand,
} from '../src/game/systems/ThreatSystem';
import type { ThreatState } from '../src/game/types/models';

describe('ThreatSystem grace period', () => {
  it('adds no threat during the first 7 days', () => {
    const threat = { ruinThreat: 0 };
    for (let day = 1; day <= Balance.threatGraceDays; day++) {
      accrueDailyThreat(threat, day);
    }
    expect(threat.ruinThreat).toBe(0);
  });

  it('begins accruing on the day after the grace period', () => {
    const threat = { ruinThreat: 0 };
    accrueDailyThreat(threat, Balance.threatGraceDays + 1);
    expect(threat.ruinThreat).toBe(Balance.threatPerDay);
    accrueDailyThreat(threat, Balance.threatGraceDays + 2);
    expect(threat.ruinThreat).toBe(Balance.threatPerDay * 2);
  });

  it('caps at the maximum', () => {
    const threat = { ruinThreat: 0 };
    for (let day = 8; day < 8 + 100; day++) accrueDailyThreat(threat, day);
    expect(threat.ruinThreat).toBe(Balance.threatMax);
  });
});

describe('ThreatSystem reduction and bands', () => {
  it('reduces threat but never below zero', () => {
    const threat = { ruinThreat: 1 };
    reduceThreat(threat, 5);
    expect(threat.ruinThreat).toBe(0);
  });

  it('classifies safe / rustling / raid by threshold', () => {
    expect(threatBand({ ruinThreat: 0 })).toBe('safe');
    expect(threatBand({ ruinThreat: 1 })).toBe('rustling');
    expect(threatBand({ ruinThreat: Balance.farmThreatThreshold })).toBe('raid');
    expect(isFarmUnderThreat({ ruinThreat: Balance.farmThreatThreshold })).toBe(true);
    expect(isFarmUnderThreat({ ruinThreat: Balance.farmThreatThreshold - 1 })).toBe(false);
  });

  it('scales raid size gently and within the cap', () => {
    expect(raidSize({ ruinThreat: Balance.farmThreatThreshold })).toBe(1);
    expect(raidSize({ ruinThreat: Balance.threatMax })).toBeLessThanOrEqual(Balance.farmRaidMax);
    expect(raidSize({ ruinThreat: Balance.threatMax })).toBeGreaterThanOrEqual(1);
  });
});

describe('ThreatSystem boss reduction (once per day per boss)', () => {
  function freshThreat(ruinThreat: number): ThreatState {
    return { ruinThreat, bossThreatDays: {} };
  }

  it('eases threat the first time a boss falls on a given day', () => {
    const threat = freshThreat(5);
    expect(claimBossThreatReduction(threat, 'ruin_warden', 3)).toBe(true);
    expect(threat.ruinThreat).toBe(5 - Balance.threatPerBoss);
  });

  it('does not ease threat again from the same boss the same day', () => {
    const threat = freshThreat(5);
    claimBossThreatReduction(threat, 'ruin_warden', 3);
    expect(claimBossThreatReduction(threat, 'ruin_warden', 3)).toBe(false);
    expect(threat.ruinThreat).toBe(5 - Balance.threatPerBoss);
  });

  it('eases threat again from the same boss on a later day', () => {
    const threat = freshThreat(8);
    claimBossThreatReduction(threat, 'ruin_warden', 3);
    expect(claimBossThreatReduction(threat, 'ruin_warden', 4)).toBe(true);
    expect(threat.ruinThreat).toBe(8 - Balance.threatPerBoss * 2);
  });

  it('tracks each boss independently within a day', () => {
    const threat = freshThreat(9);
    expect(claimBossThreatReduction(threat, 'ruin_warden', 3)).toBe(true);
    expect(claimBossThreatReduction(threat, 'ruin_colossus', 3)).toBe(true);
    expect(threat.ruinThreat).toBe(9 - Balance.threatPerBoss * 2);
  });
});
