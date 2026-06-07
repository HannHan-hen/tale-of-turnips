# Codebase Quality Audit — Story of Turnips

Date: 2026-06-07

## Resolution pass (applied)

Every finding below has now been addressed. Build, typecheck, lint, Prettier, and the unit
suite (grown from 56 to **79 tests**) are all green.

**Correctness & type safety:**

- **Finding 2 — stale loadout/equipment.** `WorldScene` recomputes the cached loadout and max
  HP on the Phaser `RESUME` event, so gear bought in a shop or moved through a chest takes
  effect the moment the world scene resumes — no map change or restart required.
- **Finding 3 — shop/chest persistence.** `ShopScene` saves after a successful purchase and
  `ChestScene` saves after a transfer, so changes made while the world scene is paused survive
  an immediate tab close.
- **Finding 4 — `stats.cropsHarvested` migration.** `migrate` backfills
  `stats.cropsHarvested ??= 0`, covering partial `stats` objects from older saves (regression
  test added).
- **Finding 6 — `InteractionTarget` discriminated union.** Replaced the single optional-field
  interface with a union keyed by `kind`, removing every non-null assertion in `WorldScene`.
  Missing fields are now compile errors.
- **Finding 7 — enemy contact damage.** Normal enemy contact is re-measured after the enemy
  moves, matching the raid path and removing the one-frame lag.

**Architecture, polish & tooling:**

- **Finding 1 — `WorldScene` god scene.** Extracted pure systems: `WorldClockSystem`
  (tick/day/threat advance), `CropInteractionSystem` (plant/harvest rules), and
  `CacheInteractionSystem` (piece collection, loadout/heal/affection). The scene now renders
  their outcomes instead of owning the rules. (Combat/raid lifecycle stays in
  `CombatController`, which was already a separate object.)
- **Finding 5 — collision.** `CollisionSystem` derives solid tiles from map data (chests,
  NPCs, props, caches, bushes, shipping box); `movePlayer` resolves per-axis so the player
  slides along edges instead of passing through objects. Plots, exits, the spawn, and chickens
  stay walkable.
- **Finding 8 — test coverage.** Added suites for the new systems and collision, and expanded
  registry validation (placement bounds, valid exit/NPC/shop/enemy references, globally unique
  ids, spawn/exit tiles never solid).
- **Finding 9 — bundle size.** Phaser is split into its own cacheable chunk (~1.48 MB) and the
  app code is now a ~64 kB chunk; `chunkSizeWarningLimit` is set to a value we consciously
  accept since Phaser is the engine's irreducible floor.
- **Finding 10 — lint/format.** Added ESLint (flat config, TypeScript-aware) and Prettier with
  `lint`, `format`, and `format:check` scripts.
- **Finding 11 — dependency audit.** `npm audit --omit=dev` now reports **0 vulnerabilities**.
  The dev-only toolchain advisories (esbuild/vite dev server) require a breaking `vite@8` bump
  and do not affect the shipped static build; left for a deliberate major-version upgrade.

---

## Executive summary

This is a healthy small-game prototype: it builds, passes its current unit tests, uses strict TypeScript settings, keeps most tunable content in data registries, and stores game state as plain serializable data. The codebase is workable and not in crisis.

The main risk is architectural drift. The project rules explicitly call for thin scenes, one system per responsibility, and no god classes, but `WorldScene` now owns a large amount of gameplay orchestration and business logic. That makes future changes riskier and leaves many player-facing behaviors hard to unit test.

## Validation performed

The following checks were run during the audit:

- `npm test` — passed: 13 test files, 56 tests.
- `npm run typecheck` — passed.
- `npm run build` — passed, with a Vite warning about a large JS chunk.
- `npm audit --omit=dev` — could not complete because the npm audit endpoint returned `403 Forbidden` in the environment.

An initial attempt to run `npm test -- --runInBand` failed because Vitest does not support Jest's `--runInBand` option; this was an audit-command issue, not a project test failure.

## Strengths

### 1. Strong TypeScript baseline

