# CLAUDE.md — Story of Turnips

Operating manual for anyone (human or Claude) working in this repo. Read this before
writing code. The full design lives in [`PROJECT.md`](./PROJECT.md); this file is the
rules and the build order.

## Pitch

A cozy browser farming-adventure toy: grow crops for gold, protect your farm from tiny
ruin monsters, collect an absurdly dramatic legendary armor set, defeat the ruin boss, and
maybe impress a cute village boy along the way. Your final gold total is the high score. It
should feel like a finished tiny Flash-era toy, not a tech demo.

## Tech & build

- **Stack:** Vite + TypeScript + Phaser 3. Vitest for unit tests.
- **Output:** static files only (`npm run build` → `dist/`). No backend, no accounts, no
  multiplayer, no paid services. Saves use `localStorage`.
- **Commands:**
  - `npm run dev` — local dev server.
  - `npm run build` — static production build into `dist/`.
  - `npm run preview` — serve the built `dist/`.
  - `npm run test` — Vitest unit tests.
  - `npm run typecheck` — `tsc --noEmit`.
- **Deploy:** `dist/` drops straight onto itch.io / GitHub Pages / Netlify. For a subpath
  host (e.g. GitHub Pages project site), set `base` in `vite.config.ts`.

## Hard rules (non-negotiable)

1. **State is separated from rendering.** Game state lives as plain data
   (`src/game/state/`, `src/game/types/`), independent of Phaser sprites. Scenes coordinate
   rendering and call systems — they do not contain the game rules.
2. **Data-driven everything.** Items, crops, enemies, maps, shops, armor sets, NPCs, loot
   tables, asset keys, and balance numbers live in `src/game/data/`. No gameplay rule should
   require editing a system to change a price, a name, or a growth time.
3. **Typed IDs, no magic strings.** Item/crop/map/npc/enemy/scene IDs are typed constants in
   `src/game/types/ids.ts`. Never sprinkle raw string literals through gameplay code.
4. **No god classes, no giant single scene.** One system per responsibility. Keep scenes thin.
5. **Centralize the cross-cutting concerns:** input, save/load, the asset manifest, and map
   transitions each have exactly one home. Do not scatter `localStorage` or asset paths.
6. **One storage model.** Backpack and chests reuse the same inventory logic.
7. **Procedural art only.** All textures are drawn in code at boot via
   `src/game/assets/TextureFactory.ts` using the fixed palette. No ugly placeholders; keep
   the set small, coherent, and replaceable through `assetKeys`.
8. **Always compiles, always runnable.** No broken imports, no dead half-wired systems, no
   duplicate concepts under different names. Build in **vertical slices** — each slice stays
   playable and visually pleasant.
9. **Tweakable for a non-programmer.** Assume a designer will later adjust crop times, names,
   prices, layouts, stats, drop rates, and dialogue. Keep those in data with clear names.
10. **Boring over clever.** Descriptive names, obvious code, comments only where they earn
    their keep.

## Folder structure

```
src/
  main.ts                 # Phaser game config + scene registration
  game/
    scenes/               # BootScene, FarmScene, UIScene, ... (thin coordinators)
    systems/              # Input, PlayerController, Interaction, Inventory, Farming,
                          #   Economy, Time, ... (the rules; no Phaser rendering logic)
    state/                # GameStateStore — owns plain-data game state
    data/                 # Registries: palette, assetKeys, items, crops, maps, balance, ...
    ui/                   # HUD / toast helpers used by UIScene
    assets/               # TextureFactory (procedural art)
    save/                 # SaveSystem — the only localStorage I/O
    types/                # ids.ts (typed IDs), models.ts (state interfaces)
tests/                    # Vitest pure-logic tests
```

## Designer-tweakable surface

These files are safe to edit without touching game logic:

- `src/game/data/items.ts` — item names, sell prices, stack behaviour.
- `src/game/data/crops.ts` — crop seed/harvest items, growth duration & stages, seed order.
- `src/game/data/maps.ts` — map layouts, spawn points, plots, chests, shipping box, chicken,
  bush, NPC and prop placements, and exits (doors/cottage/signpost) that link maps.
- `src/game/data/shops.ts` — shop titles, goods, prices, optional unlock conditions.
- `src/game/data/npcs.ts` — NPC names, sprites, shop links, and dialogue/hint lines.
- `src/game/data/balance.ts` — tick length, starting gold, threat rates, tuning constants.
- (Later) `enemies.ts`, `armor.ts`, `loot.ts`, dialogue tables.

If you add a new tweakable, put it in `data/` and document it here.

## Implementation steps (build order)

Build strictly in this order. **Do not expand beyond the current step.** After each step,
write a short summary: *what works now / what files changed / what designers can tweak /
what to build next / any architecture debt introduced.*

0. **Scaffold** — Vite/TS/Phaser/Vitest, folder structure, palette, asset keys, typed IDs,
   save system skeleton. *(done together with step 1.)*
1. **MVP vertical slice** — player moves on one cute farm map; plant one crop and harvest it;
   inventory works; sell at the shipping box for gold; versioned save/load; one general
   interaction system; minimal UI (gold / inventory / interaction prompt / feedback toast).
2. House + chest (shared storage model).
3. Village + seed seller + blacksmith (data-driven shops).
4. Chickens + bushes (foraging) + crops 2 & 3.
5. Ruins + combat (hearts/HP, one attack, enemy data/behavior/drops).
6. Farm threat system (light pressure, clear warnings).
7. Legendary equipment set (original names, found in ruins, per-piece effects).
8. Village boy affection (talk once/day, rare gifts, tiers).
9. Boss fight + ending/result screen (final gold = high score).

The full design for every step above is in `PROJECT.md`. Keep that as the source of truth
for the backlog so the codebase never carries unfinished systems ahead of their slice.

## Testing

Add lightweight Vitest tests for pure logic as each slice lands: inventory add/remove/
transfer, crop growth ticks, save/load round-trip + migration, registry validity, economy
sell math, and later threat, combat damage/drops, and affection gain. Test the data and
systems, not Phaser rendering.

## Workflow

- Do exactly the requested step; leave the rest in the backlog.
- Keep it small, polished, and stable over feature-complete-but-broken.
- Run `npm run typecheck` and `npm run test` before considering a step done.
