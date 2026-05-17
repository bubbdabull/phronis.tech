import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const emptyShim = path.resolve("./src/app/_lib/shims/webpack-empty.js");

function resolvePeer(mod: string): string {
  return require.resolve(mod, { paths: [projectRoot] });
}

const nextConfig: NextConfig = {
  /** Avoid inferring workspace root from a stray `pnpm-lock.yaml` in a parent directory (e.g. home). */
  outputFileTracingRoot: projectRoot,
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ["@privy-io/react-auth"],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      /** Privy → Farcaster mini-app Solana peers (must resolve from app root for webpack). */
      "@solana/wallet-adapter-react": resolvePeer("@solana/wallet-adapter-react"),
      "@solana/wallet-adapter-base": resolvePeer("@solana/wallet-adapter-base"),
      /** Optional Privy peers — not installed in this slim app bundle. */
      "@farcaster/miniapp-sdk": emptyShim,
      "@farcaster/mini-app-solana": emptyShim,
      "@react-native-async-storage/async-storage": emptyShim,
      "pino-pretty": emptyShim,
    };
    config.resolve.fallback = {
      ...config.resolve.fallback,
      process: require.resolve("process/browser"),
      buffer: require.resolve("buffer/"),
    };
    return config;
  },
  async redirects() {
    return [{ source: "/connect", destination: "/sign-in", permanent: true }];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(self)",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; form-action 'self' mailto:; img-src 'self' data: https:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' https://*.privy.io https://auth.privy.io; connect-src 'self' https: wss:; frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://*.privy.io https://auth.privy.io https://*.walletconnect.com https://*.walletconnect.org; object-src 'none'; upgrade-insecure-requests",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
