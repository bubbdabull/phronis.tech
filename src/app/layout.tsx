import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Lora, Plus_Jakarta_Sans } from "next/font/google";

import { SiteFooter } from "@/_components/layout/site-footer";
import { SiteHeader } from "@/_components/layout/site-header";
import { PrivyAppWrapper } from "@/_components/providers/privy-app-wrapper";
import { SITE } from "@/_lib/site-content";

import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans-body",
  display: "swap",
});

const serif = Lora({
  subsets: ["latin"],
  variable: "--font-serif-display",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-code",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://phronis.tech";
const metadataBase = (() => {
  try {
    return new URL(siteUrl);
  } catch {
    return new URL("https://phronis.tech");
  }
})();

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: `${SITE.legalName} · Web3 infrastructure`,
    template: `%s · ${SITE.legalName}`,
  },
  description: SITE.description,
  applicationName: SITE.legalName,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: SITE.legalName,
    title: `${SITE.legalName} · Web3 infrastructure`,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.legalName} · Web3 infrastructure`,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }] },
};

export const viewport: Viewport = {
  themeColor: "#0a0c10",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  /** Enables `env(safe-area-inset-*)` on notched devices (iOS, many Android browsers including Brave). */
  viewportFit: "cover",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.legalName,
  url: siteUrl,
  description: SITE.description,
  sameAs: [] as string[],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${sans.variable} ${serif.variable} ${mono.variable} min-h-screen min-h-dvh font-sans`}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-md focus:bg-phronis-teal focus:px-3 focus:py-2 focus:text-xs focus:font-semibold focus:text-phronis-void focus:shadow-lg"
        >
          Skip to content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <PrivyAppWrapper>
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
        </PrivyAppWrapper>
      </body>
    </html>
  );
}
