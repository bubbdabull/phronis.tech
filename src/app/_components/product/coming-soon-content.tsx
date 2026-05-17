import { Sparkles } from "lucide-react";
import Link from "next/link";

import { Button } from "@/_components/ui/button";
import type { ComingSoonCopy } from "@/_lib/product/coming-soon";

export function ComingSoonContent({
  copy,
  onClose,
  compact = false,
}: {
  copy: ComingSoonCopy;
  onClose?: () => void;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "space-y-5" : "space-y-6"}>
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-phronis-teal/30 bg-phronis-teal/10 text-phronis-teal">
          <Sparkles className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-phronis-teal/90">{copy.eyebrow}</p>
          <p className="text-xs font-medium text-phronis-muted">Coming soon</p>
        </div>
      </div>
      <div>
        <h2
          className={
            compact
              ? "font-serif text-xl font-medium text-phronis-foreground"
              : "font-serif text-2xl font-medium text-phronis-foreground sm:text-3xl"
          }
        >
          {copy.title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-phronis-muted sm:text-base">{copy.description}</p>
      </div>
      <ul className="space-y-2.5">
        {copy.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm text-phronis-foreground/90">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-phronis-teal" aria-hidden />
            {feature}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2 pt-1">
        <Button asChild className="bg-phronis-teal text-phronis-void hover:opacity-90">
          <Link href="/learn" onClick={onClose}>
            Open Academy
          </Link>
        </Button>
        <Button asChild variant="outline" className="border-white/15">
          <Link href="/member" onClick={onClose}>
            Member hub
          </Link>
        </Button>
        {onClose ? (
          <Button type="button" variant="ghost" className="text-phronis-muted hover:text-phronis-foreground" onClick={onClose}>
            Close
          </Button>
        ) : null}
      </div>
    </div>
  );
}
