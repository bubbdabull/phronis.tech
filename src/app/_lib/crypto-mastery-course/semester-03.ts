import type { Semester } from "./types";

/** Semester 3 — Digital assets, NFTs, DAOs, trading discipline, and on-chain coordination (~18+ h). */
export const SEMESTER_03: Semester = {
  id: "s3",
  number: 3,
  title: "Digital Assets, NFTs, and On-Chain Governance",
  description:
    "Token taxonomies, NFT provenance, rug and wash-trading literacy, retail trading habits, DEX vs CEX literacy, a practical on-chain research toolkit (memecoins, RWAs, general tokens), DAO tooling, CeFi interfaces, and treasury operations as socio-technical systems.",
  prerequisites: ["Semester 2 complete or equivalent Solidity reading level"],
  modules: [
    {
      id: "s3-m1",
      title: "Token Design and Economic Primitives",
      description: "Supply schedules, vesting, emissions, and how incentives age.",
      lessons: [
        {
          id: "s3-m1-l1",
          title: "Utility vs Governance vs Meme: Honest Taxonomies",
          synopsis: "Map claims to verifiable on-chain rights; avoid category errors when evaluating projects.",
          estimatedMinutes: 80,
          objectives: [
            "Separate legal rights from protocol permissions.",
            "Identify circular tokenomics patterns.",
            "Explain why 'staking yield' is often redistribution, not productivity.",
          ],
          readings: [
            {
              title: "Hasu / variant essays on token value accrual (pick 2)",
              studyGuide: "Focus on mechanisms, not price targets.",
              estimatedMinutes: 45,
            },
          ],
          lectureOutline: [
            "Cash flows vs governance vs memes",
            "Lockups as commitment devices",
            "Liquidity mining as customer acquisition cost",
          ],
          lab: {
            title: "Token One-Pager Autopsy",
            scenario: "Pick a live token with public docs; map each claim to an on-chain check or admit 'trust'.",
            deliverable: "One-pager table: claim | evidence | residual trust | open question.",
            rubricHints: ["No price predictions", "Names oracle or admin dependencies"],
          },
          selfCheckQuestions: ["What would falsify the thesis of this token?", "Who can change emissions?"],
        },
        {
          id: "s3-m1-l2",
          title: "NFTs: Metadata, Permanence, and Royalties Politics",
          synopsis: "What is on-chain vs off-chain; content addressing; marketplace policy shocks.",
          estimatedMinutes: 85,
          objectives: [
            "Explain tokenURI indirection and IPFS pinning economics.",
            "Describe enforcement limits of on-chain royalties.",
            "Contrast soulbound vs transferable designs.",
          ],
          readings: [{ title: "EIP-721 + OpenSea docs on metadata", studyGuide: "Trace one collection's metadata pipeline.", estimatedMinutes: 40 }],
          lectureOutline: ["Frozen vs upgradeable metadata", "CC0 vs commercial rights (legal ≠ chain)", "Wash trading incentives"],
          lab: {
            title: "Provenance Diagram",
            scenario: "Choose an NFT drop; diagram creator → contract → metadata host → image host.",
            deliverable: "Diagram + 10 failure modes if any party goes rogue or offline.",
            rubricHints: ["Shows off-chain dependencies", "Discusses gateway vs native IPFS"],
          },
          selfCheckQuestions: ["What breaks if gateway is censored?", "Why did optional royalties fracture?"],
        },
        {
          id: "s3-m1-l3",
          title: "Stablecoins: Peg Mechanisms and Bank-Run Geometry",
          synopsis: "Collateralized vs algorithmic history; depeg scenarios; stablecoins as shadow banking.",
          estimatedMinutes: 90,
          objectives: ["Compare fiat-backed, over-collateralized crypto, and endogenous algo designs.", "Explain redemption vs secondary market peg.", "Discuss regulatory perimeter pressures."],
          readings: [{ title: "Stablecoin report (e.g. NY Fed / BIS overview) — skim charts", studyGuide: "Note liability side.", estimatedMinutes: 50 }],
          lectureOutline: ["Mint/redeem vs AMM peg", "Oracle choice in CDP systems", "Contagion channels to DeFi"],
          lab: {
            title: "Stress Memo",
            scenario: "Write a 2-page stress scenario: rate spike + oracle delay + stablecoin outflow.",
            deliverable: "Memo + timeline of who gets hurt first and why.",
            rubricHints: ["Uses concrete mechanism", "Avoids moralizing"],
          },
          selfCheckQuestions: ["Why do fiat-backed stables need attestations?", "What is a death spiral in algo context?"],
        },
      ],
    },
    {
      id: "s3-m2",
      title: "DAOs: Governance Minus the Hype",
      description: "Snapshot vs on-chain voting, multisigs, delegates, and operational security for treasuries.",
      lessons: [
        {
          id: "s3-m2-l1",
          title: "Voting Mechanisms: Plurality, Ranked, Quadratic (Intuition)",
          synopsis: "Strategy-proofness limits; bribery as first-class threat in token voting.",
          estimatedMinutes: 80,
          objectives: ["Explain why on-chain votes are buyable.", "Contrast off-chain signal vs binding execution.", "List three delegate failure modes."],
          readings: [{ title: "Buterin posts on governance + bribery (selected)", studyGuide: "Take bullet notes only.", estimatedMinutes: 40 }],
          lectureOutline: ["Time locks as cooling", "Guardians vs token holders", "Optimistic governance patterns"],
          lab: {
            title: "Governance Postmortem",
            scenario: "Pick a public proposal controversy; narrate voter coalitions and execution path.",
            deliverable: "800-word analysis + link to vote.",
            rubricHints: ["Names execution multisig if any", "Notes quorum games"],
          },
          selfCheckQuestions: ["What is vote buying vs lobbying here?", "When is low turnout fatal?"],
        },
        {
          id: "s3-m2-l2",
          title: "Treasury Operations: Multisig, Streaming, Grants",
          synopsis: "Operational patterns for spending public goods money with accountability.",
          estimatedMinutes: 85,
          objectives: ["Design a basic treasury policy with thresholds.", "Explain streaming payouts risk.", "Relate to legal wrapper options at high level."],
          readings: [{ title: "Safe (Gnosis) docs — roles and modules overview", studyGuide: "Focus on module risk.", estimatedMinutes: 35 }],
          lectureOutline: ["HSM vs hot signers", "Allowance budgets", "Grant milestone vs milestone-less"],
          lab: {
            title: "Treasury Policy Draft",
            scenario: "You have $20M on-chain for a dev guild. Draft signing policy + emergency pause.",
            deliverable: "Policy doc + RACI matrix.",
            rubricHints: ["Addresses signer compromise", "Defines spend tiers"],
          },
          selfCheckQuestions: ["Why not single EOA treasurer?", "What is a malicious module?"],
        },
        {
          id: "s3-m2-l3",
          title: "Reputation, Identity, and Sybil Resistance",
          synopsis: "Why DAOs import Web2 identity tools; limits of on-chain reputation only.",
          estimatedMinutes: 75,
          objectives: ["List sybil attacks on airdrops and grants.", "Compare Gitcoin Passport-style signals.", "Discuss privacy tradeoffs."],
          readings: [{ title: "Proof of Humanity / Worldcoin critiques (balanced pair)", studyGuide: "Extract criteria each solves.", estimatedMinutes: 45 }],
          lectureOutline: ["Graph-based reputation pitfalls", "ZK credentials brochure", "Corporate KYC vs community membership"],
          lab: {
            title: "Sybil Game",
            scenario: "Design a small community reward; attackers have capital but not social ties.",
            deliverable: "Threat model + two mitigation layers + residual risk.",
            rubricHints: ["Acknowledges false negatives", "No magic AI"],
          },
          selfCheckQuestions: ["When is sybil resistance worth UX pain?", "What does 'one person' even mean?"],
        },
      ],
    },
    {
      id: "s3-m3",
      title: "CeFi vs DeFi Interfaces",
      description: "Exchanges, custody, listing mechanics, and how retail UX reintroduces trust.",
      lessons: [
        {
          id: "s3-m3-l1",
          title: "Order Books vs AMMs at the Retail Layer",
          synopsis: "What users actually sign when they 'swap' inside a custodial app.",
          estimatedMinutes: 78,
          objectives: ["Contrast custodial matching vs self-custody swap.", "Explain proof-of-reserves limits.", "Describe withdrawal queue dynamics."],
          readings: [{ title: "Exchange transparency reports (skim any major)", studyGuide: "Note what is attested vs inferred.", estimatedMinutes: 30 }],
          lectureOutline: ["Segregation of funds as policy", "Internalization and toxic flow", "On-chain proof patterns"],
          lab: {
            title: "Attestation Reading",
            scenario: "Read one PoR blog critically; list 5 questions an auditor would still ask.",
            deliverable: "Question list + why each matters.",
            rubricHints: ["Mentions liability mismatch", "Mentions cold wallet refresh"],
          },
          selfCheckQuestions: ["Why can PoR still miss insolvency?", "What is a liability oracle?"],
        },
        {
          id: "s3-m3-l2",
          title: "Listing, Markets, and Manipulation Surfaces",
          synopsis: "How tokens get listed; wash trading; oracle manipulation as market structure issue.",
          estimatedMinutes: 82,
          objectives: ["Describe incentive around thin markets.", "Explain oracle latency in liquidations.", "Name three market manipulation patterns."],
          readings: [{ title: "SEC / academic market manipulation primers (non-legal summary)", studyGuide: "Map to on-chain analogues.", estimatedMinutes: 40 }],
          lectureOutline: ["MEV as structural tax", "Perps funding basics", "Oracle TWAP choices"],
          lab: {
            title: "Market Integrity Brief",
            scenario: "Your DAO will list a token; write integrity checklist for partners.",
            deliverable: "Checklist + escalation playbook if suspicious volume.",
            rubricHints: ["Operational not legal advice", "Includes monitoring"],
          },
          selfCheckQuestions: ["When does high volume mislead?", "What is an oracle front-run?"],
        },
        {
          id: "s3-m3-l3",
          title: "Tax, Reporting, and Record-Keeping Hygiene",
          synopsis: "Not tax advice: what records exist on-chain; why cost basis is hard; jurisdiction variance.",
          estimatedMinutes: 80,
          objectives: ["List categories of taxable events commonly discussed publicly.", "Explain chain-hopping record problems.", "Propose conservative record-keeping workflow."],
          readings: [{ title: "IRS / local authority plain-language pages + one accountant interview writeup", studyGuide: "Document uncertainties explicitly.", estimatedMinutes: 35 }],
          lectureOutline: ["FIFO vs specific ID", "Staking rewards timing debates", "Privacy vs audit trail"],
          lab: {
            title: "Personal Ledger Template",
            scenario: "Design a spreadsheet schema for a multi-chain user with bridges.",
            deliverable: "Column spec + example rows + known gaps section.",
            rubricHints: ["No legal conclusions", "Flags bridge ambiguity"],
          },
          selfCheckQuestions: ["Why are airdrops ambiguous?", "What breaks if you lose bridge receipts?"],
        },
      ],
    },
    {
      id: "s3-m4",
      title: "NFT Rugs, Hype Cycles, and Collector Due Diligence",
      description:
        "Pattern recognition for social rugs, technical red flags in contracts and metadata, and volume/floor manipulation—education only, not a guarantee of safety.",
      lessons: [
        {
          id: "s3-m4-l1",
          title: "Social Rug Patterns: Teams, Roadmaps, Urgency, and Liquidity Reality",
          synopsis:
            "How hype cycles extract attention; anonymous teams are not automatically rugs but shift burden of proof; 'utility' promises that are unfalsifiable.",
          estimatedMinutes: 80,
          objectives: [
            "List ten social red flags common before NFT or token rugs (without naming living projects as guilty).",
            "Explain why 'Doxxed team' is insufficient diligence.",
            "Describe a healthy mint disclosure minimum (timelocks, funds flow, multisig).",
          ],
          readings: [
            {
              title: "Public postmortems / threads from law enforcement or researchers on NFT fraud patterns",
              studyGuide: "Extract recurring story beats, not gossip.",
              estimatedMinutes: 45,
            },
          ],
          lectureOutline: [
            "Influencer payola and undisclosed compensation norms (regulatory context, non-advice)",
            "Discord/Twitter admin compromise as mint-eve attack",
            "Secondary royalty dependence as business model fragility",
          ],
          lab: {
            title: "Rug Pattern Flashcards",
            scenario: "Create 20 flashcards: front = benign-sounding marketing line, back = questions an investigator would ask.",
            deliverable: "Deck + 1-page 'if you only check three things' memo for a client.",
            rubricHints: ["No witch hunts", "Actionable questions only"],
          },
          selfCheckQuestions: ["What evidence would change your mind from bullish to pass?", "Why is fixed supply not safety?"],
        },
        {
          id: "s3-m4-l2",
          title: "Technical Tells: Metadata Mutability, Verification, Copymints, and Hidden Switches",
          synopsis:
            "Reading collection pages critically: frozen vs updatable metadata, contract verification, owner functions, unusual royalties, honeypot transfers.",
          estimatedMinutes: 88,
          objectives: [
            "Explain how a creator can replace art after mint if metadata is mutable.",
            "Contrast verified source vs proxy-only bytecode from a due diligence perspective.",
            "Identify copymint risk signals (similar names, squatting, unverified provenance).",
          ],
          readings: [
            {
              title: "OpenSea / Magic Eden help docs on verification + metadata standards",
              studyGuide: "Pick two chains (e.g. ETH + Solana) and compare what 'verified' means.",
              estimatedMinutes: 40,
            },
          ],
          lectureOutline: [
            "Solana Metaplex-style metadata (high level) vs Ethereum tokenURI",
            "Royalty enforcement change history and buyer implications",
            "Why 'on-chain' images are rare and what IPFS gateway risk remains",
          ],
          lab: {
            title: "Red Team Two Collections",
            scenario: "Choose one established collection and one thin project; same checklist for both; document unknowns instead of verdicts.",
            deliverable: "Side-by-side checklist results + 'residual trust' paragraph each.",
            rubricHints: ["Does not accuse", "Shows explorer skills"],
          },
          selfCheckQuestions: ["What does mutable metadata imply for long-term PFP value?", "When is unverified acceptable?"],
        },
        {
          id: "s3-m4-l3",
          title: "Wash Trading, Fake Volume, and Floor Price Theater",
          synopsis:
            "How volume and floor can be manufactured; holder distribution; why secondary charts are not fundamentals.",
          estimatedMinutes: 85,
          objectives: [
            "Define wash trading in on-chain terms.",
            "Interpret holder concentration heuristics cautiously.",
            "Explain how airdrops and self-trades distort dashboards.",
          ],
          readings: [
            {
              title: "Chainalysis or academic papers on NFT wash trading (overview)",
              studyGuide: "Focus on methodology limitations.",
              estimatedMinutes: 40,
            },
          ],
          lectureOutline: [
            "Marketplaces incentives vs user truth-seeking",
            "Royalties off → volume migration effects",
            "Solana-specific volume quirks (low fees enable noise)",
          ],
          lab: {
            title: "Client Education Handout",
            scenario: "One-page handout: 'Why volume and floor are easy to fake' with three visuals described in text (ASCII ok).",
            deliverable: "Handout + FAQ for support staff answering nervous collectors.",
            rubricHints: ["Plain language", "No 'never buy' absolutes"],
          },
          selfCheckQuestions: ["What metric is harder to fake than volume?", "Why do free mints attract bots?"],
        },
      ],
    },
    {
      id: "s3-m5",
      title: "Trading Habits, Execution Hygiene, and Staying Current",
      description:
        "Risk framing, journaling, slippage and signing discipline, and a sustainable information diet—still not investment advice.",
      lessons: [
        {
          id: "s3-m5-l1",
          title: "Position Sizing, Plans, and Emotional Discipline",
          synopsis:
            "Separating investing from entertainment budget; written rules; stopping rules; avoiding revenge trading after a loss.",
          estimatedMinutes: 78,
          objectives: [
            "Draft a personal trading policy template (amounts redacted) suitable to share with a financial planner.",
            "Explain why leverage magnifies psychological failure modes.",
            "List cognitive biases most common in 24/7 markets.",
          ],
          readings: [
            {
              title: "CFA Institute or academic summaries on behavioral finance (skim)",
              studyGuide: "Map 5 biases to crypto-specific triggers (notifications, Discord).",
              estimatedMinutes: 35,
            },
          ],
          lectureOutline: [
            "Dollar-cost averaging vs lump sum (conceptual, not advice)",
            "When to use cold storage vs hot wallet for trading float",
            "Sleep and timezone asymmetry in global markets",
          ],
          lab: {
            title: "Trade Journal Schema",
            scenario: "Design a journal capturing entry thesis, invalidation, fees, and emotional state—works for Solana and EVM.",
            deliverable: "Spreadsheet or Notion template + example redacted row.",
            rubricHints: ["Includes fees and slippage columns", "Includes 'lesson learned' field"],
          },
          selfCheckQuestions: ["What invalidates your thesis in one sentence?", "When should automation be avoided?"],
        },
        {
          id: "s3-m5-l2",
          title: "Execution Hygiene: Slippage, MEV, Approvals, and Wallet Simulation Limits",
          synopsis:
            "Market vs limit concepts on AMMs; setting slippage on Solana vs Ethereum; infinite approvals culture; why simulated success can still drain.",
          estimatedMinutes: 86,
          objectives: [
            "Explain price impact vs slippage tolerance in user-facing terms.",
            "Recommend least-privilege approval habits for active traders.",
            "Describe why malicious sites can fool wallet previews.",
          ],
          readings: [
            {
              title: "Wallet vendor security blogs (2023–2026) on transaction simulation",
              studyGuide: "Extract what simulation cannot model.",
              estimatedMinutes: 30,
            },
          ],
          lectureOutline: [
            "Solana: priority fee spikes during mints; failed txs cost SOL",
            "Ethereum: private RPC / OFA as consumer product layer",
            "Revoke tools: operational not paranoid",
          ],
          lab: {
            title: "Approval Audit",
            scenario: "On a throwaway hot wallet or testnet, list open approvals (if tool available) and write revoke plan by risk tier.",
            deliverable: "Tiered revoke plan + narrative for client on why recurring audits matter.",
            rubricHints: ["No real keys in submission", "Explains per-tx vs infinite"],
          },
          selfCheckQuestions: ["Why is 50% slippage almost never appropriate?", "What does 'blind signing' on hardware wallets mean?"],
        },
        {
          id: "s3-m5-l3",
          title: "Staying Current: Signal, Noise, Official Channels, and Upgrade Calendars",
          synopsis:
            "How to follow protocol upgrades, Solana releases, and exchange incidents without living on Twitter; deepfake and phishing velocity.",
          estimatedMinutes: 80,
          objectives: [
            "Curate a trusted information stack for one ecosystem (e.g. Solana) with primary sources.",
            "Explain cross-verification before acting on urgent announcements.",
            "Outline a weekly 'crypto hygiene' routine for a busy client.",
          ],
          readings: [
            {
              title: "Solana Status / release notes + one major wallet's changelog (sample month)",
              studyGuide: "Note what changed for users vs validators.",
              estimatedMinutes: 35,
            },
          ],
          lectureOutline: [
            "RSS, mailing lists, and official status pages vs algorithmic feeds",
            "Incident response: how protocols communicate during exploits",
            "Regulatory headlines vs rule text (where to read primary)",
          ],
          lab: {
            title: "Information Diet Plan",
            scenario: "Build a 30-day plan: max 3 recurring sources, weekly review slot, escalation when conflicting news.",
            deliverable: "Plan + 'panic button' checklist before signing any unexpected tx.",
            rubricHints: ["Primary sources prioritized", "Reduces doomscrolling"],
          },
          selfCheckQuestions: ["Who profits when you FOMO on a headline?", "What confirms a bridge pause is real?"],
        },
      ],
    },
    {
      id: "s3-m6",
      title: "DEX vs CEX and the Research Toolkit (Tokens, Memecoins, RWAs)",
      description:
        "Where custody and trust sit for centralized vs decentralized venues, then a structured tour of public research tools—what each is good for, what it cannot prove, and how memecoin diligence differs from RWA diligence.",
      lessons: [
        {
          id: "s3-m6-l1",
          title: "CEX vs DEX: Custody, Trust, Liquidity, and Failure Modes",
          synopsis:
            "Centralized exchanges match orders off-chain or hybrid; DEXes settle on-chain with wallet-signed txs—different counterparty, regulatory, and UX tradeoffs—not a moral hierarchy.",
          estimatedMinutes: 85,
          objectives: [
            "Explain custodial vs self-custody in terms of who can freeze or lose funds.",
            "Contrast CEX order books, internalization, and withdrawal risk with AMM DEX execution and MEV/slippage risk.",
            "List five CEX-specific failure modes and five DEX-specific failure modes without naming villains.",
          ],
          readings: [
            {
              title: "Investopedia-level CEX vs DEX primers + one major exchange proof-of-reserves explainer",
              studyGuide: "Note what attestation covers vs what it omits.",
              estimatedMinutes: 35,
            },
          ],
          lectureOutline: [
            "KYC/AML perimeter on CEX vs pseudonymous DEX (jurisdiction-dependent)",
            "API keys and subaccounts as hot-surface risk distinct from seed phrases",
            "Liquidity: displayed depth vs toxic flow; DEX routing and aggregator role",
            "Bank runs, pauses, and on-chain congestion as different 'cannot withdraw' stories",
          ],
          lab: {
            title: "Client Comparison Matrix",
            scenario:
              "Build a two-column matrix (CEX vs DEX) with rows: custody, KYC, typical fees, insolvency risk, MEV/slippage, listing quality, recovery from user error. End with 'questions to ask yourself' not buy/sell advice.",
            deliverable: "Matrix + 10-question decision guide for a hypothetical client profile (redacted).",
            rubricHints: ["No 'always use X'", "Mentions self-custody key loss"],
          },
          selfCheckQuestions: ["When is CEX custody rational for some users?", "What does DEX 'non-custodial' not protect you from?"],
        },
        {
          id: "s3-m6-l2",
          title: "The Research Stack: Aggregators, Explorers, Analytics, Security, and RWA Sources",
          synopsis:
            "A categorized tool menu you can hand to clients—each tool has strengths, blind spots, and privacy or paywall caveats. Tools evolve; the category logic persists.",
          estimatedMinutes: 92,
          objectives: [
            "Pick appropriate tool categories for: price history, holder distribution, TVL, contract verification, memecoin launch monitoring, and RWA disclosures.",
            "Explain why two aggregators can disagree on price or market cap.",
            "Describe how paid analytics (e.g. Nansen-class) can help and how it can still mislead.",
          ],
          readings: [
            {
              title: "Documentation landing pages for: CoinGecko, DeFiLlama, Dune, one chain explorer (e.g. Etherscan + Solscan)",
              studyGuide: "Skim API/TOS sections only if interested; focus on data definitions.",
              estimatedMinutes: 50,
            },
          ],
          lectureOutline: [
            "Price & metadata: CoinGecko, CoinMarketCap — self-reported listings, circulating supply games",
            "TVL & protocol stats: DeFiLlama, Token Terminal — definitional TVL vs economic security",
            "Charts & dashboards: Dune, Flipside — creator bias; verify query logic",
            "Labels & flows: Arkham, Nansen-class — heuristics, false labels, subscription bias",
            "Explorers: Etherscan family, Solscan, Blockchair-style — internal txs, token approvals, program logs",
            "Solana memecoin monitors: Birdeye, DexScreener, Helius-enhanced explorers — pair age, liquidity lock heuristics",
            "Security heuristics (not verdicts): GoPlus / Token Sniffer-class scanners, audit report repositories — false positives",
            "RWA orientation: rwa.xyz, protocol docs (Centrifuge, Ondo-class), SEC EDGAR for US-traded wrappers, ratings where applicable — law != chain",
            "Optional sentiment: LunarCrush / Santiment-class — correlation ≠ causation",
          ],
          lab: {
            title: "Build a Personal 'Research OS' Doc",
            scenario:
              "Create a living doc: sections for Token / Memecoin / RWA / NFT; under each, list tools (with URLs), one-line 'good for', one-line 'cannot prove', and privacy note if any.",
            deliverable: "Doc (minimum 25 distinct tools or data sources across categories) + 5-minute Loom-style script outline (text).",
            rubricHints: ["Includes at least 3 RWA-specific sources", "Includes revoke/approval tools (Revoke.cash etc.)", "Notes paid vs free"],
          },
          selfCheckQuestions: ["Why can market cap be nonsense for thin float tokens?", "What question can no dashboard answer?"],
        },
        {
          id: "s3-m6-l3",
          title: "Memecoins vs RWAs: Different Evidence Bars, Same Skepticism Muscle",
          synopsis:
            "Memecoins reward fast liquidity and attention games; RWAs reward legal enforceability and oracle truth—tooling overlaps at the chain layer but diligence diverges.",
          estimatedMinutes: 88,
          objectives: [
            "Draft a memecoin quick-diligence checklist (deployer, LP, snipers, metadata, social compromise).",
            "Draft an RWA checklist (issuer, trustee, bankruptcy remoteness, oracle, redemption, jurisdiction).",
            "Explain why 'backed by real assets' on a website is weaker than verifiable attestations and filings.",
          ],
          readings: [
            {
              title: "One serious RWA protocol's investor FAQ + one academic or industry RWA risk brief",
              studyGuide: "Extract legal vs on-chain claims.",
              estimatedMinutes: 45,
            },
          ],
          lectureOutline: [
            "Memecoins: launchpads, bonding curves, migration rugs, dev-wallet patterns (pattern language only)",
            "RWAs: bank-grade ops, AML on redemption, upgrade keys on permissioned tokens",
            "Regulatory fragmentation: same ticker, different wrapper risk",
            "Cross-over scams: fake 'RWA' with unaudited mint",
          ],
          lab: {
            title: "Dual Checklists + Case Sketch",
            scenario:
              "Write two one-page checklists (Memecoin vs RWA). Then take one public memecoin narrative and one public RWA narrative (no accusations—use hypotheticals if needed) and mark which checklist items would have helped.",
            deliverable: "Checklists + 600-word reflection on false positives.",
            rubricHints: ["No pump symbols as 'examples to buy'", "Acknowledges checklist limits"],
          },
          selfCheckQuestions: ["When is liquidity lock illusory?", "What breaks an RWA if the oracle lies?"],
        },
      ],
    },
  ],
} as const;
