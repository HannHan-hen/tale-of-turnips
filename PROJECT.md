# Story of Turnips — Project Plan

The complete design record. This is the source of truth for the backlog so nothing is lost
between vertical slices. Rules and build order live in [`CLAUDE.md`](./CLAUDE.md).

---

## 1. Goal & pitch

Create a small, polished, browser-playable farming adventure inspired by old Flash games.
The player grows crops, harvests resources, sells goods, protects the farm from ruin
monsters, collects a dramatic fantasy equipment set, defeats the boss in the ruins, and may
impress a cute village boy along the way.

**Core pitch:** a cozy browser farming-adventure toy where you grow crops for gold, protect
your farm from tiny ruin monsters, collect an absurdly dramatic fantasy armor set, defeat
the ruin boss, and use your final gold total as the high score.

**Game goal:** defeat the boss in the ruins. The full legendary equipment set is required or
strongly recommended to win. On victory, show an ending/result screen.

## 2. Design feel & visual guidelines

Cute, cozy, toy-like, readable, whimsical, slightly strange, old-Flash-inspired, small but
polished. It should feel like a finished tiny toy, not a technical demo.

- **Art is procedural** (drawn in code at boot). Keep the set small so everything looks
  consistent and finished. Prefer fewer polished objects over many rough ones.
- **Limited, harmonious palette** (~12 colors, defined in `src/game/data/palette.ts`).
- Clear silhouettes. Avoid noisy detail. Avoid style inconsistency.
- All textures referenced through `assetKeys` so art is replaceable without touching logic.

## 3. Technology & constraints

- TypeScript + Phaser 3 + Vite. Vitest for tests.
- Runs entirely in the browser. Build output is static files for itch.io / GitHub Pages /
  Netlify. No backend, no accounts, no multiplayer, no paid external services.
- `localStorage` for saves, via a single centralized save system.

## 4. Architecture

- **Game state is independent of rendering.** State exists as plain data structures; Phaser
  scenes coordinate rendering and updates and call into systems. Scenes never hold the rules.
- **Data-driven registries** for items, crops, enemies, maps, shops, armor sets, NPCs, loot
  tables, and asset keys.
- **Typed IDs / constants** for item, crop, map, npc, enemy, scene IDs and interaction types
  — no hardcoded magic strings.
- One system per responsibility; no god classes; no single giant scene.

### Folder structure

```
src/
  main.ts
  game/
    scenes/   systems/   state/   data/
    ui/       assets/    save/    types/
tests/
```

## 5. Data model

Described as TypeScript-shaped interfaces (final field sets may grow per slice):

```ts
GameState        { player, maps, time, threat, npcs, version }
PlayerState      { mapId, x, y, facing, gold, hearts, inventory, equipped }
Inventory        { slots: ItemStack[] }          // shared by backpack & chests
ItemStack        { itemId: ItemId, count: number }
CropInstance     { cropId, mapId, x, y, growth, watered?, plantedTick }
ChestState       { id, inventory: Inventory }
MapState         { mapId, crops: CropInstance[], chests, entities }
EnemyState       { enemyId, mapId, x, y, hp, state }
ThreatState      { ruinThreat: number, farmMonsters: EnemyState[] }
ArmorState       { collectedPieceIds: ArmorPieceId[], equippedSetId? }
NpcAffectionState{ npcId, points, talkedToday, giftedItemIds }
SaveData         { version: number, state: GameState }
InteractionTarget{ kind, ref }                   // what the interact key acts on
```

**NPC definition:** `id`, `displayName`, `mapId`, `position`, `dialogueByAffectionTier`,
`dialogueByStoryProgress`, `specialGiftItemIds`, `lovedGiftItemIds`.

**Crop definition:** `cropId`, `seedItem`, `harvestItem`, `growthDuration`, `growthStages`,
optional `waterRequirement`, sell value (via the harvest item).

**Shop definition:** `shopId`, `npcName`, `items[]`, `prices`, optional `unlockCondition`.

**Item definition:** `itemId`, `displayName`, optional `sellPrice`, stack behaviour, icon key.

