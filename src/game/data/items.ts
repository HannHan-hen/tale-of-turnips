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
};
