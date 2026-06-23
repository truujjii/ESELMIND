/**
 * Offline-first persistence for UserProgress.
 *
 * Local AsyncStorage is the always-available cache; Supabase `user_progress` is
 * the cross-device source of truth when signed in. The store writes through to
 * both on every change. On sign-in we `mergeProgress` the local cache with the
 * cloud row so anonymous progress isn't lost — the merge is a "best of both"
 * union, deliberately conflict-free (no last-write-wins data loss).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '@/lib/supabase';
import { INITIAL_PROGRESS, type LessonResult, type UserProgress } from '@/types/progress';

const STORAGE_KEY = 'eselmind.progress.v1';

// ---- Local cache ----------------------------------------------------------

export async function loadLocalProgress(): Promise<UserProgress | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    // Spread over INITIAL_PROGRESS so older payloads gain any new fields.
    return { ...INITIAL_PROGRESS, ...(JSON.parse(raw) as Partial<UserProgress>) };
  } catch {
    return null;
  }
}

export async function saveLocalProgress(progress: UserProgress): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // A failed cache write is non-fatal — in-memory state is still correct.
  }
}

// ---- Row <-> model mapping -------------------------------------------------

type ProgressRow = {
  xp: number;
  current_streak: number;
  best_streak: number;
  last_active_date: string | null;
  perfect_quiz_count: number;
  completed_lesson_slugs: string[];
  earned_badge_ids: string[];
};

function rowToProgress(row: ProgressRow): UserProgress {
  return {
    xp: row.xp,
    completedLessonIds: row.completed_lesson_slugs ?? [],
    currentStreak: row.current_streak,
    bestStreak: row.best_streak,
    lastActiveDate: row.last_active_date,
    perfectQuizCount: row.perfect_quiz_count,
    earnedBadgeIds: row.earned_badge_ids ?? [],
  };
}

function progressToRow(userId: string, p: UserProgress) {
  return {
    user_id: userId,
    xp: p.xp,
    current_streak: p.currentStreak,
    best_streak: p.bestStreak,
    last_active_date: p.lastActiveDate,
    perfect_quiz_count: p.perfectQuizCount,
    completed_lesson_slugs: p.completedLessonIds,
    earned_badge_ids: p.earnedBadgeIds,
  };
}

// ---- Remote sync ----------------------------------------------------------

export async function fetchRemoteProgress(userId: string): Promise<UserProgress | null> {
  const { data, error } = await supabase
    .from('user_progress')
    .select(
      'xp, current_streak, best_streak, last_active_date, perfect_quiz_count, completed_lesson_slugs, earned_badge_ids',
    )
    .eq('user_id', userId)
    .maybeSingle();
  if (error || !data) return null;
  return rowToProgress(data as ProgressRow);
}

export async function pushRemoteProgress(userId: string, progress: UserProgress): Promise<void> {
  const { error } = await supabase
    .from('user_progress')
    .upsert(progressToRow(userId, progress), { onConflict: 'user_id' });
  if (error) throw error;
}

/** Append-only completion log (analytics / future admin panel). Best-effort. */
export async function logLessonCompletion(userId: string, result: LessonResult): Promise<void> {
  try {
    await supabase.from('lesson_completions').insert({
      user_id: userId,
      lesson_slug: result.lessonId,
      correct: result.correct,
      total: result.total,
      is_perfect: result.isPerfect,
      xp_earned: result.xpEarned,
    });
  } catch {
    // Non-fatal: the aggregate row in user_progress is the source of truth.
  }
}

// ---- Merge ----------------------------------------------------------------

const union = (a: string[], b: string[]): string[] => Array.from(new Set([...a, ...b]));
const laterDate = (a: string | null, b: string | null): string | null =>
  !a ? b : !b ? a : a >= b ? a : b;

/** Conflict-free "best of both" merge — used when local progress meets the cloud. */
export function mergeProgress(a: UserProgress, b: UserProgress): UserProgress {
  return {
    xp: Math.max(a.xp, b.xp),
    completedLessonIds: union(a.completedLessonIds, b.completedLessonIds),
    currentStreak: Math.max(a.currentStreak, b.currentStreak),
    bestStreak: Math.max(a.bestStreak, b.bestStreak),
    lastActiveDate: laterDate(a.lastActiveDate, b.lastActiveDate),
    perfectQuizCount: Math.max(a.perfectQuizCount, b.perfectQuizCount),
    earnedBadgeIds: union(a.earnedBadgeIds, b.earnedBadgeIds),
  };
}
