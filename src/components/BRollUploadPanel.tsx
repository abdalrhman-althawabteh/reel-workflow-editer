"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { DriveUploader } from "./DriveUploader";

type Project = { id: string; title: string };

export function BRollUploadPanel({ projects }: { projects: Project[] }) {
  const [open, setOpen] = useState(false);
  const [pickedId, setPickedId] = useState<string>("");

  if (projects.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--background-elev)]/40 p-4 text-center text-sm text-[var(--muted)]">
        Create a project first, then come back here to upload B-rolls into it.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--background-elev)]/60 p-4">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--olive)] px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
        >
          <Plus size={14} />
          Add B-roll
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Add B-roll to a project</h3>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setPickedId("");
              }}
              className="grid h-7 w-7 place-items-center rounded-md text-[var(--muted)] hover:bg-[var(--background-elev-2)] hover:text-[var(--foreground)]"
              aria-label="Close"
            >
              <X size={14} />
            </button>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[var(--muted)]">
              Project
            </label>
            <select
              value={pickedId}
              onChange={(e) => setPickedId(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background-elev-2)] px-3 py-2 text-sm focus:border-[var(--accent)]/50 focus:outline-none"
            >
              <option value="" disabled>
                Pick a project…
              </option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {pickedId ? (
            <div className="pt-1">
              <DriveUploader
                key={pickedId}
                videoId={pickedId}
                kind="b_roll"
                label="Drop B-roll file"
                accept="video/*"
              />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
