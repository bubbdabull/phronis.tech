# Phronis DAO — Solana program (Anchor)

Stub **governance state** program for Phronis. Replace `declare_id!` and `[programs.*]` entries after `anchor keys list` / deploy.

## Security layers (not membership tier)

| Layer | In this repo |
|-------|----------------|
| **L1** | On-chain accounts and instruction checks in `programs/phronis_dao`. Economic truth (treasury, votes) lives here once extended. |
| **L2** | Privy + Next.js API routes + Supabase service role for member/social data (see `docs/MEMBER_SECTION_SECURITY_L1_L2_L3.md`). |
| **L3** | Rate limits (`member-api-l3.ts`), validation (Zod), UI gates (`ProtectedRoute`). |

## Build

Requires [Anchor](https://www.anchor-lang.com/docs/installation) and a compatible Rust toolchain.

```bash
cd solana/phronis-dao
anchor build
anchor test   # when tests exist
```

Copy the program id into `.env` as `NEXT_PUBLIC_PHRONIS_DAO_PROGRAM_ID` when the app reads on-chain config.
