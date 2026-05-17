import { NextResponse } from "next/server";

import { friendRequestCreateSchema } from "@/_lib/schemas/member-social";
import { requireMember } from "@/_lib/member-auth";

export async function GET(request: Request) {
  const auth = await requireMember(request, { l3Route: "members_social_requests_get", l3Kind: "read" });
  if (auth instanceof NextResponse) return auth;

  const { supabase, member } = auth;

  const { data: incoming, error: inErr } = await supabase
    .from("friend_requests")
    .select("id, from_member_id, to_member_id, status, created_at")
    .eq("to_member_id", member.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const { data: outgoing, error: outErr } = await supabase
    .from("friend_requests")
    .select("id, from_member_id, to_member_id, status, created_at")
    .eq("from_member_id", member.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (inErr || outErr) {
    return NextResponse.json({ ok: false, error: "database_error" }, { status: 500 });
  }

  const fromIds = [...new Set((incoming ?? []).map((r) => r.from_member_id))];
  const toIds = [...new Set((outgoing ?? []).map((r) => r.to_member_id))];
  const allIds = [...new Set([...fromIds, ...toIds])];
  let byId: Record<string, { id: string; username: string | null; display_name: string | null; avatar_url: string | null }> = {};
  if (allIds.length) {
    const { data: mems } = await supabase.from("members").select("id, username, display_name, avatar_url").in("id", allIds);
    byId = Object.fromEntries((mems ?? []).map((m) => [m.id, m]));
  }

  return NextResponse.json({
    ok: true,
    incoming: (incoming ?? []).map((r) => ({ ...r, from: byId[r.from_member_id] ?? null })),
    outgoing: (outgoing ?? []).map((r) => ({ ...r, to: byId[r.to_member_id] ?? null })),
  });
}

export async function POST(request: Request) {
  const auth = await requireMember(request, { l3Route: "members_social_requests_post", l3Kind: "write" });
  if (auth instanceof NextResponse) return auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = friendRequestCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
  }

  const { to_member_id } = parsed.data;
  const { supabase, member } = auth;

  if (to_member_id === member.id) {
    return NextResponse.json({ ok: false, error: "invalid_target" }, { status: 400 });
  }

  const { data: target } = await supabase.from("members").select("id").eq("id", to_member_id).maybeSingle();
  if (!target) {
    return NextResponse.json({ ok: false, error: "member_not_found" }, { status: 404 });
  }

  const [low, high] = member.id < to_member_id ? [member.id, to_member_id] : [to_member_id, member.id];
  const { data: existingFriend } = await supabase
    .from("friendships")
    .select("id")
    .eq("member_a_id", low)
    .eq("member_b_id", high)
    .maybeSingle();
  if (existingFriend) {
    return NextResponse.json({ ok: false, error: "already_friends" }, { status: 409 });
  }

  const { data: inserted, error } = await supabase
    .from("friend_requests")
    .insert({ from_member_id: member.id, to_member_id, status: "pending" })
    .select("id, from_member_id, to_member_id, status, created_at")
    .single();

  if (error) {
    const msg = (error.message ?? "").toLowerCase();
    if (msg.includes("duplicate") || msg.includes("unique")) {
      return NextResponse.json({ ok: false, error: "duplicate_request" }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: "database_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, request: inserted });
}
