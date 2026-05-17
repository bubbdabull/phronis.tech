import type { Metadata } from "next";

import { DeskAiDeskPanel } from "@/_features/member-desk/desk-ai-desk-panel";

export const metadata: Metadata = {
  title: "AI desk",
  description: "Solana-native assistant with structured analysis prompts.",
  robots: { index: false, follow: false },
};

export default function DeskAssistantPage() {
  return <DeskAiDeskPanel />;
}
