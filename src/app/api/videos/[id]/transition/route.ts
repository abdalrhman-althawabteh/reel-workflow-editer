import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/supabase/server";
import { createAdmin } from "@/lib/supabase/admin";
import { findTransition, STATUSES, type Status } from "@/lib/status";

const Body = z.object({
  to: z.enum(STATUSES),
  note: z.string().max(2000).optional(),
  publish_url: z.string().url().optional(),
  // when transitioning into a state that requires a fresh upload
  // the file row should already be inserted via /files endpoint first
});

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { user, profile, supabase } = await requireUser();
  if (!user || !profile) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const parsed = Body.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues.map((i) => i.message).join(", ") }, { status: 400 });
  }

  const { data: video } = await supabase.from("videos").select("*").eq("id", id).maybeSingle();
  if (!video) return NextResponse.json({ error: "not found" }, { status: 404 });

  const t = findTransition(video.status as Status, parsed.data.to, profile.role);
  if (!t) {
    return NextResponse.json(
      { error: `transition not allowed: ${video.status} → ${parsed.data.to} as ${profile.role}` },
      { status: 403 },
    );
  }
  if (t.requires === "note" && !parsed.data.note) {
    return NextResponse.json({ error: "note required" }, { status: 400 });
  }
  if (t.requires === "publish_url" && !parsed.data.publish_url) {
    return NextResponse.json({ error: "publish_url required" }, { status: 400 });
  }

  const update: Record<string, unknown> = { status: parsed.data.to };
  if (parsed.data.to === "editing") update.claimed_by = user.id;
  if (parsed.data.to === "revisions_requested") update.revision_note = parsed.data.note ?? null;
  if (parsed.data.to === "published") {
    update.published_url = parsed.data.publish_url;
    update.published_at = new Date().toISOString();
  }

  const { error: upErr } = await supabase.from("videos").update(update).eq("id", id);
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  // Notify the other party
  const admin = createAdmin();
  const otherRole = profile.role === "creator" ? "editor" : "creator";
  const { data: other } = await admin
    .from("profiles")
    .select("user_id")
    .eq("role", otherRole)
    .maybeSingle();
  if (other) {
    await admin.from("activity").insert({
      user_id: other.user_id,
      video_id: id,
      kind: parsed.data.to,
    });
  }

  return NextResponse.json({ ok: true });
}
