// Names for cross-scene UI messages, emitted on the global game event emitter.
// FarmScene emits; UIScene listens. Centralized so they stay in sync.

export const UiEvent = {
  Hud: 'ui:hud', // refresh gold + inventory counts (UIScene reads the store)
  Prompt: 'ui:prompt', // string | null — the interaction prompt text
  Toast: 'ui:toast', // string — short feedback message
} as const;
export type UiEvent = (typeof UiEvent)[keyof typeof UiEvent];
