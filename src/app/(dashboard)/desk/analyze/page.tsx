import type { Metadata } from "next";

import { DeskAnalyzerForm } from "@/_features/member-desk/desk-analyzer-form";

export const metadata: Metadata = {
  title: "Analyzer",
  description: "Solana token contract analyzer (scaffold).",
  robots: { index: false, follow: false },
};

export default function DeskAnalyzePage() {
  return <DeskAnalyzerForm />;
}
