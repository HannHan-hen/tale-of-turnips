# Generated raster assets

These image files are **team-generated** with an image model and committed here, then loaded
by `BootScene` under a key from `assetKeys.ts` (see CLAUDE.md rule 7, route 3). Gameplay only
ever references the key, never the file path. To keep the art reproducible and swappable,
record every asset's source model and the exact prompt below.

| Key (`TextureKey`) | File | Model | Notes |
|---|---|---|---|
| `TitleBackdrop` | `title_backdrop.jpg` | ChatGPT (GPT Image) | Title/menu backdrop. Resized to 1280×720, saved as quality-86 progressive JPEG (no alpha needed). |

## Prompts

### `title_backdrop.jpg`
> Cozy hand-painted farm background for a cute browser farming game, Flash-era toy aesthetic.
> A soft rolling green farm field under a warm morning sky with gentle gradient (light blue to
> pale cream near horizon), a few simple fluffy clouds, distant soft hills, a treeline edge.
> Whimsical, clean, low-detail, readable — not noisy. Muted harmonious palette: grass greens
> (#8bbf5a, #6fa247), soil brown (#9a6440), warm sky. Wide 16:9, no characters, no text, no UI,
> no border. Flat illustration, soft shading, suitable as a scrolling game backdrop.
