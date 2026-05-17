import * as React from "react";

import { cn } from "@/_lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[120px] w-full rounded-md border border-phronis-border bg-phronis-surface/60 px-3 py-2 text-sm text-phronis-foreground shadow-sm placeholder:text-phronis-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-phronis-teal disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
