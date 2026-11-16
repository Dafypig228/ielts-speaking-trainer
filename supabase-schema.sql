-- IELTS Speaking Trainer: per-user sync. Every row and file is private to its owner (row level security).
create or replace function public.ist_touch() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;

create table if not exists public.attempts (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  id text not null,
  qid text not null,
  part int,
  ts bigint,
  dur int,
  mime text,
  size int,
  tr text default '',
  score text,
  note text default '',
  sid text,
  fb text,
  path text,
  deleted boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);
create index if not exists attempts_user_updated on public.attempts (user_id, updated_at);

create table if not exists public.sessions (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  id text not null,
  data jsonb not null,
  deleted boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);
create index if not exists sessions_user_updated on public.sessions (user_id, updated_at);

create table if not exists public.meta (
  user_id uuid primary key default auth.uid() references auth.users on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

drop trigger if exists attempts_touch on public.attempts;
create trigger attempts_touch before insert or update on public.attempts for each row execute function public.ist_touch();
drop trigger if exists sessions_touch on public.sessions;
create trigger sessions_touch before insert or update on public.sessions for each row execute function public.ist_touch();
drop trigger if exists meta_touch on public.meta;
create trigger meta_touch before insert or update on public.meta for each row execute function public.ist_touch();

alter table public.attempts enable row level security;
alter table public.sessions enable row level security;
alter table public.meta enable row level security;

drop policy if exists "own attempts" on public.attempts;
create policy "own attempts" on public.attempts for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "own sessions" on public.sessions;
create policy "own sessions" on public.sessions for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "own meta" on public.meta;
create policy "own meta" on public.meta for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

grant select, insert, update, delete on public.attempts, public.sessions, public.meta to authenticated;

-- Private bucket for audio; each user can only touch files in their own folder (<user id>/...).
insert into storage.buckets (id, name, public, file_size_limit)
values ('recordings', 'recordings', false, 26214400)
on conflict (id) do nothing;

drop policy if exists "ist read own recordings" on storage.objects;
create policy "ist read own recordings" on storage.objects for select to authenticated
  using (bucket_id = 'recordings' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "ist add own recordings" on storage.objects;
create policy "ist add own recordings" on storage.objects for insert to authenticated
  with check (bucket_id = 'recordings' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "ist update own recordings" on storage.objects;
create policy "ist update own recordings" on storage.objects for update to authenticated
  using (bucket_id = 'recordings' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "ist delete own recordings" on storage.objects;
create policy "ist delete own recordings" on storage.objects for delete to authenticated
  using (bucket_id = 'recordings' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- v3: Telegram-username login, admin, coach, phrases (applied as migrations "telegram_login_coach_phrases",
-- "gate_signup_allowlist_only" and "revoke_gate_rpc"; see Supabase dashboard > Database > Migrations)
