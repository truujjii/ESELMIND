-- ESELMIND — initial schema.
--
-- Two halves:
--   1. CONTENT (courses → modules → lessons → quiz_questions → question_options)
--      — world-readable when published, writable only by admins. This is what the
--      future local admin panel will manage (upload videos to Mux, edit lessons,
--      attach questions). The app currently still reads content from
--      src/data/mock-course.ts; these tables exist so the panel has a home.
--   2. USER STATE (profiles, user_progress, lesson_completions) — per-user, locked
--      down with Row Level Security so the publishable key can only ever touch the
--      signed-in user's own rows. user_progress mirrors the app's UserProgress
--      type 1:1 for trivial offline-first sync (upsert the whole row).
--
-- Mux: lessons carry the upload/asset/playback ids + status so the panel can drive
-- the full "create direct upload → poll until ready → store playback id" flow.
-- Only mux_playback_id (public playback) ever needs to reach the app.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- Keep updated_at fresh on any UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Mux processing state for a lesson's video.
do $$ begin
  create type public.mux_status as enum ('none', 'pending', 'preparing', 'ready', 'errored');
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- CONTENT
-- ---------------------------------------------------------------------------

create table if not exists public.courses (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        text not null,
  description  text not null default '',
  position     int  not null default 0,
  is_published boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.modules (
  id         uuid primary key default gen_random_uuid(),
  course_id  uuid not null references public.courses(id) on delete cascade,
  slug       text not null,
  title      text not null,
  position   int  not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, slug)
);

create table if not exists public.lessons (
  id              uuid primary key default gen_random_uuid(),
  module_id       uuid not null references public.modules(id) on delete cascade,
  slug            text unique not null,
  title           text not null,
  summary         text not null default '',
  duration_sec    int  not null default 0,
  accent          text not null default '#208AEF',
  xp_reward       int  not null default 50,
  position        int  not null default 0,
  is_published    boolean not null default false,
  -- Mux: panel creates a direct upload, then fills these in as the asset processes.
  mux_upload_id   text,
  mux_asset_id    text,
  mux_playback_id text,
  mux_status      public.mux_status not null default 'none',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.quiz_questions (
  id          uuid primary key default gen_random_uuid(),
  lesson_id   uuid not null references public.lessons(id) on delete cascade,
  slug        text not null,
  prompt      text not null,
  explanation text not null default '',
  position    int  not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (lesson_id, slug)
);

create table if not exists public.question_options (
  id          uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  slug        text not null,
  label       text not null,
  is_correct  boolean not null default false,
  position    int  not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (question_id, slug)
);

-- ---------------------------------------------------------------------------
-- USER STATE
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url   text,
  is_admin     boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- True when the current user is flagged admin. SECURITY DEFINER so content RLS
-- policies can read profiles without recursing through profiles' own RLS. Defined
-- here (after profiles exists) because SQL functions validate their body on create.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- Mirrors the app's UserProgress type 1:1 — one row per user, upserted wholesale.
create table if not exists public.user_progress (
  user_id               uuid primary key references auth.users(id) on delete cascade,
  xp                    int  not null default 0,
  current_streak        int  not null default 0,
  best_streak           int  not null default 0,
  last_active_date      date,
  perfect_quiz_count    int  not null default 0,
  completed_lesson_slugs text[] not null default '{}',
  earned_badge_ids      text[] not null default '{}',
  updated_at            timestamptz not null default now()
);

-- Append-only log: one row per passed lesson. Powers future analytics / the panel.
create table if not exists public.lesson_completions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  lesson_slug  text not null,
  correct      int  not null,
  total        int  not null,
  is_perfect   boolean not null default false,
  xp_earned    int  not null default 0,
  completed_at timestamptz not null default now()
);
create index if not exists lesson_completions_user_idx
  on public.lesson_completions (user_id, completed_at desc);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

drop trigger if exists set_updated_at on public.courses;
create trigger set_updated_at before update on public.courses
  for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at on public.modules;
create trigger set_updated_at before update on public.modules
  for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at on public.lessons;
create trigger set_updated_at before update on public.lessons
  for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at on public.quiz_questions;
create trigger set_updated_at before update on public.quiz_questions
  for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at on public.question_options;
create trigger set_updated_at before update on public.question_options
  for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at on public.user_progress;
create trigger set_updated_at before update on public.user_progress
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- New-user bootstrap: every auth user (incl. OAuth + anonymous) gets a profile
-- and an empty progress row. SECURITY DEFINER so it runs past RLS.
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  insert into public.user_progress (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.courses          enable row level security;
alter table public.modules          enable row level security;
alter table public.lessons          enable row level security;
alter table public.quiz_questions   enable row level security;
alter table public.question_options enable row level security;
alter table public.profiles         enable row level security;
alter table public.user_progress    enable row level security;
alter table public.lesson_completions enable row level security;

-- Content reads: published cascades down the tree; admins see everything.
-- (service_role / the secret key bypasses RLS entirely, so the panel can write.)
drop policy if exists "courses_read" on public.courses;
create policy "courses_read" on public.courses for select
  using (is_published or public.is_admin());
drop policy if exists "courses_admin_write" on public.courses;
create policy "courses_admin_write" on public.courses for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "modules_read" on public.modules;
create policy "modules_read" on public.modules for select
  using (exists (
    select 1 from public.courses c
    where c.id = course_id and (c.is_published or public.is_admin())
  ));
drop policy if exists "modules_admin_write" on public.modules;
create policy "modules_admin_write" on public.modules for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "lessons_read" on public.lessons;
create policy "lessons_read" on public.lessons for select
  using (is_published or public.is_admin());
drop policy if exists "lessons_admin_write" on public.lessons;
create policy "lessons_admin_write" on public.lessons for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "questions_read" on public.quiz_questions;
create policy "questions_read" on public.quiz_questions for select
  using (exists (
    select 1 from public.lessons l
    where l.id = lesson_id and (l.is_published or public.is_admin())
  ));
drop policy if exists "questions_admin_write" on public.quiz_questions;
create policy "questions_admin_write" on public.quiz_questions for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "options_read" on public.question_options;
create policy "options_read" on public.question_options for select
  using (exists (
    select 1 from public.quiz_questions q
    join public.lessons l on l.id = q.lesson_id
    where q.id = question_id and (l.is_published or public.is_admin())
  ));
drop policy if exists "options_admin_write" on public.question_options;
create policy "options_admin_write" on public.question_options for all
  using (public.is_admin()) with check (public.is_admin());

-- Per-user state: you can only ever see/edit your own rows.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (id = auth.uid());
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (id = auth.uid());
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "progress_select_own" on public.user_progress;
create policy "progress_select_own" on public.user_progress for select using (user_id = auth.uid());
drop policy if exists "progress_insert_own" on public.user_progress;
create policy "progress_insert_own" on public.user_progress for insert with check (user_id = auth.uid());
drop policy if exists "progress_update_own" on public.user_progress;
create policy "progress_update_own" on public.user_progress for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "completions_select_own" on public.lesson_completions;
create policy "completions_select_own" on public.lesson_completions for select using (user_id = auth.uid());
drop policy if exists "completions_insert_own" on public.lesson_completions;
create policy "completions_insert_own" on public.lesson_completions for insert with check (user_id = auth.uid());
