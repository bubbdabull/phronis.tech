import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/_lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold tracking-tight transition-colors",
  {
    variants: {
      variant: {
        default: "border-phronis-teal/40 bg-phronis-teal/15 text-phronis-teal",
        outline: "border-white/15 text-phronis-muted",
        dao: "border-violet-400/40 bg-violet-500/15 text-violet-200",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
