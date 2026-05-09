import Link from "next/link";
import { SkeletonShell, Skel } from "@/components/SkeletonShell";

export default function VideoLoading() {
  return (
    <SkeletonShell>
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1.5 text-xs text-[var(--muted)] transition hover:text-[var(--foreground)]"
      >
        ← Library
      </Link>

      {/* Header */}
      <header className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skel className="h-5 w-20 rounded-full" />
            <Skel className="h-3 w-24" />
          </div>
          <Skel className="h-8 w-2/3" />
          <Skel className="h-4 w-1/2" />
          <Skel className="h-3 w-40" />
        </div>
        <Skel className="h-9 w-32 shrink-0 rounded-lg" />
      </header>

      {/* Studio */}
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Skel className="aspect-video w-full rounded-2xl" />
        <div className="space-y-3">
          <Skel className="h-9 w-full rounded-lg" />
          <Skel className="h-32 w-full rounded-xl" />
          <Skel className="h-32 w-full rounded-xl" />
        </div>
      </div>

      {/* Status / meta strip */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_360px]">
        <Skel className="h-24 rounded-xl" />
        <div className="space-y-2">
          <Skel className="h-12 rounded-xl" />
          <Skel className="h-12 rounded-xl" />
        </div>
      </div>

      {/* Script */}
      <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--background-elev)]/40 p-4">
        <Skel className="mb-3 h-4 w-20" />
        <div className="space-y-2">
          <Skel className="h-3 w-full" />
          <Skel className="h-3 w-11/12" />
          <Skel className="h-3 w-10/12" />
          <Skel className="h-3 w-9/12" />
        </div>
      </div>
    </SkeletonShell>
  );
}
