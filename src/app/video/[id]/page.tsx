import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { requireUser } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusActions } from "@/components/StatusActions";
import { DriveUploader } from "@/components/DriveUploader";
import { EditDetailsButton } from "@/components/EditDetailsButton";
import { DeleteVideoButton } from "@/components/DeleteVideoButton";
import { VideoStudio } from "@/components/VideoStudio";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { DownloadAllButton } from "@/components/DownloadAllButton";
import { STATUS_META, type Status } from "@/lib/status";
import { timeAgo } from "@/lib/utils";
import type { Profile, Video, VideoFile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function VideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user, profile, supabase } = await requireUser();
  if (!user) redirect("/login");
  if (!profile) redirect("/login");

  const { data: video } = await supabase
    .from("videos")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!video) notFound();

  // Mark relevant activity as read
  await supabase
    .from("activity")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("video_id", id)
    .is("read_at", null);

  const { count: unread } = await supabase
    .from("activity")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("read_at", null);

  const { data: files } = await supabase
    .from("video_files")
    .select("*")
    .eq("video_id", id);

  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, display_name, avatar_url");
  const authorMap = Object.fromEntries(
    (profiles ?? []).map((p) => [p.user_id, p as Profile]),
  );

  const v = video as Video;
  const meta = STATUS_META[v.status as Status];
  const allFiles = (files ?? []) as VideoFile[];

  const rawCount = allFiles.filter((f) => f.kind === "raw").length;
  const audioCount = allFiles.filter((f) => f.kind === "audio").length;
  const bRollCount = allFiles.filter((f) => f.kind === "b_roll").length;

  return (
    <AppShell profile={profile} unread={unread ?? 0}>
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1.5 text-xs text-[var(--muted)] transition hover:text-[var(--foreground)]"
      >
        ← Library
      </Link>

      {/* Header — status + title + inline actions */}
      <header className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={v.status as Status} />
            <span className="text-xs text-[var(--muted)]">
              updated {timeAgo(v.updated_at)}
            </span>
          </div>
          <h1
            dir="auto"
            className="truncate text-2xl font-semibold tracking-tight"
          >
            {v.title}
          </h1>
          {v.caption ? (
            <p
              dir="auto"
              className="mt-1 max-w-2xl text-sm text-[var(--muted)]"
            >
              {v.caption}
            </p>
          ) : null}
          <p className="mt-1.5 text-xs text-[var(--muted)]">
            {meta.description}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <EditDetailsButton video={v} />
        </div>
      </header>

      {/* Revision-request callout (creator left a note) */}
      {v.revision_note ? (
        <div className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-rose-300">
            Revision note from creator
          </p>
          <p dir="auto" className="text-sm text-rose-200/90">
            {v.revision_note}
          </p>
        </div>
      ) : null}

      {/* Studio: player + asset tabs + comments rail */}
      <VideoStudio files={allFiles} authorMap={authorMap} />

      {/* Status actions + meta strip */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--background-elev)]/40 p-4">
          <StatusActions video={v} role={profile.role} />
        </div>
        <div className="space-y-2">
          <DownloadAllButton files={allFiles} />
          {v.ref_link ? (
            <a
              href={v.ref_link}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--background-elev)] px-3 py-2 text-xs transition hover:border-[var(--accent)]/40"
            >
              <ExternalLink size={13} className="text-[var(--accent)]" />
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
                  Inspiration
                </p>
                <p className="truncate text-[12px]">{stripUrl(v.ref_link)}</p>
              </div>
            </a>
          ) : null}
          {v.published_url ? (
            <a
              href={v.published_url}
              target="_blank"
              rel="noreferrer"
              className="block rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs transition hover:bg-emerald-500/10"
            >
              <p className="text-[10px] uppercase tracking-wider text-emerald-300">
                Published
              </p>
              <p className="truncate text-[12px]">
                {stripUrl(v.published_url)}
              </p>
            </a>
          ) : null}
        </div>
      </div>

      {/* Script (collapsible) */}
      <CollapsibleSection
        title="Script"
        defaultOpen={!allFiles.length}
        className="mt-6"
      >
        {v.script ? (
          <div className="scrollbar-thin max-h-96 space-y-3 overflow-y-auto font-mono text-[13px] leading-relaxed text-[var(--foreground)]/90">
            {v.script.split(/\n{2,}/).map((para, i) => (
              <p key={i} dir="auto" className="whitespace-pre-wrap">
                {para}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">
            No script yet. Click <em>Edit details</em> to add one.
          </p>
        )}
      </CollapsibleSection>

      {/* Upload zones */}
      {profile.role === "creator" &&
      v.status !== "approved" &&
      v.status !== "published" ? (
        <section className="mt-6">
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
            Add to this project
          </h2>
          <div className="grid gap-3 md:grid-cols-3">
            <DriveUploader
              videoId={v.id}
              kind="raw"
              label={rawCount > 0 ? "Add another video" : "Add video"}
              accept="video/*"
            />
            <DriveUploader
              videoId={v.id}
              kind="audio"
              label={audioCount > 0 ? "Add another audio" : "Add audio"}
              accept="audio/*"
            />
            <DriveUploader
              videoId={v.id}
              kind="b_roll"
              label={bRollCount > 0 ? "Add more B-roll" : "Add B-roll"}
              accept="video/*"
            />
          </div>
        </section>
      ) : null}

      {profile.role === "editor" &&
      (v.status === "editing" || v.status === "revisions_requested") ? (
        <section className="mt-6">
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
            Upload your edit
          </h2>
          <DriveUploader
            videoId={v.id}
            kind="edit"
            label={
              v.status === "revisions_requested"
                ? "Upload revision"
                : "Upload finished edit"
            }
            accept="video/*"
          />
        </section>
      ) : null}

      {/* Danger zone */}
      <div className="mt-10 max-w-md">
        <DeleteVideoButton videoId={v.id} />
      </div>
    </AppShell>
  );
}

function stripUrl(u: string) {
  try {
    return new URL(u).host.replace(/^www\./, "") + new URL(u).pathname;
  } catch {
    return u;
  }
}
