import { NextResponse } from "next/server";

/** Surface PostgREST errors in development to speed up Supabase debugging. */
export function databaseErrorResponse(
  context: string,
  err: { message?: string; code?: string; details?: string },
): NextResponse {
  if (process.env.NODE_ENV !== "production") {
    console.error(`[${context}]`, err);
  }
  return NextResponse.json(
    {
      ok: false,
      error: "database_error",
      ...(process.env.NODE_ENV !== "production"
        ? { message: err.message, code: err.code, details: err.details }
        : {}),
    },
    { status: 500 },
  );
}
