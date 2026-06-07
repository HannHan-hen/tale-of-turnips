// Selling/economy logic. Pure: computes gold from sellable items and removes them.
// The caller applies the gold to the player so this stays Phaser-free and testable.

import { ITEMS } from '../data/items';
import type { ItemId } from '../types/ids';
import type { Inventory, PlayerState } from '../types/models';
import { add, canAdd, remove } from './InventorySystem';

export function sellPriceOf(itemId: ItemId): number {
  return ITEMS[itemId].sellPrice ?? 0;
}

export interface SaleResult {
  gold: number;
  itemsSold: number;
}

// Sells every sellable stack in the inventory. Seeds (no sellPrice) are kept.
export function sellAll(inv: Inventory): SaleResult {
  let gold = 0;
  let itemsSold = 0;
  for (const stack of [...inv.slots]) {
    const price = sellPriceOf(stack.itemId);
    if (price > 0) {
      gold += price * stack.count;
      itemsSold += stack.count;
      remove(inv, stack.itemId, stack.count);
    }
  }
  return { gold, itemsSold };
}

export type BuyResult = 'ok' | 'not_enough_gold' | 'no_room';

// Buys one of an item at the given price: checks gold and space, then applies both.
export function buy(player: PlayerState, itemId: ItemId, price: number): BuyResult {
  if (player.gold < price) return 'not_enough_gold';
  if (!canAdd(player.inventory, itemId, 1)) return 'no_room';
  player.gold -= price;
  add(player.inventory, itemId, 1);
  return 'ok';
}
