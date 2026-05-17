import { redirect } from "next/navigation";

import { MEMBER_AUTH_SUCCESS_PATH } from "@/_lib/auth/member-auth-constants";
import { safeClientReturnPath } from "@/_lib/auth/safe-client-return-path";

const ERROR_MESSAGES: Record<string, string> = {
  session_expired: "Your session ended. Sign in again.",
};

/** Legacy URL — auth lives on `/members`. */
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirectTo?: string }>;
}) {
  const params = await searchParams;
  const error = params.error ? (ERROR_MESSAGES[params.error] ?? "Something went wrong.") : "";
  const redirectTo = safeClientReturnPath(params.redirectTo ?? MEMBER_AUTH_SUCCESS_PATH);
  const q = new URLSearchParams({ mode: "signin", redirectTo });
  if (error) q.set("error", error);
  redirect(`/members?${q.toString()}#auth`);
}
