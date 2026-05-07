import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";
import { AssetBrowser } from "@/components/AssetBrowser";
import type { Video, VideoFile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const { supabase, user, profile } = await requireUser();
  if (!user) redirect("/login");
  if (!profile) redirect("/login?error=missing_profile");

  const { data: videos } = await supabase
    .from("videos")
    .select("*")
    .order("updated_at", { ascending: false });

  const { data: files } = await supabase
    .from("video_files")
    .select("*");

  const filesByVideo: Record<string, VideoFile[]> = {};
  for (const f of (files ?? []) as VideoFile[]) {
    (filesByVideo[f.video_id] ??= []).push(f);
  }

  const { count: unread } = await supabase
    .from("activity")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("read_at", null);

  return (
    <AppShell profile={profile} unread={unread ?? 0}>
      <div className="mb-5 flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Library</h1>
        <p className="text-xs text-[var(--muted)]">
          Signed in as <span className="text-[var(--foreground)]">{profile.role}</span>
        </p>
      </div>
      <AssetBrowser
        initialVideos={(videos ?? []) as Video[]}
        filesByVideo={filesByVideo}
        role={profile.role}
      />
    </AppShell>
  );
}
