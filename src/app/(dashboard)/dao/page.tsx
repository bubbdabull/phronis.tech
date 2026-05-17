import type { Metadata } from "next";

import { ComingSoonGate } from "@/_components/product/coming-soon-gate";

export const metadata: Metadata = {
  title: "DAO",
  robots: { index: false, follow: false },
};

export default function DaoPage() {
  return <ComingSoonGate product="dao" />;
}
