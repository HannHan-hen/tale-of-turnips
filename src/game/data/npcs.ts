// NPC registry. Each NPC has a display name, a sprite key, and either a shop to open or a
// few lines of flavor/hint dialogue. (Affection/romance arrives in a later slice.)

import { TextureKey } from './assetKeys';
import { NpcId, ShopId } from '../types/ids';

export interface NpcDef {
  npcId: NpcId;
  displayName: string;
  textureKey: string;
  shopId?: ShopId; // present = interacting opens this shop
  lines?: string[]; // present = interacting shows a line of dialogue
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
      'Something stirs in the old ruins…',
    ],
  },
};
