import { NextResponse } from "next/server";

import { sendMemberSupportEmail } from "@/_lib/email/resend-client";
import { requirePrivySession } from "@/_lib/member-auth";
import { memberL3RateLimit } from "@/_lib/member-api-l3";
import { memberSupportRequestSchema } from "@/_lib/schemas/member-support-request";
import type { MemberRow } from "@/_types/onboarding";

export async function POST(request: Request) {
  const session = await requirePrivySession(request);
  if (session instanceof NextResponse) return session;

  const rl = memberL3RateLimit(request, session.userId, "members_support_request", "write");
  if (rl) return rl;

  const { supabase, userId } = session;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = memberSupportRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation_error", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { requestType, message, contactEmail, walletAddress: walletFromBody } = parsed.data;

  const { data: memberRow } = await supabase.from("members").select("*").eq("privy_id", userId).maybeSingle();
  const member = (memberRow as MemberRow | null) ?? null;

  const memberEmail = member?.email?.trim() || null;
  const replyTo = contactEmail ?? memberEmail;
  const wallet =
    member?.wallet_address?.trim() || walletFromBody?.trim() || null;

  const result = await sendMemberSupportEmail({
    requestType,
    message,
    memberId: member?.id ?? "—",
    privyUserId: userId,
    username: member?.username ?? null,
    displayName: member?.display_name ?? null,
    email: memberEmail ?? contactEmail,
    walletAddress: wallet,
    replyTo,
  });

  if (!result.ok) {
    const status = result.error === "email_not_configured" ? 503 : 502;
    return NextResponse.json(
      {
        ok: false,
        error: result.error,
        message:
          result.error === "email_not_configured"
            ? "Support email is not configured on the server. Contact the team directly."
            : "Could not send your message. Try again in a few minutes.",
      },
      { status },
    );
  }

  return NextResponse.json({ ok: true });
}
