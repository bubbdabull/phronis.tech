"use client";

import { ComingSoonContent } from "@/_components/product/coming-soon-content";
import { COMING_SOON_COPY, type ComingSoonProduct } from "@/_lib/product/coming-soon";

export function ComingSoonGate({ product }: { product: ComingSoonProduct }) {
  const copy = COMING_SOON_COPY[product];

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-8 backdrop-blur-xl sm:p-10">
      <ComingSoonContent copy={copy} />
    </div>
  );
}
