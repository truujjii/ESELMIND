import { BADGES } from '@/constants/badges';
import { TITLES } from '@/constants/titles';
import type { Course } from '@/types/content';
import { lessonsInOrder } from '@/types/content';
import type { Badge, Title, UserProgress } from '@/types/progress';

/** XP economy. Tweak here to retune the whole reward curve. */
export const XP = {
  perCorrectAnswer: 10,
  lessonComplete: 50,
  perfectQuizBonus: 25,
} as const;

/** XP earned by a single lesson completion. */
export function xpForLesson(correct: number, total: number): number {
  const perfect = total > 0 && correct === total;
  return (
    XP.lessonComplete +
    correct * XP.perCorrectAnswer +
    (perfect ? XP.perfectQuizBonus : 0)
  );
}

/** Minimum share of correct answers to pass a quiz (≥50%, e.g. 2 of 3). */
export const PASS_RATIO = 0.5;

/**
 * Whether a quiz score passes. Failing means the lesson isn't completed and the
 * next one stays locked — the player retries. `2/3` and `2/4` pass; `1/3` fails.
 */
export function isPassingScore(correct: number, total: number): boolean {
  return total > 0 && correct / total >= PASS_RATIO;
}

/** Highest title whose `minXp` the user has reached. */
export function titleForXp(xp: number): Title {
  let current = TITLES[0];
  for (const title of TITLES) {
    if (xp >= title.minXp) current = title;
  }
  return current;
}

/** The next title to unlock, or `null` if already at the top. */
export function nextTitleAfter(xp: number): Title | null {
  return TITLES.find((t) => t.minXp > xp) ?? null;
}

/** Progress (0–1) from the current title toward the next one. */
export function titleProgress(xp: number): {
  current: Title;
  next: Title | null;
  ratio: number;
  xpIntoTitle: number;
  xpForNext: number;
} {
  const current = titleForXp(xp);
  const next = nextTitleAfter(xp);
  if (!next) {
    return { current, next: null, ratio: 1, xpIntoTitle: xp - current.minXp, xpForNext: 0 };
  }
  const span = next.minXp - current.minXp;
  const into = xp - current.minXp;
  return {
    current,
    next,
    ratio: span > 0 ? Math.min(1, into / span) : 0,
    xpIntoTitle: into,
    xpForNext: next.minXp - xp,
  };
}

// ---------------------------------------------------------------------------
// Streak
// ---------------------------------------------------------------------------

/** Local date key, e.g. "2026-06-23". Streaks are day-based in local time. */
export function dateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isYesterday(prevKey: string, todayKey: string): boolean {
  const today = new Date(`${todayKey}T00:00:00`);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  return dateKey(yesterday) === prevKey;
}

/** Recompute streak fields after activity on `today`. Pure — returns the deltas. */
export function advanceStreak(
  progress: Pick<UserProgress, 'currentStreak' | 'bestStreak' | 'lastActiveDate'>,
  today = dateKey(),
): { currentStreak: number; bestStreak: number; lastActiveDate: string } {
  const { lastActiveDate } = progress;
  let currentStreak: number;

  if (lastActiveDate === today) {
    currentStreak = progress.currentStreak; // already counted today
  } else if (lastActiveDate && isYesterday(lastActiveDate, today)) {
    currentStreak = progress.currentStreak + 1;
  } else {
    currentStreak = 1; // first day or streak broken
  }

  return {
    currentStreak,
    bestStreak: Math.max(progress.bestStreak, currentStreak),
    lastActiveDate: today,
  };
}

// ---------------------------------------------------------------------------
// Badges
// ---------------------------------------------------------------------------

/** Full set of badge ids the user should currently hold, recomputed from scratch. */
export function evaluateEarnedBadges(progress: UserProgress, course: Course): string[] {
  const earned = new Set<string>();
  const completed = new Set(progress.completedLessonIds);

  if (progress.completedLessonIds.length >= 1) earned.add('first-lesson');
  if (progress.perfectQuizCount >= 1) earned.add('perfect-quiz');
  if (progress.bestStreak >= 7) earned.add('streak-7');

  const firstModule = course.modules[0];
  if (firstModule && firstModule.lessons.every((l) => completed.has(l.id))) {
    earned.add('module-1');
  }

  // Only return ids that exist in the catalogue.
  return BADGES.filter((b) => earned.has(b.id)).map((b) => b.id);
}

export function badgesByIds(ids: string[]): Badge[] {
  return BADGES.filter((b) => ids.includes(b.id));
}
