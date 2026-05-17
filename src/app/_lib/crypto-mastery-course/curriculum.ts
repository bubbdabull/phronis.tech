import type { CryptoMasteryProgram } from "./types";

import { SEMESTER_01 } from "./semester-01";
import { SEMESTER_02 } from "./semester-02";
import { SEMESTER_03 } from "./semester-03";
import { SEMESTER_04 } from "./semester-04";
import { SEMESTER_05 } from "./semester-05";
import { SEMESTER_06 } from "./semester-06";

/**
 * Full six-semester program. Lesson `estimatedMinutes` are structured contact + core study time
 * per lesson (labs and readings often add comparable time — see `catalogDescription`).
 */
export const CRYPTO_MASTERY_PROGRAM: CryptoMasteryProgram = {
  version: "1.2.0",
  title: "Crypto Mastery",
  subtitle: "A six-semester technical curriculum from first principles to professional synthesis",
  catalogDescription:
    "This program moves from ledgers and cryptography through Bitcoin and Ethereum literacy, adds a multi-chain map with extended Solana orientation (accounts, SPL, Jupiter, priority fees, local MEV and scam patterns), then covers digital assets with NFT rug and wash-trading literacy, retail trading habits, execution hygiene, a dedicated module on CEX vs DEX trust and failure modes, and a broad research toolkit for tokens, memecoins, and RWAs (aggregators, explorers, TVL dashboards, on-chain analytics, scanners—with honesty about limits and paywalls). DAOs, DeFi, security, and capstone follow. Semesters 2–3 include extra applied modules. Each lesson targets roughly 75–90 minutes of structured time, with readings and labs typically adding substantial hours. Nominal lesson time across the full catalog exceeds 90 hours; with readings, labs, and capstone, expect well over 180 hours.",
  learningOutcomes: [
    "Explain how replicated ledgers, hash functions, and public-key cryptography replace specific trusted third parties—and where trust remains.",
    "Analyze Bitcoin-style UTXO consensus and Ethereum-style accounts, gas, and contracts at the level of informed users and junior integrators.",
    "Compare major chain ecosystems and apply Solana-specific concepts (accounts, SPL, fees, routing) when advising clients on trading and custody hygiene.",
    "Evaluate token, NFT, DAO, and DeFi designs using mechanism-based reasoning; spot common social and technical rug patterns without relying on hype metrics.",
    "Contrast CEX and DEX custody and execution risks, and assemble a defensible research workflow across aggregators, explorers, analytics platforms, and RWA disclosure sources.",
    "Threat-model wallets, bridges, and protocol surfaces; interpret audits and incident postmortems constructively.",
    "Describe MEV, privacy, and scaling tradeoffs without slogans, and communicate limits to technical and executive audiences.",
    "Scope and deliver a capstone artifact with honest limitations, reproducible notes, and responsible disclosure instincts.",
  ],
  academicIntegrityNote:
    "Labs and written work should be your own analysis. When you summarize public postmortems, papers, or code, cite sources. Collaboration is permitted only where the instructor says so, and must be declared. Do not submit wallet secrets, private keys, or personally identifying financial records—use testnets and redacted examples.",
  disclaimer:
    "This curriculum is for technical education only. It is not investment, tax, or legal advice. Blockchains involve irreversible loss of funds; follow local laws and institutional policies. Primary sources and professional counsel remain authoritative where this material simplifies.",
  semesters: [SEMESTER_01, SEMESTER_02, SEMESTER_03, SEMESTER_04, SEMESTER_05, SEMESTER_06],
} as const;
