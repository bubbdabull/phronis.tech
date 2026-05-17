-- Optional contact email when member did not link an email account in Privy.

alter table public.members add column if not exists email text;
