import type { Badge } from '@/types/progress';

/** Badge catalogue. IDs are referenced by the badge-evaluation logic. */
export const BADGES: Badge[] = [
  {
    id: 'first-lesson',
    name: 'Primer paso',
    description: 'Completaste tu primera lección',
    emoji: '🎓',
  },
  {
    id: 'perfect-quiz',
    name: 'Test perfecto',
    description: 'Acertaste todas las preguntas de un test',
    emoji: '💯',
  },
  {
    id: 'streak-7',
    name: 'En racha',
    description: 'Aprendiste 7 días seguidos',
    emoji: '🔥',
  },
  {
    id: 'module-1',
    name: 'Cimientos',
    description: 'Completaste el módulo de fundamentos',
    emoji: '📈',
  },
];

export const BADGE_BY_ID: Record<string, Badge> = Object.fromEntries(
  BADGES.map((b) => [b.id, b]),
);
