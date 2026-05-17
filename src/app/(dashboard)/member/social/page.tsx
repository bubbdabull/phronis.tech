import type { Metadata } from "next";

import { MemberSocialHub } from "@/_features/member-hub/member-social-hub";

export const metadata: Metadata = {
  title: "Member social",
  description: "Friends, requests, and study room chat.",
  robots: { index: false, follow: false },
};

export default function MemberSocialPage() {
  return <MemberSocialHub />;
}
