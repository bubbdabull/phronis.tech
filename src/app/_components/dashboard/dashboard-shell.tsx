"use client";

import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, PanelLeftClose, PanelLeftOpen, Sparkles, X } from "lucide-react";
import { useCallback, useState, type ReactNode } from "react";

import { MemberMobileNav } from "@/_components/dashboard/member-mobile-nav";
import { ComingSoonProvider } from "@/_components/product/coming-soon-provider";
import { ComingSoonTrigger } from "@/_components/product/coming-soon-trigger";
import { Button } from "@/_components/ui/button";
import type { ComingSoonProduct } from "@/_lib/product/coming-soon";
import { cn } from "@/_lib/utils";

const MEMBER_NAV = [
  { href: "/member", label: "Home", exact: true },
  { href: "/member/social", label: "Social" },
  { href: "/member/trades", label: "Trade log" },
] as const;

const OPEN_NAV = [{ href: "/learn", label: "Academy" }] as const;

const COMING_SOON_NAV: { label: string; product: ComingSoonProduct; match: string }[] = [
  { label: "Terminal", product: "terminal", match: "/desk" },
  { label: "DAO", product: "dao", match: "/dao" },
  { label: "Governance", product: "dao", match: "/governance" },
  { label: "Directory", product: "dao", match: "/dao/members" },
  { label: "Treasury", product: "dao", match: "/treasury" },
];

function navActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  href,
  label,
  open,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  open: boolean;
  active: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      title={open ? undefined : label}
      onClick={onNavigate}
      className={cn(
        "flex min-h-[40px] items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        open ? "justify-start" : "justify-center px-2",
        active ? "bg-white/10 text-phronis-teal" : "text-phronis-muted hover:bg-white/5 hover:text-phronis-foreground",
      )}
    >
      <span className={cn("truncate", !open && "text-xs font-semibold")}>{open ? label : label.slice(0, 1)}</span>
    </Link>
  );
}

