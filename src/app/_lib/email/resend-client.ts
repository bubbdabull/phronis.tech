import { Resend } from "resend";

import { SITE } from "@/_lib/site-content";

export type SupportRequestType = "manual_onboarding" | "assisted_funding" | "other";

const REQUEST_LABELS: Record<SupportRequestType, string> = {
  manual_onboarding: "Manual onboarding help",
  assisted_funding: "Assisted wallet funding (SOL / USDC)",
  other: "Other member support",
};

export function getResendConfig(): { client: Resend; from: string; to: string } | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim();
  const to = process.env.RESEND_SUPPORT_TO?.trim() || process.env.RESEND_TO?.trim() || SITE.contactEmail;
  if (!apiKey || !from || !to) return null;
  return { client: new Resend(apiKey), from, to };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type MemberSupportEmailPayload = {
  requestType: SupportRequestType;
  message: string;
  memberId: string;
  privyUserId: string;
  username: string | null;
  displayName: string | null;
  email: string | null;
  walletAddress: string | null;
  replyTo: string | null;
};

export async function sendMemberSupportEmail(payload: MemberSupportEmailPayload): Promise<{ ok: true } | { ok: false; error: string }> {
  const cfg = getResendConfig();
  if (!cfg) {
    return { ok: false, error: "email_not_configured" };
  }

  const label = REQUEST_LABELS[payload.requestType];
  const subject = `[Phronis Member] ${label}${payload.username ? ` — @${payload.username}` : ""}`;

  const lines = [
    `<p><strong>Request:</strong> ${escapeHtml(label)}</p>`,
    `<p><strong>Message:</strong></p><pre style="white-space:pre-wrap;font-family:ui-monospace,monospace;font-size:13px">${escapeHtml(payload.message)}</pre>`,
    "<hr />",
    "<p><strong>Member</strong></p>",
    "<ul>",
    `<li>Member ID: <code>${escapeHtml(payload.memberId)}</code></li>`,
    `<li>Privy user: <code>${escapeHtml(payload.privyUserId)}</code></li>`,
    payload.username ? `<li>Username: @${escapeHtml(payload.username)}</li>` : "",
    payload.displayName ? `<li>Display name: ${escapeHtml(payload.displayName)}</li>` : "",
    payload.email ? `<li>Email: ${escapeHtml(payload.email)}</li>` : "",
    payload.walletAddress ? `<li>Solana wallet: <code>${escapeHtml(payload.walletAddress)}</code></li>` : "",
    "</ul>",
    `<p style="color:#666;font-size:12px">Sent from the Phronis member workspace. Reply to this email to reach the member when a reply-to address is set.</p>`,
  ].filter(Boolean);

  try {
    const { error } = await cfg.client.emails.send({
      from: cfg.from,
      to: [cfg.to],
      subject,
      html: lines.join("\n"),
      ...(payload.replyTo ? { replyTo: payload.replyTo } : {}),
    });
    if (error) {
      console.error("[resend] member support send failed", error);
      return { ok: false, error: "send_failed" };
    }
    return { ok: true };
  } catch (err) {
    console.error("[resend] member support exception", err);
    return { ok: false, error: "send_failed" };
  }
}

export function supportRequestTypeLabel(type: SupportRequestType): string {
  return REQUEST_LABELS[type];
}
