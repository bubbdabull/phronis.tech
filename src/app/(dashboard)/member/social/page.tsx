import type { Metadata } from "next";

import { MemberSocialHub } from "@/_features/member-hub/member-social-hub";

export const metadata: Metadata = {
  title: "Social",
  description: "Member feed, friends, messages, and study rooms.",
  robots: { index: false, follow: false },
};

export default function MemberSocialPage() {
  return <MemberSocialHub />;
}
