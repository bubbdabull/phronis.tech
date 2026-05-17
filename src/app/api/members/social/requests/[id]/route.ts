import { NextResponse } from "next/server";

import { friendRequestPatchSchema } from "@/_lib/schemas/member-social";
import { requireMember } from "@/_lib/member-auth";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Ctx) {
  const auth = await requireMember(request, { l3Route: "members_social_requests_patch", l3Kind: "write" });
  if (auth instanceof NextResponse) return auth;

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ ok: false, error: "invalid_id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = friendRequestPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
  }

  const { supabase, member } = auth;
  const { data: row, error: readErr } = await supabase.from("friend_requests").select("*").eq("id", id).maybeSingle();
  if (readErr || !row) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }
  if (row.status !== "pending") {
    return NextResponse.json({ ok: false, error: "not_pending" }, { status: 409 });
  }

  const action = parsed.data.action;
  const fromId = row.from_member_id as string;
  const toId = row.to_member_id as string;

  if (action === "cancel") {
    if (fromId !== member.id) {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }
    await supabase.from("friend_requests").update({ status: "cancelled" }).eq("id", id);
    return NextResponse.json({ ok: true, status: "cancelled" });
  }

  if (action === "decline") {
    if (toId !== member.id) {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }
    await supabase.from("friend_requests").update({ status: "declined" }).eq("id", id);
    return NextResponse.json({ ok: true, status: "declined" });
  }

  // accept
  if (toId !== member.id) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const [low, high] = fromId < toId ? [fromId, toId] : [toId, fromId];
  const { error: insErr } = await supabase.from("friendships").insert({ member_a_id: low, member_b_id: high });
  if (insErr) {
    const dup =
      insErr.code === "23505" ||
      (insErr.message ?? "").toLowerCase().includes("duplicate") ||
      (insErr.message ?? "").toLowerCase().includes("unique");
    if (!dup) {
      return NextResponse.json({ ok: false, error: "database_error" }, { status: 500 });
    }
  }

  await supabase.from("friend_requests").update({ status: "accepted" }).eq("id", id);
  return NextResponse.json({ ok: true, status: "accepted" });
}
