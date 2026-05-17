import type { Metadata } from "next";

import { DeskTrackedWalletsPanel } from "@/_features/member-desk/desk-tracked-wallets-panel";

export const metadata: Metadata = {
  title: "Smart wallets",
  description: "Follow wallets, clusters, and smart-money scores.",
  robots: { index: false, follow: false },
};

export default function DeskWalletsPage() {
  return <DeskTrackedWalletsPanel />;
}
