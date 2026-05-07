"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeleteVideoButton({ videoId }: { videoId: string }) {
  const router = useRouter();
  const [armed, setArmed] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmDelete() {
    setDeleting(true);
    setError(null);
    const res = await fetch(`/api/videos/${videoId}`, { method: "DELETE" });
    if (!res.ok) {
      setDeleting(false);
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "delete failed");
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-xs">
      {!armed ? (
        <button
          onClick={() => setArmed(true)}
          className="inline-flex items-center gap-1.5 text-rose-300 transition hover:text-rose-200"
        >
          <Trash2 size={13} /> Delete this video
        </button>
      ) : (
        <div className="space-y-2">
          <p className="text-rose-200/90 leading-relaxed">
            This removes the video, its files, and all comments. Drive files go
            to your Drive trash (recoverable for 30 days, then auto-deleted).
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setArmed(false)}
              className="rounded-md border border-[var(--border)] px-2.5 py-1 text-[11px] text-[var(--muted)] hover:text-[var(--foreground)]"
              disabled={deleting}
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={deleting}
              className="rounded-md bg-rose-500 px-2.5 py-1 text-[11px] font-medium text-white transition hover:bg-rose-400 disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Confirm delete"}
            </button>
          </div>
          {error ? (
            <p className="rounded-md border border-rose-500/30 bg-rose-500/15 px-2 py-1 text-rose-200">
              {error}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
