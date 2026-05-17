"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Activity, LayoutDashboard, Shield, Users } from "lucide-react";

import { ComingSoonModule } from "@/_components/product/coming-soon-module";
import { Button } from "@/_components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/_components/ui/card";
import type { ComingSoonProduct } from "@/_lib/product/coming-soon";

const CARDS = [
  {
    id: "hub",
    title: "Member hub",
    description: "Your home after sign-in: social, trade log, and overview cards.",
    href: "/member",
    icon: LayoutDashboard,
    cta: "Open member hub",
    comingSoon: null as ComingSoonProduct | null,
  },
  {
    id: "terminal",
    title: "Trading terminal",
    description: "Live trending, wallet balances, analyzer, and desk tools — launching soon.",
    href: "/desk",
    icon: Activity,
    cta: "Preview terminal",
    comingSoon: "terminal" as const,
  },
  {
    id: "dao",
    title: "Community tools",
    description: "DAO governance, treasury, and directory — launching soon.",
    href: "/dao",
    icon: Shield,
    cta: "Preview DAO",
    comingSoon: "dao" as const,
  },
  {
    id: "directory",
    title: "Member directory",
    description: "Searchable list of qualifying members — part of the DAO rollout.",
    href: "/dao/members",
    icon: Users,
    cta: "Preview directory",
    comingSoon: "dao" as const,
  },
] as const;

export function MembersProductCards() {
  const [modal, setModal] = useState<ComingSoonProduct | null>(null);

  return (
    <>
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {CARDS.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.id} className="border-white/10 bg-phronis-elevated/15">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-black/25 text-phronis-teal">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </div>
                <CardDescription className="text-phronis-muted">{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {item.comingSoon ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/15"
                    onClick={() => setModal(item.comingSoon)}
                  >
                    {item.cta}
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                  </Button>
                ) : (
                  <Button asChild variant="outline" className="border-white/15">
                    <Link href={item.href}>
                      {item.cta}
                      <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      <ComingSoonModule product={modal} onClose={() => setModal(null)} />
    </>
  );
}
