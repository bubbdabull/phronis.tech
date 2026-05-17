import type { Metadata } from "next";

import { HomeSplitGateway } from "@/_components/home/home-split-gateway";
import { SITE } from "@/_lib/site-content";

export const metadata: Metadata = {
  title: "Home",
  description: SITE.tagline,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${SITE.legalName}`,
    description: SITE.tagline,
    url: "/",
  },
};

export default function HomePage() {
  return <HomeSplitGateway />;
}
