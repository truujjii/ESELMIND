/**
 * Progress + gamification model.
 *
 * `UserProgress` is the single source of truth for everything the player
 * earns: XP, completed lessons, streak, perfect quizzes and badges. It is
 * kept in memory in Phase 1, persisted to the device in Phase 4 and synced
 * to Supabase in Phase 5 — the shape stays the same across all three.
 */

export type Title = {
  id: string;
  /** e.g. "Baby Trader". */
  name: string;
  emoji: string;
  /** Minimum XP required to hold this title. */
  minXp: number;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  emoji: string;
};

export type UserProgress = {
  xp: number;
  completedLessonIds: string[];
  currentStreak: number;
  bestStreak: number;
  /** Local date key (yyyy-mm-dd) of the last day the user completed a lesson. */
  lastActiveDate: string | null;
  perfectQuizCount: number;
  earnedBadgeIds: string[];
};

export const INITIAL_PROGRESS: UserProgress = {
  xp: 0,
  completedLessonIds: [],
  currentStreak: 0,
  bestStreak: 0,
  lastActiveDate: null,
  perfectQuizCount: 0,
  earnedBadgeIds: [],
};

/** Summary of what a single lesson completion earned — drives the results screen. */
export type LessonResult = {
  lessonId: string;
  correct: number;
  total: number;
  isPerfect: boolean;
  xpEarned: number;
  /** Set when this completion pushed the user into a new title. */
  leveledUpTo: Title | null;
  /** Badges unlocked by this completion. */
  newBadges: Badge[];
};
