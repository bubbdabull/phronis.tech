"use client";

import {
  ArrowDownLeft,
  ArrowRightLeft,
  ArrowUpRight,
  ChevronDown,
  Copy,
  CreditCard,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Zap,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { BuyPhronisSection } from "@/_components/member/buy-phr-section";
import { MemberEarnSection } from "@/_components/member/member-earn-section";
import { SolanaCardFundingPanel } from "@/_components/member/solana-card-funding-panel";
import { SolanaTokenHoldings } from "@/_components/member/solana-token-holdings";
import { WalletHeroSection } from "@/_components/member/wallet-hero-section";
import { WalletReceivePanel } from "@/_components/member/wallet-receive-panel";
import { PhronisLiquidityExplainer } from "@/_components/member/phronis-liquidity-explainer";
import { WalletSendPanel } from "@/_components/member/wallet-send-panel";
import { DeskTokenAvatar } from "@/_features/member-desk/desk-token-avatar";
import { EvmChainsGrid } from "@/_components/wallet/evm-chains-grid";
import { WalletAssetAvatar } from "@/_components/wallet/wallet-asset-avatar";
import { Button } from "@/_components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/_components/ui/card";
import { Separator } from "@/_components/ui/separator";
import { useEmbeddedSolanaAddress } from "@/_hooks/use-embedded-solana-address";
import { useEthereumSmartWallet } from "@/_hooks/use-ethereum-smart-wallet";
import type { WalletRow } from "@/_types/onboarding";
import { getPhrDaoTokenMint } from "@/_lib/phronis-dao-token";
import { getUsdcMint } from "@/_lib/phronis-usdc";
import type { WalletTokenId } from "@/_lib/wallet/wallet-assets";
import { getSolanaCaip2Chain } from "@/_lib/privy-client-config";
import { cn } from "@/_lib/utils";

const PHR_MINT = getPhrDaoTokenMint() ?? "";
const USDC_MINT = getUsdcMint();
function explorerAddr(addr: string): string {
  const cluster = process.env.NEXT_PUBLIC_SOLANA_CLUSTER === "mainnet" ? "" : "?cluster=devnet";
  return `https://solscan.io/account/${addr}${cluster}`;
}

function explorerTokenMint(mint: string): string {
  const cluster = process.env.NEXT_PUBLIC_SOLANA_CLUSTER === "mainnet" ? "" : "?cluster=devnet";
  return `https://solscan.io/token/${mint}${cluster}`;
}

function ethExplorer(addr: string): string {
  return `https://etherscan.io/address/${addr}`;
}

type Props = {
  wallets: readonly WalletRow[];
  primaryWallet: string;
  hasDbWalletRow: boolean;
  busy: string;
  onBusyChange: (v: string) => void;
  onSync: () => Promise<void>;
};

export function MemberWalletFundingCard({
  wallets,
  primaryWallet,
  hasDbWalletRow,
  busy,
  onBusyChange,
  onSync,
}: Props) {
  const { address: embeddedSolana, provisioning, walletsReady } = useEmbeddedSolanaAddress();
  const {
    smartWalletAddress,
    ethEmbedded,
    status: ethSmartStatus,
    ethProvisioning,
    ensureEthAddress,
  } = useEthereumSmartWallet();
  const [copied, setCopied] = useState<string | null>(null);
  const [sendOpen, setSendOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [explainOpen, setExplainOpen] = useState(false);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const solBal = wallets[0] ? Number(wallets[0].sol_balance) : 0;
  const usdcBal = wallets[0] ? Number(wallets[0].usdc_balance ?? 0) : 0;
  const phrBal = wallets[0] ? Number(wallets[0].phronis_balance) : 0;

  const hasGas = hasDbWalletRow && solBal >= 0.001;
  const hasUsdc = hasDbWalletRow && usdcBal >= 0.01;
  const swapReady = hasGas && (hasUsdc || phrBal > 0);

  const solanaChain = getSolanaCaip2Chain();
  const solanaClusterLabel = solanaChain === "solana:devnet" ? "devnet" : "mainnet";

  const qrUrl = useMemo(() => {
    if (!primaryWallet) return "";
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(primaryWallet)}`;
  }, [primaryWallet]);

  const copyText = useCallback(async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    window.setTimeout(() => setCopied(null), 2000);
  }, []);

  const portfolioHint = hasDbWalletRow ? usdcBal + solBal * 150 : null;

  return (
    <Card className="overflow-hidden border-white/10 lg:col-span-2">
      <WalletSendPanel
        open={sendOpen}
        onClose={() => setSendOpen(false)}
        walletAddress={primaryWallet}
        solBal={solBal}
        usdcBal={usdcBal}
        phrBal={phrBal}
        busy={busy}
        onBusyChange={onBusyChange}
        onAfterSend={() => void onSync()}
      />
      <WalletReceivePanel
        open={receiveOpen}
        onClose={() => setReceiveOpen(false)}
        address={primaryWallet}
        qrUrl={qrUrl}
        clusterLabel={solanaClusterLabel}
      />

      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <CardTitle className="flex flex-wrap items-center gap-2">
            Your wallet &amp; funding
            <span className="inline-flex items-center gap-1 rounded-full border border-phronis-teal/30 bg-phronis-teal/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-phronis-teal">
              <Sparkles className="h-3 w-3" aria-hidden />
              Smart wallet enabled
            </span>
          </CardTitle>
          <CardDescription className="max-w-2xl leading-relaxed">
            Step 2 — fund your embedded <strong className="font-medium text-phronis-foreground/90">Solana</strong> wallet (SOL, USDC, PHR),
            preview PHR swaps below, use your <strong className="font-medium text-phronis-foreground/90">Ethereum smart wallet</strong>{" "}
            for EVM apps and <strong className="font-medium text-phronis-foreground/90">Privy Earn</strong> (USDC yield). Sync pulls live
            balances from chain into your profile.
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 border-white/15"
          disabled={!!busy}
          onClick={() => {
            onBusyChange("sync");
            void onSync().finally(() => onBusyChange(""));
          }}
        >
          <RefreshCw className={cn("mr-2 h-4 w-4", busy === "sync" && "animate-spin")} aria-hidden />
          {busy === "sync" ? "Syncing…" : "Sync & refresh"}
        </Button>
      </CardHeader>

      <CardContent className="space-y-8">
        {provisioning || (busy === "sync" && !primaryWallet) ? (
          <p className="text-sm text-phronis-muted" role="status">
            Setting up your embedded wallets… This usually takes a few seconds after email sign-up.
          </p>
        ) : !primaryWallet ? (
          <div className="space-y-3 text-sm text-phronis-muted">
            <p>
              Your Solana wallet is still being provisioned. Tap <strong className="text-phronis-foreground/90">Sync &amp; refresh</strong>{" "}
              to link it now.
            </p>
            {!walletsReady ? <p className="text-xs text-phronis-muted/80">Waiting for Privy wallet session…</p> : null}
          </div>
        ) : (
          <>
            {!hasDbWalletRow ? (
              <p className="rounded-lg border border-amber-400/25 bg-amber-400/5 px-4 py-3 text-sm leading-relaxed text-amber-100/90">
                Showing your live Privy Solana address. Tap <strong className="text-phronis-foreground/95">Sync &amp; refresh</strong> to save
                it in Supabase and load SOL, USDC, and PHR balances.
              </p>
            ) : null}

            <WalletHeroSection
              primaryWallet={primaryWallet}
              portfolioHint={portfolioHint}
              swapReady={swapReady}
              hasDbWalletRow={hasDbWalletRow}
              hasGas={hasGas}
              solBal={solBal}
              usdcBal={usdcBal}
              phrBal={phrBal}
              onReceive={() => setReceiveOpen(true)}
              onSend={() => setSendOpen(true)}
              onSwap={() => scrollTo("wallet-swap")}
              onBuy={() => scrollTo("wallet-buy-card")}
            />

            <button
              type="button"
              className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-left text-sm transition hover:border-white/20"
              onClick={() => setExplainOpen((o) => !o)}
            >
              <span className="flex items-center gap-2 font-medium text-phronis-foreground">
                <ArrowRightLeft className="h-4 w-4 text-phronis-teal" aria-hidden />
                How Phronis works
              </span>
              <ChevronDown className={cn("h-4 w-4 text-phronis-muted transition", explainOpen && "rotate-180")} aria-hidden />
            </button>
            {explainOpen ? (
              <div className="space-y-4">
                <ul className="grid gap-3 text-sm text-phronis-muted sm:grid-cols-3">
                  <TokenExplainCard tokenId="sol" title="SOL" body="Network fees on Solana (rent, swaps, transfers). Keep a small amount (~0.01+ SOL)." />
                  <TokenExplainCard
                    tokenId="usdc"
                    title="USDC"
                    body="Primary stablecoin for funding and trading. PHR pairs trade against USDC liquidity on Solana."
                  />
                  <TokenExplainCard
                    tokenId="phr"
                    title="PHR"
                    body="Phronis DAO token in your wallet. Buy with SOL or USDC via Jupiter after you fund."
                  />
                </ul>
                <PhronisLiquidityExplainer />
              </div>
            ) : null}

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-phronis-teal/90">
                <WalletAssetAvatar kind="chain" chainId="solana" size={20} className="rounded-md" />
                <span>Fund &amp; trade</span>
              </div>
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <div className="space-y-4">
                  <div id="wallet-buy-card" className="scroll-mt-24">
                    <SolanaCardFundingPanel
                      walletAddress={primaryWallet}
                      busy={busy}
                      onBusyChange={onBusyChange}
                      onAfterFlow={() => void onSync()}
                    />
                  </div>

                  <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-3 text-xs text-phronis-muted">
                    <div className="flex items-center gap-2 font-medium text-phronis-foreground/90">
                      <WalletAssetAvatar kind="chain" chainId="solana" size={22} className="rounded-md" />
                      <span>Verified mints on Solana</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <MintChip tokenId="usdc" mint={USDC_MINT} explorer={explorerTokenMint(USDC_MINT)} />
                      {PHR_MINT ? <MintChip tokenId="phr" mint={PHR_MINT} explorer={explorerTokenMint(PHR_MINT)} /> : null}
                    </div>
                    <p className="mt-2 break-all font-mono text-[11px]">
                      USDC: {USDC_MINT}
                      {PHR_MINT ? (
                        <>
                          <br />
                          PHR: {PHR_MINT}
                        </>
                      ) : (
                        <span className="text-amber-200/90"> · Set NEXT_PUBLIC_PHRONIS_DAO_TOKEN_MINT for PHR</span>
                      )}
                    </p>
                    <p className="mt-2 leading-relaxed">
                      You can receive any SPL token on Solana at this address. After syncing, balances appear in{" "}
                      <strong className="text-phronis-foreground/80">Solana tokens</strong> below. Only use Solana mainnet/devnet matching
                      your app setting — wrong-chain sends cannot be recovered.
                    </p>
                  </div>

                  <div id="wallet-swap" className="scroll-mt-24">
                    <BuyPhronisSection
                      primaryWallet={primaryWallet}
                      hasGas={hasGas}
                      hasUsdc={hasUsdc}
                      usdcBal={usdcBal}
                      solBal={solBal}
                      phrBal={phrBal}
                      solanaChain={solanaChain}
                      busy={busy}
                      onBusyChange={onBusyChange}
                      onSync={onSync}
                    />
                  </div>

                  <SolanaTokenHoldings wallets={wallets} solBal={solBal} hasDbWalletRow={hasDbWalletRow} />

                  {wallets.length > 1 ? (
                    <ul className="divide-y divide-white/10 rounded-lg border border-white/10 text-xs">
                      {wallets.map((w) => (
                        <li key={w.wallet_address} className="flex flex-col gap-1 px-3 py-2.5 sm:flex-row sm:justify-between">
                          <span className="break-all font-mono text-phronis-foreground">{w.wallet_address}</span>
                          <span className="shrink-0 text-phronis-muted">
                            SOL {Number(w.sol_balance).toFixed(4)} · USDC {Number(w.usdc_balance ?? 0).toFixed(2)} · PHR{" "}
                            {Number(w.phronis_balance).toLocaleString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                <div className="flex flex-col gap-5 border-t border-white/10 pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs font-medium text-phronis-muted">Your address</p>
                    <p className="mt-2 break-all font-mono text-sm text-phronis-foreground">{primaryWallet}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button type="button" size="sm" variant="outline" className="border-white/15" onClick={() => setReceiveOpen(true)}>
                        <ArrowDownLeft className="mr-2 h-4 w-4" />
                        Receive
                      </Button>
                      <Button type="button" size="sm" variant="outline" className="border-white/15" onClick={() => void copyText(primaryWallet, "w")}>
                        <Copy className="mr-2 h-4 w-4" />
                        {copied === "w" ? "Copied" : "Copy"}
                      </Button>
                      <Button asChild type="button" size="sm" variant="outline" className="border-white/15">
                        <a href={explorerAddr(primaryWallet)} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Solscan
                        </a>
                      </Button>
                    </div>
                  </div>
                  {qrUrl ? (
                    <button
                      type="button"
                      className="flex flex-col items-center rounded-2xl border border-dashed border-white/15 bg-black/20 p-4 transition hover:border-phronis-teal/30 sm:items-start"
                      onClick={() => setReceiveOpen(true)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={qrUrl} width={160} height={160} className="rounded-xl" alt="Deposit QR" />
                      <p className="mt-2 text-center text-[11px] text-phronis-muted sm:text-left">Tap for full receive screen</p>
                    </button>
                  ) : null}
                  <div className="space-y-3 text-sm text-phronis-muted">
                    <p className="font-medium text-phronis-foreground">Funding options</p>
                    <ol className="list-decimal space-y-2 pl-5 marker:text-phronis-teal/80">
                      <li>
                        <strong className="text-phronis-foreground/90">Card on-ramp (Privy):</strong> choose Coinbase, MoonPay, or Meld under Buy
                        with card — Meld includes Transak, Swapped, and other providers enabled in your dashboard.
                      </li>
                      <li>
                        <strong className="text-phronis-foreground/90">Exchange withdraw:</strong> send SOL (gas) and/or USDC (SPL) to the
                        address above on {solanaClusterLabel}.
                      </li>
                      <li>
                        <strong className="text-phronis-foreground/90">Another wallet:</strong> paste the address or scan the QR, then confirm
                        the token is USDC on Solana (not Ethereum USDC).
                      </li>
                      <li>
                        After any transfer, tap <strong className="text-phronis-foreground/90">Sync &amp; refresh</strong> — balances can take
                        1–2 minutes to appear.
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </section>

            {/* Ethereum smart wallet */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-phronis-teal/90">
                <WalletAssetAvatar kind="chain" chainId="ethereum" size={20} className="rounded-md" />
                <span>Ethereum smart wallet (EVM)</span>
              </div>
              <p className="text-sm leading-relaxed text-phronis-muted">
                Your account includes an ERC-4337 smart wallet on Ethereum for sponsored transactions (paymaster) when configured in the Privy
                dashboard. Use it for EVM apps and Privy Earn (Morpho USDC vault). PHR and USDC swaps on Phronis use your Solana address above.
              </p>

              <MemberEarnSection
                smartWalletAddress={smartWalletAddress}
                ethReady={ethSmartStatus === "ready"}
                busy={busy}
                onBusyChange={onBusyChange}
                onAfterAction={() => void onSync()}
              />

              <div className="grid gap-3 sm:grid-cols-2">
                {smartWalletAddress ? (
                  <WalletAddressRow
                    chainId="ethereum"
                    label="Smart wallet"
                    address={smartWalletAddress}
                    explorer={ethExplorer(smartWalletAddress)}
                    explorerLabel="Etherscan"
                    copied={copied}
                    copyKey="smart"
                    onCopy={copyText}
                  />
                ) : (
                  <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-3 text-sm text-phronis-muted">
                    {ethSmartStatus === "loading" || ethSmartStatus === "provisioning_eth" ? (
                      <p>{ethProvisioning ? "Creating Ethereum signer…" : "Loading Ethereum wallets…"}</p>
                    ) : ethSmartStatus === "needs_eth_signer" ? (
                      <div className="space-y-3">
                        <p>
                          Your Ethereum embedded signer is not provisioned yet. Phronis needs it before Privy can deploy your smart wallet.
                        </p>
                        <Button
                          type="button"
                          size="sm"
                          className="bg-phronis-teal text-phronis-void hover:opacity-90"
                          disabled={ethProvisioning || !!busy}
                          onClick={() => {
                            void (async () => {
                              await ensureEthAddress();
                              await onSync();
                            })();
                          }}
                        >
                          {ethProvisioning ? "Creating…" : "Create Ethereum wallet"}
                        </Button>
                        <p className="text-xs leading-relaxed">
                          If that fails, enable Embedded wallets → Ethereum → <strong className="text-phronis-foreground/80">All users</strong>{" "}
                          in the{" "}
                          <a className="text-phronis-teal underline" href="https://dashboard.privy.io" target="_blank" rel="noopener noreferrer">
                            Privy dashboard
                          </a>
                          , then sign out and back in.
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="font-medium text-phronis-foreground/90">Smart wallet linking…</p>
                        {ethEmbedded ? (
                          <p className="mt-2 font-mono text-xs text-phronis-foreground/80">
                            Signer: {ethEmbedded.slice(0, 6)}…{ethEmbedded.slice(-4)}
                          </p>
                        ) : null}
                        <p className="mt-2 leading-relaxed">
                          Privy deploys your ERC-4337 wallet after the signer exists. If this stays empty:
                        </p>
                        <ul className="mt-2 list-inside list-disc space-y-1 text-xs">
                          <li>
                            In{" "}
                            <a className="text-phronis-teal underline" href="https://dashboard.privy.io" target="_blank" rel="noopener noreferrer">
                              Privy dashboard
                            </a>
                            : enable <strong className="text-phronis-foreground/80">Smart wallets</strong>, pick a type (e.g. Safe), and
                            add <strong className="text-phronis-foreground/80">Ethereum mainnet</strong> bundler (+ paymaster if sponsored).
                          </li>
                          <li>Tap <strong className="text-phronis-foreground/80">Sync &amp; refresh</strong>, then reload this page.</li>
                          <li>Check the browser console for <code className="text-phronis-foreground/70">Error creating smart wallet</code>.</li>
                        </ul>
                      </>
                    )}
                  </div>
                )}
                {ethEmbedded && ethEmbedded !== smartWalletAddress ? (
                  <WalletAddressRow
                    chainId="ethereum"
                    label="Embedded signer (EOA)"
                    address={ethEmbedded}
                    explorer={ethExplorer(ethEmbedded)}
                    explorerLabel="Etherscan"
                    copied={copied}
                    copyKey="eoa"
                    onCopy={copyText}
                  />
                ) : null}
              </div>
              <EvmChainsGrid />
              {embeddedSolana && embeddedSolana !== primaryWallet ? (
                <p className="text-xs text-phronis-muted">
                  Privy also reports Solana <span className="font-mono text-phronis-foreground/80">{embeddedSolana.slice(0, 8)}…</span> — sync
                  uses your primary linked address.
                </p>
              ) : null}
            </section>

            <section className="rounded-lg border border-white/10 bg-white/[0.02] p-4 text-xs leading-relaxed text-phronis-muted">
              <p className="flex items-center gap-1.5 font-medium text-phronis-foreground">
                <Zap className="h-3.5 w-3.5 text-phronis-teal" aria-hidden />
                Quick checklist
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li className={hasGas ? "text-phronis-teal" : ""}>{hasGas ? "✓" : "○"} At least ~0.01 SOL for transaction fees</li>
                <li className={hasUsdc ? "text-phronis-teal" : ""}>{hasUsdc ? "✓" : "○"} USDC deposited for stable funding / PHR buys</li>
                <li className={phrBal > 0 ? "text-phronis-teal" : ""}>{phrBal > 0 ? "✓" : "○"} PHR in wallet (optional until you swap)</li>
                <li>Wrong-network deposits cannot be recovered by Phronis — double-check Solana mainnet vs devnet.</li>
              </ul>
            </section>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function TokenExplainCard({ tokenId, title, body }: { tokenId: WalletTokenId; title: string; body: string }) {
  return (
    <li className="rounded-lg border border-white/10 bg-black/20 px-3 py-2.5">
      <div className="flex items-center gap-2 font-medium text-phronis-foreground">
        {tokenId === "phr" && PHR_MINT ? (
          <DeskTokenAvatar mint={PHR_MINT} symbol="PHR" size={24} className="rounded-full" />
        ) : (
          <WalletAssetAvatar kind="token" tokenId={tokenId} size={24} />
        )}
        <span>{title}</span>
      </div>
      <p className="mt-1 text-xs leading-relaxed">{body}</p>
    </li>
  );
}

function MintChip({ tokenId, mint, explorer }: { tokenId: WalletTokenId; mint: string; explorer: string }) {
  return (
    <a
      href={explorer}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[11px] text-phronis-foreground/90 transition hover:border-phronis-teal/30 hover:bg-phronis-teal/5"
    >
      {tokenId === "phr" ? (
        <DeskTokenAvatar mint={mint} symbol="PHR" size={18} className="rounded-full" />
      ) : (
        <WalletAssetAvatar kind="token" tokenId={tokenId} size={18} />
      )}
      <span className="font-medium">{tokenId.toUpperCase()}</span>
      <span className="max-w-[88px] truncate font-mono text-phronis-muted">{mint.slice(0, 4)}…{mint.slice(-4)}</span>
    </a>
  );
}

function WalletAddressRow({
  chainId,
  label,
  address,
  explorer,
  explorerLabel = "Explorer",
  copied,
  copyKey,
  onCopy,
}: {
  chainId: "ethereum" | "solana";
  label: string;
  address: string;
  explorer: string;
  explorerLabel?: string;
  copied: string | null;
  copyKey: string;
  onCopy: (text: string, key: string) => Promise<void>;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-phronis-muted">
        <WalletAssetAvatar kind="chain" chainId={chainId} size={18} className="rounded-md" />
        <span>{label}</span>
      </div>
      <p className="mt-1 break-all font-mono text-xs text-phronis-foreground">{address}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" className="h-7 border-white/15 text-xs" onClick={() => void onCopy(address, copyKey)}>
          {copied === copyKey ? "Copied" : "Copy"}
        </Button>
        <Button asChild type="button" variant="outline" size="sm" className="h-7 border-white/15 text-xs">
          <a href={explorer} target="_blank" rel="noopener noreferrer">
            {explorerLabel}
          </a>
        </Button>
      </div>
    </div>
  );
}
