import { describe, expect, it } from 'vitest';
import { Balance } from '../src/game/data/balance';
import { NPCS } from '../src/game/data/npcs';
import {
  canGift,
  createAffection,
  giveGift,
  grantMilestone,
  talk,
  tierIndex,
  tierName,
} from '../src/game/systems/AffectionSystem';
import { ItemId, NpcId } from '../src/game/types/ids';

const romance = NPCS[NpcId.Jay].romance!;

describe('AffectionSystem talking', () => {
  it('gains once per day from talking', () => {
    const aff = createAffection(NpcId.Jay);
    expect(talk(aff, 1)).toBe(true);
    expect(aff.points).toBe(Balance.affectionTalkGain);
    expect(talk(aff, 1)).toBe(false); // already talked today
    expect(aff.points).toBe(Balance.affectionTalkGain);
    expect(talk(aff, 2)).toBe(true);
  });
});

describe('AffectionSystem gifts', () => {
  it('rewards loved gifts more than liked, and limits to one gift a day', () => {
    const aff = createAffection(NpcId.Jay);
    expect(canGift(aff, 1)).toBe(true);
    expect(giveGift(aff, romance, ItemId.ShadowWisp, 1)).toBe('loved');
    expect(aff.points).toBe(Balance.affectionGiftLoved);
    expect(canGift(aff, 1)).toBe(false); // one gift per day

    expect(giveGift(aff, romance, ItemId.Berry, 2)).toBe('liked');
    expect(aff.points).toBe(Balance.affectionGiftLoved + Balance.affectionGiftLiked);
  });

  it('gives a smaller bump for a repeat of the same item type', () => {
    const aff = createAffection(NpcId.Jay);
    giveGift(aff, romance, ItemId.Berry, 1);
    const before = aff.points;
    expect(giveGift(aff, romance, ItemId.Berry, 2)).toBe('repeat');
    expect(aff.points).toBe(before + Balance.affectionGiftRepeat);
  });
});

describe('AffectionSystem tiers and milestones', () => {
  it('maps points to the tier names (lowest tier is the ending default)', () => {
    expect(tierIndex(0)).toBe(0);
    expect(tierName(0)).toBe('barely knows you');
    expect(tierIndex(100)).toBe(3);
  });

  it('grants a milestone only once', () => {
    const aff = createAffection(NpcId.Jay);
    expect(grantMilestone(aff, 'set_complete', 4)).toBe(true);
    expect(aff.points).toBe(4);
    expect(grantMilestone(aff, 'set_complete', 4)).toBe(false);
    expect(aff.points).toBe(4);
  });
});
