"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useId, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";

import { NAV_LINKS, SITE } from "@/_lib/site-content";
import { useReducedMotion } from "@/_hooks/use-reduced-motion";

function resolveNavHref(href: string, pathname: string): string {
  if (href.startsWith("#")) {
    return pathname === "/" ? href : `/${href}`;
  }
  return href;
}

export function SiteHeader() {
  const reduced = useReducedMotion();
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const { ready, authenticated, logout } = usePrivy();
  const [menuOpen, setMenuOpen] = useState(false);
  const panelId = useId();

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, closeMenu]);

  return (
    <motion.header
      layout={false}
      className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-phronis-base/55 pt-[env(safe-area-inset-top,0px)] shadow-[0_1px_0_rgba(20,241,149,0.08)] backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-phronis-base/40"
      initial={reduced ? false : { y: -12, opacity: 0 }}
      animate={reduced ? undefined : { y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-phronis-teal/40 to-transparent" />
      <div className="gutter-safe mx-auto w-full min-w-0 max-w-6xl py-2">
        {/* Mobile: top bar */}
        <div className="flex items-center justify-between gap-3 sm:hidden">
          <Link
            href="/"
            onClick={closeMenu}
            className="group flex min-w-0 shrink items-baseline gap-1.5 font-semibold tracking-tight"
          >
            <span className="truncate text-base text-phronis-foreground">{SITE.name}</span>
            <span className="shrink-0 text-[11px] font-medium uppercase tracking-[0.12em] text-phronis-muted">
              Inc.
            </span>
          </Link>
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-phronis-border/80 bg-phronis-base/60 px-3 text-xs font-semibold tracking-tight text-phronis-muted shadow-sm transition-colors hover:border-phronis-teal/35 hover:bg-phronis-elevated/35 hover:text-phronis-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-phronis-teal"
            aria-expanded={menuOpen}
            aria-controls={panelId}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="text-phronis-foreground">{menuOpen ? "Close" : "Menu"}</span>
            {menuOpen ? <X className="h-5 w-5 shrink-0 text-phronis-foreground" strokeWidth={2} /> : <Menu className="h-5 w-5 shrink-0" strokeWidth={2} />}
          </button>
        </div>

        {/* Mobile: expand under bar (no overlay drawer) */}
        <div
          className={`grid sm:hidden ${menuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"} transition-[grid-template-rows] duration-200 ease-out`}
        >
          <div id={panelId} className="min-h-0 overflow-hidden" inert={!menuOpen ? true : undefined}>
            <div className="border-t border-white/10 pb-1 pt-3">
              <nav aria-label="Primary mobile">
                <ul className="divide-y divide-white/10 rounded-xl border border-white/10 bg-phronis-elevated/20">
                  {NAV_LINKS.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={resolveNavHref(item.href, pathname)}
                        onClick={closeMenu}
                        className="flex items-center justify-between gap-3 px-4 py-3 text-left text-[15px] font-medium text-phronis-foreground transition-colors hover:bg-white/[0.06] active:bg-white/[0.08]"
                      >
                        <span>{item.label}</span>
                        <span className="text-phronis-muted/70" aria-hidden>
                          →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="mt-4 px-0.5">
                {!ready ? (
                  <div className="flex h-11 w-full items-center justify-center rounded-lg border border-transparent bg-white/[0.03] text-xs text-phronis-muted" role="status">
                    Session…
                  </div>
                ) : authenticated ? (
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      void (async () => {
                        await logout();
                        router.push("/");
                      })();
                    }}
                    className="flex h-11 w-full items-center justify-center rounded-lg border border-phronis-border/90 text-center text-sm font-semibold text-phronis-foreground transition-colors hover:bg-white/5"
                  >
                    Sign out
                  </button>
                ) : (
                  <Link
                    href="/members#auth"
                    onClick={closeMenu}
                    className="flex h-11 w-full items-center justify-center rounded-lg border border-phronis-border/90 text-center text-sm font-semibold text-phronis-foreground transition-colors hover:bg-white/5"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop / tablet */}
        <div className="hidden min-h-16 flex-col gap-2 sm:flex sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <Link
            href="/"
            className="group flex shrink-0 items-baseline gap-1.5 self-start font-semibold tracking-tight sm:self-center sm:gap-2"
          >
            <span className="text-base text-phronis-foreground sm:text-lg">{SITE.name}</span>
            <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-phronis-muted sm:text-xs">
              Inc.
            </span>
          </Link>
          <nav
            aria-label="Primary"
            className="flex w-full min-w-0 max-w-full flex-nowrap items-center justify-center gap-x-3 overflow-x-auto overscroll-x-contain py-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-1 sm:gap-x-4 md:gap-x-5 [&::-webkit-scrollbar]:hidden"
          >
            {NAV_LINKS.map((item) => (
              <Link
                key={item.id}
                href={resolveNavHref(item.href, pathname)}
                className="shrink-0 whitespace-nowrap text-xs font-medium tracking-tight text-phronis-muted transition-colors hover:text-phronis-foreground sm:text-[13px]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex w-full items-center justify-end gap-2 sm:w-auto sm:shrink-0">
            {!ready ? (
              <span className="inline-flex h-8 w-[4.5rem] items-center justify-center sm:h-9" aria-hidden />
            ) : authenticated ? (
              <button
                type="button"
                onClick={() => {
                  void (async () => {
                    await logout();
                    router.push("/");
                  })();
                }}
                className="inline-flex h-8 items-center justify-center rounded-md border border-phronis-border/80 px-3 text-xs font-semibold text-phronis-muted transition-colors hover:border-red-400/30 hover:text-red-200 sm:h-9 sm:text-[13px]"
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/members#auth"
                className="inline-flex h-8 items-center justify-center rounded-md border border-phronis-border/80 px-3 text-xs font-semibold text-phronis-muted transition-colors hover:text-phronis-foreground sm:h-9 sm:text-[13px]"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
