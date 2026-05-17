export type LessonContentSection = {
  readonly heading: string;
  readonly paragraphs: readonly string[];
};

export type LessonKeyTerm = {
  readonly term: string;
  readonly definition: string;
};

export type LessonReadingPublic = {
  readonly title: string;
  readonly studyGuide: string;
  readonly estimatedMinutes: number;
};

export type LessonExercise = {
  readonly title: string;
  readonly prompt: string;
  readonly hint?: string;
};

/** Long-form study material shown in Academy (in addition to video + outline). */
export type LessonReadContent = {
  readonly sections: readonly LessonContentSection[];
  readonly keyTerms: readonly LessonKeyTerm[];
  readonly readings: readonly LessonReadingPublic[];
  readonly selfCheckQuestions: readonly string[];
  readonly exercises: readonly LessonExercise[];
};
