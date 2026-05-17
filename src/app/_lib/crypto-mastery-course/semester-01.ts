import type { Semester } from "./types";

/** Semester 1 — ~12 clock hours: money, cryptography, Bitcoin, first wallet hygiene. */
export const SEMESTER_01: Semester = {
  id: "s1",
  number: 1,
  title: "Foundations: Money, Trust, and Cryptography",
  description:
    "Build mental models before touching chains: what a ledger is, why cryptography replaces trusted third parties, and how Bitcoin demonstrates the model in production.",
  prerequisites: ["Comfort with high-school algebra", "Willingness to read primary sources (whitepapers, docs)"],
  modules: [
    {
      id: "s1-m1",
      title: "What Problem Does Crypto Actually Solve?",
      description: "Separate hype from engineering: coordination, scarcity, and verifiable rules without a single operator.",
      lessons: [
        {
          id: "s1-m1-l1",
          title: "Ledgers, Double Spending, and the Role of a Neutral Record",
          synopsis:
            "Why societies invented ledgers, how double-spending breaks digital cash, and what a neutral append-only log buys you.",
          estimatedMinutes: 85,
          objectives: [
            "Define a ledger and identify who traditionally maintains it.",
            "Explain double spending and why it is harder in physical cash than naive digital files.",
            "Contrast trusted third parties with protocol-enforced rules.",
          ],
          readings: [
            {
              title: "Nakamoto (2008) — Bitcoin whitepaper §1–2",
              studyGuide: "Read for intent, not mining math yet. Annotate every claim about trust.",
              estimatedMinutes: 55,
            },
            {
              title: "Optional: Keynes on money as social convention (skim)",
              studyGuide: "One chapter or lecture notes; focus on 'moneyness' vs intrinsic value.",
              estimatedMinutes: 35,
            },
          ],
          lectureOutline: [
            "History of ledgers: clay tablets → databases → replicated logs",
            "Double spending as a coordination failure",
            "Settlement vs messaging; finality as an economic concept",
            "Why 'just use a database' is not wrong—but defines who you trust",
          ],
          lab: {
            title: "Ledger Thought Experiment",
            scenario:
              "You run a small game economy. Two players claim the same sword item offline-first. Write a one-page policy: who is authoritative, what breaks, and how you would detect inconsistency.",
            deliverable: "Policy memo (500–800 words) + diagram of trust boundaries.",
            rubricHints: [
              "Identifies single point of failure",
              "Names attack when clocks skew or clients lie",
              "Proposes at least one cryptographic mitigation (even if vague)",
            ],
          },
          selfCheckQuestions: [
            "Why is 'most recent write wins' a political choice, not a law of physics?",
            "What does finality buy a merchant that eventual consistency does not?",
          ],
        },
        {
          id: "s1-m1-l2",
          title: "Hash Functions and Commitments: Hiding vs Binding",
          synopsis:
            "Hash properties used everywhere in crypto: preimage resistance, second-preimage resistance, collision resistance; commitments and Merkle intuition.",
          estimatedMinutes: 90,
          objectives: [
            "State properties of cryptographic hash functions in plain English.",
            "Explain a hash commitment (hide now, reveal later).",
            "Sketch why Merkle trees scale membership proofs.",
          ],
          readings: [
            {
              title: "Katz–Lindell (skim) or any intro crypto chapter on hash functions",
              studyGuide: "Focus on definitions; skip proofs unless you enjoy them.",
              estimatedMinutes: 50,
            },
          ],
          lectureOutline: [
            "Random oracle intuition (carefully: engineering model, not reality)",
            "SHA-256 family at a high level; why length-extension matters for designers",
            "Merkle trees: O(log n) proofs and state roots",
            "Common misuse: hashing secrets without salts (preview of wallets module)",
          ],
          lab: {
            title: "Build a Tiny Merkle Proof by Hand",
            scenario:
              "Given four leaf strings L1..L4, compute parent hashes with a toy hash H(x)=decimal checksum of x (invented for pencil work). Produce root and a membership proof for L3.",
            deliverable: "Hand worksheet photo or typed table + 5-sentence explanation of verification steps.",
            rubricHints: ["Correct tree shape", "Proof path explicit", "States what verifier checks"],
          },
          selfCheckQuestions: [
            "Why does collision resistance imply second-preimage resistance is not automatic?",
            "Where in Bitcoin do Merkle roots appear and why?",
          ],
        },
        {
          id: "s1-m1-l3",
          title: "Public-Key Cryptography and Digital Signatures (Conceptual)",
          synopsis:
            "Key pairs, signing vs encryption, why possession of a private key is equated to identity in many systems—and why that is dangerous.",
          estimatedMinutes: 80,
          objectives: [
            "Contrast symmetric vs asymmetric cryptography at workflow level.",
            "Describe a digital signature's inputs/outputs without implementing one.",
            "List three ways private keys are lost or stolen in practice.",
          ],
          readings: [
            {
              title: "Ethereum docs — 'Accounts' overview (conceptual)",
              studyGuide: "Read for terminology: EOA, nonce, gas as anti-spam, not for Solidity yet.",
              estimatedMinutes: 40,
            },
          ],
          lectureOutline: [
            "Keygen, sign, verify pipeline",
            "Non-repudiation vs repudiation in business contexts",
            "Hardware vs software keys; threat model differences",
            "Why 'not your keys, not your coins' is a custody statement, not a moral law",
          ],
          lab: {
            title: "Threat Model Worksheet",
            scenario:
              "Persona: remote employee with company funds on a hot wallet. Enumerate 10 threats (insider, malware, SIM swap, travel, etc.) and map mitigations.",
            deliverable: "2-column table + 1-page executive summary prioritizing top 3 risks.",
            rubricHints: ["Concrete scenarios", "Mitigations tied to threats", "Acknowledges residual risk"],
          },
          selfCheckQuestions: [
            "Why is phishing a signature protocol problem and a UX problem?",
            "What does multisig change in the threat model vs single-sig?",
          ],
        },
      ],
    },
    {
      id: "s1-m2",
      title: "Bitcoin: Consensus Without a Company",
      description: "Proof-of-work, longest-chain rule, mining economics, and what Bitcoin does *not* solve.",
      lessons: [
        {
          id: "s1-m2-l1",
          title: "UTXOs, Script (Bird's-Eye), and the Block Chain as Evidence",
          synopsis:
            "Bitcoin's state model: unspent outputs, simple script conditions, and why verification is cheap but reordering is costly.",
          estimatedMinutes: 85,
          objectives: [
            "Explain UTXO vs account model tradeoffs without deriding either.",
            "Describe block header fields that matter for light clients.",
            "Articulate what miners buy with electricity and sell to the network.",
          ],
          readings: [
            {
              title: "Bitcoin Developer Guide — UTXO (selected sections)",
              studyGuide: "Trace a 1-input 2-output transaction on a block explorer as you read.",
              estimatedMinutes: 50,
            },
          ],
          lectureOutline: [
            "UTXO graph mental model",
            "Script types at catalog level (P2PKH, P2SH, SegWit)",
            "Difficulty adjustment as negative feedback loop",
            "Fee market basics",
          ],
          lab: {
            title: "Explorer Trace",
            scenario: "Pick any recent small Bitcoin tx. Paste IDs redacted if you like. Narrate inputs/outputs, fee rate, confirmations.",
            deliverable: "Annotated screenshot set + 10 bullet walkthrough.",
            rubricHints: ["Correct UTXO direction", "Fee units explained", "Mentions confirmation depth"],
          },
          selfCheckQuestions: [
            "Why is account abstraction a different design axis than UTXO?",
            "What does 'reorg depth' mean for a coffee purchase vs house purchase?",
          ],
        },
        {
          id: "s1-m2-l2",
          title: "Proof-of-Work, Difficulty, and the Byzantine Generals Story",
          synopsis:
            "Link PoW to probabilistic finality, selfish mining at intuition level, and energy as an economic fence—not a moral verdict.",
          estimatedMinutes: 80,
          objectives: [
            "Explain PoW puzzle in one paragraph without fake precision.",
            "Contrast probabilistic finality with BFT small-committee finality (preview).",
            "Discuss energy use as a security budget vs externalities trade space.",
          ],
          readings: [
            {
              title: "Original selfish mining paper (abstract + intro only)",
              studyGuide: "Goal: vocabulary, not exam on math.",
              estimatedMinutes: 35,
            },
          ],
          lectureOutline: [
            "Byzantine failures and impossibility hints",
            "PoW as repeated lottery tied to hashpower",
            "MEV preview: ordering is valuable (bridge to semester 6)",
            "Why ASICs exist",
          ],
          lab: {
            title: "Policy Memo: Finality vs Energy",
            scenario:
              "Municipal board asks whether to ban PoW mining. Write a neutral technical memo: security tradeoffs, grid impacts, measurement pitfalls.",
            deliverable: "2-page memo with citations to primary sources or official reports.",
            rubricHints: ["Separates facts/values", "Defines metrics", "Acknowledges uncertainty"],
          },
          selfCheckQuestions: [
            "If hash rate drops 40% overnight, what changes for users first?",
            "Why is 'green crypto' a systems engineering claim, not a ticker?",
          ],
        },
        {
          id: "s1-m2-l3",
          title: "Light Clients, SPV Intuition, and Trust Assumptions",
          synopsis:
            "What phones can verify, what they must trust peers for, and why fraud proofs / ZK rollups revisit the same theme later.",
          estimatedMinutes: 75,
          objectives: [
            "Contrast full node, pruned node, and light client trust models.",
            "Explain why header chain alone is insufficient for full security.",
            "Name at least two attacks on naive light clients.",
          ],
          readings: [
            {
              title: "Bitcoin Wiki or docs on SPV (overview)",
              studyGuide: "Focus on what is trusted vs verified.",
              estimatedMinutes: 30,
            },
          ],
          lectureOutline: [
            "Header chain sync",
            "Bloom filters history (and why privacy mattered)",
            "Bridge to Ethereum light clients and L2 proofs",
          ],
          lab: {
            title: "Trust Budget Diagram",
            scenario: "Draw a trust stack for: mobile wallet, RPC provider, indexer, hardware signer.",
            deliverable: "Diagram + 300-word legend mapping each trust assumption.",
            rubricHints: ["No magical 'decentralized' label without meaning", "Names concrete failures"],
          },
          selfCheckQuestions: [
            "What does an honest majority of hash power buy a light client?",
            "When is an RPC provider a custodian in disguise?",
          ],
        },
      ],
    },
    {
      id: "s1-m3",
      title: "Wallets, Seeds, and Survival Skills",
      description: "Operational literacy: backups, passphrase myths, address formats, and first incident response.",
      lessons: [
        {
          id: "s1-m3-l1",
          title: "Seed Phrases, Derivation Paths, and the Cost of Convenience",
          synopsis:
            "BIP-39/44 intuition: entropy, checksum, HD wallets; why the same seed can produce many chains if misconfigured.",
          estimatedMinutes: 85,
          objectives: [
            "Describe what a seed phrase encodes at a high level.",
            "Explain why derivation paths matter when restoring wallets.",
            "List common backup failures and social engineering patterns.",
          ],
          readings: [
            {
              title: "BIP-39 + BIP-44 skims (official proposals)",
              studyGuide: "Do not generate real money keys in class exercises; use testnets only.",
              estimatedMinutes: 45,
            },
          ],
          lectureOutline: [
            "Entropy sources and user-generated 'randomness' failures",
            "Passphrase (25th word) threat and benefit",
            "Hot vs cold vs airgapped vs multisig",
            "Address reuse and privacy leaks",
          ],
          lab: {
            title: "Backup Drill (Testnet Only)",
            scenario:
              "Create a throwaway testnet wallet in software you trust for education. Document backup steps you would give a non-technical relative—then attempt restore on a second device.",
            deliverable: "Checklist + reflection on what could go wrong in production.",
            rubricHints: ["Explicit testnet disclaimer", "No mainnet keys in submission", "Restore verified"],
          },
          selfCheckQuestions: [
            "Why is photographing a seed phrase a category error for many threat models?",
            "What breaks if two wallets use different derivation paths?",
          ],
        },
        {
          id: "s1-m3-l2",
          title: "Addresses, QR Codes, and Human Factors in Transfers",
          synopsis:
            "Checksums, clipboard malware, 'address poisoning', and why humans should not be the final verification layer alone.",
          estimatedMinutes: 70,
          objectives: [
            "Explain address checksums at user level.",
            "Describe clipboard hijacking and UI spoofing.",
            "Propose UX patterns that reduce mis-send risk.",
          ],
          readings: [
            {
              title: "Wallet vendor security guides (pick two major wallets, compare)",
              studyGuide: "Extract commonalities; note marketing vs engineering language.",
              estimatedMinutes: 40,
            },
          ],
          lectureOutline: [
            "Base58Check / Bech32 at 'what problem does this solve' level",
            "Poisoning attacks on explorers and recent-address lists",
            "Small payments as canaries",
          ],
          lab: {
            title: "Design a Safe-Send Flow",
            scenario: "Sketch wireframes for sending to a new counterparty with layered confirmations.",
            deliverable: "3 screens + 10 bullet rationale referencing known failure modes.",
            rubricHints: ["Addresses power users and novices", "Includes failure recovery"],
          },
          selfCheckQuestions: [
            "Why do some teams ban pasting addresses altogether?",
            "What does an ENS name solve and not solve?",
          ],
        },
        {
          id: "s1-m3-l3",
          title: "Incidents 101: From Suspicious DM to Containment",
          synopsis:
            "First 60 minutes after a suspected compromise: revoke sessions, rotate keys, preserve evidence, and avoid panic trades.",
          estimatedMinutes: 75,
          objectives: [
            "Draft an incident checklist for a retail user with exchange + self-custody.",
            "Identify what evidence is admissible vs useless for law enforcement vs banks.",
            "Explain why 'move funds fast' can worsen outcomes.",
          ],
          readings: [
            {
              title: "CISA-style incident response primer (generic IT)",
              studyGuide: "Map generic steps to wallet-specific actions.",
              estimatedMinutes: 35,
            },
          ],
          lectureOutline: [
            "Containment vs eradication vs recovery",
            "Exchange account locks and ticket timelines",
            "Chainalysis myths vs realistic expectations",
            "When to involve professionals",
          ],
          lab: {
            title: "Runbook Authoring",
            scenario: "Write a one-page runbook for: suspected seed photo leak.",
            deliverable: "Ordered steps + who to contact + what not to do.",
            rubricHints: ["Cold-headed ordering", "Mentions chain freezes where applicable"],
          },
          selfCheckQuestions: [
            "Why is 'prove ownership' hard after keys are gone?",
            "What is safe to post publicly after an incident?",
          ],
        },
      ],
    },
  ],
} as const;
