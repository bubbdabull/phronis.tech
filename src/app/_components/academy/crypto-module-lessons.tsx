"use client";

import { BookOpen, Clock } from "lucide-react";

import { LessonReadContentView } from "@/_components/academy/lesson-read-content";
import { LessonVideoPlayer } from "@/_components/academy/lesson-video-player";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/_components/ui/card";
import { moduleVideoDuplicatesLesson } from "@/_lib/crypto-mastery-course/lesson-videos";
import type { LessonPublic } from "@/_lib/crypto-mastery-course/lesson-public";

type Props = {
  moduleVideoUrl: string | null;
  lessons: readonly LessonPublic[];
  semesterNumber: number;
  semesterTitle: string;
  moduleTitle: string;
  moduleDescription: string;
};

export function CryptoModuleLessons({
  moduleVideoUrl,
  lessons,
  semesterNumber,
  semesterTitle,
  moduleTitle,
  moduleDescription,
}: Props) {
  const showModuleOverview =
    moduleVideoUrl && !moduleVideoDuplicatesLesson(moduleVideoUrl, lessons);

  return (
    <section className="space-y-6" aria-labelledby="module-lessons-heading">
      <div>
        <h2 id="module-lessons-heading" className="font-serif text-xl font-medium text-phronis-foreground sm:text-2xl">
          Classes in this section
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-phronis-muted">
          Read each class below, watch the lecture video, then complete the section quiz. Semester {semesterNumber} · {semesterTitle}
        </p>
      </div>

      {showModuleOverview ? (
        <Card className="border-phronis-teal/20 bg-phronis-teal/[0.04]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{moduleTitle} — section overview</CardTitle>
            <CardDescription>{moduleDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <LessonVideoPlayer videoUrl={moduleVideoUrl!} title={`${moduleTitle} overview`} />
          </CardContent>
        </Card>
      ) : null}

      <ol className="space-y-8">
        {lessons.map((lesson, index) => (
          <li key={lesson.id}>
            <Card className="border-white/10">
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-phronis-teal/90">
                      Class {index + 1}
                    </p>
                    <CardTitle className="mt-1 text-lg">{lesson.title}</CardTitle>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-phronis-muted">
                    <Clock className="h-3 w-3" aria-hidden />
                    ~{lesson.estimatedMinutes} min
                  </span>
                </div>
                <CardDescription className="text-sm leading-relaxed">{lesson.synopsis}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {lesson.readContent ? (
                  <div className="rounded-lg border border-phronis-teal/15 bg-phronis-teal/[0.03] p-4 sm:p-6">
                    <p className="mb-4 text-[11px] font-medium uppercase tracking-wider text-phronis-teal/90">
                      Study guide — read first
                    </p>
                    <LessonReadContentView content={lesson.readContent} />
                  </div>
                ) : null}

                {lesson.videoUrl ? (
                  <div>
                    <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-phronis-muted">Lecture video</p>
                    <LessonVideoPlayer videoUrl={lesson.videoUrl} title={lesson.title} />
                  </div>
                ) : null}

                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-phronis-muted">Learning objectives</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-phronis-foreground/90">
                    {lesson.objectives.map((o) => (
                      <li key={o}>{o}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-phronis-muted">
                    <BookOpen className="h-3.5 w-3.5" aria-hidden />
                    Lecture outline
                  </p>
                  <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-phronis-foreground/90">
                    {lesson.lectureOutline.map((beat) => (
                      <li key={beat}>{beat}</li>
                    ))}
                  </ol>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-phronis-muted">Lab</p>
                  <p className="mt-1 text-sm font-medium text-phronis-foreground">{lesson.lab.title}</p>
                  <p className="mt-2 text-sm text-phronis-muted">{lesson.lab.scenario}</p>
                  <p className="mt-2 text-xs text-phronis-muted">
                    <span className="font-medium text-phronis-foreground/80">Deliverable:</span> {lesson.lab.deliverable}
                  </p>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ol>
    </section>
  );
}
