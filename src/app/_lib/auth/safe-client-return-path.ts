/** Same-origin relative paths only; prevents open redirects. Safe for Client Components. */
export function safeClientReturnPath(raw: string | null | undefined): string {
  if (!raw || typeof raw !== "string") return "/";
  const t = raw.trim();
  if (!t.startsWith("/") || t.startsWith("//")) return "/";
  return t;
}
