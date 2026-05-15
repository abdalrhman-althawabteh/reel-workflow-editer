import { redirect } from "next/navigation";
import { Layers } from "lucide-react";
import { requireUser } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";
import { BRollLibrary } from "@/components/BRollLibrary";

export const dynamic = "force-dynamic";

export type BRoll = {
  id: string;
  drive_file_id: string;
  drive_web_view_link: string | null;
  name: string;
  size_bytes: number | null;
  mime_type: string | null;
  uploaded_by: string;
  created_at: string;
};

export default async function BRollsPage() {
  const { user, profile, supabase } = await requireUser();
  if (!user) redirect("/login");
  if (!profile) redirect("/login");

  const { data: rows } = await supabase
    .from("b_rolls")
    .select("*")
    .order("created_at", { ascending: false });

  const { count: unread } = await supabase
    .from("activity")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("read_at", null);

  const items = (rows ?? []) as BRoll[];

  return (
    <AppShell profile={profile} unread={unread ?? 0}>
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Layers size={20} className="text-[var(--accent)]" />
            B-rolls
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Shared library. Upload once, the editor pulls into any project.
          </p>
        </div>
        {items.length > 0 ? (
          <p className="text-xs text-[var(--muted)]">
            {items.length} {items.length === 1 ? "clip" : "clips"}
          </p>
        ) : null}
      </div>

      <BRollLibrary initial={items} canDelete={profile.role === "creator"} />
    </AppShell>
  );
}
