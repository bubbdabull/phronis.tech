import { NextResponse } from "next/server";

import type { MemberAuthOk } from "@/_lib/member-auth";
import { groupMessageSchema } from "@/_lib/schemas/member-social";
import { requireMember } from "@/_lib/member-auth";

type Ctx = { params: Promise<{ id: string }> };

async function assertGroupMember(supabase: MemberAuthOk["supabase"], groupId: string, memberId: string): Promise<boolean> {
  const { data } = await supabase
    .from("study_group_members")
    .select("group_id")
    .eq("group_id", groupId)
    .eq("member_id", memberId)
    .maybeSingle();
  return Boolean(data);
}

export async function GET(request: Request, context: Ctx) {
  const auth = await requireMember(request, { l3Route: "members_social_group_messages_get", l3Kind: "read" });
  if (auth instanceof NextResponse) return auth;

  const { id: groupId } = await context.params;
  const url = new URL(request.url);
  const cursor = url.searchParams.get("cursor");
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit")) || 30));

  const { supabase, member } = auth;
  if (!(await assertGroupMember(supabase, groupId, member.id))) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  let q = supabase
    .from("group_messages")
    .select("id, member_id, body, created_at")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (cursor) {
    q = q.lt("created_at", cursor);
  }

  const { data: msgs, error } = await q;
  if (error) {
    return NextResponse.json({ ok: false, error: "database_error" }, { status: 500 });
  }

  const authorIds = [...new Set((msgs ?? []).map((m) => m.member_id))];
  let names: Record<string, string> = {};
  if (authorIds.length) {
    const { data: mems } = await supabase.from("members").select("id, display_name, username").in("id", authorIds);
    names = Object.fromEntries(
      (mems ?? []).map((m) => [m.id, (m.display_name || m.username || "Member").trim() || "Member"]),
    );
  }

  return NextResponse.json({
    ok: true,
    messages: (msgs ?? []).map((m) => ({ ...m, authorLabel: names[m.member_id as string] ?? "Member" })),
    nextCursor: msgs?.length ? (msgs[msgs.length - 1].created_at as string) : null,
  });
}

export async function POST(request: Request, context: Ctx) {
  const auth = await requireMember(request, { l3Route: "members_social_group_messages_post", l3Kind: "write" });
  if (auth instanceof NextResponse) return auth;

  const { id: groupId } = await context.params;
  const { supabase, member } = auth;

  if (!(await assertGroupMember(supabase, groupId, member.id))) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = groupMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
  }

  const { data: inserted, error } = await supabase
    .from("group_messages")
    .insert({ group_id: groupId, member_id: member.id, body: parsed.data.body })
    .select("id, member_id, body, created_at")
    .single();

  if (error || !inserted) {
    return NextResponse.json({ ok: false, error: "database_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: inserted });
}
