"use client";

import dynamic from "next/dynamic";

const ContentGuide = dynamic(
  () => import("../ContentGuide").then((m) => m.ContentGuide),
  {
    ssr: false,
    loading: () => <ContentGuideSkeleton />,
  },
);

export default function ContentGuideClient() {
  return <ContentGuide />;
}

function ContentGuideSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-72 animate-pulse rounded-3xl bg-[var(--background-elev)]/70" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-2xl bg-[var(--background-elev)]/60"
          />
        ))}
      </div>
    </div>
  );
}
