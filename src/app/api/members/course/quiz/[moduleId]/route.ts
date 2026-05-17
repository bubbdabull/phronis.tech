import { NextResponse } from "next/server";

import { findCourseModuleWithMedia } from "@/_lib/crypto-mastery-course/course-navigation";
import { getModuleQuizQuestionsPublic, getModuleQuizQuestionCount } from "@/_lib/crypto-mastery-course/module-quizzes";
import { requireMember } from "@/_lib/member-auth";

type RouteContext = { params: Promise<{ moduleId: string }> };

/** Multiple-choice questions for one module (no answers). Requires member session. */
export async function GET(request: Request, context: RouteContext) {
  const auth = await requireMember(request, { l3Route: "members_course_quiz_get", l3Kind: "read" });
  if (auth instanceof NextResponse) return auth;

  const { moduleId } = await context.params;
  if (!moduleId || !/^s[1-6]-m\d+$/.test(moduleId)) {
    return NextResponse.json({ ok: false, error: "invalid_module_id" }, { status: 400 });
  }

  const meta = findCourseModuleWithMedia(moduleId);
  if (!meta) {
    return NextResponse.json({ ok: false, error: "unknown_module" }, { status: 404 });
  }

  const questions = getModuleQuizQuestionsPublic(moduleId);
  if (!questions?.length) {
    return NextResponse.json({ ok: false, error: "quiz_not_available" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    module: {
      id: meta.moduleId,
      title: meta.moduleTitle,
      description: meta.moduleDescription,
      semesterNumber: meta.semesterNumber,
      semesterTitle: meta.semesterTitle,
      moduleVideoUrl: meta.moduleVideoUrl,
    },
    lessons: meta.lessons,
    lessonCount: meta.lessons.length,
    questionCount: getModuleQuizQuestionCount(moduleId),
    questions,
  });
}
