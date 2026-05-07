"use client";

import { useEffect, useState, useRef } from "react";
import { MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Comment } from "@/lib/types";
import { formatTimestamp, timeAgo } from "@/lib/utils";

export function CommentsPanel({
  fileId,
  videoElement,
  authorMap,
}: {
  fileId: string;
  /** When provided, comments can be timestamped to the player's currentTime */
  videoElement?: HTMLVideoElement | null;
  authorMap: Record<string, { display_name: string | null; avatar_url: string | null }>;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState("");
  const [pinTime, setPinTime] = useState<number | null>(null);
  const [posting, setPosting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initial fetch on file change
  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    supabase
      .from("comments")
      .select("*")
      .eq("video_file_id", fileId)
      .order("timestamp_seconds", { ascending: true, nullsFirst: false })
      .then(({ data }) => {
        if (!cancelled) setComments((data as Comment[]) ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, [fileId]);

  // Realtime
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`comments:${fileId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `video_file_id=eq.${fileId}`,
        },
        (payload) => {
          setComments((prev) => {
            const next = [...prev, payload.new as Comment];
            return next.sort(
              (a, b) =>
                (a.timestamp_seconds ?? -1) - (b.timestamp_seconds ?? -1),
            );
          });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fileId]);

  function pinNow() {
    const t = videoElement?.currentTime ?? 0;
    setPinTime(Math.round(t * 10) / 10);
    inputRef.current?.focus();
  }

  function seekTo(seconds: number | null) {
    if (seconds == null || !videoElement) return;
    // Mutating the player element is the intended behaviour; lint flags it
    // because the element arrived via prop, but it's a DOM handle, not state.
    // eslint-disable-next-line react-hooks/immutability
    videoElement.currentTime = seconds;
    videoElement.focus();
  }

  async function post(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setPosting(true);
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        video_file_id: fileId,
        body: body.trim(),
        timestamp_seconds: pinTime,
      }),
    });
    setPosting(false);
    if (res.ok) {
      setBody("");
      setPinTime(null);
    }
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-[var(--border)] bg-[var(--background-elev)]/40">
      <header className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
        <MessageCircle size={14} className="text-[var(--accent)]" />
        <h3 className="text-sm font-medium">Comments</h3>
        <span className="ml-auto text-xs text-[var(--muted)]">
          {comments.length}
        </span>
      </header>

      <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto p-4">
        {comments.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            {videoElement
              ? "Click the timeline, then leave a note pinned to that frame."
              : "No comments yet."}
          </p>
        ) : (
          comments.map((c) => {
            const author = authorMap[c.author_id];
            return (
              <article key={c.id} className="group">
                <div className="mb-1.5 flex items-center gap-2">
                  {author?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={author.avatar_url}
                      alt=""
                      className="h-5 w-5 rounded-full"
                    />
                  ) : (
                    <div className="grid h-5 w-5 place-items-center rounded-full bg-[var(--background-elev-2)] text-[9px] font-semibold uppercase text-[var(--muted)]">
                      {(author?.display_name ?? "·").slice(0, 1)}
                    </div>
                  )}
                  <span className="text-xs font-medium">
                    {author?.display_name ?? "Someone"}
                  </span>
                  {c.timestamp_seconds != null && videoElement ? (
                    <button
                      onClick={() => seekTo(c.timestamp_seconds)}
                      className="rounded bg-[var(--accent-soft)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--accent)] transition hover:bg-[var(--accent-soft)]/70"
                    >
                      {formatTimestamp(c.timestamp_seconds)}
                    </button>
                  ) : c.timestamp_seconds != null ? (
                    <span className="rounded bg-[var(--background-elev-2)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--muted)]">
                      {formatTimestamp(c.timestamp_seconds)}
                    </span>
                  ) : null}
                  <span className="ml-auto text-[10px] text-[var(--muted)]">
                    {timeAgo(c.created_at)}
                  </span>
                </div>
                <p className="pl-7 text-sm leading-relaxed text-[var(--foreground)]/90">
                  {c.body}
                </p>
              </article>
            );
          })
        )}
      </div>

      <form
        onSubmit={post}
        className="border-t border-[var(--border)] p-3"
      >
        {videoElement ? (
          <div className="mb-2 flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={pinNow}
              className="rounded-md border border-[var(--border)] bg-[var(--background-elev)] px-2 py-0.5 text-[11px] text-[var(--muted)] transition hover:border-[var(--accent)]/40 hover:text-[var(--foreground)]"
            >
              Pin to current frame
            </button>
            {pinTime != null ? (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[var(--accent-soft)] px-2 py-0.5 text-[11px] text-[var(--accent)]">
                @ {formatTimestamp(pinTime)}
                <button
                  type="button"
                  className="opacity-70 hover:opacity-100"
                  onClick={() => setPinTime(null)}
                >
                  ×
                </button>
              </span>
            ) : null}
          </div>
        ) : null}
        <textarea
          ref={inputRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={
            pinTime != null
              ? `Note at ${formatTimestamp(pinTime)}…`
              : "Leave a note…"
          }
          rows={2}
          className="w-full resize-none rounded-md border border-[var(--border)] bg-[var(--background-elev)] px-2.5 py-1.5 text-sm placeholder:text-[var(--muted)]/60 focus:border-[var(--accent)]/50 focus:outline-none"
        />
        <div className="mt-2 flex justify-end">
          <button
            disabled={!body.trim() || posting}
            className="rounded-md bg-[var(--accent)] px-3 py-1 text-xs font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {posting ? "Posting…" : "Comment"}
          </button>
        </div>
      </form>
    </div>
  );
}
