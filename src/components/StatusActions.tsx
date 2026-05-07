"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, RotateCcw, Send, Globe2 } from "lucide-react";
import type { Role, Status } from "@/lib/status";
import type { Video } from "@/lib/types";

export function StatusActions({ video, role }: { video: Video; role: Role }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revisionDialog, setRevisionDialog] = useState(false);
  const [publishDialog, setPublishDialog] = useState(false);
  const [revisionNote, setRevisionNote] = useState("");
  const [publishUrl, setPublishUrl] = useState("");

  async function transition(to: Status, payload?: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/videos/${video.id}/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, ...payload }),
    });
    setBusy(false);
    if (!res.ok) {
      setError((await res.json()).error ?? "Failed");
      return;
    }
    setRevisionDialog(false);
    setPublishDialog(false);
    router.refresh();
  }

  const status = video.status as Status;
  const buttons: React.ReactNode[] = [];

  if (role === "creator") {
    if (status === "idea") {
      buttons.push(
        <ActionButton
          key="queue"
          icon={<Check size={14} />}
          tone="primary"
          onClick={() => transition("ready_to_film")}
          disabled={busy}
        >
          Queue for filming
        </ActionButton>,
      );
    }
    if (status === "in_review") {
      buttons.push(
        <ActionButton
          key="approve"
          icon={<Check size={14} />}
          tone="primary"
          onClick={() => transition("approved")}
          disabled={busy}
        >
          Approve cut
        </ActionButton>,
        <ActionButton
          key="request"
          icon={<RotateCcw size={14} />}
          tone="ghost"
          onClick={() => setRevisionDialog(true)}
          disabled={busy}
        >
          Request revisions
        </ActionButton>,
      );
    }
    if (status === "approved") {
      buttons.push(
        <ActionButton
          key="publish"
          icon={<Globe2 size={14} />}
          tone="primary"
          onClick={() => setPublishDialog(true)}
          disabled={busy}
        >
          Mark as published
        </ActionButton>,
      );
    }
  } else if (role === "editor") {
    if (status === "raw_uploaded") {
      buttons.push(
        <ActionButton
          key="claim"
          icon={<Send size={14} />}
          tone="primary"
          onClick={() => transition("editing")}
          disabled={busy}
        >
          Claim &amp; start editing
        </ActionButton>,
      );
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-wider text-[var(--muted)]">
        Actions
      </p>
      {buttons.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          No actions for you right now.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">{buttons}</div>
      )}
      {error ? (
        <p className="rounded-md border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs text-rose-300">
          {error}
        </p>
      ) : null}

      {revisionDialog ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--background-elev)] p-3">
          <p className="mb-2 text-xs uppercase tracking-wider text-[var(--muted)]">
            Revision note for the editor
          </p>
          <textarea
            rows={3}
            value={revisionNote}
            onChange={(e) => setRevisionNote(e.target.value)}
            placeholder="Cut the intro, swap b-roll at 0:42…"
            className="w-full rounded-md border border-[var(--border)] bg-[var(--background-elev-2)] px-2.5 py-1.5 text-sm focus:border-[var(--accent)]/50 focus:outline-none"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              onClick={() => setRevisionDialog(false)}
              className="rounded-md px-2 py-1 text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              Cancel
            </button>
            <button
              disabled={!revisionNote.trim() || busy}
              onClick={() =>
                transition("revisions_requested", { note: revisionNote.trim() })
              }
              className="rounded-md bg-rose-500 px-3 py-1 text-xs font-medium text-white transition hover:bg-rose-400 disabled:opacity-50"
            >
              Send back
            </button>
          </div>
        </div>
      ) : null}

      {publishDialog ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--background-elev)] p-3">
          <p className="mb-2 text-xs uppercase tracking-wider text-[var(--muted)]">
            Published URL
          </p>
          <input
            value={publishUrl}
            onChange={(e) => setPublishUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=…"
            className="w-full rounded-md border border-[var(--border)] bg-[var(--background-elev-2)] px-2.5 py-1.5 text-sm focus:border-[var(--accent)]/50 focus:outline-none"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              onClick={() => setPublishDialog(false)}
              className="rounded-md px-2 py-1 text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              Cancel
            </button>
            <button
              disabled={!publishUrl.trim() || busy}
              onClick={() =>
                transition("published", { publish_url: publishUrl.trim() })
              }
              className="rounded-md bg-emerald-500 px-3 py-1 text-xs font-medium text-white transition hover:bg-emerald-400 disabled:opacity-50"
            >
              Confirm
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ActionButton({
  icon,
  tone,
  children,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  tone: "primary" | "ghost";
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  const cls =
    tone === "primary"
      ? "bg-gradient-to-br from-[var(--accent)] to-[var(--olive)] text-white shadow-md"
      : "border border-[var(--border)] bg-[var(--background-elev)] text-[var(--foreground)]";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition hover:opacity-90 disabled:opacity-50 ${cls}`}
    >
      {icon}
      {children}
    </button>
  );
}
