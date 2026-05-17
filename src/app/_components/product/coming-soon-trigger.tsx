"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

import { useComingSoon } from "@/_components/product/coming-soon-provider";
import type { ComingSoonProduct } from "@/_lib/product/coming-soon";
import { cn } from "@/_lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  product: ComingSoonProduct;
  children: ReactNode;
};

export function ComingSoonTrigger({ product, children, className, type = "button", ...rest }: Props) {
  const { openComingSoon } = useComingSoon();

  return (
    <button
      type={type}
      className={cn(className)}
      onClick={(e) => {
        rest.onClick?.(e);
        if (!e.defaultPrevented) openComingSoon(product);
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
