import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/supabase/server";
import { createAdmin } from "@/lib/supabase/admin";
import { decryptToken } from "@/lib/drive/encrypt-token";
import { getDriveFileMetadata } from "@/lib/drive/upload-session";

const Body = z.object({
  kind: z.enum(["raw", "edit", "audio", "b_roll"]),
  drive_file_id: z.string().min(1),
});

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { user, profile, supabase } = await requireUser();
  if (!user || !profile) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const { id: videoId } = await ctx.params;
  const parsed = Body.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 },
    );
  }

  // Look up the file metadata using the creator's Drive token
  const admin = createAdmin();
  const { data: creator } = await admin
    .from("profiles")
    .select("drive_refresh_token_encrypted")
    .eq("role", "creator")
    .maybeSingle();
  if (!creator?.drive_refresh_token_encrypted) {
    return NextResponse.json({ error: "drive not connected" }, { status: 400 });
  }
  const refreshToken = decryptToken(creator.drive_refresh_token_encrypted);
  const meta = await getDriveFileMetadata(refreshToken, parsed.data.drive_file_id);

  // Auto-increment revision_index per (video, kind) so multiple files of the
  // same kind can coexist (e.g., Video #1, Video #2, Video #3).
  const { data: prior } = await supabase
    .from("video_files")
    .select("revision_index")
    .eq("video_id", videoId)
    .eq("kind", parsed.data.kind)
    .order("revision_index", { ascending: false })
    .limit(1)
    .maybeSingle();
  const revisionIndex = (prior?.revision_index ?? 0) + 1;

  const { data: file, error } = await supabase
    .from("video_files")
    .insert({
      video_id: videoId,
      kind: parsed.data.kind,
      revision_index: revisionIndex,
      drive_file_id: parsed.data.drive_file_id,
      drive_web_view_link: meta.webViewLink ?? null,
      size_bytes: meta.size ? Number(meta.size) : null,
      uploaded_by: user.id,
    })
    .select()
    .single();

  if (error || !file) {
    return NextResponse.json(
      { error: error?.message ?? "insert failed" },
      { status: 500 },
    );
  }

  // Auto-transition status — only on the FIRST file of an "input" kind, or
  // when an editor uploads an edit while in editing/revisions states.
  const { data: video } = await supabase
    .from("videos")
    .select("status")
    .eq("id", videoId)
    .maybeSingle();

  let statusChange: string | null = null;
  if (video) {
    const isEdit = parsed.data.kind === "edit";
    if (isEdit && (video.status === "editing" || video.status === "revisions_requested")) {
      statusChange = "in_review";
    } else if (
      !isEdit &&
      (video.status === "idea" || video.status === "ready_to_film")
    ) {
      statusChange = "raw_uploaded";
    }
    if (statusChange) {
      await supabase
        .from("videos")
        .update({ status: statusChange })
        .eq("id", videoId);
    }
  }

  // Notify the other party. Use the status-change kind if a transition fired,
  // otherwise use a "<kind>_added" kind so they know what was added.
  const otherRole = profile.role === "creator" ? "editor" : "creator";
  const { data: other } = await admin
    .from("profiles")
    .select("user_id")
    .eq("role", otherRole)
    .maybeSingle();
  if (other) {
    await admin.from("activity").insert({
      user_id: other.user_id,
      video_id: videoId,
      kind: statusChange ?? `${parsed.data.kind}_added`,
    });
  }

  return NextResponse.json({
    id: file.id,
    revision_index: file.revision_index,
    status_change: statusChange,
  });
}
