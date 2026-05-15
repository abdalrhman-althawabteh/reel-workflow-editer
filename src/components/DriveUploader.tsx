"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  Film,
  Music,
  Layers,
  Check,
  AlertTriangle,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";
import type { FileKind } from "@/lib/types";

const CHUNK = 8 * 1024 * 1024; // 8 MiB chunks (must be a multiple of 256 KiB)

const KIND_ICON: Record<FileKind, React.ComponentType<{ size?: number }>> = {
  raw: Film,
  edit: UploadCloud,
  audio: Music,
  b_roll: Layers,
};

type QueueItem = {
  id: string;
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
  errorMessage?: string;
};

type DriveUploaderProps =
  | {
      target?: "video";
      videoId: string;
      kind: FileKind;
      label: string;
      accept?: string;
    }
  | {
      target: "library";
      label: string;
      accept?: string;
    };

export function DriveUploader(props: DriveUploaderProps) {
  const { label, accept } = props;
  const isLibrary = props.target === "library";
  const videoId = isLibrary ? null : props.videoId;
  const kind: FileKind = isLibrary ? "b_roll" : props.kind;
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);

  const isProcessing = queue.some(
    (i) => i.status === "pending" || i.status === "uploading",
  );
  const allDone =
    queue.length > 0 && queue.every((i) => i.status === "done" || i.status === "error");

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const items: QueueItem[] = files.map((f, i) => ({
      id: `${Date.now()}-${i}-${f.name}`,
      file: f,
      status: "pending",
      progress: 0,
    }));
    setQueue(items);
    e.target.value = "";

    // Sequential upload — Drive's resumable upload doesn't love many parallel
    // chunked sessions on the same account. One file at a time keeps it stable.
    for (const item of items) {
      setQueue((q) =>
        q.map((x) => (x.id === item.id ? { ...x, status: "uploading" } : x)),
      );
      try {
        const onProgress = (p: number) => {
          setQueue((q) =>
            q.map((x) => (x.id === item.id ? { ...x, progress: p } : x)),
          );
        };
        if (isLibrary) {
          await uploadOneToLibrary(item.file, onProgress);
        } else {
          await uploadOne(item.file, videoId!, kind, onProgress);
        }
        setQueue((q) =>
          q.map((x) =>
            x.id === item.id ? { ...x, status: "done", progress: 100 } : x,
          ),
        );
        // Refresh after each completion so cards/thumbnails update incrementally
        router.refresh();
      } catch (err) {
        setQueue((q) =>
          q.map((x) =>
            x.id === item.id
              ? {
                  ...x,
                  status: "error",
                  errorMessage:
                    err instanceof Error ? err.message : "upload failed",
                }
              : x,
          ),
        );
      }
    }
  }

  function reset() {
    setQueue([]);
  }

  const Icon = KIND_ICON[kind];

  // Idle state — Choose-files button
  if (queue.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--background-elev)]/40 p-6">
        <input
          ref={fileRef}
          type="file"
          multiple
          accept={accept ?? "video/*"}
          onChange={onFiles}
          className="hidden"
        />
        <div className="flex flex-col items-center text-center">
          <div className="mb-3 grid h-12 w-12 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] ring-1 ring-[var(--accent)]/20">
            <Icon size={20} />
          </div>
          <p className="mb-1 text-sm font-medium">{label}</p>
          <p className="mb-4 text-xs text-[var(--muted)]">
            Pick one or many · streamed direct to Google Drive
          </p>
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--olive)] px-4 py-2 text-sm font-medium text-white shadow-md transition hover:opacity-90"
          >
            Choose files
          </button>
        </div>
      </div>
    );
  }

  // Queue state — list of files with per-file progress
  const successCount = queue.filter((i) => i.status === "done").length;
  const errorCount = queue.filter((i) => i.status === "error").length;
  const currentIndex = queue.findIndex((i) => i.status === "uploading") + 1;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--background-elev)]/40 p-4">
      <input
        ref={fileRef}
        type="file"
        multiple
        accept={accept ?? "video/*"}
        onChange={onFiles}
        className="hidden"
      />
      <div className="mb-3 flex items-center justify-between text-xs">
        <span className="text-[var(--muted)]">
          {isProcessing
            ? `Uploading ${currentIndex} of ${queue.length}…`
            : `${successCount} done${errorCount > 0 ? ` · ${errorCount} failed` : ""}`}
        </span>
        {allDone ? (
          <button
            onClick={reset}
            className="rounded-md bg-[var(--accent)] px-2.5 py-1 text-[11px] font-medium text-white transition hover:opacity-90"
          >
            Add more
          </button>
        ) : null}
      </div>
      <div className="scrollbar-thin max-h-80 space-y-2 overflow-y-auto">
        {queue.map((item) => (
          <QueueRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function QueueRow({ item }: { item: QueueItem }) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2 text-[11px]">
        <span className="flex min-w-0 items-center gap-1.5 truncate font-mono">
          {item.status === "done" ? (
            <Check size={11} className="shrink-0 text-emerald-300" />
          ) : item.status === "error" ? (
            <AlertTriangle size={11} className="shrink-0 text-rose-300" />
          ) : null}
          <span className="truncate">{item.file.name}</span>
        </span>
        <span className="shrink-0 text-[var(--muted)]">
          {item.progress}% · {formatBytes(item.file.size)}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-[var(--background-elev-2)]">
        <div
          className={`h-full transition-[width] ${
            item.status === "error"
              ? "bg-rose-500"
              : "bg-gradient-to-r from-[var(--accent)] to-[var(--olive)]"
          }`}
          style={{ width: `${item.progress}%` }}
        />
      </div>
      {item.errorMessage ? (
        <p className="mt-1 text-[10px] text-rose-300">{item.errorMessage}</p>
      ) : null}
    </div>
  );
}

async function uploadOneToLibrary(
  file: File,
  onProgress: (p: number) => void,
): Promise<void> {
  // 1. Mint resumable session URL (library endpoint — no videoId)
  const sessionRes = await fetch("/api/b-rolls/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      mime_type: file.type || "application/octet-stream",
      size: file.size,
    }),
  });
  if (!sessionRes.ok) {
    throw new Error((await sessionRes.json()).error ?? "session error");
  }
  const { session_url } = await sessionRes.json();

  // 2. Stream chunks to Drive
  const driveFileId = await uploadInChunks(file, session_url, (sent) =>
    onProgress(Math.min(99, Math.round((sent / file.size) * 100))),
  );

  // 3. Record into the b_rolls library
  const recordRes = await fetch("/api/b-rolls", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ drive_file_id: driveFileId }),
  });
  if (!recordRes.ok) {
    throw new Error((await recordRes.json()).error ?? "record error");
  }

  onProgress(100);
}

