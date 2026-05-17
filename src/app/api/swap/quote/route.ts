import { NextResponse, type NextRequest } from "next/server";

import { getPhrDaoTokenMint } from "@/_lib/phronis-dao-token";

/**
 * Jupiter v6 quote proxy (server-side). Rate-limit in production (e.g. edge middleware + KV).
 */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const inputMint = sp.get("inputMint") ?? "So11111111111111111111111111111111111111112";
  const outputMint = sp.get("outputMint") ?? getPhrDaoTokenMint() ?? "";
  const amount = sp.get("amount");
  if (!outputMint || !amount) {
    return NextResponse.json({ ok: false, error: "missing_output_mint_or_amount" }, { status: 400 });
  }

  const url = new URL("https://quote-api.jup.ag/v6/quote");
  url.searchParams.set("inputMint", inputMint);
  url.searchParams.set("outputMint", outputMint);
  url.searchParams.set("amount", amount);
  url.searchParams.set("slippageBps", sp.get("slippageBps") ?? "50");

  try {
    const res = await fetch(url.toString(), { headers: { Accept: "application/json" }, next: { revalidate: 0 } });
    if (!res.ok) {
      const t = await res.text();
      return NextResponse.json({ ok: false, error: "jupiter_error", detail: t.slice(0, 400) }, { status: 502 });
    }
    const json = (await res.json()) as Record<string, unknown> & { outAmount?: string; priceImpactPct?: string };
    return NextResponse.json({
      ok: true,
      outAmount: json.outAmount ?? "0",
      priceImpactPct: json.priceImpactPct,
      quote: json,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "fetch_failed", detail: String(e) }, { status: 502 });
  }
}
