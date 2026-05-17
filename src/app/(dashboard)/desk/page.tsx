import type { Metadata } from "next";

import { DeskHomeDashboard } from "@/_features/member-desk/desk-home-dashboard";

export const metadata: Metadata = {
  title: "Terminal",
  description: "Member trading desk — watchlists, risk, discovery, and learning.",
  robots: { index: false, follow: false },
};

export default function DeskHomePage() {
  return <DeskHomeDashboard />;
}
