-- ── EaseTask Supabase schema ─────────────────────────────────────
-- Run this in the Supabase SQL editor (supabase.com → Project → SQL Editor).

-- 1. Profiles table (mirrors auth.users, holds plan + usage)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  plan text not null default 'free' check (plan in ('free','starter','pro')),
  analyses_this_month int not null default 0,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row on sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email)
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Analyses history
create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  report jsonb not null,
  thumbnail text,
  analyzed_at timestamptz not null default now()
);
create index if not exists analyses_user_idx on public.analyses(user_id, analyzed_at desc);

-- 3. Row Level Security — users only see their own data
alter table public.profiles enable row level security;
alter table public.analyses enable row level security;

drop policy if exists "profiles_self_select" on public.profiles;
create policy "profiles_self_select" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "analyses_self_all" on public.analyses;
create policy "analyses_self_all" on public.analyses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 4. (Optional) Edge Function hook: after Lemon Squeezy webhook confirms payment,
--    call: update public.profiles set plan = 'pro' where id = <user_id>;
