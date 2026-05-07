"use client";

import { useMemo, useState } from "react";
import { Film, Music, Layers, Scissors } from "lucide-react";
import type { VideoFile } from "@/lib/types";
import { CommentsPanel } from "./CommentsPanel";
import { DownloadButton } from "./DownloadButton";
import { formatBytes } from "@/lib/utils";

type Author = { display_name: string | null; avatar_url: string | null };

const KIND_ICON = {
  edit: Scissors,
  raw: Film,
  audio: Music,
  b_roll: Layers,
} as const;

function fileLabel(f: VideoFile) {
  if (f.kind === "edit") return `Edit v${f.revision_index}`;
  if (f.kind === "raw") return `Video #${f.revision_index}`;
  if (f.kind === "audio") return `Audio #${f.revision_index}`;
  if (f.kind === "b_roll") return `B-roll #${f.revision_index}`;
  return f.kind;
}

function pickDefault(files: VideoFile[]): VideoFile | null {
  // Prefer latest edit (newest revision), else first raw
  const edits = files
    .filter((f) => f.kind === "edit")
    .sort((a, b) => b.revision_index - a.revision_index);
  if (edits[0]) return edits[0];
  const raws = files
    .filter((f) => f.kind === "raw")
    .sort((a, b) => a.revision_index - b.revision_index);
  if (raws[0]) return raws[0];
  return files[0] ?? null;
}

function sortedAssets(files: VideoFile[]): VideoFile[] {
  // Edits first (newest first), then raws, audio, b-roll (chronological)
  const order: Record<VideoFile["kind"], number> = {
    edit: 0,
    raw: 1,
    audio: 2,
    b_roll: 3,
  };
  return [...files].sort((a, b) => {
    if (order[a.kind] !== order[b.kind]) return order[a.kind] - order[b.kind];
    if (a.kind === "edit") return b.revision_index - a.revision_index;
    return a.revision_index - b.revision_index;
  });
}

export function VideoStudio({
  files,
  authorMap,
}: {
  files: VideoFile[];
  authorMap: Record<string, Author>;
}) {
  const ordered = useMemo(() => sortedAssets(files), [files]);
  // User's manual pick — null until they click a tab. The actual selected
  // file is derived during render so it stays in sync when files change.
  const [pickedId, setPickedId] = useState<string | null>(null);
  // Callback ref — React invokes this with the element on mount/unmount, and
  // the state change triggers re-render so CommentsPanel sees the live element.
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);

  const picked = pickedId ? ordered.find((f) => f.id === pickedId) : null;
  const selected = picked ?? pickDefault(ordered);
  const selectedId = selected?.id ?? null;

  if (!selected) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--border)] py-16 text-center text-sm text-[var(--muted)]">
        No files yet. Upload below to get started.
      </div>
    );
  }

  const isAudio = selected.kind === "audio";

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <div className="space-y-3">
        {/* Player */}
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-black">
          {isAudio ? (
            <div className="grid place-items-center px-6 py-12">
              <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                <Music size={28} />
              </div>
              <p className="mb-3 text-sm text-[var(--muted)]">
                {fileLabel(selected)}
              </p>
              <audio
                src={`/api/drive/stream?file_id=${selected.drive_file_id}`}
                controls
                preload="metadata"
                className="w-full max-w-md"
              />
            </div>
          ) : (
            <video
              key={selected.id}
              ref={setVideoEl}
              src={`/api/drive/stream?file_id=${selected.drive_file_id}`}
              controls
              preload="metadata"
              className="mx-auto block max-h-[55vh] max-w-sm object-contain"
            />
          )}
        </div>

        {/* Selected file info row */}
        <div className="flex items-center justify-between gap-3 px-1 text-xs">
          <div className="flex items-center gap-2 text-[var(--muted)]">
            <span className="font-medium text-[var(--foreground)]">
              {fileLabel(selected)}
            </span>
            {selected.size_bytes ? (
              <span>· {formatBytes(selected.size_bytes)}</span>
            ) : null}
          </div>
          <DownloadButton fileId={selected.drive_file_id} />
        </div>

        {/* Asset tabs strip */}
        {ordered.length > 1 ? (
          <div className="scrollbar-thin -mx-1 flex gap-2 overflow-x-auto px-1 py-1">
            {ordered.map((f) => {
              const Icon = KIND_ICON[f.kind];
              const active = f.id === selectedId;
              return (
                <button
                  key={f.id}
                  onClick={() => setPickedId(f.id)}
                  className={`group flex shrink-0 items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition ${
                    active
                      ? "border-[var(--accent)]/50 bg-[var(--accent-soft)] text-[var(--foreground)]"
                      : "border-[var(--border)] bg-[var(--background-elev)] text-[var(--muted)] hover:border-[var(--accent)]/30 hover:text-[var(--foreground)]"
                  }`}
                >
                  <Icon size={12} />
                  <span>{fileLabel(f)}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* Comments rail (only for video files; audio gets a simpler slot below) */}
      <div className="lg:h-[calc(55vh+80px)]">
        <CommentsPanel
          fileId={selected.id}
          videoElement={isAudio ? null : videoEl}
          authorMap={authorMap}
        />
      </div>
    </div>
  );
}
