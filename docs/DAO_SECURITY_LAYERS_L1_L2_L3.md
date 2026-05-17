# Phronis DAO — security layers (L1 / L2 / L3)

**Important:** This document uses **L1 / L2 / L3** only for **defense-in-depth security architecture** (on-chain → off-chain → application). It is **not** the same thing as **membership tiers** in Supabase (`members.membership_tier`: `L1` | `L2` | `L3`), which describe product access / status.

When designing the DAO **smart contract**, APIs, and ops, map controls to the layers below so reviews and audits stay clear.

For the **member app surface** (Welcome, profile, sync, Academy, DAO access API), see [MEMBER_SECTION_SECURITY_L1_L2_L3.md](./MEMBER_SECTION_SECURITY_L1_L2_L3.md).

---

## Layer 1 — On-chain (base trust zone)

**What it is:** Rules and assets that execute on Solana without trusting your Next.js server.

**Typical controls**

- Program-derived addresses (PDAs), upgrade authority / multisig for the program.
- Token gates (e.g. PHR mint balance or stake) enforced in program logic.
- Treasury / timelock / voting outcomes finalized on-chain.
- Explicit instruction constraints (signers, account ownership, CPI allowlists).

**Phronis today (partial)**

- PHR mint and balance reads for gates (`NEXT_PUBLIC_PHRONIS_DAO_TOKEN_MINT`, server RPC).
- Future: Anchor (or native) program for proposals, treasury, or attestation anchors that **only** L2 is allowed to touch via signed, constrained messages.

**Design rule:** If it can be wrong when the server is compromised, prefer **L1** enforcement or **L1 + L2** with a narrow on-chain check of the attestation.

---

## Layer 2 — Off-chain trust & orchestration

**What it is:** Servers, indexers, identity, databases, and signed payloads that **coordinate** with L1 but are not the chain itself.

**Typical controls**

- **Privy:** access tokens, server-side user resolution (`PRIVY_APP_SECRET`), optional identity checks where rate limits allow.
- **Supabase:** service-role only from trusted API routes; RLS denying direct client writes on sensitive tables; migrations as schema contracts.
- **Oracles / indexers:** Helius, webhooks, signed summaries that L1 instructions verify (hash, expiry, signer pubkey baked into program).
- **Cross-layer:** “L2 posts a compact attestation; L1 verifies signature + replay protection.”

**Phronis today**

- `/api/members/*`, `/api/onboarding/sync`, `/api/desk/*` — Bearer verification then Supabase admin client.
- In-memory rate limits (replace with Redis/Upstash in production per [MEMBER_TERMINAL_ROADMAP.md](./MEMBER_TERMINAL_ROADMAP.md)).

**Design rule:** L2 must **assume** API keys and DB credentials can leak; minimize blast radius (scoped keys, no silent admin on client).

---

## Layer 3 — Application & operational security

**What it is:** Everything around the product: UX policy, abuse handling, and human/process controls.

**Typical controls**

- Rate limits, CAPTCHA (Privy), input validation, CORS/CSP, secrets rotation.
- Moderation (member social, chat), audit logs (`admin_audit_log` on desk), on-call runbooks.
- Feature flags, kill switches, anomaly alerts on spend or auth failures.

**Phronis today**

- `ProtectedRoute`, dashboard shell, env-based feature toggles.
- Desk admin audit table (schema) — wire enforcement as APIs mature.

**Design rule:** L3 **never** replaces L1/L2 for financial or governance safety; it reduces abuse and operational mistakes.

---

## Summary matrix

| Layer | Zone        | Primary question                         | Example in Phronis                          |
|-------|-------------|------------------------------------------|---------------------------------------------|
| **L1** | On-chain    | What does Solana enforce?                | Program rules, treasury, token checks       |
| **L2** | Off-chain   | What does the server/indexer attest?   | Privy + Supabase APIs, signed oracle data   |
| **L3** | Application | What does the app + ops enforce?       | Rate limits, moderation, audit, monitoring  |

---

## Naming in code and UI

- Use **“security L1 / L2 / L3”** (or “DAO security layers”) in DAO governance docs and contract comments.
- Keep using **membership `L1`/`L2`/`L3`** only for **member tier** in `members` / product copy to avoid confusion.

When you add a DAO program README or UI explainer, link here and repeat the distinction once in the first screen.
