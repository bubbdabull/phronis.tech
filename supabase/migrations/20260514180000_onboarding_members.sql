-- Phronis onboarding + DAO tables (see apply_migration onboarding_members_dao_schema on remote).

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  privy_id text not null unique,
  wallet_address text,
  username text,
  display_name text,
  bio text,
  avatar_url text,
  website text,
  x_link text,
  discord_link text,
  membership_tier text not null default 'L1' check (membership_tier in ('L1', 'L2', 'L3')),
  onboarding_step text not null default 'profile',
  wallet_funded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  wallet_address text not null,
  sol_balance numeric not null default 0,
  phronis_balance numeric not null default 0,
  updated_at timestamptz not null default now(),
  unique(member_id, wallet_address)
);

create index if not exists wallets_member_id_idx on public.wallets (member_id);
create index if not exists wallets_address_idx on public.wallets (wallet_address);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null,
  signature text not null,
  type text not null,
  token text,
  amount text,
  status text not null default 'confirmed',
  created_at timestamptz not null default now()
);

create index if not exists transactions_wallet_idx on public.transactions (wallet_address);
create index if not exists transactions_created_idx on public.transactions (created_at desc);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  tier text not null default 'L1',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists memberships_member_id_idx on public.memberships (member_id);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists members_touch on public.members;
create trigger members_touch before update on public.members for each row execute function public.touch_updated_at();

drop trigger if exists wallets_touch on public.wallets;
create trigger wallets_touch before update on public.wallets for each row execute function public.touch_updated_at();

alter table public.members enable row level security;
alter table public.wallets enable row level security;
alter table public.transactions enable row level security;
alter table public.memberships enable row level security;

create policy "members_no_anon" on public.members for all to anon using (false) with check (false);
create policy "members_no_auth" on public.members for all to authenticated using (false) with check (false);
create policy "wallets_no_anon" on public.wallets for all to anon using (false) with check (false);
create policy "wallets_no_auth" on public.wallets for all to authenticated using (false) with check (false);
create policy "transactions_no_anon" on public.transactions for all to anon using (false) with check (false);
create policy "transactions_no_auth" on public.transactions for all to authenticated using (false) with check (false);
create policy "memberships_no_anon" on public.memberships for all to anon using (false) with check (false);
create policy "memberships_no_auth" on public.memberships for all to authenticated using (false) with check (false);
