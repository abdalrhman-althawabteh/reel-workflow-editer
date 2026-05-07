import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";
import { NewIdeaForm } from "@/components/NewIdeaForm";

export const dynamic = "force-dynamic";

export default async function NewIdea() {
  const { user, profile, supabase } = await requireUser();
  if (!user) redirect("/login");
  if (!profile) redirect("/login");
  if (profile.role !== "editor") redirect("/");

  const { count: unread } = await supabase
    .from("activity")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("read_at", null);

  return (
    <AppShell profile={profile} unread={unread ?? 0}>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight">New idea</h1>
        <p className="mb-8 text-sm text-[var(--muted)]">
          Pitch a video. The creator sees it as a card on their pipeline.
        </p>
        <NewIdeaForm />
      </div>
    </AppShell>
  );
}
