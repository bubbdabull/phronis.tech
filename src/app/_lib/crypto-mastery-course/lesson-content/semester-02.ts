import { SEMESTER_02 } from "../semester-02";
import { lessonContent, sec, terms } from "./helpers";
import type { LessonReadContent } from "./types";

const lessonsById = Object.fromEntries(
  SEMESTER_02.modules.flatMap((m) => m.lessons).map((lesson) => [lesson.id, lesson]),
);

export const SEMESTER_02_CONTENT: Record<string, LessonReadContent> = {
  "s2-m1-l1": lessonContent(
    [
      sec(
        "Introduction",
        "Ethereum organizes the world as accounts rather than Bitcoin's coin graph. Every address is either an externally owned account (EOA), controlled by a private key, or a contract account, whose behavior is defined by bytecode stored on chain. That split is not cosmetic: only EOAs can originate transactions, while contracts react when called. Understanding who can initiate what—and how the network orders and deduplicates attempts—is the foundation for reading explorers, debugging stuck sends, and reasoning about replay across chains.",
        "This lesson connects account types to nonces (per-account transaction counters) and to chain-scoped replay protection. You will see why a contract cannot 'wake up' on its own, why a nonce gap freezes later transactions, and why chainId in signatures matters when dozens of EVM-compatible networks share similar address formats.",
      ),
      sec(
        "EOAs vs Contract Accounts",
        "An EOA is a public key hash with a nonce and a balance. It has no code; spending or deploying is always authorized by an ECDSA (or typed-data) signature from the holder of the matching private key. A contract account also has a nonce and balance, but additionally stores code and persistent storage slots interpreted by the EVM on every call. Contracts do not hold private keys—they execute deterministically given calldata, gas, and the current state.",
        "Because contracts cannot sign, they cannot broadcast transactions to the mempool themselves. Automation therefore depends on an EOA or another contract being invoked by someone else's transaction—keepers, bots, account-abstraction bundlers, or meta-transaction relayers. Product language that says 'the protocol sent funds' usually means 'a human or bot called a function that moved balances according to rules.' That distinction matters for incident response: compromised keeper keys look like authorized protocol behavior on chain.",
        "Capabilities diverge in subtle ways. EOAs pay gas directly from their balance; contracts can hold ETH and tokens but only spend them when code paths execute. Contract creation increments the deployer's nonce and assigns a new address derived from deployer address and nonce (CREATE) or from salt and init code (CREATE2). Reading a verified contract on a block explorer is reading a state machine specification, not a person.",
      ),
      sec(
        "Nonces, Ordering, and Stuck Transactions",
        "Each EOA maintains a nonce: the count of transactions already included from that address. A new transaction must use the current pending nonce exactly; higher nonces wait until the gap is filled. Wallets and nodes enforce this to prevent double-processing and to give miners a canonical ordering per sender. If you broadcast nonce 5 but nonce 4 is still pending—or was dropped from mempools—you may appear 'stuck' until you replace or cancel the lower nonce transaction.",
        "Stuck transactions are usually policy and fee problems, not cryptographic mysteries. A low-priority fee can leave a transaction pending while the network moves on; a later transaction with a higher nonce cannot jump ahead. Replacement (same nonce, higher max fee) and cancellation (same nonce, sending 0 value to yourself with competitive fees) are wallet features built on mempool rules, not guarantees. Operators should track pending nonce versus latest confirmed nonce on explorers during incidents.",
        "Contracts also have nonces, primarily for address calculation when deploying other contracts. Confusing deployer nonce with internal application counters (e.g., ERC-721 tokenId) is a common reader mistake. Application-level counters live in storage; the protocol-level nonce is about transaction history and address derivation.",
      ),
      sec(
        "Replay Protection and chainId",
        "Replay in the Ethereum context means taking a valid signed transaction from one network and re-broadcasting it on another where it would also be valid—draining the same key on two chains if signing did not bind to a specific chain. EIP-155 encodes chainId into the signature domain so a transaction signed for mainnet is not valid on a testnet or fork with a different id. Wallets should display network clearly because users still paste keys across chains; replay protection is per-signature, not per-brain.",
        "Hard forks and misconfigured RPC endpoints remain human factors. A wallet pointed at the wrong chain may construct transactions users did not intend. Cross-chain bridges do not eliminate replay risk at the key level—they move representations of assets. Always verify chain name, chainId, and explorer URL together before signing material transfers.",
      ),
      sec(
        "World State and Reading Transactions",
        "Conceptually, Ethereum's world state maps addresses to balances, nonce, code hash, and storage trie roots. Blocks commit to a state root after executing an ordered list of transactions. Failed executions can still consume gas: the sender pays for computation attempted up to the failure point unless out-of-gas aborts earlier. Tracing a reverted transaction on an explorer—who paid, how much intrinsic gas burned, what revert data means—is a core lab skill for this module.",
        "Intrinsic gas charges baseline cost before execution; calldata bytes cost extra, incentivizing compact interfaces and L2 batching. Post-EIP-1559, base fee burns and priority fee tips validators, turning blockspace into a public auction with protocol-defined reserve price dynamics. The mempool is not neutral truth; it is a policy surface where private order flow, censorship, and MEV reshape what users experience as 'pending.'",
      ),
      sec(
        "Practical Implications and Common Mistakes",
        "When integrating, never assume contracts initiate flows; design explicit triggers and monitor privileged EOAs. For treasury ops, track nonces in runbooks during high-volume payout batches. For support, distinguish revert (execution failed, state rolled back within tx) from out-of-gas (execution aborted, likely all gas used).",
        "Common mistakes: believing a confirmed contract 'holds' user keys; ignoring nonce gaps after dropped txs; signing transactions on forked or test networks with mainnet mental models; treating internal transaction traces as separate user accounts without reading call depth.",
      ),
      sec(
        "Summary",
        "EOAs initiate; contracts execute when called. Nonces sequence and deduplicate sends per account—gaps stall queues. EIP-155-style chainId binding stops cross-network signature replay. Reading Ethereum well means reading state transitions, gas accounting, and privileged roles—not just token balances on a dashboard.",
      ),
    ],
    terms(
      ["EOA (externally owned account)", "An account controlled by a private key; can originate transactions."],
      ["Contract account", "An on-chain account with bytecode and storage; cannot self-initiate transactions."],
      ["Nonce", "Per-account transaction counter required for ordering and replay resistance within a chain."],
      ["EIP-155", "Standard encoding chainId in signatures to prevent cross-chain transaction replay."],
      ["Intrinsic gas", "Base cost charged before EVM execution, including calldata priced by byte."],
      ["Revert", "Failed execution that rolls back state changes inside the transaction while charging gas used."],
    ),
    lessonsById["s2-m1-l1"],
  ),

  "s2-m1-l2": lessonContent(
    [
      sec(
        "Introduction",
        "Gas is Ethereum's resource meter: every opcode and byte of calldata consumes units of gas, and users pay fee = gas used × effective gas price. The mechanism exists to bound computation per block, price denial-of-service, and align validator incentives with scarce blockspace. Unlike a cloud bill priced after the month, on-chain execution is prepaid with a hard limit—run out of gas and execution halts, often burning the full budget.",
        "This lesson builds intuition for why storage is expensive, why calldata dominates L1 costs for rollups, how EIP-1559 reshaped fee markets, and why 'gas golf' is an engineering sport with security externalities.",
      ),
      sec(
        "The Gas Meter and Out-of-Gas",
        "Execution proceeds opcode by opcode until success, revert, or gas exhaustion. The transaction specifies a gas limit cap; unused gas below that cap is refunded only within rules—refunds exist for certain storage clears but are capped to prevent abuse. Users must estimate limit high enough to complete work yet low enough not to over-lock funds; wallets simulate to suggest limits, but simulation can diverge from mined state if mempools or prices move.",
        "Out-of-gas (OOG) differs from revert. Revert returns optional error data and undoes state changes within the call frame while charging gas consumed to that point. OOG aborts without a clean application-level error—integrators should label these separately in UX and postmortems. Failed token approvals during complex DeFi routes often trace to underestimated limits or nested calls consuming more than simulated.",
      ),
      sec(
        "Storage, Calldata, and Warm Access",
        "Writing a new storage slot is costly because every full node must store it forever-ish; clearing may refund partially but net history remains. Reading storage is cheaper than first-time writes; EIP-2929 introduced warm/cold access pricing so repeated touches within a transaction cost less—mirroring CPU cache intuition. Calldata on L1 is priced per zero and nonzero byte, making batching and compression valuable for rollups that post data to Ethereum.",
        "Engineers trade readability for gas: packed structs, mappings instead of arrays, events instead of storage logs for historical data consumers can reconstruct off-chain. Security reviews must ask whether gas optimizations removed checks or introduced reentrancy windows—not all cheap paths are safe paths.",
      ),
      sec(
        "EIP-1559 and Blockspace Markets",
        "After EIP-1559, each block has a protocol-adjusted base fee per gas that burns, plus a priority fee (tip) paid to validators. Base fee rises when blocks are full, falls when empty—aiming at target utilization. Users experience volatility as base fee movement plus competition for inclusion via tips. During NFT mints or airdrops, blockspace becomes a public auction; wallets that under-tip strand users who blame 'broken' apps.",
        "Max fee and max priority fee fields let wallets cap willingness to pay while targeting inclusion probability. L2 fee markets add another layer: L2 execution may be cheap while data availability on L1 remains the bottleneck—total cost is a supply chain, not a single number on a swap screen.",
      ),
      sec(
        "Implications for UX, MEV, and L2 Demand",
        "Product teams should show fee ranges, time-to-inclusion estimates, and which step (approve, swap, bridge) dominates cost. Batch operations—multicall routers, permit signatures, account abstraction—exist because fixed per-transaction overhead hurts small actions. Blockspace scarcity feeds MEV: searchers pay more when ordering matters, which is why identical swaps can cost different all-in prices at congested moments.",
        "Gas golf optimizes marginal cost but can centralize who can afford to compete (e.g., liquidation bots). Governance and audits should flag when only well-capitalized actors can afford to execute safety functions during spikes.",
      ),
      sec(
        "Common Mistakes and Summary",
        "Mistakes: comparing L2 execution fees without L1 data costs; assuming refunds make storage free; setting infinite gas limits 'to be safe' without understanding overpayment; ignoring that failed txs still cost the sender on Ethereum L1.",
        "Summary: Gas prices scarce computation and permanent state growth. Calldata and storage dominate many designs; warm/cold rules reward access patterns. EIP-1559 splits burn and tip; blockspace congestion propagates to UX and MEV. Model user journeys as gas budgets across steps, not single-click magic numbers.",
      ),
    ],
    terms(
      ["Gas limit", "Maximum gas units a transaction may consume before hard abort."],
      ["Base fee (EIP-1559)", "Protocol-adjusted per-gas price burned each block based on congestion."],
      ["Priority fee", "Tip paid to validators to compete for transaction ordering."],
      ["Calldata", "Input bytes attached to a transaction; expensive on L1, critical for rollup DA."],
      ["Gas golf", "Engineering to minimize on-chain resource use, sometimes at security tradeoffs."],
      ["Blockspace", "Finite per-block capacity for computation and data, allocated by fee markets."],
    ),
    lessonsById["s2-m1-l2"],
  ),

  "s2-m1-l3": lessonContent(
    [
      sec(
        "Introduction",
        "Most users never read Ethereum state directly—they read products built on logs, indexers, and cached APIs. Smart contracts emit events (logs) when state changes matter off-chain; indexers ingest blocks, decode logs, and serve GraphQL or REST shaped for frontends. That read layer is fast and flexible but eventually consistent and vulnerable to reorganizations, operator malice, and schema drift.",
        "This lesson explains when eth_call suffices versus when you need historical logs, how bloom filters historically helped light filtering, and what finality means for a deposit indexer—not just for a trader.",
      ),
      sec(
        "Logs vs On-Chain State Reads",
        "eth_call executes against current (or specified) state without publishing a transaction—ideal for 'what is balance now?' and simulating swaps. It does not give you cheap, trust-minimized history of every Transfer event across time; that requires scanning logs from block ranges or trusting an indexer. Logs are append-only records in transaction receipts, cheap for contracts to emit, expensive for nodes to store long-term—hence the ecosystem of external indexers.",
        "Design tradeoff: store data in contract storage (costly, always consistent with state) versus emit events and reconstruct views off-chain (cheaper on-chain, depends on indexer correctness). Many DeFi dashboards are event-sourced projections; if the indexer mis-decodes a proxy upgrade or misses a reorg, balances on screen diverge from chain truth without the contract being 'wrong.'",
      ),
      sec(
        "Indexers, Subgraphs, and Consistency",
        "Hosted indexers (The Graph-style subgraphs, proprietary pipelines) map block streams into databases with entities and relationships. They offer query ergonomics and aggregation impossible on a phone wallet alone. They also introduce operator trust: delayed sync, selective censorship, buggy handlers, and API keys that become secrets in frontend bundles.",
        "Eventual consistency means your UI may show a deposit before the chain finalizes it—or miss a rollback. Mature apps gate withdrawals on confirmation depth appropriate to value, not on indexer block height alone. Cross-check critical balances with direct RPC eth_call or multiple providers during incidents.",
      ),
      sec(
        "Reorgs, Finality, and Reader Hazards",
        "When a chain reorganizes, transactions move between blocks or disappear from the canonical chain. Indexers must rewind and reprocess; naive caches that only append will double-count or miss reversals. Readers should treat 'indexed' as 'indexed under a fork choice rule at time T.' L2 bridges compound the problem: safe L1 finality, faster L2 sequencer ordering, and different definitions of 'confirmed' across vendors.",
        "For a seller, finality is economic: how many confirmations until reversal is impractical. For an indexer, finality is operational: how many blocks to wait before exposing funds as withdrawable. Align these explicitly in product copy—'confirmed' without numbers is a liability.",
      ),
      sec(
        "Failure Modes and Mitigations",
        "Threat model an indexer like any other dependency: stale data, partial outages, malicious responses, API key theft enabling quota abuse or data poisoning, schema upgrades breaking clients, and drift between environments (testnet subgraph pointing at mainnet UI). Mitigations include multi-source reads, reorg-aware cursors, health checks on lag, cryptographic proofs where available (light clients, storage proofs—still evolving for consumers), and human escalation paths when numbers disagree.",
        "eth_call is insufficient when you need historical time series, complex joins across contracts, or analytics at scale—those are indexer jobs with explicit trust assumptions. Deposits on L2s often require understanding both L2 inclusion and L1 data availability or challenge windows depending on rollup type.",
      ),
      sec(
        "Summary",
        "Logs are the cheap broadcast channel; state is the authoritative ledger. Indexers translate chain history into product-friendly databases with lag and trust costs. Reorgs punish naive caching. Specify finality thresholds for financial actions and verify high-stakes reads against the chain, not only the API.",
      ),
    ],
    terms(
      ["Event log", "Structured data emitted in a transaction receipt for off-chain consumers."],
      ["Indexer", "Service that ingests blocks and serves queryable views of on-chain activity."],
      ["eth_call", "RPC method to read current contract state without sending a transaction."],
      ["Reorg", "Chain tip replacement that can change or remove previously seen transactions."],
      ["Eventual consistency", "Read layer may lag or temporarily disagree with latest canonical chain."],
      ["Finality (reader sense)", "Depth at which a reader treats data as unlikely to roll back."],
    ),
    lessonsById["s2-m1-l3"],
  ),

  "s2-m2-l1": lessonContent(
    [
      sec(
        "Introduction",
        "Solidity contracts are state machines: storage variables persist across calls, functions mutate state under access control, and external interfaces define what other contracts may invoke. Deployment publishes bytecode at an address; upgrades—when used—swap implementation while preserving storage and admin keys. Reading contracts as a technical reader means tracing storage layout, privileged roles, and proxy indirection—not memorizing syntax.",
        "This lesson covers implementation vs interface separation, delegatecall proxy intuition, storage collision classes, and why bytecode verification and timelocks shift—but do not eliminate—trust.",
      ),
      sec(
        "Contracts as State Machines",
        "Each contract encapsulates state (balances, roles, parameters) and transitions (functions guarded by modifiers). Public/external functions are the API; internal/private functions structure logic. Immutables and constants reduce storage writes at deploy time; mappings and arrays define access patterns with gas and security consequences. Events announce transitions to indexers; they do not enforce rules on-chain.",
        "Interfaces (ABI-level) describe function selectors without implementation—enabling composability and mocking. When you interact via a router, you often call interfaces while economics live in implementations. Verified source on explorers links bytecode to human-readable Solidity; unverified proxies force you to trust admin-published source or reverse engineer behavior from traces.",
      ),
      sec(
        "Proxies and delegatecall",
        "Upgradeable patterns deploy a proxy with persistent storage and a separate implementation contract. delegatecall runs implementation code in the proxy's storage context—so layout must match across versions. Minimal proxies (EIP-1167) clone cheap implementations pointing to shared logic; transparent vs UUPS variants differ in who calls upgrade functions and gas overhead.",
        "delegatecall risk: malicious or buggy implementation can write arbitrary storage slots if layout discipline fails—turning admin addresses into attacker controls. Storage collisions between proxy admin slots and implementation variables were historic exploit classes. Upgrades are governance events: multisigs, timelocks, and social layers delay but do not remove privileged power.",
      ),
      sec(
        "Upgrades, Timelocks, and Trust",
        "Timelocks schedule sensitive actions after a public delay, giving users time to exit if they disagree with an upgrade. They are not decentralization—they are notice periods. Emergency pauses trade liveness for damage control; pausers are hot targets. Bytecode verification ensures deployed code matches published source; proxy patterns split 'what you verify' into implementation while users still hold funds at proxy address.",
        "Integrators should map: who can upgrade, what storage can change, whether immutables exist, and whether proxies are self-destructible or admin-replaceable. Token listings that ignore proxy admin keys have listed tokens that were upgraded into honeypots.",
      ),
      sec(
        "Reading Assignments and Risk Commentary",
        "On explorers, follow proxy → implementation links, read upgrade events, and list admin functions (upgradeTo, changeAdmin, pause). Annotate whether roles are EOAs, multisigs, or timelock contracts. Note unverified implementation risk: bytecode may differ from GitHub marketing repos.",
        "Diagram mentally: user calls proxy address → delegatecall into impl → storage updates in proxy slots. Any mismatch in slot ordering between versions is a latent brick or exploit.",
      ),
      sec(
        "Common Mistakes and Summary",
        "Mistakes: assuming timelock equals trustless; ignoring implementation contract behind familiar proxy address; verifying token contract without checking mint role on implementation upgrades; conflating interface stability with storage stability.",
        "Summary: Contracts persist rules and state; proxies decouple address stability from code changes. delegatecall makes storage layout part of security. Upgrades move trust to admins and processes—read privileged roles before depositing size.",
      ),
    ],
    terms(
      ["delegatecall", "Executes callee code in caller's storage context—basis of many proxies."],
      ["Implementation contract", "Logic contract whose code runs via proxy delegatecall."],
      ["Storage collision", "Layout clash where implementation writes overwrite proxy admin slots."],
      ["Timelock", "Contract delaying privileged actions by a public waiting period."],
      ["Transparent proxy", "Proxy pattern routing admin-only upgrades separately from user calls."],
      ["Bytecode verification", "Matching on-chain bytecode to published source on explorers."],
    ),
    lessonsById["s2-m2-l1"],
  ),

  "s2-m2-l2": lessonContent(
    [
      sec(
        "Introduction",
        "Reentrancy is a control-flow bug class: a contract calls an external address that calls back into the original contract before the first invocation finishes, reusing inconsistent intermediate state. The DAO-era narrative made it famous, but variants persist—cross-function, read-only, and composability with flash loans. Oracles are another truth problem: contracts acting on prices that can be manipulated spot or delayed relative to execution.",
        "This lesson teaches checks-effects-interactions (CEI), storyboards reentrancy, and oracle discipline at intuition level—spot vs TWAP, freshness vs manipulation cost.",
      ),
      sec(
        "Reentrancy Storyboard",
        "Classic pattern: withdraw sends ETH before zeroing balance; attacker's fallback re-enters withdraw and drains repeatedly. The fix ordering is checks (require conditions), effects (update balances), interactions (external calls)—CEI. External calls are control transfer: callee may be another contract with arbitrary code, not a passive API.",
        "Cross-function reentrancy uses two functions sharing state—withdraw and transferFrom both touch balances without reentrancy guards. Read-only reentrancy (preview) exploits view functions returning stale prices while state is mid-update—relevant to lending protocols where oracle readers assume quiescent state.",
      ),
      sec(
        "Checks-Effects-Interactions in Practice",
        "Rewriting vulnerable pseudocode means moving balance updates before transfers, using reentrancy guards (mutex modifiers) where multiple entry points exist, and pulling funds instead of pushing when possible (transferFrom patterns). No pattern removes all risk: composable DeFi means your function is one hop in a larger machine attackers script with flash loans.",
        "Pause buttons freeze entry during incidents but centralize power; they do not fix logic bugs permanently. Audits and formal methods help; operational monitoring of abnormal call depths and balance deltas catches live abuse faster than postmortems alone.",
      ),
      sec(
        "Oracles: Spot, TWAP, and Manipulation",
        "Oracles bring off-chain or cross-pool prices on-chain. Spot prices from a single DEX pool are manipulable within one transaction using flash loans to warp reserves temporarily. Time-weighted average prices (TWAP) increase attack cost by requiring distorted prices over windows—trading off freshness for stability.",
        "Oracle delay vs freshness: lending needs timely liquidations; long TWAP windows slow response to real market moves. Governance sets parameters; attackers probe edges. Chainlink-style aggregators add operator sets and heartbeat rules—still trust assumptions, different shape than Uniswap TWAP.",
      ),
      sec(
        "Flash Loans and Pauseability",
        "Flash loans provide huge capital for one transaction, amplifying oracle and governance attacks that were uneconomic at smaller scale. They are tools, not villains—exposing protocols that priced instantaneous spot as if it were robust.",
        "Pauseability buys time to patch and communicate but harms users mid-flow and signals central control. Document who can pause, whether upgrades can remove pause, and user exit paths during delays.",
      ),
      sec(
        "Summary",
        "Treat external calls as reentrancy surfaces; order state updates before transfers. Oracles are trust and game-theory problems—define manipulation cost and freshness needs. Flash loans stress-test pricing assumptions. CEI plus guards plus monitoring beats folklore that 'Solidity 0.8 fixed reentrancy.'",
      ),
    ],
    terms(
      ["Reentrancy", "Re-invoking a contract before its prior call completes, exploiting interim state."],
      ["CEI (checks-effects-interactions)", "Pattern: validate, mutate state, then call externals."],
      ["Flash loan", "Uncollateralized loan repaid within the same transaction."],
      ["TWAP", "Time-weighted average price resisting single-block spot manipulation."],
      ["Spot oracle", "Price from immediate reserves—fast but manipulable in one tx."],
      ["Read-only reentrancy", "Exploiting inconsistent views while state is mid-update."],
    ),
    lessonsById["s2-m2-l2"],
  ),

  "s2-m2-l3": lessonContent(
    [
      sec(
        "Introduction",
        "ERC-20 is the de facto fungible token interface on EVM chains: balances mapping, transfer, approve, and transferFrom enabling third-party spenders. It is simple on paper and treacherous in production—decimals mismatches, infinite approvals, phishing spenders, and bridged tokens that share tickers but not contract addresses. This lesson walks flows, permit ergonomics, and treasury-grade allowance policy.",
      ),
      sec(
        "Transfer and Approval Flows",
        "transfer moves tokens directly from msg.sender. approve sets allowance for a spender; transferFrom moves from owner to recipient when caller is spender within allowance. Events Transfer and Approval power indexers; missing events or non-standard returns break composability—integrations must handle bool return quirks and fee-on-transfer tokens.",
        "Infinite approvals (type(uint256).max) reduce gas for repeat DeFi users but create long-lived honeypot surfaces if the spender contract is upgraded maliciously or compromised. Least privilege means per-spend or rolling caps with periodic revoke flows—operational friction traded for blast-radius reduction.",
      ),
      sec(
        "Permit and Signature-Based Approvals",
        "EIP-2612 permit lets owners sign approval messages off-chain; relayers or routers submit on-chain in the same transaction as swaps—improving UX and enabling gasless patterns where someone else pays gas. Signatures bind domain separators (chainId, contract) to reduce replay; wallets must show human-readable spender and value.",
        "Permit phishing signs away rights without an on-chain approve transaction users might notice in history—education and wallet simulation matter as much as protocol design.",
      ),
      sec(
        "Decimals, UI, and Bridged Identity",
        "decimals is a display hint, not a consensus rule—UIs assuming 18 decimals misprice assets with 6 (USDC) or 0 edge cases. Always read token contract metadata; never trust ticker symbols alone. Bridged tokens mint wrapped representations on L2s or sidechains; contract addresses differ from canonical L1 assets. Portfolio tools aggregating by symbol have confused users into sending wrong tokens.",
        "Mint/burn privileges and blocklists (centralized stablecoins) are policy levers outside ERC-20 minimum interface—due diligence includes admin keys and pause rights.",
      ),
      sec(
        "Treasury Policy Patterns",
        "Multisig treasuries interacting with unknown DeFi should use: scoped approvals per protocol version, separate hot wallets with low caps, revoke scripts after campaigns, hardware signing with clear spender display, and blocklists for known malicious routers. Document when max approval is acceptable (audited immutable contracts, short-lived ops) versus per-tx approvals for experimental protocols.",
        "Operationalize revoke.cash-style hygiene and internal alerts on unusual transferFrom patterns.",
      ),
      sec(
        "Summary",
        "ERC-20 couples simple transfers with delegated spending risk. Approvals are long-lived keys to your balances—treat them like credentials. Permits improve UX but increase signature phishing surface. Decimals and bridged addresses are identity; verify contracts, not logos.",
      ),
    ],
    terms(
      ["allowance", "Spending cap a token owner grants to another address (spender)."],
      ["transferFrom", "Spender moves tokens from owner within allowance."],
      ["permit (EIP-2612)", "Off-chain signed approval submitted on-chain by a relayer."],
      ["Infinite approval", "Max uint allowance avoiding repeat approve txs—increases risk."],
      ["decimals", "Display scaling factor; mismatches cause catastrophic UI errors."],
      ["Bridged token", "Representation of an asset on another chain—distinct contract address."],
    ),
    lessonsById["s2-m2-l3"],
  ),

  "s2-m3-l1": lessonContent(
    [
      sec(
        "Introduction",
        "Layer twos promise cheaper execution while inheriting security from a base layer—but 'rollup' labels hide diverse trust models. Vocabulary matters: data availability, settlement, proving, sequencers, and escape hatches separate marketing from engineering. This lesson gives a taxonomy without tribalism so you can read L2Beat-style tables and ask what happens when the sequencer lies or goes offline.",
      ),
      sec(
        "Optimistic vs Validity (ZK) Proving",
        "Optimistic rollups post transaction data to L1 and assume validity unless challenged within a dispute window (often ~7 days). Fraud proofs (or fault proofs) let honest parties contest incorrect state transitions—security depends on at least one honest challenger and live watcher infrastructure. Withdrawals to L1 therefore inherit delay—liquidity providers bridge the gap for a fee.",
        "Validity (ZK) rollups post cryptographic proofs that transitions are correct—withdrawals can be faster once proofs verify on L1, with cost and complexity in prover systems and VM constraints. Neither removes bridge risk at L1 entry/exit; they change how execution correctness is enforced. 'ZK' in branding sometimes means validity proofs, sometimes vague zero-knowledge marketing.",
      ),
      sec(
        "Data Availability and Settlement",
        "Data availability (DA) means sufficient transaction data is published for others to reconstruct state and challenge or verify. Without DA, sequencers can withhold details while claiming health. Settlement is where proofs or disputes finalize—often Ethereum L1 for Ethereum rollups. Sovereign rollups (hand-wavy) may use other DA layers—read who secures what.",
        "Forced inclusion mechanisms let users post transactions to L1 that sequencers must process within bounds—escape hatches when sequencers censor. Their UX is often painful; existence is a safety backstop, not daily path.",
      ),
      sec(
        "Sequencers, Liveness, and Decentralization Stages",
        "Sequencers order L2 transactions, produce blocks, and capture MEV—often single-operator today with roadmaps to shared sequencing. Liveness failure means users cannot transact quickly even if funds are safe long-term. Stage rubrics (decentralization stages) track progress toward permissionless proving, multiple sequencers, and transparent governance—useful for diligence, not hype scores.",
        "Fee markets on L2 split execution cost from L1 data cost; congested L1 raises rollup fees even when L2 gas is low. Batchers compress calldata; EIP-4844 blobs change economics.",
      ),
      sec(
        "User Journals and Trust per Signature",
        "Bridging testnet assets exercises the real UX: multiple signatures (approve, deposit, claim), each binding different rights. Document what each signature allows—minting wrapped assets, locking native, changing destination chain. Trust assumptions accumulate per hop; official bridges reduce spoofing but not smart contract bugs.",
      ),
      sec(
        "Summary",
        "Rollups trade off proof systems, DA, sequencer trust, and withdrawal delays. Optimistic paths buy simplicity with challenge windows; validity proofs buy faster finality at prover cost. Read trust tables, not logos—and treat forced inclusion as insurance, not convenience.",
      ),
    ],
    terms(
      ["Data availability (DA)", "Publishing enough data for others to verify or reconstruct L2 state."],
      ["Optimistic rollup", "Rollup assuming validity unless fraud proof succeeds in a window."],
      ["Validity (ZK) rollup", "Rollup using cryptographic proofs of correct state transitions."],
      ["Sequencer", "Entity ordering and producing L2 blocks—often centralized early."],
      ["Forced inclusion", "L1 path forcing sequencers to include user transactions."],
      ["Challenge window", "Period during which optimistic withdrawals can be disputed."],
    ),
    lessonsById["s2-m3-l1"],
  ),

  "s2-m3-l2": lessonContent(
    [
      sec(
        "Introduction",
        "Bridges are among the highest-loss components in crypto: they connect heterogeneous trust domains with enormous honeypot balances. Failures cluster into validator compromise, logic bugs, configuration errors, and operational key abuse—not random 'hacks.' Analytic casebooks build pattern recognition for integrators and DAOs choosing bridge vendors without sensational headlines.",
      ),
      sec(
        "Mint-and-Burn vs Lock-and-Unlock",
        "Lock/unlock bridges escrow native assets on chain A and release on chain B when proofs arrive—classic custodial shape on-chain. Mint/burn bridges issue wrapped representations on destination chains, destroying them on return. Token mapping tables must align decimals, metadata, and pause states; mapping errors have minted unbacked wrapped tokens worth millions.",
        "Fast bridges often rely on optimistic liquidity and reputational or multisig-backed promises rather than full finality—speed is a loan against trust. Skepticism defaults are healthy.",
      ),
      sec(
        "Failure Categories from History",
        "Validator set compromise: threshold signatures forged messages. Logic bugs: incorrect merkle proof verification, replayed messages, rounding errors. Configuration: wrong contract addresses, permissive roles left open post-deploy. Upgrade key theft: proxy admin becomes attacker path. Operational: leaked keys, insider fraud, monitoring blind spots.",
        "Disclosure norms matter—timely, technical postmortems help ecosystem learning; vague 'exploit' tweets do not. Integrators should require incident history and response playbooks from vendors.",
      ),
      sec(
        "Due Diligence Questions",
        "Thirty-question checklists should cover: who holds upgrade keys, is implementation verified, how are messages proven (light client vs multisig vs optimistic), what monitors alert on anomalous mints, what is max TVL vs insured reserves, how fast can withdrawals halt, and what escape hatch users have if operators vanish. Severity-tag questions so executives see top ten risks first.",
        "Escape hatch tests: can users withdraw via L1-only path without sequencer cooperation? When was it last exercised on testnet?",
      ),
      sec(
        "Integrator and DAO Posture",
        "Custody via bridges concentrates tail risk—cap exposure, diversify routes, delay large settlements until finality appropriate to value, and never trust UI green checks without understanding mint authority. Fast bridges suspicious by default is not cynicism; it is base rate reasoning from loss data.",
      ),
      sec(
        "Summary",
        "Bridges translate trust across chains; failures are patterned, not mystical. Model mint authority, validator thresholds, upgrades, and monitoring. Due diligence is asking the same boring questions until answers are specific—addresses, roles, delays, and drills.",
      ),
    ],
    terms(
      ["TVL (bridge context)", "Total value locked—honeypot size attracting attackers."],
      ["Token mapping", "Rules linking canonical assets to wrapped representations."],
      ["Validator threshold", "Minimum signatures required to authorize cross-chain messages."],
      ["Escape hatch", "User path to recover funds without trusting live operators."],
      ["Upgrade key", "Admin capability to change bridge logic—frequent compromise target."],
      ["Light client bridge", "Verifies remote chain headers on-chain—stronger but heavier."],
    ),
    lessonsById["s2-m3-l2"],
  ),

  "s2-m3-l3": lessonContent(
    [
      sec(
        "Introduction",
        "Interoperability standards aim to shrink bespoke bridge spaghetti—IBC in Cosmos, CCIP and others in enterprise messaging—but heterogeneity remains because chains differ in VMs, finality, and validator sets. Messaging protocols move data and instructions; asset bridges move economic claims—related but not identical. This lesson stays brochure-depth: enough to read executive memos and spot oracle dependencies.",
      ),
      sec(
        "IBC in One Paragraph Plus Context",
        "Inter-Blockchain Communication (IBC) lets Cosmos SDK chains (and others implementing the spec) verify counterparty light clients and pass packets over connections with timeouts and acknowledgments—like TCP for chains with explicit trust in client updates. It solves composability between sovereign chains sharing a relayer market, not magically unifying all crypto.",
        "Relayers deliver packets; they cannot forge valid proofs without breaking light client assumptions. Misconfiguration of client upgrades or frozen clients has caused real incidents—standards reduce but do not remove ops burden.",
      ),
      sec(
        "Messaging vs Bridging Assets",
        "Cross-chain messaging can trigger actions—swap, lend, vote—without minting a wrapped token on arrival, if liquidity already exists natively. Asset bridging mints or unlocks representations, importing foreign risk. Sometimes messaging plus local liquidity is safer than wrapped inventory; sometimes users demand fungible wrapped tickers for DeFi composability.",
        "CCIP-style approaches combine oracle networks and DONs (decentralized oracle networks) to attest events—trust shifts to oracle operator sets and their reputational/security budgets. Compare to IBC's light client verification vs honest-majority multisig bridges.",
      ),
      sec(
        "Latency, Safety, Liveness",
        "Safety: nothing bad happens (no unauthorized mints). Liveness: good things eventually happen (messages delivered). Protocols trade latency for stronger proofs or more observers. Operational runbooks cover stuck messages, fee grants for relayers, and version upgrades—standards do not run themselves.",
        "Oracle dependency appears whenever off-chain data or centralized attestations gate mints—price feeds, proof APIs, committee signatures. Name the trust anchor in every diagram.",
      ),
      sec(
        "Executive Memo Discipline",
        "Compare two protocols without saying 'decentralized' without definition. Define trust anchors: who can pause, who signs messages, what fraud proof window exists, what happens if oracle quorum is split. Glossary appendices beat acronyms in slides.",
      ),
      sec(
        "Summary",
        "Standards coordinate verification and packet delivery; they do not unify trust. Separate messaging from minting. Ask safety vs liveness tradeoffs and who operates relayers or oracles. Heterogeneity is the roadmap reality—plan runbooks, not one-chain fantasies.",
      ),
    ],
    terms(
      ["IBC", "Inter-Blockchain Communication protocol for verified cross-chain packets."],
      ["Relayer", "Off-chain process delivering proofs and packets between chains."],
      ["Light client", "On-chain tracker of remote chain headers for verification."],
      ["Cross-chain messaging", "Passing instructions/events without necessarily minting assets."],
      ["Safety vs liveness", "Nothing bad vs good eventually happens—protocol tradeoffs."],
      ["Trust anchor", "Explicit party or mechanism whose honesty assumptions secure a path."],
    ),
    lessonsById["s2-m3-l3"],
  ),

  "s2-m4-l1": lessonContent(
    [
      sec(
        "Introduction",
        "The multi-chain landscape is not a leaderboard of transactions per second—it is a map of where liquidity, oracles, wallets, and risk concentrate. Bitcoin remains settlement and sovereign-money narrative for many holders; Ethereum anchors programmable DeFi and NFT liquidity; high-throughput chains like Solana compete on fee and UX for active traders. Bridges stitch domains, importing trust at every hop.",
        "This lesson builds a neutral mental map: shared security vs independent validators, native vs bridged assets, and why scam types cluster where culture and fee profiles attract different user cohorts.",
      ),
      sec(
        "Fees, Finality, and Confirmation UX",
        "Fee volatility differs: Bitcoin fee spikes during congestion; Ethereum L1 spikes during NFT events; Solana often charges low base fees but priority fees during hot markets. Finality semantics differ too—probabilistic proof-of-work confirmations, Ethereum slot finality with reorg risks under attacks, Solana optimistic confirmation vs finalized. Sellers should price goods against reorg depth appropriate to chain, not marketing 'instant.'",
        "Low fee is not low risk: cheaper txs enable spam, poisoning, and rapid scam cycles. Users chasing fees may land on illiquid chains with thin order books and worse exit ramps.",
      ),
      sec(
        "Liquidity and Oracle Liquidity",
        "Traders care where depth exists for size, not headline TPS. Ethereum L1 and major L2s host deep DEX and lending liquidity; Solana concentrates memecoin and perp culture with aggregator routing. Oracle liquidity—where robust price feeds exist—determines whether DeFi prices are manipulable. A fast chain with thin pools is dangerous for large swaps.",
        "Bridges move claims, not magically liquidity—destination chain may have wrapped supply without deep markets.",
      ),
      sec(
        "Why Users Bridge and What Trust Each Reason Introduces",
        "Reasons include: cheaper execution (L2), accessing apps only on another chain, arbitrage, yield farming, and tax or regulatory geography (sensitive—product neutral). Each introduces bridge validators, wrapped asset issuers, or messaging oracle trust. Native gas assets differ—users must hold ETH, SOL, etc., for fees even when trading USDC.",
        "Shared security (rollups on Ethereum) vs independent validator sets (alt L1s) changes who must be corrupted to forge history—compare honestly without tribal slogans.",
      ),
      sec(
        "Client Explainer Discipline",
        "When asked 'Solana or Ethereum for trading,' answer with questions: custody model, size, need for specific assets, tolerance for bridge delay, scam literacy, and tax reporting capacity. One-pagers should list tradeoffs, not recommendations, and glossary eight terms (L1, L2, finality, bridge, wrapped asset, RPC, MEV, custody).",
      ),
      sec(
        "Summary",
        "Map chains by liquidity, finality, fee UX, and trust anchors—not TPS alone. Bridging imports risk; wrapped assets are not fungible across addresses. Neutral education beats tribal marketing for client trust.",
      ),
    ],
    terms(
      ["L1 / L2", "Base chain vs scaling layer inheriting security from L1 (for rollups)."],
      ["Shared security", "Scaling system relying on base layer validators/economics."],
      ["Bridged asset", "Token representation backed by custody or mint rules elsewhere."],
      ["Finality", "Practical irreversibility of transactions for a given use case."],
      ["Oracle liquidity", "Depth and reliability of price sources for DeFi execution."],
      ["Validator set", "Participants securing chain consensus—independent per L1."],
    ),
    lessonsById["s2-m4-l1"],
  ),

  "s2-m4-l2": lessonContent(
    [
      sec(
        "Introduction",
        "Solana flips the EVM mental model: programs are stateless executables; all persistent data lives in separate accounts passed into instructions. Wallets 'create token accounts' because SPL tokens require associated token accounts (ATAs); rent-exempt deposits size accounts; compute units (CUs) meter execution like gas with different failure modes. Reading Solscan is reading account lists, not a single contract storage tab.",
      ),
      sec(
        "Accounts, Programs, and PDAs",
        "Transactions specify a set of accounts with metadata (signer, writable). Programs read and write only declared accounts—enforcing explicit data locality. Program-derived addresses (PDAs) are deterministic addresses without private keys, controlled by programs via seeds—used for vaults, metadata, and pool authority.",
        "Contrast EVM: Solidity storage lives inside contract address. On Solana, the program is logic; data accounts are rows you pass in. Confusing program id with a data account is a common explorer mistake.",
      ),
      sec(
        "SPL Tokens and Associated Token Accounts",
        "SPL Token program manages mints and token accounts holding balances. ATAs are standard addresses per (wallet, mint) pair—wallets create them on first receive, costing rent-deposit SOL. Transfers move amounts between token accounts, not 'inside' the mint.",
        "Mint authorities and freeze authorities are policy levers—read them for memecoins. Decimals live on mint; UI must match.",
      ),
      sec(
        "Compute Units, Rent, and Failed Transactions",
        "Transactions include CU limits and priority fees; exceeding CU fails execution but may still charge base fees—users see 'insufficient funds' for SOL fees while token balance is fine. Rent-exempt minimum lamports size accounts; closing accounts refunds rent to designated recipient.",
        "Versioned transactions and address lookup tables compress account lists—wallet upgrades matter for compatibility. Partial signing enables multisig flows where multiple parties co-sign one transaction.",
      ),
      sec(
        "Explorer Traces",
        "Lab practice: follow one SPL transfer—fee payer, signer, source ATA, destination ATA, token program, mint. For failures, distinguish slippage on swaps, blockhash expiration, CU exhaustion, and account not initialized. Name roles in screenshots; do not treat every address as a person.",
      ),
      sec(
        "Summary",
        "Solana separates code (programs) from data (accounts). SPL and ATAs explain wallet onboarding costs. CU and rent drive failure modes foreign to EVM users. Read transactions as account graphs, not single-contract storage.",
      ),
    ],
    terms(
      ["Program (Solana)", "Stateless executable; data lives in passed accounts."],
      ["PDA", "Program-derived address without private key, controlled by program seeds."],
      ["ATA", "Associated Token Account standard per wallet-mint pair."],
      ["Compute units (CU)", "Execution budget meter for Solana transactions."],
      ["Rent-exempt", "Minimum lamports making an account persist without ongoing rent."],
      ["SPL Token", "Solana fungible token standard analogous to ERC-20 role."],
    ),
    lessonsById["s2-m4-l2"],
  ),

  "s2-m4-l3": lessonContent(
    [
      sec(
        "Introduction",
        "Active Solana users interact with aggregators (Jupiter), priority fee markets, staking for network security, and localized MEV realities (Jito bundles). Fast chains do not remove ordering games—they change latency and who participates. This lesson prepares traders and advisors to quote slippage honestly, set priority fees without toxic auction addiction, and recognize Solana-specific scams targeting Discord-heavy communities.",
      ),
      sec(
        "Aggregator Routing and Moving Quotes",
        "Aggregators query multiple DEX routes—direct pools, multi-hop, split routes—and present best price net of fees and price impact. Quotes move because mempools and pool reserves change between simulation and landing; slippage tolerance is user protection against bad fills, not guaranteed price. Price impact rises with size relative to pool depth—explain before users blame 'broken Jupiter.'",
        "Simulation in wallets previews outcomes but blind signing and malicious dApps can still trick approvals—verify program ids and account lists on hardware when possible.",
      ),
      sec(
        "Priority Fees and Landing Probability",
        "Base fees are low; during congestion priority fees pay validators (and stake-weighted leaders) for ordering. Setting too low strands transactions; setting extremely high donates margin in competitive auctions. Heuristics: start modest, increase on retry, watch recent landed txs for similar programs—avoid unbounded bidding wars during hype mints.",
        "Priority fee not landing can still happen under leader scheduling, network partitions, or expired blockhashes—retries and fresh blockhashes are normal ops.",
      ),
      sec(
        "Staking, Jito, and MEV at High Level",
        "Staking SOL delegates stake to validators securing consensus—rewards and slashing rules matter for custodians. Jito-style block engines auction bundle ordering—searchers pay for atomic multi-tx bundles. This is ordering market, not something retail must exploit, but explains why identical user txs get different outcomes during memecoin spikes.",
        "RPC reliability varies by provider—same chain, different pending views. Apps should surface endpoint health and block height lag.",
      ),
      sec(
        "Solana-Specific Scams and Safety Checklist",
        "Patterns: fake support DMs ('verify wallet'), malicious NFT airdrops with drain approvals, typosquat domains, clipboard swaps, counterfeit tokens with identical tickers, and 'claim rewards' transactions that transfer authority. Checklist groups: wallet hygiene (burner for degen, hardware for savings), verify URLs on multiple channels, revoke token delegates periodically, never share seed, treat Discord/Telegram support as hostile, bridge only official links, simulate before sign, cap priority fees, and document tax exports.",
        "Discord support is almost always a scam because legitimate teams use ticket systems and never ask for seeds—repeat until cultural muscle memory forms.",
      ),
      sec(
        "Summary",
        "Solana trading is routing plus fees plus ordering games. Teach slippage, impact, and priority fee retries honestly. Staking and MEV exist at infrastructure layer—users need scam literacy more than exploit tutorials. Checklists beat heroics for client safety.",
      ),
    ],
    terms(
      ["Aggregator (Jupiter)", "Router finding best swap path across Solana DEX liquidity."],
      ["Slippage tolerance", "Maximum price deviation user accepts between quote and execution."],
      ["Priority fee", "Extra fee incentivizing validators to order transaction sooner."],
      ["Price impact", "Pool price movement caused by trade size relative to liquidity."],
      ["Jito bundle", "Atomic ordered group of transactions in MEV auction context."],
      ["Blockhash expiration", "Transaction rejected if recent blockhash too old—retry needed."],
    ),
    lessonsById["s2-m4-l3"],
  ),
};
