import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Building2, Users } from "lucide-react";

import { SITE } from "@/_lib/site-content";

/**
 * Root landing: routes visitors to business marketing vs member flows.
 */
export function HomeSplitGateway() {
  return (
    <section
      aria-labelledby="gateway-heading"
      className="relative overflow-hidden border-b border-white/10 pt-24 pb-16 sm:pt-28 sm:pb-24"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(20,241,149,0.08),transparent_55%),radial-gradient(circle_at_90%_20%,rgba(47,139,255,0.07),transparent_42%),radial-gradient(circle_at_5%_80%,rgba(153,69,255,0.04),transparent_35%)]" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-gradient-to-r from-phronis-teal/80 to-transparent sm:w-14" aria-hidden />
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-phronis-teal/90">
              {SITE.legalName}
            </p>
          </div>
          <h1
            id="gateway-heading"
            className="font-serif mt-5 text-balance text-4xl font-medium leading-[1.1] tracking-tight text-phronis-foreground sm:text-5xl lg:text-[3.25rem]"
          >
            Choose how you work with Phronis
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-phronis-muted sm:text-lg">
            {SITE.tagline}
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2 lg:gap-8">
          <Link
            href="/business"
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/12 bg-phronis-surface/40 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.06)] transition-[border-color,box-shadow,transform] duration-300 hover:border-phronis-teal/40 hover:shadow-[0_28px_90px_-28px_rgba(20,241,149,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-phronis-teal"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden sm:aspect-[2/1]">
              <Image
                src="/home/gateway-business.png"
                alt=""
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center transition duration-700 ease-out group-hover:scale-[1.03]"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-phronis-surface via-phronis-surface/20 to-transparent"
                aria-hidden
              />
              <div
                className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-phronis-teal/[0.07] to-transparent opacity-0 transition duration-300 group-hover:opacity-100"
                aria-hidden
              />
            </div>
            <div className="flex flex-1 flex-col p-7 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-phronis-teal/30 bg-phronis-teal/10 text-phronis-teal shadow-[0_0_24px_-8px_rgba(20,241,149,0.45)]">
                  <Building2 className="h-6 w-6" aria-hidden />
                </span>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-phronis-muted transition duration-300 group-hover:border-phronis-teal/25 group-hover:text-phronis-teal">
                  <ArrowUpRight className="h-5 w-5" aria-hidden />
                </span>
              </div>
              <h2 className="mt-5 font-serif text-2xl font-medium tracking-tight text-phronis-foreground sm:text-[1.65rem]">
                Business
              </h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-phronis-muted sm:text-[0.9375rem]">
                Apps, websites, and blockchain-backed programs—explained in everyday language, not insider slang.
              </p>
              <span className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-phronis-teal">
                View services & contact
                <span className="transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden>
                  →
                </span>
              </span>
            </div>
          </Link>

          <Link
            href="/members"
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/12 bg-phronis-surface/40 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.06)] transition-[border-color,box-shadow,transform] duration-300 hover:border-phronis-electric/40 hover:shadow-[0_28px_90px_-28px_rgba(47,139,255,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-phronis-electric"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden sm:aspect-[2/1]">
              <Image
                src="/home/gateway-members.png"
                alt=""
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center transition duration-700 ease-out group-hover:scale-[1.03]"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-phronis-surface via-phronis-surface/20 to-transparent"
                aria-hidden
              />
              <div
                className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-phronis-electric/[0.08] to-transparent opacity-0 transition duration-300 group-hover:opacity-100"
                aria-hidden
              />
            </div>
            <div className="flex flex-1 flex-col p-7 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-phronis-electric/30 bg-phronis-electric/10 text-phronis-electric shadow-[0_0_24px_-8px_rgba(47,139,255,0.45)]">
                  <Users className="h-6 w-6" aria-hidden />
                </span>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-phronis-muted transition duration-300 group-hover:border-phronis-electric/25 group-hover:text-phronis-electric">
                  <ArrowUpRight className="h-5 w-5" aria-hidden />
                </span>
              </div>
              <h2 className="mt-5 font-serif text-2xl font-medium tracking-tight text-phronis-foreground sm:text-[1.65rem]">
                Members
              </h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-phronis-muted sm:text-[0.9375rem]">
                Sign in, set up a wallet if you need one, and use member tools when your account meets the published
                rules.
              </p>
              <span className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-phronis-electric">
                Open member hub
                <span className="transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden>
                  →
                </span>
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
