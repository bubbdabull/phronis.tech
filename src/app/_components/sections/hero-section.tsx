"use client";

import { motion } from "framer-motion";

import { useReducedMotion } from "@/_hooks/use-reduced-motion";
import { HERO_LANDING } from "@/_lib/arena-content";

export function HeroSection() {
  const reduced = useReducedMotion();

  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-24"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(47,139,255,0.1),transparent_42%),radial-gradient(circle_at_82%_12%,rgba(20,241,149,0.08),transparent_38%)]" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <motion.p
            className="text-xs font-semibold uppercase tracking-[0.2em] text-phronis-teal/90"
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={reduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            {HERO_LANDING.eyebrow}
          </motion.p>
          <motion.h1
            id="hero-heading"
            className="font-serif mt-5 text-balance text-4xl font-medium leading-[1.15] tracking-tight text-phronis-foreground sm:text-5xl sm:leading-[1.12]"
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={reduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.04 }}
          >
            {HERO_LANDING.headline}
          </motion.h1>
          <motion.p
            className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-phronis-foreground/90 sm:text-lg"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={reduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
          >
            {HERO_LANDING.lead}
          </motion.p>
        </div>
      </div>
    </section>
  );
}
