import { SEMESTER_03 } from "../semester-03";
import { lessonContent, sec, terms } from "./helpers";
import type { LessonReadContent } from "./types";

const lessonsById = Object.fromEntries(
  SEMESTER_03.modules.flatMap((m) => m.lessons).map((lesson) => [lesson.id, lesson]),
);

export const SEMESTER_03_CONTENT: Record<string, LessonReadContent> = {
  "s3-m1-l1": lessonContent(
    [
      sec(
        "Introduction",
        "Tokens are not a single species. Marketing collapses utility, governance, equity-like claims, and pure attention assets into one word—then price charts do the rest of the persuasion. Serious evaluation starts by asking what rights the token actually encodes on-chain versus what the whitepaper promises off-chain.",
        "This lesson builds an honest taxonomy: what can be verified in code, what requires trusting humans, and what is circular tokenomics dressed as yield. The goal is not to label projects good or bad, but to stop category errors—treating a governance knob like a dividend, or a meme like a productivity machine.",
      ),
      sec(
        "Utility, Cash Flow, and Protocol Permissions",
        "Utility tokens are often described as tickets: pay fees, access features, stake for services. The verifiable question is whether demand for the ticket is endogenous to real usage or manufactured by emissions paid to farmers who sell. Trace each 'use' to a counterparty willing to pay in something other than the same token.",
        "Cash-flow rights—dividends, buybacks, fee shares—are rare on-chain because they brush securities law and require enforceable claims against an entity. When a protocol routes fees to stakers, ask whether that is net new value or redistribution from later buyers. Productive yield comes from external revenue; circular yield comes from inflation plus hope.",
        "Governance tokens grant votes over parameters, treasuries, or upgrades. Votes are buyable wherever tokens trade freely. Binding execution may still sit behind a multisig or admin key, making governance theater unless you map the full execution path from proposal to bytecode change.",
      ),
      sec(
        "Meme, Attention, and Liquidity Mining as CAC",
        "Meme assets encode coordination around a symbol with minimal protocol rights. Their 'fundamentals' are social: attention, listing access, and reflexive liquidity. That is a valid market category if you price it as entertainment and size accordingly—not as discounted cash flow.",
        "Liquidity mining and points programs are customer-acquisition spend denominated in tokens. Lockups and vesting schedules reveal whether insiders align with long holders or exit into emissions. Read unlock calendars like cap tables: who receives what, when, and through which contracts.",
        "Circular patterns to flag: staking pays rewards in the same thin float token; 'revenue' is mostly token transfers between protocol-controlled addresses; governance only adjusts emissions upward. Each pattern can coexist with honest experimentation—but you should name it instead of calling it yield.",
      ),
      sec(
        "Mapping Claims to Evidence",
        "Build a one-column table of claims from docs and tweets. For each, specify an on-chain check (contract function, emission schedule, oracle feed) or mark residual trust. Examples: 'deflationary' → mint/burn keys; 'community-owned' → owner() and timelock holders; 'real yield' → asset denomination of fees.",
        "Admin keys and upgradeability are not automatic rugs—they are disclosed trust. Your job is to price that trust. Timelocks, multisig thresholds, and public incident history reduce—but do not eliminate—execution risk.",
      ),
      sec(
        "Practical Implications and Common Mistakes",
        "Falsifiability beats narrative: write what observation would make you exit. If nothing on-chain could disprove the thesis, you are holding a story. Separate legal rights (contracts with issuers) from protocol permissions (votes that may not bind operators).",
        "Common mistakes: treating APY as income without asking the denomination and source; ignoring unlock cliffs; assuming staking secures the network when it only secures a TVL leaderboard; using 'utility' to mean 'number goes up.'",
      ),
      sec(
        "Summary",
        "Tokens differ by verifiable rights and economic loops—not by logos. Utility needs real fee payers; governance needs execution analysis; memes need liquidity and attention honesty. Emissions are marketing spend. Your diligence output is a map of claims to evidence and a list of who can change the rules.",
      ),
    ],
    terms(
      ["Utility token", "A token marketed for protocol access or fees whose demand should tie to real usage."],
      ["Governance token", "A voting instrument over parameters or treasuries, buyable wherever it trades."],
      ["Circular tokenomics", "Value loops funded mainly by inflation and reflexive staking rather than external revenue."],
      ["Liquidity mining", "Token subsidies to attract deposits or volume—customer acquisition cost in coin form."],
      ["Vesting", "Time-locked release schedule revealing when insiders or investors can sell."],
      ["Residual trust", "Risk you accept when a claim cannot be verified on-chain and must be believed."],
    ),
    lessonsById["s3-m1-l1"],
  ),

  "s3-m1-l2": lessonContent(
    [
      sec(
        "Introduction",
        "Non-fungible tokens are pointers, not pictures. On-chain you typically store an identifier and a URI; the art, metadata, and license often live elsewhere. Collectors who ignore that stack confuse provenance with permanence—and are surprised when metadata, royalties, or marketplace policy changes.",
        "This lesson traces the pipeline from contract mint to image bytes, explains why royalties fractured across marketplaces, and contrasts transferable PFPs with soulbound credentials. Wash trading incentives appear here because NFT markets are thin, status-heavy, and fee-sensitive.",
      ),
      sec(
        "tokenURI, IPFS, and Pinning Economics",
        "ERC-721-style contracts map tokenId → tokenURI, often an https or ipfs:// URL. The chain commits to the pointer, not the pixels. If the host swaps content at that URL, holders see different art with the same on-chain history—mutable metadata is a feature for games, a risk for PFPs marketed as permanent.",
        "IPFS uses content addressing: the CID hashes the bytes. Pinning is an operational cost—someone must keep serving the data. Gateways (https fronts) add convenience and censorship points. Native IPFS retrieval from wallets is rarer than gateway URLs in practice.",
        "Frozen metadata means the URI or on-chain payload cannot be updated by the owner contract—verify in source, not on the marketplace badge. Upgradeable proxy patterns can still change logic if admin keys exist.",
      ),
      sec(
        "Royalties, Marketplaces, and Enforcement Limits",
        "Creator royalties were a social convention enforced by major marketplaces, not a law of physics. Optional royalties and aggregator routing broke the assumption that secondary sales always pay creators. On-chain transfer hooks can enforce payment in some designs but are bypassed by direct transfers or unsupported venues.",
        "Buyers should price royalty policy into liquidity: collections that depend on perpetual secondary revenue may face volume migration when fees are optional. Creators should model primary revenue and grants, not guaranteed secondary streams.",
      ),
      sec(
        "Soulbound, Licensing, and CC0",
        "Soulbound or non-transferable tokens encode identity, credentials, or reputation—different risk profile than liquid collectibles. Transfer restrictions can be circumvented if implemented only in UI, not contract.",
        "Legal licenses (commercial use, CC0) live off-chain unless explicitly anchored. 'On-chain' does not mean 'you own the copyright.' CC0 is a legal grant; the chain does not enforce trademark disputes.",
      ),
      sec(
        "Practical Implications and Common Mistakes",
        "Diagram every hop: creator → deployer → contract → metadata host → image host. List failure modes: admin key, unpinned CID, gateway block, marketplace delisting. For long-term PFP value, immutability and host independence matter as much as rarity traits.",
        "Common mistakes: assuming OpenSea verification equals contract safety; ignoring proxy admins; treating floor price as fundamental; conflating wash volume with collector demand.",
      ),
      sec(
        "Summary",
        "NFTs are indirection layers. Permanence is an operational and governance choice, not a default. Royalties are policy and code, not promises. Diligence follows the full pipeline and asks who can change each hop without your consent.",
      ),
    ],
    terms(
      ["tokenURI", "On-chain pointer (often a URL) to metadata describing the NFT."],
      ["Content addressing", "Naming data by hash (CID) so swaps are detectable if the hash changes."],
      ["Pinning", "Paying to keep IPFS content available—absence equals broken images."],
      ["Gateway", "HTTPS server bridging browsers to IPFS; convenient but a censorship chokepoint."],
      ["Soulbound token", "Non-transferable NFT used for identity or credentials rather than speculation."],
      ["Wash trading", "Self-dealing to inflate volume or floor optics without economic intent."],
    ),
    lessonsById["s3-m1-l2"],
  ),

  "s3-m1-l3": lessonContent(
    [
      sec(
        "Introduction",
        "Stablecoins promise a dollar (or other unit) on a blockchain. The engineering problem is not minting a number—it is maintaining convertibility under stress. Designs differ in where collateral lives, who can redeem, and what breaks first when confidence leaves.",
        "This lesson compares fiat-backed, over-collateralized crypto, and endogenous algorithmic histories; separates primary redemption from secondary market peg; and sketches depeg geometry as bank-run dynamics, not moral failure alone.",
      ),
      sec(
        "Fiat-Backed and Attestation Models",
        "Reserve-backed stables mint when authorized entities deposit fiat or equivalents, and burn on redemption. Users trust issuer solvency, banking partners, and attestations—not just smart contracts. Attestations are snapshots: ask frequency, scope, and what liabilities are excluded.",
        "Secondary market price near $1 is not proof of full backing—it is proof that arbitrage and belief currently align. Stress appears when redemption queues lengthen, banking rails freeze, or attestations lag rumors.",
      ),
      sec(
        "Over-Collateralized Crypto CDPs",
        "Collateralized debt positions lock volatile crypto to mint stable units. Peg defense uses incentives: mint when over-collateralized, liquidate when ratios breach, charge stability fees. Oracle latency and governance of collateral lists are failure levers—see Semester 2 oracle lessons.",
        "Depegs can cascade: collateral price drops → liquidations → more selling → worse collateral price. Contagion channels into DeFi protocols that treat the stable as risk-free collateral.",
      ),
      sec(
        "Algorithmic and Endogenous Designs",
        "Algorithmic stables attempt to maintain peg via mint/burn of sibling tokens, seigniorage shares, or reflexive pools without external collateral—history is littered with death spirals: selling pressure on the stable drives arbitrage mechanics that mint more dilutive supply.",
        "Death spiral intuition: confidence falls → stable trades below peg → arbitrageurs require profit paid in dilution → holders flee → liquidity vanishes. Some hybrid designs add partial collateral; read the fraction and stress it.",
      ),
      sec(
        "Regulatory Perimeter and Shadow Banking",
        "Stablecoins sit between payments, banking, and securities regulation globally. Issuers may face freeze functions, blacklist addresses, or geographic blocks—features that matter to DAO treasuries holding 'neutral' dollars.",
        "Treat large stable holdings as counterparty risk clusters: same issuer, same bank, same chain bridge. Diversify deliberately with eyes open, not magically.",
      ),
      sec(
        "Summary",
        "Pegs are mechanisms plus trust. Fiat-backed needs redemption rails; CDPs need oracles and liquidations; algos need skepticism. Stress tests combine rate spikes, oracle delay, and simultaneous DeFi withdrawals—your memo should name who is hurt first and through which lever.",
      ),
    ],
    terms(
      ["Redemption", "Primary-market convertibility of stablecoin to collateral or fiat at issuer rules."],
      ["Attestation", "Third-party or issuer report on reserves—snapshot, not continuous proof."],
      ["CDP", "Collateralized debt position locking assets to mint stablecoins."],
      ["Death spiral", "Reflexive depeg where stabilization trades dilute remaining holders."],
      ["Oracle latency", "Delay between market price and on-chain liquidation triggers."],
      ["Contagion", "Spread of stress via shared collateral or liquidity pools."],
    ),
    lessonsById["s3-m1-l3"],
  ),

  "s3-m2-l1": lessonContent(
    [
      sec(
        "Introduction",
        "DAO governance is often sold as democracy; on-chain it is closer to plutocracy with public receipts. Token-weighted votes are purchasable; delegates aggregate power; execution may lag signaling by days or multisig discretion. Understanding mechanisms means modeling bribery, apathy, and emergency paths—not ideal civics.",
        "You will contrast off-chain signaling (Snapshot-class) with on-chain execution, survey voting rule tradeoffs at intuition level, and list failure modes for delegates and guardians.",
      ),
      sec(
        "Plurality, Ranked Choice, and Quadratic Intuition",
        "Plurality is simple but rewards coordination and splitting opponents. Ranked and approval methods change coalition math; on-chain implementation cost and strategy-proofness limits matter—many elegant social-choice results assume secrets ballots you do not have.",
        "Quadratic voting charges increasing cost for marginal votes to reduce whale dominance—in practice identity and collusion break the math unless sybil resistance is strong. Expect hybrids: off-chain QV signals, on-chain simple tallies for execution.",
      ),
      sec(
        "Vote Buying, Bribery, and Delegation",
        "On-chain votes are observable and often transferable via liquid staking derivatives or vote markets. Bribery is not a bug—it is a feature of public voting with economic stakes. Protocols use time locks, conviction voting, or rage-quit rights to cool impulses—not eliminate markets.",
        "Delegates campaign on competence but may face conflicts: vendors, employers, or bribery pools. Low turnout lets active minorities pass aggressive proposals; quorum games can block rescue or enable capture depending on defaults.",
      ),
      sec(
        "Off-Chain Signal vs On-Chain Execution",
        "Gasless off-chain votes gauge sentiment; multisigs or timelocked executors implement outcomes. The gap is political: voters may approve what signers refuse, or signers rush upgrades while voters sleep. Optimistic governance assumes silence equals consent—document dissent channels.",
        "Guardians and veto holders are emergency brakes—and centralization vectors. Map who can pause, upgrade, or drain treasuries outside token votes.",
      ),
      sec(
        "Practical Implications and Common Mistakes",
        "Postmortem any controversial proposal with voter coalitions, quorum, and execution path links. Ask whether lobbying (off-chain influence) differs from outright vote purchase in your context.",
        "Common mistakes: equating high forum activity with legitimacy; ignoring executable bytecode attached to proposals; assuming delegates are fiduciaries without legal duty.",
      ),
      sec(
        "Summary",
        "Governance is mechanism design under bribery and apathy. Voting rules shift coalitions; execution keys matter as much as tallies. Good analysis names who can actually change state, how fast, and what economic incentives surround the vote market.",
      ),
    ],
    terms(
      ["Token-weighted vote", "Ballot power proportional to token balance at snapshot block."],
      ["Quorum", "Minimum participation required for a valid decision—gameable threshold."],
      ["Delegate", "Account voting with aggregated token delegation—subject to conflicts."],
      ["Time lock", "Delay between vote success and execution allowing exit or response."],
      ["Optimistic governance", "Proposal passes if not vetoed within a challenge window."],
      ["Guardian", "Privileged role able to pause or block actions outside token votes."],
    ),
    lessonsById["s3-m2-l1"],
  ),

  "s3-m2-l2": lessonContent(
    [
      sec(
        "Introduction",
        "DAO treasuries are public goods wallets with adversarial perimeter. Millions on-chain attract scammers, compromised signers, and malicious modules. Operations discipline—multisig policy, streaming payouts, grants—is how communities avoid becoming brief rich targets.",
        "This lesson covers signing thresholds, hardware security modules versus hot signers, allowance budgets, and legal wrapper options at a high level. Not legal advice: operational security patterns that reduce known failure modes.",
      ),
      sec(
        "Multisig Policy and Signer Hygiene",
        "A multisig (Safe/Gnosis-class) requires m-of-n signatures for outbound transfers. Policy should tier spends: small recurring ops, medium project grants, large strategic moves—with higher thresholds and delays for larger tiers. Single EOA treasurers are unacceptable at scale: one phishing event equals total loss.",
        "Signer diversity means geography, employer, and device separation—not five laptops in one room. Rotation procedures matter when someone leaves the org: remove keys promptly, audit pending transactions.",
      ),
      sec(
        "Streaming, Grants, and Milestones",
        "Token streaming (continuous vesting payouts) improves contributor retention but creates ongoing drain if projects fail—build cancellation rights and cliffs. Milestone grants tie releases to deliverables; milestone-less grants speed experimentation but increase fraud surface.",
        "RACI matrices clarify who proposes, who reviews, who signs, and who publishes transparency reports. Public reporting reduces conspiracy theories and aids recovery after incidents.",
      ),
      sec(
        "Modules, Allowances, and Malicious Extensions",
        "Smart account modules can automate swaps, payroll, or DeFi strategies—and can drain treasuries if malicious or buggy. Treat module installation like production deploys: audit, timelock, monitor events.",
        "Token allowances to routers should be limited and revoked after campaigns. Treasuries have been lost via infinite approvals on hot ops wallets.",
      ),
      sec(
        "Practical Implications and Common Mistakes",
        "Draft a policy for a hypothetical $20M guild: signing tiers, emergency pause, signer compromise playbook, and public disclosure cadence. Pair with legal wrapper awareness—foundations or associations may hold off-chain contracts treasuries reference.",
        "Common mistakes: identical backup seeds; signing on malware-laden laptops; unlimited delegate tokens; sharing screenshots of pending txs in public chats.",
      ),
      sec(
        "Summary",
        "Treasury safety is socio-technical: thresholds, rotations, modules, and transparency. Streaming and grants need kill switches. Map execution power, not just token votes—and rehearse compromise before it happens.",
      ),
    ],
    terms(
      ["Multisig", "Wallet requiring multiple signatures for transactions—m-of-n policy."],
      ["Signer compromise", "Attacker obtaining enough keys to meet threshold—phishing or insider."],
      ["Module", "Smart account extension adding automation—or drain risk if malicious."],
      ["Streaming payout", "Continuous token release to contributors—needs cancellation design."],
      ["RACI", "Responsible/Accountable/Consulted/Informed matrix clarifying treasury roles."],
      ["Emergency pause", "Guardian or multisig ability to halt outflows during incidents."],
    ),
    lessonsById["s3-m2-l2"],
  ),

  "s3-m2-l3": lessonContent(
    [
      sec(
        "Introduction",
        "DAOs want one-person-one-vote but blockchains offer one-key-one-vote—and keys are cheap. Sybil attacks flood airdrops, grants, and quadratic schemes with sock puppets. Pure on-chain reputation is gameable; pure KYC alienates communities. The design space is identity with privacy tradeoffs.",
        "Compare passport-style scores, proof-of-humanity mechanisms, and corporate KYC imports. No silver bullet—only layered mitigations with residual false positives and false negatives.",
      ),
      sec(
        "Sybil Attacks on Incentives",
        "Airdrops reward early addresses; attackers script thousands. Grants committees cannot interview every applicant at scale. Even small per-person payouts become profitable at volume when gas is low—Solana-era farms demonstrated this vividly.",
        "Capital-rich attackers buy aged wallets with history; social-graph defenses assume ties money cannot buy—sometimes false. Document residual risk instead of claiming sybil-proof.",
      ),
      sec(
        "Web2 Identity Imports and Passport Models",
        "Gitcoin Passport-class systems aggregate stamps: social accounts, KYC vendors, on-chain history heuristics. Scores reduce bots at UX cost and privacy cost. Worldcoin-style biometrics trade iris scans for uniqueness—controversial on surveillance grounds.",
        "Proof-of-Humanity video rituals create social recovery networks—expensive to maintain and vulnerable to collusion rings. Each system optimizes different threat models; none replaces operational review for large grants.",
      ),
      sec(
        "ZK Credentials and Privacy",
        "Zero-knowledge credentials can prove 'unique human' or 'accredited' without revealing raw documents—if issuers are trusted and revocation works. Corporate KYC for treasury ops differs from community membership: do not reuse compliance stacks blindly for social governance.",
        "Graph-based reputation (who transacted with whom) leaks privacy and punishes innocents adjacent to flagged addresses—use cautiously in consumer products.",
      ),
      sec(
        "Practical Implications and Common Mistakes",
        "Design a small community reward with two mitigation layers—e.g., passport threshold plus manual spot checks—and state expected false negatives (real humans blocked) and false positives (bots admitted).",
        "Common mistakes: magic AI sybil filters; unlimited referral bonuses; publishing full recipient lists that enable targeting; assuming KYC equals character.",
      ),
      sec(
        "Summary",
        "Sybil resistance is UX, privacy, and economics—not a checkbox. Layer signals, accept residual risk, and scale human review with grant size. Ask what 'one person' means in your jurisdiction and threat model before shipping incentives.",
      ),
    ],
    terms(
      ["Sybil attack", "Many fake identities controlled by one actor to harvest rewards or votes."],
      ["Passport score", "Aggregated trust signals from multiple attestations—tunable threshold."],
      ["False negative", "Legitimate user blocked by anti-sybil rules—social cost."],
      ["ZK credential", "Proof of a claim without revealing underlying personal data."],
      ["Graph reputation", "Scoring based on transaction graph proximity—privacy and bias risks."],
      ["Residual risk", "Attack success probability remaining after chosen mitigations."],
    ),
    lessonsById["s3-m2-l3"],
  ),

  "s3-m3-l1": lessonContent(
    [
      sec(
        "Introduction",
        "Retail users rarely touch order books directly. Custodial apps show a green swap button; behind it may be internal matching, payment for order flow, or delayed settlement. DeFi users sign transactions that settle on-chain with public slippage and MEV exposure. Same word—swap—different trust stacks.",
        "Contrast proof-of-reserves narratives with what they actually attest, and why withdrawal queues reveal insolvency faster than blog posts.",
      ),
      sec(
        "Custodial Matching vs Self-Custody AMM Swaps",
        "Centralized exchanges maintain internal ledgers; deposits are IOUs until withdrawn on-chain. Trades are database updates—fast, reversible under policy, censored if compliance requires. Users trust segregation policies, solvency, and operational security of API keys.",
        "DEX swaps move assets wallet-to-pool with deterministic rules; failures are tx-level, not support tickets. Slippage tolerances and price impact are user-visible; mistakes are irreversible. MEV bots may reorder surrounding blocks—structural tax, not optional tip culture alone.",
      ),
      sec(
        "Proof of Reserves and Liability Gaps",
        "PoR shows client asset addresses and claimed liabilities at a snapshot. It rarely proves full liability enumeration (margin, internal accounts, double-counted cold wallets) or ongoing solvency. Liability oracles are aspirational—harder than asset proofs.",
        "Attestations can miss insolvency if liabilities are hidden or if loans between related entities net incorrectly. Ask refresh cadence, who audits, and whether user balances are included individually or only in aggregate.",
      ),
      sec(
        "Withdrawal Queues and Bank-Run Geometry",
        "When many users withdraw simultaneously, exchanges throttle—queue time is a market signal. On-chain congestion is a different queue: high gas and failed txs, not insolvency—unless bridges or wrapped assets break peg.",
        "Segregation of customer assets is policy plus jurisdiction; bankruptcy proceedings may commingle despite marketing. Self-custody removes exchange credit risk, replaces it with key-loss risk.",
      ),
      sec(
        "Practical Implications and Common Mistakes",
        "Read one PoR publication critically: list five questions an auditor would still ask—liability completeness, loan encumbrance, related-party wallets, stale snapshots, and user-level verifiability.",
        "Common mistakes: equating registered license with segregated assets; keeping life savings on exchange for yield; ignoring API key permissions as hot-surface risk.",
      ),
      sec(
        "Summary",
        "CeFi swaps are IOU updates with policy reversibility; DeFi swaps are signed settlements with MEV and slippage. PoR is partial optics; withdrawal behavior is stress data. Choose custody consciously per use case—not by slogan.",
      ),
    ],
    terms(
      ["Internal ledger", "Exchange database tracking user balances off-chain."],
      ["Proof of reserves", "Snapshot attestation of assets vs claimed client liabilities."],
      ["Liability gap", "Difference between proven assets and complete obligation listing."],
      ["Price impact", "Market movement caused by trade size on AMM curve—distinct from slippage tolerance."],
      ["Withdrawal queue", "Throttling outbound transfers during liquidity stress."],
      ["Segregation", "Policy separating customer assets from operator balance sheet—varies by jurisdiction."],
    ),
    lessonsById["s3-m3-l1"],
  ),

  "s3-m3-l2": lessonContent(
    [
      sec(
        "Introduction",
        "Markets are infrastructure: listings, liquidity, oracles, and perps funding co-determine manipulation surfaces. Thin floats make charts lie; oracle latency makes liquidations tradable events. DAOs listing tokens should think like market integrity officers, not cheerleaders.",
        "Name patterns—wash trading, spoofing analogues, oracle front-runs—and connect them to on-chain observables without offering legal conclusions.",
      ),
      sec(
        "Listing Incentives and Thin Markets",
        "Listing fees, market maker deals, and launchpad economics align platforms with volume, not truth. New tokens often launch with concentrated supply and incentivized liquidity that decays—charts look explosive then hollow.",
        "Integrity checklists should cover lock disclosures, market maker agreements, monitoring for circular wallets, and escalation when volume spikes without holder growth.",
      ),
      sec(
        "Oracles, TWAPs, and Liquidation Games",
        "Lending protocols liquidate on oracle prices; attackers may move thin spot markets briefly if oracle aggregates are manipulable. Time-weighted average prices (TWAP) reduce spike sensitivity but lag fast crashes—design tradeoff, not cure-all.",
        "Perpetual funding links long/short imbalance to periodic payments—another attention market tied to oracle truth.",
      ),
      sec(
        "MEV as Structural Tax",
        "Maximal extractable value reordering affects DEX users and liquidations alike. Private RPC products sell mitigation—not elimination. Treat MEV as cost line in execution hygiene, especially on Ethereum L1; Solana has distinct priority-fee dynamics during mints.",
        "Market integrity briefs for partners should be operational: monitoring scripts, alert thresholds, communication tree— not securities law memos.",
      ),
      sec(
        "Practical Implications and Common Mistakes",
        "High volume can mislead when self-trades dominate; pair volume with unique traders, holder dispersion, and liquidity depth at realistic trade sizes.",
        "Common mistakes: trusting leaderboard rankings without methodology; ignoring oracle source diversity; assuming CEX listings imply diligence.",
      ),
      sec(
        "Summary",
        "Manipulation is a market-structure problem expressed on-chain. Listings and incentives shape honesty; oracles connect trading games to lending bombs. Build monitoring and escalation before liquidity crises, not after Twitter outrage.",
      ),
    ],
    terms(
      ["Wash trading", "Same entity buying and selling to inflate volume without net risk transfer."],
      ["Oracle front-run", "Trading ahead of known oracle update that will trigger liquidations."],
      ["TWAP", "Time-weighted average price smoothing short spikes in oracle feeds."],
      ["Thin market", "Low depth where small trades move price disproportionately."],
      ["Funding rate", "Periodic perp payment balancing long vs short open interest."],
      ["MEV", "Profit from transaction ordering and insertion in a block—user cost."],
    ),
    lessonsById["s3-m3-l2"],
  ),

  "s3-m3-l3": lessonContent(
    [
      sec(
        "Introduction",
        "This is not tax advice. It is record-keeping literacy: public blockchains create durable receipts, but they do not label events in your jurisdiction's language. Traders and DAOs alike drown in ambiguous categories—swaps, bridges, airdrops, staking rewards—each debated by accountants worldwide.",
        "Learn what records exist on-chain, why cost basis breaks across chains, and how to build conservative workflows that flag uncertainty instead of hiding it.",
      ),
      sec(
        "Taxable Event Categories (Public Discourse Level)",
        "Commonly discussed categories include: disposing of crypto for fiat or goods, trading one token for another, receiving income-like rewards (mining, staking, some airdrops), and earning interest or referral payments. Timing of recognition for staking rewards varies by authority and interpretation—document your rule set with professional help.",
        "Hard forks and airdrops may be ordinary income at receipt in some frameworks, or untaxed until disposal—jurisdiction dependent. The blockchain shows receipt; it does not show basis.",
      ),
      sec(
        "Chain-Hopping, Bridges, and Basis Tracking",
        "Bridging often looks like send on chain A, receive wrapped asset on chain B—same economic position, messy records. Without bridge receipts and timestamps, cost basis chains break. NFTs add royalty and mint fee lines easy to miss in exports.",
        "FIFO vs specific identification methods change gains when you sell partial lots—software defaults may not match your election. Privacy tools complicate audit trails; transparency to yourself is separate from public chain privacy.",
      ),
      sec(
        "Conservative Workflow Design",
        "Spreadsheet or tooling schema should capture: timestamp, chain, tx hash, in/out assets, quantities, USD mark (source noted), fees, counterparty label, bridge id, and confidence level. Maintain a 'known gaps' section for unresolved bridges or missing prices.",
        "Weekly hygiene beats year-end panic: reconcile hot wallets used for trading, separate long-hold cold storage, export CSVs from explorers and CEXs with matching time zones.",
      ),
      sec(
        "Practical Implications and Common Mistakes",
        "Design a multi-chain ledger template with example rows and explicit bridge ambiguity flags—no legal conclusions, only operational completeness.",
        "Common mistakes: ignoring fees in gain calc; assuming stablecoins never create events; losing CSV history when exchanges shut down; treating memecoin dust as zero without documentation.",
      ),
      sec(
        "Summary",
        "On-chain transparency does not equal tax clarity. Build records that survive bridges and airdrops; mark uncertainties; consult professionals for elections. Conservative documentation reduces panic, not necessarily liability—that is law-specific.",
      ),
    ],
    terms(
      ["Cost basis", "Reference value used to compute gain/loss on disposal—method matters."],
      ["Taxable event", "Transaction type authorities may treat as income or disposal—jurisdiction-specific."],
      ["Bridge receipt", "Proof linking outbound and inbound legs across chains—often manual."],
      ["FIFO", "First-in-first-out lot matching method for sales."],
      ["Mark price", "USD valuation at event time—document source and timestamp."],
      ["Known gaps", "Explicit list of transactions lacking complete data—audit honesty."],
    ),
    lessonsById["s3-m3-l3"],
  ),

  "s3-m4-l1": lessonContent(
    [
      sec(
        "Introduction",
        "Rugs are not only smart-contract tricks. Many exits are social: anonymous teams, impossible roadmaps, manufactured urgency, and liquidity that never existed beyond narrative. Education here builds pattern recognition—not witch hunts against living projects by name.",
        "Learn ten recurring social red flags, why 'doxxed team' is insufficient, and what healthy mint disclosures look like in a trust-minimized framing.",
      ),
      sec(
        "Hype Cycles and Attention Extraction",
        "Hype compresses diligence into countdown timers: whitelist frenzies, influencer threads, Discord growth charts. Attention is the product; token or NFT supply is the extraction mechanism. When utility claims are unfalsifiable ('metaverse integration soon'), no on-chain test can disprove them until time passes.",
        "Secondary royalty dependence makes projects fragile when marketplaces make fees optional—social rugs can also be slow bleeds, not single events.",
      ),
      sec(
        "Teams, Anonymity, and Burden of Proof",
        "Anonymous founders are not automatic scammers—but they shift burden of proof to code and timelocks. Doxxing photos can be rented; LinkedIn profiles can be fake. Weight verifiable fund flows: multisig recipients, vesting, and upgrade keys more than faces.",
        "Influencer payola without disclosure is a regulatory and ethical risk zone—extract story beats from public enforcement postmortems, not gossip threads.",
      ),
      sec(
        "Healthy Disclosure Minimum",
        "Before mint, reasonable disclosures include: contract ownership status, metadata mutability, treasury recipients, timelock schedule, and liquidity plans post-mint. Urgency without transparency is a feature of extraction funnels.",
        "Discord and social admin compromises on mint eve are common attack paths—operational security is part of collector risk.",
      ),
      sec(
        "Practical Implications and Common Mistakes",
        "Build flashcards: benign marketing line on front, investigator questions on back. Summarize three checks you would never skip for a client—e.g., treasury multisig, metadata freeze proof, liquidity lock verifiability.",
        "Common mistakes: fixed supply worship; conflating hype volume with organic demand; treating celebrity RT as diligence; ignoring refundable vs final mint mechanics.",
      ),
      sec(
        "Summary",
        "Social rugs exploit time pressure and unfalsifiable promises. Doxxing is weak evidence; fund flows and keys are stronger. Your output is questions that change minds when answered poorly—not verdicts shouted on timeline.",
      ),
    ],
    terms(
      ["Social rug", "Exit relying on marketing and trust collapse more than contract trickery."],
      ["Unfalsifiable utility", "Roadmap claim with no on-chain test available before funds move."],
      ["Mint disclosure", "Pre-launch transparency on funds, keys, and metadata rules."],
      ["Timelock", "Contract delay before admin actions execute—commitment device."],
      ["Payola", "Undisclosed paid promotion presented as organic endorsement."],
      ["Burden of proof", "Evidence standard shifted when teams are anonymous or unverifiable."],
    ),
    lessonsById["s3-m4-l1"],
  ),

  "s3-m4-l2": lessonContent(
    [
      sec(
        "Introduction",
        "Technical diligence reads contracts and metadata pipelines without accusing thin projects by default. Established collections can still have legacy admin keys; thin projects may be honest experiments. Side-by-side checklists beat single-score 'safety ratings.'",
        "Focus on mutability, verification, copymints, and transfer hooks that behave like honeypots.",
      ),
      sec(
        "Metadata Mutability and Post-Mint Switches",
        "If tokenURI or on-chain metadata can update, creators can replace art after sale. Marketplaces may still show the old image until refresh—holders must verify contract rules, not thumbnails.",
        "Frozen metadata should be proven in verified source or immutable storage patterns—not inferred from marketing.",
      ),
      sec(
        "Verification, Proxies, and Owner Functions",
        "Verified source on explorers lets readers audit mint caps, royalties, pause, and withdraw functions. Proxy patterns delegate logic to implementations upgradeable by admin—trace both proxy and implementation.",
        "Owner functions like setBaseURI, wallet mint, or pause are not evil—they are power. Map who holds owner and whether it is renounced meaningfully or merely transferred to another EOA.",
      ),
      sec(
        "Copymints and Honeypot Transfers",
        "Copymints squat similar names and unverified collections—compare contract addresses, not titles. Honeypot NFTs or tokens block selling while allowing buys; test with small sells on secondary when possible or read transfer restrictions in bytecode.",
        "Solana Metaplex-style metadata differs from Ethereum tokenURI—compare chain-specific verification docs; 'verified' badges differ by marketplace policy.",
      ),
      sec(
        "Practical Implications and Common Mistakes",
        "Run the same checklist on one established and one thin collection; write residual trust paragraphs when unknowns remain. Skills matter more than verdicts.",
        "Common mistakes: trusting marketplace badges alone; ignoring proxy admins; skipping sell-side tests; assuming IPFS means immutable without pinning plan.",
      ),
      sec(
        "Summary",
        "Technical tells are powers and pointers, not vibes. Mutability and admin keys define long-term collector risk. Verification is reading; copymints are address discipline. Document unknowns instead of performing confidence.",
      ),
    ],
    terms(
      ["Mutable metadata", "Updatable URI or on-chain fields allowing post-mint content changes."],
      ["Verified source", "Explorer-published contract code matching deployed bytecode."],
      ["Proxy contract", "Delegatecall shell pointing at upgradeable implementation logic."],
      ["Copymint", "Counterfeit or confusing collection mimicking a legitimate project."],
      ["Honeypot", "Asset allowing buys but blocking sells via transfer restrictions."],
      ["Residual trust", "Risk accepted when technical answers cannot be determined from public data."],
    ),
    lessonsById["s3-m4-l2"],
  ),

  "s3-m4-l3": lessonContent(
    [
      sec(
        "Introduction",
        "Floor price and volume are the vanity metrics of NFT markets—easy to manufacture on low-fee chains. Collectors and advisors need plain-language education on wash trading, holder concentration, and royalty-off volume migrations without absolutist 'never buy' rhetoric.",
        "Learn definitions, cautious heuristics, and support-FAQ style explanations for nervous clients.",
      ),
      sec(
        "Wash Trading On-Chain",
        "Wash trading is self-dealing between related wallets to print volume and imply demand. Low fees enable high-frequency noise; analytics firms estimate wash share with heuristics—false positives and negatives exist, read methodology.",
        "Marketplaces historically ranked by volume—incentives aligned with inflation, not truth. Royalties becoming optional shifted liquidity across venues, distorting comparability.",
      ),
      sec(
        "Floor Price Theater",
        "Floor is the cheapest listed item, not the clearing price of the market. A single inexpensive listing can drag floor while no one trades there; conversely, sweeping floors with insider wallets signals strength artificially.",
        "Pair floor moves with sales distribution: median sale, unique buyers, and time since last organic trade.",
      ),
      sec(
        "Holder Concentration and Airdrop Distortions",
        "Top-10 holder percentage is heuristic—exchanges and custody break interpretation. Still, extreme concentration plus young wallets suggests insider supply or bot farms.",
        "Free mints attract sybil holders who never return; holder count alone misleads. Metrics harder to fake than raw volume include unique minters at fair launch with sustained secondary breadth—but nothing is perfect.",
      ),
      sec(
        "Practical Implications and Common Mistakes",
        "Draft a one-page client handout explaining why volume and floor are gameable, with three ASCII-described charts: wash loop, floor sweep, holder cliff.",
        "Common mistakes: leaderboard obsession; ignoring marketplace fee regime changes; comparing ETH and Solana volume without fee context; treating holder count as community quality.",
      ),
      sec(
        "Summary",
        "Volume and floor are marketing weapons. Teach clients to ask for unique traders, sales depth, and methodology behind dashboards. Honest education reduces panic without pretending markets are fair.",
      ),
    ],
    terms(
      ["Wash trading", "Circular trades between controlled wallets to inflate activity metrics."],
      ["Floor price", "Lowest active listing price—not necessarily last trade value."],
      ["Unique traders", "Distinct addresses buying/selling excluding known wash heuristics."],
      ["Holder concentration", "Share of supply held by top wallets—interpret with custody caveats."],
      ["Volume migration", "Liquidity moving across marketplaces when fee policies change."],
      ["Methodology", "Explicit rules analytics firms use—always ask before trusting scores."],
    ),
    lessonsById["s3-m4-l3"],
  ),

  "s3-m5-l1": lessonContent(
    [
      sec(
        "Introduction",
        "24/7 markets amplify psychology: FOMO, revenge trading, and sleep-deprived signing are feature bugs of global crypto. This lesson is risk framing and discipline—not investment advice. Separate capital you can lose from capital you cannot; write rules before entries, not after drawdowns.",
        "Leverage magnifies emotional failure modes; behavioral biases from traditional finance reappear with Discord notifications attached.",
      ),
      sec(
        "Position Sizing and Written Plans",
        "A personal trading policy states max risk per trade, per theme, and per day; defines when leverage is forbidden; and sets cool-off periods after losses. Sharing a redacted version with a financial planner clarifies intent versus gambling.",
        "Invalidation criteria should be one sentence testable on-chain or on-chart—if invalidation hits, exit without negotiating with past self.",
      ),
      sec(
        "Leverage, Perps, and Cognitive Biases",
        "Leverage turns small moves into account wipes; funding and liquidation fees are costs absent from spot memes. Biases to map: overconfidence after wins, loss aversion causing bag-holding, herd following KOLs, and availability from vivid hack headlines.",
        "Dollar-cost averaging vs lump sum is a planning debate—document assumptions, don't evangelize one true way.",
      ),
      sec(
        "Cold vs Hot Wallet Segmentation",
        "Trading float on hot wallets bounds incident blast radius; long savings on cold hardware with different seed. Automation helps DCA; automation hurts when strategies are unreviewed scripts on compromised machines.",
        "Sleep and timezone asymmetry matter: announcements drop during your night; policy can forbid trading outside windows.",
      ),
      sec(
        "Practical Implications and Common Mistakes",
        "Design a trade journal schema: thesis, invalidation, entry/exit, fees, slippage, emotional tag, lesson learned—with example redacted row for Solana and EVM.",
        "Common mistakes: scaling size after wins only; moving stop-loss farther when wrong; trading to 'get back to even'; conflating investing stack with degen wallet.",
      ),
      sec(
        "Summary",
        "Discipline is pre-commitment: sizing, plans, segmentation, sleep. Leverage is optional self-harm for many retail profiles. Journal reality—including fees and feelings—to learn without funding denial.",
      ),
    ],
    terms(
      ["Position sizing", "Allocating capital per trade consistent with risk tolerance."],
      ["Invalidation", "Predefined condition that exits a thesis—written before entry."],
      ["Revenge trading", "Increasing risk after losses to recover emotionally—destructive pattern."],
      ["Trading float", "Hot-wallet capital designated for active trading only."],
      ["Loss aversion", "Bias toward holding losers too long to avoid realizing pain."],
      ["Cool-off period", "Mandatory pause after loss streaks or rule violations."],
    ),
    lessonsById["s3-m5-l1"],
  ),

  "s3-m5-l2": lessonContent(
    [
      sec(
        "Introduction",
        "Execution hygiene is where security meets trading: slippage settings, approvals, MEV, and wallet simulations each reduce—but do not eliminate—drain risk. Malicious sites craft txs that look like swaps while sweeping allowances; simulations miss state-dependent traps.",
        "Not advice on settings—education on concepts so you can choose least-privilege habits per chain.",
      ),
      sec(
        "Slippage and Price Impact",
        "Price impact is how much your trade moves the pool curve; slippage tolerance is the maximum deviation you accept before revert. Wide slippage on illiquid pairs invites sandwich attacks—50% tolerance is almost never appropriate outside deliberate degen experiments with sized-down risk.",
        "Solana failed transactions still cost fees during congested mints; Ethereum benefits from understanding private RPC offerings and their trust tradeoffs.",
      ),
      sec(
        "Approvals and Least Privilege",
        "ERC-20 infinite approvals persist until revoked—convenient, dangerous. Prefer per-tx limits where wallets support it; schedule revoke.cash-class audits on hot wallets. Separate NFT and fungible trading wallets.",
        "Blind signing on hardware wallets means approving calldata you did not read—policy: verify destination and spender on screen or use transaction preview tools knowing limits.",
      ),
      sec(
        "Simulation Limits and Malicious UX",
        "Wallet simulations model common paths; they may not capture malicious callbacks, upgradeable proxies changing between preview and execution, or phishing addresses with homoglyphs. Official sites get compromised; bookmarks beat search clicks.",
        "Revoke tools are hygiene, not paranoia—pair with allowance budgets after campaigns.",
      ),
      sec(
        "Practical Implications and Common Mistakes",
        "Tier a revoke plan on a test wallet: critical unlimited spenders first, dormant protocols later. Narrate for a client why recurring audits matter.",
        "Common mistakes: approving unknown tokens during airdrop claims; copying addresses from Discord images; trusting green checkmarks in wallet UI; using same wallet for mints and savings.",
      ),
      sec(
        "Summary",
        "Execution risk is MEV plus approvals plus human factors. Tight slippage, limited approvals, segmented wallets, and skeptical reading of simulations beat any single tool brand. Practice revokes before you need them urgently.",
      ),
    ],
    terms(
      ["Slippage tolerance", "Maximum acceptable execution price deviation before transaction reverts."],
      ["Price impact", "Pool price movement caused by trade size itself."],
      ["Infinite approval", "Allowance granting contract unlimited spend of a token until revoked."],
      ["Sandwich attack", "MEV trade wrapping user swap to extract value from slippage."],
      ["Blind signing", "Approving transactions without understanding full calldata effects."],
      ["Simulation", "Wallet pre-execution model of outcomes—helpful, incomplete."],
    ),
    lessonsById["s3-m5-l2"],
  ),

  "s3-m5-l3": lessonContent(
    [
      sec(
        "Introduction",
        "Staying current without living on algorithmic feeds is a skill: primary sources, release calendars, and cross-verification before signing urgent transactions. Deepfake support calls and compromised official Discords move faster than most users' checklists.",
        "Build an information diet for one ecosystem plus a weekly hygiene routine suitable for busy clients.",
      ),
      sec(
        "Primary Sources vs Algorithmic Feeds",
        "Protocol blogs, GitHub releases, validator/client changelogs, and status pages outperform rumor aggregators for upgrade truth. RSS and mailing lists reduce doomscrolling compared to infinite social feeds—curate three recurring sources, not thirty.",
        "Regulatory headlines differ from rule text: read actual notices when jurisdiction matters; journalists summarize under time pressure.",
      ),
      sec(
        "Cross-Verification Before Acting",
        "Urgent 'bridge paused' or 'claim now' posts demand multi-channel confirmation: official status page, multiple core team members on distinct platforms, on-chain pause flags. Attackers time phishing to real incidents—hybrid truth plus fake link.",
        "Who profits when you FOMO on a headline? Often marketers and attackers, rarely you.",
      ),
      sec(
        "Weekly Hygiene Routine",
        "Sample routine: rotate through hot wallet approvals, check pending governance votes affecting assets you hold, skim status pages for chains you use, update local notes on breaking changes, and practice panic-button steps—close tabs, verify URL, reject unexpected connect prompts.",
        "Incident response communication from protocols varies; note which teams historically disclosed quickly vs silenced—pattern not promise.",
      ),
      sec(
        "Practical Implications and Common Mistakes",
        "Write a 30-day information diet plan with escalation when sources conflict, plus panic checklist before signing unexpected transactions.",
        "Common mistakes: trusting Telegram 'support'; screenshot DMs as proof; following look-alike domains; disabling brain during mint hour.",
      ),
      sec(
        "Summary",
        "Signal is primary, verified, and paced. Noise is urgent and profitable for others. Routines beat heroics; cross-check before sign; keep upgrade calendars on your calendar—not only your feed.",
      ),
    ],
    terms(
      ["Primary source", "Official channel publishing first-party protocol or issuer statements."],
      ["Cross-verification", "Confirming claims via independent authoritative channels before acting."],
      ["Status page", "Service health and incident timeline hosted by operators."],
      ["Information diet", "Curated, bounded set of news inputs to reduce noise."],
      ["Panic button checklist", "Predefined steps when seeing urgent crypto news or prompts."],
      ["Hybrid attack", "Real incident used as cover for phishing with malicious links."],
    ),
    lessonsById["s3-m5-l3"],
  ),

  "s3-m6-l1": lessonContent(
    [
      sec(
        "Introduction",
        "CEX vs DEX is not a moral contest—it is custody, trust, liquidity, and failure-mode tradeoffs. Centralized venues optimize fiat ramps, support, and throughput; decentralized venues optimize self-custody settlement with on-chain risks. Retail chooses mixtures; advisors map questions, not slogans.",
        "List CEX-specific failures (insolvency, account freeze, API key theft) and DEX-specific failures (key loss, MEV, malicious contracts) without villain narratives.",
      ),
      sec(
        "Custody and Counterparty Risk",
        "CEX custody means the exchange can freeze, delay, or lose funds operationally or legally. Self-custody means you can lose keys irreversibly—no chargeback desk. KYC perimeters apply to CEX; DEX pseudonymity varies by jurisdiction and on-ramps used.",
        "Proof-of-reserves mitigates some insolvency opacity but does not replace withdrawal tests at sizes you care about.",
      ),
      sec(
        "Liquidity, Internalization, and Execution",
        "CEX order books may internalize flow—price improvement for users, conflicts for transparency seekers. DEX aggregators route across pools; displayed depth on one pool misleads if routers split paths. Toxic flow concepts appear on both sides differently.",
        "Bank-run pauses differ from chain congestion: know which 'cannot withdraw' story you are living.",
      ),
      sec(
        "API Keys, Subaccounts, and Recovery",
        "CEX API keys with withdraw permissions are hot secrets—distinct from seed phrases, equally stealable. Subaccounts help segregation for funds vs trading bots. DEX has no password reset—social recovery is experimental and trust-laden.",
        "User error recovery: CEX may reverse under fraud policies; DEX sends to wrong address are final.",
      ),
      sec(
        "Practical Implications and Common Mistakes",
        "Build CEX vs DEX matrix: custody, KYC, fees, insolvency risk, MEV/slippage, listing quality, error recovery—with decision questions, not 'always use X.'",
        "Common mistakes: keeping all assets on CEX for yield; using DEX while infected with clipboard malware; ignoring geographic licensing limits.",
      ),
      sec(
        "Summary",
        "Choose venues per job: fiat on-ramp, active trading, long hold. CEX risks are institutional; DEX risks are protocol and key-based. Non-custodial does not mean safe—it means nobody can freeze except attackers and your mistakes.",
      ),
    ],
    terms(
      ["Self-custody", "User controls keys; no intermediary can move funds by policy."],
      ["Counterparty risk", "Chance your exchange, bridge, or issuer fails to honor obligations."],
      ["Internalization", "CEX matching customer orders against house inventory."],
      ["Aggregator", "Router splitting DEX trades across pools for best execution."],
      ["Bank run", "Mass withdrawals overwhelming exchange liquidity—queues signal stress."],
      ["Key loss", "Irreversible loss of signing keys with no recovery center on true self-custody."],
    ),
    lessonsById["s3-m6-l1"],
  ),

  "s3-m6-l2": lessonContent(
    [
      sec(
        "Introduction",
        "Research tools are lenses, not oracles. Aggregators disagree on price and circulating supply; label databases mis-tag wallets; scanners false-positive on benign proxies. A durable 'research OS' categorizes tools by what they can prove, what they cannot, and privacy or paywall caveats.",
        "Tools evolve; category logic persists—price, TVL, explorers, security heuristics, memecoin monitors, RWA disclosures.",
      ),
      sec(
        "Price, Supply, and Metadata Aggregators",
        "CoinGecko and CoinMarketCap-class sites index self-reported listings and supply math games—circulating vs fully diluted valuations need manual scrutiny. Thin float tokens can show nonsense market caps from last trade times price.",
        "Cross-check two aggregators; read how they define circulating supply and whether staking-locked tokens count.",
      ),
      sec(
        "TVL, Dashboards, and Labeled Analytics",
        "DeFiLlama and Token Terminal-class metrics depend on TVL definitions—double-counted staking, gift liquidity, and emissions-denominated 'revenue' distort charts. Dune and Flipside dashboards are creator-made: verify SQL, not screenshots.",
        "Arkham and Nansen-class labeling uses heuristics—false positives on shared CEX deposits; subscription bias toward whale watching.",
      ),
      sec(
        "Explorers, Memecoin Monitors, Security Scanners, RWA Sources",
        "Etherscan family and Solscan show internal txs, token approvals, program logs—skills beat UI colors. Birdeye and DexScreener-class tools highlight pair age and liquidity for Solana memecoins—pair age is not audit.",
        "GoPlus and Token Sniffer-class scanners heuristically flag mintable supply, honeypots, proxies—treat as triage, not verdict. RWA orientation: rwa.xyz, protocol docs, EDGAR for US wrappers—law ≠ chain.",
        "Revoke.cash-class tools belong in every active trader section. Sentiment feeds (LunarCrush-class) show correlation theater—interesting, not causal.",
      ),
      sec(
        "Practical Implications and Common Mistakes",
        "Build a living doc with ≥25 sources across Token/Memecoin/RWA/NFT categories, each with good-for / cannot-prove / privacy notes. Script a five-minute tour outline for a client onboarding.",
        "Common mistakes: single-source diligence; trusting market cap rankings; ignoring paid data bias; skipping explorer approval tabs.",
      ),
      sec(
        "Summary",
        "Stack tools by question type. No dashboard answers 'should I trust this team'—only you with process can. Document disagreements between tools as signals of uncertainty worth resolving.",
      ),
    ],
    terms(
      ["Circulating supply", "Tokens counted as liquid per aggregator rules—often debated."],
      ["TVL", "Total value locked metric—definition varies by protocol and dashboard."],
      ["Heuristic label", "Best-guess wallet tag from clustering—not ground truth identity."],
      ["Pair age", "Time since DEX pool creation—memecoin risk signal, not proof of safety."],
      ["Scanner false positive", "Benign contract flagged by pattern matching—verify manually."],
      ["Research OS", "Personal documented stack of tools with explicit limits per category."],
    ),
    lessonsById["s3-m6-l2"],
  ),

  "s3-m6-l3": lessonContent(
    [
      sec(
        "Introduction",
        "Memecoins and RWAs share blockspace but not evidence bars. Memecoins reward speed, liquidity games, and social reflexivity; RWAs reward legal enforceability, issuer ops, and oracle truth about off-chain collateral. Same skepticism muscle, different checklists.",
        "Draft both checklists and reflect on false positives when rigid rules block legitimate experiments.",
      ),
      sec(
        "Memecoin Quick Diligence",
        "Pattern language only: inspect deployer history, liquidity lock or burn claims, sniper wallet share at launch, metadata mutability, migration rug patterns on launchpads, and social channel compromise risk. Liquidity lock can be illusory if unlock keys or single-sided liquidity tricks apply.",
        "Bonding curves and launchpad migrations change where risk sits—read the venue docs, not only the token page.",
      ),
      sec(
        "RWA Quick Diligence",
        "Ask issuer identity, trustee, bankruptcy remoteness, redemption rights, oracle for NAV, permissioned transfer restrictions, and jurisdiction. 'Backed by Treasuries' on a website < attestations + filings + legal opinions where available.",
        "Upgrade keys on permissioned tokens can freeze or seize—compliance feature and investor risk.",
      ),
      sec(
        "Cross-Over Scams and Regulatory Fragmentation",
        "Fake RWAs mint without legal structure; serious RWAs trade with different wrapper risk per chain. Regulatory headlines do not uniformize token behavior globally.",
        "If oracle lies about off-chain collateral, on-chain cleanliness does not save you—RWA failure is often oracle and legal, not contract syntax.",
      ),
      sec(
        "Practical Implications and Common Mistakes",
        "Write one-page Memecoin and RWA checklists; apply hypothetically to public narratives without pump symbols; 600-word reflection on checklist false positives.",
        "Common mistakes: believing liquidity lock screenshots; ignoring KYC/AML on RWA redemption; treating memecoin speed as skill edge without loss limits.",
      ),
      sec(
        "Summary",
        "Memecoins: on-chain liquidity and deployer games dominate. RWAs: legal and oracle truth dominate. Use the right checklist; acknowledge neither catches everything. Skepticism is procedural, not cynical.",
      ),
    ],
    terms(
      ["Liquidity lock", "LP tokens time-locked or burned—verify contract holding keys."],
      ["Migration rug", "Launchpad liquidity moved maliciously during pool migration."],
      ["Bankruptcy remoteness", "Legal structure isolating assets from issuer insolvency."],
      ["NAV oracle", "Feed reporting net asset value of off-chain collateral."],
      ["Permissioned token", "Transfer restricted asset complying with securities/AML rules."],
      ["False positive", "Checklist flagging a legitimate project—cost of rigid rules."],
    ),
    lessonsById["s3-m6-l3"],
  ),
};
