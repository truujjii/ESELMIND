/**
 * Content model for ESELMIND courses.
 *
 * A Course is a tree: Course → Module → Lesson → QuizQuestion.
 * Lessons are the unit the learning path renders and the unit the user
 * "completes" (watch video → pass test). Quiz questions power the core
 * micro-loop (answer → instant feedback → next).
 */

export type QuestionOption = {
  id: string;
  text: string;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: QuestionOption[];
  correctOptionId: string;
  /** Shown after answering — makes the feedback satisfying *and* educational. */
  explanation: string;
};

export type Lesson = {
  id: string;
  title: string;
  summary: string;
  /** Video length in seconds (used for the player placeholder + UI). */
  durationSec: number;
  /** Mux playback id, wired in Phase 3. `null` renders a placeholder player. */
  muxPlaybackId: string | null;
  /** Accent color used by the placeholder thumbnail until video lands. */
  accent: string;
  /** Base XP awarded for completing the lesson (before per-answer bonuses). */
  xpReward: number;
  /** End-of-lesson test. */
  questions: QuizQuestion[];
};

export type Module = {
  id: string;
  title: string;
  lessons: Lesson[];
};

export type Course = {
  id: string;
  title: string;
  description: string;
  modules: Module[];
};

/** Flatten a course into an ordered list of lessons (the "path"). */
export function lessonsInOrder(course: Course): Lesson[] {
  return course.modules.flatMap((m) => m.lessons);
}

export function findLesson(course: Course, lessonId: string): Lesson | undefined {
  return lessonsInOrder(course).find((l) => l.id === lessonId);
}

/** The lesson immediately after `lessonId`, or `null` if it's the last one. */
export function nextLesson(course: Course, lessonId: string): Lesson | null {
  const all = lessonsInOrder(course);
  const idx = all.findIndex((l) => l.id === lessonId);
  if (idx === -1 || idx === all.length - 1) return null;
  return all[idx + 1];
}

export function moduleOfLesson(course: Course, lessonId: string): Module | undefined {
  return course.modules.find((m) => m.lessons.some((l) => l.id === lessonId));
}
