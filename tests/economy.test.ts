import { describe, expect, it } from 'vitest';
import { ITEMS } from '../src/game/data/items';
import { ItemId } from '../src/game/types/ids';
import { add, count, createInventory } from '../src/game/systems/InventorySystem';
import { sellAll, sellPriceOf } from '../src/game/systems/EconomySystem';

describe('EconomySystem', () => {
  it('sells sellable items and keeps unsellable ones (seeds)', () => {
    const inv = createInventory(10);
    add(inv, ItemId.Turnip, 3);
    add(inv, ItemId.TurnipSeed, 5);

    const result = sellAll(inv);
    expect(result.gold).toBe(3 * sellPriceOf(ItemId.Turnip));
    expect(result.itemsSold).toBe(3);
    expect(count(inv, ItemId.Turnip)).toBe(0);
    expect(count(inv, ItemId.TurnipSeed)).toBe(5); // seeds have no sell price
  });

  it('returns zero when there is nothing sellable', () => {
    const inv = createInventory(10);
    add(inv, ItemId.TurnipSeed, 2);
    const result = sellAll(inv);
    expect(result.gold).toBe(0);
    expect(result.itemsSold).toBe(0);
  });

  it('seed has no sell price', () => {
    expect(ITEMS[ItemId.TurnipSeed].sellPrice).toBeUndefined();
    expect(sellPriceOf(ItemId.TurnipSeed)).toBe(0);
  });
});
