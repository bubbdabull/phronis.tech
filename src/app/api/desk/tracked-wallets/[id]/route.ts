import { NextResponse } from "next/server";

import { requireDeskMember } from "@/_lib/desk/desk-member-auth";
import { z } from "zod";

const patchSchema = z.object({
  display_label: z.string().max(120).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  tags: z.array(z.string().max(40)).max(20).optional(),
  smart_money_score: z.number().min(0).max(100).optional().nullable(),
});

export async function PATCH(request: Request, routeContext: { params: Promise<{ id: string }> }) {
  const ctx = await requireDeskMember(request);
  if (ctx instanceof NextResponse) return ctx;
  const { id } = await routeContext.params;
  if (!id) return NextResponse.json({ ok: false, error: "missing_id" }, { status: 400 });

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "validation_error" }, { status: 400 });

  const patch = Object.fromEntries(Object.entries(parsed.data).filter(([, v]) => v !== undefined));
  const { data, error } = await ctx.supabase
    .from("tracked_wallets")
    .update(patch)
    .eq("id", id)
    .eq("member_id", ctx.memberId)
    .select("*")
    .maybeSingle();
  if (error || !data) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true, wallet: data });
}

export async function DELETE(request: Request, routeContext: { params: Promise<{ id: string }> }) {
  const ctx = await requireDeskMember(request);
  if (ctx instanceof NextResponse) return ctx;
  const { id } = await routeContext.params;
  if (!id) return NextResponse.json({ ok: false, error: "missing_id" }, { status: 400 });

  const { error } = await ctx.supabase.from("tracked_wallets").delete().eq("id", id).eq("member_id", ctx.memberId);
  if (error) return NextResponse.json({ ok: false, error: "database_error" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
