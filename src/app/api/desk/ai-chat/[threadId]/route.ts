import { NextResponse } from "next/server";
import { z } from "zod";

import { deskAiComplete } from "@/_lib/desk/desk-ai-completion";
import { requireDeskMember } from "@/_lib/desk/desk-member-auth";
import { checkRateLimit } from "@/_lib/rate-limit-memory";

const postSchema = z.object({
  content: z.string().trim().min(1).max(12_000),
});

const SYSTEM = `You are the Phronis Terminal "AI desk" assistant for Solana traders.
Be concise and structured (short paragraphs or bullets). You are not a financial advisor; remind users to verify on-chain data and official sources.
When discussing tokens, prefer naming risks (liquidity, authorities, concentration) over price predictions.`;

/** GET messages for a thread. POST appends user message, runs model, appends assistant reply. */
export async function GET(request: Request, routeContext: { params: Promise<{ threadId: string }> }) {
  const ctx = await requireDeskMember(request);
  if (ctx instanceof NextResponse) return ctx;
  const { threadId } = await routeContext.params;
  if (!threadId) return NextResponse.json({ ok: false, error: "missing_thread" }, { status: 400 });

  const { data: thread, error: tErr } = await ctx.supabase
    .from("ai_chat_threads")
    .select("id,title,created_at,updated_at")
    .eq("id", threadId)
    .eq("member_id", ctx.memberId)
    .maybeSingle();
  if (tErr || !thread) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  const { data: messages, error: mErr } = await ctx.supabase
    .from("ai_chat_messages")
    .select("id,role,content,created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });
  if (mErr) return NextResponse.json({ ok: false, error: "database_error" }, { status: 500 });

  return NextResponse.json({ ok: true, thread, messages: messages ?? [] });
}

export async function POST(request: Request, routeContext: { params: Promise<{ threadId: string }> }) {
  const ctx = await requireDeskMember(request);
  if (ctx instanceof NextResponse) return ctx;
  const { threadId } = await routeContext.params;
  if (!threadId) return NextResponse.json({ ok: false, error: "missing_thread" }, { status: 400 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(`desk_ai_msg:${ip}:${ctx.privyUserId}`, 20, 60_000)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const parsed = postSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "validation_error" }, { status: 400 });

  const { data: thread, error: tErr } = await ctx.supabase
    .from("ai_chat_threads")
    .select("id")
    .eq("id", threadId)
    .eq("member_id", ctx.memberId)
    .maybeSingle();
  if (tErr || !thread) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  const { error: uErr } = await ctx.supabase.from("ai_chat_messages").insert({
    thread_id: threadId,
    role: "user",
    content: parsed.data.content,
  });
  if (uErr) return NextResponse.json({ ok: false, error: "database_error" }, { status: 500 });

  const { data: history, error: hErr } = await ctx.supabase
    .from("ai_chat_messages")
    .select("role,content")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true })
    .limit(40);
  if (hErr) return NextResponse.json({ ok: false, error: "database_error" }, { status: 500 });

  const msgs = (history ?? []).map((m) => ({
    role: m.role as "user" | "assistant" | "system",
    content: m.content,
  }));
  const completion = await deskAiComplete([{ role: "system", content: SYSTEM }, ...msgs]);

  if ("error" in completion) {
    if (completion.error === "no_ai_key") {
      return NextResponse.json(
        {
          ok: false,
          error: "ai_not_configured",
          message: "Set PAI_API_KEY, AI_API_KEY, or OPENAI_API_KEY on the server to enable AI desk replies.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ ok: false, error: "ai_failed", message: completion.error }, { status: 502 });
  }

  const { error: aErr } = await ctx.supabase.from("ai_chat_messages").insert({
    thread_id: threadId,
    role: "assistant",
    content: completion.text,
  });
  if (aErr) return NextResponse.json({ ok: false, error: "database_error" }, { status: 500 });

  await ctx.supabase.from("ai_chat_threads").update({ updated_at: new Date().toISOString() }).eq("id", threadId);

  return NextResponse.json({ ok: true, reply: completion.text });
}
