import type { Metadata } from "next";

import { ComingSoonGate } from "@/_components/product/coming-soon-gate";

export const metadata: Metadata = {
  title: "Member directory",
  robots: { index: false, follow: false },
};

export default function DaoMemberDirectoryPage() {
  return <ComingSoonGate product="dao" />;
}
