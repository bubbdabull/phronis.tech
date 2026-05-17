import { getLessonReadContent } from "./lesson-content";
import type { LessonReadContent } from "./lesson-content/types";
import { resolveLessonVideoUrl } from "./lesson-videos";
import type { Lesson } from "./types";

export type LessonPublic = {
  id: string;
  title: string;
  synopsis: string;
  estimatedMinutes: number;
  objectives: readonly string[];
  lectureOutline: readonly string[];
  videoUrl: string | null;
  readContent: LessonReadContent | null;
  lab: {
    title: string;
    scenario: string;
    deliverable: string;
  };
};

export function toLessonPublic(lesson: Lesson): LessonPublic {
  return {
    id: lesson.id,
    title: lesson.title,
    synopsis: lesson.synopsis,
    estimatedMinutes: lesson.estimatedMinutes,
    objectives: lesson.objectives,
    lectureOutline: lesson.lectureOutline,
    videoUrl: resolveLessonVideoUrl(lesson.id, lesson.videoUrl),
    readContent: getLessonReadContent(lesson.id),
    lab: {
      title: lesson.lab.title,
      scenario: lesson.lab.scenario,
      deliverable: lesson.lab.deliverable,
    },
  };
}
