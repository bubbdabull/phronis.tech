import type { PrivyClient } from "@privy-io/node";

export function getBearerToken(request: Request): string {
  const header = request.headers.get("authorization") ?? "";
  return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
}

export async function verifyPrivyAccessToken(
  privy: PrivyClient,
  accessToken: string,
): Promise<{ userId: string; appId: string; sessionId: string }> {
  const claims = await privy.utils().auth().verifyAccessToken(accessToken);
  return {
    userId: claims.user_id,
    appId: claims.app_id,
    sessionId: claims.session_id,
  };
}
