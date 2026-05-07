"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import type { VideoFile } from "@/lib/types";

// Browsers will fire one Save dialog per file when we click invisible <a> tags
// with a small stagger. No zipping — each file lands on disk in its native
// container (.MOV / .MP4 / .WAV) so codecs and color profiles stay intact.
//
// IMPORTANT: same-origin <a> clicks without `download` attribute can be
// interpreted as page navigation rather than download. The empty `download`
// attribute on the link forces the browser to treat it as a download, then
// the server's Content-Disposition fills in the actual filename.
const STAGGER_MS = 1200;

export function DownloadAllButton({ files }: { files: VideoFile[] }) {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  // Editors don't need their own finished edits; only raw materials
  const downloadable = files.filter((f) => f.kind !== "edit");

  if (downloadable.length === 0) return null;

  const counts = {
    raw: downloadable.filter((f) => f.kind === "raw").length,
    audio: downloadable.filter((f) => f.kind === "audio").length,
    b_roll: downloadable.filter((f) => f.kind === "b_roll").length,
  };

  const summary = [
    counts.raw > 0 ? `${counts.raw} video${counts.raw > 1 ? "s" : ""}` : null,
    counts.audio > 0 ? `${counts.audio} audio` : null,
    counts.b_roll > 0 ? `${counts.b_roll} B-roll` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  async function run() {
    if (running) return;
    setRunning(true);
    setProgress(0);

    for (let i = 0; i < downloadable.length; i++) {
      const file = downloadable[i];
      const a = document.createElement("a");
      a.href = `/api/drive/download?file_id=${file.drive_file_id}`;
      // Empty value tells the browser "treat as download, use server-supplied
      // filename from Content-Disposition". Without this, same-origin clicks
      // get treated as navigation and silently drop in rapid succession.
      a.download = "";
      a.style.display = "none";
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setProgress(i + 1);
      // Small stagger so browsers don't block as "multiple downloads abuse"
      if (i < downloadable.length - 1) {
        await new Promise((r) => setTimeout(r, STAGGER_MS));
      }
    }

    // Hold the "done" state briefly so the user sees confirmation
    setTimeout(() => {
      setRunning(false);
      setProgress(0);
    }, 1500);
  }

  return (
    <button
      onClick={run}
      disabled={running}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent-soft)] px-3 py-2.5 text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--accent-soft)]/70 disabled:opacity-60"
    >
      <Download size={14} />
      {running ? (
        <span>
          Downloading {progress}/{downloadable.length}…
        </span>
      ) : (
        <span>
          Download all source files
          <span className="ml-1.5 text-[11px] font-normal text-[var(--accent)]/70">
            ({summary})
          </span>
        </span>
      )}
    </button>
  );
}
