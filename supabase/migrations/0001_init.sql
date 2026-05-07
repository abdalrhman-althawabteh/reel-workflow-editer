-- Reel — creator + editor workflow schema
-- Run this in your Supabase project's SQL editor (or via supabase CLI).

create extension if not exists "pgcrypto";

-- Roles & video pipeline statuses --------------------------------------------
create type public.user_role as enum ('creator', 'editor');

create type public.video_status as enum (
  'idea',
  'ready_to_film',
  'raw_uploaded',
  'editing',
  'in_review',
  'revisions_requested',
  'approved',
  'published'
);

create type public.video_file_kind as enum ('raw', 'edit');

-- Profiles --------------------------------------------------------------------
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role public.user_role not null,
  display_name text,
  avatar_url text,
  drive_refresh_token_encrypted text,         -- only set for the creator
  drive_root_folder_id text,                  -- creator's Drive folder for raw + edits
  created_at timestamptz not null default now()
);

-- Helper: who am I?
create or replace function public.current_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where user_id = auth.uid()
$$;

-- Videos ---------------------------------------------------------------------
create table public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  caption text,
  script text,
  ref_link text,
  status public.video_status not null default 'idea',
  published_url text,
  published_at timestamptz,
  revision_note text,                          -- last revision request from creator
  created_by uuid not null references public.profiles(user_id),
  claimed_by uuid references public.profiles(user_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index videos_status_idx on public.videos(status);
create index videos_updated_at_idx on public.videos(updated_at desc);

-- Files (raw + edit revisions) -----------------------------------------------
create table public.video_files (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos(id) on delete cascade,
  kind public.video_file_kind not null,
  revision_index int not null default 1,
  drive_file_id text not null,
  drive_web_view_link text,
  size_bytes bigint,
  uploaded_by uuid not null references public.profiles(user_id),
  uploaded_at timestamptz not null default now(),
  unique (video_id, kind, revision_index)
);

create index video_files_video_idx on public.video_files(video_id);

-- Comments -------------------------------------------------------------------
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  video_file_id uuid not null references public.video_files(id) on delete cascade,
  author_id uuid not null references public.profiles(user_id),
  body text not null,
  timestamp_seconds numeric,                   -- nullable = general comment
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create index comments_file_idx on public.comments(video_file_id);

-- Activity feed (powers in-app badge) ----------------------------------------
create table public.activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  video_id uuid not null references public.videos(id) on delete cascade,
  kind text not null,                          -- e.g. 'idea_proposed', 'raw_uploaded', 'edit_uploaded', 'revisions_requested', 'approved', 'published'
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index activity_user_unread_idx on public.activity(user_id, read_at);

-- Auto-update updated_at on videos
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger videos_touch
  before update on public.videos
  for each row execute function public.touch_updated_at();

-- Row-level security ---------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.videos enable row level security;
alter table public.video_files enable row level security;
alter table public.comments enable row level security;
alter table public.activity enable row level security;

-- Profiles: each user reads all profiles (small workspace), writes only own row
create policy "profiles read" on public.profiles
  for select using (auth.uid() is not null);
create policy "profiles update self" on public.profiles
  for update using (auth.uid() = user_id);
create policy "profiles insert self" on public.profiles
  for insert with check (auth.uid() = user_id);

-- Videos: any authenticated workspace member can read.
-- Insert: only editors create ideas.
-- Update: server enforces transition rules; RLS just blocks unauthenticated.
create policy "videos read all" on public.videos
  for select using (auth.uid() is not null);
create policy "videos insert editor" on public.videos
  for insert with check (public.current_role() = 'editor' and created_by = auth.uid());
create policy "videos update auth" on public.videos
  for update using (auth.uid() is not null);

-- Video files: read all, insert only by uploader, no update/delete
create policy "files read all" on public.video_files
  for select using (auth.uid() is not null);
create policy "files insert self" on public.video_files
  for insert with check (auth.uid() = uploaded_by);

-- Comments: read all, insert as self, update only your own (for resolved flag)
create policy "comments read all" on public.comments
  for select using (auth.uid() is not null);
create policy "comments insert self" on public.comments
  for insert with check (auth.uid() = author_id);
create policy "comments update self" on public.comments
  for update using (auth.uid() = author_id);

-- Activity: each user reads only their own rows; inserted by server.
create policy "activity read own" on public.activity
  for select using (auth.uid() = user_id);
create policy "activity update own" on public.activity
  for update using (auth.uid() = user_id);
create policy "activity insert any auth" on public.activity
  for insert with check (auth.uid() is not null);

-- Realtime: enable for videos, comments, activity
alter publication supabase_realtime add table public.videos;
alter publication supabase_realtime add table public.comments;
alter publication supabase_realtime add table public.activity;
