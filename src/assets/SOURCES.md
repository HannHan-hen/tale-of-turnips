# Generated raster assets

These image files are **team-generated** with an image model and committed here, then loaded
by `BootScene` under a key from `assetKeys.ts` (see CLAUDE.md rule 7, route 3). Gameplay only
ever references the key, never the file path. To keep the art reproducible and swappable,
record every asset's source model and the exact prompt below.

| Key (`TextureKey`) | File | Model | Notes |
|---|---|---|---|
| `TitleBackdrop` | `title_backdrop.jpg` | ChatGPT (GPT Image) | Title/menu backdrop. Resized to 1280×720, saved as quality-86 progressive JPEG (no alpha needed). |
| `Icon*` (17 keys) | `icons/<key>.png` | ChatGPT (GPT Image) | Item + armor icons. Generated as two magenta-background grids, then magenta-keyed, trimmed, and centered on 64×64 transparent squares by `tools/process_icons.py`. |
| `Portrait*` (4 keys) | `portraits/<key>.png` | ChatGPT (GPT Image) | NPC busts (Marigold, Bramble, Pip, Jay) from one 2×2 magenta grid, processed by `tools/process_portraits.py` (tighter key to also remove the drop shadow), centered on 256×256 squares. |

The icons were generated on a flat magenta (`#FF00FF`) background — the model can't be trusted
to make real transparency, so we key out a solid color in code instead. Re-run with:
`python3 tools/process_icons.py sheet1.png sheet2.png`.

## Prompts

### `title_backdrop.jpg`
> Cozy hand-painted farm background for a cute browser farming game, Flash-era toy aesthetic.
> A soft rolling green farm field under a warm morning sky with gentle gradient (light blue to
> pale cream near horizon), a few simple fluffy clouds, distant soft hills, a treeline edge.
> Whimsical, clean, low-detail, readable — not noisy. Muted harmonious palette: grass greens
> (#8bbf5a, #6fa247), soil brown (#9a6440), warm sky. Wide 16:9, no characters, no text, no UI,
> no border. Flat illustration, soft shading, suitable as a scrolling game backdrop.

### `icons/` — sheet 1 (4×3): turnip, carrot, radish, turnip/carrot/radish seed packets, egg, berry, worn sword, padded vest, ruin shard, shadow wisp
### `icons/` — sheet 2 (5×1): Starless Helm, Plate, Gauntlets, Greaves, Blade
Shared style: cute cozy Flash-era item icons, chunky bold shapes, soft cel shading, subtle
outline, top-left highlight, on a solid flat pure-magenta (#FF00FF) background with no shadows.
The Starless set adds a deep indigo metal "starless night" theme with faint star glints. Full
prompts are in the chat history; regenerate the sheets and re-run `tools/process_icons.py`.

### `portraits/` — 2×2 grid: Marigold (seed seller), Bramble (blacksmith), Old Pip (hint), Jay (village boy)
Head-and-shoulders busts in the cozy cel-shaded style, matching each character's in-game sprite
(hair/outfit/eyes). Solid flat pure-magenta (#FF00FF) background. The model added a soft drop
shadow despite the prompt; `tools/process_portraits.py` keys it out with a tighter ramp. Full
prompt is in the chat history; regenerate and re-run that script.
