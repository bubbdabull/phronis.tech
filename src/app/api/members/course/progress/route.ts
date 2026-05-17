import { NextResponse } from "next/server";

import { flattenCourseModules } from "@/_lib/crypto-mastery-course/course-navigation";
import { requireMember } from "@/_lib/member-auth";
import type { MemberCryptoModuleQuizRow } from "@/_types/crypto-course-quiz";

/** Quiz completion rows for the authenticated member (for Academy UI). */
export async function GET(request: Request) {
  const auth = await requireMember(request, { l3Route: "members_course_progress", l3Kind: "read" });
  if (auth instanceof NextResponse) return auth;

  const { supabase, member } = auth;

  const { data: rows, error } = await supabase.from("member_crypto_module_quiz").select("*").eq("member_id", member.id);
  if (error) {
    if (error.code === "42P01" || (error.message ?? "").toLowerCase().includes("does not exist")) {
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

  const byModule = Object.fromEntries((rows ?? []).map((r) => [r.module_id as string, r])) as Record<
    string,
    MemberCryptoModuleQuizRow
  >;

  const outline = flattenCourseModules().map((m) => {
    const r = byModule[m.moduleId];
    return {
      ...m,
      quizPassed: r?.passed ?? false,
      quizScore: r?.score ?? null,
      quizTotal: r?.total ?? null,
      quizAttempts: r?.attempt_count ?? 0,
    };
  });

  const passedCount = outline.filter((m) => m.quizPassed).length;
  const totalSections = outline.length;

  return NextResponse.json({
    ok: true,
    progress: { passedCount, totalSections },
    modules: outline,
  });
}
