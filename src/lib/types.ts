import type { Role, Status } from "./status";

export type Profile = {
  user_id: string;
  email: string;
  role: Role;
  display_name: string | null;
  avatar_url: string | null;
  drive_root_folder_id: string | null;
};

export type Video = {
  id: string;
  title: string;
  caption: string | null;
  script: string | null;
  ref_link: string | null;
  status: Status;
  published_url: string | null;
  published_at: string | null;
  revision_note: string | null;
  created_by: string;
  claimed_by: string | null;
  created_at: string;
  updated_at: string;
};

export type FileKind = "raw" | "edit" | "audio" | "b_roll";

export type VideoFile = {
  id: string;
  video_id: string;
  kind: FileKind;
  revision_index: number;
  drive_file_id: string;
  drive_web_view_link: string | null;
  size_bytes: number | null;
  uploaded_by: string;
  uploaded_at: string;
};

export type Comment = {
  id: string;
  video_file_id: string;
  author_id: string;
  body: string;
  timestamp_seconds: number | null;
  resolved: boolean;
  created_at: string;
};

export type Activity = {
  id: string;
  user_id: string;
  video_id: string;
  kind: string;
  read_at: string | null;
  created_at: string;
};
