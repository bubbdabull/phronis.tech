"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/_lib/utils";

const MEMBER_TABS = [
  { href: "/member", label: "Home", exact: true },
  { href: "/member/social", label: "Social" },
  { href: "/member/trades", label: "Trade log" },
] as const;

const PAGE_TITLES: { match: string; title: string; description: string; exact?: boolean }[] = [
  {
    match: "/member",
    exact: true,
    title: "Member home",
    description: "Profile, wallet, funding, and support requests.",
  },
  {
    match: "/member/social",
    title: "Social & study",
    description: "Directory, friend requests, and study-room chat.",
  },
  {
    match: "/member/trades",
    title: "Trade log",
    description: "Record buys, sells, and swaps with optional explorer links.",
  },
];

function pageMeta(pathname: string) {
  const row =
    PAGE_TITLES.find((p) => (p.exact ? pathname === p.match : pathname === p.match || pathname.startsWith(`${p.match}/`))) ??
    PAGE_TITLES[0];
  return row;
}

export function TerminalMemberShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const meta = pageMeta(pathname);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-4 backdrop-blur-sm sm:px-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-phronis-teal/90">Member hub</p>
        <h1 className="mt-1 font-serif text-2xl font-medium tracking-tight text-phronis-foreground sm:text-3xl">{meta.title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-phronis-muted">{meta.description}</p>
        <nav
          className="mt-4 flex gap-2 overflow-x-auto pb-1 md:hidden"
          aria-label="Member sections"
        >
          {MEMBER_TABS.map((tab) => {
            const active =
              "exact" in tab && tab.exact
                ? pathname === tab.href
                : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "border-phronis-teal/50 bg-phronis-teal/15 text-phronis-teal"
                    : "border-white/15 text-phronis-muted hover:border-white/25 hover:text-phronis-foreground",
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
        <p className="mt-3 hidden text-[11px] text-phronis-muted/90 md:block">
          Use the sidebar for Home, Social, Trade log, and Academy. Terminal and DAO open from the sidebar when available.
        </p>
        <p className="mt-3 text-[11px] text-phronis-muted/90 md:hidden">
          Tap the menu icon for Academy and more, or use the tabs above / bottom bar to move between member pages.
        </p>
      </div>
      {children}
    </div>
  );
}
