-- Learnova Supabase Schema
-- Run this entire file in the Supabase SQL editor
-- for a fresh project setup.
-- Last updated: 2026-05-19

-- ─────────────────────────────────────────────────────────
-- Extensions
-- ─────────────────────────────────────────────────────────
-- gen_random_uuid() lives in pgcrypto on most Supabase projects.
create extension if not exists pgcrypto;


-- ─────────────────────────────────────────────────────────
-- 1. profiles
-- One row per authenticated user (the parent / paying customer).
-- ─────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  name               text,
  email              text,
  phone              text,
  role               text default 'parent',
  xp                 integer default 0,
  streak             integer default 0,
  grade              text,
  language           text default 'en',
  personality_id     text,
  last_active_date   text,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);


-- ─────────────────────────────────────────────────────────
-- 2. children
-- One row per child profile under a parent account.
-- ─────────────────────────────────────────────────────────
create table if not exists public.children (
  id                 uuid primary key default gen_random_uuid(),
  parent_id          uuid references public.profiles(id) on delete cascade,
  name               text not null,
  avatar             text default 'default',
  grade              text not null,
  language           text default 'en',
  xp                 integer default 0,
  streak             integer default 0,
  last_active_date   text,
  created_at         timestamptz default now()
);

create index if not exists children_parent_id_idx on public.children(parent_id);


-- ─────────────────────────────────────────────────────────
-- 3. progress
-- One row per completed lesson / quiz session.
-- ─────────────────────────────────────────────────────────
create table if not exists public.progress (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid references public.profiles(id) on delete cascade,
  child_id           uuid references public.children(id) on delete cascade,
  subject            text not null,
  topic              text,
  score              integer,
  grade              text,
  xp_earned          integer default 0,
  duration_seconds   integer default 0,
  flow_completed     boolean default false,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);

create index if not exists progress_user_id_idx  on public.progress(user_id);
create index if not exists progress_child_id_idx on public.progress(child_id);
create index if not exists progress_created_at_idx on public.progress(created_at desc);


-- ─────────────────────────────────────────────────────────
-- 4. subscriptions
-- One row per user — created automatically on signup at the 'free' tier.
-- ─────────────────────────────────────────────────────────
create table if not exists public.subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete cascade,
  plan        text default 'free',
  status      text default 'active',
  started_at  timestamptz default now(),
  expires_at  timestamptz
);

create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);


-- ─────────────────────────────────────────────────────────
-- 5. Row Level Security
-- Each table is locked down to the owning auth.uid().
-- ─────────────────────────────────────────────────────────
alter table public.profiles      enable row level security;
alter table public.children      enable row level security;
alter table public.progress      enable row level security;
alter table public.subscriptions enable row level security;

-- profiles ────────────────────────────────────────────────
drop policy if exists "profiles_select_own"   on public.profiles;
drop policy if exists "profiles_insert_own"   on public.profiles;
drop policy if exists "profiles_update_own"   on public.profiles;
drop policy if exists "profiles_delete_own"   on public.profiles;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = id);

-- children ────────────────────────────────────────────────
drop policy if exists "children_select_own"   on public.children;
drop policy if exists "children_insert_own"   on public.children;
drop policy if exists "children_update_own"   on public.children;
drop policy if exists "children_delete_own"   on public.children;

create policy "children_select_own"
  on public.children for select
  using (auth.uid() = parent_id);

create policy "children_insert_own"
  on public.children for insert
  with check (auth.uid() = parent_id);

create policy "children_update_own"
  on public.children for update
  using (auth.uid() = parent_id)
  with check (auth.uid() = parent_id);

create policy "children_delete_own"
  on public.children for delete
  using (auth.uid() = parent_id);

-- progress ────────────────────────────────────────────────
drop policy if exists "progress_select_own"   on public.progress;
drop policy if exists "progress_insert_own"   on public.progress;
drop policy if exists "progress_update_own"   on public.progress;
drop policy if exists "progress_delete_own"   on public.progress;

create policy "progress_select_own"
  on public.progress for select
  using (auth.uid() = user_id);

create policy "progress_insert_own"
  on public.progress for insert
  with check (auth.uid() = user_id);

create policy "progress_update_own"
  on public.progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "progress_delete_own"
  on public.progress for delete
  using (auth.uid() = user_id);

-- subscriptions ───────────────────────────────────────────
drop policy if exists "subscriptions_select_own"   on public.subscriptions;
drop policy if exists "subscriptions_insert_own"   on public.subscriptions;
drop policy if exists "subscriptions_update_own"   on public.subscriptions;
drop policy if exists "subscriptions_delete_own"   on public.subscriptions;

create policy "subscriptions_select_own"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "subscriptions_insert_own"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);

create policy "subscriptions_update_own"
  on public.subscriptions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "subscriptions_delete_own"
  on public.subscriptions for delete
  using (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────
-- 6. handle_new_user trigger
-- On signup, create the profile row AND a free subscription row.
-- SECURITY DEFINER lets the trigger bypass RLS for these inserts.
-- ─────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );

  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'active');

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ─────────────────────────────────────────────────────────
-- 7. upsert_progress RPC
-- Inserts a new progress row for a lesson / quiz session.
-- Called from the client via supabase.rpc('upsert_progress', ...).
-- ─────────────────────────────────────────────────────────
create or replace function public.upsert_progress(
  p_user_id          uuid,
  p_child_id         uuid,
  p_subject          text,
  p_topic            text,
  p_score            integer,
  p_grade            text,
  p_xp_earned        integer,
  p_duration_seconds integer,
  p_flow_completed   boolean
) returns void as $$
begin
  insert into public.progress (
    user_id, child_id, subject, topic, score,
    grade, xp_earned, duration_seconds,
    flow_completed, updated_at
  )
  values (
    p_user_id, p_child_id, p_subject, p_topic, p_score,
    p_grade, p_xp_earned, p_duration_seconds,
    p_flow_completed, now()
  );
end;
$$ language plpgsql security definer;

-- Allow authenticated users to call the RPC.
grant execute on function public.upsert_progress(
  uuid, uuid, text, text, integer, text, integer, integer, boolean
) to authenticated;
