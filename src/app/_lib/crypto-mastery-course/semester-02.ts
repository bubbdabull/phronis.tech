import type { Semester } from "./types";

/** Semester 2 — Ethereum & EVM literacy plus multi-chain / Solana orientation (~15+ h). */
export const SEMESTER_02: Semester = {
  id: "s2",
  number: 2,
  title: "Ethereum and the EVM: Stateful Ledgers and Programmable Rules",
  description:
    "Accounts, transactions, gas as resource metering, contract deployment lifecycle, and reading Solidity—then a practical map of other chains with extended Solana focus for trading and integration literacy.",
  prerequisites: ["Semester 1 complete or placement interview"],
  modules: [
    {
      id: "s2-m1",
      title: "Accounts, Transactions, and Gas",
      description: "EVM execution model for informed users and future engineers.",
      lessons: [
        {
          id: "s2-m1-l1",
          title: "EOAs vs Contracts; Nonces and Replay Protection",
          synopsis: "Why Ethereum uses accounts, how nonces sequence transactions, and what replay means cross-chain.",
          estimatedMinutes: 80,
          objectives: [
            "Differentiate EOA and contract account capabilities.",
            "Explain nonce semantics and stuck transactions.",
            "Describe chainId's role in EIP-155 style replay protection.",
          ],
          readings: [
            {
              title: "Ethereum Yellow Paper (skim §4–5) OR ethereum.org 'Transactions'",
              studyGuide: "Yellow Paper optional; prefer docs if time-boxed.",
              estimatedMinutes: 45,
            },
          ],
          lectureOutline: [
            "World state trie vs transaction trie (conceptual)",
            "Intrinsic gas and data cost",
            "Base fee + priority fee intuition (post-1559)",
            "Pending pool as a policy surface",
          ],
          lab: {
            title: "Trace One Failed Tx",
            scenario: "Use a public explorer to find a reverted tx; explain revert reason fields and who paid gas.",
            deliverable: "10-bullet postmortem + link (testnet encouraged).",
            rubricHints: ["Correct fee payer", "Distinguishes OOG vs revert"],
          },
          selfCheckQuestions: ["Why can contracts not initiate txs alone?", "What does pending nonce gap imply?"],
        },
        {
          id: "s2-m1-l2",
          title: "Gas, Limits, and Blockspace Markets",
          synopsis: "Gas as anti-DoS + priority auction; implications for UX and MEV.",
          estimatedMinutes: 85,
          objectives: [
            "Compute rough intuition for calldata cost vs storage cost.",
            "Explain why refunds exist but are capped.",
            "Relate blockspace scarcity to L2 demand.",
          ],
          readings: [{ title: "EIP-1559 resources (ethereum.org)", studyGuide: "Focus on base fee mechanics.", estimatedMinutes: 40 }],
          lectureOutline: ["Gas meter vs out-of-gas", "Warm/cold storage (overview)", "L2 fee markets preview"],
          lab: {
            title: "Gas Budget Spreadsheet",
            scenario: "Model 3 user journeys (mint NFT, swap, bridge) with hypothetical gas rows.",
            deliverable: "Sheet + narrative on which step dominates cost and why.",
            rubricHints: ["Uses realistic units discussion", "Mentions batching"],
          },
          selfCheckQuestions: ["Why is storage expensive?", "What does 'gas golf' optimize?"],
        },
        {
          id: "s2-m1-l3",
          title: "Events, Logs, and Indexers as Read Layer",
          synopsis: "Why dApps rely on indexers; eventual consistency; reorg hazards for readers.",
          estimatedMinutes: 75,
          objectives: ["Explain log vs state read tradeoffs.", "Describe reorg impact on indexers.", "List failure modes of naive caching."],
          readings: [{ title: "The Graph or similar docs — 'subgraph' overview", studyGuide: "Conceptual only.", estimatedMinutes: 35 }],
          lectureOutline: ["LOG op semantics at user level", "Bloom filters history", "Finality for readers"],
          lab: {
            title: "Indexer Threat Model",
            scenario: "Your app trusts a hosted indexer. Enumerate 8 failure modes including operator malice.",
            deliverable: "Table + mitigation column + residual risk paragraph.",
            rubricHints: ["Includes reorg", "Includes API key theft"],
          },
          selfCheckQuestions: ["When is eth_call insufficient for history?", "What confirms a deposit on an L2?"],
        },
      ],
    },
    {
      id: "s2-m2",
      title: "Solidity Literacy for Readers",
      description: "Read contracts like technical prose: storage layout hazards, common patterns, upgrade paths.",
      lessons: [
        {
          id: "s2-m2-l1",
          title: "Contracts as State Machines; Interfaces and Proxies",
          synopsis: "Implementation vs interface; minimal proxy pattern intuition; why upgrades shift trust.",
          estimatedMinutes: 85,
          objectives: ["Sketch delegatecall proxy risk.", "Identify admin roles in typical upgradeable contracts.", "Explain why bytecode verification matters."],
          readings: [{ title: "OpenZeppelin proxy docs (overview)", studyGuide: "Diagram UUPS vs transparent.", estimatedMinutes: 40 }],
          lectureOutline: ["delegatecall semantics (high level)", "Storage collision classes", "Timelocks as social delay"],
          lab: {
            title: "Proxy Reading Assignment",
            scenario: "Pick a verified small proxy on Etherscan; narrate admin functions and upgrade event.",
            deliverable: "Annotated function list + 1-page risk commentary.",
            rubricHints: ["Names privileged roles", "Notes unverified implementation risk"],
          },
          selfCheckQuestions: ["What breaks if impl slot collides?", "Why timelock not equal decentralization?"],
        },
        {
          id: "s2-m2-l2",
          title: "Reentrancy, Checks-Effects-Interactions, and Oracle Discipline",
          synopsis: "Classic vulnerability class; oracle manipulation as mispriced truth.",
          estimatedMinutes: 90,
          objectives: ["Explain reentrancy with a storyboard.", "State CEI pattern.", "Describe TWAP vs spot oracle tradeoffs at intuition level."],
          readings: [{ title: "ConsenSys Diligence blog — reentrancy (classic post)", studyGuide: "Trace call stack mentally.", estimatedMinutes: 35 }],
          lectureOutline: ["External calls as control transfer", "Read-only reentrancy preview", "Oracle delay vs freshness"],
          lab: {
            title: "Break a Toy Spec",
            scenario: "Given pseudocode with external call before balance update, rewrite with CEI + explain residual risks.",
            deliverable: "Code diff + 5-sentence threat note.",
            rubricHints: ["Correct ordering", "Mentions cross-function reentrancy"],
          },
          selfCheckQuestions: ["Why do flash loans amplify oracle attacks?", "What does pauseability buy?"],
        },
        {
          id: "s2-m2-l3",
          title: "Tokens: ERC-20 Mental Model and Allowances",
          synopsis: "Infinite approvals culture vs least privilege; permit patterns; decimals footguns.",
          estimatedMinutes: 80,
          objectives: ["Walk approve/transferFrom flow.", "Explain allowance phishing.", "Discuss decimals assumptions in UIs."],
          readings: [{ title: "EIP-20 spec (skim)", studyGuide: "Focus on events and edge cases.", estimatedMinutes: 30 }],
          lectureOutline: ["Mint/burn vs transfer", "Blocklist extenders (high level)", "Bridged token identity problem"],
          lab: {
            title: "Allowance Policy",
            scenario: "Design policy for a treasury multisig interacting with unknown DeFi protocols.",
            deliverable: "Policy doc + examples of safe max approvals vs per-tx approvals.",
            rubricHints: ["Operationalizes least privilege", "Mentions revoke flows"],
          },
          selfCheckQuestions: ["Why is permit attractive to integrators?", "What breaks if decimals=0 assumption fails?"],
        },
      ],
    },
    {
      id: "s2-m3",
      title: "L2s, Rollups, and Bridging (User + Architect View)",
      description: "Optimistic vs ZK rollup trust assumptions; bridges as the most dangerous UX in crypto.",
      lessons: [
        {
          id: "s2-m3-l1",
          title: "Rollup Taxonomy Without Marketing",
          synopsis: "DA layers, settlement, proving, escape hatches—vocabulary to cut through L2 Twitter.",
          estimatedMinutes: 85,
          objectives: ["Contrast optimistic and validity proving at trust level.", "Define data availability in one paragraph.", "Explain forced inclusion / delay games at user level."],
          readings: [{ title: "L2Beat or rollup.wiki (overview pages)", studyGuide: "Take notes on trust model table.", estimatedMinutes: 45 }],
          lectureOutline: ["Sovereign vs classic rollups (hand-wavy OK)", "Sequencer role and liveness", "Stage decentralization rubrics"],
          lab: {
            title: "Bridge a Coffee Amount on Testnet",
            scenario: "Use official testnet bridges only; document each signature you approved and what each meant.",
            deliverable: "Step journal + trust assumptions per step.",
            rubricHints: ["Testnet only", "Explains each signature"],
          },
          selfCheckQuestions: ["What does a 7-day challenge window buy?", "When is a rollup not a rollup?"],
        },
        {
          id: "s2-m3-l2",
          title: "Bridge Exploits Casebook (Analytic, Not Sensational)",
          synopsis: "Validator compromise, logic bugs, configuration errors—pattern recognition for due diligence.",
          estimatedMinutes: 80,
          objectives: ["Cluster historical bridge failures into categories.", "Extract diligence questions for integrators.", "Discuss disclosure norms."],
          readings: [{ title: "Rekt or similar postmortems (pick 3, diverse mechanisms)", studyGuide: "Focus on root cause classes.", estimatedMinutes: 50 }],
          lectureOutline: ["Mint vs lock/unlock models", "Token mapping errors", "Upgrade key compromise"],
          lab: {
            title: "Due Diligence Checklist",
            scenario: "Your DAO will custody via a bridge vendor. Produce a 30-question checklist with severity tags.",
            deliverable: "Checklist + 2-page rationale for top 10 questions.",
            rubricHints: ["Covers upgrade keys", "Covers monitoring"],
          },
          selfCheckQuestions: ["Why are fast bridges suspicious by default?", "What is an escape hatch test?"],
        },
        {
          id: "s2-m3-l3",
          title: "Interoperability Standards (IBC, CCIP at brochure level)",
          synopsis: "Where standards help; where heterogeneity remains; why 'one chain' is not the roadmap.",
          estimatedMinutes: 75,
          objectives: ["State what IBC solves in one sentence.", "Contrast messaging vs bridging assets.", "Identify oracle dependency in cross-chain messaging."],
          readings: [{ title: "Cosmos IBC docs intro + Chainlink CCIP overview", studyGuide: "Brochure depth only.", estimatedMinutes: 40 }],
          lectureOutline: ["Light clients vs honest majority bridges", "Latency vs trust tradeoff", "Operational runbooks"],
          lab: {
            title: "Integration Memo",
            scenario: "Pick two protocols; compare trust assumptions in a memo for executives (non-engineering).",
            deliverable: "2-page memo + glossary appendix.",
            rubricHints: ["No hand-waving 'decentralized'", "Defines trust anchors"],
          },
          selfCheckQuestions: ["When is messaging sufficient without minting?", "What is liveness vs safety?"],
        },
      ],
    },
    {
      id: "s2-m4",
      title: "Multi-Chain Landscape and Solana for Active Users",
      description:
        "How major ecosystems differ in fees, finality, and tooling; deep Solana mental models (accounts, SPL, priority fees) and scam patterns common on high-throughput chains.",
      lessons: [
        {
          id: "s2-m4-l1",
          title: "L1 / L2 Mental Map: Liquidity, Finality, and Where Risk Concentrates",
          synopsis:
            "Bitcoin as settlement/sovereign money, Ethereum as programmable liquidity hub, Solana/Cosmos/Avalanche/etc. as alternate execution venues—without tribal marketing.",
          estimatedMinutes: 82,
          objectives: [
            "Compare fee volatility and confirmation UX across at least three ecosystem types.",
            "Explain why liquidity and oracle liquidity often matter more to traders than TPS headlines.",
            "Name three reasons users bridge assets and the trust each reason introduces.",
          ],
          readings: [
            {
              title: "ethereum.org 'Networks' + Solana docs 'Clusters and Endpoints' (overview)",
              studyGuide: "Build a one-page comparison table: finality, native gas asset, dominant wallet UX.",
              estimatedMinutes: 40,
            },
          ],
          lectureOutline: [
            "Shared security vs independent validator sets",
            "Native vs bridged asset identity problem (preview)",
            "Where NFT and memecoin culture clusters and why that shifts scam types",
          ],
          lab: {
            title: "Client Explainer One-Pager",
            scenario:
              "A client asks 'Should I use Solana or Ethereum for trading?' Write a neutral one-pager: no recommendations, only tradeoffs and questions they must answer.",
            deliverable: "One-pager + glossary of 8 terms (L1, L2, finality, etc.).",
            rubricHints: ["No price talk", "Mentions custody and bridge risk"],
          },
          selfCheckQuestions: ["Why is low fee not the same as low risk?", "What does 'finality' mean for a seller?"],
        },
        {
          id: "s2-m4-l2",
          title: "Solana Architecture: Accounts, Programs, SPL Tokens, and ATAs",
          synopsis:
            "Solana is account-oriented, not contract-oriented: programs are stateless, data lives in accounts—this changes how you read explorers and why rent and CU limits exist.",
          estimatedMinutes: 90,
          objectives: [
            "Contrast EVM contract storage with Solana program-derived addresses (PDAs) at intuition level.",
            "Explain Associated Token Account (ATA) and why wallets 'create token accounts'.",
            "Describe compute units and how they relate to failed transactions that still charge fees.",
          ],
          readings: [
            {
              title: "Solana Cookbook — Core Concepts + SPL Token overview",
              studyGuide: "Follow one SPL transfer on explorer from signer through token accounts.",
              estimatedMinutes: 50,
            },
          ],
          lectureOutline: [
            "Signatures vs partial signing / multisig on Solana (brochure)",
            "Rent-exempt minimums and account closure",
            "Versioned transactions and address lookup tables (why wallets upgraded)",
          ],
          lab: {
            title: "Explorer Trace",
            scenario: "On devnet or mainnet, trace one successful SPL transfer and one failed tx (excess compute or slippage).",
            deliverable: "Annotated screenshot set or bullet walkthrough naming each account role.",
            rubricHints: ["Names fee payer", "Explains program id vs program account confusion"],
          },
          selfCheckQuestions: ["Who pays rent for a new token account?", "Why can 'insufficient funds' mean SOL for fees not token balance?"],
        },
        {
          id: "s2-m4-l3",
          title: "Solana Trading Stack: Jupiter, Priority Fees, Staking, and Local MEV Reality",
          synopsis:
            "How swaps are routed; priority fees vs base fee; staking SOL for network security; Jito-style blockspace and why fast chains still have ordering games.",
          estimatedMinutes: 88,
          objectives: [
            "Explain aggregator routing in plain language and why quoted price moves.",
            "Set sensible priority-fee intuition without chasing toxic auction dynamics blindly.",
            "List five Solana-specific scams or phishing patterns targeting active traders.",
          ],
          readings: [
            {
              title: "Jupiter docs (swap overview) + Solana priority fees FAQ",
              studyGuide: "Note slippage, direct routes, and price impact fields.",
              estimatedMinutes: 45,
            },
          ],
          lectureOutline: [
            "Jito / bundle auctions at high level (ordering, not how-to exploit)",
            "Wallet simulation limits and blind-sign hazards",
            "RPC reliability: why 'same chain' can feel different by endpoint",
          ],
          lab: {
            title: "Solana Safety Checklist for Clients",
            scenario: "Produce a 25-item checklist for retail clients who will trade and mint on Solana (testnet ok for practice links).",
            deliverable: "Checklist grouped: wallet, approvals, mints, DMs, bridges, support scams.",
            rubricHints: ["Includes 'verify site on multiple channels'", "Includes revoke/least-privilege"],
          },
          selfCheckQuestions: ["When does a priority fee not land your tx?", "Why is Discord support almost always a scam?"],
        },
      ],
    },
  ],
} as const;
