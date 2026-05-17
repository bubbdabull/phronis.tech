export type ComingSoonProduct = "dao" | "terminal";

/** Set `NEXT_PUBLIC_DAO_OPEN=true` when governance / membership DAO UI ships. */
export function isDaoOpen(): boolean {
  return process.env.NEXT_PUBLIC_DAO_OPEN === "true";
}

export type ComingSoonCopy = {
  eyebrow: string;
  title: string;
  description: string;
  features: string[];
};

export const COMING_SOON_COPY: Record<ComingSoonProduct, ComingSoonCopy> = {
  dao: {
    eyebrow: "DAO",
    title: "Governance is on the way",
    description:
      "Proposals, treasury views, and member directory tools are in development. We will let you know when governance goes live.",
    features: [
      "On-chain proposals and voting",
      "Treasury and multisig readouts",
      "Token-gated member directory",
    ],
  },
  terminal: {
    eyebrow: "Trading terminal",
    title: "Terminal features are on the way",
    description:
      "Live desk tools — risk radar, discovery, smart wallets, alerts, and AI assistant — are being polished before launch.",
    features: [
      "Market discovery and pair analytics",
      "Wallet tracking and rug radar",
      "AI desk and alert workflows",
    ],
  },
};

/** Routes that should render the coming-soon gate instead of live product UI. */
export function isDaoComingSoonPath(pathname: string): boolean {
  return (
    pathname === "/dao" ||
    pathname.startsWith("/dao/") ||
    pathname === "/governance" ||
    pathname === "/treasury"
  );
}

export function isTerminalComingSoonPath(pathname: string): boolean {
  return pathname === "/desk" || pathname.startsWith("/desk/");
}
