"use client";

import Link from "next/link";

import { Button } from "@/_components/ui/button";

/**
 * Post-auth wallet hint on `/members` — auth form is above in `MembersAuthSection`.
 */
export function MembersStepOneWallet() {
  return (
    <section className="border-b border-white/10 bg-phronis-surface/20 py-14 sm:py-16" aria-labelledby="members-wallet-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2
          id="members-wallet-heading"
          className="font-serif text-2xl font-medium tracking-tight text-phronis-foreground sm:text-3xl"
        >
          Wallet &amp; balances
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-phronis-muted sm:text-base">
          After you join or sign in above, open the{" "}
          <Link href="/member" className="text-phronis-teal underline-offset-4 hover:underline">
            member hub
          </Link>{" "}
          to complete your profile, sync your Privy smart wallet, and fund with SOL (gas) and USDC (stable funding for PHR).
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild className="bg-phronis-teal text-phronis-void hover:opacity-90">
            <Link href="/member">Open member hub</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
