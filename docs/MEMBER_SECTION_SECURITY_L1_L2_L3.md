# Member section — L1 / L2 / L3 security model

This applies **security layers** (on-chain / off-chain / application) to everything in the **member workspace**: Welcome, profile APIs, onboarding sync, Academy member APIs, DAO access checks, and legacy `member_profiles` routes.

**Not** the same as **membership tier** labels (`members.membership_tier`: `L1` | `L2` | `L3`). Those are product tiers. Security L1–L3 are defined in [DAO_SECURITY_LAYERS_L1_L2_L3.md](./DAO_SECURITY_LAYERS_L1_L2_L3.md).

---

## Layer 1 — On-chain (where the member product touches Solana)

| Control | Member-area use |
|--------|------------------|
| PHR / SOL balances from RPC | DAO gate [`/api/dao/access`](../src/app/api/dao/access/route.ts), onboarding wallet sync balances |
| Future DAO program | Signed proposals, treasury — extend when Anchor ships |

**Rule:** Anything that must stay true if the API server is wrong should eventually be provable or enforced on L1 (or via L1-verified attestations from L2).

---

## Layer 2 — Off-chain (server trust boundary)

| Control | Implementation |
|--------|------------------|
| Identity | Privy **access token** verified on every member API (`requirePrivySession` / `requireMember` in [`member-auth.ts`](../src/app/_lib/member-auth.ts)) |
| Data access | **Supabase service role** only inside route handlers; no anon writes on `members` / `wallets` / course tables |
| Scoped reads | Queries always keyed by `privy_id` / `member_id` from the verified session — never from raw client IDs without verification |

**Rule:** Treat the Next.js server as the trust anchor for L2; keys live in env, not the browser.

---

## Layer 3 — Application (abuse resistance + UX gates)

| Control | Implementation |
|--------|------------------|
| Rate limits | [`member-api-l3.ts`](../src/app/_lib/member-api-l3.ts) — per-IP + per-user buckets per route (`read` / `write` / `sync` / `quiz`) |
| Auth UI gate | [`ProtectedRoute`](../src/app/_components/onboarding/protected-route.tsx) on dashboard layout — unauthenticated users never reach member pages |
| Validation | Zod on PATCH bodies (e.g. profile), quiz payloads |

**Rule:** L3 reduces cost and abuse; it does **not** replace L2 (auth) or L1 (economic truth on-chain).

---

## Route map (L3 `member_l3:user:…` route keys)

| Route | L3 kind | Notes |
|-------|---------|--------|
| `GET /api/members/me` | `read` | `members_me` |
| `PATCH /api/members/profile` | `write` | `members_profile_patch` |
| `POST /api/onboarding/sync` | `sync` | `onboarding_sync` |
| `GET /api/member/profile` | `read` | `member_profile_get` |
| `POST /api/member/sync` | `sync` | `member_profile_sync` |
| `GET /api/dao/access` | `read` | `dao_access` — L1 read via `fetchWalletBalances` |
| `GET /api/members/course/progress` | `read` | `members_course_progress` |
| `GET /api/members/course/quiz/[moduleId]` | `read` | `members_course_quiz_get` |
| `POST /api/members/course/quiz/submit` | `quiz` | `members_course_quiz_submit` |
| `GET /api/members/social/directory` | `read` | `members_social_directory` |
| `GET /api/members/social/friends` | `read` | `members_social_friends` |
| `GET /api/members/social/requests` | `read` | `members_social_requests_get` |
| `POST /api/members/social/requests` | `write` | `members_social_requests_post` |
| `PATCH /api/members/social/requests/[id]` | `write` | `members_social_requests_patch` |
| `GET /api/members/social/groups` | `read` | `members_social_groups_get` |
| `POST /api/members/social/groups` | `write` | `members_social_groups_post` |
| `POST /api/members/social/groups/[id]/join` | `write` | `members_social_groups_join` |
| `GET /api/members/social/groups/[id]/messages` | `read` | `members_social_group_messages_get` |
| `POST /api/members/social/groups/[id]/messages` | `write` | `members_social_group_messages_post` |
| `GET /api/members/trades` | `read` | `members_trades_get` |
| `POST /api/members/trades` | `write` | `members_trades_post` |

429 responses use `{ ok: false, error: "rate_limited", message: "…" }`.

---

## Production follow-ups

- Replace in-memory rate limits with **Redis / Upstash** (see [MEMBER_TERMINAL_ROADMAP.md](./MEMBER_TERMINAL_ROADMAP.md) Phase 4).
- Optional **CSP / middleware** hardening for `/welcome` and `/members` if you add cookies beyond Privy.
