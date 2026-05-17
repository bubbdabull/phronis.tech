"use client";

import { motion } from "framer-motion";

import { ARENA_FRAMEWORK } from "@/_lib/arena-content";
import { useReducedMotion } from "@/_hooks/use-reduced-motion";

export function ArenaFrameworkSection() {
  const reduced = useReducedMotion();

  return (
    <section
      id="arena"
      aria-labelledby="arena-heading"
      className="border-t border-white/10 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-phronis-teal">
          {ARENA_FRAMEWORK.kicker}
        </p>
        <h2
          id="arena-heading"
          className="font-serif mt-3 max-w-3xl text-3xl font-medium tracking-tight text-phronis-foreground sm:text-4xl"
        >
          {ARENA_FRAMEWORK.title}
        </h2>
        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-phronis-muted sm:text-base">
          {ARENA_FRAMEWORK.intro}
        </p>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <motion.article
            className="rounded-xl border border-phronis-border bg-phronis-elevated/30 p-6 sm:p-8"
            initial={reduced ? false : { opacity: 0, y: 14 }}
            whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4 }}
          >
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-phronis-muted">
              {ARENA_FRAMEWORK.architectTitle}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-phronis-foreground/95 sm:text-base">
              {ARENA_FRAMEWORK.architectBody}
            </p>
          </motion.article>
          <motion.article
            className="rounded-xl border border-phronis-teal/25 bg-phronis-surface/40 p-6 sm:p-8"
            initial={reduced ? false : { opacity: 0, y: 14 }}
            whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-phronis-teal">
              {ARENA_FRAMEWORK.daoTitle}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-phronis-foreground/95 sm:text-base">
              {ARENA_FRAMEWORK.daoBody}
            </p>
          </motion.article>
        </div>

        <motion.div
          className="mt-8 rounded-xl border border-phronis-violet/30 bg-phronis-void/40 p-6 sm:p-8"
          initial={reduced ? false : { opacity: 0, y: 12 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-phronis-violet">
            {ARENA_FRAMEWORK.technicalReviewTitle}
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-phronis-muted sm:text-base">
            {ARENA_FRAMEWORK.technicalReviewBody}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
