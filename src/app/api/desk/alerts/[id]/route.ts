import { NextResponse } from "next/server";
import { z } from "zod";

import { requireDeskMember } from "@/_lib/desk/desk-member-auth";

const alertTypes = z.enum([
  "mint_watch",
  "price_move",
  "liquidity_floor",
  "volume_spike",
  "wallet_follow",
  "custom",
]);

const patchSchema = z.object({
  alert_type: alertTypes.optional(),
  config: z.record(z.unknown()).optional(),
  notify_push: z.boolean().optional(),
  notify_email: z.boolean().optional(),
  notify_telegram: z.boolean().optional(),
  notify_discord_webhook: z.string().url().max(512).optional().nullable(),
  active: z.boolean().optional(),
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
    .from("member_alerts")
    .update(patch)
    .eq("id", id)
    .eq("member_id", ctx.memberId)
    .select("*")
    .maybeSingle();
  if (error || !data) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true, alert: data });
}

export async function DELETE(request: Request, routeContext: { params: Promise<{ id: string }> }) {
  const ctx = await requireDeskMember(request);
  if (ctx instanceof NextResponse) return ctx;
  const { id } = await routeContext.params;
  if (!id) return NextResponse.json({ ok: false, error: "missing_id" }, { status: 400 });

  const { error } = await ctx.supabase.from("member_alerts").delete().eq("id", id).eq("member_id", ctx.memberId);
  if (error) return NextResponse.json({ ok: false, error: "database_error" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
