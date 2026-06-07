// Selling/economy logic. Pure: computes gold from sellable items and removes them.
// The caller applies the gold to the player so this stays Phaser-free and testable.

import { ITEMS } from '../data/items';
import type { ItemId } from '../types/ids';
import type { Inventory } from '../types/models';
import { remove } from './InventorySystem';

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
