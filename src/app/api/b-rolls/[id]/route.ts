import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { createAdmin } from "@/lib/supabase/admin";
import { decryptToken } from "@/lib/drive/encrypt-token";
import { getAccessToken } from "@/lib/drive/oauth";

// Deletes a single B-roll from the library. Trashes the Drive file
// (recoverable for 30 days) and removes the b_rolls row.
export async function DELETE(
  _request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { user, profile, supabase } = await requireUser();
  if (!user || !profile) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const { id } = await ctx.params;

  const admin = createAdmin();

  const { data: row } = await admin
    .from("b_rolls")
    .select("drive_file_id")
    .eq("id", id)
    .maybeSingle();

  if (!row) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  // Best-effort trash; don't fail the DB delete on Drive errors.
  const { data: creator } = await admin
    .from("profiles")
    .select("drive_refresh_token_encrypted")
    .eq("role", "creator")
    .maybeSingle();
  if (creator?.drive_refresh_token_encrypted && row.drive_file_id) {
    try {
      const refreshToken = decryptToken(creator.drive_refresh_token_encrypted);
      const accessToken = await getAccessToken(refreshToken);
      await fetch(
        `https://www.googleapis.com/drive/v3/files/${row.drive_file_id}`,
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
  const { error } = await supabase.from("b_rolls").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
