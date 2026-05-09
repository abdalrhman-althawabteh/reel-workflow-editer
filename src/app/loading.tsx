import { SkeletonShell, Skel } from "@/components/SkeletonShell";

export default function GenericLoading() {
  return (
    <SkeletonShell>
      <div className="mb-5 flex items-baseline justify-between">
        <Skel className="h-7 w-32" />
        <Skel className="h-3 w-24" />
      </div>

      {/* Filter / toolbar row */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Skel className="h-9 w-64 rounded-lg" />
        <Skel className="h-9 w-28 rounded-lg" />
        <Skel className="ml-auto h-9 w-32 rounded-lg" />
      </div>

      {/* Card grid (works for library, published, etc.) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-[var(--border)] bg-[var(--background-elev)]/40 p-3"
          >
            <Skel className="mb-3 aspect-video w-full rounded-lg" />
            <Skel className="mb-2 h-4 w-3/4" />
            <Skel className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </SkeletonShell>
  );
}
