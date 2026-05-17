-- Member + DAO tier placeholders (L1/L2/L3). Tiers are updated by app logic or a future on-chain indexer.

create table if not exists public.member_profiles (
  id uuid primary key default gen_random_uuid(),
  privy_user_id text not null unique,
  email text,
  wallet_address text,
  access_tier text not null default 'L1' check (access_tier in ('L1', 'L2', 'L3')),
  dao_tier text not null default 'L1' check (dao_tier in ('L1', 'L2', 'L3')),
  dao_contract_address text,
  metadata jsonb not null default '{}'::jsonb,
  synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists member_profiles_wallet_address_idx on public.member_profiles (wallet_address);

create or replace function public.set_member_profiles_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists member_profiles_set_updated_at on public.member_profiles;
create trigger member_profiles_set_updated_at
  before update on public.member_profiles
  for each row execute function public.set_member_profiles_updated_at();

alter table public.member_profiles enable row level security;

comment on table public.member_profiles is 'Phronis members keyed by Privy DID; access_tier / dao_tier use L1–L3 until your DAO contract + indexer own writes.';
comment on column public.member_profiles.dao_contract_address is 'Set when your custom DAO / governance contract is deployed.';
