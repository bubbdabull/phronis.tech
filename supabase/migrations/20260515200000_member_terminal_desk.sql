-- Member "Terminal" desk: watchlists, tracked wallets, analysis cache, alerts, AI threads, reputation, admin audit.
-- App access is via service role (same pattern as members/wallets). RLS denies direct anon/authenticated PostgREST.

-- App users are public.members (Privy id); no separate public.users table.

create table if not exists public.tracked_wallets (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  solana_address text not null,
  display_label text,
  smart_money_score numeric,
  tags text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (member_id, solana_address)
);

create index if not exists tracked_wallets_member_idx on public.tracked_wallets (member_id);

create table if not exists public.watchlists (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists watchlists_member_idx on public.watchlists (member_id);

create table if not exists public.watchlist_tokens (
  id uuid primary key default gen_random_uuid(),
  watchlist_id uuid not null references public.watchlists(id) on delete cascade,
  mint_address text not null,
  symbol text,
  added_at timestamptz not null default now(),
  unique (watchlist_id, mint_address)
);

create index if not exists watchlist_tokens_watchlist_idx on public.watchlist_tokens (watchlist_id);

create table if not exists public.token_analysis (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete set null,
  mint_address text not null,
  trust_score int check (trust_score is null or (trust_score >= 0 and trust_score <= 100)),
  risk_level text,
  result jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists token_analysis_mint_created_idx on public.token_analysis (mint_address, created_at desc);
create index if not exists token_analysis_member_idx on public.token_analysis (member_id);

create table if not exists public.token_risk_scores (
  id uuid primary key default gen_random_uuid(),
  mint_address text not null,
  rug_probability numeric,
  threat_level text,
  signals jsonb not null default '{}',
  computed_at timestamptz not null default now()
);

create index if not exists token_risk_scores_mint_computed_idx on public.token_risk_scores (mint_address, computed_at desc);

create table if not exists public.member_alerts (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  alert_type text not null,
  config jsonb not null default '{}',
  notify_push boolean not null default false,
  notify_email boolean not null default false,
  notify_telegram boolean not null default false,
  notify_discord_webhook text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists member_alerts_member_idx on public.member_alerts (member_id);

-- Gamified learning layer (complements member_crypto_module_quiz).
create table if not exists public.member_learning_progress (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  track_key text not null,
  module_key text not null,
  xp int not null default 0,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (member_id, track_key, module_key)
);

create index if not exists member_learning_progress_member_idx on public.member_learning_progress (member_id);

create table if not exists public.member_achievements (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  achievement_key text not null,
  unlocked_at timestamptz not null default now(),
  unique (member_id, achievement_key)
);

create index if not exists member_achievements_member_idx on public.member_achievements (member_id);

create table if not exists public.ai_chat_threads (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ai_chat_threads_member_idx on public.ai_chat_threads (member_id);

create table if not exists public.ai_chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.ai_chat_threads(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists ai_chat_messages_thread_idx on public.ai_chat_messages (thread_id, created_at);

create table if not exists public.member_reputation (
  member_id uuid primary key references public.members(id) on delete cascade,
  score int not null default 0,
  narrative_tags text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists public.member_admin_roles (
  member_id uuid primary key references public.members(id) on delete cascade,
  role text not null check (role in ('admin', 'moderator')),
  granted_at timestamptz not null default now()
);

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_member_id uuid references public.members(id) on delete set null,
  action text not null,
  target_type text,
  target_id text,
  meta jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_log_created_idx on public.admin_audit_log (created_at desc);

drop trigger if exists tracked_wallets_touch on public.tracked_wallets;
create trigger tracked_wallets_touch before update on public.tracked_wallets for each row execute function public.touch_updated_at();

drop trigger if exists watchlists_touch on public.watchlists;
create trigger watchlists_touch before update on public.watchlists for each row execute function public.touch_updated_at();

drop trigger if exists member_alerts_touch on public.member_alerts;
create trigger member_alerts_touch before update on public.member_alerts for each row execute function public.touch_updated_at();

drop trigger if exists ai_chat_threads_touch on public.ai_chat_threads;
create trigger ai_chat_threads_touch before update on public.ai_chat_threads for each row execute function public.touch_updated_at();

alter table public.tracked_wallets enable row level security;
alter table public.watchlists enable row level security;
alter table public.watchlist_tokens enable row level security;
alter table public.token_analysis enable row level security;
alter table public.token_risk_scores enable row level security;
alter table public.member_alerts enable row level security;
alter table public.member_learning_progress enable row level security;
alter table public.member_achievements enable row level security;
alter table public.ai_chat_threads enable row level security;
alter table public.ai_chat_messages enable row level security;
alter table public.member_reputation enable row level security;
alter table public.member_admin_roles enable row level security;
alter table public.admin_audit_log enable row level security;

create policy "tracked_wallets_no_anon" on public.tracked_wallets for all to anon using (false) with check (false);
create policy "tracked_wallets_no_auth" on public.tracked_wallets for all to authenticated using (false) with check (false);
create policy "watchlists_no_anon" on public.watchlists for all to anon using (false) with check (false);
create policy "watchlists_no_auth" on public.watchlists for all to authenticated using (false) with check (false);
create policy "watchlist_tokens_no_anon" on public.watchlist_tokens for all to anon using (false) with check (false);
create policy "watchlist_tokens_no_auth" on public.watchlist_tokens for all to authenticated using (false) with check (false);
create policy "token_analysis_no_anon" on public.token_analysis for all to anon using (false) with check (false);
create policy "token_analysis_no_auth" on public.token_analysis for all to authenticated using (false) with check (false);
create policy "token_risk_scores_no_anon" on public.token_risk_scores for all to anon using (false) with check (false);
create policy "token_risk_scores_no_auth" on public.token_risk_scores for all to authenticated using (false) with check (false);
create policy "member_alerts_no_anon" on public.member_alerts for all to anon using (false) with check (false);
create policy "member_alerts_no_auth" on public.member_alerts for all to authenticated using (false) with check (false);
create policy "member_learning_progress_no_anon" on public.member_learning_progress for all to anon using (false) with check (false);
create policy "member_learning_progress_no_auth" on public.member_learning_progress for all to authenticated using (false) with check (false);
create policy "member_achievements_no_anon" on public.member_achievements for all to anon using (false) with check (false);
create policy "member_achievements_no_auth" on public.member_achievements for all to authenticated using (false) with check (false);
create policy "ai_chat_threads_no_anon" on public.ai_chat_threads for all to anon using (false) with check (false);
create policy "ai_chat_threads_no_auth" on public.ai_chat_threads for all to authenticated using (false) with check (false);
create policy "ai_chat_messages_no_anon" on public.ai_chat_messages for all to anon using (false) with check (false);
create policy "ai_chat_messages_no_auth" on public.ai_chat_messages for all to authenticated using (false) with check (false);
create policy "member_reputation_no_anon" on public.member_reputation for all to anon using (false) with check (false);
create policy "member_reputation_no_auth" on public.member_reputation for all to authenticated using (false) with check (false);
create policy "member_admin_roles_no_anon" on public.member_admin_roles for all to anon using (false) with check (false);
create policy "member_admin_roles_no_auth" on public.member_admin_roles for all to authenticated using (false) with check (false);
create policy "admin_audit_log_no_anon" on public.admin_audit_log for all to anon using (false) with check (false);
create policy "admin_audit_log_no_auth" on public.admin_audit_log for all to authenticated using (false) with check (false);
