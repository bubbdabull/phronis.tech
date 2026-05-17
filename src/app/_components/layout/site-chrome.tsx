"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { SiteFooter } from "@/_components/layout/site-footer";
import { SiteHeader } from "@/_components/layout/site-header";
import { isAppWorkspacePath } from "@/_lib/navigation/app-workspace-paths";

/** Marketing header/footer — omitted on member/desk/academy workspace routes. */
export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const workspace = isAppWorkspacePath(pathname);

  return (
    <>
      {!workspace ? <SiteHeader /> : null}
      {children}
      {!workspace ? <SiteFooter /> : null}
    </>
  );
}
