"use client";

import { usePathname } from "next/navigation";

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
        <p className="mt-3 text-[11px] text-phronis-muted/90">
          Use the sidebar for Home, Social, Trade log, and Academy. Terminal and DAO open from the sidebar when available.
        </p>
      </div>
      {children}
    </div>
  );
}
