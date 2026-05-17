import { NextResponse } from "next/server";

import {
  CRYPTO_MASTERY_PROGRAM,
  getProgramLessonMinutes,
  getSemesterByNumber,
  getSemesterLessonMinutes,
} from "@/_lib/crypto-mastery-course";

/**
 * Public curriculum JSON for the Crypto Mastery program.
 * Query: `?semester=1` … `6` returns one semester plus metadata; omit for full program.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("semester");
  const totalLessonMinutes = getProgramLessonMinutes();

  if (raw === null || raw === "") {
    return NextResponse.json({
      ok: true,
      program: CRYPTO_MASTERY_PROGRAM,
      stats: {
        semesterCount: CRYPTO_MASTERY_PROGRAM.semesters.length,
        totalLessonMinutes,
        totalLessonHoursApprox: Math.round((totalLessonMinutes / 60) * 10) / 10,
      },
    });
  }

  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > 6) {
    return NextResponse.json({ ok: false, error: "invalid_semester", hint: "Use semester=1 through 6." }, { status: 400 });
  }

  const semester = getSemesterByNumber(n as 1 | 2 | 3 | 4 | 5 | 6);
  if (!semester) {
    return NextResponse.json({ ok: false, error: "semester_not_found" }, { status: 404 });
  }

  const semesterLessonMinutes = getSemesterLessonMinutes(semester);

  return NextResponse.json({
    ok: true,
    programMeta: {
      version: CRYPTO_MASTERY_PROGRAM.version,
      title: CRYPTO_MASTERY_PROGRAM.title,
      subtitle: CRYPTO_MASTERY_PROGRAM.subtitle,
      disclaimer: CRYPTO_MASTERY_PROGRAM.disclaimer,
    },
    semester,
    stats: {
      semesterLessonMinutes,
      semesterLessonHoursApprox: Math.round((semesterLessonMinutes / 60) * 10) / 10,
      programTotalLessonMinutes: totalLessonMinutes,
    },
  });
}
