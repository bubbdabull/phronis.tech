export {};

/** Minimal injected wallet (Phantom, Backpack, etc.) for signMessage + connect. */
type InjectedSolanaPublicKey = {
  toBytes(): Uint8Array;
  toBase58(): string;
};

type InjectedSolanaProvider = {
  isPhantom?: boolean;
  connect?: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: InjectedSolanaPublicKey }>;
  publicKey?: InjectedSolanaPublicKey;
  signMessage?: (message: Uint8Array, display?: string) => Promise<{ signature: Uint8Array }>;
  disconnect?: () => Promise<void>;
};

declare global {
  interface Window {
    solana?: InjectedSolanaProvider;
    backpack?: { solana?: InjectedSolanaProvider };
  }
}
