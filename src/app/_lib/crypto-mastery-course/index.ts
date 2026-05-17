export type {
  CourseModule,
  CryptoMasteryProgram,
  Lesson,
  ReadingBlock,
  Semester,
} from "./types";

export { CRYPTO_MASTERY_PROGRAM } from "./curriculum";
export {
  LESSON_VIDEO_URLS,
  MODULE_VIDEO_URLS,
  resolveLessonVideoUrl,
  resolveModuleVideoUrl,
  youtubeEmbedId,
} from "./lesson-videos";
export { toLessonPublic, type LessonPublic } from "./lesson-public";
export { getLessonReadContent, hasLessonReadContent } from "./lesson-content";
export type { LessonReadContent } from "./lesson-content/types";
export { findCourseModuleWithMedia, type CourseModuleWithMedia } from "./course-navigation";
export { SEMESTER_01 } from "./semester-01";
export { SEMESTER_02 } from "./semester-02";
export { SEMESTER_03 } from "./semester-03";
export { SEMESTER_04 } from "./semester-04";
export { SEMESTER_05 } from "./semester-05";
export { SEMESTER_06 } from "./semester-06";

import type { Lesson, Semester } from "./types";

import { CRYPTO_MASTERY_PROGRAM } from "./curriculum";

function lessonMinutes(lessons: readonly { estimatedMinutes: number }[]): number {
  return lessons.reduce((acc, l) => acc + l.estimatedMinutes, 0);
}

/** Sum of `Lesson.estimatedMinutes` for one semester (excludes ad-hoc reading time). */
export function getSemesterLessonMinutes(semester: Semester): number {
  return semester.modules.reduce((acc, m) => acc + lessonMinutes(m.lessons), 0);
}

/** Sum of lesson estimates for the full program. */
export function getProgramLessonMinutes(): number {
  return CRYPTO_MASTERY_PROGRAM.semesters.reduce((acc, s) => acc + getSemesterLessonMinutes(s), 0);
}

export function getSemesterByNumber(n: 1 | 2 | 3 | 4 | 5 | 6): Semester | undefined {
  return CRYPTO_MASTERY_PROGRAM.semesters.find((s) => s.number === n);
}

/** Linear scan by lesson id (stable ids across versions). */
export function getLessonById(lessonId: string): { semester: Semester; lesson: Lesson } | undefined {
  for (const semester of CRYPTO_MASTERY_PROGRAM.semesters) {
    for (const mod of semester.modules) {
      const lesson = mod.lessons.find((l) => l.id === lessonId);
      if (lesson) return { semester, lesson };
    }
  }
  return undefined;
}
