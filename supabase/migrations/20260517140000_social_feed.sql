-- Social feed: posts, likes, comments (X / Facebook-style member social).

create table if not exists public.social_posts (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  body text not null check (char_length(body) >= 1 and char_length(body) <= 2000),
  visibility text not null default 'friends' check (visibility in ('public', 'friends')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists social_posts_created_idx on public.social_posts (created_at desc);
create index if not exists social_posts_member_idx on public.social_posts (member_id);

create table if not exists public.social_post_likes (
  post_id uuid not null references public.social_posts(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, member_id)
);

create index if not exists social_post_likes_member_idx on public.social_post_likes (member_id);

create table if not exists public.social_post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.social_posts(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  body text not null check (char_length(body) >= 1 and char_length(body) <= 1000),
  created_at timestamptz not null default now()
);

create index if not exists social_post_comments_post_created_idx on public.social_post_comments (post_id, created_at asc);

drop trigger if exists social_posts_touch on public.social_posts;
create trigger social_posts_touch before update on public.social_posts for each row execute function public.touch_updated_at();

alter table public.social_posts enable row level security;
alter table public.social_post_likes enable row level security;
alter table public.social_post_comments enable row level security;

create policy "social_posts_no_anon" on public.social_posts for all to anon using (false) with check (false);
create policy "social_posts_no_auth" on public.social_posts for all to authenticated using (false) with check (false);

create policy "social_post_likes_no_anon" on public.social_post_likes for all to anon using (false) with check (false);
create policy "social_post_likes_no_auth" on public.social_post_likes for all to authenticated using (false) with check (false);

create policy "social_post_comments_no_anon" on public.social_post_comments for all to anon using (false) with check (false);
create policy "social_post_comments_no_auth" on public.social_post_comments for all to authenticated using (false) with check (false);
