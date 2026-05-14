"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LayoutGrid,
  List,
  RectangleHorizontal,
  Smartphone,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Video, VideoFile } from "@/lib/types";
import { TRANSITIONS, type Role, type Status } from "@/lib/status";
import { AssetCard } from "./AssetCard";
import { StatusBadge } from "./StatusBadge";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";

type FilterId =
  | "all"
  | "mine"
  | "pitched"
  | "production"
  | "review"
  | "approved"
  | "published";

const FILTERS: { id: FilterId; label: string; statuses: Status[] | null }[] = [
  { id: "all", label: "All active", statuses: null },
  { id: "mine", label: "My turn", statuses: null },
  { id: "pitched", label: "Pitched", statuses: ["idea", "ready_to_film"] },
  {
    id: "production",
    label: "Production",
    statuses: ["raw_uploaded", "editing"],
  },
  {
    id: "review",
    label: "Review",
    statuses: ["in_review", "revisions_requested"],
  },
  { id: "approved", label: "Approved", statuses: ["approved"] },
  { id: "published", label: "Published", statuses: ["published"] },
];

export function AssetBrowser({
  initialVideos,
  filesByVideo,
  role,
}: {
  initialVideos: Video[];
  filesByVideo: Record<string, VideoFile[]>;
  role: Role;
}) {
  const [videos, setVideos] = useState(initialVideos);
  const [filterId, setFilterId] = useState<FilterId>("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [aspect, setAspect] = useState<"video" | "portrait">("portrait");

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("videos-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "videos" },
        async () => {
          const { data } = await supabase
            .from("videos")
            .select("*")
            .order("updated_at", { ascending: false });
          if (data) setVideos(data as Video[]);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = useMemo(() => {
    const f = FILTERS.find((x) => x.id === filterId);
    if (!f) return videos;
    if (f.id === "mine") {
      return videos.filter((v) =>
        TRANSITIONS.some(
          (t) => t.role === role && t.from === (v.status as Status),
        ),
      );
    }
    if (f.id === "all") {
      return videos.filter((v) => v.status !== "published");
    }
    return videos.filter((v) =>
      f.statuses?.includes(v.status as Status),
    );
  }, [filterId, videos, role]);

  const counts = useMemo(() => {
    const out: Partial<Record<FilterId, number>> = {};
    out.all = videos.filter((v) => v.status !== "published").length;
    out.mine = videos.filter((v) =>
      TRANSITIONS.some(
        (t) => t.role === role && t.from === (v.status as Status),
      ),
    ).length;
    for (const f of FILTERS) {
      if (f.id === "all" || f.id === "mine") continue;
      out[f.id] =
        videos.filter((v) =>
          f.statuses?.includes(v.status as Status),
        ).length;
    }
    return out;
  }, [videos, role]);

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center gap-3 border-b border-[var(--border)] pb-4">
        <div className="scrollbar-thin -mx-2 flex flex-1 gap-1 overflow-x-auto px-2 pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterId(f.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${
                filterId === f.id
                  ? "bg-[var(--foreground)] text-[var(--background)]"
                  : "text-[var(--muted)] hover:bg-[var(--background-elev)] hover:text-[var(--foreground)]"
              }`}
            >
              {f.label}
              {(counts[f.id] ?? 0) > 0 ? (
                <span
                  className={`rounded-full px-1.5 py-px text-[10px] tabular-nums ${
                    filterId === f.id
                      ? "bg-[var(--background)]/15 text-[var(--background)]"
                      : "bg-[var(--background-elev-2)] text-[var(--muted)]"
                  }`}
                >
                  {counts[f.id]}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {view === "grid" ? (
            <div className="flex items-center rounded-md border border-[var(--border)] p-0.5">
              <ToolbarBtn
                active={aspect === "video"}
                onClick={() => setAspect("video")}
                title="16:9 thumbnails"
              >
                <RectangleHorizontal size={14} />
              </ToolbarBtn>
              <ToolbarBtn
                active={aspect === "portrait"}
                onClick={() => setAspect("portrait")}
                title="9:16 thumbnails (Reels)"
              >
                <Smartphone size={14} />
              </ToolbarBtn>
            </div>
          ) : null}
          <div className="flex items-center rounded-md border border-[var(--border)] p-0.5">
            <ToolbarBtn
              active={view === "grid"}
              onClick={() => setView("grid")}
              title="Grid"
            >
              <LayoutGrid size={14} />
            </ToolbarBtn>
            <ToolbarBtn
              active={view === "list"}
              onClick={() => setView("list")}
              title="List"
            >
              <List size={14} />
            </ToolbarBtn>
          </div>
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] py-20 text-center text-sm text-[var(--muted)]">
          Nothing here.
        </div>
      ) : view === "grid" ? (
        <div
          className={`grid gap-4 ${
            aspect === "portrait"
              ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          }`}
        >
          {filtered.map((v) => (
            <AssetCard
              key={v.id}
              video={v}
              files={filesByVideo[v.id] ?? []}
              role={role}
              aspect={aspect}
            />
          ))}
        </div>
      ) : (
        <AssetList
          videos={filtered}
          filesByVideo={filesByVideo}
          role={role}
        />
      )}
    </div>
  );
}

function ToolbarBtn({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`grid h-7 w-7 place-items-center rounded transition ${
        active
          ? "bg-[var(--background-elev-2)] text-[var(--foreground)]"
          : "text-[var(--muted)] hover:text-[var(--foreground)]"
      }`}
    >
      {children}
    </button>
  );
}

function AssetList({
  videos,
  filesByVideo,
  role,
}: {
  videos: Video[];
  filesByVideo: Record<string, VideoFile[]>;
  role: Role;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)]">
      <table className="w-full text-sm">
        <thead className="border-b border-[var(--border)] bg-[var(--background-elev)] text-left text-[11px] uppercase tracking-wider text-[var(--muted)]">
          <tr>
            <th className="px-4 py-2 font-medium">Title</th>
            <th className="px-4 py-2 font-medium">Status</th>
            <th className="px-4 py-2 font-medium">Files</th>
            <th className="px-4 py-2 font-medium">Updated</th>
          </tr>
        </thead>
        <tbody>
          {videos.map((v) => {
            const fs = filesByVideo[v.id] ?? [];
            const yourTurn = TRANSITIONS.some(
              (t) => t.role === role && t.from === (v.status as Status),
            );
            return (
              <tr
                key={v.id}
                className="border-t border-[var(--border)] transition hover:bg-[var(--background-elev)]"
              >
                <td className="px-4 py-2.5">
                  <Link
                    href={`/video/${v.id}`}
                    className="flex items-center gap-2 font-medium hover:text-[var(--accent)]"
                  >
                    {yourTurn ? (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                    ) : null}
                    <span dir="auto" className="truncate">{v.title}</span>
                  </Link>
                </td>
                <td className="px-4 py-2.5">
                  <StatusBadge status={v.status as Status} />
                </td>
                <td className="px-4 py-2.5 text-[var(--muted)]">
                  {fs.length}
                </td>
                <td className="px-4 py-2.5 text-[var(--muted)]">
                  {timeAgo(v.updated_at)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