## 6. Systems (one responsibility each)

Input · Player controller · Interaction · Inventory · Chest/storage · Farming · Chicken ·
Foraging · Economy/selling · Shop · Combat · Threat · Armor/progression · NPC/affection ·
Save/load · Map transition · UI.

Combat data, behavior, hit detection, damage, and drops are separated from each other and
must not contaminate farming code.

## 7. Maps

- **Farm:** crops, chickens, bushes, shipping/selling box, farm chest, entrance to house,
  path to village/ruins.
- **House:** simple interior, chest/storage, optional bed/save point.
- **Village:** small utility hub (not a life sim) — seed seller, blacksmith, cute village
  boy NPC, optional hint NPC. *No* schedules, relationship webs, festivals, town management,
  reputation, complex quests, or large dialogue trees.
- **Ruins:** combat area with monsters, rare drops, legendary equipment pieces, and boss
  access. Clearing monsters reduces farm threat.

Maps are small, data-driven definitions; transitions are centralized; art is replaceable
without rewriting systems.

## 8. Core loop

Farm crops & gather → sell for gold → buy seeds & basic gear → explore ruins to reduce
threat and find legendary equipment → protect the farm from monsters → talk to the village
boy → collect the full legendary set → defeat the ruin boss → final gold total = high score.

## 9. Subsystem rules

**Time:** simple internal day/tick system (no complex calendar). The player can tell when
crops grow. Daily village-boy chat resets each day. Farm threat may rise each day.

**Economy:** sell crops, berries, eggs, monster drops, treasure. Each item may carry a sell
price. Gold lives in player state, is saved, and shown in the UI. Use a simple shipping box
or selling menu. Keep it simple.

**Shops:** seed seller sells seeds; blacksmith sells basic early-game sword/armor. Inventories
are data-driven. Basic gear helps early ruin survival but must not replace the legendary set.

**Farming:** start with three vegetable types. Crop logic is deterministic and easy to tune.
Crop instances store crop id, map, position, growth state, watered state (if used), planted
tick.

**Chickens:** interactable; petting gives immediate feedback; track daily pet/lightweight
affection. Eggs may exist — do not overbuild animal simulation.

**Foraging:** bushes can be harvested and regrow on a simple timer; some rare forage items
are special gifts.

**Inventory:** stackable items keyed by item ID (never display name). Supports add, remove,
has, count, transfer to/from chest, sell. Backpack and chest reuse the same storage logic.

**Chest:** in house or farm; stores item stacks using the same item model; must be saved.

**Combat:** simple and readable; hearts/basic HP; one attack action to start; cute enemies;
no complex RPG stats. Enemy data, behavior, hit detection, damage, and drops are separated.

**Farm threat:** track a simple `ruinThreat`. Each day threat increases; defeating ruin
monsters reduces it. Above a threshold, small monsters appear on the farm and target planted
crops, damaging/eating them if they reach them; the player can defeat them. Keep the pressure
light — no disaster spirals, no tower defense. Give clear warnings, e.g. "Something rustles
near the ruins." / "Tiny monsters are eyeing your crops." / "The farm is safe for now."

## 10. Legendary equipment

Original names only (no copyrighted names). Candidate set names: **Starless Set**, Obsidian
Set, Nightroot Set, Beetle Knight Set, Moonless Set.

Pieces: helmet, armor, gloves, boots, weapon. Each has a simple effect:
- weapon — damages stronger monsters
- armor — adds hearts
- boots — improve movement / dodge
- gloves — improve harvest / combat interaction
- helmet — reveals or opens the boss door

Equipment is **found in the ruins, not bought.** The full set unlocks/enables the boss fight.

## 11. Village boy (lightweight romance)

One cute romance-interest NPC; a secondary goal, not a dating sim.

- Talk once per day; talking raises affection slowly. Dialogue changes by affection tier and
  story progress.
- Gifts are rare and special (not a daily chore): valid special gift items only, larger
  affection increase than talking, special dialogue, occasional and meaningful. Gift items
  mostly come from rare ruin drops, strange monster trinkets, special flowers/berries, unique
  treasures, and boss-related items.
