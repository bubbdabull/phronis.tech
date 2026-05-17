import { redirect } from "next/navigation";

import { MEMBER_AUTH_SUCCESS_PATH } from "@/_lib/auth/member-auth-constants";
import { safeClientReturnPath } from "@/_lib/auth/safe-client-return-path";

/** Legacy URL — auth lives on `/members`. */
export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = safeClientReturnPath(params.redirectTo ?? MEMBER_AUTH_SUCCESS_PATH);
  redirect(`/members?mode=join&redirectTo=${encodeURIComponent(redirectTo)}#auth`);
}
