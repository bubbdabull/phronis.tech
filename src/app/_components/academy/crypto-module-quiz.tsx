"use client";

import { usePrivy } from "@privy-io/react-auth";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { CryptoModuleLessons } from "@/_components/academy/crypto-module-lessons";
import { Button } from "@/_components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/_components/ui/card";
import type { LessonPublic } from "@/_lib/crypto-mastery-course/lesson-public";
import { cn } from "@/_lib/utils";
import type { ModuleMcQuestionPublic } from "@/_types/crypto-course-quiz";

type QuizLoad = {
  ok: boolean;
  module?: {
    id: string;
    title: string;
    description: string;
    semesterNumber: number;
    semesterTitle: string;
    moduleVideoUrl?: string | null;
  };
  lessons?: LessonPublic[];
  questions?: ModuleMcQuestionPublic[];
  error?: string;
};

export function CryptoModuleQuiz({ moduleId }: { moduleId: string }) {
  const { getAccessToken, ready, authenticated } = usePrivy();
  const router = useRouter();
  const [load, setLoad] = useState<QuizLoad | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number; passedThisAttempt: boolean; passedOverall: boolean } | null>(
    null,
  );

  const fetchQuiz = useCallback(async () => {
    if (!authenticated) return;
    const token = await getAccessToken();
    if (!token) return;
    const res = await fetch(`/api/members/course/quiz/${encodeURIComponent(moduleId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = (await res.json()) as QuizLoad;
    setLoad(json);
    setAnswers({});
    setResult(null);
  }, [authenticated, getAccessToken, moduleId]);

  useEffect(() => {
    if (!ready || !authenticated) return;
    void fetchQuiz();
  }, [ready, authenticated, fetchQuiz]);

  const submit = useCallback(async () => {
    if (!load?.questions?.length) return;
    setBusy(true);
    setResult(null);
    try {
      const token = await getAccessToken();
      if (!token) return;
      const res = await fetch("/api/members/course/quiz/submit", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId, answers }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        result?: { score: number; total: number; passedThisAttempt: boolean; passedOverall: boolean };
        error?: string;
      };
      if (json.ok && json.result) {
        setResult(json.result);
        if (json.result.passedOverall) {
          router.refresh();
        }
      }
    } finally {
      setBusy(false);
    }
  }, [answers, getAccessToken, load?.questions?.length, moduleId, router]);

  if (!ready) {
    return (
      <p className="text-sm text-phronis-muted" role="status">
        Loading…
      </p>
    );
  }

  if (!authenticated) {
    return <p className="text-sm text-phronis-muted">Sign in to take quizzes.</p>;
  }

  if (!load) {
    return (
      <p className="flex items-center gap-2 text-sm text-phronis-muted">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Loading section…
      </p>
    );
  }

  if (!load.ok || !load.module || !load.questions?.length) {
    return (
      <Card className="border-white/10">
        <CardHeader>
          <CardTitle>Section unavailable</CardTitle>
          <CardDescription className="text-amber-200/90">{load.error ?? "Unknown module or quiz."}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" className="border-white/15">
            <Link href="/learn">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
              Back to Academy
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const lessons = load.lessons ?? [];
  const allAnswered = load.questions.every((q) => typeof answers[q.id] === "number");

  return (
    <div className="space-y-10">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4 text-phronis-muted hover:text-phronis-foreground">
          <Link href="/learn">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
            All sections
          </Link>
        </Button>
        <p className="text-xs font-medium uppercase tracking-wider text-phronis-teal/90">
          Semester {load.module.semesterNumber} · {load.module.semesterTitle}
        </p>
        <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight text-phronis-foreground sm:text-4xl">{load.module.title}</h1>
        <p className="mt-2 max-w-3xl text-sm text-phronis-muted sm:text-base">{load.module.description}</p>
        <p className="mt-2 text-xs text-phronis-muted">
          {lessons.length} video classes · {load.questions.length} quiz questions
        </p>
      </div>

      {lessons.length > 0 ? (
        <CryptoModuleLessons
          moduleVideoUrl={load.module.moduleVideoUrl ?? null}
          lessons={lessons}
          semesterNumber={load.module.semesterNumber}
          semesterTitle={load.module.semesterTitle}
          moduleTitle={load.module.title}
          moduleDescription={load.module.description}
        />
      ) : null}

      <Card className="border-white/10" id="section-quiz">
        <CardHeader>
          <CardTitle>Section quiz</CardTitle>
          <CardDescription>
            Watch the classes above, then answer three multiple-choice questions. You need at least two correct to pass.
            Education only—not financial advice.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {load.questions.map((q, idx) => (
            <fieldset key={q.id} className="space-y-3 border-b border-white/10 pb-6 last:border-0 last:pb-0">
              <legend className="text-sm font-medium text-phronis-foreground">
                {idx + 1}. {q.prompt}
              </legend>
              <div className="space-y-2">
                {q.options.map((opt, i) => (
                  <label
                    key={i}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                      answers[q.id] === i ? "border-phronis-teal/50 bg-phronis-teal/10" : "border-white/10 hover:border-white/20",
                    )}
                  >
                    <input
                      type="radio"
                      className="mt-1"
                      name={q.id}
                      checked={answers[q.id] === i}
                      onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: i }))}
                    />
                    <span className="text-phronis-foreground/95">{opt}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}

          {result ? (
            <div
              className={cn(
                "rounded-lg border px-4 py-3 text-sm",
                result.passedThisAttempt ? "border-phronis-teal/40 bg-phronis-teal/10 text-phronis-foreground" : "border-amber-400/30 bg-amber-400/5 text-amber-100/95",
              )}
              role="status"
            >
              <p className="font-medium">
                Score: {result.score} / {result.total}
              </p>
              <p className="mt-1">
                {result.passedOverall
                  ? result.passedThisAttempt
                    ? "You passed this section."
                    : "This section was already marked passed from an earlier attempt."
                  : result.passedThisAttempt
                    ? "You passed this section."
                    : "Not quite—review the lectures and try again."}
              </p>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              className="bg-phronis-teal text-phronis-void hover:opacity-90"
              disabled={!allAnswered || busy}
              onClick={() => void submit()}
            >
              {busy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Submitting…
                </>
              ) : (
                "Submit answers"
              )}
            </Button>
            {result?.passedOverall ? (
              <Button asChild variant="outline" className="border-white/15">
                <Link href="/learn">Back to Academy</Link>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
