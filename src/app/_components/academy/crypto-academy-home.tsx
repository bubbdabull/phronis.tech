"use client";

import { usePrivy } from "@privy-io/react-auth";
import { BookOpen, CheckCircle2, ChevronRight, Circle } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Badge } from "@/_components/ui/badge";
import { Button } from "@/_components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/_components/ui/card";
import { cn } from "@/_lib/utils";

type ModuleRow = {
  moduleId: string;
  semesterNumber: number;
  semesterTitle: string;
  moduleTitle: string;
  moduleDescription: string;
  quizPassed: boolean;
  quizScore: number | null;
  quizTotal: number | null;
  quizAttempts: number;
};

type ProgressResponse = {
  ok: boolean;
  error?: string;
  hint?: string;
  progress?: { passedCount: number; totalSections: number };
  modules?: ModuleRow[];
};

export function CryptoAcademyHome() {
  const { getAccessToken, ready, authenticated } = usePrivy();
  const [data, setData] = useState<ProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!authenticated) {
      setData({ ok: false, error: "sign_in_required" });
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        setData({ ok: false, error: "no_token" });
        return;
      }
      const res = await fetch("/api/members/course/progress", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = (await res.json()) as ProgressResponse;
      setData(json);
    } catch {
      setData({ ok: false, error: "network_error" });
    } finally {
      setLoading(false);
    }
  }, [authenticated, getAccessToken]);

  useEffect(() => {
    if (!ready) return;
    void load();
  }, [ready, load]);

  const bySemester = useMemo(() => {
    const mods = data?.modules ?? [];
    const map = new Map<number, ModuleRow[]>();
    for (const m of mods) {
      const arr = map.get(m.semesterNumber) ?? [];
      arr.push(m);
      map.set(m.semesterNumber, arr);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [data?.modules]);

  if (!ready || loading) {
    return (
      <p className="text-sm text-phronis-muted" role="status">
        Loading Academy…
      </p>
    );
  }

  if (!authenticated) {
    return <p className="text-sm text-phronis-muted">Sign in to track course progress and quizzes.</p>;
  }

  if (!data?.ok) {
    return (
      <Card className="border-white/10">
        <CardHeader>
          <CardTitle>Could not load Academy</CardTitle>
          <CardDescription className="text-amber-200/90">
            {data?.error === "member_not_found"
              ? "Complete onboarding (sync your profile) so we can attach progress to your member record."
              : data?.error === "course_tables_missing"
                ? (data as { hint?: string }).hint ?? "Database migration may be missing."
                : data?.error ?? "Unknown error"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="border-white/15">
            <Link href="/member">Go to member hub</Link>
          </Button>
          <Button type="button" variant="outline" className="border-white/15" onClick={() => void load()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { passedCount = 0, totalSections = 0 } = data.progress ?? {};

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-phronis-foreground sm:text-4xl">Crypto Academy</h1>
          <p className="mt-2 max-w-2xl text-sm text-phronis-muted sm:text-base">
            Six semesters, 22 sections, and <strong className="text-phronis-foreground/90">66 classes</strong> with full written study guides, lecture videos, labs, and self-check questions. Open a section, read each class, watch the video, then pass the quiz to mark it complete. No PHR balance required — sign in and start learning.
          </p>
        </div>
        <div className="rounded-xl border border-phronis-teal/25 bg-phronis-teal/5 px-4 py-3 text-sm">
          <p className="text-[11px] font-medium uppercase tracking-wider text-phronis-muted">Progress</p>
          <p className="mt-1 font-medium text-phronis-foreground">
            {passedCount} / {totalSections} sections passed
          </p>
        </div>
      </div>

      <div className="space-y-10">
        {bySemester.map(([sem, modules]) => (
          <section key={sem} className="space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-phronis-teal" aria-hidden />
              <h2 className="text-lg font-semibold tracking-tight text-phronis-foreground">Semester {sem}</h2>
              <span className="text-sm text-phronis-muted">— {modules[0]?.semesterTitle}</span>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {modules.map((m) => (
                <li key={m.moduleId}>
                  <Link
                    href={`/learn/${m.moduleId}`}
                    className={cn(
                      "flex h-full flex-col rounded-xl border p-4 transition-colors",
                      m.quizPassed ? "border-phronis-teal/35 bg-phronis-teal/[0.06]" : "border-white/10 bg-white/[0.02] hover:border-white/20",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-phronis-foreground">{m.moduleTitle}</p>
                      {m.quizPassed ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-phronis-teal" aria-label="Quiz passed" />
                      ) : (
                        <Circle className="h-5 w-5 shrink-0 text-phronis-muted" aria-hidden />
                      )}
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs text-phronis-muted">{m.moduleDescription}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {m.quizPassed ? (
                        <Badge className="bg-phronis-teal/20 text-phronis-teal hover:bg-phronis-teal/25">Passed</Badge>
                      ) : (
                        <Badge variant="outline" className="border-white/15 text-phronis-muted">
                          Quiz pending
                        </Badge>
                      )}
                      {m.quizAttempts > 0 && !m.quizPassed ? (
                        <span className="text-[11px] text-phronis-muted">Attempts: {m.quizAttempts}</span>
                      ) : null}
                      {m.quizPassed && m.quizScore != null && m.quizTotal != null ? (
                        <span className="text-[11px] text-phronis-muted">
                          Last score {m.quizScore}/{m.quizTotal}
                        </span>
                      ) : null}
                      <ChevronRight className="ml-auto h-4 w-4 text-phronis-muted" aria-hidden />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
