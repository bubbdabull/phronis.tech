import { CRYPTO_MASTERY_PROGRAM } from "../curriculum";
import type { Lesson } from "../types";
import type { LessonExercise } from "./types";

function exercisesFor(lesson: Lesson): readonly LessonExercise[] {
  const lab = lesson.lab;
  return [
    {
      title: "Concept check",
      prompt: `Without looking at your notes, write 150–250 words explaining the core idea of “${lesson.title}.” Name one real protocol or incident that illustrates it.`,
      hint: "Start from the problem being solved, not the buzzwords.",
    },
    {
      title: "Applied drill",
      prompt: `${lab.scenario} Summarize your approach in bullet points before writing the full deliverable.`,
      hint: lab.rubricHints[0] ?? "Tie each step to a trust assumption or failure mode.",
    },
    {
      title: "Explorer / evidence task",
      prompt: `Find one on-chain transaction, block explorer page, or official doc that relates to “${lesson.title}.” Paste the link in your notes and annotate what each field means.`,
      hint: "Testnet examples are fine. Redact addresses if you publish notes publicly.",
    },
    {
      title: "Teach-back",
      prompt: `Record or script a 90-second explanation of this class for a smart friend who has never used crypto. End with one risk they should watch for.`,
    },
    {
      title: "Self-check deep dive",
      prompt: lesson.selfCheckQuestions.length
        ? `Answer in writing: ${lesson.selfCheckQuestions.join(" | ")}`
        : `List three questions you still have after this class, and where you would look to answer them (docs, papers, explorer).`,
    },
  ];
}

const CACHE: Record<string, readonly LessonExercise[]> = {};

function findLesson(lessonId: string): Lesson | undefined {
  for (const semester of CRYPTO_MASTERY_PROGRAM.semesters) {
    for (const mod of semester.modules) {
      const lesson = mod.lessons.find((l) => l.id === lessonId);
      if (lesson) return lesson;
    }
  }
  return undefined;
}

export function getLessonExercises(lessonId: string): readonly LessonExercise[] {
  if (CACHE[lessonId]) return CACHE[lessonId];
  const lesson = findLesson(lessonId);
  if (!lesson) return [];
  CACHE[lessonId] = exercisesFor(lesson);
  return CACHE[lessonId];
}
