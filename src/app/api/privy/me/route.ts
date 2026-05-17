import { NextResponse } from "next/server";

import { getPrivyServerClient } from "@/_lib/privy-server";

/**
 * Verifies the browser's Privy access token using your app secret.
 * Call from the client after login: `Authorization: Bearer` + `await getAccessToken()`.
 */
export async function GET(request: Request) {
  const privy = getPrivyServerClient();
  if (!privy) {
    return NextResponse.json(
      { ok: false, error: "privy_server_not_configured" },
      { status: 503 },
    );
  }

  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) {
    return NextResponse.json({ ok: false, error: "missing_authorization" }, { status: 401 });
  }

  try {
    const claims = await privy.utils().auth().verifyAccessToken(token);
    return NextResponse.json({
      ok: true,
      userId: claims.user_id,
      appId: claims.app_id,
      sessionId: claims.session_id,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_token" }, { status: 401 });
  }
}
