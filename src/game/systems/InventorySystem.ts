// Inventory logic. Pure functions over the Inventory data structure, keyed by ItemId.
// Shared by the backpack and (later) chests. No Phaser, no rendering.

import { ITEMS } from '../data/items';
import type { ItemId } from '../types/ids';
import type { Inventory } from '../types/models';

export function createInventory(capacity: number): Inventory {
  return { slots: [], capacity };
}

export function count(inv: Inventory, itemId: ItemId): number {
  let total = 0;
  for (const s of inv.slots) {
    if (s.itemId === itemId) total += s.count;
  }
  return total;
}

export function has(inv: Inventory, itemId: ItemId, n = 1): boolean {
  return count(inv, itemId) >= n;
}

// How many more of `itemId` can fit, accounting for partial stacks and empty slots.
export function spaceFor(inv: Inventory, itemId: ItemId): number {
  const max = ITEMS[itemId].maxStack;
  let space = 0;
  for (const s of inv.slots) {
    if (s.itemId === itemId) space += max - s.count;
  }
  space += (inv.capacity - inv.slots.length) * max;
  return space;
}

export function canAdd(inv: Inventory, itemId: ItemId, n = 1): boolean {
  return spaceFor(inv, itemId) >= n;
}

// Adds n items. Returns false (and changes nothing) if they do not all fit.
export function add(inv: Inventory, itemId: ItemId, n = 1): boolean {
  if (n <= 0) return true;
  if (!canAdd(inv, itemId, n)) return false;
  const max = ITEMS[itemId].maxStack;
  let remaining = n;
  for (const s of inv.slots) {
    if (remaining === 0) break;
    if (s.itemId === itemId && s.count < max) {
      const put = Math.min(max - s.count, remaining);
      s.count += put;
      remaining -= put;
    }
  }
  while (remaining > 0) {
    const put = Math.min(max, remaining);
    inv.slots.push({ itemId, count: put });
    remaining -= put;
  }
  return true;
}

// Removes n items. Returns false (and changes nothing) if there aren't enough.
export function remove(inv: Inventory, itemId: ItemId, n = 1): boolean {
  if (n <= 0) return true;
  if (count(inv, itemId) < n) return false;
  let remaining = n;
  for (const s of inv.slots) {
    if (remaining === 0) break;
    if (s.itemId === itemId) {
      const take = Math.min(s.count, remaining);
      s.count -= take;
      remaining -= take;
    }
  }
  inv.slots = inv.slots.filter((s) => s.count > 0);
  return true;
}

// Moves n items from one inventory to another (e.g. backpack <-> chest). Atomic.
export function transfer(from: Inventory, to: Inventory, itemId: ItemId, n = 1): boolean {
  if (count(from, itemId) < n) return false;
  if (!canAdd(to, itemId, n)) return false;
  remove(from, itemId, n);
  add(to, itemId, n);
  return true;
}
