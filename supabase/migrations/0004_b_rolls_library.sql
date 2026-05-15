-- Standalone B-roll library. Independent of videos — a B-roll lives once and
-- can be referenced/downloaded by the editor for any number of projects.

create table if not exists public.b_rolls (
  id uuid primary key default gen_random_uuid(),
  drive_file_id text not null,
  drive_web_view_link text,
  name text not null,
  size_bytes bigint,
  mime_type text,
  uploaded_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists b_rolls_created_at_idx on public.b_rolls(created_at desc);

alter table public.b_rolls enable row level security;

-- Read: anyone signed in (workspace is small + private).
create policy "b_rolls read all" on public.b_rolls
  for select using (auth.uid() is not null);

-- Insert: must be uploading as yourself.
create policy "b_rolls insert self" on public.b_rolls
  for insert with check (auth.uid() = uploaded_by);

-- Delete: uploader OR the creator can remove a clip from the library.
create policy "b_rolls delete self" on public.b_rolls
  for delete using (auth.uid() = uploaded_by);

create policy "b_rolls delete creator" on public.b_rolls
  for delete using (public.current_role() = 'creator');

-- Cache the Drive folder id for the dedicated B-rolls Library folder, so we
-- don't have to look it up on every upload.
alter table public.profiles
  add column if not exists drive_b_rolls_folder_id text;
