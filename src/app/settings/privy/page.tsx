import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Wallet settings",
  robots: { index: false, follow: false },
};

/** Advanced Privy settings were removed from the member area; use Welcome for wallet, sync, and funding. */
export default function PrivySettingsPage() {
  redirect("/member");
}