The TypeScript configuration enables strict mode and useful safety options such as `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, and `noFallthroughCasesInSwitch`. This is a good baseline for keeping a small codebase honest.

### 2. Good data-driven content structure

Game content is mostly centralized in registries under `src/game/data/`, including maps, crops, items, enemies, shops, armor, NPCs, balance values, palette, and asset keys. That matches the stated project goal that designers should be able to tune content without editing systems.

### 3. Plain-data game state

The saved game model is plain TypeScript data rather than Phaser objects. This is the right approach for localStorage persistence, migration, and pure-logic testing.

### 4. Reusable pure inventory logic

Backpack and chest storage share the same inventory model and pure inventory functions. The inventory module is small, understandable, and covered by tests.

### 5. Current checks pass

The project currently passes its test suite, typecheck, and production build.

## Findings and recommendations

### Finding 1 — `WorldScene` has become a god scene

**Severity:** High  
**Category:** Architecture / maintainability

The project rules say scenes should coordinate rendering and call systems, not contain game rules. They also explicitly forbid god classes and giant single scenes. `WorldScene` now handles rendering, input orchestration, time advancement, autosave, interaction prompts, planting, harvesting, selling, NPC routing, map transitions, combat, loot, farm raids, crop devouring, cache rewards, armor updates, player damage, death/retreat, and boss victory.

**Why it matters:**

- Most future gameplay changes will require editing one large scene.
- Unit testing is harder because many rules are embedded in Phaser scene methods.
- Regressions are more likely as more features are added.

**Recommendation:**

Extract responsibilities into smaller systems/controllers. Good first candidates:

- `WorldClockSystem` or `GameLoopSystem` for tick/day/threat advancement.
- `InteractionResolver` for mapping targets to actions.
- `CropInteractionSystem` for plant/harvest logic.
- `RaidController` for farm raid lifecycle and crop devouring.
- `CacheInteractionSystem` for armor-cache collection.
- A save coordinator or explicit save calls in modal scenes.

### Finding 2 — Equipment/loadout can become stale after inventory changes

**Severity:** High  
**Category:** Gameplay correctness

Basic gear effects are computed from the player's inventory. `WorldScene` caches `this.loadout` during scene creation, then uses it for movement speed, crop yield, combat damage, and boss-door access. However, shop purchases and chest transfers can change the player inventory while the world scene remains paused, not restarted.

Examples:

- Buying a sword may not affect combat damage until the world scene is restarted or the player changes maps.
- Moving a vest or sword into/out of a chest may not update current max HP or combat damage consistently.

**Why it matters:**

Player-visible gear effects may feel broken or inconsistent.

**Recommendation:**

Avoid long-lived cached loadout state. Options:

- Recompute loadout on demand before movement/combat/interaction checks.
- Add a central `getLoadout()` accessor on the game state store.
- Emit and handle an `EquipmentChanged` event when shops/chests mutate equipment-relevant inventory.
- Recalculate max HP after chest transfers, not just after shop purchases.

### Finding 3 — Shop purchases and chest transfers are not saved immediately

**Severity:** High  
**Category:** Persistence / data loss

The world scene autosaves periodically, but it is paused while shop and chest modal scenes are open. Successful shop purchases and chest transfers mutate state but do not call `saveGame`. Closing those modal scenes also does not save.

**Why it matters:**

If the tab closes or refreshes immediately after a purchase or chest transfer, recent changes can be lost.

**Recommendation:**

Call `saveGame(this.store.state)` after:

- A successful shop purchase.
- A successful chest transfer.
- Closing shop/chest scenes, as an extra safety net.

### Finding 4 — Save migration is too shallow and misses `stats.cropsHarvested`

**Severity:** Medium  
**Category:** Save compatibility / robustness

The migration function backfills missing `stats`, `stats.chickensPetted`, and `stats.monstersDefeated`, but does not backfill `stats.cropsHarvested` if a partial `stats` object already exists. The ending screen expects this field to exist.

**Why it matters:**

Older or partially malformed saves can show `undefined` for crops harvested, and other malformed nested values can pass through migration unchecked.

**Recommendation:**

- Add `state.stats.cropsHarvested ??= 0` during migration.
- Validate nested values more thoroughly: inventory slots, item IDs, map IDs, numeric HP/gold/tick/day fields, affection records, and crop records.

### Finding 5 — Map collision/solidity is minimal

**Severity:** Medium  
**Category:** Gameplay polish

Player movement clamps to map bounds, but there is no general tile/object collision system. Rendered objects, props, NPCs, bushes, chests, and caches are interactable or visible, but they do not appear to contribute to movement blocking.

**Why it matters:**

The player can likely walk through many objects and NPCs. For a tiny toy this may be acceptable, but it reduces polish and can make interactions feel imprecise.

**Recommendation:**

Add a simple collision model to map data, such as:

- `solidTiles: TilePos[]`.
- `solid` flags on prop/NPC/object placements.
- Generated solidity from chests, NPCs, bushes, and caches.

Then update movement to resolve against that collision model.

### Finding 6 — Interaction targets rely on non-null assertions

**Severity:** Medium  
**Category:** Type safety

`InteractionTarget` is a single interface with many optional fields. `WorldScene` then uses non-null assertions like `target.plotIndex!`, `target.exitIndex!`, `target.bushId!`, and `target.pieceId!` depending on the interaction kind.

**Why it matters:**

TypeScript cannot prove the required field exists for each interaction kind. A malformed target becomes a runtime bug instead of a compile-time error.

**Recommendation:**

Replace the current interface with a discriminated union keyed by `kind`, for example:

```ts
type InteractionTarget =
  | { kind: InteractionKind.Plot; x: number; y: number; plotIndex: number }
  | { kind: InteractionKind.Chest; x: number; y: number; chestId: string }
  | { kind: InteractionKind.Cache; x: number; y: number; cacheId: string; pieceId: ArmorPieceId };
