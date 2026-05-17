"use client";

import { useCallback, useState } from "react";

import type { WalletChainId, WalletTokenId } from "@/_lib/wallet/wallet-assets";
import { chainById, tokenById } from "@/_lib/wallet/wallet-assets";
import { cn } from "@/_lib/utils";

type BaseProps = {
  size?: number;
  className?: string;
  alt?: string;
};

type ChainProps = BaseProps & {
  kind: "chain";
  chainId: WalletChainId;
};

type TokenProps = BaseProps & {
  kind: "token";
  tokenId: WalletTokenId;
  /** Override logo (e.g. PHR mint image from DexScreener). */
  logoUrl?: string | null;
};

export type WalletAssetAvatarProps = ChainProps | TokenProps;

function resolveLogo(props: WalletAssetAvatarProps): { primary: string; fallback?: string; label: string } {
  if (props.kind === "chain") {
    const chain = chainById(props.chainId);
    return {
      primary: chain?.logoUrl ?? "",
      fallback: chain?.logoFallbackUrl,
      label: chain?.name ?? props.chainId,
    };
  }
  const token = tokenById(props.tokenId);
  return {
    primary: props.logoUrl?.trim() || token.logoUrl,
    fallback: token.logoFallbackUrl,
    label: token.symbol,
  };
}

export function WalletAssetAvatar(props: WalletAssetAvatarProps) {
  const { size = 36, className, alt } = props;
  const { primary, fallback, label } = resolveLogo(props);
  const [src, setSrc] = useState(primary);
  const [failed, setFailed] = useState(false);

  const onError = useCallback(() => {
    if (fallback && src !== fallback) {
      setSrc(fallback);
      return;
    }
    setFailed(true);
  }, [fallback, src]);

  const initials = label.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "?";

  if (failed || !primary) {
    return <AvatarFallback size={size} initials={initials} className={className} ariaLabel={alt ?? label} />;
  }

  return (
    <img
      src={src}
      alt={alt ?? label}
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

function AvatarFallback({
  size,
  initials,
  className,
  ariaLabel,
}: {
  size: number;
  initials: string;
  className?: string;
  ariaLabel: string;
}) {
  return (
    <span
      role="img"
      aria-label={ariaLabel}
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
