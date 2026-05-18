"use client";

import Image from "next/image";

const INFOGRAPHIC = {
  src: "/images/member/how-solana-liquidity-price.png",
  width: 682,
  height: 1024,
  alt: "How liquidity and price work on Solana tokens: from token creation and initial liquidity through AMM pricing, buying pressure, liquidity growth, and how holders and LPs earn.",
} as const;

export function PhronisLiquidityExplainer() {
  return (
    <figure className="overflow-hidden rounded-xl border border-white/10 bg-black/25">
      <div className="border-b border-white/10 bg-gradient-to-r from-violet-500/10 via-emerald-500/5 to-sky-500/10 px-4 py-3">
        <p className="text-sm font-semibold text-phronis-foreground">Liquidity &amp; price on Solana</p>
        <p className="mt-1 text-xs leading-relaxed text-phronis-muted">
          PHR trades on Solana DEX pools (e.g. Raydium, Meteora). This is how pool ratios set price when you buy with SOL or USDC via Jupiter.
        </p>
      </div>
      <Image
        src={INFOGRAPHIC.src}
        alt={INFOGRAPHIC.alt}
        width={INFOGRAPHIC.width}
        height={INFOGRAPHIC.height}
        className="h-auto w-full"
        sizes="(max-width: 768px) 100vw, 640px"
        priority={false}
      />
      <figcaption className="border-t border-white/10 px-4 py-3 text-xs leading-relaxed text-phronis-muted">
        Low liquidity means higher volatility — market cap can grow faster than pool depth. Always check slippage and pool size before large swaps.
      </figcaption>
    </figure>
  );
}
