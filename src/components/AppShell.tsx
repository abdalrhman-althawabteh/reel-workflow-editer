import type { Profile, Video } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { NavShell } from "./NavShell";

export async function AppShell({
  profile,
  unread,
  children,
}: {
  profile: Profile;
  unread: number;
  children: React.ReactNode;
}) {
  // Fetch a recent slice of projects so the drawer is ready as soon as it opens
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("videos")
    .select("id, title, status, updated_at, created_at")
    .order("updated_at", { ascending: false })
    .limit(60);

  return (
    <NavShell
      profile={profile}
      unread={unread}
      projects={(projects ?? []) as Video[]}
    >
      {children}
    </NavShell>
  );
}
