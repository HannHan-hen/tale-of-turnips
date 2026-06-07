// NPC registry. Each NPC has a display name, a sprite key, and either a shop to open, a few
// lines of flavor dialogue, or — for the village boy — a romance config (tiered dialogue and
// gift preferences). Names, lines, and gift lists are all designer-tweakable here.

import { TextureKey } from './assetKeys';
import { ItemId, NpcId, ShopId } from '../types/ids';

// Affection tiers, lowest first. `name` doubles as the ending relationship outcome.
export const AFFECTION_TIERS: { min: number; name: string }[] = [
  { min: 0, name: 'barely knows you' },
  { min: 6, name: 'thinks you are dependable' },
  { min: 14, name: 'waits for you by the village gate' },
  { min: 24, name: 'is deeply impressed by your strange farming-warrior life' },
];

export interface RomanceConfig {
  // One greeting line per tier (index matches AFFECTION_TIERS).
  greetingByTier: string[];
  // One "you chatted" line per tier.
  talkByTier: string[];
  alreadyTalked: string; // shown if you've already talked today
  likedGiftItemIds: ItemId[];
  lovedGiftItemIds: ItemId[];
  giftLikedLine: string;
  giftLovedLine: string;
  giftRepeatLine: string; // re-gifting an item type he's already received
  noGiftLine: string; // you have nothing he'd treasure
  alreadyGiftedLine: string; // already received a gift today
}

export interface NpcDef {
  npcId: NpcId;
  displayName: string;
  textureKey: string;
  shopId?: ShopId; // present = interacting opens this shop
  lines?: string[]; // present = interacting shows a line of dialogue
  romance?: RomanceConfig; // present = interacting opens the talk/affection screen
}

export const NPCS: Record<NpcId, NpcDef> = {
  [NpcId.SeedSeller]: {
    npcId: NpcId.SeedSeller,
    displayName: 'Marigold',
    textureKey: TextureKey.NpcSeedSeller,
    shopId: ShopId.Seeds,
  },
  [NpcId.Blacksmith]: {
    npcId: NpcId.Blacksmith,
    displayName: 'Bramble',
    textureKey: TextureKey.NpcBlacksmith,
    shopId: ShopId.Blacksmith,
  },
  [NpcId.Hint]: {
    npcId: NpcId.Hint,
    displayName: 'Old Pip',
    textureKey: TextureKey.NpcVillager,
    lines: [
      'Plant turnips, sell turnips. Simple as that.',
      'Marigold sells seeds. Bramble forges steel.',
      'Their grandson Jay? Sweet boy. Bit shy.',
      'Something stirs in the old ruins…',
    ],
  },
  [NpcId.Jay]: {
    npcId: NpcId.Jay,
    displayName: 'Jay',
    textureKey: TextureKey.NpcJay,
    romance: {
      greetingByTier: [
        'Jay looks up, then quickly back at his boots. "Oh— hello."',
        '"Back again? I, um… I don\'t mind. I mean— it\'s nice."',
        '"I kept an eye on the gate today. Just… in case you came by."',
        '"There you are. Honestly? You\'re the best part of my day."',
      ],
      talkByTier: [
        '"Gran sells the seeds, Grandpa swings the hammer. Me, I… mostly fumble the change." He goes pink.',
        '"You actually farm AND fight monsters? That\'s— wow. I\'d trip over the hoe."',
        '"When the ruins rumble, I worry. Not about the village. About you. …Is that strange to say?"',
        '"Whatever you\'re chasing out there — I hope you know someone here is cheering for you."',
      ],
      alreadyTalked: 'Jay smiles softly. "We already talked today… but I liked it."',
      likedGiftItemIds: [ItemId.Berry, ItemId.RuinShard],
      lovedGiftItemIds: [ItemId.ShadowWisp],
      giftLikedLine: '"For me? Th-thank you. I\'ll keep it safe." He cradles it carefully.',
      giftLovedLine: '"This is… I\'ve never seen anything like it. I— I\'ll treasure this. Truly."',
      giftRepeatLine: '"Another one? You\'re too kind." He smiles, a little shy.',
      noGiftLine: 'You have nothing he\'d treasure right now.',
      alreadyGiftedLine: 'Jay glances at the gift you already gave today. "You spoil me…"',
    },
  },
};