function DashboardShellInner({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const { logout } = usePrivy();
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const memberWorkspace = pathname.startsWith("/member");
  const navExpanded = open || mobileOpen;
  const headerTitle = memberWorkspace
    ? "Member"
    : pathname.startsWith("/learn")
      ? "Academy"
      : pathname.startsWith("/desk")
        ? "Terminal"
        : "Workspace";

  return (
    <div className="min-h-dvh bg-[radial-gradient(ellipse_at_top,rgba(20,241,149,0.08),transparent_50%),#07090d] text-phronis-foreground">
      <div
        className={cn(
          "min-h-dvh",
          open ? "md:grid md:grid-cols-[16rem_minmax(0,1fr)]" : "md:grid md:grid-cols-[4.5rem_minmax(0,1fr)]",
        )}
      >
        <aside
          className={cn(
            "flex h-dvh min-h-0 w-64 shrink-0 flex-col border-r border-white/10 bg-phronis-base/80 backdrop-blur-xl",
            "max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-50 max-md:transition-transform max-md:duration-200",
            mobileOpen ? "max-md:translate-x-0 max-md:shadow-2xl" : "max-md:-translate-x-full",
          )}
        >
          <div
            className={cn(
              "flex h-14 shrink-0 items-center gap-2 border-b border-white/10 pt-[env(safe-area-inset-top,0px)]",
              navExpanded ? "px-4" : "px-2 justify-center",
            )}
          >
            <Sparkles className="h-5 w-5 shrink-0 text-phronis-teal" aria-hidden />
            {navExpanded ? <span className="truncate font-semibold tracking-tight">Phronis</span> : null}
            <button
              type="button"
              className={cn(
                "hidden rounded-md p-1.5 text-phronis-muted hover:bg-white/5 hover:text-phronis-foreground md:inline-flex",
                navExpanded ? "ml-auto" : "",
              )}
              aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
            </button>
            <button
              type="button"
              className="ml-auto inline-flex rounded-md p-1.5 text-phronis-muted hover:bg-white/5 hover:text-phronis-foreground md:hidden"
              aria-label="Close menu"
              onClick={closeMobile}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="thin-scrollbar flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden p-2">
            {navExpanded ? (
              <p className="px-2 pb-0.5 pt-1 text-[10px] font-semibold uppercase tracking-wider text-phronis-muted/80">Member</p>
            ) : null}
            {MEMBER_NAV.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                open={navExpanded}
                active={navActive(pathname, item.href, "exact" in item && item.exact)}
                onNavigate={closeMobile}
              />
            ))}

            {navExpanded ? (
              <p className="mt-2 px-2 pb-0.5 pt-1 text-[10px] font-semibold uppercase tracking-wider text-phronis-muted/80">Learn</p>
            ) : (
              <div className="mt-2 border-t border-white/10" aria-hidden />
            )}
            {OPEN_NAV.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                open={navExpanded}
                active={navActive(pathname, item.href)}
                onNavigate={closeMobile}
              />
            ))}

            {navExpanded ? (
              <p className="mt-2 px-2 pb-0.5 pt-1 text-[10px] font-semibold uppercase tracking-wider text-phronis-muted/80">Soon</p>
            ) : (
              <div className="mt-2 border-t border-white/10" aria-hidden />
            )}
            {COMING_SOON_NAV.map((item) => {
              const active = navActive(pathname, item.match);
              return (
                <ComingSoonTrigger
                  key={item.label}
                  product={item.product}
                  title={navExpanded ? undefined : item.label}
                  onClick={closeMobile}
                  className={cn(
                    "flex min-h-[40px] w-full items-center gap-2 rounded-lg py-2 text-left text-sm font-medium transition-colors",
                    navExpanded ? "justify-start px-3" : "justify-center px-2",
                    active ? "bg-white/10 text-phronis-teal" : "text-phronis-muted hover:bg-white/5 hover:text-phronis-foreground",
                  )}
                >
                  <span className={cn("truncate", !navExpanded && "text-xs font-semibold")}>
                    {navExpanded ? item.label : item.label.slice(0, 1)}
                  </span>
                </ComingSoonTrigger>
              );
            })}

            <Link
              href="/"
              title={navExpanded ? undefined : "Marketing site"}
              onClick={closeMobile}
              className={cn(
                "mt-2 flex min-h-[40px] items-center rounded-lg py-2 text-sm text-phronis-muted hover:bg-white/5 hover:text-phronis-foreground",
                navExpanded ? "px-3" : "justify-center px-2",
              )}
            >
              {navExpanded ? "Marketing site" : "\u2317"}
            </Link>
          </nav>
        </aside>

        {mobileOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            aria-label="Close menu"
            onClick={closeMobile}
          />
        ) : null}

        <div className="flex min-h-dvh min-w-0 flex-col">
          <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-white/10 bg-phronis-base/90 px-4 pt-[env(safe-area-inset-top,0px)] backdrop-blur-xl md:z-20 md:bg-phronis-base/70 md:px-6 md:pt-0">
            <button
              type="button"
              className="inline-flex rounded-md p-2 text-phronis-muted hover:bg-white/5 md:hidden"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="truncate text-sm font-medium text-phronis-muted">{headerTitle}</span>
            <div className="ml-auto flex shrink-0 items-center gap-2">
              <Button asChild variant="outline" size="sm" className="hidden border-white/15 sm:inline-flex">
                <Link href="/member">Home</Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-white/15"
                onClick={() => {
                  void logout();
                  window.location.href = "/";
                }}
              >
                Sign out
              </Button>
            </div>
          </header>
          <main
            className={cn(
              "gutter-safe mx-auto w-full min-w-0 max-w-6xl flex-1 px-4 py-6 md:px-6 md:py-8",
              memberWorkspace && "pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))] md:pb-8",
            )}
          >
            {children}
          </main>
        </div>
      </div>
      <MemberMobileNav />
    </div>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <ComingSoonProvider>
      <DashboardShellInner>{children}</DashboardShellInner>
    </ComingSoonProvider>
  );
}
