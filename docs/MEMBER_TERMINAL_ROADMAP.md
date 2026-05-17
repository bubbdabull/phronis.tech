# Member Terminal — roadmap

This document expands the **Terminal** (`/desk`) area beyond the current scaffold: premium “Bloomberg × DexScreener × Arkham × education” for **normal** users, built modularly on Next.js 15 + Supabase + Privy.

## What exists now

- **Routes**: `/desk` (home), `/desk/analyze`, `/desk/wallets`, `/desk/risk`, `/desk/discover`, `/desk/alerts`, `/desk/assistant`, `/desk/admin` — UI shells + **live** `/api/desk/summary` (DexScreener + Supabase + Helius/SOLANA RPC) and `/api/desk/analyze` (DexScreener + optional Birdeye) + in-memory rate limit stub.
- **Schema** (`20260515200000_member_terminal_desk.sql`): `tracked_wallets`, `watchlists`, `watchlist_tokens`, `token_analysis`, `token_risk_scores`, `member_alerts`, `member_learning_progress`, `member_achievements`, `ai_chat_threads`, `ai_chat_messages`, `member_reputation`, `member_admin_roles`, `admin_audit_log`. App users remain **`members`** (Privy); RLS locked down like other member tables (service role from API routes).

## Phase 1 — Data plane

1. **Helius**: parsed transactions, webhooks, enhanced APIs for wallet timelines and token metadata.
2. **Birdeye**: price/volume, holder stats, wallet PnL where available.
3. **DexScreener**: pair discovery, social links, early pair surfacing.
4. **Edge workers / cron**: refresh `token_risk_scores`, hydrate watchlists, enqueue analyzer jobs.
5. **Persistence**: write analyzer output to `token_analysis` keyed by `member_id` + `mint_address`; dedupe global risk in `token_risk_scores`.

## Phase 2 — Core product loops

| Module | Deliverable |
|--------|-------------|
| Home dashboard | Real balances from `wallets`, trending + smart money from indexed materialized views. |
| Analyzer | Full metric sheet (LP, holders, dev wallets, snipers) + Recharts or TradingView embed. |
| Smart wallets | `tracked_wallets` UI, tags, clusters (community detection on transfer graph — batch). |
| Rug radar | Rule engine + scoring; optional ML layer later. |
| Discover | Filter builder + saved views; “gem lanes” as presets. |
| Alerts | `member_alerts` + multi-channel dispatch + retry/audit. |
| Academy link | Unify XP: `member_learning_progress` + existing `member_crypto_module_quiz`. |

## Phase 3 — AI + social proof

- OpenAI (or compatible) with **structured outputs** for token summaries; **RAG** over internal education MD + cached analyses.
- Tool pipeline: `getBirdeyeToken`, `getHeliusWalletHistory`, `compareMints` (server-only keys).

## Phase 4 — Scale & trust

- **DAO security layers (L1 / L2 / L3):** on-chain vs off-chain vs application controls — **not** the same as membership tiers. See [DAO_SECURITY_LAYERS_L1_L2_L3.md](./DAO_SECURITY_LAYERS_L1_L2_L3.md).
- **Rate limiting**: Redis / Upstash; per-IP + per-user + per-route tiers.
- **Wallet verification**: optional sign-in nonce tying `members` ↔ on-chain activity.
- **RBAC**: enforce `member_admin_roles` on `/desk/admin` APIs; never trust client alone.
- **Audit**: all admin actions → `admin_audit_log`.
- **Realtime**: Supabase Realtime or websocket fan-out for watchlist + alert tickers (optional).

## Phase 5 — Bonus surfaces

Portfolio + PnL, heatmaps, narrative heat index, copy-trade **simulation** (no custody), launch calendar, Solana ecosystem map, AI trade journal, sentiment stack.

## Engineering conventions

- **`src/app/_features/member-desk/`**: UI modules; keep API calls in `src/app/api/desk/**` or `src/app/_lib/desk-*`.
- **Types**: `src/app/_types/desk.ts` (extend as DTOs stabilize).
- **Desk libs**: `src/app/_lib/desk/*` — DexScreener, Birdeye, Helius RPC URL, `build-desk-summary`, `build-desk-analyze`.

## Dependencies to add when wiring charts

- `recharts` **or** TradingView Charting Library (license); start with Recharts for sparklines and depth mocks.

---

_Update this file as phases ship; keep user-facing copy in the app short and link here for operators._
