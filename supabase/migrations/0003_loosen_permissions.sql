-- Loosen role/permissions so both creator and editor can:
--   * create new video projects (was: editor-only)
--   * delete individual files they uploaded
-- Creator can additionally delete any file in any project.

-- 1) videos: allow any authenticated user to insert (was: editor-only)
drop policy if exists "videos insert editor" on public.videos;

create policy "videos insert auth" on public.videos
  for insert
  with check (auth.uid() is not null and created_by = auth.uid());

-- 2) video_files: allow uploader to delete their own files
create policy "files delete self" on public.video_files
  for delete
  using (auth.uid() = uploaded_by);

-- 3) video_files: allow the creator to delete any file (cleanup superpower)
create policy "files delete creator" on public.video_files
  for delete
  using (public.current_role() = 'creator');
