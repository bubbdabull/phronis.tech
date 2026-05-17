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

const postSchema = z.object({
  alert_type: alertTypes,
  config: z.record(z.unknown()).default({}),
  notify_push: z.boolean().optional(),
  notify_email: z.boolean().optional(),
  notify_telegram: z.boolean().optional(),
  notify_discord_webhook: z.string().url().max(512).optional().nullable(),
  active: z.boolean().optional(),
});

export async function GET(request: Request) {
  const ctx = await requireDeskMember(request);
  if (ctx instanceof NextResponse) return ctx;

  const { data, error } = await ctx.supabase
    .from("member_alerts")
    .select("*")
    .eq("member_id", ctx.memberId)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ ok: false, error: "database_error" }, { status: 500 });
  return NextResponse.json({ ok: true, alerts: data ?? [] });
}

export async function POST(request: Request) {
  const ctx = await requireDeskMember(request);
  if (ctx instanceof NextResponse) return ctx;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const parsed = postSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "validation_error" }, { status: 400 });

  const row = {
    member_id: ctx.memberId,
    alert_type: parsed.data.alert_type,
    config: parsed.data.config,
    notify_push: parsed.data.notify_push ?? false,
    notify_email: parsed.data.notify_email ?? false,
    notify_telegram: parsed.data.notify_telegram ?? false,
    notify_discord_webhook: parsed.data.notify_discord_webhook ?? null,
    active: parsed.data.active ?? true,
  };

  const { data, error } = await ctx.supabase.from("member_alerts").insert(row).select("*").single();
  if (error) return NextResponse.json({ ok: false, error: "database_error" }, { status: 500 });
  return NextResponse.json({ ok: true, alert: data });
}
