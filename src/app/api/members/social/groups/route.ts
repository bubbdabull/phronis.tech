import { NextResponse } from "next/server";

import { studyGroupCreateSchema } from "@/_lib/schemas/member-social";
import { requireMember } from "@/_lib/member-auth";

export async function GET(request: Request) {
  const auth = await requireMember(request, { l3Route: "members_social_groups_get", l3Kind: "read" });
  if (auth instanceof NextResponse) return auth;

  const { supabase, member } = auth;

  const { data: memberships, error: mErr } = await supabase
    .from("study_group_members")
    .select("group_id, role, joined_at")
    .eq("member_id", member.id);

  if (mErr) {
    return NextResponse.json({ ok: false, error: "database_error" }, { status: 500 });
  }

  const ids = (memberships ?? []).map((m) => m.group_id);
  if (!ids.length) {
    return NextResponse.json({ ok: true, groups: [] });
  }

  const { data: groups, error: gErr } = await supabase.from("study_groups").select("*").in("id", ids);
  if (gErr) {
    return NextResponse.json({ ok: false, error: "database_error" }, { status: 500 });
  }

  const meta = Object.fromEntries((memberships ?? []).map((m) => [m.group_id, m]));
  return NextResponse.json({
    ok: true,
    groups: (groups ?? []).map((g) => ({ ...g, membership: meta[g.id as string] ?? null })),
  });
}

export async function POST(request: Request) {
  const auth = await requireMember(request, { l3Route: "members_social_groups_post", l3Kind: "write" });
  if (auth instanceof NextResponse) return auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = studyGroupCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
  }

  const { supabase, member } = auth;
  const { name, description } = parsed.data;

  const { data: group, error: gErr } = await supabase
    .from("study_groups")
    .insert({ name, description: description ?? null, created_by_member_id: member.id })
    .select("*")
    .single();

  if (gErr || !group) {
    return NextResponse.json({ ok: false, error: "database_error" }, { status: 500 });
  }

  await supabase.from("study_group_members").insert({
    group_id: group.id,
    member_id: member.id,
    role: "owner",
  });

  return NextResponse.json({ ok: true, group });
}
