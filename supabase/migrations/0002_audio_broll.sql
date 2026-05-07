-- Adds audio + b_roll file kinds so a single video card can have multiple
-- input files (multiple takes, separate audio, B-roll clips).
--
-- Run this in your Supabase SQL editor as a NEW query (do not re-run 0001).

ALTER TYPE public.video_file_kind ADD VALUE IF NOT EXISTS 'audio';
ALTER TYPE public.video_file_kind ADD VALUE IF NOT EXISTS 'b_roll';