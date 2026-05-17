import type { ModuleMcQuestion, ModuleMcQuestionPublic } from "@/_types/crypto-course-quiz";

function mc(
  id: string,
  prompt: string,
  options: readonly [string, string, string, string],
  correctIndex: 0 | 1 | 2 | 3,
): ModuleMcQuestion {
  return { id, prompt, options, correctIndex };
}

/** Three multiple-choice questions per curriculum module (section). Server grades; never send `correctIndex` to the client. */
export const MODULE_QUIZ_QUESTIONS: Readonly<Record<string, readonly ModuleMcQuestion[]>> = {
  "s1-m1": [
    mc("s1-m1-q1", "Double spending primarily refers to:", ["Printing too much fiat", "Spending the same digital balance twice", "Paying twice the gas fee", "Using two wallets"], 1),
    mc("s1-m1-q2", "A neutral append-only ledger mainly helps participants agree on:", ["CPU speed", "Who won a social poll", "Ordering and validity of transfers without a single editor", "Exchange listing order"], 2),
    mc("s1-m1-q3", "Replacing a trusted third party with protocol rules usually:", ["Eliminates all trust", "Moves trust to cryptography, operators of nodes, and software you run", "Guarantees profit", "Removes the need for backups"], 1),
  ],
  "s1-m2": [
    mc("s1-m2-q1", "In Bitcoin, ownership of coins is tracked using the:", ["Account balance model like a bank", "UTXO model (unspent outputs)", "NFT token IDs only", "SQL row locks"], 1),
    mc("s1-m2-q2", "Proof-of-work at a high level helps the network:", ["Encrypt all messages end-to-end", "Reach agreement on one history under adversarial conditions", "Guarantee instant finality in one second", "Remove all fees"], 1),
    mc("s1-m2-q3", "A light client typically trusts:", ["Every full node's RAM contents", "Miners only, never validators", "Some honest full nodes plus consensus rules for headers/proofs", "Discord moderators"], 2),
  ],
  "s1-m3": [
    mc("s1-m3-q1", "A seed phrase backup should be treated as:", ["Shareable with support staff", "Equivalent to full private key material—never paste it into websites", "Safe in plaintext email to yourself", "Optional if you use a CEX"], 1),
    mc("s1-m3-q2", "If someone DMs you first offering 'help' with your wallet, the safest default is:", ["They are official support", "Assume scam; verify only through official channels you opened", "Send a small test transaction to prove good faith", "Share your screen"], 1),
    mc("s1-m3-q3", "After a suspicious approval or signature, a good first containment step is:", ["Post private keys to revoke them", "Disconnect, revoke/limit allowances where possible, rotate to a clean wallet for important funds", "Ignore if balance looks fine", "Ask Twitter for the fastest rug"], 1),
  ],
  "s2-m1": [
    mc("s2-m1-q1", "On Ethereum, an EOA (externally owned account) differs from a contract account mainly because:", ["Only EOAs pay gas", "EOAs are controlled by a private key; contracts run code when called", "Contracts cannot hold ETH", "EOAs cannot receive tokens"], 1),
    mc("s2-m1-q2", "A transaction nonce primarily prevents:", ["Double-spend/replay of the same signed transaction sequence", "High gas prices", "NFT royalties", "Bridge delays"], 0),
    mc("s2-m1-q3", "Post-EIP-1559, the base fee portion of gas is:", ["Paid to miners as a fixed bribe", "Burned; priority fee can go to the block producer", "Always zero", "Refunded to the user always"], 1),
  ],
  "s2-m2": [
    mc("s2-m2-q1", "The Checks-Effects-Interactions pattern mainly mitigates:", ["Integer overflow in CSS", "Reentrancy via external calls before state is finalized", "Slow RPC responses", "High JPEG resolution"], 1),
    mc("s2-m2-q2", "A delegatecall-style proxy upgrade shifts trust toward:", ["The immutable bytecode forever", "Administrators/keys that can change implementation and storage layout risks", "Only end users' browsers", "DNS only"], 1),
    mc("s2-m2-q3", "ERC-20 allowances (`approve`) are risky because:", ["They expire automatically every hour", "A compromised spender or excessive allowance can move more tokens than a single trade needs", "They only exist on Bitcoin", "They remove gas costs"], 1),
  ],
  "s2-m3": [
    mc("s2-m3-q1", "An optimistic rollup's challenge window exists primarily to:", ["Increase NFT royalties", "Allow fraud proofs / disputes before state is considered settled for withdrawals", "Guarantee 0 fees", "Replace wallets"], 1),
    mc("s2-m3-q2", "Compared to a fast custodial bridge, a trust-minimized bridge often:", ["Has zero trust assumptions", "Trades latency and UX complexity for clearer on-chain trust assumptions", "Never needs audits", "Cannot move tokens"], 1),
    mc("s2-m3-q3", "Data availability (DA) in rollup discourse matters because:", ["It only affects logos", "Without DA, users may be unable to reconstruct or challenge state", "It removes MEV", "It is the same as TVL"], 1),
  ],
  "s2-m4": [
    mc("s2-m4-q1", "Solana programs are typically:", ["Stateful contracts that store all data internally like EVM bytecode storage", "Mostly stateless; persistent state lives in separate accounts", "Only run on Bitcoin L2", "Configured only via YAML"], 1),
    mc("s2-m4-q2", "An Associated Token Account (ATA) on Solana exists to:", ["Store SOL mining rewards", "Hold SPL token balances for a wallet+mint pair in a predictable address", "Replace the blockhash", "Remove transaction fees"], 1),
    mc("s2-m4-q3", "Jupiter-style aggregators mainly:", ["Custody user funds off-chain permanently", "Route swaps across pools; quotes can move with liquidity and fees", "Issue US passports", "Guarantee no slippage"], 1),
  ],
  "s3-m1": [
    mc("s3-m1-q1", "A 'governance token' claim should be checked by asking:", ["Only the logo color", "What concrete rights or parameters can holders change on-chain", "Whether Discord is large", "Whether it rhymes"], 1),
    mc("s3-m1-q2", "NFT metadata hosted off-chain (IPFS gateway) means:", ["The image is always immutable without trust", "Availability and integrity can still depend on hosts, gateways, and update rules", "There is no token on-chain", "Royalties are always enforced"], 1),
    mc("s3-m1-q3", "Fiat-backed stablecoins still require trust in:", ["Only GPU drivers", "Issuers, attestations, and banking rails—not just the smart contract", "Nothing; code is law", "Only block producers' hobbies"], 1),
  ],
  "s3-m2": [
    mc("s3-m2-q1", "On-chain token voting is especially vulnerable to:", ["Weather delays", "Vote buying / plutocratic influence because votes are transferable assets", "JPEG compression", "CPU thermal throttling"], 1),
    mc("s3-m2-q2", "A multisig treasury is often used to:", ["Remove all operational risk", "Distribute signing authority and reduce single-key loss or compromise", "Guarantee token price", "Hide all transactions"], 1),
    mc("s3-m2-q3", "Sybil resistance in airdrops matters because:", ["Bots may farm allocations meant for humans", "It removes gas fees", "It makes NFTs animated", "It disables bridges"], 0),
  ],
  "s3-m3": [
    mc("s3-m3-q1", "A centralized exchange (CEX) typically holds:", ["Only your seed in browser localStorage", "Custody of deposited assets under its policies and risk", "Nothing; it is always non-custodial", "Only NFT royalties"], 1),
    mc("s3-m3-q2", "Proof-of-reserves (PoR) can still fail to prove:", ["That the exchange is popular on TikTok", "Solvency against all liabilities and hidden leverage", "That two addresses differ", "That a chain has blocks"], 1),
    mc("s3-m3-q3", "Compared to a CEX order book, an AMM DEX trade usually:", ["Never pays fees", "Exposes the user to pool price impact, routing, and MEV differently than off-chain matching", "Requires no wallet signatures", "Always executes at mid price with zero slippage"], 1),
  ],
  "s3-m4": [
    mc("s3-m4-q1", "Mutable NFT metadata mainly implies:", ["The art can never change", "Creators or controllers may replace URIs—collectors should verify freeze/update rules", "Royalties are illegal", "IPFS is impossible"], 1),
    mc("s3-m4-q2", "Wash trading inflates:", ["Network security budget honestly", "Volume metrics without necessarily indicating organic demand", "Hardware wallet sales only", "Block size permanently"], 1),
    mc("s3-m4-q3", "A 'social rug' pattern often includes:", ["Transparent timelocked multisig and audited mint", "Anonymous team, unrealistic roadmap, and manufactured urgency", "Only open-source Linux drivers", "Mandatory hardware wallets"], 1),
  ],
  "s3-m5": [
    mc("s3-m5-q1", "A trade journal is useful primarily to:", ["Guarantee wins", "Capture thesis, fees, and mistakes to improve process over time", "Replace tax filings automatically", "Predict exact prices"], 1),
    mc("s3-m5-q2", "Very high slippage tolerance on a memecoin swap can:", ["Always be safe if the logo is cute", "Cause catastrophic fills against thin liquidity or malicious pools", "Remove MEV", "Disable approvals"], 1),
    mc("s3-m5-q3", "Wallet transaction simulation:", ["Can be fooled by malicious contracts or off-chain state", "Mathematically proves profit", "Removes need for seed backups", "Only runs on Bitcoin"], 0),
  ],
  "s3-m6": [
    mc("s3-m6-q1", "A key custody difference: with a typical CEX deposit, who can freeze withdrawals?", ["Only your hardware wallet vendor", "The exchange operator under policy, legal, or risk controls", "Nobody ever", "Only Solana validators unanimously"], 1),
    mc("s3-m6-q2", "DeFiLlama-style TVL dashboards can disagree because:", ["TVL definitions, double-counting, and included protocols differ", "TVL is always on-chain signed by Satoshi", "They only measure Twitter followers", "They cannot read EVM"], 0),
    mc("s3-m6-q3", "RWA diligence differs from memecoin hype mainly by focusing on:", ["Discord emoji density", "Issuers, legal wrappers, redemption, oracles, and jurisdiction", "Only all-time high charts", "Only transaction count in one block"], 1),
  ],
  "s4-m1": [
    mc("s4-m1-q1", "Impermanent loss (IL) describes:", ["Gas refunds on Ethereum", "LP divergence vs holding due to relative price moves in a pool", "NFT floor always rising", "Bridge latency"], 1),
    mc("s4-m1-q2", "Concentrated liquidity (v3-style) can:", ["Remove all IL", "Increase capital efficiency but raise complexity and toxic flow risk for LPs", "Ban MEV globally", "Eliminate smart contracts"], 1),
    mc("s4-m1-q3", "AMMs often rely on arbitrageurs to:", ["Host Discord servers", "Keep prices aligned with external markets", "Mine Bitcoin", "Issue KYC"], 1),
  ],
  "s4-m2": [
    mc("s4-m2-q1", "In lending pools, a health factor / LTV breach can trigger:", ["Automatic NFT airdrops", "Liquidations where bots repay debt for a bonus", "Free bridging", "Removal of chainId"], 1),
    mc("s4-m2-q2", "Oracle latency or manipulation can harm lending by:", ["Changing wallet colors", "Mispricing collateral or triggering bad liquidations", "Increasing block size only", "Disabling seeds"], 1),
    mc("s4-m2-q3", "Utilization-driven interest models generally:", ["Lower rates when utilization is high", "Raise rates as utilization increases to ration borrowing", "Fix rates to zero forever", "Depend only on Twitter sentiment"], 1),
  ],
  "s4-m3": [
    mc("s4-m3-q1", "Composable DeFi 'money legos' can amplify risk because:", ["Each protocol is isolated with no interactions", "Failures or design coupling can cascade across integrated systems", "Bridges remove trust", "TVL cannot move"], 1),
    mc("s4-m3-q2", "A deleverage spiral often involves:", ["Only cosmetic UI bugs", "Feedback loops of selling, liquidations, and falling collateral values", "Better sleep hygiene", "Proof-of-stake turning off"], 1),
    mc("s4-m3-q3", "Bug bounties and insurance funds:", ["Guarantee users never lose funds", "Mitigate some tail risk but have limits, exclusions, and moral hazard", "Replace audits entirely", "Only apply to Bitcoin base layer"], 1),
  ],
  "s5-m1": [
    mc("s5-m1-q1", "Storing a seed phrase in cloud screenshots is:", ["Best practice for redundancy", "High risk of remote exfiltration and support scams", "Required by Solana", "Neutral"], 1),
    mc("s5-m1-q2", "Multisig for a treasury mainly reduces:", ["Gas to zero", "Single-point compromise of one hot key", "Need to read contracts", "Chain congestion"], 1),
    mc("s5-m1-q3", "A hardware wallet helps primarily with:", ["Guaranteed investment returns", "Keeping signing keys off general-purpose malware surface", "Removing blockchain fees", "Hiding transactions from the chain"], 1),
  ],
  "s5-m2": [
    mc("s5-m2-q1", "An audit report's scope section matters because:", ["It is decorative only", "Findings apply only to what was reviewed at that time/version", "It guarantees no hacks forever", "It replaces law"], 1),
    mc("s5-m2-q2", "Access control bugs often allow attackers to:", ["Call privileged functions as unauthorized users", "Speed up DNS only", "Reduce block time", "Print fiat"], 0),
    mc("s5-m2-q3", "Automated scanners (Token Sniffer-class) should be used as:", ["Single source of truth for 'safe'", "Heuristics that can false positive/negative", "Legal opinions", "Tax filings"], 1),
  ],
  "s5-m3": [
    mc("s5-m3-q1", "MEV (Maximal Extractable Value) at a high level is:", ["Only mining Bitcoin", "Value extractable from transaction ordering beyond naive fees", "Always illegal in all countries", "Impossible on Solana"], 1),
    mc("s5-m3-q2", "Private mempools / OFA products trade off:", ["Nothing; they are strictly better for everyone", "Transparency and open ordering vs reduced sandwiching for some flows", "All decentralization with no benefit", "Only NFT royalties"], 1),
    mc("s5-m3-q3", "Credible neutrality means a mechanism should:", ["Favor the richest participants", "Avoid unjustified discrimination between similarly situated participants per stated rules", "Hide all parameters", "Ban audits"], 1),
  ],
  "s6-m1": [
    mc("s6-m1-q1", "When reading a crypto paper, the threat model specifies:", ["Logo fonts", "Adversary capabilities and assumptions", "Only marketing budget", "GPU wattage"], 1),
    mc("s6-m1-q2", "On-chain analytics dashboards can be biased by:", ["Creator-chosen labels and survivorship in datasets", "Perfect ground truth always", "Immutable laws of physics only", "Only block height"], 0),
    mc("s6-m1-q3", "ZK rollups 'verify execution' but users should still ask about:", ["Only Twitter follower count", "Data availability, upgrade keys, sequencer behavior, and bridge trust", "Whether JPEGs animate", "Removing gas entirely"], 1),
  ],
  "s6-m2": [
    mc("s6-m2-q1", "A capstone proposal should include:", ["Only vibes", "Clear success metrics, risks, and milestones", "Private keys for reviewers", "Guaranteed token launch"], 1),
    mc("s6-m2-q2", "Coordinated disclosure for vulnerabilities aims to:", ["Maximize Twitter drama", "Reduce harm while fixes deploy", "Hide bugs forever", "Replace testing"], 1),
    mc("s6-m2-q3", "Executive vs engineering audiences differ mainly in:", ["Nothing", "Framing decisions, tradeoffs, and unknowns vs implementation detail depth", "Font choice only", "Whether charts exist"], 1),
  ],
  "s6-m3": [
    mc("s6-m3-q1", "A sustainable OSS contribution plan should:", ["Assume infinite maintainer time", "Scope work, communicate, and respect boundaries", "Require unpaid night shifts", "Skip reading issues"], 1),
    mc("s6-m3-q2", "A personal development plan in crypto should emphasize:", ["Only chasing hype cycles", "Measurable outputs and depth over performative activity", "Buying more monitors", "Ignoring security"], 1),
    mc("s6-m3-q3", "Capstone limitations section exists to:", ["Sound weak on purpose", "Build trust by stating what was not proven or measured", "Hide failures", "Remove peer review"], 1),
  ],
} as const;

const PASS_RATIO = 0.67;

export function getModuleQuizQuestionCount(moduleId: string): number {
  return MODULE_QUIZ_QUESTIONS[moduleId]?.length ?? 0;
}

export function getModuleQuizQuestionsPublic(moduleId: string): ModuleMcQuestionPublic[] | null {
  const qs = MODULE_QUIZ_QUESTIONS[moduleId];
  if (!qs?.length) return null;
  return qs.map(({ id, prompt, options }) => ({ id, prompt, options }));
}

export function gradeModuleQuiz(moduleId: string, answers: Record<string, number>): { score: number; total: number; passed: boolean } {
  const qs = MODULE_QUIZ_QUESTIONS[moduleId];
  if (!qs?.length) return { score: 0, total: 0, passed: false };
  let score = 0;
  for (const q of qs) {
    const sel = answers[q.id];
    if (typeof sel === "number" && sel >= 0 && sel <= 3 && sel === q.correctIndex) score += 1;
  }
  const total = qs.length;
  const passed = total > 0 && score / total >= PASS_RATIO;
  return { score, total, passed };
}

export function listQuizzedModuleIds(): string[] {
  return Object.keys(MODULE_QUIZ_QUESTIONS);
}
