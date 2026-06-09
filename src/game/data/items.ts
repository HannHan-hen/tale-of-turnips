// Item registry. Add items here; gameplay refers to them by ItemId.
// `sellPrice` undefined = not sellable at the shipping box (e.g. seeds you bought).

import { ItemId } from '../types/ids';
import { TextureKey } from './assetKeys';

export interface ItemDef {
  itemId: ItemId;
  displayName: string;
  sellPrice?: number;
  maxStack: number;
  iconKey: string;
}

export const ITEMS: Record<ItemId, ItemDef> = {
  [ItemId.TurnipSeed]: {
    itemId: ItemId.TurnipSeed,
    displayName: 'Turnip Seed',
    maxStack: 99,
    iconKey: TextureKey.IconTurnipSeed,
  },
  [ItemId.Turnip]: {
    itemId: ItemId.Turnip,
    displayName: 'Turnip',
    sellPrice: 12,
    maxStack: 99,
    iconKey: TextureKey.IconTurnip,
  },
  [ItemId.CarrotSeed]: {
    itemId: ItemId.CarrotSeed,
    displayName: 'Carrot Seed',
    maxStack: 99,
    iconKey: TextureKey.IconCarrotSeed,
  },
  [ItemId.Carrot]: {
    itemId: ItemId.Carrot,
    displayName: 'Carrot',
    sellPrice: 18,
    maxStack: 99,
    iconKey: TextureKey.IconCarrot,
  },
  [ItemId.RadishSeed]: {
    itemId: ItemId.RadishSeed,
    displayName: 'Radish Seed',
    maxStack: 99,
    iconKey: TextureKey.IconRadishSeed,
  },
  [ItemId.Radish]: {
    itemId: ItemId.Radish,
    displayName: 'Radish',
    sellPrice: 9,
    maxStack: 99,
    iconKey: TextureKey.IconRadish,
  },
  [ItemId.Egg]: {
    itemId: ItemId.Egg,
    displayName: 'Egg',
    sellPrice: 9,
    maxStack: 99,
    iconKey: TextureKey.IconEgg,
  },
  [ItemId.Berry]: {
    itemId: ItemId.Berry,
    displayName: 'Berry',
    sellPrice: 6,
    maxStack: 99,
    iconKey: TextureKey.IconBerry,
  },
  // Basic gear bought from the blacksmith. Inert for now; gains combat effects when the
  // combat/equipment slices land. Not sellable so a careless shipping-box sweep keeps it.
  [ItemId.WornSword]: {
    itemId: ItemId.WornSword,
    displayName: 'Worn Sword',
    maxStack: 1,
    iconKey: TextureKey.IconSword,
  },
  [ItemId.PaddedVest]: {
    itemId: ItemId.PaddedVest,
    displayName: 'Padded Vest',
    maxStack: 1,
    iconKey: TextureKey.IconArmor,
  },
  // Monster drops from the ruins — sellable trinkets (some become gifts in a later slice).
  [ItemId.RuinShard]: {
    itemId: ItemId.RuinShard,
    displayName: 'Ruin Shard',
    sellPrice: 14,
    maxStack: 99,
    iconKey: TextureKey.IconRuinShard,
  },
  [ItemId.ShadowWisp]: {
    itemId: ItemId.ShadowWisp,
    displayName: 'Shadow Wisp',
    sellPrice: 40,
    maxStack: 99,
    iconKey: TextureKey.IconShadowWisp,
  },
};
