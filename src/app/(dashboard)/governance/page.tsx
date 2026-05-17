import type { Metadata } from "next";

import { ComingSoonGate } from "@/_components/product/coming-soon-gate";

export const metadata: Metadata = {
  title: "Governance",
  robots: { index: false, follow: false },
};

export default function GovernancePage() {
  return <ComingSoonGate product="dao" />;
}
