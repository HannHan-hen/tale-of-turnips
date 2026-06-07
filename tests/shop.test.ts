import { describe, expect, it } from 'vitest';
import { ITEMS } from '../src/game/data/items';
import { NPCS } from '../src/game/data/npcs';
import { SHOPS, availableItems } from '../src/game/data/shops';
import { createNewGameState } from '../src/game/state/newGameState';
import { buy } from '../src/game/systems/EconomySystem';
import { count } from '../src/game/systems/InventorySystem';
import { ItemId } from '../src/game/types/ids';

describe('EconomySystem.buy', () => {
  it('deducts gold and adds the item when affordable with room', () => {
    const state = createNewGameState();
    state.player.gold = 100;
    expect(buy(state.player, ItemId.TurnipSeed, 8)).toBe('ok');
    expect(state.player.gold).toBe(92);
    expect(count(state.player.inventory, ItemId.TurnipSeed)).toBe(
      // 5 starting seeds + 1 bought
      6,
    );
  });

  it('refuses when the player cannot afford it', () => {
    const state = createNewGameState();
    state.player.gold = 5;
    expect(buy(state.player, ItemId.WornSword, 60)).toBe('not_enough_gold');
    expect(state.player.gold).toBe(5);
  });

  it('refuses when there is no inventory room', () => {
    const state = createNewGameState();
    state.player.gold = 1000;
    state.player.inventory.capacity = 1; // single stack, already holds seeds
    expect(buy(state.player, ItemId.WornSword, 60)).toBe('no_room');
    expect(state.player.gold).toBe(1000);
  });
});

describe('shop & npc registries are consistent', () => {
  it('every shop sells real items at positive prices', () => {
    for (const shop of Object.values(SHOPS)) {
      expect(shop.title.length).toBeGreaterThan(0);
      expect(shop.items.length).toBeGreaterThan(0);
      for (const entry of shop.items) {
        expect(ITEMS[entry.itemId]).toBeDefined();
        expect(entry.price).toBeGreaterThan(0);
      }
    }
  });

  it('availableItems returns all goods when nothing is gated', () => {
    const state = createNewGameState();
    for (const shop of Object.values(SHOPS)) {
      expect(availableItems(shop, state).length).toBe(shop.items.length);
    }
  });

  it('every npc has a sprite and either a real shop, dialogue lines, or romance', () => {
    for (const npc of Object.values(NPCS)) {
      expect(npc.displayName.length).toBeGreaterThan(0);
      expect(npc.textureKey.length).toBeGreaterThan(0);
      if (npc.shopId) {
        expect(SHOPS[npc.shopId]).toBeDefined();
      } else {
        expect((npc.lines && npc.lines.length) || npc.romance).toBeTruthy();
      }
    }
  });
});
