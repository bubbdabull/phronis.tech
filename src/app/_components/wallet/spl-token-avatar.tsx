"use client";

import { useCallback, useState } from "react";

import type { SplTokenDefinition } from "@/_lib/wallet/solana-token-registry";
import { cn } from "@/_lib/utils";

type Props = {
  token: Pick<SplTokenDefinition, "symbol" | "logoUrl" | "logoFallbackUrl" | "name">;
  size?: number;
  className?: string;
};

export function SplTokenAvatar({ token, size = 36, className }: Props) {
  const [src, setSrc] = useState(token.logoUrl);
  const [failed, setFailed] = useState(false);

  const onError = useCallback(() => {
    if (token.logoFallbackUrl && src !== token.logoFallbackUrl) {
      setSrc(token.logoFallbackUrl);
      return;
    }
    setFailed(true);
  }, [src, token.logoFallbackUrl]);

  const initials = token.symbol.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "?";

  if (failed || !token.logoUrl) {
    return (
      <span
        role="img"
        aria-label={token.name}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full border border-white/15 bg-gradient-to-br from-white/12 to-black/50 font-semibold text-phronis-muted",
          className,
        )}
        style={{ width: size, height: size, fontSize: Math.max(9, size * 0.3) }}
      >
        {initials}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={token.name}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      className={cn("shrink-0 rounded-full border border-white/10 bg-black/40 object-cover", className)}
      style={{ width: size, height: size }}
      onError={onError}
    />
  );
}
