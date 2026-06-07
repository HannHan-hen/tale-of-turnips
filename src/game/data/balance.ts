// Global tuning knobs. Safe for a non-programmer to adjust. No magic numbers in systems —
// they read from here.

export const Balance = {
  tickMs: 1500, // real milliseconds per growth tick
  dayLengthTicks: 40, // ticks per in-game day (drives daily resets)
  bushRegrowTicks: 16, // ticks for a foraged bush to bear fruit again
  berryYield: 2, // berries gathered per ready bush
  startingGold: 50,
  startingSeeds: 5,
  inventoryCapacity: 24, // number of stacks the backpack can hold
  chestCapacity: 30, // number of stacks a chest can hold
  playerSpeed: 130, // pixels per second
  interactRadius: 30, // how close (px) the player must be to interact
  autosaveMs: 4000, // how often the game autosaves
} as const;
