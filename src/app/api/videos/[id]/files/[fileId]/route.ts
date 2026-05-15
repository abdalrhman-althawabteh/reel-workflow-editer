import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { createAdmin } from "@/lib/supabase/admin";
import { decryptToken } from "@/lib/drive/encrypt-token";
import { getAccessToken } from "@/lib/drive/oauth";

// Deletes a SINGLE file from a video project. The Drive file is moved to trash
// (recoverable for ~30 days). The video row, script, and other files are
// untouched. RLS allows: the uploader of the file, OR the creator.
export async function DELETE(
  _request: NextRequest,
  ctx: { params: Promise<{ id: string; fileId: string }> },
) {
  const { user, profile, supabase } = await requireUser();
  if (!user || !profile) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const { id: videoId, fileId } = await ctx.params;

  const admin = createAdmin();

  const { data: file } = await admin
    .from("video_files")
    .select("drive_file_id, video_id")
    .eq("id", fileId)
    .maybeSingle();

  if (!file || file.video_id !== videoId) {
    return NextResponse.json({ error: "file not found" }, { status: 404 });
  }

  // Best-effort Drive trash. Don't fail the DB delete if Drive call fails —
  // a stale Drive entry is recoverable; a stale DB row is not.
  const { data: creator } = await admin
    .from("profiles")
    .select("drive_refresh_token_encrypted")
    .eq("role", "creator")
    .maybeSingle();
  if (creator?.drive_refresh_token_encrypted && file.drive_file_id) {
    try {
      const refreshToken = decryptToken(creator.drive_refresh_token_encrypted);
      const accessToken = await getAccessToken(refreshToken);
      await fetch(
        `https://www.googleapis.com/drive/v3/files/${file.drive_file_id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ trashed: true }),
        },
      );
    } catch {
      // swallow — DB delete still proceeds
    }
  }

  // RLS-gated: uploader OR creator can delete.
  const { error } = await supabase
    .from("video_files")
    .delete()
    .eq("id", fileId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
