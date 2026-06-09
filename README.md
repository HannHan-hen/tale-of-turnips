# Tale of Turnips

A cozy browser farming-adventure toy. Grow crops for gold, pet chickens and forage
berries, brave the ruins for a dramatic legendary armor set, keep your farm safe from tiny
ruin monsters, charm a shy village boy named Jay — and finally still the Ruin Heart. Your
final gold total is the high score.

Built with **Vite + TypeScript + Phaser 3**. All art is generated in code — procedurally at
boot, or baked to PNGs by a checked-in generator (no hand-supplied assets); saves use
`localStorage`. No backend, no accounts.

## Play

**▶ Play in your browser — no install needed:**
**https://hannhan-hen.github.io/tale-of-turnips/**

Just click the link above on any computer, phone, or tablet. Your progress is
saved automatically in that browser. (The link is published automatically from
`main` by the GitHub Pages workflow below.)

To run it locally instead (for development):

```bash
npm install
npm run dev      # local dev server (open the printed URL)
```

## Controls

- **Move** — WASD or arrow keys
- **Interact** — `E` (plant/harvest, sell at the shipping box, open chests, talk to NPCs,
  open ruin caches, use doors/signposts)
- **Attack** — `Space` or `J` (a short swing in the way you're facing)
- **Choose seed to plant** — number keys `1` / `2` / `3` (turnip / radish / carrot)
- **Menus** (chest, shop, talk) — arrow keys to move, `Space`/`Enter` to confirm, `Esc` to
  close

## The loop

1. Plant and harvest crops; sell them at the **shipping box** for gold.
2. Buy seeds from **Marigold** and basic gear from **Bramble** in the village.
3. Pet **chickens** (one egg each per day) and forage **bushes** for berries.
4. Explore the **ruins**: fight monsters, gather drops, and find the five-piece **Starless
   Set** in caches (each piece auto-equips and grants an effect).
5. Manage **farm threat** — it rises after a 7-day grace period; clear ruin monsters to keep
   it down, or fight off the nibblers that raid your crops.
6. Talk to **Jay** by the village gate (once a day) and give him treasured items (once a day)
   to raise his affection.
7. With the full Starless Set, the **sealed door** in the ruins opens. Defeat the **Ruin
   Heart** to win — the result screen tallies your run and banks your high score.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` | Static production build into `dist/` |
| `npm run preview` | Serve the built `dist/` |
| `npm run test` | Vitest unit tests |
| `npm run typecheck` | `tsc --noEmit` |

## Deploy

The build output in `dist/` is plain static files and uses **relative asset paths**
(`base: './'` in `vite.config.ts`), so it works from any subpath.

- **itch.io** — `npm run build`, zip the contents of `dist/`, upload as an HTML5 project.
- **Netlify / any static host** — publish the `dist/` folder.
- **GitHub Pages** — push to `main`; the included workflow
  (`.github/workflows/deploy.yml`) builds and deploys automatically. Enable it once under
  **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Tweaking the game (no coding needed)

Gameplay values live as data in `src/game/data/` — safe to edit without touching systems:

- `crops.ts` — crop growth times, yields, seed/harvest items, planting order
- `items.ts` — item names, sell prices, stacking
- `shops.ts` — shop goods and prices
- `npcs.ts` — NPC names, sprites, dialogue, Jay's gift tastes and affection tiers
- `enemies.ts` — enemy stats, speed, and loot tables
- `armor.ts` — the Starless Set pieces and their effects (plus basic-gear bonuses)
- `maps.ts` — map layouts, spawn points, plots, chickens, bushes, NPCs, caches, exits
- `balance.ts` — day length, starting gold, combat tuning, threat rates, affection gains
- `palette.ts` — the whole color scheme (all art recolors from here)

See [`CLAUDE.md`](./CLAUDE.md) for the architecture rules and [`PROJECT.md`](./PROJECT.md)
for the full design.
