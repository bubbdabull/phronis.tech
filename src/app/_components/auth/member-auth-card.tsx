import type { ReactNode } from "react";

import { cn } from "@/_lib/utils";

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function MemberAuthCard({ title, description, children, footer, className }: Props) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_40px_rgba(20,241,149,0.06)] backdrop-blur-xl sm:p-8",
        className,
      )}
    >
      <div className="mb-6 space-y-2">
        <h2 className="font-serif text-xl font-medium tracking-tight text-phronis-foreground sm:text-2xl">{title}</h2>
        {description ? <p className="text-sm leading-relaxed text-phronis-muted">{description}</p> : null}
      </div>
      {children}
      {footer ? <div className="mt-6 border-t border-white/10 pt-5 text-center text-sm text-phronis-muted">{footer}</div> : null}
    </div>
  );
}
