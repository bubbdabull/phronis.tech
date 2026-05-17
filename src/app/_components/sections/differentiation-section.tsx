"use client";

import { motion } from "framer-motion";

import { DIFFERENTIATION_ROWS } from "@/_lib/site-content";
import { useReducedMotion } from "@/_hooks/use-reduced-motion";

export function DifferentiationSection() {
  const reduced = useReducedMotion();

  return (
    <section
      id="differentiation"
      aria-labelledby="diff-heading"
      className="border-t border-white/10 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-phronis-violet">
          Why Phronis
        </p>
        <h2
          id="diff-heading"
          className="font-serif mt-3 max-w-2xl text-3xl font-medium tracking-tight text-phronis-foreground sm:text-4xl"
        >
          Clear delivery—not crypto jargon.
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-phronis-muted sm:text-base">
          A simple comparison between how many technology projects drift, and how Phronis keeps design, software, and
          on-network rules aligned so non-technical stakeholders can follow along.
        </p>
        <div className="mt-12 overflow-hidden rounded-xl border border-phronis-border">
          <div className="grid grid-cols-2 border-b border-phronis-border bg-phronis-surface/50 text-[11px] font-semibold uppercase tracking-[0.12em] text-phronis-muted">
            <div className="px-4 py-3 sm:px-6">Typical gaps</div>
            <div className="border-l border-phronis-border px-4 py-3 sm:px-6 text-phronis-teal">
              Phronis
            </div>
          </div>
          <ul>
            {DIFFERENTIATION_ROWS.map((row, index) => (
              <motion.li
                key={row.id}
                className="grid grid-cols-2 border-b border-phronis-border last:border-b-0"
                initial={reduced ? false : { opacity: 0 }}
                whileInView={reduced ? undefined : { opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
              >
                <div className="px-4 py-4 text-sm text-phronis-muted sm:px-6">{row.conventional}</div>
                <div className="border-l border-phronis-border bg-phronis-elevated/20 px-4 py-4 text-sm text-phronis-foreground sm:px-6">
                  {row.phronis}
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
