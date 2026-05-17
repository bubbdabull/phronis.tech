"use client";

import Link from "next/link";
import { MessageCircle, Sparkles, TrendingUp } from "lucide-react";

import { ComingSoonTrigger } from "@/_components/product/coming-soon-trigger";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/_components/ui/card";
import type { ComingSoonProduct } from "@/_lib/product/coming-soon";

type Tile = {
  href: string;
  title: string;
  description: string;
  icon: typeof MessageCircle;
  accent: string;
  comingSoon?: ComingSoonProduct;
};

const tiles: Tile[] = [
  {
    href: "/member/social",
    title: "Social & study",
    description: "Directory, friend requests, and study-room chat.",
    icon: MessageCircle,
    accent: "from-teal-500/20 to-transparent",
  },
  {
    href: "/member/trades",
    title: "Trade log",
    description: "Note buys, sells, and swaps with optional explorer signatures.",
    icon: TrendingUp,
    accent: "from-emerald-500/15 to-transparent",
  },
  {
    href: "/desk",
    title: "Terminal",
    description: "Live desk: risk, discovery, wallets, and AI assistant — coming soon.",
    icon: Sparkles,
    accent: "from-cyan-500/15 to-transparent",
    comingSoon: "terminal",
  },
];

export function MemberHubQuickLinks() {
  return (
    <section aria-labelledby="member-quick-links-heading">
      <h2 id="member-quick-links-heading" className="font-serif text-xl font-medium tracking-tight text-phronis-foreground sm:text-2xl">
        Explore the member hub
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-phronis-muted">Social and trades are live now. Terminal and DAO tools open from a preview modal until launch.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => {
          const Icon = t.icon;
          const card = (
            <Card className="h-full border-white/10 bg-gradient-to-br transition-colors group-hover:border-phronis-teal/25 group-hover:bg-white/[0.06]">
              <CardHeader className="relative overflow-hidden pb-2">
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${t.accent} opacity-80`} aria-hidden />
                <div className="relative flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-black/30 text-phronis-teal">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <CardTitle className="text-lg">{t.title}</CardTitle>
                </div>
                <CardDescription className="relative pt-1 text-sm leading-relaxed">{t.description}</CardDescription>
              </CardHeader>
              <CardContent className="relative pt-0">
                <span className="text-xs font-medium text-phronis-teal/90 group-hover:underline">{t.comingSoon ? "Preview →" : "Open →"}</span>
              </CardContent>
            </Card>
          );

          if (t.comingSoon) {
            return (
              <ComingSoonTrigger key={t.title} product={t.comingSoon} className="group block w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-phronis-teal/60">
                {card}
              </ComingSoonTrigger>
            );
          }

          return (
            <Link key={t.href} href={t.href} className="group block outline-none focus-visible:ring-2 focus-visible:ring-phronis-teal/60">
              {card}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
