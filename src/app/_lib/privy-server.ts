import { PrivyClient } from "@privy-io/node";

let client: PrivyClient | null | undefined;

/** Returns a Privy server client when `NEXT_PUBLIC_PRIVY_APP_ID` + `PRIVY_APP_SECRET` are set. */
export function getPrivyServerClient(): PrivyClient | null {
  if (client !== undefined) return client;

  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID?.trim();
  const appSecret = process.env.PRIVY_APP_SECRET?.trim();
  const jwtVerificationKey = process.env.PRIVY_JWT_VERIFICATION_KEY?.trim();

  if (!appId || !appSecret) {
    client = null;
    return client;
  }

  client = new PrivyClient({
    appId,
    appSecret,
    ...(jwtVerificationKey ? { jwtVerificationKey } : {}),
  });
  return client;
}
