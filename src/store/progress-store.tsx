import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { MOCK_COURSE } from '@/data/mock-course';
import {
  advanceStreak,
  badgesByIds,
  evaluateEarnedBadges,
  isPassingScore,
  titleForXp,
  xpForLesson,
} from '@/lib/gamification';
import {
  fetchRemoteProgress,
  loadLocalProgress,
  logLessonCompletion,
  mergeProgress,
  pushRemoteProgress,
  saveLocalProgress,
} from '@/lib/progress-sync';
import { useAuth } from '@/store/auth-store';
import type { Course } from '@/types/content';
import {
  INITIAL_PROGRESS,
  type LessonResult,
  type Title,
  type UserProgress,
} from '@/types/progress';

/**
 * Central store for everything the player earns. State is offline-first: it
 * hydrates from AsyncStorage on launch and writes through on every change, so it
 * survives reloads with no network. When signed in (see [[auth-store]]) it also
 * syncs to Supabase — on sign-in local + cloud are merged ([[progress-sync]]) so
 * anonymous progress is never lost. `completeLesson()` stays the single place
 * rewards are applied, so the gamification rules live in one transaction.
 */
type ProgressContextValue = {
  course: Course;
  progress: UserProgress;
  /** Current title, derived from XP. */
  title: Title;
  /** False until the local cache has been read on startup. */
  hydrated: boolean;
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
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress>(INITIAL_PROGRESS);
  const [lastResult, setLastResult] = useState<LessonResult | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Refs let completeLesson read the latest values without re-creating itself.
  const progressRef = useRef(progress);
  const userIdRef = useRef<string | null>(null);
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  // Write through to the local cache + the cloud (when signed in).
  const persist = useCallback((next: UserProgress) => {
    saveLocalProgress(next);
    const uid = userIdRef.current;
    if (uid) pushRemoteProgress(uid, next).catch(() => {});
  }, []);

  // 1. Hydrate from the on-device cache once, before anything else.
  useEffect(() => {
    loadLocalProgress().then((local) => {
      if (local) {
        progressRef.current = local;
        setProgress(local);
      }
      setHydrated(true);
    });
  }, []);

  // 2. When the signed-in user changes, reconcile local cache with the cloud.
  const userId = user?.id ?? null;
  useEffect(() => {
    userIdRef.current = userId;
    if (!hydrated || !userId) return;
    let cancelled = false;
    (async () => {
      const remote = await fetchRemoteProgress(userId);
      const merged = remote ? mergeProgress(progressRef.current, remote) : progressRef.current;
      if (cancelled) return;
      progressRef.current = merged;
      setProgress(merged);
      await saveLocalProgress(merged);
      pushRemoteProgress(userId, merged).catch(() => {});
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrated, userId]);

  const completeLesson = useCallback(
    (lessonId: string, correct: number, total: number): LessonResult => {
      const passed = isPassingScore(correct, total);
      const isPerfect = total > 0 && correct === total;
      const xpEarned = passed ? xpForLesson(correct, total) : 0;

      let result: LessonResult = {
        lessonId,
        correct,
        total,
        passed,
        isPerfect,
        xpEarned,
        leveledUpTo: null,
        newBadges: [],
      };

      // Only a passing score completes the lesson and applies rewards. A fail
      // leaves progress untouched, so the next lesson stays locked and the user
      // retries — the results screen shows the "try again" state.
      if (passed) {
        const prev = progressRef.current;
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

        const next: UserProgress = { ...draft, earnedBadgeIds };
        progressRef.current = next;
        setProgress(next);
        persist(next);

        const uid = userIdRef.current;
        if (uid) logLessonCompletion(uid, result);
      }

      setLastResult(result);
      return result;
    },
    [course, persist],
  );

  const isLessonCompleted = useCallback(
    (lessonId: string) => progress.completedLessonIds.includes(lessonId),
    [progress.completedLessonIds],
  );

  const resetProgress = useCallback(() => {
    progressRef.current = INITIAL_PROGRESS;
    setProgress(INITIAL_PROGRESS);
    setLastResult(null);
    persist(INITIAL_PROGRESS);
  }, [persist]);

  const value = useMemo<ProgressContextValue>(
    () => ({
      course,
      progress,
      title: titleForXp(progress.xp),
      hydrated,
      lastResult,
      completeLesson,
      isLessonCompleted,
      resetProgress,
    }),
    [course, progress, hydrated, lastResult, completeLesson, isLessonCompleted, resetProgress],
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
