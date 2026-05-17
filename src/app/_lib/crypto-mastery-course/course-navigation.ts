import { CRYPTO_MASTERY_PROGRAM } from "./curriculum";
import { resolveModuleVideoUrl } from "./lesson-videos";
import { toLessonPublic, type LessonPublic } from "./lesson-public";
import type { CourseModule, Semester } from "./types";

export type CourseModuleNav = {
  readonly moduleId: string;
  readonly semesterNumber: Semester["number"];
  readonly semesterId: string;
  readonly semesterTitle: string;
  readonly moduleTitle: string;
  readonly moduleDescription: string;
};

export function flattenCourseModules(): CourseModuleNav[] {
  const out: CourseModuleNav[] = [];
  for (const sem of CRYPTO_MASTERY_PROGRAM.semesters) {
    for (const mod of sem.modules) {
      out.push({
        moduleId: mod.id,
        semesterNumber: sem.number,
        semesterId: sem.id,
        semesterTitle: sem.title,
        moduleTitle: mod.title,
        moduleDescription: mod.description,
      });
    }
  }
  return out;
}

export function findCourseModule(moduleId: string): (CourseModuleNav & { lessons: CourseModule["lessons"] }) | null {
  for (const sem of CRYPTO_MASTERY_PROGRAM.semesters) {
    for (const mod of sem.modules) {
      if (mod.id === moduleId) {
        return {
          moduleId: mod.id,
          semesterNumber: sem.number,
          semesterId: sem.id,
          semesterTitle: sem.title,
          moduleTitle: mod.title,
          moduleDescription: mod.description,
          lessons: mod.lessons,
        };
      }
    }
  }
  return null;
}

export type CourseModuleWithMedia = CourseModuleNav & {
  moduleVideoUrl: string | null;
  lessons: readonly LessonPublic[];
};

export function findCourseModuleWithMedia(moduleId: string): CourseModuleWithMedia | null {
  const meta = findCourseModule(moduleId);
  if (!meta) return null;
  return {
    moduleId: meta.moduleId,
    semesterNumber: meta.semesterNumber,
    semesterId: meta.semesterId,
    semesterTitle: meta.semesterTitle,
    moduleTitle: meta.moduleTitle,
    moduleDescription: meta.moduleDescription,
    moduleVideoUrl: resolveModuleVideoUrl(moduleId),
    lessons: meta.lessons.map(toLessonPublic),
  };
}
