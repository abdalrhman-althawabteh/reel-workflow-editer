import { redirect } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

const KIND_LABELS: Record<string, string> = {
  idea_proposed: "New idea proposed",
  ready_to_film: "Queued for filming",
  raw_uploaded: "Raw footage uploaded",
  editing: "Editor claimed it",
  in_review: "Edit ready to review",
  revisions_requested: "Revisions requested",
  approved: "Edit approved",
  published: "Published",
  comment: "New comment",
  raw_added: "More video added",
  audio_added: "Audio added",
  b_roll_added: "B-roll added",
  edit_added: "New edit revision",
};

export default async function InboxPage() {
  const { user, profile, supabase } = await requireUser();
  if (!user) redirect("/login");
  if (!profile) redirect("/login");

  const { data: feed } = await supabase
    .from("activity")
    .select("id, kind, video_id, read_at, created_at, videos(title, status)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const { count: unread } = await supabase
    .from("activity")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("read_at", null);

  return (
    <AppShell profile={profile} unread={unread ?? 0}>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
        <p className="text-sm text-[var(--muted)]">
          Activity that needs your attention.
        </p>
      </div>

      <ul className="divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background-elev)]/40">
        {(feed ?? []).map((row) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const r = row as any;
          const v = r.videos;
          return (
            <li key={r.id} className="group">
              <Link
                href={`/video/${r.video_id}`}
                className="flex items-center gap-3 px-4 py-3 transition hover:bg-[var(--background-elev)]"
              >
                <div
                  className={`h-2 w-2 rounded-full ${
                    r.read_at
                      ? "bg-[var(--border)]"
                      : "bg-[var(--accent)] ring-2 ring-[var(--accent)]/25"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">
                    <span className="font-medium">
                      {KIND_LABELS[r.kind] ?? r.kind}
                    </span>
                    {v?.title ? (
                      <span className="text-[var(--muted)]"> · {v.title}</span>
                    ) : null}
                  </p>
                </div>
                <span className="text-xs text-[var(--muted)]">
                  {timeAgo(r.created_at)}
                </span>
              </Link>
            </li>
          );
        })}
        {(feed ?? []).length === 0 ? (
          <li className="px-4 py-12 text-center text-sm text-[var(--muted)]">
            No activity yet.
          </li>
        ) : null}
      </ul>
    </AppShell>
  );
}
