import type { Metadata } from "next";

import { ArenaFrameworkSection } from "@/_components/sections/arena-framework-section";
import { ContactSection } from "@/_components/sections/contact-section";
import { DifferentiationSection } from "@/_components/sections/differentiation-section";
import { HeroSection } from "@/_components/sections/hero-section";
import { IdealClientSection } from "@/_components/sections/ideal-client-section";
import { ProcessSection } from "@/_components/sections/process-section";
import { ServicesSection } from "@/_components/sections/services-section";
import { TrustSection } from "@/_components/sections/trust-section";
import { SITE } from "@/_lib/site-content";

export const metadata: Metadata = {
  title: "Business",
  description: `${SITE.legalName} — token programs, infrastructure, and technical services for organizations.`,
  alternates: { canonical: "/business" },
  robots: { index: true, follow: true },
};

export default function BusinessPage() {
  return (
    <>
      <HeroSection />
      <TrustSection />
      <ArenaFrameworkSection />
      <ServicesSection />
      <DifferentiationSection />
      <ProcessSection />
      <IdealClientSection />
      <ContactSection />
    </>
  );
}
