/**
 * Structured curriculum for "Crypto Mastery" — portable data for APIs, CMS, or future UI.
 * Not financial or legal advice; pedagogy is technical and risk-aware.
 */

export type ReadingBlock = {
  readonly title: string;
  /** Study notes: what to read, which chapters, or which free course to parallel. */
  readonly studyGuide: string;
  readonly estimatedMinutes: number;
};

export type Lesson = {
  readonly id: string;
  readonly title: string;
  readonly synopsis: string;
  readonly estimatedMinutes: number;
  readonly objectives: readonly string[];
  readonly readings: readonly ReadingBlock[];
  /** Main lecture beats — suitable for slides or self-study outline. */
  readonly lectureOutline: readonly string[];
  /** Optional lecture video (YouTube watch or youtu.be URL). */
  readonly videoUrl?: string;
  readonly lab: {
    readonly title: string;
    readonly scenario: string;
    readonly deliverable: string;
    readonly rubricHints: readonly string[];
  };
  readonly selfCheckQuestions: readonly string[];
};

export type CourseModule = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly lessons: readonly Lesson[];
};

export type Semester = {
  readonly id: string;
  readonly number: 1 | 2 | 3 | 4 | 5 | 6;
  readonly title: string;
  readonly description: string;
  readonly prerequisites: readonly string[];
  readonly modules: readonly CourseModule[];
};

export type CryptoMasteryProgram = {
  readonly version: string;
  readonly title: string;
  readonly subtitle: string;
  readonly catalogDescription: string;
  readonly learningOutcomes: readonly string[];
  readonly academicIntegrityNote: string;
  readonly disclaimer: string;
  readonly semesters: readonly Semester[];
};
