-- Per-module quiz completion for Crypto Mastery (member workspace). Accessed only via service role in API routes.

create table if not exists public.member_crypto_module_quiz (
  member_id uuid not null references public.members (id) on delete cascade,
  module_id text not null,
  passed boolean not null default false,
  score int not null default 0,
  total int not null default 0,
  attempt_count int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (member_id, module_id)
);

create index if not exists member_crypto_module_quiz_member_idx on public.member_crypto_module_quiz (member_id);

alter table public.member_crypto_module_quiz enable row level security;

create policy "member_crypto_module_quiz_no_anon" on public.member_crypto_module_quiz for all to anon using (false) with check (false);
create policy "member_crypto_module_quiz_no_auth" on public.member_crypto_module_quiz for all to authenticated using (false) with check (false);
