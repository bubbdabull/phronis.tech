import type { Metadata } from "next";

import { MemberTradesHub } from "@/_features/member-hub/member-trades-hub";

export const metadata: Metadata = {
  title: "Trade log",
  description: "Track and annotate your trades.",
  robots: { index: false, follow: false },
};

export default function MemberTradesPage() {
  return <MemberTradesHub />;
}
