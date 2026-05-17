import type { Lesson } from "../types";
import type { LessonContentSection, LessonKeyTerm, LessonReadContent } from "./types";

export function sec(heading: string, ...paragraphs: string[]): LessonContentSection {
  return { heading, paragraphs };
}

export function terms(...items: [string, string][]): LessonKeyTerm[] {
  return items.map(([term, definition]) => ({ term, definition }));
}

export function lessonContent(
  sections: LessonContentSection[],
  keyTerms: LessonKeyTerm[],
  lesson: Pick<Lesson, "readings" | "selfCheckQuestions">,
  exercises: LessonReadContent["exercises"] = [],
): LessonReadContent {
  return {
    sections,
    keyTerms,
    readings: lesson.readings.map((r) => ({
      title: r.title,
      studyGuide: r.studyGuide,
      estimatedMinutes: r.estimatedMinutes,
    })),
    selfCheckQuestions: [...lesson.selfCheckQuestions],
    exercises,
  };
}
