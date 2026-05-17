# Phronis — Solana onboarding & DAO access

Next.js 15 (App Router) site with **Privy** authentication (email, Google, X), **embedded Solana and Ethereum wallets**, **Supabase** persistence for members and wallets, and **token-gated** DAO routes.

## Prerequisites

- Node.js 20+
- A [Privy](https://dashboard.privy.io) app with **Solana embedded wallets**, **Ethereum embedded wallets** (if you use EVM), optional **[EVM smart wallets](https://docs.privy.io/wallets/using-wallets/evm-smart-wallets/setup/configuring-dashboard)** in the dashboard, **Google**, **Twitter (X)**, and **identity tokens** enabled for server verification
- A [Supabase](https://supabase.com) project with migrations applied (see `supabase/migrations/`)

## Alchemy (Solana + Ethereum)

1. **Solana (server-side balances, sync)** — set `SOLANA_RPC_URL` to your Alchemy Solana HTTPS endpoint (example shape: `https://solana-mainnet.g.alchemy.com/v2/<key>`). Keep this **server-only** so the key is not shipped in client JavaScript.
2. **Ethereum (Privy in the browser)** — set `NEXT_PUBLIC_ALCHEMY_ETH_RPC_URL` to `https://eth-mainnet.g.alchemy.com/v2/<key>` **or** configure RPC in the Privy dashboard. Any key used in `NEXT_PUBLIC_*` is visible to clients; lock it down with [Alchemy allowlists](https://dashboard.alchemy.com) (domains / IPs).
3. **EVM smart wallets** — in [Privy → Smart wallets](https://dashboard.privy.io/apps?page=smart-wallets), enable smart wallets, pick **Alchemy** (or another provider), set **bundler** (required for production scale) and optional **paymaster** per Privy’s [configure smart wallets](https://docs.privy.io/wallets/using-wallets/evm-smart-wallets/setup/configuring-dashboard) guide.

If an API key was ever pasted into a chat, ticket, or screenshot, **rotate it** in the Alchemy dashboard and update `.env` locally.

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env` and fill values. Never commit `.env` or expose `SUPABASE_SERVICE_ROLE_KEY` or `PRIVY_APP_SECRET` to the client.

3. **Database**

   Apply SQL in `supabase/migrations/` (CLI: `supabase db push` or paste in the SQL editor). Tables: `members`, `wallets`, `transactions`, `memberships` with RLS (server uses the service role).

4. **Run**

   ```bash
   npm run dev
   ```

5. **Production build**

   ```bash
   npm run build
   npm start
   ```

## User flow

1. Homepage → **Join Phronis** (`/join`) → Privy login → embedded wallet (auto-created).
2. `POST /api/onboarding/sync` upserts **members** / **wallets** and refreshes balances (Bearer = Privy access token).
3. **Member Welcome** (`/welcome`) — profile, funding copy, buy PHR quote (Jupiter proxy), membership status.
4. DAO pages (`/dao`, `/governance`, `/members`, `/treasury`) use **DAOAccessGate** + `GET /api/dao/access` against on-chain PHR balance vs `NEXT_PUBLIC_DAO_MIN_PHR_BALANCE`.

## Security notes

- Private keys and seed phrases stay in Privy; this app does not store them.
- Supabase writes from the browser use the **service role only on trusted API routes** after Privy token verification.
- Validate inputs with Zod on `PATCH /api/members/profile`. Add rate limiting at your edge (Vercel, Cloudflare) for public APIs in production.

## Key paths

| Path | Purpose |
|------|---------|
| `/join` | Onboarding entry + Privy |
| `/welcome` | Member dashboard (protected) |
| `/dao`, `/governance`, `/members`, `/treasury` | PHR balance–gated |
| `/sign-in` | Sign in with Privy (email, social, wallets) |
| `/settings/privy` | Privy account / funding UI |

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run lint` — ESLint
