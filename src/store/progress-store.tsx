import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { MOCK_COURSE } from '@/data/mock-course';
import {
  advanceStreak,
  badgesByIds,
  evaluateEarnedBadges,
  titleForXp,
  xpForLesson,
} from '@/lib/gamification';
import type { Course } from '@/types/content';
import {
  INITIAL_PROGRESS,
  type LessonResult,
  type Title,
  type UserProgress,
} from '@/types/progress';

/**
 * Central store for everything the player earns. Phase 1 keeps state in memory;
 * Phase 4 will hydrate/persist this to the device and Phase 5 will sync it to
 * Supabase. Components should read derived values (title, etc.) rather than
 * recompute them, so the gamification rules live in one place.
 */
type ProgressContextValue = {
  course: Course;
  progress: UserProgress;
  /** Current title, derived from XP. */
  title: Title;
  /** Result of the most recently completed lesson — consumed by the results screen. */
  lastResult: LessonResult | null;
  /** Record a finished lesson + quiz. Returns the result summary. */
  completeLesson: (lessonId: string, correct: number, total: number) => LessonResult;
  isLessonCompleted: (lessonId: string) => boolean;
  resetProgress: () => void;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const course = MOCK_COURSE;
  const [progress, setProgress] = useState<UserProgress>(INITIAL_PROGRESS);
  const [lastResult, setLastResult] = useState<LessonResult | null>(null);

  const completeLesson = useCallback(
    (lessonId: string, correct: number, total: number): LessonResult => {
      const isPerfect = total > 0 && correct === total;
      const xpEarned = xpForLesson(correct, total);

      let result: LessonResult = {
        lessonId,
        correct,
        total,
        isPerfect,
        xpEarned,
        leveledUpTo: null,
        newBadges: [],
      };

      setProgress((prev) => {
        const titleBefore = titleForXp(prev.xp);

        const completedLessonIds = prev.completedLessonIds.includes(lessonId)
          ? prev.completedLessonIds
          : [...prev.completedLessonIds, lessonId];

        const streak = advanceStreak(prev);

        const draft: UserProgress = {
          ...prev,
          xp: prev.xp + xpEarned,
          completedLessonIds,
          perfectQuizCount: prev.perfectQuizCount + (isPerfect ? 1 : 0),
          ...streak,
        };

        const earnedBadgeIds = evaluateEarnedBadges(draft, course);
        const newBadgeIds = earnedBadgeIds.filter((id) => !prev.earnedBadgeIds.includes(id));

        const titleAfter = titleForXp(draft.xp);
        result = {
          ...result,
          leveledUpTo: titleAfter.id !== titleBefore.id ? titleAfter : null,
          newBadges: badgesByIds(newBadgeIds),
        };

        return { ...draft, earnedBadgeIds };
      });

      setLastResult(result);
      return result;
    },
    [course],
  );

  const isLessonCompleted = useCallback(
    (lessonId: string) => progress.completedLessonIds.includes(lessonId),
    [progress.completedLessonIds],
  );

  const resetProgress = useCallback(() => {
    setProgress(INITIAL_PROGRESS);
    setLastResult(null);
  }, []);

  const value = useMemo<ProgressContextValue>(
    () => ({
      course,
      progress,
      title: titleForXp(progress.xp),
      lastResult,
      completeLesson,
      isLessonCompleted,
      resetProgress,
    }),
    [course, progress, lastResult, completeLesson, isLessonCompleted, resetProgress],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error('useProgress must be used inside a <ProgressProvider>');
  }
  return ctx;
}
