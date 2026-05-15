import { redirect } from "next/navigation";
import Link from "next/link";
import { Layers, Play } from "lucide-react";
import { requireUser } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";
import { DownloadButton } from "@/components/DownloadButton";
import { BRollUploadPanel } from "@/components/BRollUploadPanel";
import { formatBytes, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

type BRollRow = {
  id: string;
  drive_file_id: string;
  size_bytes: number | null;
  revision_index: number;
  created_at: string;
  video_id: string;
  videos: { id: string; title: string; status: string } | null;
};

export default async function BRollsPage() {
  const { user, profile, supabase } = await requireUser();
  if (!user) redirect("/login");
  if (!profile) redirect("/login");

  const { data: rows } = await supabase
    .from("video_files")
    .select(
      "id, drive_file_id, size_bytes, revision_index, created_at, video_id, videos(id, title, status)",
    )
    .eq("kind", "b_roll")
    .order("created_at", { ascending: false });

  // Projects the user can pick from when uploading a new B-roll inline.
  // Exclude published projects (locked for further uploads).
  const { data: projects } = await supabase
    .from("videos")
    .select("id, title, status")
    .neq("status", "published")
    .order("updated_at", { ascending: false });

  const { count: unread } = await supabase
    .from("activity")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("read_at", null);

  const items = (rows ?? []) as unknown as BRollRow[];

  // Group by project, preserving newest-first order of first appearance.
  const groups = new Map<string, { title: string; items: BRollRow[] }>();
  for (const r of items) {
    const v = r.videos;
    if (!v) continue;
    const existing = groups.get(v.id);
    if (existing) existing.items.push(r);
    else groups.set(v.id, { title: v.title, items: [r] });
  }

  const totalCount = items.length;
  const projectCount = groups.size;

  return (
    <AppShell profile={profile} unread={unread ?? 0}>
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Layers size={20} className="text-[var(--accent)]" />
            B-rolls
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Every B-roll clip across every project, newest first.
          </p>
        </div>
        {totalCount > 0 ? (
          <p className="text-xs text-[var(--muted)]">
            {totalCount} clips · {projectCount}{" "}
            {projectCount === 1 ? "project" : "projects"}
          </p>
        ) : null}
      </div>

      <div className="mb-6">
        <BRollUploadPanel
          projects={(projects ?? []).map((p) => ({
            id: p.id as string,
            title: p.title as string,
          }))}
        />
      </div>

      {totalCount === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--background-elev)]/40 py-16 text-center">
          <Layers
            size={28}
            className="mx-auto mb-3 text-[var(--muted-2)]"
          />
          <p className="text-sm text-[var(--muted)]">
            No B-rolls uploaded yet. Use the panel above to add one to any
            project.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Array.from(groups.entries()).map(([videoId, group]) => (
            <section key={videoId}>
              <header className="mb-3 flex items-baseline justify-between">
                <Link
                  href={`/video/${videoId}`}
                  dir="auto"
                  className="text-base font-medium hover:underline"
                >
                  {group.title}
                </Link>
                <span className="text-xs text-[var(--muted)]">
                  {group.items.length}{" "}
                  {group.items.length === 1 ? "clip" : "clips"}
                </span>
              </header>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((r) => (
                  <BRollCard key={r.id} row={r} videoId={videoId} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </AppShell>
  );
}

function BRollCard({ row, videoId }: { row: BRollRow; videoId: string }) {
  return (
    <div className="group overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background-elev)]/60 transition hover:border-[var(--accent)]/40">
      <Link
        href={`/video/${videoId}`}
        className="relative block aspect-video overflow-hidden bg-black"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/drive/thumbnail?file_id=${row.drive_file_id}`}
          alt=""
          className="h-full w-full object-cover transition group-hover:scale-[1.02]"
          loading="lazy"
        />
        <div className="absolute inset-0 grid place-items-center bg-black/0 transition group-hover:bg-black/30">
          <Play
            size={24}
            className="text-white opacity-0 transition group-hover:opacity-100"
          />
        </div>
        <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur">
          B-roll #{row.revision_index}
        </span>
      </Link>
      <div className="flex items-center justify-between gap-2 px-3 py-2 text-[11px] text-[var(--muted)]">
        <span>
          {row.size_bytes ? formatBytes(row.size_bytes) : "—"} ·{" "}
          {timeAgo(row.created_at)}
        </span>
        <DownloadButton fileId={row.drive_file_id} />
      </div>
    </div>
  );
}
