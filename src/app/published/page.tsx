import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Circle, ExternalLink } from "lucide-react";
import { requireUser } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { timeAgo } from "@/lib/utils";
import type { Status } from "@/lib/status";

export const dynamic = "force-dynamic";

export default async function PublishedPage() {
  const { user, profile, supabase } = await requireUser();
  if (!user) redirect("/login");
  if (!profile) redirect("/login");

  const { data: videos } = await supabase
    .from("videos")
    .select("*")
    .in("status", ["approved", "published"])
    .order("updated_at", { ascending: false });

  const { count: unread } = await supabase
    .from("activity")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("read_at", null);

  const items = videos ?? [];
  const pending = items.filter((v) => v.status === "approved");
  const done = items.filter((v) => v.status === "published");

  return (
    <AppShell profile={profile} unread={unread ?? 0}>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Published</h1>
        <p className="text-sm text-[var(--muted)]">
          Approved cuts waiting to go live and the archive of what&apos;s posted.
        </p>
      </div>

      <section className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--background-elev)]/40 p-5">
        <header className="mb-4 flex items-baseline justify-between">
          <div>
            <h2 className="text-sm font-medium">To post</h2>
            <p className="text-xs text-[var(--muted)]">
              Approved but not yet published.
            </p>
          </div>
          <span className="rounded-full bg-[var(--background-elev-2)] px-2 py-0.5 text-xs text-[var(--muted)]">
            {pending.length}
          </span>
        </header>
        {pending.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">All caught up.</p>
        ) : (
          <ul className="space-y-2">
            {pending.map((v) => (
              <li key={v.id}>
                <Link
                  href={`/video/${v.id}`}
                  className="flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 transition hover:border-[var(--border)] hover:bg-[var(--background-elev)]"
                >
                  <Circle size={16} className="text-[var(--muted)]" />
                  <span dir="auto" className="flex-1 truncate text-sm">
                    {v.title}
                  </span>
                  <StatusBadge status={v.status as Status} />
                  <span className="text-xs text-[var(--muted)]">
                    {timeAgo(v.updated_at)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--background-elev)]/40 p-5">
        <header className="mb-4 flex items-baseline justify-between">
          <div>
            <h2 className="text-sm font-medium">Archive</h2>
            <p className="text-xs text-[var(--muted)]">Posted videos.</p>
          </div>
          <span className="rounded-full bg-[var(--background-elev-2)] px-2 py-0.5 text-xs text-[var(--muted)]">
            {done.length}
          </span>
        </header>
        {done.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Nothing posted yet.</p>
        ) : (
          <ul className="space-y-2">
            {done.map((v) => (
              <li
                key={v.id}
                className="flex items-center gap-3 rounded-lg px-3 py-2"
              >
                <CheckCircle2 size={16} className="text-emerald-400" />
                <Link
                  href={`/video/${v.id}`}
                  dir="auto"
                  className="flex-1 truncate text-sm hover:underline"
                >
                  {v.title}
                </Link>
                {v.published_url ? (
                  <a
                    href={v.published_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[var(--muted)] transition hover:text-[var(--foreground)]"
                  >
                    open <ExternalLink size={11} />
                  </a>
                ) : null}
                <span className="text-xs text-[var(--muted)]">
                  {v.published_at ? timeAgo(v.published_at) : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
