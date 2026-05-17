"use client";

import { motion } from "framer-motion";

import { TRUST_HIGHLIGHTS, TRUST_SECTION } from "@/_lib/site-content";
import { useReducedMotion } from "@/_hooks/use-reduced-motion";

export function TrustSection() {
  const reduced = useReducedMotion();

  return (
    <section
      id="trust"
      aria-labelledby="trust-heading"
      className="border-t border-white/10 bg-phronis-surface/20 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-phronis-teal">
          {TRUST_SECTION.kicker}
        </p>
        <h2
          id="trust-heading"
          className="font-serif mt-3 max-w-2xl text-3xl font-medium tracking-tight text-phronis-foreground sm:text-4xl"
        >
          {TRUST_SECTION.title}
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-phronis-muted sm:text-base">
          {TRUST_SECTION.intro}
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TRUST_HIGHLIGHTS.map((item, index) => (
            <motion.article
              key={item.id}
              className="rounded-xl border border-phronis-border bg-phronis-elevated/35 p-6"
              initial={reduced ? false : { opacity: 0, y: 14 }}
              whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
            >
              <h3 className="font-serif text-base font-medium tracking-tight text-phronis-foreground">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-phronis-muted">{item.description}</p>
            </motion.article>
          ))}
        </div>
        <motion.p
          className="mx-auto mt-12 max-w-3xl border-t border-white/10 pt-10 text-center text-sm leading-relaxed text-phronis-muted sm:text-base"
          initial={reduced ? false : { opacity: 0, y: 10 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20px" }}
          transition={{ duration: 0.45 }}
        >
          {TRUST_SECTION.systemIntegrity}
        </motion.p>
      </div>
    </section>
  );
}
