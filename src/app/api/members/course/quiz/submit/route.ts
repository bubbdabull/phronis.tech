import { NextResponse } from "next/server";
import { z } from "zod";

import { gradeModuleQuiz, getModuleQuizQuestionCount } from "@/_lib/crypto-mastery-course/module-quizzes";
import { requireMember } from "@/_lib/member-auth";

const submitSchema = z.object({
  moduleId: z.string().regex(/^s[1-6]-m\d+$/),
  answers: z.record(z.string(), z.number().int().min(0).max(3)),
});

/** Grade server-side; upsert pass/score. Pass threshold is ~67% correct. */
export async function POST(request: Request) {
  const auth = await requireMember(request, { l3Route: "members_course_quiz_submit", l3Kind: "quiz" });
  if (auth instanceof NextResponse) return auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
  }

  const { moduleId, answers } = parsed.data;
  const totalExpected = getModuleQuizQuestionCount(moduleId);
  if (totalExpected === 0) {
    return NextResponse.json({ ok: false, error: "quiz_not_available" }, { status: 404 });
  }

  const { score, total, passed } = gradeModuleQuiz(moduleId, answers);
  const { supabase, member } = auth;

  const { data: existing, error: readErr } = await supabase
    .from("member_crypto_module_quiz")
    .select("passed, attempt_count")
    .eq("member_id", member.id)
    .eq("module_id", moduleId)
    .maybeSingle();

  if (readErr) {
    if (readErr.code === "42P01" || (readErr.message ?? "").toLowerCase().includes("does not exist")) {
      return NextResponse.json(
        {
          ok: false,
          error: "course_tables_missing",
          hint: "Apply Supabase migration 20260509130000_member_crypto_course_quiz.sql",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ ok: false, error: "database_error" }, { status: 500 });
  }

  const prevPassed = Boolean(existing?.passed);
  const attemptCount = (existing?.attempt_count ?? 0) + 1;
  const mergedPassed = prevPassed || passed;

  const { error: writeErr } = await supabase.from("member_crypto_module_quiz").upsert(
    {
      member_id: member.id,
      module_id: moduleId,
      passed: mergedPassed,
      score,
      total,
      attempt_count: attemptCount,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "member_id,module_id" },
  );

  if (writeErr) {
    return NextResponse.json({ ok: false, error: "database_error" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    result: {
      score,
      total,
      passedThisAttempt: passed,
      passedOverall: mergedPassed,
      attemptCount,
    },
  });
}
