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
  outline: 0x33293f,
  uiInk: 0xfdf6e3,
  uiPanel: 0x3a3047,
  gold: 0xf2c14e,
} as const;

export type PaletteColor = (typeof palette)[keyof typeof palette];

// Convert a 0xRRGGBB number to a CSS hex string (for Phaser text styles).
export function toCss(color: number): string {
  return '#' + color.toString(16).padStart(6, '0');
}