- Affection also rises from story progress (clearing ruin threat, defeating the boss).

**Ending relationship tiers:** barely knows you → thinks you are dependable → waits for you
by the village gate → deeply impressed by your strange farming-warrior lifestyle.

## 12. Interactions & controls

One general interaction system: the player stands near something and presses one interact
key. Interactables: crop plots, chickens, bushes, chest, shipping box, shops, NPCs,
doors/map exits, loot, ruin objects. Do not invent separate input logic per object.

**Controls (keyboard first, centralized & remappable later):** WASD/arrows to move; one
interact key (E or Space); one attack key (once combat exists).

## 13. UI

Minimal: show gold, inventory/item counts, selected item/tool if relevant, health (if
combat), interaction prompts, and short feedback text — e.g. "Petted chicken.", "Picked
berries.", "Sold turnips.", "Inventory full.", "He liked that."

## 14. Save system

`localStorage`, centralized in one module. `SaveData` carries a version number. Handle
missing/older fields gracefully and fall back to a new game if a save is invalid. No
scattered `localStorage` calls.

## 15. Result / ending screen

Shows: final gold total (high score), days survived, crops harvested, chickens petted,
monsters defeated, armor pieces collected, relationship outcome with the village boy.

## 16. Testing

Lightweight tests for pure logic: inventory add/remove, chest transfer, crop growth, save/
load migration, item registry validity, shop purchase logic, threat increase/reduction,
combat damage/drop logic, affection gain.

## 17. Vertical-slice roadmap (backlog)

Build in slices; each stays runnable and visually pleasant. **The current slice is the only
thing implemented in code; everything below it lives here until its turn.**

1. **MVP — done.** player moves; one cute farm map; one crop plant→grow→harvest;
   inventory; sell at shipping box for gold; versioned save/load; general interaction system;
   minimal UI. *Deliverable: a playable, persistent, polished farming loop.*
2. **House + chest — done.** house interior, centralized map transitions (door/cottage
   exits), and a chest reusing the shared inventory model via a keyboard chest screen.
3. **Village + shops — done.** village map, signpost link from the farm, NPCs (seed seller,
   blacksmith, hint villager), and data-driven shop purchasing via a keyboard shop screen.
4. **Animals & more crops — done.** chickens (pet once/day → egg), bushes (forage + regrow),
   carrot & pumpkin crops, a number-key seed selector, and a day counter.
5. **Ruins + combat — done.** ruins map (reached via the village), player hearts with
   i-frames, a one-button swing, two data-driven enemies with chase AI and loot drops, and
   a gentle faint-and-retreat on defeat.
6. **Threat — done.** `ruinThreat` rises daily after a 7-day grace period and falls as
   monsters are defeated; above a threshold, nibblers raid the farm and eat crops unless
   intercepted. Clear arrival warnings (safe / rustling / raid) and a HUD threat readout.
7. **Legendary set — done.** the Starless Set: five pieces found in ruin caches,
   auto-equipped, each with a live effect (+attack/+hearts/+speed/+harvest, helmet opens the
   boss door). HUD set tracker; completion gates the boss (consumed by the boss slice).
8. **Village boy — done.** Jay (grandson of Bramble & Marigold), a shy, honest boy by the
   gate. Talk once/day and gift once/day via a modal screen; tiered dialogue; loved/liked
   gifts; completing the Starless Set bumps affection. Outcome feeds the ending.
9. **Boss + ending:** boss fight gated by the set; result screen with the full stat summary.

## 18. Risks & anti-overengineering guardrails

- **Scope creep is the main risk.** Keep MVP minimal; resist building backlog systems early.
- No NPC schedules, relationship webs, festivals, town management, reputation, complex quests,
  or large dialogue trees.
- No disaster spirals, no tower defense, no complex economy, no complex calendar, no complex
  RPG stat system, no huge custom engine.
- No dead half-implemented systems wired into gameplay. No duplicate concepts under different
  names. No hidden magic values inside functions — put tunables in `data/`.
- Prefer boring, obvious code. Keep the game small, polished, and stable.
