/** Where users land after join or sign-in completes. */
export const MEMBER_AUTH_SUCCESS_PATH = "/member";

export type MemberAuthMode = "join" | "signin";

export function parseMemberAuthMode(raw: string | null | undefined): MemberAuthMode {
  return raw === "signin" ? "signin" : "join";
}
