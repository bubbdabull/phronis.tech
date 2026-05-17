import { NextResponse } from "next/server";
import { z } from "zod";

import { requireDeskMember } from "@/_lib/desk/desk-member-auth";
import { checkRateLimit } from "@/_lib/rate-limit-memory";

const postSchema = z.object({
  title: z.string().max(200).optional().nullable(),
});

export async function GET(request: Request) {
  const ctx = await requireDeskMember(request);
  if (ctx instanceof NextResponse) return ctx;

  const { data, error } = await ctx.supabase
    .from("ai_chat_threads")
    .select("id,title,created_at,updated_at")
    .eq("member_id", ctx.memberId)
    .order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ ok: false, error: "database_error" }, { status: 500 });
  return NextResponse.json({ ok: true, threads: data ?? [] });
}

export async function POST(request: Request) {
  const ctx = await requireDeskMember(request);
  if (ctx instanceof NextResponse) return ctx;

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(`desk_ai_thread:${ip}:${ctx.privyUserId}`, 30, 60_000)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    json = {};
  }
  const parsed = postSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "validation_error" }, { status: 400 });

  const { data, error } = await ctx.supabase
    .from("ai_chat_threads")
    .insert({
      member_id: ctx.memberId,
      title: parsed.data.title?.trim() || "New chat",
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ ok: false, error: "database_error" }, { status: 500 });
  return NextResponse.json({ ok: true, thread: data });
}
