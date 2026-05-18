export type LiquidityFlowStep = {
  id: string;
  title: string;
  body: string;
};

export type LiquiditySection = {
  id: string;
  title: string;
  summary: string;
  bullets?: string[];
  highlight?: string;
  formula?: string;
};

export const LIQUIDITY_FLOW_STEPS: LiquidityFlowStep[] = [
  { id: "create", title: "Token created", body: "PHR (or any SPL token) launches on Solana." },
  { id: "liquidity", title: "Liquidity added", body: "Token + SOL or USDC go into a DEX pool (Raydium, Meteora, etc.)." },
  { id: "price", title: "Price set", body: "Starting price comes from the ratio of base asset to token in the pool." },
  { id: "buy", title: "Traders buy", body: "Swaps send SOL/USDC in and pull tokens out of the pool." },
  { id: "rise", title: "Price & LP grow", body: "Less token in the pool + more base asset → higher price and deeper liquidity." },
  { id: "earn", title: "Value captured", body: "Holders, creators, and LPs can benefit when price and depth increase." },
];

export const LIQUIDITY_SECTIONS: LiquiditySection[] = [
  {
    id: "initial-price",
    title: "1. Initial liquidity sets the price",
    summary: "The first deposit defines the starting exchange rate — not a centralized order book.",
    bullets: [
      "Example: 1,000,000 tokens + 100 SOL in the pool (1 SOL ≈ $150) → about $15,000 pool value.",
      "Starting price ≈ 100 ÷ 1,000,000 = 0.0001 SOL per token (~$0.015 at $150/SOL).",
    ],
    formula: "Token price ≈ Base asset in pool ÷ Tokens in pool",
  },
  {
    id: "amm",
    title: "2. How the AMM works",
    summary: "Most Solana DEXs use a constant-product market maker: the product of reserves stays on a curve.",
    formula: "x × y = k  (x = tokens in pool, y = SOL/USDC in pool, k = constant)",
    bullets: [
      "Every buy removes tokens and adds base asset — the curve moves price up automatically.",
      "Fees slowly increase k over time, paying liquidity providers for inventory risk.",
    ],
  },
  {
    id: "buy-pressure",
    title: "3. Price rises as buyers buy",
    summary: "Same pool, different ratios — buying pressure changes the numbers you see on Jupiter.",
    bullets: [
      "Launch: 1M tokens / 100 SOL → ~$0.015 per token.",
      "After buys: 700k tokens / 150 SOL → ~$0.032 (~2.1×).",
      "More buys: 400k tokens / 250 SOL → ~$0.094 (~6.3×).",
      "Why: tokens in the pool go down, base asset goes up — scarcity in the pool pushes price up.",
    ],
  },
  {
    id: "money-flow",
    title: "4. Flow of money",
    summary: "A simple path from buyer to pool to market impact.",
    bullets: [
      "Buyers enter → swap SOL/USDC for token.",
      "Pool receives base asset (in) and sends token (out).",
      "Result: scarcer token in pool, higher last price, market cap can rise, liquidity value can grow.",
    ],
  },
  {
    id: "liquidity-growth",
    title: "5. Liquidity grows over time",
    summary: "Healthy pools deepen as volume and fees accumulate — not only on day one.",
    bullets: [
      "Launch: e.g. 100 SOL (~$15k) in the pool.",
      "Later: e.g. 500+ SOL ($75k+) as trading continues and LPs add depth.",
      "Deeper liquidity → less slippage, stabler prices, larger trades possible, more confidence.",
    ],
  },
  {
    id: "who-earns",
    title: "6. How money is made",
    summary: "Different participants capture value in different ways — none of it is guaranteed.",
    bullets: [
      "Holders / creators: token balance worth more if price rises (e.g. 50M tokens at $0.001 → $0.05 is a large notional change).",
      "Liquidity providers (LPs): earn swap fees, may benefit from asset appreciation, sometimes incentives.",
    ],
    highlight: "Holding or LPing is risk — price can fall just as fast as it rises.",
  },
  {
    id: "cycle",
    title: "7. The growth cycle",
    summary: "Attention and buys can reinforce each other — until liquidity or sentiment shifts.",
    bullets: [
      "Create → add liquidity → price set → traders buy → SOL/USDC in, token out → price up → market cap narrative grows → more buyers → holders/LPs may profit → cycle can repeat.",
    ],
  },
  {
    id: "reality",
    title: "8. Important reality",
    summary: "Market cap and pool liquidity are not the same thing.",
    bullets: [
      "A small pool (e.g. $50k liquidity) can still show a large market cap ($5M+) because valuation uses last traded price × total supply.",
      "Thin pools mean outsized moves — up or down — on modest volume.",
    ],
    highlight: "Low liquidity = higher volatility. Check slippage and pool size before large PHR swaps.",
  },
];
