import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/supabase/server";
import { createAdmin } from "@/lib/supabase/admin";
import { decryptToken } from "@/lib/drive/encrypt-token";
import { getDriveFileMetadata } from "@/lib/drive/upload-session";

const Body = z.object({
  drive_file_id: z.string().min(1),
});

// Records a B-roll into the library after the browser has finished uploading
// it to Drive. Pulls the filename + size from Drive metadata via the
// creator's refresh token (same pattern as /api/videos/[id]/files POST).
export async function POST(request: Request) {
  const { user, profile, supabase } = await requireUser();
  if (!user || !profile) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const parsed = Body.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 },
    );
  }

  const admin = createAdmin();
  const { data: creator } = await admin
    .from("profiles")
    .select("drive_refresh_token_encrypted")
    .eq("role", "creator")
    .maybeSingle();
  if (!creator?.drive_refresh_token_encrypted) {
    return NextResponse.json(
      { error: "drive not connected" },
      { status: 400 },
    );
  }
  const refreshToken = decryptToken(creator.drive_refresh_token_encrypted);
  const meta = await getDriveFileMetadata(refreshToken, parsed.data.drive_file_id);

  const { data: row, error } = await supabase
    .from("b_rolls")
    .insert({
      drive_file_id: parsed.data.drive_file_id,
      drive_web_view_link: meta.webViewLink ?? null,
      name: meta.name ?? "untitled",
      size_bytes: meta.size ? Number(meta.size) : null,
      mime_type: meta.mimeType ?? null,
      uploaded_by: user.id,
    })
    .select()
    .single();

  if (error || !row) {
    return NextResponse.json(
      { error: error?.message ?? "insert failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ id: row.id });
}
