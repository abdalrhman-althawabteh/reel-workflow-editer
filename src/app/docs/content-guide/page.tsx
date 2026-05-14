import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";
import ContentGuideClient from "@/components/content-guide/ContentGuideClient";

export const dynamic = "force-dynamic";

export default async function ContentGuidePage() {
  const { user, profile, supabase } = await requireUser();
  if (!user) redirect("/login");
  if (!profile) redirect("/login");

  const { count: unread } = await supabase
    .from("activity")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("read_at", null);

  return (
    <AppShell profile={profile} unread={unread ?? 0}>
      <ContentGuideClient />
    </AppShell>
  );
}
