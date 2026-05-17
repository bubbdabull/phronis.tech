alter table public.wallets
  add column if not exists usdc_balance numeric not null default 0;

comment on column public.wallets.usdc_balance is 'USDC SPL balance (human units, 6 decimals on mainnet USDC).';
