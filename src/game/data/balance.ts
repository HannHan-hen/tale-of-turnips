// Global tuning knobs. Safe for a non-programmer to adjust. No magic numbers in systems —
// they read from here.

export const Balance = {
  tickMs: 1500, // real milliseconds per growth tick
  dayLengthTicks: 20, // ticks per in-game day (drives daily resets)
  bushRegrowTicks: 16, // ticks for a foraged bush to bear fruit again
  berryYield: 2, // berries gathered per ready bush
  startingGold: 50,
  startingSeeds: 12,
  inventoryCapacity: 24, // number of stacks the backpack can hold
  chestCapacity: 30, // number of stacks a chest can hold
  playerSpeed: 130, // pixels per second
  interactRadius: 30, // how close (px) the player must be to interact
  autosaveMs: 4000, // how often the game autosaves

  // Combat (only matters in the ruins; hearts are global state)
  playerMaxHp: 5, // hearts
  attackOffset: 18, // px ahead of the player the swing lands
  attackRange: 26, // px radius of the swing
  attackDamage: 1,
  attackCooldownMs: 350,
  invulnMs: 900, // i-frames after taking a hit
  enemyAggroRange: 96, // px at which an enemy starts chasing
  enemyContactRange: 18, // px at which an enemy deals contact damage

  // Farm threat (light pressure; the first days are a peaceful grace period)
  threatGraceDays: 7, // no threat builds on or before this day
  threatPerDay: 1, // threat gained each day after the grace period
  threatPerKill: 1, // threat removed per monster defeated
  threatPerBoss: 1, // threat removed when a dungeon boss falls (once per day per boss)
  threatMax: 12, // cap
  farmThreatThreshold: 4, // at/above this, monsters raid the farm
  farmRaidMax: 3, // most raiders that can appear at once
  cropEatRange: 14, // px at which a raider devours a crop

  // Affection (the village boy). Talk once/day, gift once/day; story beats add a little too.
  affectionTalkGain: 1,
  affectionGiftLiked: 3,
  affectionGiftLoved: 6,
  affectionGiftRepeat: 1, // re-gifting an item type he's already received
  affectionStorySet: 4, // completing the Starless Set
  affectionMax: 30,
} as const;
