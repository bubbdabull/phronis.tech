import { SEMESTER_01_CONTENT } from "./semester-01";
import { SEMESTER_02_CONTENT } from "./semester-02";
import { SEMESTER_03_CONTENT } from "./semester-03";
import { SEMESTER_04_CONTENT } from "./semester-04";
import { SEMESTER_05_CONTENT } from "./semester-05";
import { SEMESTER_06_CONTENT } from "./semester-06";
import { getLessonExercises } from "./exercises";
import type { LessonReadContent } from "./types";

export type { LessonContentSection, LessonExercise, LessonKeyTerm, LessonReadContent, LessonReadingPublic } from "./types";

const ALL_LESSON_CONTENT: Record<string, LessonReadContent> = {
  ...SEMESTER_01_CONTENT,
  ...SEMESTER_02_CONTENT,
  ...SEMESTER_03_CONTENT,
  ...SEMESTER_04_CONTENT,
  ...SEMESTER_05_CONTENT,
  ...SEMESTER_06_CONTENT,
};

export function getLessonReadContent(lessonId: string): LessonReadContent | null {
  const base = ALL_LESSON_CONTENT[lessonId];
  if (!base) return null;
  const exercises = getLessonExercises(lessonId);
  if (!exercises.length) return base;
  return { ...base, exercises };
}

export function hasLessonReadContent(lessonId: string): boolean {
  return lessonId in ALL_LESSON_CONTENT;
}
