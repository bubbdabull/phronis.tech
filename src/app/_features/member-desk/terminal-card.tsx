import type { ReactNode } from "react";

import { cn } from "@/_lib/utils";

type TerminalCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  /** Accent stripe on the left (Bloomberg-style). */
  accent?: "teal" | "amber" | "violet" | "slate";
};

const accentBar: Record<NonNullable<TerminalCardProps["accent"]>, string> = {
  teal: "from-phronis-teal/80 to-phronis-teal/10",
  amber: "from-amber-400/80 to-amber-400/10",
  violet: "from-violet-400/80 to-violet-400/10",
  slate: "from-white/30 to-white/5",
};

export function TerminalCard({ title, subtitle, children, className, accent = "teal" }: TerminalCardProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset] backdrop-blur-md",
        className,
      )}
    >
      <div className={cn("absolute inset-y-0 left-0 w-1 bg-gradient-to-b", accentBar[accent])} aria-hidden />
      <div className="p-4 pl-5 sm:p-5">
        <header className="mb-3 flex flex-col gap-0.5">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-phronis-muted">{title}</h3>
          {subtitle ? <p className="text-xs text-phronis-muted/90">{subtitle}</p> : null}
        </header>
        <div className="text-sm text-phronis-foreground/95">{children}</div>
      </div>
    </section>
  );
}

/** Tiny bar sparkline without chart libs (placeholder until Recharts / TradingView). */
export function TerminalSparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-10 items-end gap-px" aria-hidden>
      {values.map((v, i) => (
        <div
          key={i}
          className="w-1.5 rounded-sm bg-phronis-teal/70"
          style={{ height: `${Math.max(8, (v / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}
