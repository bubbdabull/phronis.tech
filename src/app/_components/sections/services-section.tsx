"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import {
  Coins,
  Database,
  FileCode2,
  Layers,
  Link2,
  Palette,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import { SERVICES, SERVICES_SECTION } from "@/_lib/site-content";
import { useReducedMotion } from "@/_hooks/use-reduced-motion";
import { cn } from "@/_lib/utils";
import type { ServiceAccent } from "@/_types/content";

const accentBar: Record<ServiceAccent, string> = {
  electric: "bg-gradient-to-r from-phronis-electric/60 via-phronis-electric/10 to-transparent",
  teal: "bg-gradient-to-r from-phronis-teal/60 via-phronis-teal/10 to-transparent",
  violet: "bg-gradient-to-r from-phronis-violet/60 via-phronis-violet/10 to-transparent",
  slate: "bg-gradient-to-r from-phronis-foreground/25 via-phronis-foreground/6 to-transparent",
  amber: "bg-gradient-to-r from-phronis-amber/55 via-phronis-amber/10 to-transparent",
};

const accentIconRing: Record<ServiceAccent, string> = {
  electric: "border-phronis-electric/30 bg-phronis-electric/10 text-phronis-electric",
  teal: "border-phronis-teal/30 bg-phronis-teal/10 text-phronis-teal",
  violet: "border-phronis-violet/30 bg-phronis-violet/10 text-phronis-violet",
  slate: "border-white/15 bg-white/5 text-phronis-foreground",
  amber: "border-phronis-amber/35 bg-phronis-amber/10 text-phronis-amber",
};

const SERVICE_ICONS: Record<string, LucideIcon> = {
  "svc-web3-design": Palette,
  "svc-smart-contracts": FileCode2,
  "svc-token-deploy": Coins,
  "svc-dapp-fullstack": Layers,
  "svc-integrations": Link2,
  "svc-data-indexing": Database,
  "svc-security-launch": ShieldCheck,
  "svc-sustain": Wrench,
};

export function ServicesSection() {
  const reduced = useReducedMotion();

  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="relative isolate overflow-hidden border-t border-white/10 py-24 sm:py-28"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(20,241,149,0.12),transparent),radial-gradient(ellipse_60%_40%_at_100%_50%,rgba(47,139,255,0.08),transparent),radial-gradient(ellipse_50%_30%_at_0%_80%,rgba(153,69,255,0.06),transparent)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-phronis-teal/25 to-transparent" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14 xl:gap-16">
          <div className="max-w-xl lg:max-w-none">
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 12 }}
              whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45 }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-phronis-teal/90">Services</p>
              <h2
                id="services-heading"
                className="font-serif mt-4 text-balance text-3xl font-medium tracking-tight text-phronis-foreground sm:text-4xl lg:text-[2.35rem] lg:leading-tight"
              >
                {SERVICES_SECTION.title}
              </h2>
              <p className="mt-5 text-pretty text-sm leading-relaxed text-phronis-muted sm:text-base lg:text-[17px] lg:leading-relaxed">
                {SERVICES_SECTION.description}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-phronis-muted backdrop-blur-sm">
                  Design + engineering together
                </span>
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-phronis-muted backdrop-blur-sm">
                  Plain-language specs
                </span>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="relative mx-auto w-full max-w-lg lg:mx-0 lg:max-w-none"
            initial={reduced ? false : { opacity: 0, scale: 0.98 }}
            whileInView={reduced ? undefined : { opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.06 }}
          >
            <div
              className="relative aspect-[16/11] overflow-hidden rounded-3xl border border-white/12 bg-phronis-void/40 shadow-[0_0_0_1px_rgba(20,241,149,0.06),0_24px_80px_-24px_rgba(0,0,0,0.75)] ring-1 ring-white/5 sm:aspect-[16/10]"
              aria-hidden
            >
              <Image
                src="/marketing/services-section-hero.png"
                alt=""
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority={false}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-phronis-base/50 via-transparent to-phronis-electric/[0.07]" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-phronis-base/85 to-transparent" />
              <div className="pointer-events-none absolute inset-0 rounded-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]" />
            </div>
          </motion.div>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {SERVICES.map((svc, index) => {
            const Icon = SERVICE_ICONS[svc.id] ?? Layers;
            return (
              <motion.article
                key={svc.id}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 shadow-lg backdrop-blur-md transition-[border-color,box-shadow,transform] duration-300",
                  "hover:border-phronis-teal/20 hover:shadow-[0_0_0_1px_rgba(20,241,149,0.08),0_20px_50px_-28px_rgba(0,0,0,0.55)]",
                  "hover:-translate-y-0.5",
                )}
                initial={reduced ? false : { opacity: 0, y: 20 }}
                whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: index * 0.04 }}
              >
                <div
                  className={cn(
                    "pointer-events-none absolute inset-x-0 top-0 h-px opacity-95 transition-opacity group-hover:opacity-100",
                    accentBar[svc.accent],
                  )}
                />
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border backdrop-blur-sm transition-transform duration-300 group-hover:scale-[1.03]",
                      accentIconRing[svc.accent],
                    )}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  </div>
                  <span
                    className="font-mono text-[10px] uppercase tracking-widest text-phronis-muted/60 opacity-0 transition-opacity group-hover:opacity-100"
                    aria-hidden
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-4 font-serif text-lg font-medium leading-snug tracking-tight text-phronis-foreground">
                  {svc.title}
                </h3>
                <p className="mt-2.5 flex-1 text-sm leading-relaxed text-phronis-muted">{svc.description}</p>
                <ul className="mt-5 space-y-2 border-t border-white/[0.07] pt-4">
                  {svc.stack.map((item) => (
                    <li key={item} className="flex gap-2.5 text-[13px] leading-snug text-phronis-foreground/88">
                      <span className="mt-1.5 size-1 shrink-0 rounded-full bg-phronis-teal/70 shadow-[0_0_8px_rgba(20,241,149,0.35)]" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
