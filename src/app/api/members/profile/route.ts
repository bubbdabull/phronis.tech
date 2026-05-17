import type { LinkedAccount, User as PrivyApiUser } from "@privy-io/node";
import { NextResponse } from "next/server";

import { databaseErrorResponse } from "@/_lib/member/db-error";
import { memberL3RateLimit } from "@/_lib/member-api-l3";
import { memberProfileUpdateSchema } from "@/_lib/schemas/member-profile";
import { requirePrivySession } from "@/_lib/member-auth";
import { getPrivyServerClient } from "@/_lib/privy-server";

function linkedPrivyEmail(accounts: LinkedAccount[] | undefined): string | null {
  const row = accounts?.find((a) => a.type === "email");
  if (row && row.type === "email") return row.address;
  return null;
}

function privyUsersGet(privy: NonNullable<ReturnType<typeof getPrivyServerClient>>) {
  return privy.users() as unknown as { _get: (userId: string) => Promise<PrivyApiUser> };
}

export async function PATCH(request: Request) {
  const session = await requirePrivySession(request);
  if (session instanceof NextResponse) return session;
  const rl = memberL3RateLimit(request, session.userId, "members_profile_patch", "write");
  if (rl) return rl;

  const { supabase, userId } = session;
  const privy = session.privy;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = memberProfileUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
  }

  const patch = Object.fromEntries(
    Object.entries(parsed.data).filter(([, v]) => v !== undefined),
  ) as Record<string, string | null>;

  if ("email" in patch) {
    try {
      const privyUser = await privyUsersGet(privy)._get(userId);
      if (linkedPrivyEmail(privyUser.linked_accounts)) {
        delete patch.email;
      }
    } catch {
      /* If Privy lookup fails, still allow saving contact email (wallet-only path). */
    }
  }

  const { data: existing } = await supabase.from("members").select("id").eq("privy_id", userId).maybeSingle();

  if (!existing?.id) {
    const { data: inserted, error: insErr } = await supabase
      .from("members")
      .insert({
        privy_id: userId,
        membership_tier: "L1",
        onboarding_step: "profile",
        ...patch,
      })
      .select("*")
      .single();

    if (insErr || !inserted) {
      return databaseErrorResponse("api/members/profile members insert", insErr ?? { message: "insert failed" });
    }

    await supabase.from("memberships").insert({ member_id: inserted.id, tier: "L1", active: true });

    return NextResponse.json({ ok: true, member: inserted });
  }

  const { data, error } = await supabase.from("members").update(patch).eq("privy_id", userId).select("*").single();
  if (error || !data) {
    return NextResponse.json(
      {
        ok: false,
        error: "database_error",
        hint: "No member row matched your account. Tap Sync & refresh on your wallet card first.",
        ...(process.env.NODE_ENV !== "production" && error ? { message: error.message } : {}),
      },
      { status: error ? 500 : 404 },
    );
  }

  return NextResponse.json({ ok: true, member: data });
}
