-- Member social (friends, study groups, group chat) + trade log for member hub.
-- RLS: deny direct anon/authenticated PostgREST; app uses service role from API routes only.

-- Friend requests -----------------------------------------------------------------
create table if not exists public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  from_member_id uuid not null references public.members(id) on delete cascade,
  to_member_id uuid not null references public.members(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (from_member_id <> to_member_id)
);

create unique index if not exists friend_requests_pending_pair_uniq
  on public.friend_requests (from_member_id, to_member_id)
  where status = 'pending';

create index if not exists friend_requests_to_idx on public.friend_requests (to_member_id);
create index if not exists friend_requests_from_idx on public.friend_requests (from_member_id);

-- Friendships (accepted); store ordered pair for simple uniqueness -----------------
create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  member_a_id uuid not null references public.members(id) on delete cascade,
  member_b_id uuid not null references public.members(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (member_a_id < member_b_id),
  unique (member_a_id, member_b_id)
);

create index if not exists friendships_a_idx on public.friendships (member_a_id);
create index if not exists friendships_b_idx on public.friendships (member_b_id);

-- Study groups --------------------------------------------------------------------
create table if not exists public.study_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_by_member_id uuid not null references public.members(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists study_groups_created_by_idx on public.study_groups (created_by_member_id);

create table if not exists public.study_group_members (
  group_id uuid not null references public.study_groups(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (group_id, member_id)
);

create index if not exists study_group_members_member_idx on public.study_group_members (member_id);

-- Group messages (chat) -----------------------------------------------------------
create table if not exists public.group_messages (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.study_groups(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  body text not null check (char_length(body) <= 4000),
  created_at timestamptz not null default now()
);

create index if not exists group_messages_group_created_idx on public.group_messages (group_id, created_at desc);

-- Member trade log (self-reported or later webhook-fed) ----------------------------
create table if not exists public.member_trade_events (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  wallet_address text not null,
  side text not null default 'swap' check (side in ('buy', 'sell', 'swap', 'unknown')),
  signature text,
  mint_in text,
  mint_out text,
  amount_note text,
  meta jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists member_trade_events_member_created_idx on public.member_trade_events (member_id, created_at desc);

-- updated_at triggers (reuse touch function from prior migrations)
drop trigger if exists friend_requests_touch on public.friend_requests;
create trigger friend_requests_touch before update on public.friend_requests for each row execute function public.touch_updated_at();

drop trigger if exists study_groups_touch on public.study_groups;
create trigger study_groups_touch before update on public.study_groups for each row execute function public.touch_updated_at();

-- RLS -----------------------------------------------------------------------------
alter table public.friend_requests enable row level security;
alter table public.friendships enable row level security;
alter table public.study_groups enable row level security;
alter table public.study_group_members enable row level security;
alter table public.group_messages enable row level security;
alter table public.member_trade_events enable row level security;

create policy "friend_requests_no_anon" on public.friend_requests for all to anon using (false) with check (false);
create policy "friend_requests_no_auth" on public.friend_requests for all to authenticated using (false) with check (false);

create policy "friendships_no_anon" on public.friendships for all to anon using (false) with check (false);
create policy "friendships_no_auth" on public.friendships for all to authenticated using (false) with check (false);

create policy "study_groups_no_anon" on public.study_groups for all to anon using (false) with check (false);
create policy "study_groups_no_auth" on public.study_groups for all to authenticated using (false) with check (false);

create policy "study_group_members_no_anon" on public.study_group_members for all to anon using (false) with check (false);
create policy "study_group_members_no_auth" on public.study_group_members for all to authenticated using (false) with check (false);

create policy "group_messages_no_anon" on public.group_messages for all to anon using (false) with check (false);
create policy "group_messages_no_auth" on public.group_messages for all to authenticated using (false) with check (false);

create policy "member_trade_events_no_anon" on public.member_trade_events for all to anon using (false) with check (false);
create policy "member_trade_events_no_auth" on public.member_trade_events for all to authenticated using (false) with check (false);