async function uploadOne(
  file: File,
  videoId: string,
  kind: FileKind,
  onProgress: (p: number) => void,
): Promise<void> {
  // 1. Mint resumable session URL
  const sessionRes = await fetch("/api/drive/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      video_id: videoId,
      kind,
      filename: file.name,
      mime_type: file.type || "application/octet-stream",
      size: file.size,
    }),
  });
  if (!sessionRes.ok) {
    throw new Error((await sessionRes.json()).error ?? "session error");
  }
  const { session_url } = await sessionRes.json();

  // 2. Stream chunks to Drive
  const driveFileId = await uploadInChunks(file, session_url, (sent) =>
    onProgress(Math.min(99, Math.round((sent / file.size) * 100))),
  );

  // 3. Record file metadata. Server auto-transitions status if applicable
  const recordRes = await fetch(`/api/videos/${videoId}/files`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, drive_file_id: driveFileId }),
  });
  if (!recordRes.ok) {
    throw new Error((await recordRes.json()).error ?? "record error");
  }

  onProgress(100);
}

async function uploadInChunks(
  file: File,
  sessionUrl: string,
  onProgress: (sent: number) => void,
): Promise<string> {
  let sent = 0;

  while (sent < file.size) {
    const end = Math.min(sent + CHUNK, file.size);
    const chunk = file.slice(sent, end);

    const result = await putChunk(
      sessionUrl,
      chunk,
      sent,
      end,
      file.size,
      (loaded) => onProgress(sent + loaded),
    );

    if (result.status === 308) {
      const range = result.headers["range"] ?? result.headers["Range"];
      if (range) {
        const m = /bytes=\d+-(\d+)/i.exec(range);
        sent = m ? parseInt(m[1], 10) + 1 : end;
      } else {
        sent = end;
      }
      onProgress(sent);
      continue;
    }

    if (result.status >= 200 && result.status < 300) {
      try {
        const json = JSON.parse(result.body);
        if (!json.id) throw new Error("Drive response missing file id");
        onProgress(file.size);
        return json.id as string;
      } catch {
        throw new Error(
          `Drive returned ${result.status} but body could not be parsed: ${result.body.slice(0, 300)}`,
        );
      }
    }

    throw new Error(
      `Drive upload failed (${result.status}): ${result.body.slice(0, 300)}`,
    );
  }

  throw new Error("upload finished without a Drive response");
}

function putChunk(
  sessionUrl: string,
  chunk: Blob,
  start: number,
  end: number,
  total: number,
  onProgress: (loaded: number) => void,
): Promise<{ status: number; headers: Record<string, string>; body: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", sessionUrl, true);
    xhr.setRequestHeader("Content-Range", `bytes ${start}-${end - 1}/${total}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded);
    };

    xhr.onload = () => {
      const headers: Record<string, string> = {};
      xhr
        .getAllResponseHeaders()
        .split(/\r\n/)
        .forEach((line) => {
          const idx = line.indexOf(":");
          if (idx > 0) {
            headers[line.slice(0, idx).trim().toLowerCase()] = line
              .slice(idx + 1)
              .trim();
          }
        });
      resolve({ status: xhr.status, headers, body: xhr.responseText });
    };

    xhr.onerror = () =>
      reject(
        new Error(
          "network error during chunk upload (CORS or connectivity)",
        ),
      );
    xhr.ontimeout = () => reject(new Error("upload chunk timed out"));
    xhr.onabort = () => reject(new Error("upload aborted"));

    xhr.send(chunk);
  });
}
