// The single harmonious color palette. All procedural art draws from here so the whole
// game stays visually coherent. Tweak these to re-theme everything at once.

export const palette = {
  skyNight: 0x2a2233, // page + canvas background
  grass: 0x8bbf5a,
  grassDark: 0x6fa247,
  grassTuft: 0xa6d672,
  soil: 0x9a6440,
  soilDark: 0x744a30,
  wood: 0xb98a52,
  woodDark: 0x8a6238,
  leaf: 0x66b257,
  leafDark: 0x47924a,
  bulb: 0xf3efe2, // turnip body
  bulbTop: 0xb5567f, // turnip pink-purple crown
  skin: 0xf2c79b,
  hair: 0x6b4a8a,
  cloth: 0xd96a8a,
  clothDark: 0xb04a6a,
  floorWood: 0xc89b63,
  floorWoodDark: 0xa97c46,
  wall: 0x7a5e8a,
  wallDark: 0x5e486b,
  roof: 0xc4566a,
  roofDark: 0xa03f54,
  window: 0xbfe3e0,
  metal: 0xe8d28a,
  steel: 0x9fb0c3,
  steelDark: 0x6b7d92,
  apronGreen: 0x6fa247,
  apronRed: 0xb04a4a,
  carrot: 0xe8862e,
  carrotDark: 0xc96a1e,
  pumpkin: 0xe07b2e,
  pumpkinDark: 0xb85f1e,
  pumpkinRib: 0xf2a24e,
  berry: 0x9b3b6a,
  berryLeaf: 0x4f8a45,
  egg: 0xf5ecd6,
  chickenBody: 0xfbf6ec,
  chickenComb: 0xd9594f,
  beak: 0xe8a23a,
  stone: 0x8a8090,
  stoneDark: 0x615868,
  outline: 0x33293f,
  uiInk: 0xfdf6e3,
  uiPanel: 0x3a3047,
  uiHighlight: 0x5a4a6b,
  gold: 0xf2c14e,
} as const;

export type PaletteColor = (typeof palette)[keyof typeof palette];

// Convert a 0xRRGGBB number to a CSS hex string (for Phaser text styles).
export function toCss(color: number): string {
  return '#' + color.toString(16).padStart(6, '0');
}
