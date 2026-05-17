import type { Metadata } from "next";

import { DeskRugRadarPanel } from "@/_features/member-desk/desk-rug-radar-panel";

export const metadata: Metadata = {
  title: "Rug radar",
  description: "Mint authority, LP, wash trading, and honeypot signals.",
  robots: { index: false, follow: false },
};

export default function DeskRiskPage() {
  return <DeskRugRadarPanel />;
}
