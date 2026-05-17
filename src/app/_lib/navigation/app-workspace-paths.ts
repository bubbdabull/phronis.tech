/** Routes that use `DashboardShell` — hide marketing header/footer so app chrome is not doubled. */
const APP_WORKSPACE_PREFIXES = [
  "/member",
  "/desk",
  "/learn",
  "/dao",
  "/governance",
  "/treasury",
  "/welcome",
] as const;

export function isAppWorkspacePath(pathname: string): boolean {
  return APP_WORKSPACE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
