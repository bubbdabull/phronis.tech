import { NextResponse, type NextRequest } from "next/server";

/**
 * Jupiter v6 swap transaction builder (server-side proxy).
 */
export async function POST(request: NextRequest) {
  let body: { quoteResponse?: unknown; userPublicKey?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const { quoteResponse, userPublicKey } = body;
  if (!quoteResponse || !userPublicKey?.trim()) {
    return NextResponse.json({ ok: false, error: "missing_quote_or_wallet" }, { status: 400 });
  }

  try {
    const res = await fetch("https://quote-api.jup.ag/v6/swap", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        quoteResponse,
        userPublicKey: userPublicKey.trim(),
        wrapAndUnwrapSol: true,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: "auto",
      }),
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      const t = await res.text();
      return NextResponse.json({ ok: false, error: "jupiter_swap_error", detail: t.slice(0, 400) }, { status: 502 });
    }

    const json = (await res.json()) as { swapTransaction?: string };
    if (!json.swapTransaction) {
      return NextResponse.json({ ok: false, error: "missing_swap_transaction" }, { status: 502 });
    }

    return NextResponse.json({ ok: true, swapTransaction: json.swapTransaction });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "fetch_failed", detail: String(e) }, { status: 502 });
  }
}
