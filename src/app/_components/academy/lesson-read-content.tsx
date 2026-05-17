"use client";

import { BookMarked, ClipboardList, HelpCircle, Library } from "lucide-react";

import type { LessonReadContent } from "@/_lib/crypto-mastery-course/lesson-content/types";

type Props = {
  content: LessonReadContent;
};

export function LessonReadContentView({ content }: Props) {
  return (
    <div className="space-y-8">
      <article className="space-y-8">
        {content.sections.map((section) => (
          <section key={section.heading} className="space-y-3">
            <h3 className="font-serif text-lg font-medium text-phronis-foreground">{section.heading}</h3>
            <div className="space-y-3">
              {section.paragraphs.map((p, i) => (
                <p key={`${section.heading}-${i}`} className="text-sm leading-[1.75] text-phronis-foreground/90">
                  {p}
                </p>
              ))}
            </div>
          </section>
        ))}
      </article>

      {content.keyTerms.length > 0 ? (
        <section className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
          <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-phronis-muted">
            <BookMarked className="h-3.5 w-3.5" aria-hidden />
            Key terms
          </p>
          <dl className="mt-3 space-y-3">
            {content.keyTerms.map(({ term, definition }) => (
              <div key={term}>
                <dt className="text-sm font-medium text-phronis-teal">{term}</dt>
                <dd className="mt-0.5 text-sm leading-relaxed text-phronis-muted">{definition}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {content.readings.length > 0 ? (
        <section className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
          <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-phronis-muted">
            <Library className="h-3.5 w-3.5" aria-hidden />
            Further reading
          </p>
          <ul className="mt-3 space-y-3">
            {content.readings.map((r) => (
              <li key={r.title} className="text-sm">
                <p className="font-medium text-phronis-foreground">{r.title}</p>
                <p className="mt-1 leading-relaxed text-phronis-muted">{r.studyGuide}</p>
                <p className="mt-1 text-[11px] text-phronis-muted/80">~{r.estimatedMinutes} min</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {content.exercises.length > 0 ? (
        <section className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
          <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-phronis-muted">
            <ClipboardList className="h-3.5 w-3.5" aria-hidden />
            Practice workbook ({content.exercises.length} exercises)
          </p>
          <ol className="mt-4 space-y-5">
            {content.exercises.map((ex, i) => (
              <li key={ex.title} className="text-sm">
                <p className="font-medium text-phronis-foreground">
                  {i + 1}. {ex.title}
                </p>
                <p className="mt-2 leading-relaxed text-phronis-foreground/90">{ex.prompt}</p>
                {ex.hint ? (
                  <p className="mt-2 text-xs leading-relaxed text-phronis-muted">
                    <span className="font-medium text-phronis-teal/90">Hint:</span> {ex.hint}
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {content.selfCheckQuestions.length > 0 ? (
        <section className="rounded-lg border border-phronis-teal/20 bg-phronis-teal/[0.04] p-4">
          <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-phronis-teal/90">
            <HelpCircle className="h-3.5 w-3.5" aria-hidden />
            Self-check (answer in your notes)
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-phronis-foreground/90">
            {content.selfCheckQuestions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
