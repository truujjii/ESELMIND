import type { Title } from '@/types/progress';

/**
 * The title ladder. The user's title is the highest one whose `minXp` they've
 * reached — so it updates automatically as XP grows. Keep this sorted ascending.
 */
export const TITLES: Title[] = [
  { id: 'baby', name: 'Baby Trader', emoji: '🍼', minXp: 0 },
  { id: 'teen', name: 'Teen Trader', emoji: '🧒', minXp: 150 },
  { id: 'adult', name: 'Adult Trader', emoji: '🧑', minXp: 400 },
  { id: 'pro', name: 'Pro Trader', emoji: '😎', minXp: 800 },
  { id: 'wizard', name: 'Market Wizard', emoji: '🧙', minXp: 1500 },
  { id: 'whale', name: 'Whale', emoji: '🐋', minXp: 3000 },
];
