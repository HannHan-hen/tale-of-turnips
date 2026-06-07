// Shop registry. Inventories and prices are data — add or reprice goods here without
// touching the shop system. `unlock` is an optional gate (all goods are available by
// default); items whose unlock returns false are hidden until their condition is met.

import { ItemId, ShopId } from '../types/ids';
import type { GameState } from '../types/models';

export interface ShopItem {
  itemId: ItemId;
  price: number;
  unlock?: (state: GameState) => boolean;
}

export interface ShopDef {
  shopId: ShopId;
  title: string;
  items: ShopItem[];
}

export const SHOPS: Record<ShopId, ShopDef> = {
  [ShopId.Seeds]: {
    shopId: ShopId.Seeds,
    title: 'Seeds & Sprouts',
    items: [{ itemId: ItemId.TurnipSeed, price: 8 }],
  },
  [ShopId.Blacksmith]: {
    shopId: ShopId.Blacksmith,
    title: 'The Anvil',
    items: [
      { itemId: ItemId.WornSword, price: 60 },
      { itemId: ItemId.PaddedVest, price: 45 },
    ],
  },
};

// Goods currently purchasable, after applying any unlock conditions.
export function availableItems(shop: ShopDef, state: GameState): ShopItem[] {
  return shop.items.filter((item) => !item.unlock || item.unlock(state));
}
