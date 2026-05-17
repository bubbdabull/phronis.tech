import type { Metadata } from "next";

import { ComingSoonGate } from "@/_components/product/coming-soon-gate";

export const metadata: Metadata = {
  title: "Treasury",
  robots: { index: false, follow: false },
};

export default function TreasuryPage() {
  return <ComingSoonGate product="dao" />;
}
