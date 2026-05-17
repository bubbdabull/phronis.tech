import type { Metadata } from "next";

import { DeskAlertsPanel } from "@/_features/member-desk/desk-alerts-panel";

export const metadata: Metadata = {
  title: "Alerts",
  description: "Whale buys, LP changes, dev sells, and custom webhooks.",
  robots: { index: false, follow: false },
};

export default function DeskAlertsPage() {
  return <DeskAlertsPanel />;
}
