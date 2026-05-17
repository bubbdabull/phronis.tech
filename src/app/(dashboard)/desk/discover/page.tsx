import type { Metadata } from "next";

import { DeskDiscoverPanel } from "@/_features/member-desk/desk-discover-panel";

export const metadata: Metadata = {
  title: "Discover",
  description: "Find gems — filters for liquidity, holders, and narrative.",
  robots: { index: false, follow: false },
};

export default function DeskDiscoverPage() {
  return <DeskDiscoverPanel />;
}
