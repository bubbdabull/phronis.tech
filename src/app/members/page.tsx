import type { Metadata } from "next";
import Link from "next/link";

import { MembersAuthSection } from "@/_components/auth/members-auth-section";
import { MembersProductCards } from "@/_components/member/members-product-cards";
import { parseMemberAuthMode } from "@/_lib/auth/member-auth-constants";
import { SITE } from "@/_lib/site-content";

export const metadata: Metadata = {
  title: "Members",
  description: `Join or sign in to ${SITE.name} — email OTP and embedded wallet, then your member hub.`,
  alternates: { canonical: "/members" },
  robots: { index: true, follow: true },
};

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; error?: string }>;
}) {
  const params = await searchParams;
  const initialMode = parseMemberAuthMode(params.mode);
  const errorMessage =
    params.error === "session_expired" ? "Your session ended. Sign in again." : params.error ?? "";

  return (
    <article className="border-b border-white/10 pb-24">
      <header className="border-b border-white/10 pt-28 pb-12 sm:pt-32 sm:pb-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-phronis-electric/90">Members</p>
          <h1 className="font-serif mt-4 text-4xl font-medium tracking-tight text-phronis-foreground sm:text-5xl">
            Join or sign in
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-phronis-muted sm:text-base">
            One place to create your account or return with email. We provision an embedded Solana wallet automatically,
            then send you to your{" "}
            <Link href="/member" className="text-phronis-teal underline-offset-4 hover:underline">
              member hub
            </Link>
            . For vendor work, see{" "}
            <Link href="/business" className="text-phronis-teal underline-offset-4 hover:underline">
              Business
            </Link>
            .
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-md px-4 pt-10 sm:px-6 lg:px-8">
        <MembersAuthSection initialMode={initialMode} errorMessage={errorMessage} />
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 lg:px-8" aria-labelledby="member-routes-heading">
        <h2 id="member-routes-heading" className="font-serif text-2xl font-medium tracking-tight text-phronis-foreground sm:text-3xl">
          After you&apos;re in
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-phronis-muted sm:text-base">
          Member hub and Academy are open after sign-in. Terminal and DAO show a coming-soon preview until those areas launch.
        </p>
        <MembersProductCards />
      </section>
    </article>
  );
}
