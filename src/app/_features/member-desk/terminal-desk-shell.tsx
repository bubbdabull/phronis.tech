"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { cn } from "@/_lib/utils";

const DESK_NAV = [
  { href: "/desk", label: "Home" },
  { href: "/desk/analyze", label: "Analyzer" },
  { href: "/desk/wallets", label: "Smart wallets" },
  { href: "/desk/risk", label: "Rug radar" },
  { href: "/desk/discover", label: "Discover" },
  { href: "/desk/alerts", label: "Alerts" },
  { href: "/desk/assistant", label: "AI desk" },
  { href: "/desk/admin", label: "Admin" },
] as const;

function DeskLiveStrip() {
  const [utc, setUtc] = useState("—:—:—");
  useEffect(() => {
    const tick = () => setUtc(new Date().toISOString().slice(11, 19));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-[10px] text-phronis-muted">
      <span className="font-mono tracking-wide text-phronis-teal/85">{utc} UTC</span>
      <span className="text-right">Educational analytics · verify on-chain · not investment advice</span>
    </div>
  );
}

export function TerminalDeskShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-4 backdrop-blur-sm sm:px-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-phronis-teal/90">Terminal</p>
        <h1 className="font-serif mt-1 text-2xl font-medium tracking-tight text-phronis-foreground sm:text-3xl">
          Member desk
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-phronis-muted">
          Live chain and market data: SOL / PHR balances via your RPC, DexScreener discovery and charts, optional Birdeye on
          the analyzer, Supabase-backed alerts and AI desk threads.
        </p>
        <nav className="mt-4 flex gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {DESK_NAV.map((item) => {
            const active =
              item.href === "/desk" ? pathname === "/desk" : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:text-sm",
                  active ? "bg-white/12 text-phronis-teal" : "text-phronis-muted hover:bg-white/5 hover:text-phronis-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/learn"
            className="shrink-0 rounded-lg px-3 py-2 text-xs font-medium text-phronis-muted hover:bg-white/5 hover:text-phronis-foreground sm:text-sm"
          >
            Academy
          </Link>
        </nav>
        <DeskLiveStrip />
      </div>
      {children}
    </div>
  );
}
