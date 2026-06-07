import { describe, expect, it } from 'vitest';
import { Balance } from '../src/game/data/balance';
import {
  accrueDailyThreat,
  isFarmUnderThreat,
  raidSize,
  reduceThreat,
  threatBand,
} from '../src/game/systems/ThreatSystem';

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
