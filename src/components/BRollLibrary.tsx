"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Trash2, Plus, X, ExternalLink } from "lucide-react";
import { DriveUploader } from "./DriveUploader";
import { DownloadButton } from "./DownloadButton";
import { formatBytes, timeAgo } from "@/lib/utils";
import type { BRoll } from "@/app/b-rolls/page";

export function BRollLibrary({
  initial,
  canDelete,
}: {
  initial: BRoll[];
  canDelete: boolean;
}) {
  const router = useRouter();
  const [uploaderOpen, setUploaderOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function remove(id: string) {
    setDeletingId(id);
    setError(null);
    const res = await fetch(`/api/b-rolls/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "delete failed");
      setDeletingId(null);
      return;
    }
    setConfirmDeleteId(null);
    setDeletingId(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Upload control */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--background-elev)]/60 p-4">
        {!uploaderOpen ? (
          <button
            type="button"
            onClick={() => setUploaderOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--olive)] px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
          >
            <Plus size={14} />
            Add B-roll
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Upload to library</h3>
              <button
                type="button"
                onClick={() => setUploaderOpen(false)}
                className="grid h-7 w-7 place-items-center rounded-md text-[var(--muted)] hover:bg-[var(--background-elev-2)] hover:text-[var(--foreground)]"
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>
            <DriveUploader
              target="library"
              label="Drop B-roll clips"
              accept="video/*"
            />
          </div>
        )}
      </div>

      {error ? (
        <p className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
          {error}
        </p>
      ) : null}

      {/* Grid */}
      {initial.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--background-elev)]/40 py-16 text-center">
          <Play
            size={28}
            className="mx-auto mb-3 text-[var(--muted-2)]"
          />
          <p className="text-sm text-[var(--muted)]">
            No B-rolls in the library yet. Click <strong>Add B-roll</strong> to upload one.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {initial.map((r) => (
            <BRollTile
              key={r.id}
              row={r}
              isConfirming={confirmDeleteId === r.id}
              isDeleting={deletingId === r.id}
              onAskDelete={() => {
                setError(null);
                setConfirmDeleteId(r.id);
              }}
              onCancelDelete={() => setConfirmDeleteId(null)}
              onConfirmDelete={() => remove(r.id)}
              canDelete={canDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BRollTile({
  row,
  isConfirming,
  isDeleting,
  onAskDelete,
  onCancelDelete,
  onConfirmDelete,
  canDelete,
}: {
  row: BRoll;
  isConfirming: boolean;
  isDeleting: boolean;
  onAskDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
  canDelete: boolean;
}) {
  return (
    <div className="group overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background-elev)]/60 transition hover:border-[var(--accent)]/40">
      <a
        href={row.drive_web_view_link ?? "#"}
        target={row.drive_web_view_link ? "_blank" : undefined}
        rel="noreferrer"
        className="relative block aspect-video overflow-hidden bg-black"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/drive/thumbnail?file_id=${row.drive_file_id}`}
          alt={row.name}
          className="h-full w-full object-cover transition group-hover:scale-[1.02]"
          loading="lazy"
        />
        <div className="absolute inset-0 grid place-items-center bg-black/0 transition group-hover:bg-black/30">
          <Play
            size={24}
            className="text-white opacity-0 transition group-hover:opacity-100"
          />
        </div>
      </a>
      <div className="space-y-1 px-3 py-2">
        <p
          dir="auto"
          className="truncate text-sm font-medium"
          title={row.name}
        >
          {row.name}
        </p>
        <div className="flex items-center justify-between text-[11px] text-[var(--muted)]">
          <span>
            {row.size_bytes ? formatBytes(row.size_bytes) : "—"} ·{" "}
            {timeAgo(row.created_at)}
          </span>
          <div className="flex items-center gap-1">
            {row.drive_web_view_link ? (
              <a
                href={row.drive_web_view_link}
                target="_blank"
                rel="noreferrer"
                title="Open in Drive"
                className="grid h-6 w-6 place-items-center rounded text-[var(--muted)] hover:bg-[var(--background-elev-2)] hover:text-[var(--foreground)]"
              >
                <ExternalLink size={11} />
              </a>
            ) : null}
            <DownloadButton fileId={row.drive_file_id} />
            {canDelete ? (
              isConfirming ? (
                <span className="inline-flex items-center gap-1">
                  <button
                    type="button"
                    onClick={onCancelDelete}
                    disabled={isDeleting}
                    className="rounded px-1 py-0.5 text-[10px] text-[var(--muted)] hover:text-[var(--foreground)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={onConfirmDelete}
                    disabled={isDeleting}
                    className="rounded bg-rose-500 px-1.5 py-0.5 text-[10px] font-medium text-white hover:bg-rose-400 disabled:opacity-50"
                  >
                    {isDeleting ? "…" : "Delete"}
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onAskDelete}
                  title="Delete B-roll"
                  className="grid h-6 w-6 place-items-center rounded text-[var(--muted)] hover:bg-rose-500/15 hover:text-rose-300"
                >
                  <Trash2 size={11} />
                </button>
              )
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
