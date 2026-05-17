"use client";

import { motion } from "framer-motion";

import { PROCESS_STEPS } from "@/_lib/site-content";
import { useReducedMotion } from "@/_hooks/use-reduced-motion";

export function ProcessSection() {
  const reduced = useReducedMotion();

  return (
    <section
      id="process"
      aria-labelledby="process-heading"
      className="border-t border-white/10 bg-phronis-surface/25 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-phronis-electric">
          Process
        </p>
        <h2
          id="process-heading"
          className="font-serif mt-3 max-w-2xl text-3xl font-medium tracking-tight text-phronis-foreground sm:text-4xl"
        >
          From first plan to launch—and steady improvements after.
        </h2>
        <ol className="mt-12 space-y-6">
          {PROCESS_STEPS.map((step, index) => (
            <motion.li
              key={step.id}
              className="flex gap-6 rounded-xl border border-phronis-border bg-phronis-elevated/30 p-6 sm:gap-8 sm:p-8"
              initial={reduced ? false : { opacity: 0, x: -8 }}
              whileInView={reduced ? undefined : { opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <span
                className="font-serif text-2xl font-medium tabular-nums text-phronis-teal/90 sm:text-3xl"
                aria-hidden
              >
                {step.order}
              </span>
              <div>
                <h3 className="font-serif text-lg font-medium text-phronis-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-phronis-muted">{step.description}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
