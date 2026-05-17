alter table public.wallets
  add column if not exists spl_balances jsonb not null default '{}'::jsonb;

comment on column public.wallets.spl_balances is 'Map of SPL mint address -> human-readable balance for extra / meme tokens.';
