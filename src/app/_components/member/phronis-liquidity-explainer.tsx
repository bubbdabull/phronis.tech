"use client";

import Image from "next/image";
import { ChevronDown, Maximize2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/_components/ui/button";
import { LIQUIDITY_FLOW_STEPS, LIQUIDITY_SECTIONS } from "@/_lib/phronis-liquidity-content";
import { cn } from "@/_lib/utils";

const POSTER = {
  src: "/images/member/how-solana-liquidity-price.png",
  width: 682,
  height: 1024,
  alt: "Full poster: how liquidity and price work on Solana tokens.",
} as const;

function formatUsd(n: number): string {
  if (n >= 1) return `$${n.toLocaleString(undefined, { maximumFractionDigits: 4 })}`;
  if (n >= 0.0001) return `$${n.toFixed(6)}`;
  return `$${n.toExponential(2)}`;
}

function LaunchPriceCalculator() {
  const [tokens, setTokens] = useState("1000000");
  const [sol, setSol] = useState("100");
  const [solUsd, setSolUsd] = useState("150");

  const result = useMemo(() => {
    const t = Number(tokens.replace(/,/g, ""));
    const s = Number(sol);
    const usd = Number(solUsd);
    if (!Number.isFinite(t) || t <= 0 || !Number.isFinite(s) || s <= 0 || !Number.isFinite(usd) || usd <= 0) {
      return null;
    }
    const priceSol = s / t;
    const priceUsd = priceSol * usd;
    const poolUsd = s * usd;
    return { priceSol, priceUsd, poolUsd };
  }, [tokens, sol, solUsd]);

  return (
    <div className="mt-4 rounded-lg border border-violet-500/20 bg-violet-500/5 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-violet-300/90">Try your own launch math</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <label className="block space-y-1 text-xs">
          <span className="text-phronis-muted">Tokens in pool</span>
          <input
            type="text"
            inputMode="numeric"
            value={tokens}
            onChange={(e) => setTokens(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-phronis-foreground outline-none focus:border-phronis-teal/40"
          />
        </label>
        <label className="block space-y-1 text-xs">
          <span className="text-phronis-muted">SOL in pool</span>
          <input
            type="text"
            inputMode="decimal"
            value={sol}
            onChange={(e) => setSol(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-phronis-foreground outline-none focus:border-phronis-teal/40"
          />
        </label>
        <label className="block space-y-1 text-xs">
          <span className="text-phronis-muted">SOL price (USD)</span>
          <input
            type="text"
            inputMode="decimal"
            value={solUsd}
            onChange={(e) => setSolUsd(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-phronis-foreground outline-none focus:border-phronis-teal/40"
          />
        </label>
      </div>
      {result ? (
        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
          <div className="rounded-lg bg-black/30 px-3 py-2">
            <dt className="text-[10px] uppercase tracking-wider text-phronis-muted">Price (SOL)</dt>
            <dd className="font-mono font-medium text-emerald-300/95">{result.priceSol.toExponential(4)}</dd>
          </div>
          <div className="rounded-lg bg-black/30 px-3 py-2">
            <dt className="text-[10px] uppercase tracking-wider text-phronis-muted">Price (USD)</dt>
            <dd className="font-mono font-medium text-emerald-300/95">{formatUsd(result.priceUsd)}</dd>
          </div>
          <div className="rounded-lg bg-black/30 px-3 py-2">
            <dt className="text-[10px] uppercase tracking-wider text-phronis-muted">Pool value (USD)</dt>
            <dd className="font-mono font-medium text-sky-300/95">{formatUsd(result.poolUsd)}</dd>
          </div>
        </dl>
      ) : (
        <p className="mt-3 text-xs text-amber-200/80">Enter positive numbers to calculate.</p>
      )}
    </div>
  );
}

function BuyPressureCompare() {
  const stages = [
    { label: "At launch", tokens: "1M", sol: "100", price: "~$0.015", mult: "1×" },
    { label: "After buys", tokens: "700k", sol: "150", price: "~$0.032", mult: "2.1×" },
    { label: "More pressure", tokens: "400k", sol: "250", price: "~$0.094", mult: "6.3×" },
  ] as const;

  return (
    <div className="mt-4 grid gap-2 sm:grid-cols-3">
      {stages.map((s) => (
        <div key={s.label} className="rounded-lg border border-emerald-500/15 bg-emerald-500/5 px-3 py-3 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300/80">{s.label}</p>
          <p className="mt-2 font-mono text-xs text-phronis-muted">
            {s.tokens} tokens · {s.sol} SOL
          </p>
          <p className="mt-1 text-lg font-semibold text-phronis-foreground">{s.price}</p>
          <p className="text-xs text-phronis-teal">{s.mult}</p>
        </div>
      ))}
    </div>
  );
}

function PosterLightbox({ onClose }: { onClose: () => void }) {
  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onKey]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/95 p-4" role="dialog" aria-modal aria-label="Full infographic poster">
      <div className="flex shrink-0 items-center justify-between gap-3 pb-3">
        <p className="text-sm font-medium text-phronis-foreground">Full poster — pinch or scroll to zoom</p>
        <Button type="button" size="sm" variant="outline" className="border-white/20" onClick={onClose}>
          <X className="mr-1.5 h-4 w-4" />
          Close
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-auto overscroll-contain rounded-lg border border-white/10 bg-black/50">
        <Image
          src={POSTER.src}
          alt={POSTER.alt}
          width={POSTER.width}
          height={POSTER.height}
          className="mx-auto h-auto w-full max-w-3xl"
          sizes="100vw"
          unoptimized
        />
      </div>
    </div>
  );
}

function SectionPanel({
  sectionId,
  open,
  onToggle,
}: {
  sectionId: string;
  open: boolean;
  onToggle: () => void;
}) {
  const section = LIQUIDITY_SECTIONS.find((s) => s.id === sectionId);
  if (!section) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition hover:bg-white/[0.03]"
        aria-expanded={open}
      >
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-phronis-teal/15 text-[11px] font-bold text-phronis-teal">
          {section.title.split(".")[0]}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-phronis-foreground">{section.title.replace(/^\d+\.\s*/, "")}</span>
          <span className="mt-0.5 block text-xs leading-relaxed text-phronis-muted">{section.summary}</span>
        </span>
        <ChevronDown className={cn("mt-1 h-4 w-4 shrink-0 text-phronis-muted transition", open && "rotate-180")} />
      </button>
      {open ? (
        <div className="space-y-3 border-t border-white/10 px-4 pb-4 pt-3 text-sm leading-relaxed text-phronis-muted">
          {section.formula ? (
            <p className="rounded-lg border border-sky-500/20 bg-sky-500/10 px-3 py-2 font-mono text-xs text-sky-200/95">{section.formula}</p>
          ) : null}
          {section.bullets?.map((b) => (
            <p key={b} className="flex gap-2">
              <span className="text-phronis-teal" aria-hidden>
                •
              </span>
              <span>{b}</span>
            </p>
          ))}
          {section.highlight ? (
            <p className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-100/90">{section.highlight}</p>
          ) : null}
          {section.id === "initial-price" ? <LaunchPriceCalculator /> : null}
          {section.id === "buy-pressure" ? <BuyPressureCompare /> : null}
        </div>
      ) : null}
    </div>
  );
}

export function PhronisLiquidityExplainer() {
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set(["initial-price"]));
  const [posterOpen, setPosterOpen] = useState(false);

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => setOpenIds(new Set(LIQUIDITY_SECTIONS.map((s) => s.id)));
  const collapseAll = () => setOpenIds(new Set());

  return (
    <>
      <article className="overflow-hidden rounded-xl border border-white/10 bg-black/25">
        <header className="border-b border-white/10 bg-gradient-to-r from-violet-500/10 via-emerald-500/5 to-sky-500/10 px-4 py-4 sm:px-5">
          <h3 className="text-base font-semibold text-phronis-foreground sm:text-lg">How liquidity &amp; price work on Solana</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-phronis-muted">
            PHR swaps on Solana DEX pools (Raydium, Meteora, etc.) through Jupiter. Buy pressure changes the token-to-SOL ratio in the pool — that moves price.
          </p>
        </header>

        <div className="border-b border-white/10 px-4 py-4 sm:px-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-phronis-teal/90">The flow</p>
          <ol className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-6">
            {LIQUIDITY_FLOW_STEPS.map((step, i) => (
              <li
                key={step.id}
                className="flex min-w-[140px] shrink-0 flex-col rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 sm:min-w-0"
              >
                <span className="text-[10px] font-bold text-phronis-teal">{i + 1}</span>
                <span className="mt-1 text-xs font-semibold text-phronis-foreground">{step.title}</span>
                <span className="mt-1 text-[11px] leading-snug text-phronis-muted">{step.body}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-2.5 sm:px-5">
          <p className="text-xs text-phronis-muted">Tap a topic to expand — readable on any screen size.</p>
          <div className="flex gap-2">
            <button type="button" className="text-xs font-medium text-phronis-teal hover:underline" onClick={expandAll}>
              Expand all
            </button>
            <span className="text-phronis-muted/40">·</span>
            <button type="button" className="text-xs font-medium text-phronis-muted hover:underline" onClick={collapseAll}>
              Collapse
            </button>
          </div>
        </div>

        <div className="space-y-2 p-4 sm:p-5">
          {LIQUIDITY_SECTIONS.map((s) => (
            <SectionPanel key={s.id} sectionId={s.id} open={openIds.has(s.id)} onToggle={() => toggle(s.id)} />
          ))}
        </div>

        <footer className="flex flex-col gap-3 border-t border-white/10 bg-amber-500/5 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-xs leading-relaxed text-amber-100/85">
            <strong className="text-amber-200/95">Before you swap PHR:</strong> check pool liquidity, price impact, and slippage in the buy panel above.
          </p>
          <Button type="button" size="sm" variant="outline" className="shrink-0 border-white/15 text-xs" onClick={() => setPosterOpen(true)}>
            <Maximize2 className="mr-1.5 h-3.5 w-3.5" />
            View full poster
          </Button>
        </footer>
      </article>

      {posterOpen ? <PosterLightbox onClose={() => setPosterOpen(false)} /> : null}
    </>
  );
}
