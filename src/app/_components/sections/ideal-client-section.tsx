"use client";

import { motion } from "framer-motion";

import { IDEAL_CLIENTS } from "@/_lib/site-content";
import { useReducedMotion } from "@/_hooks/use-reduced-motion";

export function IdealClientSection() {
  const reduced = useReducedMotion();

  return (
    <section
      id="clients"
      aria-labelledby="clients-heading"
      className="border-t border-white/10 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-phronis-teal">
          Who we partner with
        </p>
        <h2
          id="clients-heading"
          className="font-serif mt-3 max-w-2xl text-3xl font-medium tracking-tight text-phronis-foreground sm:text-4xl"
        >
          Teams we work well with
        </h2>
        <ul className="mt-12 grid gap-6 sm:grid-cols-2">
          {IDEAL_CLIENTS.map((client, index) => (
            <motion.li
              key={client.id}
              className="rounded-xl border border-phronis-border bg-phronis-surface/35 p-6"
              initial={reduced ? false : { opacity: 0, y: 12 }}
              whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <h3 className="font-serif text-base font-medium text-phronis-foreground">{client.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-phronis-muted">{client.description}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
