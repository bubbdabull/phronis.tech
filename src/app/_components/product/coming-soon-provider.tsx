"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { ComingSoonModule } from "@/_components/product/coming-soon-module";
import type { ComingSoonProduct } from "@/_lib/product/coming-soon";

type ComingSoonContextValue = {
  openComingSoon: (product: ComingSoonProduct) => void;
  closeComingSoon: () => void;
};

const ComingSoonContext = createContext<ComingSoonContextValue | null>(null);

export function ComingSoonProvider({ children }: { children: ReactNode }) {
  const [product, setProduct] = useState<ComingSoonProduct | null>(null);

  const openComingSoon = useCallback((next: ComingSoonProduct) => {
    setProduct(next);
  }, []);

  const closeComingSoon = useCallback(() => {
    setProduct(null);
  }, []);

  const value = useMemo(() => ({ openComingSoon, closeComingSoon }), [openComingSoon, closeComingSoon]);

  return (
    <ComingSoonContext.Provider value={value}>
      {children}
      <ComingSoonModule product={product} onClose={closeComingSoon} />
    </ComingSoonContext.Provider>
  );
}

export function useComingSoon() {
  const ctx = useContext(ComingSoonContext);
  if (!ctx) {
    throw new Error("useComingSoon must be used within ComingSoonProvider");
  }
  return ctx;
}
