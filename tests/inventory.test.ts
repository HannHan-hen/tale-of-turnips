import { describe, expect, it } from 'vitest';
import { ItemId } from '../src/game/types/ids';
import {
  add,
  canAdd,
  count,
  createInventory,
  has,
  remove,
  transfer,
} from '../src/game/systems/InventorySystem';

describe('InventorySystem', () => {
  it('adds and counts items', () => {
    const inv = createInventory(10);
    expect(add(inv, ItemId.Turnip, 3)).toBe(true);
    expect(count(inv, ItemId.Turnip)).toBe(3);
    expect(has(inv, ItemId.Turnip, 3)).toBe(true);
    expect(has(inv, ItemId.Turnip, 4)).toBe(false);
  });

  it('stacks the same item rather than filling new slots', () => {
    const inv = createInventory(10);
    add(inv, ItemId.Turnip, 5);
    add(inv, ItemId.Turnip, 5);
    expect(inv.slots.length).toBe(1);
    expect(count(inv, ItemId.Turnip)).toBe(10);
  });

  it('removes items and drops empty stacks', () => {
    const inv = createInventory(10);
    add(inv, ItemId.Turnip, 5);
    expect(remove(inv, ItemId.Turnip, 5)).toBe(true);
    expect(inv.slots.length).toBe(0);
    expect(remove(inv, ItemId.Turnip, 1)).toBe(false);
  });

  it('respects capacity and does not partially add when it cannot fit', () => {
    const inv = createInventory(1); // one stack, maxStack 99
    expect(canAdd(inv, ItemId.Turnip, 99)).toBe(true);
    expect(add(inv, ItemId.Turnip, 99)).toBe(true);
    expect(canAdd(inv, ItemId.Turnip, 1)).toBe(false);
    expect(add(inv, ItemId.Turnip, 1)).toBe(false);
    expect(count(inv, ItemId.Turnip)).toBe(99);
  });

  it('transfers between inventories atomically', () => {
    const from = createInventory(10);
    const to = createInventory(10);
    add(from, ItemId.Turnip, 4);
    expect(transfer(from, to, ItemId.Turnip, 3)).toBe(true);
    expect(count(from, ItemId.Turnip)).toBe(1);
    expect(count(to, ItemId.Turnip)).toBe(3);
    expect(transfer(from, to, ItemId.Turnip, 5)).toBe(false);
  });
});
