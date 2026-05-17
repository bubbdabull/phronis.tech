import { SEMESTER_04 } from "../semester-04";
import { lessonContent, sec, terms } from "./helpers";
import type { LessonReadContent } from "./types";

const lessonsById = Object.fromEntries(
  SEMESTER_04.modules.flatMap((m) => m.lessons).map((lesson) => [lesson.id, lesson]),
);

export const SEMESTER_04_CONTENT: Record<string, LessonReadContent> = {
  "s4-m1-l1": lessonContent(
    [
      sec(
        "Introduction",
        "Automated market makers (AMMs) replaced order books for many on-chain assets because continuous liquidity from a bonding curve is easier to bootstrap than two-sided limit order books in a high-latency, costly-execution environment. The constant-product invariant x·y=k is the simplest story: two reserves multiply to a constant, so every swap moves price along a hyperbola and charges the pool for rebalancing risk.",
        "This lesson builds intuition without deriving calculus: you will explain price impact to a trader, describe impermanent loss in words that respect their PnL spreadsheet, and contrast Uniswap v2-style full-range liquidity with concentrated liquidity's capital efficiency and new footguns.",
      ),
      sec(
        "The x·y=k Story and Arbitrage",
        "Imagine a pool holding token X and token Y. Traders swap against the pool, not against each other directly. When someone buys X, they deposit Y and remove X; the pool's ratio shifts, so the marginal price of X in terms of Y rises. The invariant says the product of reserves stays on the curve (before fees). Fees increase k slowly over time, paying liquidity providers (LPs) for bearing inventory risk.",
        "Off-chain prices on centralized exchanges can diverge from the pool price for minutes. Arbitrageurs close the gap by trading against the pool until marginal price matches external markets minus gas, fees, and latency. That arbitrage is not a bug—it is the mechanism that keeps the AMM quote honest. When arbitrage fails (illiquid pool, paused chain, broken bridge asset), the pool price becomes a stale oracle with real economic consequences.",
        "Price impact is the slippage you cause by your own trade size relative to depth. Small trades in deep pools barely move price; large trades in thin pools walk the curve aggressively. Users confuse 'slippage tolerance' in wallets with 'free money if price moves favorably'—tolerance is a safety cap on worst-case execution, not a target.",
      ),
      sec(
        "Impermanent Loss and Who Earns Fees",
        "Impermanent loss (IL) describes how providing liquidity in two volatile assets can underperform simply holding those assets, even when fees accrue. If one asset moons against the other, the pool automatically sells the winner and buys the loser to maintain balance—exactly the wrong direction for a directional bet. Fees and incentives can compensate, but IL is not 'always bad' or 'always good'; it is a comparison against HODL under a correlation and volatility assumption.",
        "LP economics improve when volume is high relative to volatility and when pairs are correlated (stable-stable) or mean-reverting. Toxic flow—informed traders picking off stale quotes—transfers value from LPs to arbitrageurs. Fee tiers (0.01%, 0.05%, 0.3%, 1%) segment pools by expected volatility and flow toxicity. Treasury committees should ask who trades the pool and why, not only headline APY from emissions.",
      ),
      sec(
        "Concentrated Liquidity and v2 vs v3 UX",
        "Concentrated liquidity lets LPs deposit within a price band, multiplying capital efficiency when price stays in range. Out-of-range positions earn no fees and behave like single-sided exposure until price returns. Active management becomes a job: rebalancing ranges, gas costs, and tax events. Retail UX that hides range selection behind defaults still leaves users exposed when price trends one way for months.",
        "TWAP oracles derived from pool observations trade freshness for manipulation resistance over short windows. Manipulating a spot pool for one block is cheap relative to manipulating a time-weighted average over hours—designers choose windows based on attacker budget and application sensitivity. MEV sandwiches around user swaps preview how ordering affects execution quality; AMMs do not eliminate MEV, they change where it is extracted.",
      ),
      sec(
        "Practical Implications",
        "Before LPing, model three scenarios: correlated drift, divergence, and crash. Compare fee APR to IL under each. For treasuries, treat pool tokens as inventory with mark-to-market and redemption liquidity, not passive yield. Educate users that 'APR' often mixes trading fees, governance tokens, and emissions with different risk and lockup profiles.",
      ),
      sec(
        "Summary",
        "AMMs price swaps via bonding curves maintained by arbitrage. LPs sell convexity to traders and earn fees for it; IL is the HODL comparison, not a moral slogan. Concentrated liquidity trades capital efficiency for active management and range risk. Oracles and MEV link AMM design to systemic safety—pools are both markets and data sources.",
      ),
    ],
    terms(
      ["Constant product AMM", "Pool where reserve product x·y=k (plus fees) determines swap pricing along a curve."],
      ["Price impact", "Execution price movement caused by your trade size relative to available depth."],
      ["Impermanent loss", "LP underperformance vs holding the same assets due to rebalancing along price moves."],
      ["Arbitrage", "Trading that aligns pool price with external markets, enforcing curve correctness."],
      ["Concentrated liquidity", "LP capital deployed within a chosen price band for higher efficiency when in range."],
      ["TWAP oracle", "Time-weighted average price from pool observations, harder to manipulate than single-block spot."],
    ),
    lessonsById["s4-m1-l1"],
  ),

  "s4-m1-l2": lessonContent(
    [
      sec(
        "Introduction",
        "Liquidity bootstrapping pools (LBPs) and auction-like launches attempt to discover price on-chain while distributing tokens to communities. Marketing calls them 'fair launches,' but public mempools, bot latency, and information asymmetry mean fairness is always conditional on threat model and disclosure.",
        "You will describe how auction curves move weight over time, why block-zero sniping dominates thin launches, and what transparency communities should demand before participating.",
      ),
      sec(
        "Auction Mechanics on Chain",
        "An LBP typically starts with a high initial weight on the sale token and shifts toward the paired asset over time, discouraging immediate buy-all behavior— in theory. Participants swap along the moving curve; proceeds accumulate to the project treasury. Parameters include start/end weights, duration, pool caps, and allowed assets. Small parameter changes alter bot strategy and human-readable 'fairness.'",
        "Allowlists and per-wallet caps trade openness for Sybil resistance and regulatory postures. Allowlists leak via screenshots, OTC sales of spots, and shared KYC databases. Caps encourage splitting across wallets unless identity binds participation. Every gate becomes a market: the launch is economic all the way down.",
      ),
      sec(
        "Bots, Sniping, and MEV",
        "Block zero (or first eligible block) is where professional bots deploy capital with deterministic scripts. Humans confirming in browser wallets lose races unless the design includes batch auctions, sealed bids off-chain, or commit-reveal schemes with their own trust assumptions. 'Fair' on a public chain means rules are visible—not that outcomes are equal.",
        "Sandwich and frontrun dynamics around launch pools can extract retail flow before price discovery stabilizes. Private mempools and exclusive RPC endpoints shift who captures that surplus—often away from the community narrative. Disclosure should name MEV risks, bot dominance, and whether team or insiders have early pool access or vesting cliffs.",
      ),
      sec(
        "Transparency Checklist for Communities",
        "Before participating, demand: full parameter table, timeline in blocks not only UTC, treasury wallet addresses, vesting and unlock schedules, audit or code freeze status, and whether liquidity is locked or admin-keyed. Ask who can pause the contract and under what multisig. Compare allowlist claims to on-chain reality after launch.",
        "KYC perimeters change legal risk but not technical risk. Regulatory comfort for issuers does not protect users from smart contract bugs or insider dumps. Treat launch participation as venture-style risk with illiquidity, not as guaranteed upside from 'community' branding.",
      ),
      sec(
        "Practical Implications",
        "If you advise a project, stress-test configs with adversarial bots on a fork. If you participate, size positions assuming worst-case execution and insider unlock schedules. Document residual risks after parameter tweaks—no launch is bot-free, only differently exploitable.",
      ),
      sec(
        "Summary",
        "LBPs are moving-price auctions embedded in AMM math. Fairness is parameter- and infrastructure-dependent; bots and MEV are default adversaries. Allowlists and caps redistribute trust rather than removing it. Communities need concrete disclosures, not slogans.",
      ),
    ],
    terms(
      ["Liquidity bootstrapping pool (LBP)", "Time-varying weight AMM used to distribute tokens while discovering price."],
      ["Block-zero sniping", "Bots executing in the first eligible block to capture early-curve advantage."],
      ["Allowlist", "Restricted participant set, trading openness for Sybil or compliance control."],
      ["MEV", "Value extractable by controlling transaction ordering around user trades."],
      ["Vesting cliff", "Schedule delaying token unlocks, critical for post-launch sell pressure analysis."],
    ),
    lessonsById["s4-m1-l2"],
  ),

  "s4-m1-l3": lessonContent(
    [
      sec(
        "Introduction",
        "DEX aggregators split routes across pools and protocols to improve execution price for users. They are the comparison shopping layer above raw AMMs—quoting paths, estimating gas, and sometimes using private order flow or RFQ (request-for-quote) liquidity from market makers.",
        "Users see moving quotes and failed transactions; this lesson explains why, how slippage tolerance becomes a footgun, and how aggregators reintroduce approval and trust surfaces wallets must surface clearly.",
      ),
      sec(
        "Routing, Split Flows, and RFQ",
        "A single swap may traverse multiple hops: WETH→USDC on one pool, USDC→target on another. Aggregators optimize for output net of gas and fees, not minimal hops. RFQ paths ask professional makers for signed quotes valid for a short window—often better prices for size but with counterparty and censorship assumptions unlike pure on-chain pools.",
        "Quotes move because mempools, prices, and gas change between simulation and submission. Wallets that simulate at click-time cannot guarantee inclusion minutes later during volatility. Partial fills occur when limits or route liquidity cap execution—users may receive less out than quoted while still paying gas.",
      ),
      sec(
        "Slippage, Price Impact, and Failed Transactions",
        "Slippage tolerance sets the minimum acceptable output (or maximum input) for a swap. Set too loose, a bad route or sandwich drains value within 'allowed' bounds. Set too tight, benign volatility causes reverts users blame on 'broken DeFi.' Education must separate user-caused price impact from external market movement and from failed txs due to gas or nonce issues.",
        "A swap can succeed on-chain yet leave users unhappy: they paid more effective price than expected, received a worse token if they misread routing through wrappers, or approved a malicious router masquerading as an aggregator. Infinite token approvals compound damage—one compromised spender drains all historical approvals.",
      ),
      sec(
        "Wallet Simulation and Trust",
        "Transaction simulation previews balance changes but depends on honest RPC, correct ABI decoding, and up-to-date state. Malicious dApps can show benign simulation while submitting different calldata if the wallet does not bind display to hashed transaction fields. Human-readable signing is limited—complex routes need progressive disclosure and known-spender allowlists.",
        "Private mempools and builder networks reduce sandwich risk for some users while concentrating trust in relay operators. Product copy should explain tradeoffs, not promise 'MEV-free' swaps. Support teams need FAQs distinguishing revert reasons without victim-blaming.",
      ),
      sec(
        "Practical Implications",
        "Write in-app strings that define slippage, price impact, partial fill, and approval scope in plain language. Default to limited approvals where gas allows. Train users to verify router contract addresses and revoke stale allowances periodically.",
      ),
      sec(
        "Summary",
        "Aggregators optimize routes across AMMs and RFQ liquidity; quotes are ephemeral. Slippage tolerance is risk policy, not a target. Approvals and simulation trust remain the wallet's core security job—routing UX cannot fix malicious spenders or blind signing.",
      ),
    ],
    terms(
      ["DEX aggregator", "Router that splits swaps across venues to improve net execution for users."],
      ["RFQ liquidity", "Short-lived signed quotes from market makers, trading pure on-chain trust for price."],
      ["Slippage tolerance", "User-defined bound on acceptable execution deviation from quote."],
      ["Partial fill", "Swap executing below requested size due to liquidity or limit constraints."],
      ["Token approval", "On-chain permission for a contract to spend user's tokens—high-risk if unlimited."],
    ),
    lessonsById["s4-m1-l3"],
  ),

  "s4-m2-l1": lessonContent(
    [
      sec(
        "Introduction",
        "Collateralized lending on-chain mirrors familiar finance—deposit assets, borrow against them, pay interest—but replaces credit officers with smart contracts, oracles, and liquidation bots. Protocols like Aave and Compound popularized interest-bearing receipt tokens (aTokens/cTokens) and algorithmic rate curves driven by utilization.",
        "You will walk the deposit→borrow→repay lifecycle, explain utilization-driven interest, and identify governance knobs that change risk overnight.",
      ),
      sec(
        "Receipt Tokens and Utilization Rates",
        "When you supply USDC, you receive a receipt token representing your claim on the pool plus accrued interest. Borrowers draw from the same pool, paying a borrow rate that rises with utilization—the fraction of supplied assets currently lent. High utilization means suppliers earn more but liquidity for withdrawals shrinks; low utilization means cheap borrowing and thin supplier yield.",
        "Interest rate models are piecewise curves with kinks chosen by governance. Caps limit how much of an asset can be supplied or borrowed; isolation modes fence new assets from contaminating core collateral. E-mode (efficiency mode) offers higher LTV for correlated collateral baskets—faster capital efficiency, faster cascade if correlations break in stress.",
      ),
      sec(
        "Collateral Factors, LTV, and Health",
        "Loan-to-value (LTV) and liquidation thresholds define how much you can borrow against collateral before liquidation bots can repay your debt and seize collateral with a bonus. Health factor is a protocol-specific scalar combining collateral value, debt, and thresholds—crossing 1.0 (or protocol equivalent) triggers liquidation eligibility.",
        "Oracle lag between spot markets and on-chain feeds creates windows where underwater positions are not yet liquidatable—or falsely liquidatable. Governance can freeze assets, pause borrows, or adjust parameters during crises; 'decentralized' does not mean 'immutable policy.'",
      ),
      sec(
        "Bad Debt and Socialization",
        "If collateral cannot cover debt after liquidation—flash crashes, oracle failures, illiquid collateral—protocols may socialize loss across suppliers, use insurance funds, or mint governance tokens to recapitalize. Users supplying stablecoins to 'safe' pools still bear correlated risk from accepted collateral types and oracle choices.",
        "Bridge-wrapped assets and rebasing tokens introduce smart contract and peg risk beyond spot volatility. Comparing two markets for the 'same' asset requires reading caps, LTV, oracle feeds, and whether isolation mode is enabled—not headline APY alone.",
      ),
      sec(
        "Practical Implications",
        "Build parameter comparison memos for treasuries: oracles per asset, liquidation bonuses, caps, and pause keys. Stress-test borrow positions with oracle delay assumptions. Ask who absorbs bad debt before depositing size.",
      ),
      sec(
        "Summary",
        "On-chain lending pools couple supplier yield to borrower demand via utilization. Receipt tokens track claims; health factors gate liquidations. Governance and oracles are first-class risk variables—compare parameters, not brands.",
      ),
    ],
    terms(
      ["Utilization rate", "Fraction of supplied assets borrowed, driving interest curves."],
      ["Loan-to-value (LTV)", "Maximum borrow power against collateral before liquidation risk rises."],
      ["Health factor", "Protocol metric combining collateral and debt; liquidations trigger near breach."],
      ["Isolation mode", "Risk fencing limiting new assets' impact on core pools."],
      ["Bad debt", "Uncollateralized shortfall after liquidation, potentially socialized to suppliers."],
    ),
    lessonsById["s4-m2-l1"],
  ),

  "s4-m2-l2": lessonContent(
    [
      sec(
        "Introduction",
        "Liquidations are the automated enforcement layer of DeFi lending: when collateral value falls relative to debt, permissionless bots repay debt and seize collateral plus an incentive bonus. They are a public good for protocol solvency and a profit center for sophisticated operators—until cascades turn them into systemic accelerants.",
        "This lesson explains health factor math at intuition level, liquidation bonuses, bad debt socialization, and how sequencer ordering and oracle updates shape who wins during volatile days.",
      ),
      sec(
        "Liquidator Incentives and Mechanics",
        "Liquidation bonus (or spread) pays bots for gas, inventory risk, and speed. Bots monitor mempools and chain state, competing to execute first profitable liquidation. Partial liquidations may be allowed to reduce market impact; full liquidations simplify accounting but dump size on DEXs.",
        "During volatility, many positions approach threshold simultaneously—liquidation queues interact with DEX liquidity, causing further price drops and second-wave liquidations. Oracle update cadence (heartbeat vs deviation thresholds) determines whether on-chain prices jump discretely, triggering batched liquidations in one block.",
      ),
      sec(
        "Toxic Flow and Insurance Funds",
        "Toxic liquidation flow refers to situations where seized collateral cannot be sold near oracle price—illiquid tokens, paused chains, or manipulated pools. Insurance funds and protocol reserves absorb residual shortfalls when bonuses are insufficient. Not all protocols fund insurance equally; read whether reserves are real assets or governance promises.",
        "Auction-based liquidation mechanisms try to discover collateral sale price on-chain; fixed-spread models favor speed. Sequencer ordering on L2s can prioritize affiliated searchers, changing fairness versus L1 gas auctions. Historical dashboards let you reconstruct timelines: oracle updates, liquidation spikes, DEX volume, and governance pauses.",
      ),
      sec(
        "Social Externalities",
        "Liquidations transfer wealth from over-levered users to bots and suppliers (via restored solvency). Communities experience visible human losses during crashes—narratives blame protocols, oracles, or 'whales.' Transparent parameters and education reduce surprise; they do not remove leverage cycles.",
        "Pausing borrows or liquidations is a governance intervention with moral hazard: insiders may exit while retail cannot adjust. Emergency measures should be understood ex ante in risk disclosures, not discovered on Twitter during a depeg.",
      ),
      sec(
        "Practical Implications",
        "Reconstruct one volatile day from public data: mark oracle timestamps, liquidation events, and DEX prices. For builders, monitor health factor distributions and toxic collateral lists. For users, treat liquidation bonus as someone else's income—your goal is staying far from threshold with buffer.",
      ),
      sec(
        "Summary",
        "Liquidations align incentives to keep lending pools solvent. Bonuses attract bots; cascades couple oracles, DEX liquidity, and leverage. Insurance and governance pauses are shock absorbers with their own politics and fairness questions.",
      ),
    ],
    terms(
      ["Liquidation bonus", "Collateral seized above debt repaid, paying liquidators for speed and risk."],
      ["Health factor", "Borrow safety scalar; liquidations become eligible as it approaches protocol threshold."],
      ["Cascade liquidation", "Self-reinforcing liquidations and price drops during stress events."],
      ["Insurance fund", "Protocol reserve absorbing bad debt shortfalls after liquidations."],
      ["Toxic liquidation flow", "Liquidations where collateral cannot be monetized near oracle value."],
    ),
    lessonsById["s4-m2-l2"],
  ),

  "s4-m2-l3": lessonContent(
    [
      sec(
        "Introduction",
        "Lending, derivatives, and stable systems depend on oracles—modules that bring off-chain or cross-pool prices on-chain. Chainlink-style feeds aggregate multiple sources; DEX TWAPs derive prices from historical pool ratios. Every design trades freshness against manipulation cost and liveness against safety.",
        "You will explain medianized feeds at a high level, sketch historical manipulation patterns, and propose monitoring metrics for stale or divergent prices.",
      ),
      sec(
        "Aggregation, Heartbeats, and Deviation Thresholds",
        "Aggregators pull from exchanges, market makers, and other feeds, then reduce to a median or trimmed mean to resist single-source lies. Updates fire on heartbeat (time) and deviation (price move) rules—tight thresholds are fresher but more gas-expensive and gameable in low-liquidity assets; loose thresholds lag spot during crashes.",
        "Sequencer downtime on L2s pauses oracle updates while CeFi prices move—positions look healthy on-chain while underwater in reality, or vice versa. L2-native oracles and failover feeds are architectural responses with their own trust sets.",
      ),
      sec(
        "DEX TWAP vs Spot Manipulation",
        "Spot pool prices can be manipulated within a block or few blocks cheaply if liquidity is thin. TWAP over hours raises attack cost because the attacker must bias the pool over the window. TWAP is not immune—multi-block strategies and liquidity rental exist—but windows match security to asset liquidity.",
        "Upward manipulation inflates collateral value, letting attackers borrow more than justified. Downward manipulation triggers unfair liquidations. Protocols combine multiple feeds, circuit breakers, and governance pauses when divergence exceeds thresholds.",
      ),
      sec(
        "Oracle Risk Registers and Testing",
        "A risk register lists primary and backup feeds, escalation contacts, stale-price playbooks, and maximum exposure per asset. Test plans simulate heartbeat misses, 30% spot drops between updates, and sequencer outages. Monitoring should alert on feed vs spot divergence, update age, and liquidation proximity clusters.",
        "Historical sketches include low-liquidity asset pumps on single CEX prints, flash loan pool manipulations, and delayed updates during network congestion. Each teaches that oracle security is operational—graphs on dashboards matter as much as math.",
      ),
      sec(
        "Practical Implications",
        "Document failover logic before launch. Cap borrow power for assets with thin oracle liquidity. Run tabletop exercises when feeds deviate beyond X% from index for Y minutes.",
      ),
      sec(
        "Summary",
        "Oracles translate external reality into contract state under delay and manipulation constraints. Aggregation and TWAP raise attack costs; governance and pauses handle tail events. Treat feeds as live systems with monitoring, not install-once libraries.",
      ),
    ],
    terms(
      ["Oracle aggregator", "Contract combining multiple price sources into one on-chain value."],
      ["Heartbeat update", "Time-based oracle refresh regardless of price change."],
      ["Deviation threshold", "Price move triggering early oracle update between heartbeats."],
      ["TWAP", "Time-weighted average from on-chain pools, resisting single-block manipulation."],
      ["Upward manipulation", "Inflating oracle price to over-borrow against undervalued collateral risk."],
    ),
    lessonsById["s4-m2-l3"],
  ),

  "s4-m3-l1": lessonContent(
    [
      sec(
        "Introduction",
        "Composability—protocols calling protocols like money Legos—multiplies yield strategies and multiplies failure propagation. The same ETH or staked derivative can back multiple claims through rehypothecation: deposits in one venue become collateral in another, looped until the graph snaps in stress.",
        "You will diagram generic leverage loops, explain why net asset value (NAV) can diverge from redeemability, and describe deleverage spirals that turn liquidity crunches into solvency events.",
      ),
      sec(
        "Loops, NAV, and Redeemability",
        "A stylized loop: stake ETH for a liquid staking token (LST), deposit LST in lending, borrow ETH, restake—repeat until governance caps stop you. Each hop adds basis and smart contract risk. NAV of LST tracks underlying plus rewards minus socialized slashing; redeemability depends on exit queues, DEX depth, and issuer policy.",
        "During stress, DEX price of LST depegs below NAV while redemptions queue. Users discover 'paper' value is not instantly realizable. Liquidity differs from solvency: a solvent issuer can still fail if everyone runs at once and exit bandwidth is finite.",
      ),
      sec(
        "Deleverage Spirals and Contagion",
        "Falling collateral prices trigger liquidations, which sell collateral on DEXs, depressing prices further—classic reflexivity. Loops unwind in reverse order, often hitting the most levered protocols first. Governance may freeze withdrawals, change oracle parameters, or inject liquidity—each choice picks winners and losers.",
        "Contagion maps use directional arrows: who holds whose tokens, who borrows against whom, where oracles overlap. Public TVL overstates safety when double-counted deposits appear in multiple protocols. Confidence levels on edges matter—graphs are models, not prophecies.",
      ),
      sec(
        "Governance Intervention Ethics",
        "Emergency measures can protect systemic stability or bail out insiders who understood exit order. Transparency about multisig powers before crises reduces legitimacy loss after. Postmortems of major depegs repeat patterns: correlated assets treated as independent, oracle lag, and liquidity illusion.",
        "Metrics that overstate safety include naive TVL, spot APY ignoring IL and unlocks, and 'audited' labels without scope. Ask what breaks first if ETH drops 40% in 48 hours—not average conditions.",
      ),
      sec(
        "Practical Implications",
        "Build ecosystem contagion maps from public data; narrate three plausible cascade stories. Treasuries should cap looped strategies and model exit liquidity in blocks, not days. Protocol designers should document rehypothecation paths explicitly.",
      ),
      sec(
        "Summary",
        "Composable DeFi stacks collateral like layered claims. NAV≠cash in stress; deleverage spirals couple prices, liquidations, and psychology. Maps and honest metrics beat slogans about decentralization when the tower wobbles.",
      ),
    ],
    terms(
      ["Rehypothecation", "Reusing the same collateral to back multiple claims across venues."],
      ["Leverage loop", "Repeated borrow-and-redeposit strategy amplifying exposure to one basis asset."],
      ["NAV", "Net asset value per share; may diverge from market price or redemption value."],
      ["Deleverage spiral", "Reflexive selling from liquidations depressing prices further."],
      ["Contagion", "Failure propagation through linked balance sheets and oracles."],
    ),
    lessonsById["s4-m3-l1"],
  ),

  "s4-m3-l2": lessonContent(
    [
      sec(
        "Introduction",
        "DeFi rarely offers insurance in the traditional sense—full replacement of loss without exclusions. Coverage pools, bug bounties, and protocol-owned reserves (POR) are partial, incentive-aligned buffers. Understanding their limits prevents 'insured' marketing from becoming false comfort.",
        "Compare mutual-style coverage caps, bounty tier economics, and POR as volatility buffers—not magic shields.",
      ),
      sec(
        "Coverage Pools and Exclusions",
        "Mutual coverage models assess premiums and pay claims via member votes with caps per contract and per event. Exclusions commonly include oracle failures, governance attacks, and unspecified novel bugs—read the fine print. Payouts may be in governance tokens with illiquid markets, diluting real compensation.",
        "Moral hazard arises when users take larger risks because coverage exists—underwriters respond with higher premiums or stricter exclusions. War rooms after incidents need pre-funded budgets and clear decision rights, not ad-hoc Discord polls.",
      ),
      sec(
        "Bug Bounties and Safe Harbor",
        "Bounties pay researchers for coordinated disclosure within scope. Tiering rewards criticality; duplicates and partial fixes complicate payouts. Safe harbor statements aim to reduce legal risk for good-faith research but do not replace counsel—jurisdiction matters.",
        "Retroactive public goods funding (RetroPGF) acts as ex-post insurance for ecosystems—compensating builders after failures they might have prevented with better tooling. It is political and discretionary, not a contract guarantee.",
      ),
      sec(
        "Protocol-Owned Reserves and Budgeting",
        "POR holds protocol fees or issued tokens as backstop liquidity for peg defense or recapitalization. Token-denominated reserves melt when the token falls—procyclical weakness. Incident budgets should split across audits (prevention), bounties (discovery), insurance (transfer), and reserves (absorption)—tradeoffs explicit to communities.",
        "Unknown unknowns dominate tail risk; no budget eliminates it. Transparency about residual risk after all mitigations is the honest endpoint.",
      ),
      sec(
        "Practical Implications",
        "Allocate hypothetical incident budgets with written justification. When reading 'insured,' list exclusions and payout asset liquidity. Pair bounties with internal red team and monitoring—not as substitute.",
      ),
      sec(
        "Summary",
        "Insurance-like products in DeFi are capped, conditional, and governance-mediated. Bounties align whitehats; reserves absorb some shocks. Budget honestly across prevention, discovery, transfer, and absorption—residual risk remains.",
      ),
    ],
    terms(
      ["Mutual coverage", "Member-funded pool paying claims by vote with caps and exclusions."],
      ["Moral hazard", "Risk-taking increased because losses may be externalized to insurers."],
      ["Bug bounty", "Paid program rewarding coordinated vulnerability disclosure within scope."],
      ["Protocol-owned reserve", "Treasury assets held for peg defense or recapitalization."],
      ["Safe harbor", "Policy statement limiting legal action against good-faith security research."],
    ),
    lessonsById["s4-m3-l2"],
  ),

  "s4-m3-l3": lessonContent(
    [
      sec(
        "Introduction",
        "Regulation does not sit outside DeFi—it shapes which users access products, which assets issuers list, and which developers feel safe shipping open-source code. This lesson is high-level, not legal advice: themes include sanctions, travel rule touchpoints, stablecoin issuer models, and decentralization theater.",
        "Jurisdictional friction is a system parameter like gas costs: it routes activity across chains, custodians, and frontends.",
      ),
      sec(
        "Public Themes and VASP Concepts",
        "Policymakers publicly discuss AML/KYC, securities classification of tokens, stablecoin reserves, and developer liability for frontends. Virtual asset service providers (VASPs) face travel rule obligations to share originator/beneficiary data on transfers above thresholds—implemented at custodial and some P2P chokepoints, not inside pure smart contracts.",
        "Sanctions screening affects RPC providers, relayers, and issuers who can freeze stablecoins at contract level. Users experience freezes as address blacklists, not courtroom drama. Compliance-by-design products embed screening at UI—trading censorship resistance for access.",
      ),
      sec(
        "Stablecoins and Decentralization Theater",
        "Fiat-backed stablecoins concentrate issuer risk: reserves, attestations, and freeze keys. Algorithmic designs trade different failure modes. Calling a project 'decentralized' while admin keys can upgrade logic or pause transfers is theater if those keys are single-sig or opaque multisig.",
        "Frontend geoblocking and token listing policies are business decisions with legal drivers—they do not change on-chain bytecode but do change who can click confirm. Open-source repos may still face contributor liability debates—teams adopt build principles and counsel escalation triggers.",
      ),
      sec(
        "Product Principles Without Legal Advice",
        "Neutral build principles might include: publish admin key holders, document upgrade timelocks, avoid claiming FDIC-like safety, route sanctions questions to counsel, and separate research from production deployment. Escalation triggers: subpoena received, law enforcement contact, new jurisdiction launch, token classified as security in major market.",
        "Code alone cannot answer law—humans and organizations remain accountable. Engineers should know enough to ask questions early, not enough to pretend to be lawyers.",
      ),
      sec(
        "Practical Implications",
        "Draft principles docs with explicit 'not legal advice' and counsel contact thresholds. Map user journeys for where KYC appears. Audit marketing copy against actual trust assumptions.",
      ),
      sec(
        "Summary",
        "Regulatory geography steers DeFi product shape and user access. VASPs, travel rule, and sanctions bite at custodial edges. Decentralization claims need matching key transparency; teams need counsel escalation, not improvised legal theories.",
      ),
    ],
    terms(
      ["VASP", "Virtual asset service provider subject to AML/KYC and travel rule regimes."],
      ["Travel rule", "Requirement to share transfer participant data between obliged entities."],
      ["Sanctions screening", "Blocking transactions involving listed addresses or jurisdictions."],
      ["Decentralization theater", "Marketing decentralization while retaining effective admin control."],
      ["Compliance-by-design", "Embedding policy checks in product flow rather than bolting on later."],
    ),
    lessonsById["s4-m3-l3"],
  ),
};
