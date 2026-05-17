import type { Metadata } from "next";

import { WelcomeDashboard } from "@/_components/onboarding/welcome-dashboard";
import { MemberHubQuickLinks } from "@/_features/member-hub/member-hub-quick-links";

export const metadata: Metadata = {
  title: "Member hub",
  description: "Profile, wallet, PHR, social, and trade log — your Phronis member workspace.",
  robots: { index: false, follow: false },
};

/** Unified member home: former Welcome onboarding + hub entry points. */
export default function MemberHubHomePage() {
  return (
    <div className="space-y-10">
      <WelcomeDashboard />
      <MemberHubQuickLinks />
    </div>
  );
}
