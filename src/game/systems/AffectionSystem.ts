// Affection logic for the village boy. Pure functions over NpcAffectionState. Talking is a
// once-a-day nudge; gifts (also once a day) are the meaningful boosts; story beats add a
// one-time bump. Tiers come from the NPC data so designers can retune feel.

import { AFFECTION_TIERS, type RomanceConfig } from '../data/npcs';
import { Balance } from '../data/balance';
import type { ItemId } from '../types/ids';
import type { NpcAffectionState } from '../types/models';

export function createAffection(npcId: string): NpcAffectionState {
  return { npcId, points: 0, lastTalkedDay: 0, lastGiftedDay: 0, giftedItemIds: [], milestones: [] };
}

function gain(aff: NpcAffectionState, amount: number): void {
  aff.points = Math.min(Balance.affectionMax, aff.points + amount);
}

export function tierIndex(points: number): number {
  let idx = 0;
  for (let i = 0; i < AFFECTION_TIERS.length; i++) {
    if (points >= AFFECTION_TIERS[i].min) idx = i;
  }
  return idx;
}

export function tierName(points: number): string {
  return AFFECTION_TIERS[tierIndex(points)].name;
}

export function canTalk(aff: NpcAffectionState, day: number): boolean {
  return aff.lastTalkedDay !== day;
}

// Returns true if the talk counted (first chat today).
export function talk(aff: NpcAffectionState, day: number): boolean {
  if (!canTalk(aff, day)) return false;
  aff.lastTalkedDay = day;
  gain(aff, Balance.affectionTalkGain);
  return true;
}

export function canGift(aff: NpcAffectionState, day: number): boolean {
  return aff.lastGiftedDay !== day;
}

export function isGiftable(romance: RomanceConfig, itemId: ItemId): boolean {
  return romance.lovedGiftItemIds.includes(itemId) || romance.likedGiftItemIds.includes(itemId);
}

export type GiftReaction = 'loved' | 'liked' | 'repeat';

// Applies a gift (caller has already verified canGift + isGiftable and removed the item).
export function giveGift(
  aff: NpcAffectionState,
  romance: RomanceConfig,
  itemId: ItemId,
  day: number,
): GiftReaction {
  aff.lastGiftedDay = day;
  const seen = aff.giftedItemIds.includes(itemId);
  if (!seen) aff.giftedItemIds.push(itemId);

  if (seen) {
    gain(aff, Balance.affectionGiftRepeat);
    return 'repeat';
  }
  if (romance.lovedGiftItemIds.includes(itemId)) {
    gain(aff, Balance.affectionGiftLoved);
    return 'loved';
  }
  gain(aff, Balance.affectionGiftLiked);
  return 'liked';
}

// One-time affection from a story beat (e.g. completing the set). Returns true if awarded.
export function grantMilestone(aff: NpcAffectionState, key: string, amount: number): boolean {
  if (aff.milestones.includes(key)) return false;
  aff.milestones.push(key);
  gain(aff, amount);
  return true;
}
