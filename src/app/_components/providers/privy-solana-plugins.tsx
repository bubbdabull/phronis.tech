"use client";

import { useSolanaFundingPlugin } from "@privy-io/react-auth/solana";
import type { ReactNode } from "react";

/**
 * Registers Solana funding for legacy flows (e.g. insufficient-funds during send). Card on-ramp uses `useFiatOnramp`.
 * and wraps app children so `PrivyProvider` receives a single React child (avoids extra sibling trees).
 */
export function PrivyWithSolanaFunding({ children }: { children: ReactNode }) {
  useSolanaFundingPlugin();
  return <>{children}</>;
}