```

### Finding 7 — Normal enemy contact damage uses pre-movement distance

**Severity:** Low / Medium  
**Category:** Gameplay correctness

In normal enemy update logic, distance to the player is calculated before the enemy moves. The enemy may then move closer, but contact damage is still checked using the old distance. Raid enemy logic recalculates player contact after movement, so the two behaviors are inconsistent.

**Why it matters:**

Normal enemies may have a one-frame delay or slightly inconsistent contact behavior.

**Recommendation:**

After moving an enemy, recompute `Math.hypot(px - e.x, py - e.y)` before checking contact damage.

### Finding 8 — Scene-heavy behavior is under-tested

**Severity:** Medium  
**Category:** Test coverage

The test suite focuses on pure systems and data, which is a good strategy. However, because much gameplay logic currently lives inside scenes, many important behaviors are not covered by tests.

Examples of under-tested behavior:

- Shop purchase persistence.
- Chest transfer persistence and equipment recalculation.
- Cache collection side effects.
- Farm raid crop deletion.
- Boss victory side effects.
- Map transition interactions.

**Recommendation:**

Move more gameplay rules out of Phaser scenes into pure functions, then test those functions. Also expand registry tests to validate:

- All exits point to valid maps and in-bounds spawns.
- All NPC/shop IDs are valid.
- Chest/cache/chicken/bush IDs are unique.
- All placements are in bounds.
- Enemy spawns are in bounds.
- Interactable overlaps are intentional.

### Finding 9 — Production bundle is large for a tiny game

**Severity:** Low  
**Category:** Performance / delivery

The production build succeeds, but Vite warns that the single minified JS chunk is larger than 500 kB. The generated JS was about 1.54 MB minified and 359 kB gzip during the audit.

**Why it matters:**

This may be acceptable for a Phaser browser game, but it is heavier than ideal for a very small toy game.

**Recommendation:**

- Accept the warning if simplicity matters more than load size.
- Otherwise investigate Phaser custom builds, manual chunks, or lazy-loading less critical scenes.
- Only raise `build.chunkSizeWarningLimit` if the team consciously accepts the bundle size.

### Finding 10 — No lint or formatting script

**Severity:** Low  
**Category:** Tooling

The project has scripts for dev, build, preview, test, test watch, and typecheck, but no lint or format check.

**Why it matters:**

TypeScript catches many issues, but not style drift, complexity patterns, import consistency, or broader code-quality rules.

**Recommendation:**

Add one or more of:

- ESLint with TypeScript rules.
- Prettier.
- `npm run lint`.
- `npm run format:check`.

### Finding 11 — Dependency audit could not be completed

**Severity:** Unknown  
**Category:** Security / environment limitation

`npm audit --omit=dev` failed because the audit endpoint returned `403 Forbidden` in the audit environment.

**Why it matters:**

Dependency vulnerability status was not verified.

**Recommendation:**

Run `npm audit --omit=dev` or an equivalent dependency scanner in the developer's normal environment/CI.

## Suggested priority order

1. Fix persistence gaps in shop and chest scenes.
2. Fix stale loadout/equipment recalculation.
3. Add the missing `stats.cropsHarvested` migration backfill.
4. Extract crop interaction, cache interaction, and raid behavior out of `WorldScene`.
5. Convert `InteractionTarget` to a discriminated union.
6. Expand registry and pure-logic tests.
7. Add simple collision/solidity data.
8. Add lint/format scripts.
9. Decide whether the bundle-size warning is acceptable.
10. Re-run dependency audit in an environment where the registry permits it.
