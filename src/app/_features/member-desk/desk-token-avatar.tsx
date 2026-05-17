"use client";

import { useCallback, useState } from "react";

import { pickDexTokenImageUrl } from "@/_lib/desk/token-logo";
import { cn } from "@/_lib/utils";

type DeskTokenAvatarProps = {
  mint: string;
  symbol?: string | null;
  /** DexScreener `info.imageUrl` when available. */
  imageUrl?: string | null;
  size?: number;
  className?: string;
};

export function DeskTokenAvatar({ mint, symbol, imageUrl, size = 36, className }: DeskTokenAvatarProps) {
  const [failed, setFailed] = useState(false);
  const src = pickDexTokenImageUrl(mint, imageUrl);
  const initials = (symbol || mint).replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "?";

  const onError = useCallback(() => {
    setFailed(true);
  }, []);

  if (failed) {
    return (
      <span
        role="img"
        aria-label={symbol || mint}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-lg border border-white/15 bg-gradient-to-br from-white/10 to-black/40 font-semibold text-phronis-muted",
          className,
        )}
        style={{ width: size, height: size, fontSize: Math.max(10, size * 0.32) }}
      >
        {initials}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      className={cn("shrink-0 rounded-lg border border-white/10 bg-black/30 object-cover", className)}
      style={{ width: size, height: size }}
      onError={onError}
    />
  );
}
